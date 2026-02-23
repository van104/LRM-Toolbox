<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">文本<span>加密脱敏()</span></h1>
        <div class="badge">🔒 Text Security</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 输入 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 源文本 (INPUT)</span>
              <div class="panel-actions">
                <span v-if="inputText" class="stats-info">{{ inputText.length }} 字符</span>
                <button class="brutal-btn icon-btn" title="示例" @click="fillDemoData">
                  ✨ 示例
                </button>
                <button class="brutal-btn icon-btn" title="粘贴" @click="pasteText">📋 粘贴</button>
                <button class="brutal-btn icon-btn" title="清空" @click="clearInput">
                  🗑️ 清空
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此输入需要处理的文本..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- 2. 工具面板 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 操作面板 (OPERATE)</span>
            </div>
            <div class="mode-tabs">
              <button
                :class="['tab-btn', { active: currentTab === 'mask' }]"
                @click="currentTab = 'mask'"
              >
                🛡️ 脱敏
              </button>
              <button
                :class="['tab-btn', { active: currentTab === 'encrypt' }]"
                @click="currentTab = 'encrypt'"
              >
                🔒 加密
              </button>
              <button
                :class="['tab-btn', { active: currentTab === 'obfuscate' }]"
                @click="currentTab = 'obfuscate'"
              >
                👁️ 混淆
              </button>
            </div>

            <div class="tools-scroll-area">
              <div v-if="currentTab === 'mask'" class="tool-group">
                <div class="control-row">
                  <label>预设模式提取脱敏:</label>
                  <div class="grid-2">
                    <button class="brutal-btn execute-btn" @click="doMask('phone')">
                      📞 手机号
                    </button>
                    <button class="brutal-btn execute-btn" @click="doMask('idcard')">
                      🆔 身份证
                    </button>
                    <button class="brutal-btn execute-btn" @click="doMask('email')">📧 邮箱</button>
                    <button class="brutal-btn execute-btn" @click="doMask('name')">👤 姓名</button>
                    <button class="brutal-btn execute-btn" @click="doMask('bank')">
                      💳 银行卡
                    </button>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="control-row">
                  <label>自定义正则脱敏:</label>
                  <input
                    v-model="maskOptions.regex"
                    class="brutal-input"
                    placeholder="例如: \d{4}"
                  />
                </div>
                <div class="control-row">
                  <label>替换字符:</label>
                  <input
                    v-model="maskOptions.char"
                    class="brutal-input"
                    placeholder="*"
                    maxlength="1"
                  />
                </div>
                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doMask('custom')">
                    执行自定义正则脱敏
                  </button>
                </div>
              </div>

              <div v-if="currentTab === 'encrypt'" class="tool-group">
                <div class="control-row">
                  <label>凯撒密码 (Caesar):</label>
                  <div class="flex-row">
                    <input
                      v-model.number="encryptOptions.caesarShift"
                      type="number"
                      class="brutal-input small"
                      placeholder="偏移"
                    />
                    <button class="brutal-btn small-btn" @click="doCaesar('enc')">向上加密</button>
                    <button class="brutal-btn small-btn" @click="doCaesar('dec')">向下解密</button>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="control-row">
                  <label>异或运算 (XOR Hex):</label>
                  <div class="flex-row">
                    <input
                      v-model="encryptOptions.xorKey"
                      class="brutal-input"
                      placeholder="自定义密钥"
                    />
                    <button class="brutal-btn small-btn execute-btn" @click="doXor">
                      运算输出
                    </button>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="control-row">
                  <label>摩尔斯电码 (Morse):</label>
                  <div class="flex-row">
                    <button class="brutal-btn small-btn" @click="doMorse('enc')">
                      文本 → 摩斯
                    </button>
                    <button class="brutal-btn small-btn" @click="doMorse('dec')">
                      摩斯 → 文本
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="currentTab === 'obfuscate'" class="tool-group">
                <div class="control-row">
                  <label>零宽字符随机插入 (防复制/匹配):</label>
                  <p class="hint">
                    原理：在字符间随机插入零宽空格，人眼不可见，但在后台代码中被隐形分隔。
                  </p>
                </div>
                <div class="action-buttons">
                  <button class="brutal-btn execute-btn" @click="doZeroWidth">
                    执行防复制混淆
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. 输出 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 处理结果 (RESULT)</span>
              <div class="panel-actions">
                <span v-if="outputText" class="stats-info">{{ outputText.length }} 字符</span>
                <button class="brutal-btn icon-btn" title="复制" @click="copyResult">
                  📋 复制
                </button>
                <button class="brutal-btn icon-btn" title="清空" @click="clearOutput">
                  🗑️ 清空
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="outputText"
                class="code-editor result-editor"
                readonly
                placeholder="结果将显示在这里..."
              ></textarea>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const outputText = ref('');

  const currentTab = ref('mask');

  const maskOptions = reactive({
    regex: '',
    char: '*'
  });

  const encryptOptions = reactive({
    caesarShift: 3,
    xorKey: 'KEY'
  });

  const MORSE_CODE = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
    1: '.----',
    2: '..---',
    3: '...--',
    4: '....-',
    5: '.....',
    6: '-....',
    7: '--...',
    8: '---..',
    9: '----.',
    0: '-----',
    ' ': '/'
  };

  const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k]));

  function doMask(type) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    let text = inputText.value;

    switch (type) {
      case 'phone':
        text = text.replace(/(\d{3})\d{4}(\d{4})/g, '$1****$2');
        break;
      case 'idcard':
        text = text.replace(/(\d{6})\d{8}(\d{3}[0-9Xx])/g, '$1********$2');
        break;
      case 'email':
        text = text.replace(/(\w{1,3})[\w.-]+@([\w.-]+)/g, '$1***@$2');
        break;
      case 'name':
        text = text.replace(/([\u4e00-\u9fa5])[\u4e00-\u9fa5]+/g, (match, p1) => {
          return p1 + '*'.repeat(match.length - 1);
        });
        break;
      case 'bank':
        text = text.replace(/\d{12,19}/g, match => {
          return '*'.repeat(match.length - 4) + match.slice(-4);
        });
        break;
      case 'custom':
        try {
          const re = new RegExp(maskOptions.regex, 'g');
          const char = maskOptions.char || '*';
          text = text.replace(re, match => char.repeat(match.length));
        } catch {
          ElMessage.error('正则表达式有误');
          return;
        }
        break;
    }
    outputText.value = text;
    ElMessage.success('脱敏完成');
  }

  function doCaesar(mode) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    const shift = (encryptOptions.caesarShift || 3) * (mode === 'dec' ? -1 : 1);

    outputText.value = inputText.value
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((((code - 65 + shift) % 26) + 26) % 26) + 65);
        }
        if (code >= 97 && code <= 122) {
          return String.fromCharCode(((((code - 97 + shift) % 26) + 26) % 26) + 97);
        }
        return char;
      })
      .join('');
    ElMessage.success('凯撒处理完成');
  }

  function doXor() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    const key = encryptOptions.xorKey || 'KEY';
    let result = '';

    for (let i = 0; i < inputText.value.length; i++) {
      const charCode = inputText.value.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const xor = charCode ^ keyChar;
      result += xor.toString(16).padStart(2, '0').toUpperCase() + ' ';
    }
    outputText.value = result.trim();
    ElMessage.success('XOR 运算完成 (Hex)');

    if (/^([0-9A-Fa-f]{2}\s*)+$/.test(inputText.value)) {
      try {
        const hexes = inputText.value.match(/[0-9A-Fa-f]{2}/g) || [];
        let decrypted = '';
        for (let i = 0; i < hexes.length; i++) {
          const charCode = parseInt(hexes[i], 16);
          const keyChar = key.charCodeAt(i % key.length);
          decrypted += String.fromCharCode(charCode ^ keyChar);
        }
        ElMessage.info(`预览还原文本: ${decrypted.slice(0, 30)}...`);
      } catch {
        // Ignore errors
      }
    }
  }

  function doMorse(mode) {
    if (!inputText.value) return ElMessage.warning('请先输入文本');
    if (mode === 'enc') {
      outputText.value = inputText.value
        .toUpperCase()
        .split('')
        .map(c => MORSE_CODE[c] || c)
        .join(' ');
    } else {
      outputText.value = inputText.value
        .split(/\s+/)
        .map(c => MORSE_REVERSE[c] || c)
        .join('')
        .replace(/\//g, ' ');
    }
    ElMessage.success('摩尔斯转换完成');
  }

  function doZeroWidth() {
    if (!inputText.value) return ElMessage.warning('请先输入文本');

    const chars = inputText.value.split('');
    outputText.value = chars
      .map(c => {
        return c + (Math.random() > 0.3 ? '\u200B' : '');
      })
      .join('');

    ElMessage.success('已插入零宽字符');
  }

  function fillDemoData() {
    if (currentTab.value === 'mask') {
      inputText.value = `张三, 13812345678, 51010119900101123X\n李四, lisi@example.com`;
    } else if (currentTab.value === 'encrypt') {
      inputText.value = `Hello World`;
      if (encryptOptions.xorKey === '') encryptOptions.xorKey = 'KEY';
    } else {
      inputText.value = `这段文字将被秘密混淆，防提取。`;
    }
    ElMessage.success('已加载示例数据');
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch {
      ElMessage.error('无法读取剪贴板');
    }
  }

  function clearInput() {
    inputText.value = '';
    outputText.value = '';
  }

  function clearOutput() {
    outputText.value = '';
  }

  function copyResult() {
    copyToClipboard(outputText.value, { success: '已复制结果' });
  }

  function goHome() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }
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
    opacity: 0.5;
    cursor: not-allowed;
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
    grid-template-columns: 1fr 400px 1fr;
    gap: 2rem;
    align-items: stretch;
    height: calc(100vh - 180px);
    min-height: 600px;
  }

  @media (max-width: 1024px) {
    .layout-grid {
      grid-template-columns: 1fr;
      height: auto;
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

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stats-info {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    font-weight: 700;
    background: #fff;
    color: #111;
    border: 2px solid #111;
    padding: 2px 6px;
  }
  .text-white .stats-info {
    background: #111;
    color: #fff;
    border: 2px solid #fff;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 0.95rem;
    line-height: 1.5;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .mode-tabs {
    display: flex;
    border-bottom: 3px solid #111;
    background: #fdfae5;
  }

  .tab-btn {
    flex: 1;
    padding: 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    background: transparent;
    border: none;
    border-right: 3px solid #111;
    color: #111;
    cursor: pointer;
    transition: all 0.1s;
  }
  .tab-btn:last-child {
    border-right: none;
  }
  .tab-btn.active {
    background: #111;
    color: #ff7be5;
  }

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #fdfae5;
  }

  .tool-group {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .control-row label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    color: #111;
  }

  .flex-row {
    display: flex;
    gap: 0.4rem;
    align-items: center;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .brutal-input {
    flex: 1;
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.5rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    outline: none;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #111;
    min-width: 0;
  }
  .brutal-input:focus {
    box-shadow: 3px 3px 0px #ff4b4b;
  }
  .brutal-input.small {
    flex: 0 0 60px;
  }

  .divider {
    height: 3px;
    background: #111;
    margin: 0.5rem 0;
  }

  .hint {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #333;
    background: #fff;
    border: 2px dashed #111;
    padding: 0.6rem;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin-top: 1rem;
  }
  .small-btn {
    padding: 0.5rem 0.6rem;
    font-size: 0.85rem;
    box-shadow: 2px 2px 0px #111;
    white-space: nowrap;
  }

  .execute-btn {
    background: #fff;
    color: #111;
  }
  .execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
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
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
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
  [data-theme='dark'] .mode-tabs {
    background: #1a1a1a;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .tab-btn {
    color: #eee;
    border-right-color: #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .control-row label {
    color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .divider {
    background: #eee;
  }
  [data-theme='dark'] .hint {
    background: #222;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .execute-btn,
  [data-theme='dark'] .text-white .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled),
  [data-theme='dark'] .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
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
  [data-theme='dark'] .stats-info {
    background: #222;
    color: #eee;
    border-color: #eee;
  }
</style>
