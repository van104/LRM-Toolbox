import { ref } from 'vue';
import { ElMessage } from 'element-plus';

interface APIConfig {
  provider: string;
  apiKey: string;
  baiduSecret: string;
  customHeaders: string;
}

interface OutputConfig {
  size: string;
  filename: string;
}

export function useBgRemoval() {
  const processing = ref(false);

  const callRemoveBg = async (image: File, config: APIConfig, outputSize: string) => {
    const formData = new FormData();
    formData.append('image_file', image);
    formData.append('size', outputSize);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': config.apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.title || 'Remove.bg 服务拒绝了连接申请');
    }
    return await response.blob();
  };

  const callBuiltinApi = async (image: File) => {
    // Decoding the key (already in original code)
    const BUILTIN_KEY = atob('VzNDTUpSbmJjNjZhYmZUeTZpU3ZHaHlU');

    const formData = new FormData();
    formData.append('image_file', image);
    formData.append('size', 'preview');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': BUILTIN_KEY },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.errors?.[0]?.title || '内置备用网关目前处于拥塞限制状态');
    }
    return await response.blob();
  };

  const callBaiduAi = async (image: File, config: APIConfig) => {
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.baiduSecret}`;
    const tokenRes = await fetch(tokenUrl);
    if (!tokenRes.ok) throw new Error('密钥交汇失败由于公私钥拒签。');
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const reader = new FileReader();
    const base64Promise = new Promise<string>(resolve => {
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1]);
      };
      reader.readAsDataURL(image);
    });
    const base64Str = await base64Promise;

    const apiUrl = `https://aip.baidubce.com/rest/2.0/image-process/v1/body_seg?access_token=${accessToken}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(base64Str)}`
    });

    if (!response.ok) throw new Error('远程调用过程返回 HTTP 中断码');
    const result = await response.json();
    if (result.error_code) throw new Error(result.error_msg);

    const byteCharacters = atob(result.foreground);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  };

  const callCustomApi = async (image: File, config: APIConfig) => {
    const formData = new FormData();
    formData.append('image', image);

    let headers: Record<string, string> = {};
    if (config.customHeaders) {
      try {
        headers = JSON.parse(config.customHeaders);
      } catch {
        throw new Error('非法字符注入请求头块引发语法崩溃');
      }
    }

    const response = await fetch(config.apiKey, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`定制目标抛出异常码: ${response.status}`);
    }

    return await response.blob();
  };

  const processBgRemoval = async (
    image: File,
    apiConfig: APIConfig,
    outputConfig: OutputConfig
  ) => {
    processing.value = true;
    try {
      let responseBlob: Blob;
      if (apiConfig.provider === 'builtin') {
        responseBlob = await callBuiltinApi(image);
      } else if (apiConfig.provider === 'remove.bg') {
        responseBlob = await callRemoveBg(image, apiConfig, outputConfig.size);
      } else if (apiConfig.provider === 'baidu') {
        responseBlob = await callBaiduAi(image, apiConfig);
      } else if (apiConfig.provider === 'custom') {
        responseBlob = await callCustomApi(image, apiConfig);
      } else {
        throw new Error('当前服务商流管道出现偏离，请检查控制台配置。');
      }
      return responseBlob;
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : '去背通讯回路崩溃，请查验网络代理或 API Key 有效期';
      ElMessage.error(message);
      throw err;
    } finally {
      processing.value = false;
    }
  };

  return {
    processing,
    processBgRemoval
  };
}
