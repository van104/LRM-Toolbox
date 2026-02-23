<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">盲文<span>转换器()</span></h1>
        <div class="badge">⠃⠗⠁⠊⠇⠇⠑ Braille</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Text to Braille Section -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 普通文本 (TEXT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn" @click="copyText(inputText)">📋 复制</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此输入需要转换的文字..."
                spellcheck="false"
                @input="textToBraille"
              ></textarea>
            </div>
          </section>

          <!-- Middle Switch -->
          <div class="switch-area">
            <button class="brutal-btn min-btn bg-pink text-white" @click="reset">🔄 重置</button>
          </div>

          <!-- Braille to Text Section -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 盲文符号 (BRAILLE)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn text-white" @click="copyText(brailleText)">
                  📋 复制
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="brailleText"
                class="code-editor result-editor braille-text"
                placeholder="在此输入或录入盲文符号..."
                spellcheck="false"
                @input="brailleToText"
              ></textarea>
            </div>
          </section>
        </div>

        <div class="bottom-layout">
          <!-- Interactive Braille Padding -->
          <section class="brutal-pane flex-1">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">✋ 交互式盲文录入 (6点式)</span>
            </div>
            <div class="interactive-area">
              <div class="braille-matrix">
                <div class="dots-grid">
                  <div
                    v-for="dot in 6"
                    :key="dot"
                    class="dot-btn"
                    :class="{ active: currentDots.includes(dot) }"
                    @click="toggleDot(dot)"
                  >
                    {{ dot }}
                  </div>
                </div>
              </div>
              <div class="braille-actions">
                <div class="preview-char">{{ currentBrailleChar }}</div>
                <div class="btn-group">
                  <button
                    class="brutal-btn bg-yellow"
                    :disabled="currentDots.length === 0"
                    @click="addBrailleChar"
                  >
                    ➕ 添加字符
                  </button>
                  <button class="brutal-btn" @click="currentDots = []">🧹 清除配置</button>
                </div>
              </div>
            </div>
          </section>

          <!-- Tips Section -->
          <section class="brutal-pane flex-1">
            <div class="pane-header border-bottom">
              <span class="panel-title">💡 关于盲文</span>
            </div>
            <div class="tips-content">
              <div class="k-item">
                <b>六点系统</b>
                <p>经典的路易·布莱叶盲文系统基于 2x3 的六点阵，可以组成 64 种不同的编码方案。</p>
              </div>
              <div class="k-item mt-2">
                <b>转换原则</b>
                <p>本工具使用 Unicode 标准盲文图案（U+2800 到 U+28FF）。</p>
              </div>
              <div class="k-item mt-2">
                <b>局限性</b>
                <p>
                  自动转换主要基于英文字母及基础标点。中文盲文较为复杂（涉及声母、韵母、声调组合），本工具提供基础对照转换。
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const { copyToClipboard } = useCopy();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputText = ref('');
  const brailleText = ref('');
  const currentDots = ref([]);

  // 基础映射 (A-Z, 0-9)
  const textToBrailleMap = {
    a: '⠁',
    b: '⠃',
    c: '⠉',
    d: '⠙',
    e: '⠑',
    f: '⠋',
    g: '⠛',
    h: '⠓',
    i: '⠊',
    j: '⠚',
    k: '⠇',
    l: '⠸',
    m: '⠭',
    n: '⠽',
    o: '⠕',
    p: '⠏',
    q: '⠿',
    r: '⠗',
    s: '⠎',
    t: '⠞',
    u: '⠥',
    v: '⠧',
    w: '⠺',
    x: '⠭',
    y: '⠽',
    z: '⠵',
    1: '⠂',
    2: '⠆',
    3: '⠒',
    4: '⠲',
    5: '⠢',
    6: '⠖',
    7: '⠶',
    8: '⠦',
    9: '⠔',
    0: '⠴',
    ' ': '⠀',
    '.': '⠲',
    ',': '⠂',
    '!': '⠖',
    '?': '⠦',
    '-': '⠤'
  };

  const brailleToTextMap = Object.fromEntries(
    Object.entries(textToBrailleMap).map(([k, v]) => [v, k])
  );

  const textToBraille = () => {
    const chars = inputText.value.split('');
    brailleText.value = chars
      .map(char => {
        const lowerChar = char.toLowerCase();
        if (textToBrailleMap[lowerChar]) return textToBrailleMap[lowerChar];

        // Handle Chinese or special chars: Use pattern U+2800 (Blank) + 4 hex Unicode chars
        const hex = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
        return (
          '⠀' +
          hex
            .split('')
            .map(c => textToBrailleMap[c.toLowerCase()])
            .join('')
        );
      })
      .join('');
  };

  const brailleToText = () => {
    const symbols = brailleText.value.split('');
    let result = '';
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i] === '⠀' && i + 4 < symbols.length) {
        const hex = symbols
          .slice(i + 1, i + 5)
          .map(s => brailleToTextMap[s] || '')
          .join('');
        if (hex.length === 4) {
          try {
            result += String.fromCharCode(parseInt(hex, 16));
            i += 4;
            continue;
          } catch {
            // fallback
          }
        }
      }
      result += brailleToTextMap[symbols[i]] || symbols[i];
    }
    inputText.value = result;
  };

  const toggleDot = dot => {
    const idx = currentDots.value.indexOf(dot);
    if (idx > -1) {
      currentDots.value.splice(idx, 1);
    } else {
      currentDots.value.push(dot);
    }
  };

  const currentBrailleChar = computed(() => {
    if (currentDots.value.length === 0) return '⠀';

    let offset = 0;
    if (currentDots.value.includes(1)) offset += 1;
    if (currentDots.value.includes(2)) offset += 2;
    if (currentDots.value.includes(3)) offset += 4;
    if (currentDots.value.includes(4)) offset += 8;
    if (currentDots.value.includes(5)) offset += 16;
    if (currentDots.value.includes(6)) offset += 32;

    return String.fromCharCode(0x2800 + offset);
  });

  const addBrailleChar = () => {
    brailleText.value += currentBrailleChar.value;
    brailleToText();
    currentDots.value = [];
  };

  const copyText = t => {
    if (!t) return;
    copyToClipboard(t, { success: '已复制' });
  };

  const reset = () => {
    inputText.value = '';
    brailleText.value = '';
    currentDots.value = [];
  };

  const init = () => {
    inputText.value = 'hello braille';
    textToBraille();
  };

  onMounted(init);
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
    max-width: 1400px;
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
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    border-color: #cbd5e1;
    box-shadow: none;
    transform: none;
    cursor: not-allowed;
  }

  .min-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    box-shadow: 3px 3px 0px #111;
  }

  .badge {
    background: #111;
    color: #ff4b4b;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 3px solid #ff4b4b;
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1.5rem;
    align-items: stretch;
    min-height: 400px;
  }

  .bottom-layout {
    display: flex;
    gap: 2rem;
  }

  .flex-1 {
    flex: 1;
  }

  @media (max-width: 1024px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
    .bottom-layout {
      flex-direction: column;
    }
    .switch-area {
      flex-direction: row !important;
      justify-content: center;
    }
  }

  .brutal-pane {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .border-bottom {
    border-bottom: 3px solid #111;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .text-white {
    color: #fff;
  }

  .text-white.icon-btn {
    color: #fff;
    border-color: #111;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
    box-shadow: 2px 2px 0px #111;
  }

  .icon-btn:hover {
    box-shadow: 3px 3px 0px #111;
  }

  .switch-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    min-height: 250px;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1.1rem;
    line-height: 1.6;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .braille-text {
    font-size: 2rem;
    letter-spacing: 4px;
    font-weight: bold;
    color: #ff4b4b;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .interactive-area {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 1.5rem;
    gap: 1.5rem;
    background: #fff;
    flex-wrap: wrap;
  }

  .braille-matrix {
    padding: 1rem;
    background: #fdfae5;
    border: 3px dashed #111;
  }

  .dots-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .dot-btn {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    color: #111;
    transition: all 0.1s;
    user-select: none;
  }

  .dot-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .dot-btn.active {
    background: #111;
    color: #ffd900;
    border-color: #111;
  }

  .braille-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .preview-char {
    font-size: 6rem;
    line-height: 1;
    color: #ff4b4b;
    font-weight: bold;
    text-shadow: 4px 4px 0px #111;
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-group {
    display: flex;
    gap: 1rem;
  }

  .tips-content {
    padding: 1.5rem;
    background: #fff;
    flex: 1;
  }

  .k-item {
    padding: 1rem;
    border: 2px dashed #111;
    background: #fdfae5;
  }

  .k-item b {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    color: #ff4b4b;
  }

  .k-item p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .mt-2 {
    margin-top: 1rem;
  }

  /* Dark theme */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .border-bottom {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:disabled {
    background: #333;
    color: #888;
    border-color: #555;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .code-editor {
    color: #eee;
  }
  [data-theme='dark'] .result-editor {
    background: #222;
  }
  [data-theme='dark'] .braille-text {
    color: #ff4b4b;
  }
  [data-theme='dark'] .interactive-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .braille-matrix {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .dot-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .dot-btn.active {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .tips-content {
    background: #1a1a1a;
  }
  [data-theme='dark'] .k-item {
    background: #222;
    border-color: #555;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .preview-char {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
