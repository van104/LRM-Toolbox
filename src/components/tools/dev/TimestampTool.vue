<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">时间戳<span>.转换()</span></h1>
        <button class="brutal-btn clear-btn" @click="getCurrentTime">● 刷新当前</button>
      </header>

      <!-- Current Time Section -->
      <div class="brutal-pane current-time-pane" style="margin-bottom: 3rem">
        <div class="pane-header bg-yellow">
          <span>系统.当前时间</span>
        </div>
        <div class="current-time-content">
          <div class="time-main">{{ nowStr }}</div>
          <div class="time-sub">
            <div class="ts-badge">
              <span>Unix (秒):</span>
              <strong>{{ nowUnix }}</strong>
              <button class="brutal-action-btn small" @click="handleCopy(nowUnix)">复制</button>
            </div>
            <div class="ts-badge">
              <span>Unix (毫秒):</span>
              <strong>{{ nowUnixMs }}</strong>
              <button class="brutal-action-btn small" @click="handleCopy(nowUnixMs)">复制</button>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-grid">
        <!-- Timestamp to Date -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">时间戳 -> 日期</span>
          </div>
          <div class="converter-body">
            <div class="input-row">
              <input
                v-model="tsInput"
                class="brutal-input flex-1"
                placeholder="输入整数时间戳..."
                @input="convertTsToDate"
              />
              <select v-model="tsUnit" class="brutal-select" @change="convertTsToDate">
                <option value="s">秒 (s)</option>
                <option value="ms">毫秒 (ms)</option>
              </select>
            </div>

            <div class="result-box mt-4">
              <div class="result-row">
                <span class="label">北京时间:</span>
                <span class="val">{{ tsToDateResult || '等待输入...' }}</span>
                <button
                  v-if="tsToDateResult && tsToDateResult !== '无效的时间戳'"
                  class="brutal-action-btn small"
                  @click="handleCopy(tsToDateResult)"
                >
                  复制
                </button>
              </div>
              <div class="result-row">
                <span class="label">ISO 8601:</span>
                <span class="val">{{ tsToIsoResult || '等待输入...' }}</span>
                <button
                  v-if="tsToIsoResult"
                  class="brutal-action-btn small"
                  @click="handleCopy(tsToIsoResult)"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Date to Timestamp -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>日期 -> 时间戳</span>
          </div>
          <div class="converter-body">
            <div class="input-row">
              <input
                v-model="dateInputLocal"
                type="datetime-local"
                class="brutal-input flex-1"
                step="1"
                @input="convertDateToTsLocal"
              />
            </div>

            <div class="result-box mt-4">
              <div class="result-row">
                <span class="label">Unix (秒):</span>
                <span class="val">{{ dateToTsResult || '等待输入...' }}</span>
                <button
                  v-if="dateToTsResult && dateToTsResult !== '无效的日期'"
                  class="brutal-action-btn small"
                  @click="handleCopy(dateToTsResult)"
                >
                  复制
                </button>
              </div>
              <div class="result-row">
                <span class="label">Unix (毫秒):</span>
                <span class="val">{{ dateToTsMsResult || '等待输入...' }}</span>
                <button
                  v-if="dateToTsMsResult"
                  class="brutal-action-btn small"
                  @click="handleCopy(dateToTsMsResult)"
                >
                  复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const { copyToClipboard } = useCopy();

  const nowStr = ref('');
  const nowUnix = ref(0);
  const nowUnixMs = ref(0);
  let timer = null;

  function updateTime() {
    const now = dayjs();
    nowStr.value = now.format('YYYY-MM-DD HH:mm:ss');
    nowUnix.value = now.unix();
    nowUnixMs.value = now.valueOf();
  }

  function getCurrentTime() {
    updateTime();
  }

  const tsInput = ref('');
  const tsUnit = ref('s');
  const tsToDateResult = ref('');
  const tsToIsoResult = ref('');

  function convertTsToDate() {
    if (!tsInput.value) {
      tsToDateResult.value = '';
      tsToIsoResult.value = '';
      return;
    }

    const ts = parseInt(tsInput.value);
    if (isNaN(ts)) {
      tsToDateResult.value = '无效的时间戳';
      tsToIsoResult.value = '';
      return;
    }

    let date;
    if (tsUnit.value === 's') {
      date = dayjs.unix(ts);
    } else {
      date = dayjs(ts);
    }

    if (!date.isValid()) {
      tsToDateResult.value = '无效的时间戳';
      tsToIsoResult.value = '';
      return;
    }

    tsToDateResult.value = date.format('YYYY-MM-DD HH:mm:ss');
    tsToIsoResult.value = date.toISOString();
  }

  const dateInputLocal = ref('');
  const dateToTsResult = ref('');
  const dateToTsMsResult = ref('');

  function convertDateToTsLocal() {
    if (!dateInputLocal.value) {
      dateToTsResult.value = '';
      dateToTsMsResult.value = '';
      return;
    }

    const date = dayjs(dateInputLocal.value);
    if (!date.isValid()) {
      dateToTsResult.value = '无效的日期';
      dateToTsMsResult.value = '';
      return;
    }
    dateToTsResult.value = date.unix();
    dateToTsMsResult.value = date.valueOf();
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function handleCopy(text) {
    if (!text || text === '无效的时间戳' || text === '无效的日期') return;
    copyToClipboard(text.toString(), { success: '已安全复制到剪贴板' });
  }

  onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);

    tsInput.value = dayjs().unix().toString();
    convertTsToDate();
    dateInputLocal.value = dayjs().format('YYYY-MM-DDTHH:mm:ss');
    convertDateToTsLocal();
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Orbitron:wght@700&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
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

  .brutal-btn.clear-btn {
    background: #00e572;
    color: #111;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .brutal-action-btn.small {
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
    border-width: 2px;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }

  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .current-time-pane {
    background: #fff;
    overflow: hidden;
  }

  .current-time-content {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(45deg, #ffffff, #ffffff 10px, #f8fafc 10px, #f8fafc 20px);
  }

  .time-main {
    font-family: 'Orbitron', monospace;
    font-size: 5rem;
    font-weight: 700;
    text-shadow:
      6px 6px 0px #ffd900,
      10px 10px 0px #111;
    margin-bottom: 2rem;
    letter-spacing: -2px;
    text-align: center;
  }

  .time-sub {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .ts-badge {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.8rem 1.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    box-shadow: 6px 6px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .converter-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .input-row {
    display: flex;
    gap: 1rem;
    align-items: stretch;
  }

  .brutal-input {
    flex: 1;
    border: 4px solid #111;
    padding: 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.25rem;
    font-weight: 600;
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
  }

  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-select {
    border: 4px solid #111;
    padding: 0 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    background: #ffd900;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    outline: none;
  }

  .result-box {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: #fdfae5;
    border: 3px solid #111;
    padding: 1.5rem;
    box-shadow: 6px 6px 0px #111;
  }

  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 2px dashed #111;
    padding-bottom: 0.5rem;
  }

  .result-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .result-row .label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    min-width: 100px;
  }

  .result-row .val {
    flex: 1;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: right;
    word-break: break-all;
  }

  .mt-4 {
    margin-top: 2rem;
  }
  .flex-1 {
    flex: 1;
  }

  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .time-main {
      font-size: 3rem;
      text-shadow:
        3px 3px 0px #ffd900,
        6px 6px 0px #111;
    }
    .time-sub {
      flex-direction: column;
      gap: 1rem;
    }
    .ts-badge {
      justify-content: space-between;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .input-row {
      flex-direction: column;
    }
  }

  /* Dark Mode Overrides */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .result-box,
  [data-theme='dark'] .ts-badge {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .current-time-content {
    background: repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #222 10px, #222 20px);
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .ts-badge,
  [data-theme='dark'] .result-box {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover,
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn.small {
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .time-main {
    text-shadow:
      6px 6px 0px #b28f00,
      10px 10px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .result-row {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .brutal-select {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
  }

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  @media (max-width: 1024px) {
    [data-theme='dark'] .time-main {
      text-shadow:
        3px 3px 0px #b28f00,
        6px 6px 0px #eee;
    }
  }

  /* Ensure datetime picker works decently in brutal format */
  ::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
  [data-theme='dark'] ::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
</style>
