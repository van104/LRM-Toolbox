<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>电压电流功率换算</h1>
        <span class="nav-subtitle">Ohm's Law Power Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="selector-group">
          <label>计算目标:</label>
          <div class="tab-group">
            <button :class="{ active: target === 'P' }" @click="target = 'P'">功率 (P)</button>
            <button :class="{ active: target === 'U' }" @click="target = 'U'">电压 (U)</button>
            <button :class="{ active: target === 'I' }" @click="target = 'I'">电流 (I)</button>
          </div>
        </div>

        <div class="input-area animate-fade-in">
          <div v-if="target !== 'P'" class="input-group">
            <label>功率 (P)</label>
            <div class="input-wrapper">
              <input v-model.number="P" type="number" placeholder="输入数值" />
              <span class="unit">W</span>
            </div>
          </div>

          <div v-if="target !== 'U'" class="input-group">
            <label>电压 (U)</label>
            <div class="input-wrapper">
              <input v-model.number="U" type="number" placeholder="输入数值" />
              <span class="unit">V</span>
            </div>
          </div>

          <div v-if="target !== 'I'" class="input-group">
            <label>电流 (I)</label>
            <div class="input-wrapper">
              <input v-model.number="I" type="number" placeholder="输入数值" />
              <span class="unit">A</span>
            </div>
          </div>
        </div>

        <div class="action-bar">
          <button class="primary-btn" @click="calculate">计算</button>
          <button class="secondary-btn" @click="reset">重置</button>
        </div>

        <div v-if="result !== null" class="result-box animate-fade-in">
          <div class="result-label">计算结果 ({{ targetName }})</div>
          <div class="result-value">
            {{ format(result) }} <span class="unit-large">{{ targetUnit }}</span>
          </div>
          <div class="formula-display">公式: {{ formula }}</div>
        </div>
      </div>

      <div class="info-card">
        <h3>⚡ 公式说明</h3>
        <p>基于电功率公式 <b>P = U × I</b></p>
        <ul>
          <li><b>P</b>: 功率 (Watt, W)</li>
          <li><b>U</b>: 电压 (Volt, V)</li>
          <li><b>I</b>: 电流 (Ampere, A)</li>
        </ul>
        <p>适用于直流电路或纯电阻交流电路计算。</p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 电工工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const target = ref<'P' | 'U' | 'I'>('P');
  const P = ref<number | null>(null);
  const U = ref<number | null>(null);
  const I = ref<number | null>(null);
  const result = ref<number | null>(null);

  const targetName = computed(() => {
    const map = { P: '功率', U: '电压', I: '电流' };
    return map[target.value];
  });

  const targetUnit = computed(() => {
    const map = { P: 'W', U: 'V', I: 'A' };
    return map[target.value];
  });

  const formula = computed(() => {
    const map = {
      P: 'P = U × I',
      U: 'U = P / I',
      I: 'I = P / U'
    };
    return map[target.value];
  });

  const calculate = () => {
    result.value = null;
    if (target.value === 'P') {
      if (U.value !== null && I.value !== null) {
        result.value = U.value * I.value;
      }
    } else if (target.value === 'U') {
      if (P.value !== null && I.value !== null) {
        if (I.value === 0) {
          alert('电流不能为空');
          return;
        }
        result.value = P.value / I.value;
      }
    } else if (target.value === 'I') {
      if (P.value !== null && U.value !== null) {
        if (U.value === 0) {
          alert('电压不能为空');
          return;
        }
        result.value = P.value / U.value;
      }
    }
  };

  const reset = () => {
    P.value = null;
    U.value = null;
    I.value = null;
    result.value = null;
  };

  const format = (n: number) => {
    if (Math.abs(n) < 0.001 || Math.abs(n) > 10000) {
      return n.toExponential(4);
    }
    return parseFloat(n.toFixed(4));
  };
</script>

<style scoped>
  .tool-container {
    --bg: #fdf4ff;
    --card: #ffffff;
    --text: #4a044e;
    --accent: #c026d3;
    --accent-light: #fce7f3;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    cursor: pointer;
    color: #64748b;
  }
  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .main-content {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px -2px rgba(192, 38, 211, 0.1);
    border: 1px solid #fbcfe8;
  }

  .selector-group label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
    color: #701a75;
  }

  .tab-group {
    display: flex;
    background: #fdf2f8;
    padding: 0.4rem;
    border-radius: 10px;
    gap: 0.5rem;
  }

  .tab-group button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #86198f;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-group button.active {
    background: white;
    color: var(--accent);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .input-area {
    margin: 2rem 0;
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .input-group label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    color: #701a75;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-wrapper input {
    width: 100%;
    padding: 1rem;
    padding-right: 3rem;
    border: 2px solid #fbcfe8;
    border-radius: 10px;
    font-size: 1.1rem;
    outline: none;
    color: var(--text);
    transition: border-color 0.2s;
  }

  .input-wrapper input:focus {
    border-color: var(--accent);
  }

  .input-wrapper .unit {
    position: absolute;
    right: 1rem;
    color: #db2777;
    font-weight: 600;
  }

  .action-bar {
    display: flex;
    gap: 1rem;
  }

  .primary-btn {
    flex: 2;
    padding: 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(192, 38, 211, 0.3);
  }

  .secondary-btn {
    flex: 1;
    background: #fce7f3;
    color: #86198f;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
  }

  .result-box {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #fdf2f8;
    border: 1px dashed #f9a8d4;
    border-radius: 12px;
    text-align: center;
  }

  .result-label {
    font-size: 0.9rem;
    color: #86198f;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  .result-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .unit-large {
    font-size: 1.2rem;
    color: #db2777;
  }

  .formula-display {
    font-family: monospace;
    color: #831843;
    background: rgba(255, 255, 255, 0.5);
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
  }

  .info-card {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    color: #701a75;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
