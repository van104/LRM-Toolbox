<template>
  <div class="base-calculator-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>进制加减计算器</h1>
        <span class="nav-subtitle">Base Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <div class="input-grid">
          <!-- Numerical A -->
          <section class="val-section">
            <div class="section-header">
              <label
                ><el-icon><Operation /></el-icon>数值 A</label
              >
              <div class="base-select">
                <select v-model="baseA">
                  <option :value="2">BIN (2)</option>
                  <option :value="8">OCT (8)</option>
                  <option :value="10">DEC (10)</option>
                  <option :value="16">HEX (16)</option>
                </select>
              </div>
            </div>
            <input v-model="inputA" type="text" class="base-input" placeholder="输入数值" />
          </section>

          <!-- Operator -->
          <section class="op-section">
            <div class="op-group">
              <button :class="{ active: operation === '+' }" @click="operation = '+'">
                <el-icon><Plus /></el-icon> 加 (+)
              </button>
              <button :class="{ active: operation === '-' }" @click="operation = '-'">
                <el-icon><Minus /></el-icon> 减 (-)
              </button>
            </div>
          </section>

          <!-- Numerical B -->
          <section class="val-section">
            <div class="section-header">
              <label
                ><el-icon><Operation /></el-icon>数值 B</label
              >
              <div class="base-select">
                <select v-model="baseB">
                  <option :value="2">BIN (2)</option>
                  <option :value="8">OCT (8)</option>
                  <option :value="10">DEC (10)</option>
                  <option :value="16">HEX (16)</option>
                </select>
              </div>
            </div>
            <input v-model="inputB" type="text" class="base-input" placeholder="输入数值" />
          </section>
        </div>

        <!-- Result Display -->
        <section class="result-section">
          <div class="section-header">
            <label
              ><el-icon><Finished /></el-icon>计算结果</label
            >
          </div>
          <div v-if="validation.isValid" class="results-grid">
            <div v-for="base in displayBases" :key="base.value" class="result-item">
              <div class="res-meta">
                <span class="res-label">{{ base.label }}</span>
                <span class="res-base">Base {{ base.value }}</span>
              </div>
              <div class="res-value" @click="copy(formatResult(result, base.value))">
                <span class="val-text">{{ formatResult(result, base.value) }}</span>
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon class="mb-2 text-2xl"><Warning /></el-icon>
            <p>{{ validation.message || '请在上方输入有效数值以开始计算' }}</p>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 进制加减计算器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    Back,
    Plus,
    Minus,
    CopyDocument,
    Operation,
    Finished,
    Warning
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { useClipboard } from '@vueuse/core';

  const { copy: copyText } = useClipboard();

  const inputA = ref('');
  const baseA = ref(10);
  const inputB = ref('');
  const baseB = ref(10);
  const operation = ref('+');

  const displayBases = [
    { label: 'HEX', value: 16 },
    { label: 'DEC', value: 10 },
    { label: 'OCT', value: 8 },
    { label: 'BIN', value: 2 }
  ];

  const copy = (text: string) => {
    if (!text) return;
    copyText(text);
    ElMessage.success('已复制到剪贴板');
  };

  const validation = computed(() => {
    if (!inputA.value || !inputB.value) return { isValid: false, message: '' };
    try {
      const numA = parseInt(inputA.value, baseA.value);
      const numB = parseInt(inputB.value, baseB.value);
      if (isNaN(numA)) return { isValid: false, message: '数值 A 格式错误 (检查进制)' };
      if (isNaN(numB)) return { isValid: false, message: '数值 B 格式错误 (检查进制)' };
      return { isValid: true, message: '' };
    } catch {
      return { isValid: false, message: '输入包含无效字符' };
    }
  });

  const result = computed(() => {
    if (!validation.value.isValid) return 0;
    const numA = parseInt(inputA.value, baseA.value);
    const numB = parseInt(inputB.value, baseB.value);
    return operation.value === '+' ? numA + numB : numA - numB;
  });

  const formatResult = (num: number, base: number) => {
    if (isNaN(num)) return '';
    let str = Math.abs(num).toString(base).toUpperCase();
    if (num < 0) str = '-' + str;
    // Format BIN and HEX for readability
    if (base === 2) {
      // Add space every 4 bits
      return str.match(/.{1,4}/g)?.join(' ') || str;
    }
    return str;
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .base-calculator-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #f59e0b;
    --accent-bg: #fffbe6;

    font-family: 'Outfit', sans-serif;
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
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
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
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    transition: all 0.2s;
  }
  .nav-back:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }

  .nav-center {
    text-align: center;
  }
  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }
  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    text-align: center;
    display: block;
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2.5rem 1rem;
  }
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }

  .input-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  .val-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .section-header label {
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .base-select select {
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid var(--border);
    font-size: 0.85rem;
    outline: none;
    background: #f8fafc;
  }

  .base-input {
    padding: 1rem 1.25rem;
    border: 2px solid var(--border);
    border-radius: 16px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.5rem;
    font-weight: 600;
    text-transform: uppercase;
    outline: none;
    transition: all 0.2s;
    text-align: center;
  }
  .base-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-bg);
  }

  .op-section {
    display: flex;
    justify-content: center;
  }
  .op-group {
    display: flex;
    gap: 0.75rem;
    background: #f1f5f9;
    padding: 6px;
    border-radius: 14px;
  }
  .op-group button {
    padding: 8px 20px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-2);
  }
  .op-group button.active {
    background: white;
    color: var(--accent);
    border-color: var(--border);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }

  .results-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 16px;
    transition: all 0.2s;
  }
  .result-item:hover {
    border-color: var(--accent);
    background: white;
    transform: scale(1.01);
  }

  .res-meta {
    display: flex;
    flex-direction: column;
  }
  .res-label {
    font-weight: 800;
    font-size: 1.1rem;
    color: var(--text);
  }
  .res-base {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
  }

  .res-value {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
  }
  .val-text {
    font-family: 'Courier New', Courier, monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: 1px;
  }
  .copy-icon {
    color: var(--text-2);
    opacity: 0.3;
    transition: opacity 0.2s;
  }
  .result-item:hover .copy-icon {
    opacity: 1;
    color: var(--accent);
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    border: 2px dashed var(--border);
    border-radius: 20px;
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .val-text {
      font-size: 1.1rem;
    }
  }
</style>
