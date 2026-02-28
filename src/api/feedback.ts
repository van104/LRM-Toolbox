import request from '../utils/request';
import type { FeedbackData, FeedbackResponse, FeedbackItem } from '../types/Feedback';

/**
 * 提交用户反馈
 * @param {FeedbackData} feedbackData - 反馈数据 ({ type, content, contact })
 * @returns {Promise<FeedbackResponse>} - 响应结果
 */
export async function submitFeedbackToBackend(
  feedbackData: FeedbackData
): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback', {
    method: 'POST',
    data: {
      ...feedbackData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
  });
}

/**
 * 获取反馈列表
 * @param {string} password - 管理员密码
 * @returns {Promise<Array<FeedbackItem>>} - 反馈列表
 */
export async function getFeedbackFromBackend(password: string): Promise<FeedbackItem[]> {
  return request<FeedbackItem[]>('/feedback', {
    method: 'GET',
    headers: {
      'x-admin-token': password
    }
  });
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
  return request<FeedbackResponse>('/feedback/update', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    },
    data: { id, status }
  });
}

/**
 * 删除反馈
 * @param {string} id - 反馈ID
 * @param {string} password - 管理员密码
 */
export async function deleteFeedback(id: string, password: string): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback/delete', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    },
    data: { id }
  });
}

/**
 * 批量删除反馈
 * @param {string[]} ids - 反馈ID列表
 * @param {string} password - 管理员密码
 */
export async function deleteFeedbackBatch(
  ids: string[],
  password: string
): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback/delete-batch', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    },
    data: { ids }
  });
}

/**
 * 清空所有反馈
 * @param {string} password - 管理员密码
 */
export async function deleteAllFeedback(password: string): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback/delete-all', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    }
  });
}

/**
 * 批量更新反馈状态
 * @param {string[]} ids - 反馈ID列表
 * @param {string} status - 新状态
 * @param {string} password - 管理员密码
 */
export async function updateFeedbackStatusBatch(
  ids: string[],
  status: string,
  password: string
): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback/update-batch', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    },
    data: { ids, status }
  });
}
