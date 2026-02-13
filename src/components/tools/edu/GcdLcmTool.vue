<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>GCD & LCM 计算器</h1>
        <span class="nav-subtitle">Greatest Common Divisor & Least Common Multiple</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="input-section">
          <label>输入数字 (用逗号或空格分隔):</label>
          <input
            v-model="inputText"
            type="text"
            placeholder="例如: 12, 18, 24"
            class="main-input"
            @keyup.enter="calculate"
          />
          <button class="primary-btn" @click="calculate">计算</button>
        </div>

        <div v-if="result" class="result-box animate-fade-in">
          <div class="result-item">
            <span class="label">最大公约数 (GCD):</span>
            <span class="value">{{ result.gcd }}</span>
          </div>
          <div class="result-item">
            <span class="label">最小公倍数 (LCM):</span>
            <span class="value">{{ result.lcm }}</span>
          </div>
          <div class="result-item">
            <span class="label">输入数字:</span>
            <span class="value small">{{ result.numbers.join(', ') }}</span>
          </div>
        </div>

        <div v-if="error" class="error-msg animate-fade-in">
          {{ error }}
        </div>
      </div>

      <div class="info-card">
        <h3>💡 说明</h3>
        <p>最大公约数 (GCD)：能同时整除几个整数的最大整数。</p>
        <p>最小公倍数 (LCM)：能同时被几个整数整除的最小正整数。</p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 数学工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const inputText = ref('');
  const result = ref<{ gcd: number; lcm: number; numbers: number[] } | null>(null);
  const error = ref('');

  const getGcd = (a: number, b: number): number => {
    return b === 0 ? a : getGcd(b, a % b);
  };

  const getLcm = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 0;
    return Math.abs((a * b) / getGcd(a, b));
  };

  const calculate = () => {
    error.value = '';
    result.value = null;

    // Split by comma or space
    const nums = inputText.value
      .split(/[,，\s]+/)
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(Number);

    if (nums.some(isNaN)) {
      error.value = '请输入有效的数字';
      return;
    }

    if (nums.length < 2) {
      error.value = '请至少输入两个数字';
      return;
    }

    // Calculate GCD
    const gcdVal = nums.reduce((acc, curr) => getGcd(acc, curr));

    // Calculate LCM
    const lcmVal = nums.reduce((acc, curr) => getLcm(acc, curr));

    result.value = {
      gcd: gcdVal,
      lcm: lcmVal,
      numbers: nums
    };
  };
</script>

<style scoped>
  .tool-container {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #334155;
    --accent: #3b82f6;
    --accent-hover: #2563eb;

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

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #64748b;
    transition: color 0.2s;
  }

  .nav-back:hover {
    color: var(--text);
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

  .nav-spacer {
    width: 60px;
  }

  .main-content {
    max-width: 800px;
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
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-section label {
    font-weight: 500;
    color: #475569;
  }

  .main-input {
    padding: 1rem;
    font-size: 1.1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    transition: all 0.2s;
    outline: none;
  }

  .main-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .primary-btn {
    padding: 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .primary-btn:hover {
    background: var(--accent-hover);
  }

  .result-box {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #eff6ff;
    border-radius: 12px;
    border: 1px solid #dbeafe;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid #dbeafe;
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item .label {
    color: #64748b;
  }

  .result-item .value {
    font-weight: 700;
    font-size: 1.25rem;
    color: #1e293b;
  }

  .result-item .value.small {
    font-size: 1rem;
    font-weight: 400;
  }

  .error-msg {
    margin-top: 1rem;
    padding: 1rem;
    background: #fef2f2;
    color: #ef4444;
    border-radius: 8px;
    text-align: center;
  }

  .info-card {
    background: rgba(255, 255, 255, 0.6);
    padding: 1.5rem;
    border-radius: 12px;
    color: #64748b;
    font-size: 0.9rem;
  }

  .info-card h3 {
    margin: 0 0 0.5rem 0;
    color: #475569;
  }

  .info-card p {
    margin: 0.25rem 0;
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
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
