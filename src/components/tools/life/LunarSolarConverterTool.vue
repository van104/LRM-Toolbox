<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">万年<span>.历转换()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <!-- Mode Switch -->
      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            class="brutal-action-btn"
            :class="{ primary: mode === 'solarToLunar' }"
            @click="mode = 'solarToLunar'"
          >
            ☀️ 公历 转 农历
          </button>
          <button
            class="brutal-action-btn"
            :class="{ primary: mode === 'lunarToSolar' }"
            @click="mode = 'lunarToSolar'"
          >
            🌙 农历 转 公历
          </button>
        </div>
      </div>

      <!-- Input Section -->
      <div class="brutal-pane input-pane">
        <div class="pane-header bg-yellow">
          <span>{{ mode === 'solarToLunar' ? '☀️ 选择公历日期' : '🌙 选择农历日期' }}</span>
        </div>
        <div class="input-body">
          <div v-if="mode === 'solarToLunar'" class="solar-input">
            <input
              v-model="solarInputStr"
              type="date"
              class="brutal-input full"
              @change="handleSolarChange"
            />
          </div>
          <div v-else class="lunar-input-group">
            <select v-model="lunarYear" class="brutal-select" @change="handleLunarChange">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
            </select>
            <select v-model="lunarMonth" class="brutal-select" @change="handleLunarChange">
              <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
            </select>
            <select v-model="lunarDay" class="brutal-select" @change="handleLunarChange">
              <option v-for="d in 30" :key="d" :value="d">{{ getLunarDayName(d) }}</option>
            </select>
            <label class="leap-check">
              <input v-model="isLeapMonth" type="checkbox" @change="handleLunarChange" />
              <span>闰月</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="lunarObj" class="brutal-pane result-pane">
        <div class="pane-header bg-green">
          <span>📅 转换结果</span>
        </div>
        <div class="result-body">
          <div class="conversion-row">
            <div class="conv-col">
              <span class="conv-label">公历 (Solar)</span>
              <span class="conv-date">{{ solarDateStr }}</span>
              <span class="conv-sub">{{ solarWkStr }}</span>
            </div>
            <div class="conv-arrow">→</div>
            <div class="conv-col">
              <span class="conv-label">农历 (Lunar)</span>
              <span class="conv-date">{{ lunarDateStr }}</span>
              <span class="conv-sub"
                >{{ lunarObj.getYearInGanZhi() }}年 ({{ lunarObj.getYearShengXiao() }})</span
              >
            </div>
          </div>

          <div class="detail-grid">
            <div class="d-item">
              <span class="d-label">干支</span>
              <div class="ganzhi-box">
                <span>{{ lunarObj.getYearInGanZhi() }}年</span>
                <span>{{ lunarObj.getMonthInGanZhi() }}月</span>
                <span>{{ lunarObj.getDayInGanZhi() }}日</span>
              </div>
            </div>
            <div class="d-item">
              <span class="d-label">节气</span>
              <span class="d-value highlight">{{ lunarObj.getJieQi() || '无节气' }}</span>
            </div>
            <div class="d-item">
              <span class="d-label">星座</span>
              <span class="d-value">{{ solarObj.getXingZuo() }}座</span>
            </div>
            <div class="d-item">
              <span class="d-label">节日</span>
              <div class="festivals">
                <span v-for="f in festivals" :key="f" class="festival-tag">{{ f }}</span>
                <span v-if="festivals.length === 0" class="d-value">-</span>
              </div>
            </div>
          </div>

          <div class="yi-ji-section">
            <div class="yj-row">
              <div class="yj-icon yi">宜</div>
              <div class="yj-text">{{ formatList(lunarObj.getDayYi()) }}</div>
            </div>
            <div class="yj-row">
              <div class="yj-icon ji">忌</div>
              <div class="yj-text">{{ formatList(lunarObj.getDayJi()) }}</div>
            </div>
          </div>

          <div class="pengzu-line">
            彭祖百忌：{{ lunarObj.getPengZuGan() }} {{ lunarObj.getPengZuZhi() }}
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 农历阳历转换 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { Solar, Lunar } from 'lunar-javascript';

  const mode = ref('solarToLunar');
  const solarInputStr = ref(formatDateToStr(new Date()));

  function formatDateToStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const currentYear = new Date().getFullYear();
  const lunarYear = ref(currentYear);
  const lunarMonth = ref(new Date().getMonth() + 1);
  const lunarDay = ref(new Date().getDate());
  const isLeapMonth = ref(false);
  const yearOptions = Array.from({ length: 200 }, (_, i) => 1900 + i);

  const solarObj = ref(null);
  const lunarObj = ref(null);

  const getLunarDayName = d => {
    try {
      return Lunar.fromYmd(2000, 1, d).getDayInChinese();
    } catch {
      return d + '日';
    }
  };

  const updateObjects = () => {
    if (mode.value === 'solarToLunar') {
      const parts = solarInputStr.value.split('-');
      if (parts.length !== 3) return;
      const s = Solar.fromYmd(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      solarObj.value = s;
      lunarObj.value = s.getLunar();
      lunarYear.value = lunarObj.value.getYear();
      lunarMonth.value = lunarObj.value.getMonth();
      lunarDay.value = lunarObj.value.getDay();
    } else {
      try {
        let l = Lunar.fromYmd(lunarYear.value, lunarMonth.value, lunarDay.value);
        if (isLeapMonth.value) {
          const leapMonth = l.getLeapMonth();
          if (leapMonth === lunarMonth.value)
            l = Lunar.fromYmd(lunarYear.value, lunarMonth.value, lunarDay.value, true);
        }
        lunarObj.value = l;
        solarObj.value = l.getSolar();
        solarInputStr.value = `${solarObj.value.getYear()}-${String(solarObj.value.getMonth()).padStart(2, '0')}-${String(solarObj.value.getDay()).padStart(2, '0')}`;
      } catch (e) {
        console.error('Conversion Failed', e);
      }
    }
  };

  watch([solarInputStr, mode], () => {
    if (mode.value === 'solarToLunar') updateObjects();
  });

  const handleSolarChange = () => updateObjects();
  const handleLunarChange = () => {
    if (mode.value === 'lunarToSolar') updateObjects();
  };

  const solarDateStr = computed(() => {
    if (!solarObj.value) return '';
    return `${solarObj.value.getYear()}年${solarObj.value.getMonth()}月${solarObj.value.getDay()}日`;
  });
  const solarWkStr = computed(() => {
    if (!solarObj.value) return '';
    const wk = solarObj.value.getWeek();
    const arr = ['日', '一', '二', '三', '四', '五', '六'];
    return `星期${arr[wk]}`;
  });
  const lunarDateStr = computed(() => {
    if (!lunarObj.value) return '';
    return `${lunarObj.value.getMonthInChinese()}月${lunarObj.value.getDayInChinese()}`;
  });

  const festivals = computed(() => {
    if (!lunarObj.value || !solarObj.value) return [];
    const li = [];
    const lf = lunarObj.value.getFestivals();
    if (lf) lf.forEach(f => li.push(f));
    const sf = solarObj.value.getFestivals();
    if (sf) sf.forEach(f => li.push(f));
    return li;
  });

  const formatList = arr => {
    if (!arr || arr.length === 0) return '-';
    return arr.slice(0, 8).join(' ') + (arr.length > 8 ? '...' : '');
  };

  onMounted(() => updateObjects());
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 850px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
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

  .brutal-toolbar {
    display: flex;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem;
    box-shadow: 8px 8px 0px #111;
  }
  .tools-left {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
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
  .bg-green {
    background: #00e572;
  }

  .input-body {
    padding: 1.5rem;
    display: flex;
    justify-content: center;
  }
  .solar-input {
    width: 100%;
    max-width: 400px;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-input.full {
    width: 100%;
    box-sizing: border-box;
  }

  .lunar-input-group {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .brutal-select {
    border: 3px solid #111;
    padding: 0.6rem 0.8rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .leap-check {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 700;
    cursor: pointer;
  }
  .leap-check input {
    width: 18px;
    height: 18px;
    accent-color: #ff4b4b;
  }

  .result-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .conversion-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .conv-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .conv-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  .conv-date {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
  }
  .conv-sub {
    font-size: 0.9rem;
    color: #555;
    margin-top: 0.25rem;
    font-weight: 600;
  }
  .conv-arrow {
    font-size: 2rem;
    font-weight: 800;
    color: #111;
    padding: 0 1.5rem;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
    padding-top: 1.5rem;
    border-top: 3px solid #111;
  }
  .d-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.25rem;
  }
  .d-label {
    font-size: 0.8rem;
    color: #555;
    font-weight: 700;
  }
  .d-value {
    font-weight: 700;
    font-size: 0.95rem;
  }
  .d-value.highlight {
    color: #ff4b4b;
    font-weight: 800;
  }
  .ganzhi-box {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.4;
  }
  .festivals {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
  }
  .festival-tag {
    font-size: 0.75rem;
    color: #fff;
    background: #ff4b4b;
    padding: 2px 6px;
    font-weight: 700;
    border: 2px solid #111;
  }

  .yi-ji-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .yj-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }
  .yj-icon {
    width: 28px;
    height: 28px;
    color: white;
    font-size: 0.85rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 2px solid #111;
  }
  .yj-icon.yi {
    background: #00e572;
  }
  .yj-icon.ji {
    background: #ff4b4b;
  }
  .yj-text {
    font-size: 0.9rem;
    line-height: 1.5;
    font-weight: 600;
  }
  .pengzu-line {
    font-size: 0.85rem;
    color: #555;
    text-align: center;
    font-weight: 600;
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

  @media (max-width: 700px) {
    .brutal-title {
      font-size: 2rem;
    }
    .conversion-row {
      flex-direction: column;
      gap: 1rem;
    }
    .conv-arrow {
      transform: rotate(90deg);
      padding: 0.5rem 0;
    }
    .detail-grid {
      grid-template-columns: repeat(2, 1fr);
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
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-action-btn {
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
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .conv-label,
  [data-theme='dark'] .conv-sub,
  [data-theme='dark'] .d-label,
  [data-theme='dark'] .pengzu-line {
    color: #aaa;
  }
  [data-theme='dark'] .detail-grid {
    border-top-color: #eee;
  }
  [data-theme='dark'] .festival-tag {
    background: #cc0000;
    border-color: #eee;
  }
  [data-theme='dark'] .yi-ji-section {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .yj-icon {
    border-color: #eee;
  }
  [data-theme='dark'] .yj-icon.yi {
    background: #00994c;
  }
  [data-theme='dark'] .yj-icon.ji {
    background: #cc0000;
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
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .d-value.highlight {
    color: #ff9fb2;
  }
</style>
