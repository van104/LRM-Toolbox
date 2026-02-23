<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Base<span>.转换()</span></h1>
        <div class="badge">⇄ Base Converter</div>
      </header>

      <!-- 四进制转换卡片 -->
      <div class="converter-grid">
        <!-- DEC -->
        <div class="base-card" :class="{ error: errors.dec, focused: focused === 'dec' }">
          <div class="card-header dec-header">
            <span class="base-name">十进制</span>
            <span class="base-tag">DEC · Base-10</span>
          </div>
          <div class="input-row">
            <input
              v-model="values.dec"
              type="text"
              class="base-input"
              placeholder="255"
              @input="handleInput('dec')"
              @focus="focused = 'dec'"
              @blur="focused = ''"
            />
            <button class="copy-btn" title="复制" @click="copy(values.dec)">📋</button>
          </div>
          <div v-if="errors.dec" class="error-msg">格式错误：仅允许整数</div>
        </div>

        <!-- HEX -->
        <div class="base-card" :class="{ error: errors.hex, focused: focused === 'hex' }">
          <div class="card-header hex-header">
            <span class="base-name">十六进制</span>
            <span class="base-tag">HEX · Base-16</span>
          </div>
          <div class="input-row">
            <span class="prefix">0x</span>
            <input
              v-model="values.hex"
              type="text"
              class="base-input"
              placeholder="FF"
              @input="handleInput('hex')"
              @focus="focused = 'hex'"
              @blur="focused = ''"
            />
            <button class="copy-btn" title="复制" @click="copy(values.hex)">📋</button>
          </div>
          <div v-if="errors.hex" class="error-msg">格式错误：仅允许 0-9 A-F</div>
        </div>

        <!-- BIN -->
        <div class="base-card" :class="{ error: errors.bin, focused: focused === 'bin' }">
          <div class="card-header bin-header">
            <span class="base-name">二进制</span>
            <span class="base-tag">BIN · Base-2</span>
          </div>
          <div class="input-row">
            <span class="prefix">0b</span>
            <input
              v-model="values.bin"
              type="text"
              class="base-input"
              placeholder="11111111"
              @input="handleInput('bin')"
              @focus="focused = 'bin'"
              @blur="focused = ''"
            />
            <button class="copy-btn" title="复制" @click="copy(values.bin)">📋</button>
          </div>
          <div v-if="errors.bin" class="error-msg">格式错误：仅允许 0 和 1</div>
        </div>

        <!-- OCT -->
        <div class="base-card" :class="{ error: errors.oct, focused: focused === 'oct' }">
          <div class="card-header oct-header">
            <span class="base-name">八进制</span>
            <span class="base-tag">OCT · Base-8</span>
          </div>
          <div class="input-row">
            <span class="prefix">0o</span>
            <input
              v-model="values.oct"
              type="text"
              class="base-input"
              placeholder="377"
              @input="handleInput('oct')"
              @focus="focused = 'oct'"
              @blur="focused = ''"
            />
            <button class="copy-btn" title="复制" @click="copy(values.oct)">📋</button>
          </div>
          <div v-if="errors.oct" class="error-msg">格式错误：仅允许 0-7</div>
        </div>
      </div>

      <!-- 快速示例 / 清空 -->
      <div class="quick-bar">
        <span class="quick-label">快捷示例：</span>
        <button
          v-for="ex in examples"
          :key="ex.label"
          class="quick-btn"
          @click="loadExample(ex.val)"
        >
          {{ ex.label }}
        </button>
        <button class="quick-btn danger" @click="clearAll">✕ 清空</button>
      </div>

      <!-- ASCII 对照表 -->
      <div class="ascii-section brutal-pane">
        <div class="pane-header bg-yellow">
          <span>📊 ASCII 常用字符对照表</span>
          <div class="search-wrap">
            <span>🔍</span>
            <input v-model="asciiSearch" class="ascii-search" placeholder="搜索字符或编码..." />
          </div>
        </div>
        <div class="ascii-body">
          <table class="ascii-table">
            <thead>
              <tr>
                <th>DEC</th>
                <th>HEX</th>
                <th>BIN</th>
                <th>Char</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredAscii" :key="item.dec" class="ascii-row">
                <td class="mono dec-cell">{{ item.dec }}</td>
                <td class="mono hex-cell">{{ item.hex }}</td>
                <td class="mono bin-cell">{{ item.dec.toString(2).padStart(8, '0') }}</td>
                <td class="char-cell">
                  <span class="char-badge">{{ item.char }}</span>
                </td>
                <td class="desc-cell">{{ item.desc || '—' }}</td>
                <td>
                  <button class="use-btn" title="载入转换" @click="loadDecimal(item.dec)">↑</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredAscii.length === 0" class="empty-ascii">没有找到匹配项</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const focused = ref('');

  const values = reactive({ dec: '', hex: '', bin: '', oct: '' });
  const errors = reactive({ dec: false, hex: false, bin: false, oct: false });

  const validators = {
    dec: /^-?\d*$/,
    hex: /^[0-9a-fA-F]*$/,
    bin: /^[01]*$/,
    oct: /^[0-7]*$/
  };

  const handleInput = sourceBase => {
    const val = values[sourceBase].trim();
    Object.keys(errors).forEach(k => (errors[k] = false));
    if (!val) {
      clearAll();
      return;
    }
    if (!validators[sourceBase].test(val)) {
      errors[sourceBase] = true;
      return;
    }

    let dec = NaN;
    try {
      switch (sourceBase) {
        case 'dec':
          dec = parseInt(val, 10);
          break;
        case 'hex':
          dec = parseInt(val, 16);
          break;
        case 'bin':
          dec = parseInt(val, 2);
          break;
        case 'oct':
          dec = parseInt(val, 8);
          break;
      }
    } catch {
      dec = NaN;
    }

    if (isNaN(dec)) {
      errors[sourceBase] = true;
      return;
    }

    if (sourceBase !== 'dec') values.dec = dec.toString(10);
    if (sourceBase !== 'hex') values.hex = dec.toString(16).toUpperCase();
    if (sourceBase !== 'bin') values.bin = dec.toString(2);
    if (sourceBase !== 'oct') values.oct = dec.toString(8);
  };

  const clearAll = () => {
    Object.keys(values).forEach(k => (values[k] = ''));
    Object.keys(errors).forEach(k => (errors[k] = false));
  };

  const loadDecimal = n => {
    values.dec = n.toString(10);
    handleInput('dec');
  };

  const copy = text => {
    if (text) copyToClipboard(text, { success: '✔ 已复制' });
  };

  const examples = [
    { label: '255', val: 255 },
    { label: '65 (A)', val: 65 },
    { label: '1024', val: 1024 },
    { label: '2048', val: 2048 },
    { label: '0 (NUL)', val: 0 }
  ];

  const loadExample = val => loadDecimal(val);

  // ASCII 表
  const asciiData = [
    { dec: 0, hex: '00', char: 'NUL', desc: 'Null character' },
    { dec: 8, hex: '08', char: 'BS', desc: 'Backspace' },
    { dec: 9, hex: '09', char: 'HT', desc: 'Horizontal Tab' },
    { dec: 10, hex: '0A', char: 'LF', desc: 'Line Feed (换行)' },
    { dec: 13, hex: '0D', char: 'CR', desc: 'Carriage Return' },
    { dec: 27, hex: '1B', char: 'ESC', desc: 'Escape' },
    { dec: 32, hex: '20', char: '␣', desc: 'Space (空格)' },
    ...Array.from({ length: 95 }, (_, i) => {
      const code = i + 33;
      return {
        dec: code,
        hex: code.toString(16).toUpperCase().padStart(2, '0'),
        char: String.fromCharCode(code),
        desc: ''
      };
    })
  ];

  const asciiSearch = ref('');

  const filteredAscii = computed(() => {
    const q = asciiSearch.value.toLowerCase();
    if (!q) return asciiData;
    return asciiData.filter(
      item =>
        item.dec.toString().includes(q) ||
        item.hex.toLowerCase().includes(q) ||
        item.char.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
    );
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #7c3aed;
  }

  .brutal-title span {
    color: #7c3aed;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
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

  .badge {
    background: #7c3aed;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Converter Grid */
  .converter-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .base-card {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .base-card.focused {
    transform: translate(-3px, -3px);
    box-shadow: 11px 11px 0px #111;
  }
  .base-card.error {
    border-color: #ff4b4b;
    box-shadow: 8px 8px 0px #ff4b4b;
  }

  .card-header {
    padding: 0.75rem 1.25rem;
    border-bottom: 4px solid #111;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dec-header {
    background: #ffd900;
  }
  .hex-header {
    background: #ff7be5;
  }
  .bin-header {
    background: #00e572;
  }
  .oct-header {
    background: #4b7bff;
    color: #fff;
  }

  .base-name {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
  }

  .base-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.8rem;
    background: rgba(0, 0, 0, 0.1);
    padding: 0.2rem 0.5rem;
  }

  .input-row {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    gap: 0.25rem;
  }

  .prefix {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.2rem;
    color: #999;
    flex-shrink: 0;
    padding: 0 0.25rem;
  }

  .base-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    color: #111;
    padding: 0.5rem 0.25rem;
    width: 0;
    min-width: 0;
  }

  .base-input::placeholder {
    color: #bbb;
  }

  .copy-btn {
    border: none;
    background: none;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    opacity: 0.5;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  .copy-btn:hover {
    opacity: 1;
  }

  .error-msg {
    padding: 0.4rem 1.25rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: #ff4b4b;
  }

  /* Quick bar */
  .quick-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 1rem 1.5rem;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
  }

  .quick-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    color: #555;
    text-transform: uppercase;
  }

  .quick-btn {
    border: 3px solid #111;
    background: #fdfae5;
    padding: 0.4rem 0.9rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .quick-btn:hover {
    background: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .quick-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .quick-btn.danger {
    background: #ff4b4b;
    color: #fff;
  }
  .quick-btn.danger:hover {
    background: #e03c3c;
  }

  /* ASCII section */
  .ascii-section {
    display: flex;
    flex-direction: column;
  }

  .brutal-pane {
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: 0.5px;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .bg-yellow {
    background: #ffd900;
  }

  .search-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 3px solid #111;
    background: #fff;
    padding: 0.3rem 0.8rem;
    box-shadow: 3px 3px 0px #111;
  }

  .ascii-search {
    border: none;
    outline: none;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    width: 220px;
    background: transparent;
  }

  .ascii-body {
    max-height: 420px;
    overflow-y: auto;
  }

  .ascii-table {
    width: 100%;
    border-collapse: collapse;
  }

  .ascii-table thead th {
    position: sticky;
    top: 0;
    padding: 0.75rem 1rem;
    text-align: left;
    background: #fdfae5;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .ascii-row {
    border-bottom: 2px solid #eee;
  }
  .ascii-row:hover {
    background: #fdfae5;
  }

  .ascii-table td {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }

  .mono {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
  }

  .dec-cell {
    color: #b28000;
  }
  .hex-cell {
    color: #c026d3;
  }
  .bin-cell {
    color: #059669;
    font-size: 0.8rem;
  }

  .char-cell {
    text-align: center;
  }

  .char-badge {
    display: inline-block;
    background: #111;
    color: #ffd900;
    padding: 0.15rem 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 0.95rem;
    min-width: 2rem;
    text-align: center;
  }

  .desc-cell {
    color: #666;
    font-size: 0.85rem;
  }

  .use-btn {
    border: 2px solid #111;
    background: #ffd900;
    padding: 0.15rem 0.5rem;
    font-weight: 900;
    cursor: pointer;
    font-size: 0.85rem;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .use-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .use-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .empty-ascii {
    padding: 2rem;
    text-align: center;
    color: #aaa;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    .converter-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .ascii-search {
      width: 140px;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }

  [data-theme='dark'] .base-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .base-card.focused {
    box-shadow: 11px 11px 0px #eee;
  }
  [data-theme='dark'] .card-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .dec-header {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .hex-header {
    background: #9b2d87;
    color: #fff;
  }
  [data-theme='dark'] .bin-header {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .oct-header {
    background: #1a3a9c;
    color: #fff;
  }

  [data-theme='dark'] .base-input {
    color: #eee;
  }

  [data-theme='dark'] .quick-bar {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .quick-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .quick-btn:hover {
    background: #2a2a2a;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .search-wrap {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .ascii-search {
    color: #eee;
  }

  [data-theme='dark'] .ascii-table thead th {
    background: #222;
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .ascii-row {
    border-bottom-color: #333;
  }
  [data-theme='dark'] .ascii-row:hover {
    background: #222;
  }
  [data-theme='dark'] .desc-cell {
    color: #aaa;
  }
  [data-theme='dark'] .char-badge {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .use-btn {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
