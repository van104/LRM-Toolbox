<template>
  <div class="random-number-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>随机数生成器</h1>
        <span class="nav-subtitle">Random Number Generator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="generator-card glass-card">
        <div class="input-section">
          <div class="input-group">
            <label>最小值</label>
            <input v-model.number="minVal" type="number" placeholder="1" />
          </div>
          <div class="input-group">
            <label>最大值</label>
            <input v-model.number="maxVal" type="number" placeholder="100" />
          </div>
          <div class="input-group">
            <label>生成数量</label>
            <input v-model.number="quantity" type="number" placeholder="1" />
          </div>
        </div>

        <div class="options-section">
          <label class="checkbox-label">
            <input v-model="unique" type="checkbox" /> 不重复 (Unique)
          </label>
          <label v-if="quantity > 1" class="checkbox-label">
            <input v-model="sort" type="checkbox" /> 结果排序
          </label>
        </div>

        <div class="action-section">
          <button class="generate-btn" :disabled="isAnimating" @click="generate">
            <el-icon :class="{ spinning: isAnimating }">
              <Refresh />
            </el-icon>
            {{ isAnimating ? '生成中...' : '开始生成' }}
          </button>
        </div>

        <div v-if="results.length > 0" class="result-display">
          <div class="result-header">
            <span>生成结果 ({{ results.length }}个)</span>
            <button class="copy-btn" @click="copyResults">复制全部</button>
          </div>
          <div class="numbers-grid">
            <div
              v-for="(num, idx) in results"
              :key="idx"
              class="num-ball"
              :class="{ animate: isAnimating }"
              :style="{ animationDelay: `${idx * 0.05}s` }"
            >
              {{ num }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 随机数生成器</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { Back, Refresh } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import useClipboard from 'vue-clipboard3';

  const { toClipboard } = useClipboard();

  const minVal = ref(1);
  const maxVal = ref(100);
  const quantity = ref(1);
  const unique = ref(false);
  const sort = ref(false);
  const results = ref([]);

  const isAnimating = ref(false);

  const generate = async () => {
    if (quantity.value <= 0) {
      ElMessage.warning('生成数量必须大于0');
      return;
    }
    if (minVal.value > maxVal.value) {
      ElMessage.warning('最小值不能大于最大值');
      return;
    }

    const range = maxVal.value - minVal.value + 1;
    if (unique.value && quantity.value > range) {
      ElMessage.warning(`范围 [${minVal.value}, ${maxVal.value}] 内最多只有 ${range} 个不重复数字`);
      return;
    }

    isAnimating.value = true;
    results.value = [];

    await new Promise(r => setTimeout(r, 300));

    let nums = [];
    if (unique.value) {
      const pool = new Set();
      while (pool.size < quantity.value) {
        const r = Math.floor(Math.random() * (maxVal.value - minVal.value + 1)) + minVal.value;
        pool.add(r);
      }
      nums = Array.from(pool);
    } else {
      for (let i = 0; i < quantity.value; i++) {
        nums.push(Math.floor(Math.random() * (maxVal.value - minVal.value + 1)) + minVal.value);
      }
    }

    if (sort.value) {
      nums.sort((a, b) => a - b);
    }

    results.value = nums;
    isAnimating.value = false;
  };

  const copyResults = async () => {
    try {
      await toClipboard(results.value.join(', '));
      ElMessage.success('已复制到剪贴板');
    } catch {
      ElMessage.error('复制失败');
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap');

  .random-number-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #8b5cf6;

    --accent-hover: #7c3aed;

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
    width: 100px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0.5rem 0;
  }

  .nav-center {
    flex: 1;
    text-align: center;
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
  }

  .main-content {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .input-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  @media (max-width: 640px) {
    .input-section {
      flex-direction: column;
    }
  }

  .input-group {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .input-group label {
    font-size: 0.85rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
  }

  .input-group input {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1.1rem;
    text-align: center;
    background: var(--bg);
    font-family: 'JetBrains Mono', monospace;
  }

  .options-section {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-label input {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }

  .action-section {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .generate-btn {
    background: var(--text);
    color: white;
    border: none;
    padding: 0.8rem 2.5rem;
    border-radius: 30px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .generate-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .generate-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }

  .result-display {
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--text-2);
  }

  .copy-btn {
    background: none;
    border: 1px solid var(--border);
    padding: 4px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: var(--bg);
    color: var(--accent);
    border-color: var(--accent);
  }

  .numbers-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .num-ball {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 50%;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--text);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }
</style>
