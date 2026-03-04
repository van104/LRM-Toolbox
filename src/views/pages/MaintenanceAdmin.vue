<template>
  <div class="maintenance-admin">
    <!-- 登录遮罩 -->
    <div v-if="!isLoggedIn" class="login-overlay">
      <div class="login-card-wrapper">
        <div class="login-card-shadow"></div>
        <div class="login-card">
          <div class="login-icon">🔐</div>
          <h3>维护管理后台</h3>
          <p class="login-desc">请输入管理员密码以访问</p>
          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <input
                v-model="loginPassword"
                type="password"
                placeholder="请输入密码"
                class="brutal-input"
                @keyup.enter="handleLogin"
              />
            </div>
            <button type="submit" class="brutal-btn btn-login">登录</button>
            <button type="button" class="brutal-btn btn-back" @click="$router.push('/')">
              返回首页
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <template v-else>
      <!-- 头部 -->
      <div class="admin-header">
        <div class="header-inner">
          <button class="brutal-btn btn-sm btn-back-header" @click="$router.push('/')">
            ← 返回首页
          </button>
          <div class="header-title-box">
            <div class="header-title-shadow"></div>
            <h2 class="header-title">🔧 工具维护管理</h2>
          </div>
          <button class="brutal-btn btn-sm btn-logout" @click="handleLogout">退出登录</button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="admin-content">
        <div class="stats-row">
          <div class="stat-card stat-total">
            <div class="stat-num">{{ allTools.length }}</div>
            <div class="stat-label">全部工具</div>
          </div>
          <div class="stat-card stat-active">
            <div class="stat-num">{{ maintenanceCount }}</div>
            <div class="stat-label">维护中</div>
          </div>
          <div class="stat-card stat-normal">
            <div class="stat-num">{{ allTools.length - maintenanceCount }}</div>
            <div class="stat-label">正常运行</div>
          </div>
        </div>

        <!-- 搜索与筛选 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <input
              v-model="searchKeyword"
              type="text"
              class="brutal-input search-input"
              placeholder="🔍 搜索工具名称..."
            />
            <select v-model="filterStatus" class="brutal-select">
              <option value="all">全部状态</option>
              <option value="maintaining">维护中</option>
              <option value="normal">正常运行</option>
            </select>
            <select v-model="filterCategory" class="brutal-select">
              <option value="all">全部分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 工具列表 -->
        <div class="tools-list">
          <div v-if="filteredTools.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <span>没有找到匹配的工具</span>
          </div>

          <div v-for="tool in filteredTools" :key="tool.id" class="tool-item">
            <div class="tool-item-shadow"></div>
            <div class="tool-item-content">
              <div class="tool-info">
                <div class="tool-name-row">
                  <span class="tool-name">{{ tool.name }}</span>
                  <span
                    class="status-badge"
                    :class="{
                      'badge-maintaining': isToolMaintaining(tool.id),
                      'badge-normal': !isToolMaintaining(tool.id)
                    }"
                  >
                    {{ isToolMaintaining(tool.id) ? '🔧 维护中' : '✅ 正常' }}
                  </span>
                </div>
                <div class="tool-meta">
                  <span class="tool-category">{{ getCategoryName(tool.category) }}</span>
                  <span class="tool-route">{{ tool.route }}</span>
                </div>
              </div>
              <div class="tool-actions">
                <button
                  class="brutal-btn btn-sm"
                  :class="isToolMaintaining(tool.id) ? 'btn-resume' : 'btn-maintain'"
                  @click="toggleToolMaintenance(tool)"
                >
                  {{ isToolMaintaining(tool.id) ? '恢复使用' : '开启维护' }}
                </button>
                <button class="brutal-btn btn-sm btn-edit" @click="openEditDialog(tool)">
                  编辑公告
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 编辑公告弹窗 -->
    <Teleport to="body">
      <div v-if="editDialogVisible" class="dialog-overlay" @click.self="editDialogVisible = false">
        <div class="dialog-wrapper">
          <div class="dialog-shadow"></div>
          <div class="dialog-content">
            <div class="dialog-header">
              <h3>📝 编辑维护公告</h3>
              <button class="dialog-close" @click="editDialogVisible = false">✕</button>
            </div>
            <div class="dialog-body">
              <div class="field-group">
                <label class="field-label">工具名称</label>
                <div class="field-value">{{ editingTool?.name }}</div>
              </div>
              <div class="field-group">
                <label class="field-label">维护状态</label>
                <div class="switch-row">
                  <button
                    class="brutal-switch"
                    :class="{ 'switch-on': editEnabled }"
                    @click="editEnabled = !editEnabled"
                  >
                    <span class="switch-thumb"></span>
                  </button>
                  <span class="switch-label">{{ editEnabled ? '维护中' : '正常运行' }}</span>
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">维护公告</label>
                <textarea
                  v-model="editNotice"
                  class="brutal-textarea"
                  placeholder="请输入维护公告内容，支持多行文本...&#10;&#10;例如：&#10;本工具正在进行功能升级，预计将于 2026 年 3 月 5 日恢复使用。"
                  rows="6"
                ></textarea>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="brutal-btn btn-sm btn-cancel" @click="editDialogVisible = false">
                取消
              </button>
              <button class="brutal-btn btn-sm btn-save" @click="saveNotice">保存</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useMaintenanceStore } from '@/stores/maintenance';
  import { loadAllTools } from '@/data/tools';
  import { categoriesBase } from '@/data/tools/types';
  import { getFeedbackFromBackend } from '@/api/feedback';
  import { ElMessage } from 'element-plus';

  const { isUnderMaintenance, getMaintenanceInfo, setMaintenance, toggleMaintenance, fetchList } =
    useMaintenanceStore();

  const isLoggedIn = ref(false);
  const loginPassword = ref('');
  const allTools = ref([]);
  const searchKeyword = ref('');
  const filterStatus = ref('all');
  const filterCategory = ref('all');

  // 弹窗
  const editDialogVisible = ref(false);
  const editingTool = ref(null);
  const editEnabled = ref(false);
  const editNotice = ref('');

  const categories = computed(() => categoriesBase.filter(c => c.id !== 'all'));

  const maintenanceCount = computed(() => {
    return allTools.value.filter(t => isUnderMaintenance(t.id)).length;
  });

  const filteredTools = computed(() => {
    return allTools.value.filter(tool => {
      // 搜索
      const matchSearch =
        !searchKeyword.value || tool.name.toLowerCase().includes(searchKeyword.value.toLowerCase());

      // 状态筛选
      const isMaintaining = isUnderMaintenance(tool.id);
      const matchStatus =
        filterStatus.value === 'all' ||
        (filterStatus.value === 'maintaining' && isMaintaining) ||
        (filterStatus.value === 'normal' && !isMaintaining);

      // 分类筛选
      const matchCategory =
        filterCategory.value === 'all' || tool.category === filterCategory.value;

      return matchSearch && matchStatus && matchCategory;
    });
  });

  function isToolMaintaining(toolId) {
    return isUnderMaintenance(toolId);
  }

  function getCategoryName(categoryId) {
    const cat = categoriesBase.find(c => c.id === categoryId);
    return cat ? cat.name : categoryId;
  }

  async function toggleToolMaintenance(tool) {
    const info = getMaintenanceInfo(tool.id);
    try {
      if (info) {
        await toggleMaintenance(tool.id);
      } else {
        // 首次设置，默认开启
        await setMaintenance(tool.id, tool.name, true, '');
      }
      ElMessage.success(
        isUnderMaintenance(tool.id) ? `已开启 "${tool.name}" 的维护模式` : `已恢复 "${tool.name}"`
      );
    } catch {
      ElMessage.error('操作失败');
    }
  }

  function openEditDialog(tool) {
    editingTool.value = tool;
    const info = getMaintenanceInfo(tool.id);
    editEnabled.value = info?.enabled ?? false;
    editNotice.value = info?.notice ?? '';
    editDialogVisible.value = true;
  }

  async function saveNotice() {
    if (!editingTool.value) return;
    try {
      await setMaintenance(
        editingTool.value.id,
        editingTool.value.name,
        editEnabled.value,
        editNotice.value
      );
      editDialogVisible.value = false;
      ElMessage.success('维护配置已保存');
    } catch {
      ElMessage.error('保存失败');
    }
  }

  async function handleLogin() {
    if (!loginPassword.value) {
      ElMessage.warning('请输入密码');
      return;
    }
    try {
      // 复用 feedback 的密码验证机制
      await getFeedbackFromBackend(loginPassword.value);
      isLoggedIn.value = true;
      sessionStorage.setItem('lrm_admin_token', loginPassword.value);
      const [tools] = await Promise.all([loadAllTools(), fetchList()]);
      allTools.value = tools;
      ElMessage.success('登录成功');
    } catch {
      ElMessage.error('密码错误');
      loginPassword.value = '';
    }
  }

  function handleLogout() {
    isLoggedIn.value = false;
    loginPassword.value = '';
    sessionStorage.removeItem('lrm_admin_token');
  }

  onMounted(async () => {
    const savedToken = sessionStorage.getItem('lrm_admin_token');
    if (savedToken) {
      try {
        await getFeedbackFromBackend(savedToken);
        isLoggedIn.value = true;
        loginPassword.value = savedToken;
        const [tools] = await Promise.all([loadAllTools(), fetchList()]);
        allTools.value = tools;
      } catch {
        isLoggedIn.value = false;
        sessionStorage.removeItem('lrm_admin_token');
      }
    }
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&family=IBM+Plex+Mono:wght@400;600&display=swap');

  .maintenance-admin {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  /* --- Login --- */
  .login-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: inherit;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    z-index: 1000;
  }

  .login-card-wrapper {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 0 1rem;
  }

  .login-card-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(8px, 8px);
  }

  .login-card {
    position: relative;
    z-index: 1;
    background: #fff;
    border: 4px solid #111;
    padding: 2.5rem 2rem;
    text-align: center;
  }

  .login-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .login-card h3 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
  }

  .login-desc {
    color: #666;
    font-size: 0.9rem;
    margin: 0 0 1.5rem;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  .brutal-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 3px solid #111;
    font-family: inherit;
    font-size: 1rem;
    outline: none;
    background: #fff;
    box-sizing: border-box;
    transition: box-shadow 0.15s;
  }

  .brutal-input:focus {
    box-shadow: 4px 4px 0 #4b7bff;
  }

  .btn-login {
    width: 100%;
    background: #00e572;
    color: #111;
    margin-bottom: 0.75rem;
    justify-content: center;
  }

  .btn-back {
    width: 100%;
    background: #fff;
    color: #111;
    justify-content: center;
  }

  .btn-back:hover {
    background: #f0f0f0;
  }

  /* --- Header --- */
  .admin-header {
    background: #fff;
    border-bottom: 4px solid #111;
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .header-title-box {
    position: relative;
    display: inline-block;
  }

  .header-title-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(4px, 4px);
  }

  .header-title {
    position: relative;
    z-index: 1;
    margin: 0;
    padding: 0.5rem 1.25rem;
    background: #4b7bff;
    color: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    border: 3px solid #111;
    white-space: nowrap;
  }

  /* --- Buttons --- */
  .brutal-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.15s;
    background: #fff;
    color: #111;
  }

  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }

  .brutal-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #111;
  }

  .btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-width: 2px;
    box-shadow: 3px 3px 0 #111;
  }

  .btn-sm:hover {
    box-shadow: 5px 5px 0 #111;
  }

  .btn-back-header {
    background: #fff;
  }

  .btn-logout {
    background: #ff6b6b;
    color: #fff;
  }

  .btn-maintain {
    background: #ffd900;
    color: #111;
  }

  .btn-resume {
    background: #00e572;
    color: #111;
  }

  .btn-edit {
    background: #4b7bff;
    color: #fff;
  }

  .btn-cancel {
    background: #fff;
  }

  .btn-save {
    background: #00e572;
    color: #111;
  }

  /* --- Stats --- */
  .admin-content {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: #fff;
    border: 3px solid #111;
    padding: 1.5rem;
    text-align: center;
    box-shadow: 5px 5px 0 #111;
  }

  .stat-num {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-total .stat-num {
    color: #4b7bff;
  }

  .stat-active .stat-num {
    color: #ff6b6b;
  }

  .stat-normal .stat-num {
    color: #00e572;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
    font-weight: 600;
  }

  /* --- Toolbar --- */
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .toolbar-left {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    flex: 1;
  }

  .search-input {
    min-width: 260px;
    flex: 1;
  }

  .brutal-select {
    padding: 0.6rem 1rem;
    border: 3px solid #111;
    font-family: inherit;
    font-size: 0.9rem;
    background: #fff;
    cursor: pointer;
    outline: none;
    min-width: 120px;
  }

  .brutal-select:focus {
    box-shadow: 3px 3px 0 #4b7bff;
  }

  /* --- Tools List --- */
  .tools-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tool-item {
    position: relative;
  }

  .tool-item-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(4px, 4px);
  }

  .tool-item-content {
    position: relative;
    z-index: 1;
    background: #fff;
    border: 3px solid #111;
    padding: 1.25rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .tool-info {
    flex: 1;
    min-width: 200px;
  }

  .tool-name-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .tool-name {
    font-weight: 700;
    font-size: 1.05rem;
  }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.2rem 0.6rem;
    border: 2px solid #111;
  }

  .badge-maintaining {
    background: #fff0f0;
    color: #cc3333;
    border-color: #cc3333;
  }

  .badge-normal {
    background: #f0fff4;
    color: #00994d;
    border-color: #00994d;
  }

  .tool-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
    color: #888;
  }

  .tool-category {
    background: #f5f5f5;
    padding: 0.15rem 0.5rem;
    border: 1px solid #ddd;
  }

  .tool-route {
    font-family: 'IBM Plex Mono', monospace;
  }

  .tool-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  /* --- Empty State --- */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 5px 5px 0 #111;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  /* --- Dialog --- */
  .dialog-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .dialog-wrapper {
    position: relative;
    width: 100%;
    max-width: 560px;
  }

  .dialog-shadow {
    position: absolute;
    inset: 0;
    background: #111;
    transform: translate(6px, 6px);
  }

  .dialog-content {
    position: relative;
    z-index: 1;
    background: #fff;
    border: 4px solid #111;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem;
    border-bottom: 3px solid #111;
    background: #4b7bff;
    color: #fff;
  }

  .dialog-header h3 {
    margin: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
  }

  .dialog-close {
    background: none;
    border: 2px solid #fff;
    color: #fff;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.15s;
  }

  .dialog-close:hover {
    background: #fff;
    color: #4b7bff;
  }

  .dialog-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-weight: 700;
    font-size: 0.9rem;
  }

  .field-value {
    padding: 0.5rem 1rem;
    background: #f5f5f5;
    border: 2px solid #ddd;
    font-weight: 600;
  }

  .brutal-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 3px solid #111;
    font-family: inherit;
    font-size: 0.95rem;
    outline: none;
    resize: vertical;
    min-height: 120px;
    box-sizing: border-box;
    line-height: 1.6;
  }

  .brutal-textarea:focus {
    box-shadow: 4px 4px 0 #4b7bff;
  }

  /* Switch */
  .switch-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .brutal-switch {
    width: 56px;
    height: 30px;
    border: 3px solid #111;
    background: #e5e5e5;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    padding: 0;
  }

  .brutal-switch.switch-on {
    background: #ff6b6b;
  }

  .switch-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 22px;
    height: 22px;
    background: #fff;
    border: 2px solid #111;
    transition: transform 0.2s;
  }

  .brutal-switch.switch-on .switch-thumb {
    transform: translateX(26px);
  }

  .switch-label {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 3px solid #111;
    background: #f9f9f9;
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .maintenance-admin {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .login-overlay {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
  }

  [data-theme='dark'] .login-card,
  [data-theme='dark'] .admin-header,
  [data-theme='dark'] .tool-item-content,
  [data-theme='dark'] .stat-card,
  [data-theme='dark'] .empty-state,
  [data-theme='dark'] .dialog-content {
    background: #1a1a1a;
    border-color: #eee;
  }

  [data-theme='dark'] .login-card-shadow,
  [data-theme='dark'] .header-title-shadow,
  [data-theme='dark'] .tool-item-shadow,
  [data-theme='dark'] .dialog-shadow {
    background: #eee;
  }

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-textarea {
    background: #222;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-textarea:focus {
    box-shadow: 4px 4px 0 #4b7bff;
  }

  [data-theme='dark'] .brutal-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0 #eee;
  }

  [data-theme='dark'] .btn-sm {
    box-shadow: 3px 3px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 6px 6px 0 #eee;
  }

  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0 0 0 #eee;
  }

  [data-theme='dark'] .btn-back,
  [data-theme='dark'] .btn-back-header,
  [data-theme='dark'] .btn-cancel {
    background: #222;
    color: #eee;
  }

  [data-theme='dark'] .stat-card {
    box-shadow: 5px 5px 0 #eee;
  }

  [data-theme='dark'] .stat-label {
    color: #aaa;
  }

  [data-theme='dark'] .tool-meta {
    color: #aaa;
  }

  [data-theme='dark'] .tool-category {
    background: #333;
    border-color: #555;
    color: #ccc;
  }

  [data-theme='dark'] .field-value {
    background: #333;
    border-color: #555;
    color: #eee;
  }

  [data-theme='dark'] .dialog-footer {
    background: #222;
    border-color: #eee;
  }

  [data-theme='dark'] .login-desc {
    color: #aaa;
  }

  [data-theme='dark'] .dialog-close {
    border-color: #fff;
    color: #fff;
  }

  /* --- Responsive --- */
  @media (max-width: 768px) {
    .stats-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .header-inner {
      flex-direction: column;
      gap: 0.75rem;
    }

    .toolbar-left {
      flex-direction: column;
    }

    .search-input {
      min-width: unset;
    }

    .tool-item-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .tool-actions {
      width: 100%;
    }

    .tool-actions .brutal-btn {
      flex: 1;
      justify-content: center;
    }
  }
</style>
