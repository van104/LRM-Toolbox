import { ElMessage } from 'element-plus';

// 配置默认后端 API 地址
const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean>;
  baseURL?: string;
  data?: unknown; // 对于 POST/PUT 等可以传对象，自动转 JSON 或 FormData
}

/**
 * 封装统一的 HTTP 请求工具 (Fetch Wrapper)
 * 处理请求拦截、响应拦截、全局错误提示
 */
export async function request<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const { params, baseURL = DEFAULT_BASE_URL, data, ...customOptions } = options;

  // 1. 请求拦截：处理 Headers 和 Content-Type
  const headers = new Headers(customOptions.headers || {});
  let body: BodyInit | undefined = undefined;

  // 区分普通对象和 FormData
  if (data !== undefined) {
    if (data instanceof FormData) {
      body = data;
      // Fetch 遇到 FormData 时会自动设置边界 multipart/form-data
    } else {
      body = JSON.stringify(data);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  // 构建完整的 URL 和 Query Parameters
  let fetchUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const fetchOptions: RequestInit = {
    ...customOptions,
    headers,
    body
  };

  try {
    const response = await fetch(fetchUrl, fetchOptions);

    // 2. 响应拦截：非 2xx 状态码视为请求失败
    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      try {
        errorData = await response.json();
      } catch {
        // 如果无法解析 JSON，可能后端返回的是普通文本或 HTML
      }

      const rawMsg = errorData.message || errorData.error;
      const errorMessage =
        typeof rawMsg === 'string'
          ? rawMsg
          : `请求失败 (${response.status}): ${response.statusText}`;

      // 全局错误提示 (ElMessage)
      if (response.status === 401) {
        ElMessage.error(
          typeof errorData.message === 'string'
            ? errorData.message
            : '登录失效或密码错误，请重新登录'
        );
      } else if (response.status === 403) {
        ElMessage.error('没有权限访问该资源');
      } else {
        ElMessage.error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    // 解析 JSON 数据返回
    try {
      const result = await response.json();
      return result as T;
    } catch {
      return {} as T;
    }
  } catch (error: unknown) {
    // 捕获 Request() 中的内部错误或无法连接服务器等 Network Error
    // 如果没有抛出上面构造的常见业务错误，才去提示默认错误
    if (error instanceof Error) {
      if (
        !error.message ||
        !(
          error.message.includes('请求失败') ||
          error.message.includes('登录失效') ||
          error.message.includes('没有权限')
        )
      ) {
        ElMessage.error(error.message || '网络异常或服务器无响应，请稍后重试');
      }
    } else {
      ElMessage.error('网络异常或服务器无响应，请稍后重试');
    }
    throw error;
  }
}

export default request;
