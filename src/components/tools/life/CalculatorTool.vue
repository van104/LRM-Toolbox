<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">科学<span>.计算器()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearAll">AC</button>
      </header>

      <div class="brutal-grid calc-layout">
        <div class="brutal-pane calc-body">
          <div class="pane-header bg-dark">
            <span class="text-white">计算面板</span>
            <div class="pane-actions">
              <button :class="{ active: isScientific }" @click="toggleMode">
                {{ isScientific ? 'Sci ✓' : 'Sci' }}
              </button>
            </div>
          </div>

          <!-- Display -->
          <div class="display-screen">
            <div class="history-line">{{ historyStr }}</div>
            <div class="current-line" :class="{ small: currentVal.length > 10 }">
              {{ currentVal || '0' }}
            </div>
          </div>

          <!-- Memory Row -->
          <div class="key-row mem-row">
            <button class="brutal-key fn" @click="handleMem('MC')">MC</button>
            <button class="brutal-key fn" @click="handleMem('MR')">MR</button>
            <button class="brutal-key fn" @click="handleMem('M+')">M+</button>
            <button class="brutal-key fn" @click="handleMem('M-')">M-</button>
          </div>

          <!-- Scientific Keys -->
          <div v-if="isScientific" class="scientific-keys">
            <button class="brutal-key sci" @click="op('sin')">sin</button>
            <button class="brutal-key sci" @click="op('cos')">cos</button>
            <button class="brutal-key sci" @click="op('tan')">tan</button>
            <button class="brutal-key sci" @click="op('log')">log</button>
            <button class="brutal-key sci" @click="op('ln')">ln</button>
            <button class="brutal-key sci" @click="op('sqrt')">√</button>
            <button class="brutal-key sci" @click="op('pow')">x^y</button>
            <button class="brutal-key sci" @click="op('pi')">π</button>
            <button class="brutal-key sci" @click="op('e')">e</button>
            <button class="brutal-key sci" @click="op('(')">(</button>
            <button class="brutal-key sci" @click="op(')')">)</button>
          </div>

          <!-- Main Keys -->
          <div class="main-keys">
            <button class="brutal-key action" @click="clearAll">AC</button>
            <button class="brutal-key action" @click="backspace">⌫</button>
            <button class="brutal-key action" @click="op('%')">%</button>
            <button class="brutal-key operator" @click="op('/')">÷</button>

            <button class="brutal-key num" @click="append('7')">7</button>
            <button class="brutal-key num" @click="append('8')">8</button>
            <button class="brutal-key num" @click="append('9')">9</button>
            <button class="brutal-key operator" @click="op('*')">×</button>

            <button class="brutal-key num" @click="append('4')">4</button>
            <button class="brutal-key num" @click="append('5')">5</button>
            <button class="brutal-key num" @click="append('6')">6</button>
            <button class="brutal-key operator" @click="op('-')">-</button>

            <button class="brutal-key num" @click="append('1')">1</button>
            <button class="brutal-key num" @click="append('2')">2</button>
            <button class="brutal-key num" @click="append('3')">3</button>
            <button class="brutal-key operator" @click="op('+')">+</button>

            <button class="brutal-key num zero" @click="append('0')">0</button>
            <button class="brutal-key num" @click="append('.')">.</button>
            <button class="brutal-key equals" @click="calculate">=</button>
          </div>
        </div>

        <div class="brutal-pane history-pane">
          <div class="pane-header bg-yellow">
            <span>计算历史</span>
            <div class="pane-actions">
              <button v-if="historyList.length" @click="historyList = []">清空</button>
            </div>
          </div>
          <div class="history-body">
            <ul class="history-list">
              <li v-for="(rec, i) in historyList" :key="i">
                <span class="expr">{{ rec.expr }}</span>
                <span class="eq">=</span>
                <span class="res" @click="currentVal = rec.res">{{ rec.res }}</span>
              </li>
              <li v-if="historyList.length === 0" class="empty">暂无记录</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 科学计算器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { ElMessage } from 'element-plus';

  const currentVal = ref('');
  const historyStr = ref('');
  const isScientific = ref(false);
  const memory = ref(0);
  const historyList = ref([]);

  const clearAll = () => {
    currentVal.value = '';
    historyStr.value = '';
  };

  const backspace = () => {
    currentVal.value = currentVal.value.slice(0, -1);
  };

  const append = char => {
    if (char === '.' && currentVal.value.includes('.')) return;
    if (currentVal.value === '0' && char !== '.') currentVal.value = char;
    else currentVal.value += char;
  };

  const op = operator => {
    if (operator === 'pi') {
      currentVal.value = Math.PI.toFixed(8);
      return;
    }
    if (operator === 'e') {
      currentVal.value = Math.E.toFixed(8);
      return;
    }

    if (currentVal.value) {
      historyStr.value += currentVal.value + ' ' + operator + ' ';
      currentVal.value = '';
    } else if (historyStr.value && ['+', '-', '*', '/'].includes(operator)) {
      historyStr.value += operator + ' ';
    } else {
      historyStr.value += operator + ' ';
    }
  };

  const calculate = () => {
    let expr = historyStr.value + currentVal.value;

    expr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/\^/g, '**');

    expr = expr.replace(/(\d+)%/g, '($1/100)');

    try {
      const res = new Function('return ' + expr)();

      let finalRes = parseFloat(res.toPrecision(12));

      finalRes = finalRes.toString();

      historyList.value.unshift({ expr: historyStr.value + currentVal.value, res: finalRes });
      if (historyList.value.length > 10) historyList.value.pop();

      currentVal.value = finalRes;
      historyStr.value = '';
    } catch {
      ElMessage.error('表达式错误');
    }
  };

  const toggleMode = () => (isScientific.value = !isScientific.value);

  const handleMem = action => {
    const val = parseFloat(currentVal.value) || 0;
    switch (action) {
      case 'MC':
        memory.value = 0;
        ElMessage.info('Memory Cleared');
        break;
      case 'MR':
        currentVal.value = memory.value.toString();
        break;
      case 'M+':
        memory.value += val;
        ElMessage.success('M+');
        break;
      case 'M-':
        memory.value -= val;
        ElMessage.success('M-');
        break;
    }
  };

  const handleKeydown = e => {
    const key = e.key;
    if (/\d/.test(key)) append(key);
    if (['+', '-', '*', '/'].includes(key)) op(key);
    if (key === 'Enter' || key === '=') calculate();
    if (key === 'Backspace') backspace();
    if (key === 'Escape') clearAll();
    if (key === '.') append('.');
  };

  onMounted(() => window.addEventListener('keydown', handleKeydown));
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown));
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
    max-width: 900px;
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

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  /* Grid Layout */
  .calc-layout {
    display: grid;
    grid-template-columns: 1fr 300px;
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
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.75rem;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .pane-actions button.active {
    background: #00e572;
    box-shadow: 0px 0px 0px #111;
    transform: translate(2px, 2px);
  }

  .pane-actions button:hover:not(.active) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Display */
  .display-screen {
    background: #111;
    color: #fff;
    text-align: right;
    padding: 1.5rem;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    word-break: break-all;
    border-bottom: 4px solid #111;
  }

  .history-line {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    color: #888;
    min-height: 1.5rem;
  }

  .current-line {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.1;
    color: #ffd900;
  }

  .current-line.small {
    font-size: 2rem;
  }

  /* Keys */
  .key-row,
  .mem-row {
    display: flex;
    gap: 0;
  }

  .brutal-key {
    flex: 1;
    height: 60px;
    border: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.08s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -1.5px;
  }

  .brutal-key:active {
    transform: translate(2px, 2px);
    box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.3);
  }

  .brutal-key.num {
    background: #fff;
    color: #111;
  }

  .brutal-key.num:hover {
    background: #fdfae5;
  }

  .brutal-key.num.zero {
    flex: 2;
  }

  .brutal-key.fn {
    background: #e5e5e5;
    color: #111;
    font-size: 1rem;
  }

  .brutal-key.fn:hover {
    background: #ddd;
  }

  .brutal-key.operator {
    background: #ffd900;
    color: #111;
    font-size: 1.5rem;
  }

  .brutal-key.operator:hover {
    background: #ffeba0;
  }

  .brutal-key.equals {
    background: #00e572;
    color: #111;
    font-size: 1.5rem;
  }

  .brutal-key.equals:hover {
    background: #81e6b3;
  }

  .brutal-key.action {
    background: #ff9fb2;
    color: #111;
  }

  .brutal-key.action:hover {
    background: #ff4b4b;
    color: #fff;
  }

  .scientific-keys {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
  }

  .brutal-key.sci {
    background: #89b4f8;
    color: #111;
    height: 45px;
    font-size: 0.95rem;
  }

  .brutal-key.sci:hover {
    background: #4b7bff;
    color: #fff;
  }

  .main-keys {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .brutal-key.zero {
    grid-column: span 2;
  }

  /* History Pane */
  .history-pane {
    align-self: flex-start;
  }

  .history-body {
    padding: 1rem;
    flex: 1;
  }

  .history-list {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 500px;
    overflow-y: auto;
  }

  .history-list li {
    display: flex;
    justify-content: space-between;
    padding: 0.6rem 0;
    border-bottom: 3px solid #eee;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    align-items: center;
  }

  .history-list li.empty {
    justify-content: center;
    color: #888;
    font-weight: 600;
  }

  .expr {
    color: #555;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .eq {
    margin: 0 0.5rem;
    color: #888;
    font-weight: 800;
  }

  .res {
    color: #4b7bff;
    cursor: pointer;
    font-weight: 700;
    border: 2px solid transparent;
    padding: 0.15rem 0.4rem;
    transition: all 0.1s;
  }

  .res:hover {
    border-color: #111;
    background: #ffd900;
    color: #111;
  }

  /* Status Bar */
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

  .brutal-status.info {
    background: #fff;
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

  /* Responsive */
  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .calc-layout {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
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

  [data-theme='dark'] .display-screen {
    background: #000;
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .current-line {
    color: #ffd900;
  }

  [data-theme='dark'] .brutal-key {
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-key.num {
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .brutal-key.num:hover {
    background: #333;
  }

  [data-theme='dark'] .brutal-key.fn {
    background: #333;
    color: #eee;
  }
  [data-theme='dark'] .brutal-key.fn:hover {
    background: #444;
  }

  [data-theme='dark'] .brutal-key.operator {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-key.operator:hover {
    background: #a98d36;
  }

  [data-theme='dark'] .brutal-key.equals {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-key.equals:hover {
    background: #3c9165;
  }

  [data-theme='dark'] .brutal-key.action {
    background: #b25465;
    color: #fff;
  }
  [data-theme='dark'] .brutal-key.action:hover {
    background: #cc0000;
  }

  [data-theme='dark'] .brutal-key.sci {
    background: #405d9e;
    color: #fff;
  }
  [data-theme='dark'] .brutal-key.sci:hover {
    background: #2a4eb2;
  }

  [data-theme='dark'] .history-list li {
    border-bottom-color: #333;
  }

  [data-theme='dark'] .expr {
    color: #aaa;
  }

  [data-theme='dark'] .res {
    color: #89b4f8;
  }
  [data-theme='dark'] .res:hover {
    background: #b28f00;
    border-color: #eee;
    color: #fff;
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

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
</style>
