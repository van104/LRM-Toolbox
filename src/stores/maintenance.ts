import { ref, computed } from 'vue';
import {
  getMaintenanceList,
  upsertMaintenance,
  deleteMaintenance as deleteMaintenanceAPI,
  type MaintenanceItem
} from '@/api/maintenance';

export type { MaintenanceItem };

// 响应式维护列表（内存缓存）
const maintenanceList = ref<MaintenanceItem[]>([]);
const loaded = ref(false);
const loading = ref(false);

/** 当前启用维护模式的工具 Map（用于路由守卫快速查找） */
const enabledMap = computed(() => {
  const map = new Map<string, MaintenanceItem>();
  for (const item of maintenanceList.value) {
    if (item.enabled) {
      map.set(item.toolId, item);
    }
  }
  return map;
});

export function useMaintenanceStore() {
  /** 从后端加载维护列表（首次或刷新时调用） */
  async function fetchList() {
    if (loading.value) return;
    loading.value = true;
    try {
      const list = await getMaintenanceList();
      maintenanceList.value = list;
      loaded.value = true;
    } catch (e) {
      console.error('Failed to fetch maintenance list:', e);
      // 静默失败，不阻塞页面
    } finally {
      loading.value = false;
    }
  }

  /** 确保已加载（只调一次） */
  async function ensureLoaded() {
    if (!loaded.value && !loading.value) {
      await fetchList();
    }
  }

  /** 检查一个工具是否处于维护中 */
  function isUnderMaintenance(toolId: string): boolean {
    return enabledMap.value.has(toolId);
  }

  /** 根据 toolId 获取维护配置 */
  function getMaintenanceInfo(toolId: string): MaintenanceItem | undefined {
    return maintenanceList.value.find(item => item.toolId === toolId);
  }

  /** 添加或更新维护配置（调后端） */
  async function setMaintenance(
    toolId: string,
    toolName: string,
    enabled: boolean,
    notice: string
  ) {
    const password = sessionStorage.getItem('lrm_admin_token') || '';
    await upsertMaintenance({ toolId, toolName, enabled, notice }, password);

    // 更新本地缓存
    const existing = maintenanceList.value.find(item => item.toolId === toolId);
    if (existing) {
      existing.enabled = enabled;
      existing.notice = notice;
      existing.toolName = toolName;
      existing.updatedAt = new Date().toISOString();
    } else {
      maintenanceList.value.push({
        toolId,
        toolName,
        enabled,
        notice,
        updatedAt: new Date().toISOString()
      });
    }
  }

  /** 切换维护状态（调后端） */
  async function toggleMaintenance(toolId: string) {
    const existing = maintenanceList.value.find(item => item.toolId === toolId);
    if (existing) {
      const newEnabled = !existing.enabled;
      await setMaintenance(toolId, existing.toolName, newEnabled, existing.notice);
    }
  }

  /** 移除维护配置（调后端） */
  async function removeMaintenance(toolId: string) {
    const password = sessionStorage.getItem('lrm_admin_token') || '';
    await deleteMaintenanceAPI(toolId, password);
    maintenanceList.value = maintenanceList.value.filter(item => item.toolId !== toolId);
  }

  return {
    maintenanceList,
    enabledMap,
    loaded,
    loading,
    fetchList,
    ensureLoaded,
    isUnderMaintenance,
    getMaintenanceInfo,
    setMaintenance,
    toggleMaintenance,
    removeMaintenance
  };
}
