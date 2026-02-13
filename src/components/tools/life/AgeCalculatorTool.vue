<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">精确年龄计算器</h1>
        <span class="tool-subtitle">Age Calculator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Timer" @click="resetToNow">重置为现在</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-column">
          <section class="config-section glass-card">
            <div class="input-grid">
              <div class="input-item">
                <div class="item-header">
                  <el-icon class="icon-birth"><Calendar /></el-icon>
                  <span>出生日期与时间</span>
                </div>
                <el-date-picker
                  v-model="birthDate"
                  type="datetime"
                  placeholder="选择出生日期时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  @change="calculateAge"
                />
              </div>
              <div class="input-item">
                <div class="item-header">
                  <el-icon class="icon-target"><Clock /></el-icon>
                  <span>计算基准时间</span>
                </div>
                <el-date-picker
                  v-model="targetDate"
                  type="datetime"
                  placeholder="选择基准日期时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                  @change="calculateAge"
                />
              </div>
            </div>
          </section>

          <div v-if="ageResult" class="results-grid">
            <div class="summary-cards">
              <div class="summary-card years">
                <div class="card-bg"></div>
                <div class="card-content">
                  <span class="val">{{ ageResult.years }}</span>
                  <span class="lab">周岁 (Years)</span>
                </div>
              </div>
              <div class="summary-card months">
                <div class="card-bg"></div>
                <div class="card-content">
                  <span class="val">{{ ageResult.months }}</span>
                  <span class="lab">个月 (Months)</span>
                </div>
              </div>
              <div class="summary-card days">
                <div class="card-bg"></div>
                <div class="card-content">
                  <span class="val">{{ ageResult.days }}</span>
                  <span class="lab">天 (Days)</span>
                </div>
              </div>
            </div>

            <section class="metrics-section glass-card">
              <div class="section-title">
                <el-icon><DataLine /></el-icon>
                <span>累计生存时间统计</span>
              </div>
              <div class="stat-grid">
                <div class="stat-box">
                  <div class="stat-val">{{ formatNumber(totalStats.months) }}</div>
                  <div class="stat-lab">月 (Total Months)</div>
                </div>
                <div class="stat-box">
                  <div class="stat-val">{{ formatNumber(totalStats.weeks) }}</div>
                  <div class="stat-lab">周 (Total Weeks)</div>
                </div>
                <div class="stat-box">
                  <div class="stat-val">{{ formatNumber(totalStats.days) }}</div>
                  <div class="stat-lab">日 (Total Days)</div>
                </div>
                <div class="stat-box">
                  <div class="stat-val">{{ formatNumber(totalStats.hours) }}</div>
                  <div class="stat-lab">时 (Total Hours)</div>
                </div>
                <div class="stat-box">
                  <div class="stat-val">{{ formatNumber(totalStats.minutes) }}</div>
                  <div class="stat-lab">分 (Total Minutes)</div>
                </div>
                <div class="stat-box">
                  <div class="stat-val">{{ formatNumber(totalStats.seconds) }}</div>
                  <div class="stat-lab">秒 (Total Seconds)</div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside class="side-column">
          <div v-if="astrology" class="astro-card glass-card">
            <div class="card-header">
              <el-icon><Star /></el-icon>
              <span>传统文化与占星</span>
            </div>
            <div class="astro-grid">
              <div class="astro-item">
                <div class="ai-label">生肖</div>
                <div class="ai-value">{{ astrology.zodiac }}</div>
              </div>
              <div class="astro-item">
                <div class="ai-label">星座</div>
                <div class="ai-value">{{ astrology.constellation }}</div>
              </div>
              <div class="astro-item">
                <div class="ai-label">干支</div>
                <div class="ai-value">{{ astrology.ganzhi }}</div>
              </div>
              <div class="astro-item highlight">
                <div class="ai-label">虚岁</div>
                <div class="ai-value">{{ ageResult ? ageResult.years + 1 : '-' }} 岁</div>
              </div>
            </div>
          </div>

          <div v-if="nextBirthday" class="countdown-card glass-card">
            <div class="card-header">
              <el-icon><Present /></el-icon>
              <span>生日倒计时</span>
            </div>
            <div class="countdown-body">
              <div class="days-pill">
                <span class="num">{{ nextBirthday.days }}</span>
                <span class="unit">天后</span>
              </div>
              <p class="desc">
                迎来 <b>{{ ageResult ? ageResult.years + 1 : '-' }} 岁</b> 生日
              </p>
              <div class="target-date">日期: {{ nextBirthday.date }}</div>
            </div>
          </div>

          <div class="tips-card glass-card">
            <div class="card-header">
              <el-icon><InfoFilled /></el-icon>
              <span>计算说明</span>
            </div>
            <ul class="premium-list">
              <li><b>周岁</b>：按照 国际标准 计算。出生时为 0 岁，每过一个公历生日增加一岁。</li>
              <li>
                <b>虚岁</b>：中国传统 计算方法。出生时即为 1 岁，每过一个农历春节（初一）增加一岁。
              </li>
              <li><b>统计精度</b>：总时长计算基于公历，已自动考虑平闰年差异。</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 精确年龄计算器</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    ArrowLeft,
    Timer,
    InfoFilled,
    Calendar,
    Clock,
    DataLine,
    Star,
    Present
  } from '@element-plus/icons-vue';
  import dayjs from 'dayjs';
  import duration from 'dayjs/plugin/duration';
  import { Solar } from 'lunar-javascript';

  dayjs.extend(duration);

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const birthDate = ref(dayjs('1995-10-10 10:00:00').toDate());
  const targetDate = ref(new Date());
  const ageResult = ref(null);
  const totalStats = reactive({
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const astrology = ref(null);
  const nextBirthday = ref(null);
  let ticker = null;

  const resetToNow = () => {
    targetDate.value = new Date();
    calculateAge();
  };

  const calculateAge = () => {
    if (!birthDate.value || !targetDate.value) return;

    const start = dayjs(birthDate.value);
    const end = dayjs(targetDate.value);

    if (end.isBefore(start)) {
      ageResult.value = null;
      return;
    }

    // 1. 周岁计算
    const diff = end.diff(start);
    const dur = dayjs.duration(diff);

    ageResult.value = {
      years: dur.years(),
      months: dur.months(),
      days: dur.days()
    };

    // 2. 总时长统计
    totalStats.months = end.diff(start, 'month');
    totalStats.weeks = end.diff(start, 'week');
    totalStats.days = end.diff(start, 'day');
    totalStats.hours = end.diff(start, 'hour');
    totalStats.minutes = end.diff(start, 'minute');
    totalStats.seconds = end.diff(start, 'second');

    // 3. 传统占星
    const solar = Solar.fromDate(birthDate.value);
    const lunar = solar.getLunar();
    astrology.value = {
      zodiac: lunar.getYearShengXiao(),
      constellation: solar.getXingZuo() + '座',
      ganzhi: lunar.getYearInGanZhi() + '年'
    };

    // 4. 生日倒计时
    const thisYearBirthday = dayjs(birthDate.value).year(end.year());
    let nextBday = thisYearBirthday;
    if (thisYearBirthday.isBefore(end)) {
      nextBday = thisYearBirthday.add(1, 'year');
    }
    nextBirthday.value = {
      days: nextBday.diff(end, 'day'),
      date: nextBday.format('YYYY-MM-DD')
    };
  };

  const formatNumber = num => {
    return num.toLocaleString();
  };

  onMounted(() => {
    calculateAge();
    ticker = setInterval(() => {
      if (dayjs(targetDate.value).diff(dayjs(), 'second') === 0) {
        targetDate.value = new Date();
        calculateAge();
      }
    }, 1000);
  });

  onUnmounted(() => {
    if (ticker) clearInterval(ticker);
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .tool-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: uppercase;
    display: block;
  }
  .header-center {
    text-align: center;
  }

  .tool-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
  }

  .main-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 1);
    border-radius: 20px;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.05),
      0 4px 6px -2px rgba(0, 0, 0, 0.02);
  }

  /* Config Section */
  .config-section {
    padding: 1.5rem;
  }

  .input-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .item-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    color: #475569;
    font-weight: 600;
  }

  .icon-birth {
    color: #f43f5e;
  }
  .icon-target {
    color: #3b82f6;
  }

  /* Summary Cards */
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .summary-card {
    position: relative;
    height: 160px;
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .summary-card:hover {
    transform: translateY(-5px);
  }

  .summary-card.years {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
  }
  .summary-card.months {
    background: linear-gradient(135deg, #10b981, #059669);
  }
  .summary-card.days {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  }

  .card-bg {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    pointer-events: none;
  }

  .card-content {
    color: white;
    text-align: center;
    z-index: 1;
  }

  .card-content .val {
    display: block;
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
  }

  .card-content .lab {
    font-size: 0.9rem;
    opacity: 0.9;
    font-weight: 500;
  }

  /* Metrics Section */
  .metrics-section {
    padding: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1.25rem;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-box {
    background: white;
    padding: 1.25rem;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    transition: all 0.2s;
  }

  .stat-box:hover {
    border-color: #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .stat-val {
    font-size: 1.3rem;
    font-weight: 700;
    color: #0f172a;
    font-family: 'JetBrains Mono', monospace;
  }

  .stat-lab {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 4px;
    font-weight: 500;
  }

  /* Sidebar Columns */
  .side-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-weight: 700;
    color: #1e293b;
    font-size: 1rem;
    padding: 1.25rem 1.25rem 0.75rem;
  }

  /* Astro Card */
  .astro-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 0.5rem 1.25rem 1.25rem;
  }

  .astro-item {
    background: #f8fafc;
    padding: 0.75rem;
    border-radius: 12px;
  }

  .astro-item.highlight {
    background: #fff1f2;
  }
  .astro-item.highlight .ai-value {
    color: #e11d48;
  }

  .ai-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
  }
  .ai-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #334155;
    margin-top: 2px;
  }

  /* Countdown Card */
  .countdown-body {
    padding: 0.5rem 1.25rem 1.25rem;
    text-align: center;
  }

  .days-pill {
    background: #eff6ff;
    display: inline-flex;
    flex-direction: column;
    width: 100%;
    padding: 1.5rem 1rem;
    border-radius: 16px;
    color: #1d4ed8;
    margin-bottom: 1rem;
  }

  .days-pill .num {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1;
  }

  .days-pill .unit {
    font-size: 1rem;
    font-weight: 700;
  }

  .desc {
    font-size: 0.95rem;
    color: #475569;
    margin-bottom: 0.5rem;
  }
  .desc b {
    color: #1e293b;
  }
  .target-date {
    font-size: 0.8rem;
    color: #94a3b8;
    font-family: monospace;
  }

  /* Tips Card */
  .tips-card {
    padding-bottom: 1.25rem;
  }

  .premium-list {
    list-style: none;
    padding: 0 1.25rem;
    margin: 0;
  }

  .premium-list li {
    font-size: 0.8rem;
    color: #64748b;
    position: relative;
    padding-left: 1rem;
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }

  .premium-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 5px;
    height: 5px;
    background: #cbd5e1;
    border-radius: 50%;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }

  @media (max-width: 900px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
    .input-grid {
      grid-template-columns: 1fr;
    }
    .summary-cards {
      grid-template-columns: 1fr;
    }
    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
