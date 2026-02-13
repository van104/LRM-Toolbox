<template>
  <div class="water-intake-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>饮水记录系统</h1>
        <span class="nav-subtitle">Water Intake Tracker</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-grid">
        <aside class="side-panel glass-card">
          <h3 class="panel-title">身体设置</h3>
          <el-form :model="config" label-position="top">
            <el-form-item label="体重 (kg)">
              <el-input-number v-model="config.weight" :min="30" :max="200" style="width: 100%" />
            </el-form-item>
            <el-form-item label="活动强度">
              <el-select v-model="config.activityLevel" style="width: 100%">
                <el-option label="低强度 (久坐)" value="low" />
                <el-option label="中强度" value="med" />
                <el-option label="高强度" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item label="当前季节">
              <el-select v-model="config.season" style="width: 100%">
                <el-option label="春 / 秋 (温暖)" value="normal" />
                <el-option label="夏季 (炎热)" value="hot" />
                <el-option label="冬季 (寒冷)" value="cold" />
              </el-select>
            </el-form-item>
            <el-divider />
            <div class="goal-info">
              <p class="label">每日建议饮水量</p>
              <p class="value">{{ recommendedIntake }} ml</p>
            </div>
            <el-button type="primary" class="reset-btn" @click="resetProgress"
              >重置今日数据</el-button
            >
          </el-form>
        </aside>

        <section class="main-workspace glass-card">
          <div class="progress-section">
            <div class="water-bottle-visual">
              <div class="water" :style="{ height: progressPercent + '%' }">
                <span v-if="progressPercent > 10" class="percent-label"
                  >{{ Math.round(progressPercent) }}%</span
                >
              </div>
            </div>
            <div class="stats">
              <div class="stat-item">
                <span class="label">已饮用</span>
                <span class="value">{{ todayTotal }} <small>ml</small></span>
              </div>
              <div class="stat-item">
                <span class="label">剩余目标</span>
                <span class="value"
                  >{{ Math.max(0, recommendedIntake - todayTotal) }} <small>ml</small></span
                >
              </div>
            </div>
          </div>

          <div class="action-grid">
            <div
              v-for="amount in quickAddOptions"
              :key="amount"
              class="quick-add-card"
              @click="addWater(amount)"
            >
              <el-icon :size="24">
                <Coffee />
              </el-icon>
              <span class="amount">+{{ amount }}ml</span>
            </div>
            <div class="quick-add-card custom" @click="showCustomAdd = true">
              <el-icon :size="24">
                <Plus />
              </el-icon>
              <span class="amount">自定义</span>
            </div>
          </div>

          <div v-if="history.length" class="history-list">
            <h4 class="list-title">今日饮水记录</h4>
            <el-scrollbar max-height="200px">
              <div v-for="(record, idx) in history" :key="idx" class="history-item">
                <span class="time">{{ record.time }}</span>
                <span class="amt">{{ record.amount }} ml</span>
                <el-button type="danger" link :icon="Delete" @click="removeRecord(idx)"></el-button>
              </div>
            </el-scrollbar>
          </div>
        </section>
      </div>
    </main>

    <div class="disclaimer-wrap" style="padding: 0 1.5rem 2rem; text-align: center">
      <div
        class="disclaimer-card"
        style="
          display: inline-flex;
          gap: 0.8rem;
          padding: 1rem;
          background: #eff6ff;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.8rem;
          align-items: start;
          text-align: left;
          border: 1px solid #dbeafe;
        "
      >
        <el-icon style="margin-top: 2px">
          <InfoFilled />
        </el-icon>
        <span
          >饮水建议基于通用公式计算，具体需求量可能因气候、疾病、运动强度等因素而异。如有疑问请咨询专业营养师。</span
        >
      </div>
    </div>

    <el-dialog v-model="showCustomAdd" title="自定义饮水量" width="300px">
      <el-input-number v-model="customAmt" :min="10" :max="1000" :step="10" style="width: 100%" />
      <template #footer>
        <el-button @click="showCustomAdd = false">取消</el-button>
        <el-button type="primary" @click="handleCustomAdd">确认</el-button>
      </template>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 饮水记录系统</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { Back, Coffee, Plus, Delete, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const config = reactive({
    weight: 65,
    activityLevel: 'low',
    season: 'normal'
  });

  const todayTotal = ref(0);
  const history = ref([]);
  const showCustomAdd = ref(false);
  const customAmt = ref(200);

  const quickAddOptions = [100, 200, 300, 500];

  const recommendedIntake = computed(() => {
    let base = config.weight * 35;
    if (config.activityLevel === 'med') base += 500;
    if (config.activityLevel === 'high') base += 1000;

    // Season adjustment
    if (config.season === 'hot') base += 500;
    // Cold weather might increase need due to dry air or decrease, but generally we stick to base or slight increase for dry heat.
    // Usually standard advice: Drink more in hot weather.

    return base;
  });

  const progressPercent = computed(() => {
    return Math.min(100, (todayTotal.value / recommendedIntake.value) * 100);
  });

  const addWater = amt => {
    todayTotal.value += amt;
    history.value.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: amt
    });
    saveData();
    if (progressPercent.value >= 100 && todayTotal.value - amt < recommendedIntake.value) {
      ElMessage.success('干得漂亮！您已达成今日饮水目标 ✨');
    } else {
      ElMessage.success(`成功记录 ${amt}ml 补水`);
    }
  };

  const handleCustomAdd = () => {
    addWater(customAmt.value);
    showCustomAdd.value = false;
  };

  const removeRecord = idx => {
    const amt = history.value[idx].amount;
    todayTotal.value -= amt;
    history.value.splice(idx, 1);
    saveData();
  };

  const resetProgress = () => {
    todayTotal.value = 0;
    history.value = [];
    saveData();
    ElMessage.info('今日进度已重置');
  };

  const saveData = () => {
    const data = {
      total: todayTotal.value,
      history: history.value,
      config: config,
      date: new Date().toDateString()
    };
    localStorage.setItem('lrm-water-tracker', JSON.stringify(data));
  };

  onMounted(() => {
    const saved = localStorage.getItem('lrm-water-tracker');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toDateString()) {
        todayTotal.value = parsed.total || 0;
        history.value = parsed.history || [];
      }
      if (parsed.config) {
        Object.assign(config, parsed.config);
      }
    }
  });

  watch([() => config.weight, () => config.activityLevel, () => config.season], saveData);
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .water-intake-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --primary: #0ea5e9;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .panel-title {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  .goal-info {
    padding: 1.5rem;
    background: #f0f9ff;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .goal-info .label {
    font-size: 0.8rem;
    color: #0369a1;
    margin-bottom: 0.5rem;
  }

  .goal-info .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0ea5e9;
  }

  .reset-btn {
    width: 100%;
    border-radius: 10px;
  }

  .progress-section {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .water-bottle-visual {
    width: 100px;
    height: 200px;
    border: 3px solid #bae6fd;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    background: #fff;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .water {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(to top, #0ea5e9, #38bdf8);
    transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .percent-label {
    color: #fff;
    font-weight: 700;
    font-size: 1rem;
  }

  .stats {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-item .label {
    font-size: 0.9rem;
    color: var(--text-2);
    display: block;
  }

  .stat-item .value {
    font-size: 2rem;
    font-weight: 700;
  }

  .stat-item .value small {
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--text-2);
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .quick-add-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-add-card:hover {
    border-color: var(--primary);
    background: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
  }

  .quick-add-card .amount {
    margin-top: 0.5rem;
    font-weight: 600;
    color: var(--primary);
  }

  .list-title {
    font-size: 0.9rem;
    color: var(--text-2);
    margin-bottom: 1rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--bg);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  @media (max-width: 768px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }

    .progress-section {
      flex-direction: column;
      gap: 2rem;
    }
  }
</style>
