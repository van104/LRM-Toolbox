<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>平方根 / 立方根计算器</h1>
        <span class="nav-subtitle">Square Root & Cube Root Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="input-grid">
          <div class="input-group">
            <label>被开方数 (x)</label>
            <input
              v-model.number="baseNumber"
              type="number"
              class="main-input"
              placeholder="请输入数字"
            />
          </div>

          <div class="input-group">
            <label>根指数 (n)</label>
            <div class="root-selector">
              <button
                v-for="n in [2, 3]"
                :key="n"
                :class="['root-btn', { active: rootDegree === n }]"
                @click="rootDegree = n"
              >
                {{ n }}
              </button>
              <input
                v-model.number="rootDegree"
                type="number"
                class="custom-root"
                placeholder="自定义"
              />
            </div>
          </div>
        </div>

        <button class="primary-btn full-width" @click="calculate">计算结果</button>

        <div v-if="result !== null" class="result-box animate-fade-in">
          <div class="result-header">计算结果</div>
          <div class="result-value">{{ formattedResult }}</div>
          <div class="result-formula">
            <span v-if="rootDegree === 2">√{{ baseNumber }} = {{ formattedResult }}</span>
            <span v-else-if="rootDegree === 3">∛{{ baseNumber }} = {{ formattedResult }}</span>
            <span v-else>
              <sup>{{ rootDegree }}</sup
              >√{{ baseNumber }} = {{ formattedResult }}
            </span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>💡 说明</h3>
        <p>支持计算任意正实数的任意次方根。</p>
        <p>例如：求 8 的立方根，输入 8，选择 3，结果为 2。</p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 数学工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const baseNumber = ref<number | null>(null);
  const rootDegree = ref<number>(2);
  const result = ref<number | null>(null);

  const formattedResult = computed(() => {
    if (result.value === null) return '';
    // Format to remove trailing zeros but keep precision up to 6 decimal places
    return parseFloat(result.value.toFixed(6)).toString();
  });

  const calculate = () => {
    if (baseNumber.value === null || rootDegree.value === null) return;

    if (rootDegree.value === 0) {
      result.value = null; // Defined as error or Infinity usually
      return;
    }

    // Handle negative bases for odd roots
    if (baseNumber.value < 0 && rootDegree.value % 2 !== 0) {
      result.value = -Math.pow(-baseNumber.value, 1 / rootDegree.value);
    } else if (baseNumber.value < 0) {
      result.value = NaN; // Complex number support not included
    } else {
      result.value = Math.pow(baseNumber.value, 1 / rootDegree.value);
    }
  };
</script>

<style scoped>
  .tool-container {
    --bg: #f0fdf4;
    --card: #ffffff;
    --text: #14532d;
    --accent: #16a34a;
    --accent-hover: #15803d;

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

  /* ... Shared Nav Styles (simplified for brevity in thought, but full in code) ... */
  .nav-back {
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
    color: var(--text);
  }
  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }
  .nav-spacer {
    width: 60px;
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
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  }

  .input-grid {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .input-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4b5563;
  }

  .main-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    outline: none;
    transition: all 0.2s;
  }

  .main-input:focus {
    border-color: var(--accent);
  }

  .root-selector {
    display: flex;
    gap: 0.5rem;
  }

  .root-btn {
    flex: 1;
    padding: 0.8rem;
    border: 2px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .root-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .custom-root {
    width: 80px;
    padding: 0.8rem;
    text-align: center;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    outline: none;
  }

  .custom-root:focus {
    border-color: var(--accent);
  }

  .primary-btn {
    width: 100%;
    padding: 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .primary-btn:hover {
    background: var(--accent-hover);
  }

  .result-box {
    margin-top: 2rem;
    text-align: center;
    padding: 2rem;
    background: #f0fdf4;
    border-radius: 16px;
    border: 1px dashed var(--accent);
  }

  .result-header {
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .result-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text);
    margin-bottom: 0.5rem;
  }

  .result-formula {
    font-family: 'Times New Roman', serif;
    font-size: 1.2rem;
    color: #4b5563;
    font-style: italic;
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
    color: #374151;
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
