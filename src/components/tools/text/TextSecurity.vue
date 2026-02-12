<template>
  <div class="text-security">
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>文本加密与脱敏</h1>
        <span class="nav-subtitle">Text Security & Obfuscation</span>
      </div>
      <div class="nav-spacer">
        <button class="nav-back help-btn" title="使用说明" @click="showHelp = true">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <div class="security-layout">
        <section class="panel input-panel">
          <div class="panel-header">
            <span class="panel-title">源文本</span>
            <div class="panel-actions">
              <span v-if="inputText" class="stats-info">{{ inputText.length }} 字符</span>
              <button class="icon-btn" title="示例数据" @click="fillDemoData">
                <span style="font-size: 13px; font-weight: bold">Demo</span>
              </button>
              <button class="icon-btn" title="粘贴" @click="pasteText">
                <el-icon>
                  <CopyDocument />
                </el-icon>
              </button>
              <button class="icon-btn" title="清空" @click="clearInput">
                <el-icon>
                  <Delete />
                </el-icon>
              </button>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              v-model="inputText"
              class="text-editor"
              placeholder="在此输入需要处理的文本..."
              spellcheck="false"
            ></textarea>
          </div>
        </section>

        <section class="tools-panel">
          <div class="tabs-header">
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

          <div class="tools-content">
            <div v-if="currentTab === 'mask'" class="tool-group">
              <div class="control-row">
                <label>预设模式:</label>
                <div class="grid-2">
                  <button class="action-btn" @click="doMask('phone')">📞 手机号</button>
                  <button class="action-btn" @click="doMask('idcard')">🆔 身份证</button>
                  <button class="action-btn" @click="doMask('email')">📧 邮箱</button>
                  <button class="action-btn" @click="doMask('name')">👤 姓名</button>
                  <button class="action-btn" @click="doMask('bank')">💳 银行卡</button>
                </div>
              </div>
              <div class="divider"></div>
              <div class="control-row">
                <label>自定义正则:</label>
                <input v-model="maskOptions.regex" class="text-input" placeholder="例如: \d{4}" />
              </div>
              <div class="control-row">
                <label>替换字符:</label>
                <input
                  v-model="maskOptions.char"
                  class="text-input"
                  placeholder="*"
                  maxlength="1"
                />
              </div>
              <button class="action-btn primary" @click="doMask('custom')">
                执行自定义自定义脱敏
              </button>
            </div>

            <div v-if="currentTab === 'encrypt'" class="tool-group">
              <div class="control-container">
                <div class="sub-group">
                  <label>凯撒密码 (Caesar):</label>
                  <div class="flex-row">
                    <input
                      v-model.number="encryptOptions.caesarShift"
                      type="number"
                      class="text-input small"
                      placeholder="偏移"
                    />
                    <button class="action-btn small" @click="doCaesar('enc')">加密</button>
                    <button class="action-btn small" @click="doCaesar('dec')">解密</button>
                  </div>
                </div>

                <div class="sub-group">
                  <label>异或加密 (XOR):</label>
                  <div class="flex-row">
                    <input
                      v-model="encryptOptions.xorKey"
                      class="text-input small"
                      placeholder="密钥"
                    />
                    <button class="action-btn small" @click="doXor">运算 (Hex)</button>
                  </div>
                </div>

                <div class="sub-group">
                  <label>摩尔斯电码 (Morse):</label>
                  <div class="flex-row">
                    <button class="action-btn small" @click="doMorse('enc')">Text → Morse</button>
                    <button class="action-btn small" @click="doMorse('dec')">Morse → Text</button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="currentTab === 'obfuscate'" class="tool-group">
              <div class="control-row">
                <label>零宽字符插入:</label>
                <p class="hint">在字符间随机插入零宽空格，人眼不可见但破坏机器匹配。</p>
              </div>
              <button class="action-btn primary" @click="doZeroWidth">🛡️ 执行防复制混淆</button>
            </div>
          </div>
        </section>

        <section class="panel output-panel">
          <div class="panel-header">
            <span class="panel-title">处理结果</span>
            <div class="panel-actions">
              <span v-if="outputText" class="stats-info">{{ outputText.length }} 字符</span>
              <button class="icon-btn" title="复制结果" @click="copyResult">
                <el-icon>
                  <CopyDocument />
                </el-icon>
              </button>
              <button class="icon-btn" title="清空" @click="clearOutput">
                <el-icon>
                  <Delete />
                </el-icon>
              </button>
            </div>
          </div>
          <div class="editor-wrapper">
            <textarea
              v-model="outputText"
              class="text-editor result-editor"
              readonly
              placeholder="结果将显示在这里..."
            ></textarea>
          </div>
        </section>
      </div>

      <Transition name="fade">
        <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>使用说明</h3>
              <button class="close-btn" @click="showHelp = false">×</button>
            </div>
            <div class="modal-body">
              <div class="help-section">
                <h4>🛡️ 脱敏模式</h4>
                <p>• <b>预设</b>：快速隐藏手机、身份证、邮箱等隐私信息。</p>
                <p>• <b>自定义</b>：使用正则表达式匹配需要隐藏的内容。</p>
              </div>
              <div class="help-section">
                <h4>🔒 加密模式</h4>
                <p>• <b>凯撒密码</b>：字母偏移加密（支持中文保持不变）。</p>
                <p>• <b>XOR</b>：简单的异或运算，结果输出为 Hex 字符串。</p>
                <p>• <b>摩尔斯</b>：仅支持英文和数字。</p>
              </div>
              <div class="help-section">
                <h4>👁️ 混淆模式</h4>
                <p>
                  •
                  <b>防复制</b
                  >：插入不可见的零宽字符，复制后粘贴到搜索框可能无法搜索到原词，用于防爬虫或防匹配。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 文本加密与脱敏</footer>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Delete, CopyDocument, QuestionFilled } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const outputText = ref('');

  const currentTab = ref('mask');
  const showHelp = ref(false);

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
  // const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k])); // Unused variable

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

    if (/^([0-9A-Fa-f]{2}\s*)+$/.test(inputText.value)) {
      try {
        const hexes = inputText.value.match(/[0-9A-Fa-f]{2}/g) || [];
        // let decrypted = '';
        for (let i = 0; i < hexes.length; i++) {
          // const charCode = parseInt(hexes[i], 16);
          // const keyChar = key.charCodeAt(i % key.length);
          // decrypted += String.fromCharCode(charCode ^ keyChar);
        }
        // console.log('Decrypted preview:', decrypted); // Unused decrypted variable
      } catch {
        // Ignore errors
      }
    }

    ElMessage.success('XOR 运算完成 (Hex)');
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
      outputText.value = inputText.value.split(/\s+|\//);
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
      inputText.value = `张三, 13812345678, 510101199001011234\n李四, lisi@example.com`;
    } else if (currentTab.value === 'encrypt') {
      inputText.value = `Hello World`;
      if (encryptOptions.xorKey === '') encryptOptions.xorKey = 'KEY';
    } else {
      inputText.value = `这段文字将被秘密混淆，复制去试试？`;
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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .text-security {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #e5e7eb;
    --text: #1f2937;
    --text-secondary: #6b7280;
    --accent: #ef4444;

    --accent-light: #fef2f2;

    font-family: 'Noto Sans SC', sans-serif;
    background: var(--bg);
    height: 100vh;

    color: var(--text);
    display: flex;
    flex-direction: column;
    overflow: hidden;
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

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nav-back:hover {
    background: var(--accent-light);
    color: var(--accent);
  }

  .nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
  }

  .nav-subtitle {
    display: block;
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav-spacer {
    width: 60px;
    display: flex;
    justify-content: flex-end;
  }

  .main-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .security-layout {
    display: flex;
    gap: 1.5rem;
    flex: 1;

    height: auto;

    min-height: 0;
  }

  .panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .tools-panel {
    flex: 0.6;
    min-width: 300px;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    background: #f9fafb;
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    color: var(--text);
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--text-secondary);
    border-radius: 4px;
  }

  .icon-btn:hover {
    background: var(--accent-light);
    color: var(--accent);
  }

  .editor-wrapper {
    flex: 1;
  }

  .text-editor {
    width: 100%;
    height: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    background: transparent;
    color: var(--text);
    outline: none;
    line-height: 1.6;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .tabs-header {
    display: flex;
    background: #f9fafb;
    border-bottom: 1px solid var(--border);
  }

  .tab-btn {
    flex: 1;
    padding: 0.8rem;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .tab-btn.active {
    color: var(--accent);
    border-bottom-color: var(--accent);
    background: white;
  }

  .tools-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tool-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .control-row label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .text-input {
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
  }

  .text-input:focus {
    border-color: var(--accent);
  }

  .text-input.small {
    width: 60px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 0.5rem 0;
  }

  .action-btn {
    padding: 0.6rem;
    border: 1px solid var(--border);
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .action-btn.primary {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .action-btn.primary:hover {
    background: #dc2626;
    border-color: #dc2626;
  }

  .action-btn.small {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .control-container {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .sub-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .sub-group label {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .flex-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .stats-info {
    font-size: 0.75rem;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--text-secondary);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    background: var(--card);
    width: 90%;
    max-width: 500px;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .close-btn {
    border: none;
    background: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
  }

  .help-section h4 {
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .help-section p {
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111827;
      --card: #1f2937;
      --border: #374151;
      --text: #f9fafb;
      --text-secondary: #9ca3af;
      --accent: #f87171;
      --accent-light: rgba(248, 113, 113, 0.1);
    }

    .panel-header,
    .tabs-header,
    .modal-header {
      background: #1f2937;
    }

    .result-editor {
      background: #1f2937;
    }

    .text-input,
    .action-btn {
      background: #374151;
      border-color: #4b5563;
      color: white;
    }

    .action-btn.primary {
      background: var(--accent);
      color: #1f2937;
    }

    .tab-btn.active {
      background: #374151;
    }
  }
</style>
