<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>等差数列求和器</h1>
        <span class="nav-subtitle">Arithmetic Series Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="input-grid">
          <div class="input-group">
            <label>首项 (a₁)</label>
            <input v-model.number="a1" type="number" placeholder="输入数值" />
          </div>
          <div class="input-group">
            <label>末项 (aₙ)</label>
            <input v-model.number="an" type="number" placeholder="输入数值" />
          </div>
          <div class="input-group">
            <label>项数 (n)</label>
            <input v-model.number="n" type="number" placeholder="输入数值" />
          </div>
          <div class="input-group">
            <label>公差 (d)</label>
            <input v-model.number="d" type="number" placeholder="输入数值" />
          </div>
        </div>

        <div class="action-bar">
          <button class="primary-btn" @click="calculate">计算未知项 & 求和</button>
          <button class="secondary-btn" @click="clear">清空</button>
        </div>

        <div v-if="result" class="result-box animate-fade-in">
          <div class="result-header">计算结果</div>

          <div class="result-summary">
            <div class="summary-item">
              <span class="label">总和 (Sₙ)</span>
              <span class="value">{{ format(result.sum) }}</span>
            </div>
          </div>

          <div class="result-details">
            <div class="detail-item">
              <span>首项 (a₁):</span>
              <strong>{{ format(result.a1) }}</strong>
            </div>
            <div class="detail-item">
              <span>末项 (aₙ):</span>
              <strong>{{ format(result.an) }}</strong>
            </div>
            <div class="detail-item">
              <span>项数 (n):</span>
              <strong>{{ format(result.n) }}</strong>
            </div>
            <div class="detail-item">
              <span>公差 (d):</span>
              <strong>{{ format(result.d) }}</strong>
            </div>
          </div>

          <div class="term-calculator">
            <h4>计算任意项 (aₖ)</h4>
            <div class="term-input-row">
              <span>求第</span>
              <input v-model.number="kTerm" type="number" placeholder="k" class="k-input" />
              <span>项的数值</span>
              <button class="small-btn" @click="calculateKTerm">计算</button>
            </div>
            <div v-if="kResult !== null" class="k-result">
              a<sub>{{ kTerm }}</sub> = <strong>{{ format(kResult) }}</strong>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-msg animate-fade-in">
          {{ error }}
        </div>
      </div>

      <div class="info-card">
        <h3>💡 使用说明</h3>
        <p>输入已知条件的任意3项，即可自动计算剩余项和总和。</p>
        <p>常用公式：Run = a₁ + (n-1)d，Sn = n(a₁ + aₙ)/2</p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 数学工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const a1 = ref<number | null>(null);
  const an = ref<number | null>(null);
  const n = ref<number | null>(null);
  const d = ref<number | null>(null);

  const kTerm = ref<number | null>(null);
  const kResult = ref<number | null>(null);

  const result = ref<{
    a1: number;
    an: number;
    n: number;
    d: number;
    sum: number;
  } | null>(null);

  const error = ref('');

  const format = (num: number) => {
    return parseFloat(num.toFixed(6));
  };

  const clear = () => {
    a1.value = null;
    an.value = null;
    n.value = null;
    d.value = null;
    result.value = null;
    error.value = '';
    kTerm.value = null;
    kResult.value = null;
  };

  const calculate = () => {
    error.value = '';
    result.value = null;
    kResult.value = null;

    let v_a1 = a1.value;
    let v_an = an.value;
    let v_n = n.value;
    let v_d = d.value;

    // We need at least 3 values to solve the system defined by an = a1 + (n-1)d
    // Actually, d, a1, n, an are linked.
    // Formula: an = a1 + (n-1)d
    // Variables: 4. Need 3 to solve for 4th.

    try {
      // Case 1: Given a1, n, d -> Find an
      if (v_a1 !== null && v_n !== null && v_d !== null && v_an === null) {
        v_an = v_a1 + (v_n - 1) * v_d;
      }
      // Case 2: Given a1, an, n -> Find d
      else if (v_a1 !== null && v_an !== null && v_n !== null && v_d === null) {
        if (v_n === 1) v_d = 0;
        else v_d = (v_an - v_a1) / (v_n - 1);
      }
      // Case 3: Given a1, an, d -> Find n
      else if (v_a1 !== null && v_an !== null && v_d !== null && v_n === null) {
        if (v_d === 0) {
          if (v_a1 === v_an) {
            // Infinite possibilities for n, theoretically. But user usually wants sum.
            // Without n, we can't find Sum unless we assume n=1? No.
            // Assume error or ask for n.
            throw new Error('当公差为0且首项等于末项时，项数(n)无法确定，请输入项数。');
          } else {
            throw new Error('公差为0时首项必须等于末项，否则无解。');
          }
        }
        v_n = (v_an - v_a1) / v_d + 1;
      }
      // Case 4: Given an, n, d -> Find a1
      else if (v_an !== null && v_n !== null && v_d !== null && v_a1 === null) {
        v_a1 = v_an - (v_n - 1) * v_d;
      } else {
        // Check if all 4 are present, verify consistency
        if (v_a1 !== null && v_an !== null && v_n !== null && v_d !== null) {
          const check = v_a1 + (v_n - 1) * v_d;
          if (Math.abs(check - v_an) > 0.0001) {
            throw new Error('输入的四个参数不一致 (an ≠ a1 + (n-1)d)，请保留一个空缺以供计算。');
          }
        } else {
          throw new Error('请至少输入3个参数以求解未知项。');
        }
      }

      // Calculate Sum
      // Sn = n * (a1 + an) / 2
      if (v_a1 !== null && v_an !== null && v_n !== null) {
        const sum = (v_n * (v_a1 + v_an)) / 2;
        result.value = {
          a1: v_a1!,
          an: v_an!,
          n: v_n!,
          d: v_d !== null ? v_d : v_n > 1 ? (v_an! - v_a1!) / (v_n! - 1) : 0,
          sum
        };

        // Update inputs to show calculated values
        // actually better not to overwrite user inputs automatically unless requested?
        // but user wants to see them. I will display them in result box.
      }
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = '发生未知错误';
      }
    }
  };

  const calculateKTerm = () => {
    if (!result.value || kTerm.value === null) return;
    const { a1, d } = result.value;
    kResult.value = a1 + (kTerm.value - 1) * d;
  };
</script>

<style scoped>
  .tool-container {
    --bg: #fff1f2;
    --card: #ffffff;
    --text: #881337;
    --accent: #e11d48;
    --accent-hover: #be123c;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  .nav-bar {
    /* Common nav style */
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
    /*...*/
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
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
    color: #4c0519;
  }
  .nav-subtitle {
    font-size: 0.8rem;
    color: #9f1239;
    opacity: 0.8;
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
    box-shadow: 0 4px 20px -2px rgba(225, 29, 72, 0.1);
    border: 1px solid #ffe4e6;
  }

  .input-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #881337;
    font-size: 0.9rem;
  }

  .input-group input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #fecdd3;
    border-radius: 8px;
    font-size: 1.1rem;
    outline: none;
    background: #fff0f1;
    color: #881337;
    transition: all 0.2s;
  }

  .input-group input:focus {
    border-color: var(--accent);
    background: #fff;
  }

  .action-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .primary-btn {
    flex: 2;
    padding: 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
  }

  .secondary-btn {
    flex: 1;
    background: #fecdd3;
    color: #881337;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
  }

  .result-box {
    background: #fff1f2;
    border: 2px solid #fda4af;
    border-radius: 12px;
    overflow: hidden;
  }

  .result-header {
    background: #fda4af;
    color: #881337;
    padding: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .result-summary {
    padding: 2rem;
    text-align: center;
    background: white;
  }

  .result-summary .label {
    display: block;
    color: #881337;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .result-summary .value {
    font-size: 3rem;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }

  .result-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1px;
    background: #fda4af;
  }

  .detail-item {
    background: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
  }

  .term-calculator {
    padding: 1.5rem;
    background: white;
    border-top: 1px dashed #fda4af;
  }

  .term-calculator h4 {
    margin: 0 0 1rem 0;
    color: #881337;
  }

  .term-input-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .k-input {
    width: 60px;
    padding: 0.5rem;
    border: 1px solid #fda4af;
    border-radius: 6px;
    text-align: center;
  }

  .small-btn {
    padding: 0.5rem 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .k-result {
    font-size: 1.1rem;
    color: #881337;
  }

  .error-msg {
    padding: 1rem;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
    border: 1px solid #fca5a5;
    text-align: center;
  }

  .info-card {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    color: #881337;
    font-size: 0.9rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #9f1239;
    font-size: 0.875rem;
    opacity: 0.6;
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
