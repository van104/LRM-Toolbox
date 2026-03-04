import request from '../utils/request';

export interface MaintenanceItem {
  toolId: string;
  toolName: string;
  enabled: boolean;
  notice: string;
  updatedAt: string;
}

/**
 * 获取所有工具的维护配置（公开接口，无需鉴权）
 */
export async function getMaintenanceList(): Promise<MaintenanceItem[]> {
  return request<MaintenanceItem[]>('/maintenance', {
    method: 'GET'
  });
}

/**
 * 更新/添加维护配置（管理员）
 */
export async function upsertMaintenance(
  data: {
    toolId: string;
    toolName: string;
    enabled: boolean;
    notice: string;
  },
  password: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/maintenance/upsert', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    },
    data
  });
}

/**
 * 删除维护配置（管理员）
 */
export async function deleteMaintenance(
  toolId: string,
  password: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/maintenance/delete', {
    method: 'POST',
    headers: {
      'x-admin-token': password
    },
    data: { toolId }
  });
}
