<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">保质期<span>.追踪()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：物品列表 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>📦 物品清单</span>
            <div class="pane-actions">
              <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
              <button :class="{ active: filter === 'expiring' }" @click="filter = 'expiring'">
                即将过期
              </button>
              <button :class="{ active: filter === 'expired' }" @click="filter = 'expired'">
                已过期
              </button>
            </div>
          </div>

          <!-- 添加物品表单 -->
          <div class="add-form">
            <div class="form-row">
              <input v-model="form.name" class="brutal-input" placeholder="物品名称" />
              <select v-model="form.category" class="brutal-select">
                <option value="">分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <input v-model="form.expiryDate" type="date" class="brutal-input" title="过期日期" />
              <input
                v-model.number="form.quantity"
                type="number"
                class="brutal-input"
                placeholder="数量"
                min="1"
              />
              <button class="brutal-action-btn primary" @click="addItem">+ 添加</button>
            </div>
            <div class="form-row">
              <input
                v-model="form.location"
                class="brutal-input full"
                placeholder="存放位置（如：冰箱、橱柜）"
              />
            </div>
          </div>

          <!-- 统计概览 -->
          <div class="summary-cards">
            <div class="summary-card total">
              <div class="label">总物品</div>
              <div class="amount">{{ items.length }}</div>
            </div>
            <div class="summary-card warning">
              <div class="label">即将过期</div>
              <div class="amount">{{ expiringItems.length }}</div>
            </div>
            <div class="summary-card danger">
              <div class="label">已过期</div>
              <div class="amount">{{ expiredItems.length }}</div>
            </div>
          </div>

          <!-- 物品列表 -->
          <div class="items-list">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="item-card"
              :class="getItemStatus(item)"
            >
              <div class="item-icon">{{ getCategoryIcon(item.category) }}</div>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-meta">
                  <span v-if="item.location" class="item-location">📍 {{ item.location }}</span>
                  <span class="item-qty">×{{ item.quantity || 1 }}</span>
                </div>
              </div>
              <div class="item-expiry">
                <div class="expiry-date">{{ formatDate(item.expiryDate) }}</div>
                <div class="expiry-status" :class="getStatusClass(item)">
                  {{ getStatusText(item) }}
                </div>
              </div>
              <div class="item-actions">
                <button class="use-btn" @click="useItem(item)">使用</button>
                <button class="del-btn" @click="deleteItem(item.id)">✕</button>
              </div>
            </div>
            <div v-if="filteredItems.length === 0" class="empty-item">暂无物品记录</div>
          </div>
        </div>

        <!-- 右侧：分类和提醒 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📂 分类筛选</span>
          </div>
          <div class="category-filters">
            <button :class="{ active: categoryFilter === '' }" @click="categoryFilter = ''">
              全部
            </button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              :class="{ active: categoryFilter === cat.id }"
              @click="categoryFilter = cat.id"
            >
              {{ cat.icon }} {{ cat.name }}
            </button>
          </div>

          <div class="pane-header bg-red" style="margin-top: 1rem">
            <span class="text-white">⚠️ 过期预警</span>
          </div>
          <div class="alert-section">
            <div
              v-for="item in urgentItems"
              :key="item.id"
              class="alert-item"
              :class="getItemStatus(item)"
            >
              <span class="alert-icon">{{ getCategoryIcon(item.category) }}</span>
              <span class="alert-name">{{ item.name }}</span>
              <span class="alert-days">{{ getDaysRemaining(item) }}天</span>
            </div>
            <div v-if="urgentItems.length === 0" class="empty-alert">暂无过期预警</div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">💡 贴士</span>
          </div>
          <div class="tips-section">
            <div class="tip-item">🗓️ 先买的先用，先进先出原则</div>
            <div class="tip-item">❄️ 冷藏食品注意密封保存</div>
            <div class="tip-item">📝 定期检查冰箱和橱柜</div>
            <div class="tip-item">🛒 购物前列清单，避免囤积</div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 保质期追踪 // 减少浪费 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';

  const STORAGE_KEY = 'lrm_expiry_items';

  const categories = [
    { id: 'food', name: '食品', icon: '🍎' },
    { id: 'dairy', name: '乳制品', icon: '🥛' },
    { id: 'meat', name: '肉类', icon: '🥩' },
    { id: 'vegetable', name: '蔬菜', icon: '🥬' },
    { id: 'medicine', name: '药品', icon: '💊' },
    { id: 'cosmetic', name: '化妆品', icon: '💄' },
    { id: 'other', name: '其他', icon: '📦' }
  ];

  const form = ref({
    name: '',
    category: '',
    expiryDate: '',
    quantity: 1,
    location: ''
  });

  const items = ref([]);
  const filter = ref('all');
  const categoryFilter = ref('');

  const loadItems = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      items.value = JSON.parse(data);
    }
  };

  const saveItems = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
  };

  const addItem = () => {
    if (!form.value.name.trim()) {
      ElMessage.warning('请输入物品名称');
      return;
    }
    if (!form.value.expiryDate) {
      ElMessage.warning('请选择过期日期');
      return;
    }

    items.value.push({
      id: Date.now(),
      name: form.value.name.trim(),
      category: form.value.category || 'other',
      expiryDate: form.value.expiryDate,
      quantity: form.value.quantity || 1,
      location: form.value.location.trim(),
      createdAt: new Date().toISOString()
    });

    saveItems();
    ElMessage.success('添加成功');

    form.value = {
      name: '',
      category: '',
      expiryDate: '',
      quantity: 1,
      location: ''
    };
  };

  const deleteItem = id => {
    items.value = items.value.filter(i => i.id !== id);
    saveItems();
    ElMessage.success('已删除');
  };

  const useItem = item => {
    if (item.quantity > 1) {
      item.quantity--;
      saveItems();
      ElMessage.success(`已使用1个，剩余${item.quantity}个`);
    } else {
      deleteItem(item.id);
    }
  };

  const getCategoryIcon = categoryId => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : '📦';
  };

  const formatDate = date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getDaysRemaining = item => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(item.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getItemStatus = item => {
    const days = getDaysRemaining(item);
    if (days < 0) return 'expired';
    if (days <= 3) return 'danger';
    if (days <= 7) return 'warning';
    return 'fresh';
  };

  const getStatusClass = item => getItemStatus(item);

  const getStatusText = item => {
    const days = getDaysRemaining(item);
    if (days < 0) return `已过期${Math.abs(days)}天`;
    if (days === 0) return '今天过期';
    return `剩余${days}天`;
  };

  const expiredItems = computed(() => items.value.filter(i => getDaysRemaining(i) < 0));
  const expiringItems = computed(() =>
    items.value.filter(i => {
      const days = getDaysRemaining(i);
      return days >= 0 && days <= 7;
    })
  );

  const urgentItems = computed(() =>
    items.value
      .filter(i => getDaysRemaining(i) <= 7)
      .sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b))
      .slice(0, 8)
  );

  const filteredItems = computed(() => {
    let result = [...items.value];

    if (categoryFilter.value) {
      result = result.filter(i => i.category === categoryFilter.value);
    }

    if (filter.value === 'expiring') {
      result = result.filter(i => {
        const days = getDaysRemaining(i);
        return days >= 0 && days <= 7;
      });
    } else if (filter.value === 'expired') {
      result = result.filter(i => getDaysRemaining(i) < 0);
    }

    return result.sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b));
  });

  onMounted(loadItems);
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
    grid-template-columns: 1fr 360px;
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
  .bg-red {
    background: #ff4b4b;
  }
  .bg-dark {
    background: #111;
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
    font-family: 'IBM Plex Mono', monospace;
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

  .add-form {
    padding: 1.5rem;
    border-bottom: 4px solid #111;
  }
  .form-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
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
    flex: 1;
  }

  .brutal-select {
    flex: 1;
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    cursor: pointer;
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

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }
  .summary-card {
    text-align: center;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .summary-card.total {
    background: #d4f8ff;
  }
  .summary-card.warning {
    background: #fff4d4;
  }
  .summary-card.danger {
    background: #ffd4d4;
  }
  .summary-card .label {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .summary-card .amount {
    font-size: 1.5rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }

  .items-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  }

  .item-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .item-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .item-card.fresh {
    background: #fff;
  }
  .item-card.warning {
    background: #fff4d4;
    border-color: #ff9800;
  }
  .item-card.danger {
    background: #ffe0e0;
    border-color: #ff5722;
  }
  .item-card.expired {
    background: #f5f5f5;
    opacity: 0.7;
  }

  .item-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 3px solid #111;
  }
  .item-info {
    flex: 1;
  }
  .item-name {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .item-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .item-expiry {
    text-align: right;
  }
  .expiry-date {
    font-weight: 700;
    font-size: 1rem;
  }
  .expiry-status {
    font-size: 0.85rem;
    font-weight: 700;
  }
  .expiry-status.fresh {
    color: #4caf50;
  }
  .expiry-status.warning {
    color: #ff9800;
  }
  .expiry-status.danger {
    color: #ff5722;
  }
  .expiry-status.expired {
    color: #f44336;
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .use-btn,
  .del-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.35rem 0.75rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    font-size: 0.85rem;
  }
  .use-btn {
    background: #00e572;
  }
  .use-btn:hover,
  .del-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .del-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .empty-item {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-weight: 600;
  }

  .category-filters {
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .category-filters button {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 0.75rem;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }
  .category-filters button.active {
    background: #00e572;
    box-shadow: 0 0 0 #111;
    transform: translate(2px, 2px);
  }
  .category-filters button:hover:not(.active) {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .alert-section {
    padding: 1rem;
  }
  .alert-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .alert-item.warning {
    background: #fff4d4;
  }
  .alert-item.danger {
    background: #ffe0e0;
  }
  .alert-item.expired {
    background: #f5f5f5;
  }
  .alert-icon {
    font-size: 1.2rem;
  }
  .alert-name {
    flex: 1;
    font-weight: 700;
  }
  .alert-days {
    font-weight: 800;
    color: #ff5722;
  }

  .empty-alert {
    text-align: center;
    color: #999;
    padding: 1rem;
  }

  .tips-section {
    padding: 1rem;
  }
  .tip-item {
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 2px solid #eee;
  }
  .tip-item:last-child {
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
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-action-btn {
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
  [data-theme='dark'] .summary-card {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .item-card {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .item-icon {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .category-filters button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .alert-item {
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
  [data-theme='dark'] .bg-red {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
