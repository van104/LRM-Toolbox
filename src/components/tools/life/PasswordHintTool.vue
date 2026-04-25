<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">密码<span>.提示本()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：密码条目列表 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>🔐 密码提示库</span>
            <div class="pane-actions">
              <button :class="{ active: !searchKeyword }" @click="searchKeyword = ''">全部</button>
              <button
                :class="{ active: searchKeyword === 'favorite' }"
                @click="searchKeyword = 'favorite'"
              >
                收藏
              </button>
            </div>
          </div>

          <!-- 搜索栏 -->
          <div class="search-bar">
            <input
              v-model="searchInput"
              class="brutal-input full"
              placeholder="🔍 搜索账号或平台..."
            />
          </div>

          <!-- 添加新条目 -->
          <div class="add-form">
            <div class="form-row">
              <input v-model="form.platform" class="brutal-input" placeholder="平台名称" />
              <input v-model="form.account" class="brutal-input" placeholder="账号" />
            </div>
            <div class="form-row">
              <input
                v-model="form.hint"
                class="brutal-input full"
                placeholder="密码提示（如：生日+宠物名）"
              />
            </div>
            <div class="form-row">
              <textarea
                v-model="form.notes"
                class="brutal-textarea"
                placeholder="备注信息（安全问题答案、绑定手机等）"
                rows="2"
              ></textarea>
            </div>
            <div class="form-row">
              <label class="checkbox-label">
                <input v-model="form.favorite" type="checkbox" />
                <span>⭐ 收藏</span>
              </label>
              <button class="brutal-action-btn primary" @click="addEntry">+ 添加</button>
            </div>
          </div>

          <!-- 条目列表 -->
          <div class="entries-list">
            <div
              v-for="entry in filteredEntries"
              :key="entry.id"
              class="entry-card"
              @click="toggleExpand(entry.id)"
            >
              <div class="entry-header">
                <div class="entry-icon">{{ getIcon(entry.platform) }}</div>
                <div class="entry-info">
                  <div class="entry-platform">{{ entry.platform }}</div>
                  <div class="entry-account">{{ entry.account || '未设置账号' }}</div>
                </div>
                <div class="entry-meta">
                  <span v-if="entry.favorite" class="favorite-star">⭐</span>
                  <span class="expand-icon">{{ expandedId === entry.id ? '▼' : '▶' }}</span>
                </div>
              </div>
              <div v-if="expandedId === entry.id" class="entry-detail">
                <div class="detail-row">
                  <span class="detail-label">密码提示：</span>
                  <span class="detail-value hint">{{ entry.hint || '无' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">备注：</span>
                  <span class="detail-value">{{ entry.notes || '无' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">创建时间：</span>
                  <span class="detail-value">{{ formatDateTime(entry.createdAt) }}</span>
                </div>
                <div class="detail-actions">
                  <button class="edit-btn" @click.stop="editEntry(entry)">✎ 编辑</button>
                  <button class="copy-btn" @click.stop="copyToClipboard(entry.hint)">
                    📋 复制提示
                  </button>
                  <button class="del-btn" @click.stop="deleteEntry(entry.id)">✕ 删除</button>
                </div>
              </div>
            </div>
            <div v-if="filteredEntries.length === 0" class="empty-item">暂无记录</div>
          </div>
        </div>

        <!-- 右侧：安全提示 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">🛡️ 安全提示</span>
          </div>
          <div class="security-tips">
            <div class="tip-card warning">
              <div class="tip-icon">⚠️</div>
              <div class="tip-content">
                <div class="tip-title">不要存储明文密码</div>
                <div class="tip-desc">本工具仅存储密码提示，请勿直接记录密码原文</div>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon">💡</div>
              <div class="tip-content">
                <div class="tip-title">好的密码提示</div>
                <div class="tip-desc">
                  使用只有你能理解的线索，如"奶奶的生日倒序+第一只猫的名字"
                </div>
              </div>
            </div>
            <div class="tip-card">
              <div class="tip-icon">🔒</div>
              <div class="tip-content">
                <div class="tip-title">安全建议</div>
                <div class="tip-desc">使用密码管理器存储真实密码，此工具仅作辅助记忆</div>
              </div>
            </div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">📊 统计</span>
          </div>
          <div class="stats-section">
            <div class="stat-item">
              <span class="stat-value">{{ entries.length }}</span>
              <span class="stat-label">总条目</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ favoriteCount }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>

          <div class="pane-header bg-green" style="margin-top: 1rem">
            <span>💡 密码生成技巧</span>
          </div>
          <div class="generator-tips">
            <div class="gen-tip">🎵 用歌词首字母 + 特殊字符</div>
            <div class="gen-tip">📖 书名+页码组合</div>
            <div class="gen-tip">🎲 随机单词 + 数字替换</div>
            <div class="gen-tip">📍 地点缩写 + 纪念日</div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 密码提示本 // 安全第一 // 数据本地存储 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editingEntry" class="modal-overlay" @click.self="editingEntry = null">
      <div class="modal-content">
        <div class="modal-header">
          <span>编辑条目</span>
          <button @click="editingEntry = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <input v-model="editForm.platform" class="brutal-input full" placeholder="平台名称" />
          </div>
          <div class="form-row">
            <input v-model="editForm.account" class="brutal-input full" placeholder="账号" />
          </div>
          <div class="form-row">
            <input v-model="editForm.hint" class="brutal-input full" placeholder="密码提示" />
          </div>
          <div class="form-row">
            <textarea
              v-model="editForm.notes"
              class="brutal-textarea"
              placeholder="备注信息"
              rows="3"
            ></textarea>
          </div>
          <label class="checkbox-label">
            <input v-model="editForm.favorite" type="checkbox" />
            <span>⭐ 收藏</span>
          </label>
        </div>
        <div class="modal-footer">
          <button class="brutal-action-btn" @click="editingEntry = null">取消</button>
          <button class="brutal-action-btn primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';

  const STORAGE_KEY = 'lrm_password_hints';

  const platformIcons = {
    微信: '💬',
    QQ: '🐧',
    支付宝: '💳',
    淘宝: '🛒',
    京东: '📦',
    微博: '📱',
    抖音: '🎵',
    B站: '📺',
    知乎: '💡',
    豆瓣: '📗',
    GitHub: '🐙',
    Google: '🔍',
    Apple: '',
    微软: '🪟',
    Steam: '🎮',
    银行: '🏦',
    邮箱: '📧',
    默认: '🔐'
  };

  const form = ref({
    platform: '',
    account: '',
    hint: '',
    notes: '',
    favorite: false
  });

  const entries = ref([]);
  const searchInput = ref('');
  const searchKeyword = ref('');
  const expandedId = ref(null);
  const editingEntry = ref(null);
  const editForm = ref({});

  const loadEntries = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      entries.value = JSON.parse(data);
    }
  };

  const saveEntries = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value));
  };

  const addEntry = () => {
    if (!form.value.platform.trim()) {
      ElMessage.warning('请输入平台名称');
      return;
    }

    entries.value.unshift({
      id: Date.now(),
      platform: form.value.platform.trim(),
      account: form.value.account.trim(),
      hint: form.value.hint.trim(),
      notes: form.value.notes.trim(),
      favorite: form.value.favorite,
      createdAt: new Date().toISOString()
    });

    saveEntries();
    ElMessage.success('添加成功');

    form.value = { platform: '', account: '', hint: '', notes: '', favorite: false };
  };

  const deleteEntry = id => {
    entries.value = entries.value.filter(e => e.id !== id);
    saveEntries();
    ElMessage.success('已删除');
  };

  const editEntry = entry => {
    editingEntry.value = entry;
    editForm.value = { ...entry };
  };

  const saveEdit = () => {
    const index = entries.value.findIndex(e => e.id === editingEntry.value.id);
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...editForm.value };
      saveEntries();
      ElMessage.success('保存成功');
    }
    editingEntry.value = null;
  };

  const toggleExpand = id => {
    expandedId.value = expandedId.value === id ? null : id;
  };

  const getIcon = platform => {
    for (const [key, icon] of Object.entries(platformIcons)) {
      if (platform.includes(key)) return icon;
    }
    return platformIcons['默认'];
  };

  const formatDateTime = date => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const copyToClipboard = text => {
    if (!text) {
      ElMessage.warning('没有可复制的内容');
      return;
    }
    navigator.clipboard.writeText(text);
    ElMessage.success('已复制，请使用后及时清除剪贴板');
  };

  const favoriteCount = computed(() => entries.value.filter(e => e.favorite).length);

  const filteredEntries = computed(() => {
    let result = [...entries.value];

    if (searchKeyword.value === 'favorite') {
      result = result.filter(e => e.favorite);
    }

    if (searchInput.value) {
      const keyword = searchInput.value.toLowerCase();
      result = result.filter(
        e =>
          e.platform.toLowerCase().includes(keyword) ||
          e.account.toLowerCase().includes(keyword) ||
          e.hint.toLowerCase().includes(keyword)
      );
    }

    return result;
  });

  onMounted(loadEntries);
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ffd900;
  }
  .brutal-title span {
    color: #ffd900;
    text-shadow: 4px 4px 0px #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2.5rem;
    margin-bottom: 2.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.15rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-dark {
    background: #111;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    border: 3px solid #111;
    padding: 0.35rem 0.75rem;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .pane-actions button.active {
    background: #00e572;
    box-shadow: 0 0 0 #111;
    transform: translate(2px, 2px);
  }

  .search-bar {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .brutal-input {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-input.full {
    width: 100%;
  }
  .brutal-textarea {
    width: 100%;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    resize: vertical;
  }

  .add-form {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .form-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    align-items: center;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 600;
  }
  .checkbox-label input {
    width: 18px;
    height: 18px;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .entries-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  }

  .entry-card {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: all 0.1s;
  }
  .entry-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .entry-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }
  .entry-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 3px solid #111;
  }
  .entry-info {
    flex: 1;
  }
  .entry-platform {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .entry-account {
    font-size: 0.85rem;
    color: #666;
  }
  .entry-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .favorite-star {
    font-size: 1.2rem;
  }
  .expand-icon {
    font-size: 0.9rem;
    color: #666;
  }

  .entry-detail {
    padding: 1rem;
    border-top: 3px solid #111;
    background: #f9f9f9;
  }
  .detail-row {
    display: flex;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  .detail-label {
    font-weight: 700;
    min-width: 80px;
  }
  .detail-value {
    flex: 1;
  }
  .detail-value.hint {
    font-weight: 600;
    color: #4b7bff;
  }

  .detail-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .edit-btn,
  .copy-btn,
  .del-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.4rem 0.8rem;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .edit-btn {
    background: #89b4f8;
  }
  .copy-btn {
    background: #ffd900;
  }
  .del-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .edit-btn:hover,
  .copy-btn:hover,
  .del-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .empty-item {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-weight: 600;
  }

  .security-tips {
    padding: 1rem;
  }
  .tip-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .tip-card.warning {
    background: #fff4d4;
    border-color: #ff9800;
  }
  .tip-icon {
    font-size: 1.5rem;
  }
  .tip-title {
    font-weight: 800;
    margin-bottom: 0.25rem;
  }
  .tip-desc {
    font-size: 0.85rem;
    color: #666;
  }

  .stats-section {
    display: flex;
    padding: 1rem;
    gap: 1rem;
  }
  .stat-item {
    flex: 1;
    text-align: center;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }
  .stat-label {
    font-size: 0.85rem;
    color: #666;
  }

  .generator-tips {
    padding: 1rem;
  }
  .gen-tip {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 2px solid #eee;
  }
  .gen-tip:last-child {
    border-bottom: none;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
  }
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .modal-content {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    width: 400px;
    max-width: 90vw;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffd900;
    border-bottom: 4px solid #111;
    font-weight: 800;
  }
  .modal-header button {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  .modal-body {
    padding: 1.5rem;
  }
  .modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-top: 4px solid #111;
  }
  .modal-footer .brutal-action-btn {
    flex: 1;
    text-align: center;
  }

  @media (max-width: 1024px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-textarea,
  [data-theme='dark'] .modal-content {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .entry-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .entry-detail {
    background: #222;
    border-top-color: #eee;
  }
  [data-theme='dark'] .entry-icon {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .tip-card {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .stat-item {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .modal-header {
    background: #b28f00;
    border-bottom-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .modal-footer {
    border-top-color: #eee;
  }
</style>
