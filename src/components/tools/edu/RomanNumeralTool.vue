<template>
  <div class="roman-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>罗马数字转换器</h1>
        <span class="nav-subtitle">Roman Numeral Converter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <section class="options-bar">
          <div class="option-group">
            <span class="opt-label">转换模式</span>
            <div class="custom-radio-group">
              <label :class="{ active: mode === 'dec2rom' }">
                <input v-model="mode" type="radio" value="dec2rom" /> 数字 ⮕ 罗马
              </label>
              <label :class="{ active: mode === 'rom2dec' }">
                <input v-model="mode" type="radio" value="rom2dec" /> 罗马 ⮕ 数字
              </label>
            </div>
          </div>
        </section>

        <section class="input-section">
          <div class="section-header">
            <label>
              <el-icon><EditPen /></el-icon>
              {{ mode === 'dec2rom' ? '输入阿拉伯数字 (1-3999)' : '输入罗马数字 (I, V, X...)' }}
            </label>
          </div>
          <div class="input-wrapper">
            <input
              v-model="inputValue"
              type="text"
              class="large-input"
              :placeholder="mode === 'dec2rom' ? '例如: 2026' : '例如: MMXXVI'"
            />
            <button v-if="inputValue" class="clear-btn" @click="inputValue = ''">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </section>

        <section class="result-section">
          <div class="section-header">
            <label
              ><el-icon><Finished /></el-icon> 转换结果</label
            >
          </div>
          <div class="result-box" :class="{ 'has-result': result }">
            <div v-if="result" class="result-display" @click="copy(result)">
              <span class="result-text">{{ result }}</span>
              <el-icon class="copy-hint"><CopyDocument /></el-icon>
            </div>
            <div v-else class="empty-hint">
              {{ validationError || '等待输入内容...' }}
            </div>
          </div>
        </section>

        <!-- Reference Table -->
        <section class="reference-section">
          <div class="section-header">
            <label
              ><el-icon><Grid /></el-icon> 对照表</label
            >
          </div>
          <div class="ref-grid">
            <div v-for="(val, key) in romanMap" :key="key" class="ref-item">
              <span class="ref-roman">{{ key }}</span>
              <span class="ref-sep">=</span>
              <span class="ref-dec">{{ val }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 罗马数字转换器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { Back, Close, CopyDocument, EditPen, Finished, Grid } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { useClipboard } from '@vueuse/core';

  const { copy: copyText } = useClipboard();
  const mode = ref<'dec2rom' | 'rom2dec'>('dec2rom');
  const inputValue = ref('');

  const romanMap: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };

  const copy = (text: string) => {
    copyText(text);
    ElMessage.success('结果已复制到剪贴板');
  };

  watch(mode, () => {
    inputValue.value = '';
  });

  const result = computed(() => {
    const val = inputValue.value.trim().toUpperCase();
    if (!val) return '';
    if (mode.value === 'dec2rom') {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 3999) return '';
      return toRoman(num);
    } else {
      if (!/^[MDCLXVI]+$/.test(val)) return '';
      return fromRoman(val)?.toString() || '';
    }
  });

  const validationError = computed(() => {
    const val = inputValue.value.trim().toUpperCase();
    if (!val) return '';
    if (mode.value === 'dec2rom') {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 3999) return '请输入 1 到 3999 之间的整数';
    } else {
      if (!/^[MDCLXVI]+$/.test(val)) return '请输入有效的罗马字符 (M, D, C, L, X, V, I)';
    }
    return '';
  });

  function toRoman(num: number): string {
    let result = '';
    const map = [
      { r: 'M', v: 1000 },
      { r: 'CM', v: 900 },
      { r: 'D', v: 500 },
      { r: 'CD', v: 400 },
      { r: 'C', v: 100 },
      { r: 'XC', v: 90 },
      { r: 'L', v: 50 },
      { r: 'XL', v: 40 },
      { r: 'X', v: 10 },
      { r: 'IX', v: 9 },
      { r: 'V', v: 5 },
      { r: 'IV', v: 4 },
      { r: 'I', v: 1 }
    ];
    for (const { r, v } of map) {
      while (num >= v) {
        result += r;
        num -= v;
      }
    }
    return result;
  }

  function fromRoman(str: string): number | null {
    const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const current = map[str[i]];
      const next = map[str[i + 1]];
      if (next && current < next) result -= current;
      else result += current;
    }
    return result;
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .roman-tool {
    --bg: #fafaf9;
    --card: #ffffff;
    --border: #e7e5e4;
    --text: #1c1917;
    --text-2: #78716c;
    --accent: #8b5cf6;
    --accent-bg: #f5f3ff;

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
  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .options-bar {
    display: flex;
    justify-content: center;
    background: #f5f5f4;
    padding: 1rem;
    border-radius: 16px;
  }
  .option-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .opt-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
  }

  .custom-radio-group {
    display: flex;
    gap: 0.5rem;
    background: #fff;
    padding: 4px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .custom-radio-group label {
    padding: 8px 16px;
    font-size: 0.85rem;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-2);
    font-weight: 500;
  }
  .custom-radio-group input {
    display: none;
  }
  .custom-radio-group label.active {
    background: var(--accent);
    color: #fff;
  }

  .section-header label {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 1rem;
  }

  .input-wrapper {
    position: relative;
  }
  .large-input {
    width: 100%;
    padding: 1.25rem 3rem 1.25rem 1.5rem;
    border: 2px solid var(--border);
    border-radius: 16px;
    font-size: 1.75rem;
    font-weight: 700;
    font-family: 'Courier New', Courier, monospace;
    outline: none;
    transition: all 0.2s;
    text-align: center;
  }
  .large-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-bg);
  }

  .clear-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 1.25rem;
    color: var(--text-2);
    cursor: pointer;
  }

  .result-box {
    padding: 2.5rem;
    border: 2px dashed var(--border);
    border-radius: 20px;
    background: #faf9f8;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 140px;
  }
  .result-box.has-result {
    background: var(--accent-bg);
    border-color: var(--accent);
    border-style: solid;
  }

  .result-display {
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
  }
  .result-text {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--accent);
    font-family: 'Courier New', Courier, monospace;
    letter-spacing: 2px;
  }
  .copy-hint {
    font-size: 1.25rem;
    color: var(--accent);
    opacity: 0.5;
  }
  .result-display:hover .copy-hint {
    opacity: 1;
  }

  .empty-hint {
    color: var(--text-2);
    font-style: italic;
    font-size: 1rem;
  }

  .ref-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }
  .ref-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0.75rem;
    background: #f5f5f4;
    border-radius: 12px;
    font-size: 0.9rem;
  }
  .ref-roman {
    font-weight: 800;
    color: var(--text);
  }
  .ref-sep {
    color: var(--text-2);
    opacity: 0.5;
  }
  .ref-dec {
    font-weight: 600;
    color: var(--accent);
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .large-input {
      font-size: 1.25rem;
    }
    .result-text {
      font-size: 1.75rem;
    }
  }
</style>
