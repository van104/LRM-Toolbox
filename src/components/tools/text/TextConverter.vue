<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">文本<span>转换()</span></h1>
        <div class="badge">🔄 Text Converter</div>
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
                ref="inputRef"
                v-model="inputText"
                class="code-editor"
                placeholder="在此输入或粘贴需要转换的文本..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- 2. 工具面板 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 转换工具 (CONVERTER)</span>
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
                <div class="group-content">
                  <button class="tool-btn" @click="convert('dec2hex')">10 → 16 Hex</button>
                  <button class="tool-btn" @click="convert('dec2bin')">10 → 2 Bin</button>
                  <button class="tool-btn" @click="convert('hex2dec')">16 → 10 Dec</button>
                  <button class="tool-btn" @click="convert('bin2dec')">2 → 10 Dec</button>
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

          <!-- 3. 输出 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 转换结果 (RESULT)</span>
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
                placeholder="转换结果将显示在这里..."
              ></textarea>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { pinyin } from 'pinyin-pro';
  import Nzh from 'nzh';
  import * as OpenCC from 'opencc-js';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const outputText = ref('');
  const inputRef = ref(null);

  let s2tConverter = null;
  let t2sConverter = null;

  async function initConverters() {
    try {
      s2tConverter = await OpenCC.Converter({ from: 'cn', to: 'hk' });
      t2sConverter = await OpenCC.Converter({ from: 'hk', to: 'cn' });
    } catch (e) {
      console.error('OpenCC init failed', e);
      ElMessage.error('繁简转换组件加载失败');
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
      ElMessage.warning('请先输入或选择文本');
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
            ElMessage.warning('请输入纯数字金额');
          }
          break;
        case 'num_upper':
          if (/^-?\d+(\.\d+)?$/.test(text.trim())) {
            outputText.value = Nzh.cn.encodeB(text.trim());
          } else {
            ElMessage.warning('请输入纯数字');
          }
          break;
        case 'rmb_lower':
          try {
            const cleanText = text.trim().replace(/[元圆角分整]/g, '');
            outputText.value = Nzh.cn.decodeB(cleanText);
          } catch {
            ElMessage.error('无法解析为数字');
          }
          break;
        case 'num_lower':
          try {
            outputText.value = Nzh.cn.decodeB(text.trim());
          } catch {
            ElMessage.error('无法解析为数字');
          }
          break;
        case 'dec2hex':
          if (isNaN(text)) throw new Error('非有效数字');
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
      ElMessage.error('转换错误: ' + e.message);
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
    grid-template-columns: 1fr 380px 1fr;
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

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #fdfae5;
  }

  .tool-group {
    margin-bottom: 1.5rem;
  }

  .group-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    color: #111;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .group-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem;
  }

  .tool-btn {
    background: #fff;
    color: #111;
    border: 2px solid #111;
    padding: 0.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-align: left;
  }
  .tool-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .tool-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 transparent;
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
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .group-title {
    color: #eee;
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .tool-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
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
