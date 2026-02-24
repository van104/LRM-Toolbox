<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$emit('back')">← 返回</button>
        <h1 class="brutal-title">JS混淆器<span>.工具()</span></h1>
        <button class="brutal-btn clear-btn" @click="clearAll">清空全部</button>
      </header>

      <!-- 顶部配置区 -->
      <div class="brutal-pane config-pane">
        <div class="pane-header bg-pink">
          <span>混淆策略配置.Options</span>
        </div>
        <div class="pane-content config-grid">
          <div class="config-group">
            <label class="brutal-checkbox">
              <input v-model="options.compact" type="checkbox" />
              <span class="checkmark"></span>
              紧凑代码 (Compact)
            </label>
            <label class="brutal-checkbox" title="将代码转换为单行">
              <input v-model="options.simplify" type="checkbox" />
              <span class="checkmark"></span>
              简化代码 (Simplify)
            </label>
            <label class="brutal-checkbox" title="完全禁用 console.log 等输出">
              <input v-model="options.disableConsoleOutput" type="checkbox" />
              <span class="checkmark"></span>
              禁用控制台 (Disable Console)
            </label>
          </div>

          <div class="config-group">
            <label
              class="brutal-checkbox"
              title="打乱代码执行顺序，极大地增加逆向难度，但会降低执行效率"
            >
              <input v-model="options.controlFlowFlattening" type="checkbox" />
              <span class="checkmark"></span>
              控制流平坦化 (Flow Flattening)
            </label>
            <label class="brutal-checkbox" title="随机注入废弃代码，增加文件体积和迷惑性">
              <input v-model="options.deadCodeInjection" type="checkbox" />
              <span class="checkmark"></span>
              死代码注入 (Dead Code Injection)
            </label>
            <label class="brutal-checkbox" title="将字符串提取到数组中并加密">
              <input v-model="options.stringArray" type="checkbox" />
              <span class="checkmark"></span>
              启用字符串阵列 (String Array)
            </label>
          </div>

          <div class="config-group select-group">
            <div class="input-item">
              <span>变量名生成策略:</span>
              <select v-model="options.identifierNamesGenerator" class="brutal-select">
                <option value="hexadecimal">十六进制 (Hexadecimal)</option>
                <option value="mangled">短名称混淆 (Mangled)</option>
              </select>
            </div>
            <div class="input-item">
              <span>字符串加密方式:</span>
              <select
                v-model="options.stringArrayEncoding"
                class="brutal-select"
                :disabled="!options.stringArray"
              >
                <option value="none">无 (None)</option>
                <option value="base64">Base64</option>
                <option value="rc4">RC4 加密</option>
              </select>
            </div>
            <div class="input-item">
              <span>混淆强度预设:</span>
              <button class="brutal-btn preset-btn" @click="applyPreset('low')">低</button>
              <button class="brutal-btn preset-btn" @click="applyPreset('high')">高</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮区 -->
      <div class="brutal-toolbar">
        <div class="tools-left">
          <button
            class="brutal-action-btn primary bg-yellow"
            :disabled="isProcessing"
            @click="handleObfuscate"
          >
            {{ isProcessing ? '加载/混淆中...' : '执行混淆.RUN()' }}
          </button>
          <button class="brutal-action-btn" @click="loadSample">加载示例代码</button>
        </div>
        <div class="tools-right">
          <button class="brutal-action-btn" :disabled="!outputCode" @click="copyCode">
            复制结果.COPY
          </button>
        </div>
      </div>

      <!-- 输入与输出网格 -->
      <div class="brutal-grid code-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-green">
            <span>原始代码.Source</span>
            <div class="pane-actions">
              <span class="char-count">{{ inputCode.length }} Chars</span>
            </div>
          </div>
          <textarea
            v-model="inputCode"
            class="brutal-editor"
            placeholder="// 在此输入需要混淆的 JavaScript 代码...&#10;&#10;function helloWorld() {&#10;  console.log('Hello, Neobrutalism!');&#10;}"
            spellcheck="false"
          ></textarea>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-pink">
            <span>混淆结果.Output</span>
            <div class="pane-actions">
              <span v-if="outputCode" class="char-count"
                >{{ outputCode.length }} Chars ({{ compressionRatio }}x)</span
              >
            </div>
          </div>
          <textarea
            v-model="outputCode"
            class="brutal-editor output-editor"
            placeholder="// 混淆后的代码将显示在这里..."
            readonly
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';

  defineEmits(['back']);

  // 状态
  const inputCode = ref('');
  const outputCode = ref('');
  const isProcessing = ref(false);

  // 混淆配置选项
  const options = reactive({
    compact: true,
    simplify: true,
    disableConsoleOutput: false,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: 'none', // 'none', 'base64', 'rc4'
    identifierNamesGenerator: 'hexadecimal' // 'hexadecimal', 'mangled'
  });

  // 计算代码体积比例
  const compressionRatio = computed(() => {
    if (!inputCode.value || !outputCode.value) return '0.00';
    return (outputCode.value.length / inputCode.value.length).toFixed(2);
  });

  // 动态加载 javascript-obfuscator 的浏览器版本 CDN
  const loadObfuscator = async () => {
    if (window.JavaScriptObfuscator) {
      return window.JavaScriptObfuscator;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/javascript-obfuscator/dist/index.browser.js';
      script.onload = () => resolve(window.JavaScriptObfuscator);
      script.onerror = () => reject(new Error('CDN加载失败，请检查网络'));
      document.head.appendChild(script);
    });
  };

  // 执行混淆
  const handleObfuscate = async () => {
    if (!inputCode.value.trim()) {
      alert('请先输入需要混淆的 JavaScript 代码！');
      return;
    }

    isProcessing.value = true;

    try {
      // 动态等待库加载完成
      const Obfuscator = await loadObfuscator();

      // 构造传递给核心库的参数
      const obfuscateConfig = {
        compact: options.compact,
        simplify: options.simplify,
        disableConsoleOutput: options.disableConsoleOutput,
        controlFlowFlattening: options.controlFlowFlattening,
        controlFlowFlatteningThreshold: options.controlFlowFlattening ? 0.75 : 0,
        deadCodeInjection: options.deadCodeInjection,
        deadCodeInjectionThreshold: options.deadCodeInjection ? 0.4 : 0,
        stringArray: options.stringArray,
        stringArrayEncoding:
          options.stringArrayEncoding === 'none' ? [] : [options.stringArrayEncoding],
        identifierNamesGenerator: options.identifierNamesGenerator,
        // 常用防御性配置
        selfDefending: false,
        debugProtection: false
      };

      const obfuscationResult = Obfuscator.obfuscate(inputCode.value, obfuscateConfig);

      outputCode.value = obfuscationResult.getObfuscatedCode();
    } catch (error) {
      console.error('混淆失败:', error);
      outputCode.value = `/* 混淆发生错误 */\n${error.message}`;
    } finally {
      isProcessing.value = false;
    }
  };

  // 预设配置
  const applyPreset = level => {
    if (level === 'low') {
      options.compact = true;
      options.simplify = true;
      options.disableConsoleOutput = false;
      options.controlFlowFlattening = false;
      options.deadCodeInjection = false;
      options.stringArray = true;
      options.stringArrayEncoding = 'none';
      options.identifierNamesGenerator = 'hexadecimal';
    } else if (level === 'high') {
      options.compact = true;
      options.simplify = false;
      options.disableConsoleOutput = true;
      options.controlFlowFlattening = true;
      options.deadCodeInjection = true;
      options.stringArray = true;
      options.stringArrayEncoding = 'rc4';
      options.identifierNamesGenerator = 'hexadecimal';
    }
  };

  // 加载示例代码
  const loadSample = () => {
    inputCode.value = `// 这是一个示例核心算法逻辑
function verifyUserAccess(username, token) {
  const secretKey = "SuperSecretNeobrutalismKey";
  const validToken = btoa(username + ":" + secretKey);
  
  console.log("Verifying access for:", username);
  
  if (token === validToken) {
    console.log("Access Granted!");
    return { status: 200, message: "Welcome admin." };
  } else {
    console.warn("Access Denied!");
    return { status: 403, message: "Forbidden." };
  }
}

const result = verifyUserAccess("admin", "YWRtaW46U3VwZXJTZWNyZXROZW9icnV0YWxpc21LZXk=");
console.log(result);`;
    outputCode.value = '';
  };

  // 复制结果
  const copyCode = async () => {
    if (!outputCode.value) return;
    try {
      await navigator.clipboard.writeText(outputCode.value);
      alert('混淆代码已复制到剪贴板！');
    } catch {
      // 回退方案，移除了未使用的 err 变量
      const textarea = document.createElement('textarea');
      textarea.value = outputCode.value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('混淆代码已复制到剪贴板！');
    }
  };

  // 清空全部
  const clearAll = () => {
    inputCode.value = '';
    outputCode.value = '';
  };
</script>

<style scoped>
  /* ==========================================================================
   Neobrutalism UI 核心变量与字体
   ========================================================================== */
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');

  .brutal-wrapper {
    min-height: 100vh;
    background: #f4f4f0;
    padding: 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    color: #111;
    transition:
      background 0.3s,
      color 0.3s;
  }

  .brutal-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ==========================================================================
   头部 (Header)
   ========================================================================== */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 4px solid #111;
    padding: 1rem 2rem;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
  }

  .brutal-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
  }
  .brutal-title span {
    color: #ff0055;
  }

  /* ==========================================================================
   配置面板 (Config Pane)
   ========================================================================== */
  .config-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }
  .config-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 1.5rem;
  }
  .config-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .select-group .input-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
  }

  /* Brutal Checkbox */
  .brutal-checkbox {
    display: flex;
    align-items: center;
    position: relative;
    padding-left: 35px;
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    font-weight: 600;
    user-select: none;
  }
  .brutal-checkbox input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    background-color: #fff;
    border: 3px solid #111;
    transition: all 0.1s;
  }
  .brutal-checkbox:hover input ~ .checkmark {
    background-color: #f0f0f0;
  }
  .brutal-checkbox input:checked ~ .checkmark {
    background-color: #ff0055;
  }
  .checkmark:after {
    content: '';
    position: absolute;
    display: none;
  }
  .brutal-checkbox input:checked ~ .checkmark:after {
    display: block;
  }
  .brutal-checkbox .checkmark:after {
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  /* Select */
  .brutal-select {
    font-family: 'IBM Plex Mono', monospace;
    padding: 0.5rem;
    font-size: 0.95rem;
    font-weight: 600;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    cursor: pointer;
    outline: none;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-select:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-select:disabled {
    background: #eee;
    color: #888;
    cursor: not-allowed;
    box-shadow: 0px 0px 0px #111;
  }

  /* ==========================================================================
   控制栏 (Toolbar & Buttons)
   ========================================================================== */
  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }
  .tools-left,
  .tools-right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .brutal-btn,
  .brutal-action-btn {
    font-family: inherit;
    font-weight: 800;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
    text-transform: uppercase;
  }

  .brutal-btn {
    padding: 0.5rem 1.5rem;
    font-size: 1.1rem;
    box-shadow: 4px 4px 0px #111;
  }
  .preset-btn {
    padding: 0.3rem 1rem;
    font-size: 0.9rem;
    background: #e6e6e6;
  }
  .brutal-btn.clear-btn {
    background: #ff0055;
    color: #fff;
  }

  .brutal-action-btn {
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn.primary {
    font-size: 1.2rem;
  }
  .brutal-action-btn:hover:not(:disabled),
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn.primary:hover:not(:disabled) {
    box-shadow: 8px 8px 0px #111;
  }
  .brutal-action-btn:active:not(:disabled),
  .brutal-btn:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-action-btn:disabled,
  .brutal-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  /* ==========================================================================
   网格与面板 (Code Grid & Panes)
   ========================================================================== */
  .code-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    flex: 1;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    display: flex;
    flex-direction: column;
    transition: all 0.2s;
    min-height: 500px;
  }

  .pane-header {
    padding: 1rem 1.5rem;
    font-size: 1.2rem;
    font-weight: 800;
    border-bottom: 4px solid #111;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bg-yellow {
    background: #ffe100;
  }
  .bg-green {
    background: #00e5ff;
  }
  .bg-pink {
    background: #ff66cc;
  }

  .pane-actions .char-count {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    background: #fff;
    padding: 0.2rem 0.8rem;
    border: 2px solid #111;
    font-weight: 600;
  }

  .brutal-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    background: transparent;
    color: #111;
    white-space: pre;
    overflow: auto;
  }
  .output-editor {
    background: #fafafa;
  }

  /* 滚动条 */
  .brutal-editor::-webkit-scrollbar {
    width: 14px;
    height: 14px;
  }
  .brutal-editor::-webkit-scrollbar-track {
    background: #fff;
    border-left: 3px solid #111;
    border-top: 3px solid #111;
  }
  .brutal-editor::-webkit-scrollbar-thumb {
    background: #111;
  }
  .brutal-editor::-webkit-scrollbar-corner {
    background: #fff;
    border-left: 3px solid #111;
    border-top: 3px solid #111;
  }

  /* ==========================================================================
   Dark Mode 暗黑模式适配
   ========================================================================== */
  [data-theme='dark'] .brutal-wrapper {
    background: #1a1a1a;
    color: #eee;
  }

  [data-theme='dark'] .brutal-header,
  [data-theme='dark'] .brutal-pane {
    background: #2a2a2a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-header {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .pane-actions .char-count {
    background: #222;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-select {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    box-shadow: 8px 8px 0px #eee;
    background: #6b5c00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.preset-btn {
    background: #444;
  }

  [data-theme='dark'] .brutal-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-select:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-action-btn.primary:hover:not(:disabled) {
    box-shadow: 8px 8px 0px #eee;
    background: #8a7600;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-action-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-btn:disabled,
  [data-theme='dark'] .brutal-action-btn:disabled {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #b25482;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #8a7600;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #007380;
    color: #fff;
  }

  [data-theme='dark'] .checkmark {
    background-color: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:hover input ~ .checkmark {
    background-color: #333;
  }
  [data-theme='dark'] .brutal-checkbox input:checked ~ .checkmark {
    background-color: #b25482;
  }

  [data-theme='dark'] .brutal-editor {
    color: #eee;
  }
  [data-theme='dark'] .output-editor {
    background: #222;
  }

  [data-theme='dark'] .brutal-editor::-webkit-scrollbar-track,
  [data-theme='dark'] .brutal-editor::-webkit-scrollbar-corner {
    background: #2a2a2a;
    border-left-color: #eee;
    border-top-color: #eee;
  }
  [data-theme='dark'] .brutal-editor::-webkit-scrollbar-thumb {
    background: #eee;
  }

  /* 响应式 */
  @media (max-width: 1100px) {
    .config-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (max-width: 900px) {
    .code-grid {
      grid-template-columns: 1fr;
    }
    .config-grid {
      grid-template-columns: 1fr;
    }
    .brutal-pane {
      min-height: 400px;
    }
    .brutal-toolbar {
      flex-direction: column;
      align-items: stretch;
    }
    .tools-left,
    .tools-right {
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .brutal-action-btn {
      flex: 1;
      text-align: center;
    }
  }
</style>
