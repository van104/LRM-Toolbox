<template>
  <div class="text-converter">
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>文本转换器</h1>
        <span class="nav-subtitle">Text Converter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="converter-layout">
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
              ref="inputRef"
              v-model="inputText"
              class="text-editor"
              placeholder="在此输入需要转换的文本..."
              spellcheck="false"
            ></textarea>
          </div>
        </section>

        <section class="tools-panel">
          <div class="panel-header" style="justify-content: center">
            <span class="panel-title">转换工具</span>
          </div>

          <div class="tools-scroll-area">
            <div class="tool-group">
              <div class="group-title">中文处理</div>
              <div class="group-content">
                <button class="tool-btn" @click="convert('s2t')">🇨🇳 简转繁</button>
                <button class="tool-btn" @click="convert('t2s')">🇭🇰 繁转简</button>
                <button class="tool-btn" @click="convert('pinyin')">🔤 转拼音 (带调)</button>
                <button class="tool-btn" @click="convert('pinyin_none')">🔤 转拼音 (无调)</button>
              </div>
            </div>

            <div class="tool-group">
              <div class="group-title">数值与金额</div>
              <div class="group-content">
                <button class="tool-btn" @click="convert('rmb_upper')">💴 金额转大写</button>
                <button class="tool-btn" @click="convert('rmb_lower')">💴 大写转金额</button>
                <button class="tool-btn" @click="convert('num_upper')">🔢 数字转大写</button>
                <button class="tool-btn" @click="convert('num_lower')">🔢 大写转数字</button>
              </div>
            </div>

            <div class="tool-group">
              <div class="group-title">进制转换 (整数)</div>
              <div class="group-content grid-3">
                <button class="tool-btn" @click="convert('dec2hex')">10 → 16</button>
                <button class="tool-btn" @click="convert('dec2bin')">10 → 2</button>
                <button class="tool-btn" @click="convert('hex2dec')">16 → 10</button>
                <button class="tool-btn" @click="convert('bin2dec')">2 → 10</button>
              </div>
            </div>

            <div class="tool-group">
              <div class="group-title">编码解码</div>
              <div class="group-content">
                <button class="tool-btn" @click="convert('url_enc')">🔗 URL 编码</button>
                <button class="tool-btn" @click="convert('url_dec')">🔗 URL 解码</button>
                <button class="tool-btn" @click="convert('unicode_enc')">U+ Unicode 编码</button>
                <button class="tool-btn" @click="convert('unicode_dec')">U+ Unicode 解码</button>
                <button class="tool-btn" @click="convert('utf8_hex')">🛠️ Str → UTF-8 Hex</button>
                <button class="tool-btn" @click="convert('hex_utf8')">🛠️ UTF-8 Hex → Str</button>
              </div>
            </div>

            <div class="tool-group">
              <div class="group-title">简易翻译 (跳转)</div>
              <div class="group-content">
                <button class="tool-btn" @click="openTranslate('google')">🇬 Google 翻译</button>
                <button class="tool-btn" @click="openTranslate('deepl')">🇩 DeepL 翻译</button>
              </div>
            </div>
          </div>
        </section>

        <section class="panel output-panel">
          <div class="panel-header">
            <span class="panel-title">转换结果</span>
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

      <Transition name="toast">
        <div v-if="toast.show" class="toast">{{ toast.message }}</div>
      </Transition>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 文本转换器</footer>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Delete, CopyDocument } from '@element-plus/icons-vue';
  import { pinyin } from 'pinyin-pro';
  import Nzh from 'nzh';

  import * as OpenCC from 'opencc-js';

  const router = useRouter();
  const inputText = ref('');
  const outputText = ref('');
  const inputRef = ref(null);
  const toast = reactive({ show: false, message: '' });

  let s2tConverter = null;
  let t2sConverter = null;

  async function initConverters() {
    try {
      s2tConverter = await OpenCC.Converter({ from: 'cn', to: 'hk' });
      t2sConverter = await OpenCC.Converter({ from: 'hk', to: 'cn' });
    } catch (e) {
      console.error('OpenCC init failed', e);
      showToast('繁简转换组件加载失败');
    }
  }

  initConverters();

  async function convert(type) {
    let text = inputText.value;

    if (inputRef.value) {
      const start = inputRef.value.selectionStart;
      const end = inputRef.value.selectionEnd;
      if (start !== end) {
        text = text.substring(start, end);
      }
    }

    if (!text) {
      showToast('请先输入或选择文本');
      return;
    }

    try {
      switch (type) {
        case 's2t':
          outputText.value = s2tConverter ? s2tConverter(text) : '加载中...';
          if (!s2tConverter) await initConverters();
          if (s2tConverter) outputText.value = s2tConverter(text);
          break;
        case 't2s':
          outputText.value = t2sConverter ? t2sConverter(text) : '加载中...';
          if (!t2sConverter) await initConverters();
          if (t2sConverter) outputText.value = t2sConverter(text);
          break;
        case 'pinyin':
          outputText.value = pinyin(text, { toneType: 'symbol', type: 'string', v: true });
          break;
        case 'pinyin_none':
          outputText.value = pinyin(text, { toneType: 'none', type: 'string', v: true });
          break;

        case 'rmb_upper':
          if (/^-?\d+(\.\d+)?$/.test(text.trim())) {
            outputText.value = Nzh.cn.toMoney(text.trim());
          } else {
            showToast('请输入纯数字金额');
          }
          break;
        case 'num_upper':
          if (/^-?\d+(\.\d+)?$/.test(text.trim())) {
            outputText.value = Nzh.cn.encodeB(text.trim());
          } else {
            showToast('请输入纯数字');
          }
          break;
        case 'rmb_lower':
          try {
            const cleanText = text.trim().replace(/[元圆角分整]/g, '');
            outputText.value = Nzh.cn.decodeB(cleanText);
          } catch {
            showToast('无法解析为数字');
          }
          break;
        case 'num_lower':
          try {
            outputText.value = Nzh.cn.decodeB(text.trim());
          } catch {
            showToast('无法解析为数字');
          }
          break;

        case 'dec2hex':
          if (isNaN(text)) throw new Error('非效数字');
          outputText.value = BigInt(Math.floor(Number(text)))
            .toString(16)
            .toUpperCase();
          break;
        case 'dec2bin':
          if (isNaN(text)) throw new Error('非有效数字');
          outputText.value = BigInt(Math.floor(Number(text))).toString(2);
          break;
        case 'hex2dec': {
          const hex = text.trim().startsWith('0x') ? text.trim() : '0x' + text.trim();
          if (isNaN(hex)) throw new Error('非有效16进制');
          outputText.value = BigInt(hex).toString(10);
          break;
        }
        case 'bin2dec': {
          const bin = text.trim().startsWith('0b') ? text.trim() : '0b' + text.trim();
          if (isNaN(bin)) throw new Error('非有效2进制');
          outputText.value = BigInt(bin).toString(10);
          break;
        }

        case 'url_enc':
          outputText.value = encodeURIComponent(text);
          break;
        case 'url_dec':
          outputText.value = decodeURIComponent(text);
          break;
        case 'unicode_enc':
          outputText.value = text
            .split('')
            .map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
            .join('');
          break;
        case 'unicode_dec':
          outputText.value = text.replace(/\\u[\dA-F]{4}/gi, match =>
            String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
          );
          break;
        case 'utf8_hex': {
          const encoder = new TextEncoder();
          const data = encoder.encode(text);
          outputText.value = Array.from(data)
            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
            .join(' ');
          break;
        }
        case 'hex_utf8': {
          const hexStr = text.replace(/\s+/g, '');
          if (hexStr.length % 2 !== 0) throw new Error('Hex 长度不对');
          const bytes = new Uint8Array(hexStr.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
          const decoder = new TextDecoder();
          outputText.value = decoder.decode(bytes);
          break;
        }
      }
    } catch (e) {
      showToast('转换错误: ' + e.message);
    }
  }

  function openTranslate(service) {
    const text = inputText.value.trim();
    let url = '';
    if (service === 'google') {
      url = `https://translate.google.com/?sl=auto&tl=zh-CN&text=${encodeURIComponent(text)}`;
    } else if (service === 'deepl') {
      url = `https://www.deepl.com/translator#en/zh/${encodeURIComponent(text)}`;
    }
    window.open(url, '_blank');
  }

  function fillDemoData() {
    inputText.value = `文本转换器示例：
1. 中文: 
   - 简转繁: 万事如意，恭喜发财
   - 繁转简: 萬事如意，恭喜發財
2. 拼音: 你好世界
3. 金额: 10086.50, 壹万零捌拾陆元伍角
4. 进制: 255 (转16进制为FF)
5. 编码: https://example.com/?q=测试`;
    showToast('已加载示例数据');
  }

  async function pasteText() {
    try {
      const text = await navigator.clipboard.readText();
      inputText.value = text;
    } catch {
      showToast('无法读取剪贴板');
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
    if (!outputText.value) return;
    navigator.clipboard.writeText(outputText.value).then(() => {
      showToast('已复制结果');
    });
  }

  function showToast(msg) {
    toast.message = msg;
    toast.show = true;
    setTimeout(() => (toast.show = false), 2000);
  }

  function goHome() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .text-converter {
    --bg: #f5f7fa;
    --card: #ffffff;
    --border: #e5e7eb;
    --text: #1f2937;
    --text-secondary: #6b7280;
    --accent: #10b981;

    --accent-light: #ecfdf5;

    font-family: 'Noto Sans SC', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    display: flex;
    flex-direction: column;
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
  }

  .main-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .converter-layout {
    display: flex;
    gap: 1.5rem;
    height: calc(100vh - 120px);
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

  .input-panel {
    flex: 1;
  }

  .output-panel {
    flex: 1;
  }

  .tools-panel {
    flex: 0.6;
    min-width: 320px;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  .tools-scroll-area {
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    height: 100%;
  }

  .panel-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid var(--border);
    background: #f9fafb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--text);
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stats-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-right: 0.5rem;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .icon-btn:hover {
    color: var(--accent);
    background: var(--accent-light);
  }

  .editor-wrapper {
    flex: 1;
    position: relative;
  }

  .text-editor {
    width: 100%;
    height: 100%;
    border: none;
    resize: none;
    padding: 1rem;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.6;
    outline: none;
    color: var(--text);
    background: transparent;
  }

  .result-editor {
    background: #fdfdfd;
  }

  .group-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .group-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .grid-3 {
    grid-template-columns: repeat(2, 1fr);
  }

  .tool-btn {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tool-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }

  .tool-btn:active {
    transform: translateY(1px);
  }

  @media (max-width: 1024px) {
    .converter-layout {
      flex-direction: column;
      height: auto;
    }

    .panel {
      height: 300px;
    }

    .tools-panel {
      max-width: none;
      height: auto;
      min-height: auto;
    }
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 100px;
    font-size: 0.85rem;
    z-index: 1000;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: all 0.3s ease;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111827;
      --card: #1f2937;
      --border: #374151;
      --text: #f9fafb;
      --text-secondary: #9ca3af;
      --accent: #34d399;
      --accent-light: rgba(52, 211, 153, 0.1);
    }

    .panel-header {
      background: #1f2937;
      border-bottom-color: #374151;
    }

    .result-editor {
      background: #1f2937;
    }

    .stats-info {
      background: #374151;
      color: #d1d5db;
    }
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
