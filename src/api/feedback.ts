// 配置您的后端 API 地址
// 开发环境默认连接本地 3001 端口，生产环境请在 .env.production 中配置 VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface FeedbackData {
  type: string;
  content: string;
  contact?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  contact?: string;
  status: 'pending' | 'processing' | 'resolved' | 'rejected';
  timestamp: string;
  userAgent?: string;
}

/**
 * 提交用户反馈
 * @param {FeedbackData} feedbackData - 反馈数据 ({ type, content, contact })
 * @returns {Promise<FeedbackResponse>} - 响应结果
 */
export async function submitFeedbackToBackend(
  feedbackData: FeedbackData
): Promise<FeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...feedbackData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `请求失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Feedback submission error:', error);
    throw error;
  }
}

/**
 * 获取反馈列表
 * @param {string} password - 管理员密码
 * @returns {Promise<Array<FeedbackItem>>} - 反馈列表
 */
export async function getFeedbackFromBackend(password: string): Promise<FeedbackItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': password
      }
    });

    if (response.status === 401) {
      throw new Error('密码错误，请重新登录');
    }

    if (!response.ok) {
      throw new Error(`获取失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Fetch feedback error:', error);
    throw error;
  }
}

/**
 * 更新反馈状态
 * @param {string} id - 反馈ID
 * @param {string} status - 新状态
 * @param {string} password - 管理员密码
 */
export async function updateFeedbackStatus(
  id: string,
  status: string,
  password: string
): Promise<FeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': password
      },
      body: JSON.stringify({ id, status })
    });

    if (!response.ok) {
      throw new Error('更新失败');
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Update status error:', error);
    throw error;
  }
}

/**
 * 删除反馈
 * @param {string} id - 反馈ID
 * @param {string} password - 管理员密码
 */
export async function deleteFeedback(id: string, password: string): Promise<FeedbackResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': password
      },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      throw new Error('删除失败');
    }

    return await response.json();
  } catch (error: unknown) {
    console.error('Delete feedback error:', error);
    throw error;
  }
}
