<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">订阅<span>.管理()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：订阅列表 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>📋 我的订阅</span>
            <div class="pane-actions">
              <button :class="{ active: filter === 'all' }" @click="filter = 'all'">全部</button>
              <button :class="{ active: filter === 'active' }" @click="filter = 'active'">
                生效中
              </button>
              <button :class="{ active: filter === 'expiring' }" @click="filter = 'expiring'">
                即将到期
              </button>
            </div>
          </div>

          <!-- 添加订阅表单 -->
          <div class="add-form">
            <div class="form-row">
              <input v-model="form.name" class="brutal-input" placeholder="订阅名称" />
              <select v-model="form.category" class="brutal-select">
                <option value="">选择类型</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <input
                v-model.number="form.price"
                type="number"
                class="brutal-input"
                placeholder="价格"
                min="0"
                step="0.01"
              />
              <select v-model="form.cycle" class="brutal-select">
                <option value="monthly">月付</option>
                <option value="quarterly">季付</option>
                <option value="yearly">年付</option>
              </select>
              <input v-model="form.startDate" type="date" class="brutal-input" title="开始日期" />
            </div>
            <div class="form-row">
              <input v-model="form.note" class="brutal-input full" placeholder="备注（可选）" />
              <button class="brutal-action-btn primary" @click="addSubscription">+ 添加订阅</button>
            </div>
          </div>

          <!-- 统计概览 -->
          <div class="summary-cards">
            <div class="summary-card total">
              <div class="label">本月订阅支出</div>
              <div class="amount">¥{{ monthlyTotal.toFixed(2) }}</div>
            </div>
            <div class="summary-card count">
              <div class="label">订阅数量</div>
              <div class="amount">{{ subscriptions.length }}</div>
            </div>
            <div class="summary-card yearly">
              <div class="label">预计年支出</div>
              <div class="amount">¥{{ yearlyTotal.toFixed(2) }}</div>
            </div>
          </div>

          <!-- 订阅列表 -->
          <div class="sub-list">
            <div
              v-for="sub in filteredSubscriptions"
              :key="sub.id"
              class="sub-item"
              :class="{ expiring: isExpiring(sub), expired: isExpired(sub) }"
            >
              <div class="sub-icon">{{ getCategoryIcon(sub.category) }}</div>
              <div class="sub-info">
                <div class="sub-name">{{ sub.name }}</div>
                <div class="sub-meta">
                  <span class="sub-cycle">{{ getCycleText(sub.cycle) }}</span>
                  <span class="sub-start">{{ formatDate(sub.startDate) }} 起</span>
                </div>
                <div v-if="sub.note" class="sub-note">{{ sub.note }}</div>
              </div>
              <div class="sub-right">
                <div class="sub-price">¥{{ sub.price.toFixed(2) }}</div>
                <div class="sub-next" :class="{ warning: isExpiring(sub) }">
                  <template v-if="isExpired(sub)"> 已过期 </template>
                  <template v-else> {{ getDaysRemaining(sub) }}天后到期 </template>
                </div>
              </div>
              <div class="sub-actions">
                <button class="edit-btn" @click="editSubscription(sub)">✎</button>
                <button class="del-btn" @click="deleteSubscription(sub.id)">✕</button>
              </div>
            </div>
            <div v-if="filteredSubscriptions.length === 0" class="empty-item">暂无订阅记录</div>
          </div>
        </div>

        <!-- 右侧：统计图表 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📊 分类统计</span>
          </div>
          <div class="chart-section">
            <canvas ref="chartRef" width="320" height="280"></canvas>
            <div class="chart-legend">
              <div v-for="item in categoryStats" :key="item.category" class="legend-item">
                <span class="legend-color" :style="{ background: item.color }"></span>
                <span class="legend-name">{{ item.name }}</span>
                <span class="legend-value">¥{{ item.monthly.toFixed(2) }}/月</span>
              </div>
            </div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">⏰ 到期提醒</span>
          </div>
          <div class="reminder-section">
            <div v-for="sub in expiringSubscriptions" :key="sub.id" class="reminder-item">
              <span class="reminder-icon">{{ getCategoryIcon(sub.category) }}</span>
              <span class="reminder-name">{{ sub.name }}</span>
              <span class="reminder-days" :class="{ urgent: getDaysRemaining(sub) <= 3 }">
                {{ getDaysRemaining(sub) }}天
              </span>
            </div>
            <div v-if="expiringSubscriptions.length === 0" class="empty-reminder">
              暂无即将到期的订阅
            </div>
          </div>

          <div class="pane-header bg-green" style="margin-top: 1rem">
            <span>💡 省钱提示</span>
          </div>
          <div class="tips-section">
            <div class="tip-item">
              <span class="tip-icon">🎯</span>
              <span>年付比月付平均节省约 15-20%</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">📅</span>
              <span>设置日历提醒，到期前3天评估是否续费</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🎁</span>
              <span>关注节假日促销，通常有优惠活动</span>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 订阅管理 // 数据本地存储 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="editingSub" class="modal-overlay" @click.self="editingSub = null">
      <div class="modal-content">
        <div class="modal-header">
          <span>编辑订阅</span>
          <button @click="editingSub = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <input v-model="editForm.name" class="brutal-input full" placeholder="订阅名称" />
          </div>
          <div class="form-row">
            <input
              v-model.number="editForm.price"
              type="number"
              class="brutal-input"
              placeholder="价格"
            />
            <select v-model="editForm.cycle" class="brutal-select">
              <option value="monthly">月付</option>
              <option value="quarterly">季付</option>
              <option value="yearly">年付</option>
            </select>
          </div>
          <div class="form-row">
            <input v-model="editForm.startDate" type="date" class="brutal-input" />
            <input v-model="editForm.note" class="brutal-input" placeholder="备注" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="brutal-action-btn" @click="editingSub = null">取消</button>
          <button class="brutal-action-btn primary" @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick, watch } from 'vue';
  import { ElMessage } from 'element-plus';

  const STORAGE_KEY = 'lrm_subscriptions';

  const categories = [
    { id: 'video', name: '视频', icon: '🎬' },
    { id: 'music', name: '音乐', icon: '🎵' },
    { id: 'game', name: '游戏', icon: '🎮' },
    { id: 'cloud', name: '云存储', icon: '☁️' },
    { id: 'software', name: '软件', icon: '💻' },
    { id: 'reading', name: '阅读', icon: '📚' },
    { id: 'fitness', name: '健身', icon: '💪' },
    { id: 'other', name: '其他', icon: '📦' }
  ];

  const chartColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7D794',
    '#778BEB',
    '#786FA6'
  ];

  const form = ref({
    name: '',
    category: '',
    price: null,
    cycle: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  const subscriptions = ref([]);
  const filter = ref('all');
  const chartRef = ref(null);
  const editingSub = ref(null);
  const editForm = ref({});

  const loadSubscriptions = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      subscriptions.value = JSON.parse(data);
    }
  };

  const saveSubscriptions = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions.value));
  };

  const addSubscription = () => {
    if (!form.value.name.trim()) {
      ElMessage.warning('请输入订阅名称');
      return;
    }
    if (!form.value.category) {
      ElMessage.warning('请选择订阅类型');
      return;
    }
    if (!form.value.price || form.value.price <= 0) {
      ElMessage.warning('请输入有效价格');
      return;
    }

    subscriptions.value.push({
      id: Date.now(),
      name: form.value.name.trim(),
      category: form.value.category,
      price: Number(form.value.price),
      cycle: form.value.cycle,
      startDate: form.value.startDate,
      note: form.value.note.trim()
    });

    saveSubscriptions();
    ElMessage.success('添加成功');

    form.value = {
      name: '',
      category: '',
      price: null,
      cycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      note: ''
    };
  };

  const deleteSubscription = id => {
    subscriptions.value = subscriptions.value.filter(s => s.id !== id);
    saveSubscriptions();
    ElMessage.success('已删除');
  };

  const editSubscription = sub => {
    editingSub.value = sub;
    editForm.value = { ...sub };
  };

  const saveEdit = () => {
    const index = subscriptions.value.findIndex(s => s.id === editingSub.value.id);
    if (index !== -1) {
      subscriptions.value[index] = {
        ...subscriptions.value[index],
        ...editForm.value,
        price: Number(editForm.value.price)
      };
      saveSubscriptions();
      ElMessage.success('保存成功');
    }
    editingSub.value = null;
  };

  const getCategoryIcon = categoryId => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.icon : '📦';
  };

  const getCategoryName = categoryId => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '其他';
  };

  const getCycleText = cycle => {
    const map = { monthly: '月付', quarterly: '季付', yearly: '年付' };
    return map[cycle] || cycle;
  };

  const formatDate = date => {
    const d = new Date(date);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getNextBillingDate = sub => {
    const start = new Date(sub.startDate);
    const now = new Date();
    let next = new Date(start);

    while (next <= now) {
      if (sub.cycle === 'monthly') {
        next.setMonth(next.getMonth() + 1);
      } else if (sub.cycle === 'quarterly') {
        next.setMonth(next.getMonth() + 3);
      } else if (sub.cycle === 'yearly') {
        next.setFullYear(next.getFullYear() + 1);
      }
    }
    return next;
  };

  const getDaysRemaining = sub => {
    const next = getNextBillingDate(sub);
    const now = new Date();
    const diff = next - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isExpiring = sub => {
    const days = getDaysRemaining(sub);
    return days > 0 && days <= 7;
  };

  const isExpired = sub => {
    return getDaysRemaining(sub) < 0;
  };

  const getMonthlyEquivalent = sub => {
    if (sub.cycle === 'monthly') return sub.price;
    if (sub.cycle === 'quarterly') return sub.price / 3;
    if (sub.cycle === 'yearly') return sub.price / 12;
    return sub.price;
  };

  const monthlyTotal = computed(() =>
    subscriptions.value.reduce((sum, sub) => sum + getMonthlyEquivalent(sub), 0)
  );

  const yearlyTotal = computed(() => monthlyTotal.value * 12);

  const filteredSubscriptions = computed(() => {
    let result = [...subscriptions.value];
    if (filter.value === 'active') {
      result = result.filter(s => !isExpired(s));
    } else if (filter.value === 'expiring') {
      result = result.filter(s => isExpiring(s));
    }
    return result.sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b));
  });

  const expiringSubscriptions = computed(() =>
    subscriptions.value
      .filter(s => isExpiring(s))
      .sort((a, b) => getDaysRemaining(a) - getDaysRemaining(b))
      .slice(0, 5)
  );

  const categoryStats = computed(() => {
    const stats = {};
    subscriptions.value.forEach(sub => {
      if (!stats[sub.category]) {
        stats[sub.category] = {
          category: sub.category,
          name: getCategoryName(sub.category),
          monthly: 0
        };
      }
      stats[sub.category].monthly += getMonthlyEquivalent(sub);
    });
    return Object.values(stats)
      .map((item, index) => ({ ...item, color: chartColors[index % chartColors.length] }))
      .sort((a, b) => b.monthly - a.monthly);
  });

  const drawChart = () => {
    const canvas = chartRef.value;
    if (!canvas || categoryStats.value.length === 0) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 20;
    const radius = Math.min(centerX, centerY) - 30;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = categoryStats.value.reduce((sum, item) => sum + item.monthly, 0);
    let startAngle = -Math.PI / 2;

    categoryStats.value.forEach(item => {
      const sliceAngle = (item.monthly / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = 'bold 14px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText(`¥${total.toFixed(0)}/月`, centerX, centerY + 5);
  };

  watch(
    [subscriptions, filter],
    () => {
      nextTick(drawChart);
    },
    { deep: true }
  );

  onMounted(() => {
    loadSubscriptions();
    nextTick(drawChart);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
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
    letter-spacing: 0;
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
    color: #fff;
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

  /* Form */
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

  /* Summary */
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
    background: #fff4d4;
  }
  .summary-card.count {
    background: #d4f8ff;
  }
  .summary-card.yearly {
    background: #f0d4ff;
  }

  .summary-card .label {
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .summary-card .amount {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
  }

  /* Subscription List */
  .sub-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  }

  .sub-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.75rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .sub-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .sub-item.expiring {
    background: #fff4d4;
    border-color: #ff9800;
  }
  .sub-item.expired {
    background: #f5f5f5;
    opacity: 0.7;
  }

  .sub-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 3px solid #111;
  }

  .sub-info {
    flex: 1;
  }
  .sub-name {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .sub-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }
  .sub-note {
    font-size: 0.85rem;
    color: #888;
    margin-top: 0.25rem;
  }

  .sub-right {
    text-align: right;
  }
  .sub-price {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
  }
  .sub-next {
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.25rem;
  }
  .sub-next.warning {
    color: #ff9800;
    font-weight: 700;
  }

  .sub-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-btn,
  .del-btn {
    background: #fff;
    border: 2px solid #111;
    width: 32px;
    height: 32px;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    font-weight: 800;
  }
  .edit-btn:hover,
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

  /* Side Pane */
  .chart-section {
    padding: 1rem;
    text-align: center;
  }

  .chart-legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    text-align: left;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border: 2px solid #111;
  }
  .legend-name {
    flex: 1;
  }
  .legend-value {
    font-weight: 700;
  }

  .reminder-section {
    padding: 1rem;
  }

  .reminder-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: #fff4d4;
    border: 3px solid #ff9800;
    box-shadow: 3px 3px 0px #ff9800;
  }

  .reminder-icon {
    font-size: 1.2rem;
  }
  .reminder-name {
    flex: 1;
    font-weight: 700;
  }
  .reminder-days {
    font-weight: 800;
    color: #ff9800;
  }
  .reminder-days.urgent {
    color: #ff4b4b;
  }

  .empty-reminder {
    text-align: center;
    color: #999;
    padding: 1rem;
  }

  .tips-section {
    padding: 1rem;
  }

  .tip-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    font-size: 0.9rem;
  }
  .tip-icon {
    font-size: 1.1rem;
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
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
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

  /* Status */
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

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .modal-content {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
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
  [data-theme='dark'] .pane-actions button.active {
    background: #00994c;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .summary-card {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .sub-item {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .sub-item:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .sub-item.expiring {
    background: #3a3a1a;
    border-color: #ff9800;
  }
  [data-theme='dark'] .sub-item.expired {
    background: #222;
  }
  [data-theme='dark'] .sub-icon {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .edit-btn,
  [data-theme='dark'] .del-btn {
    background: #222;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .del-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .reminder-item {
    background: #3a3a1a;
    border-color: #ff9800;
    box-shadow: 3px 3px 0px #ff9800;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
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
  [data-theme='dark'] .modal-header {
    background: #b28f00;
    border-bottom-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .modal-footer {
    border-top-color: #eee;
  }
</style>
