<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">记账<span>.本()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <div class="brutal-grid main-layout">
        <!-- 左侧：记录和统计 -->
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-yellow">
            <span>💰 收支记录</span>
            <div class="pane-actions">
              <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
                列表
              </button>
              <button :class="{ active: viewMode === 'chart' }" @click="viewMode = 'chart'">
                图表
              </button>
            </div>
          </div>

          <!-- 添加记录表单 -->
          <div class="add-form">
            <div class="type-toggle">
              <button :class="{ active: form.type === 'expense' }" @click="form.type = 'expense'">
                支出
              </button>
              <button :class="{ active: form.type === 'income' }" @click="form.type = 'income'">
                收入
              </button>
            </div>
            <div class="form-row">
              <input
                v-model.number="form.amount"
                type="number"
                class="brutal-input"
                placeholder="金额"
                min="0"
                step="0.01"
              />
              <select v-model="form.category" class="brutal-select">
                <option value="">选择分类</option>
                <option v-for="cat in currentCategories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-row">
              <input v-model="form.note" class="brutal-input full" placeholder="备注（可选）" />
            </div>
            <div class="form-row">
              <input v-model="form.date" type="date" class="brutal-input" />
              <button class="brutal-action-btn primary" @click="addRecord">+ 记一笔</button>
            </div>
          </div>

          <!-- 统计概览 -->
          <div class="summary-cards">
            <div class="summary-card income">
              <div class="label">本月收入</div>
              <div class="amount">¥{{ monthlyIncome.toFixed(2) }}</div>
            </div>
            <div class="summary-card expense">
              <div class="label">本月支出</div>
              <div class="amount">¥{{ monthlyExpense.toFixed(2) }}</div>
            </div>
            <div class="summary-card balance">
              <div class="label">本月结余</div>
              <div class="amount">¥{{ (monthlyIncome - monthlyExpense).toFixed(2) }}</div>
            </div>
          </div>

          <!-- 列表视图 -->
          <div v-if="viewMode === 'list'" class="records-list">
            <div class="list-header">
              <select v-model="filterMonth" class="brutal-select small">
                <option value="">全部月份</option>
                <option v-for="m in availableMonths" :key="m" :value="m">{{ m }}</option>
              </select>
              <button v-if="records.length" class="clear-btn" @click="clearAllRecords">
                清空全部
              </button>
            </div>
            <ul class="record-items">
              <li v-for="record in filteredRecords" :key="record.id" class="record-item">
                <div class="record-icon">{{ getCategoryIcon(record.category, record.type) }}</div>
                <div class="record-info">
                  <div class="record-category">
                    {{ getCategoryName(record.category, record.type) }}
                  </div>
                  <div class="record-note">{{ record.note || '无备注' }}</div>
                  <div class="record-date">{{ formatDate(record.date) }}</div>
                </div>
                <div class="record-amount" :class="record.type">
                  {{ record.type === 'expense' ? '-' : '+' }}¥{{ record.amount.toFixed(2) }}
                </div>
                <button class="del-btn" @click="deleteRecord(record.id)">✕</button>
              </li>
              <li v-if="filteredRecords.length === 0" class="empty-item">暂无记录</li>
            </ul>
          </div>

          <!-- 图表视图 -->
          <div v-else class="chart-view">
            <div class="chart-section">
              <h3>本月支出分布</h3>
              <div class="pie-chart">
                <canvas ref="pieChartRef" width="280" height="280"></canvas>
              </div>
              <div class="chart-legend">
                <div v-for="item in expenseChart" :key="item.category" class="legend-item">
                  <span class="legend-color" :style="{ background: item.color }"></span>
                  <span class="legend-name">{{ item.name }}</span>
                  <span class="legend-value">¥{{ item.amount.toFixed(2) }}</span>
                  <span class="legend-percent">{{ item.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：快捷分类 -->
        <div class="brutal-pane side-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">📊 快捷分类</span>
          </div>
          <div class="quick-categories">
            <div class="cat-section">
              <div class="cat-title">支出</div>
              <div class="cat-grid">
                <button
                  v-for="cat in expenseCategories"
                  :key="cat.id"
                  class="cat-btn"
                  @click="quickSelect(cat.id, 'expense')"
                >
                  {{ cat.icon }} {{ cat.name }}
                </button>
              </div>
            </div>
            <div class="cat-section">
              <div class="cat-title">收入</div>
              <div class="cat-grid">
                <button
                  v-for="cat in incomeCategories"
                  :key="cat.id"
                  class="cat-btn income"
                  @click="quickSelect(cat.id, 'income')"
                >
                  {{ cat.icon }} {{ cat.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="pane-header bg-dark" style="margin-top: 1rem">
            <span class="text-white">📈 趋势</span>
          </div>
          <div class="trend-chart">
            <canvas ref="trendChartRef" width="320" height="200"></canvas>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >© 2026 LRM工具箱 - 记账本 // 数据本地存储 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch, nextTick } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';

  const STORAGE_KEY = 'lrm_accounting_records';

  const expenseCategories = [
    { id: 'food', name: '餐饮', icon: '🍜' },
    { id: 'transport', name: '交通', icon: '🚌' },
    { id: 'shopping', name: '购物', icon: '🛒' },
    { id: 'entertainment', name: '娱乐', icon: '🎮' },
    { id: 'housing', name: '住房', icon: '🏠' },
    { id: 'medical', name: '医疗', icon: '💊' },
    { id: 'education', name: '教育', icon: '📚' },
    { id: 'communication', name: '通讯', icon: '📱' },
    { id: 'other_expense', name: '其他', icon: '📦' }
  ];

  const incomeCategories = [
    { id: 'salary', name: '工资', icon: '💰' },
    { id: 'bonus', name: '奖金', icon: '🎁' },
    { id: 'investment', name: '投资', icon: '📈' },
    { id: 'parttime', name: '兼职', icon: '💼' },
    { id: 'other_income', name: '其他', icon: '💵' }
  ];

  const currentCategories = computed(() =>
    form.value.type === 'expense' ? expenseCategories : incomeCategories
  );

  const form = ref({
    type: 'expense',
    amount: null,
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  const records = ref([]);
  const viewMode = ref('list');
  const filterMonth = ref('');
  const pieChartRef = ref(null);
  const trendChartRef = ref(null);

  const chartColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7D794',
    '#778BEB',
    '#786FA6',
    '#F8A5C2'
  ];

  const loadRecords = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      records.value = JSON.parse(data);
    }
  };

  const saveRecords = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.value));
  };

  const addRecord = () => {
    if (!form.value.amount || form.value.amount <= 0) {
      ElMessage.warning('请输入有效金额');
      return;
    }
    if (!form.value.category) {
      ElMessage.warning('请选择分类');
      return;
    }

    records.value.unshift({
      id: Date.now(),
      type: form.value.type,
      amount: Number(form.value.amount),
      category: form.value.category,
      note: form.value.note,
      date: form.value.date
    });

    saveRecords();
    ElMessage.success('记录成功');
    form.value.amount = null;
    form.value.category = '';
    form.value.note = '';
  };

  const deleteRecord = id => {
    records.value = records.value.filter(r => r.id !== id);
    saveRecords();
    ElMessage.success('已删除');
  };

  const clearAllRecords = async () => {
    try {
      await ElMessageBox.confirm('确定要清空所有记录吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      records.value = [];
      saveRecords();
      ElMessage.success('已清空');
    } catch {
      // cancelled
    }
  };

  const quickSelect = (categoryId, type) => {
    form.value.type = type;
    form.value.category = categoryId;
  };

  const getCategoryIcon = (categoryId, type) => {
    const cats = type === 'expense' ? expenseCategories : incomeCategories;
    const cat = cats.find(c => c.id === categoryId);
    return cat ? cat.icon : '📌';
  };

  const getCategoryName = (categoryId, type) => {
    const cats = type === 'expense' ? expenseCategories : incomeCategories;
    const cat = cats.find(c => c.id === categoryId);
    return cat ? cat.name : '未知';
  };

  const formatDate = date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  const currentMonth = computed(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthlyRecords = computed(() =>
    records.value.filter(r => r.date.startsWith(currentMonth.value))
  );

  const monthlyIncome = computed(() =>
    monthlyRecords.value.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
  );

  const monthlyExpense = computed(() =>
    monthlyRecords.value.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
  );

  const availableMonths = computed(() => {
    const months = new Set();
    records.value.forEach(r => {
      months.add(r.date.substring(0, 7));
    });
    return Array.from(months).sort().reverse();
  });

  const filteredRecords = computed(() => {
    if (!filterMonth.value) return records.value;
    return records.value.filter(r => r.date.startsWith(filterMonth.value));
  });

  const expenseChart = computed(() => {
    const expenseByCategory = {};
    monthlyRecords.value
      .filter(r => r.type === 'expense')
      .forEach(r => {
        expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + r.amount;
      });

    const total = Object.values(expenseByCategory).reduce((sum, v) => sum + v, 0);
    return Object.entries(expenseByCategory)
      .map(([cat, amount], index) => ({
        category: cat,
        name: getCategoryName(cat, 'expense'),
        amount,
        percent: total > 0 ? ((amount / total) * 100).toFixed(1) : 0,
        color: chartColors[index % chartColors.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  const drawPieChart = () => {
    const canvas = pieChartRef.value;
    if (!canvas || expenseChart.value.length === 0) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let startAngle = -Math.PI / 2;
    const total = expenseChart.value.reduce((sum, item) => sum + item.amount, 0);

    expenseChart.value.forEach(item => {
      const sliceAngle = (item.amount / total) * Math.PI * 2;

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
    ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.font = 'bold 16px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText(`¥${total.toFixed(0)}`, centerX, centerY + 6);
  };

  const drawTrendChart = () => {
    const canvas = trendChartRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const expenseData = last7Days.map(date =>
      records.value
        .filter(r => r.date === date && r.type === 'expense')
        .reduce((sum, r) => sum + r.amount, 0)
    );

    const incomeData = last7Days.map(date =>
      records.value
        .filter(r => r.date === date && r.type === 'income')
        .reduce((sum, r) => sum + r.amount, 0)
    );

    const maxValue = Math.max(...expenseData, ...incomeData, 100);
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(canvas.width - padding.right, y);
      ctx.stroke();
    }

    const drawLine = (data, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      data.forEach((value, index) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * index;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawLine(expenseData, '#FF6B6B');
    drawLine(incomeData, '#4ECDC4');

    ctx.fillStyle = '#666';
    ctx.font = '12px "Noto Sans SC"';
    ctx.textAlign = 'center';
    last7Days.forEach((date, index) => {
      const x = padding.left + (chartWidth / (last7Days.length - 1)) * index;
      const d = new Date(date);
      ctx.fillText(`${d.getMonth() + 1}/${d.getDate()}`, x, canvas.height - 10);
    });
  };

  watch([viewMode, expenseChart], () => {
    nextTick(() => {
      drawPieChart();
    });
  });

  watch(
    records,
    () => {
      nextTick(() => {
        drawTrendChart();
      });
    },
    { deep: true }
  );

  onMounted(() => {
    loadRecords();
    nextTick(() => {
      drawPieChart();
      drawTrendChart();
    });
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

  /* Form */
  .add-form {
    padding: 1.5rem;
    border-bottom: 4px solid #111;
  }

  .type-toggle {
    display: flex;
    gap: 0;
    margin-bottom: 1rem;
  }
  .type-toggle button {
    flex: 1;
    padding: 0.75rem;
    border: 3px solid #111;
    background: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.1s;
  }
  .type-toggle button:first-child {
    border-radius: 0;
  }
  .type-toggle button.active {
    background: #ff4b4b;
    color: #fff;
  }
  .type-toggle button:last-child.active {
    background: #00e572;
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
  .brutal-select.small {
    flex: 0 0 auto;
    min-width: 140px;
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
  .summary-card.income {
    background: #d4f8d4;
  }
  .summary-card.expense {
    background: #ffd4d4;
  }
  .summary-card.balance {
    background: #fff4d4;
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

  /* Records List */
  .records-list {
    padding: 1rem 1.5rem;
    flex: 1;
    overflow-y: auto;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .clear-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    padding: 0.35rem 0.75rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .clear-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .record-items {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .record-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 3px solid #eee;
  }

  .record-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border: 3px solid #111;
    font-size: 1.2rem;
  }

  .record-info {
    flex: 1;
  }
  .record-category {
    font-weight: 800;
    font-size: 0.95rem;
  }
  .record-note {
    font-size: 0.85rem;
    color: #666;
  }
  .record-date {
    font-size: 0.75rem;
    color: #999;
  }

  .record-amount {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .record-amount.expense {
    color: #ff4b4b;
  }
  .record-amount.income {
    color: #00c853;
  }

  .del-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
    cursor: pointer;
    font-weight: 800;
    padding: 0.25rem 0.5rem;
    transition: all 0.1s;
  }
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

  /* Chart View */
  .chart-view {
    padding: 1.5rem;
  }

  .chart-section h3 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', sans-serif;
  }

  .pie-chart {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .chart-legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
  .legend-percent {
    width: 50px;
    text-align: right;
    color: #666;
  }

  /* Side Pane */
  .quick-categories {
    padding: 1rem;
  }

  .cat-section {
    margin-bottom: 1rem;
  }

  .cat-title {
    font-weight: 800;
    margin-bottom: 0.5rem;
    font-family: 'Syne', sans-serif;
  }

  .cat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .cat-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-align: center;
  }
  .cat-btn.income {
    background: #d4f8d4;
  }
  .cat-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .cat-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #111;
  }

  .trend-chart {
    padding: 1rem;
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
  [data-theme='dark'] .cat-btn {
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
  }
  [data-theme='dark'] .summary-card.income {
    background: #1a4a1a;
  }
  [data-theme='dark'] .summary-card.expense {
    background: #4a1a1a;
  }
  [data-theme='dark'] .summary-card.balance {
    background: #4a3a1a;
  }
  [data-theme='dark'] .record-item {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .record-icon {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .record-amount.expense {
    color: #ff6b6b;
  }
  [data-theme='dark'] .record-amount.income {
    color: #4ecdc4;
  }
  [data-theme='dark'] .del-btn {
    background: #cc0000;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .clear-btn {
    background: #cc0000;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .cat-btn {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .cat-btn.income {
    background: #1a4a1a;
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
  [data-theme='dark'] .type-toggle button {
    border-color: #eee;
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .type-toggle button.active {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .type-toggle button:last-child.active {
    background: #00994c;
  }
</style>
