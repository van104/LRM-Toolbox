<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">文本<span>提取()</span></h1>
        <div class="badge">🔍 Text Extractor</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 输入 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 源文本 (INPUT)</span>
              <div class="panel-actions">
                <span v-if="inputText" class="stats-info"
                  >{{ inputText.length }} 字符 | {{ inputLines }} 行</span
                >
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
                placeholder="在此输入或粘贴包含目标信息的文本..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- 2. 工具面板 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 提取器 (EXTRACTOR)</span>
            </div>
            <div class="tools-scroll-area">
              <div class="options-bar">
                <label class="checkbox-label">
                  <input v-model="options.append" type="checkbox" /> 追加模式
                </label>
                <label class="checkbox-label">
                  <input v-model="options.unique" type="checkbox" /> 去重
                </label>
                <label class="checkbox-label">
                  <input v-model="options.sort" type="checkbox" /> 排序
                </label>
                <label class="checkbox-label">
                  <input v-model="options.trim" type="checkbox" /> 去空字符
                </label>
              </div>

              <div class="tool-group">
                <div class="group-title">常用信息提取</div>
                <div class="group-content">
                  <button class="tool-btn" @click="extract('email')">📧 邮箱</button>
                  <button class="tool-btn" @click="extract('url')">🔗 网址</button>
                  <button class="tool-btn" @click="extract('phone')">📱 手机号</button>
                  <button class="tool-btn" @click="extract('ipv4')">🌐 IPv4</button>
                  <button class="tool-btn" @click="extract('idcard')">💳 身份证号</button>
                  <button class="tool-btn" @click="extract('date')">📅 日期</button>
                  <button class="tool-btn" @click="extract('time')">🕒 时间</button>
                  <button class="tool-btn" @click="extract('mac')">🖥️ MAC</button>
                  <button class="tool-btn" @click="extract('color')">🎨 Hex 颜色</button>
                  <button class="tool-btn" @click="extract('plate')">🚗 车牌号</button>
                  <button class="tool-btn" @click="extract('passport')">🛂 护照号</button>
                  <button class="tool-btn" @click="extract('uuid')">🆔 UUID</button>
                  <button class="tool-btn" @click="extract('md5')">🔐 MD5</button>
                  <button class="tool-btn" @click="extract('magnet')">🧲 磁力链</button>
                  <button class="tool-btn" @click="extract('postcode')">📮 邮编</button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">特定字符提取</div>
                <div class="group-content">
                  <button class="tool-btn" @click="extract('number')">🔢 所有数字</button>
                  <button class="tool-btn" @click="extract('chinese')">🀄 所有中文</button>
                  <button class="tool-btn" @click="extract('english')">🔤 所有英文</button>
                  <button class="tool-btn" @click="extract('letter')">📝 英文单词</button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">正则提取</div>
                <div class="custom-input-group">
                  <input
                    v-model="customRegex"
                    type="text"
                    placeholder="/\d+/"
                    class="brutal-input"
                  />
                  <button class="brutal-btn small-btn execute-btn" @click="extract('customRegex')">
                    提取
                  </button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">按行筛选</div>
                <div class="custom-input-group mb-2">
                  <input
                    v-model="includeKeyword"
                    type="text"
                    placeholder="包含关键词..."
                    class="brutal-input"
                  />
                  <button class="brutal-btn small-btn execute-btn" @click="filterLines('include')">
                    保留
                  </button>
                </div>
                <div class="custom-input-group">
                  <input
                    v-model="excludeKeyword"
                    type="text"
                    placeholder="不含关键词..."
                    class="brutal-input"
                  />
                  <button class="brutal-btn small-btn" @click="filterLines('exclude')">剔除</button>
                </div>
              </div>

              <div class="tool-group">
                <div class="group-title">关键词统计</div>
                <div class="custom-input-group">
                  <input
                    v-model="countKeyword"
                    type="text"
                    placeholder="输入关键词..."
                    class="brutal-input"
                  />
                  <button class="brutal-btn small-btn execute-btn" @click="countOccurrences">
                    统计
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. 输出 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 提取结果 (RESULT)</span>
              <div class="panel-actions">
                <span v-if="matchCount > 0" class="stats-info">{{ matchCount }} 项</span>
                <button class="brutal-btn icon-btn" title="复制结果" @click="copyResult">
                  📋 复制
                </button>
                <button class="brutal-btn icon-btn" title="清空结果" @click="clearOutput">
                  🗑️ 清空
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="outputText"
                class="code-editor result-editor"
                readonly
                placeholder="提取结果列表..."
              ></textarea>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const outputText = ref('');

  const customRegex = ref('');
  const includeKeyword = ref('');
  const excludeKeyword = ref('');
  const countKeyword = ref('');
  const matchCount = ref(0);

  const options = reactive({
    append: false,
    unique: true,
    sort: false,
    trim: true
  });

  const inputLines = computed(() => (inputText.value ? inputText.value.split('\n').length : 0));

  const patterns = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    url: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[^\s]+)/g,
    phone: /(?<!\d)(?:\+?86)?1[3-9]\d{9}(?!\d)/g,
    ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    idcard: /\b\d{17}[\dXx]\b|\b\d{15}\b/g,
    date: /\d{4}[-/年]\d{1,2}[-/月]\d{1,2}/g,
    time: /\b([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?\b/g,
    number: /-?\d+(?:\.\d+)?/g,
    chinese: /[\u4e00-\u9fa5]+/g,
    english: /[a-zA-Z]+/g,
    letter: /\b[a-zA-Z]+\b/g,
    mac: /[0-9A-Fa-f]{2}(?:[:-][0-9A-Fa-f]{2}){5}/g,
    color: /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
    plate: /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][A-Z][A-Z0-9]{5,6}/g,
    passport: /(?:G|E)\d{8}/g,
    uuid: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
    md5: /\b[a-fA-F0-9]{32}\b/g,
    magnet: /magnet:\?xt=urn:btih:[a-zA-Z0-9]{32,40}/g,
    postcode: /\b[1-9]\d{5}\b/g
  };

  function extract(type) {
    if (!inputText.value) {
      ElMessage.warning('请先输入源文本');
      return;
    }

    let regex = null;

    if (type === 'customRegex') {
      if (!customRegex.value) {
        ElMessage.warning('请输入正则表达式');
        return;
      }
      try {
        const match = customRegex.value.match(new RegExp('^/(.*?)/([gimy]*)$'));
        if (match) {
          regex = new RegExp(match[1], match[2] || 'g');
        } else {
          regex = new RegExp(customRegex.value, 'g');
        }
      } catch {
        ElMessage.error('正则表达式格式错误');
        return;
      }
    } else {
      regex = patterns[type];
    }

    if (!regex) return;

    let results = inputText.value.match(regex) || [];

    const labels = {
      email: '邮箱',
      url: '网址',
      phone: '手机号',
      ipv4: 'IPv4',
      idcard: '身份证',
      date: '日期',
      time: '时间',
      number: '数字',
      chinese: '中文',
      english: '英文',
      letter: '单词',
      mac: 'MAC地址',
      color: 'Hex颜色',
      plate: '车牌号',
      passport: '护照号',
      uuid: 'UUID',
      md5: 'MD5',
      magnet: '磁力链接',
      postcode: '邮政编码',
      customRegex: '正则匹配'
    };
    const label = labels[type] || '提取结果';

    processResults(results, label);
  }

  function filterLines(mode) {
    if (!inputText.value) {
      ElMessage.warning('请先输入源文本');
      return;
    }

    const lines = inputText.value.split('\n');
    let results = [];

    if (mode === 'include') {
      if (!includeKeyword.value) {
        ElMessage.warning('请输入包含关键词');
        return;
      }
      results = lines.filter(line => line.includes(includeKeyword.value));
    } else if (mode === 'exclude') {
      if (!excludeKeyword.value) {
        ElMessage.warning('请输入排除关键词');
        return;
      }
      results = lines.filter(line => !line.includes(excludeKeyword.value));
    }

    processResults(
      results,
      mode === 'include'
        ? `包含 "${includeKeyword.value}" 的行`
        : `不含 "${excludeKeyword.value}" 的行`
    );
  }

  function countOccurrences() {
    if (!inputText.value || !countKeyword.value) {
      ElMessage.warning('请输入文本和关键词');
      return;
    }

    const keyword = countKeyword.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(keyword, 'g');
    const matches = inputText.value.match(regex);
    const count = matches ? matches.length : 0;

    outputText.value = `关键词: "${countKeyword.value}"\n出现次数: ${count}`;
    matchCount.value = count;
    ElMessage.success(`找到 ${count} 个匹配`);
  }

  function processResults(rawResults, title = '结果') {
    let results = [...rawResults];

    if (options.trim) {
      results = results.map(s => s.trim()).filter(s => s);
    }

    if (options.unique) {
      results = [...new Set(results)];
    }

    if (options.sort) {
      results.sort();
    }

    const resultText = results.join('\n');

    if (options.append && outputText.value) {
      if (results.length > 0) {
        outputText.value += `\n\n--- ${title} (${results.length}) ---\n` + resultText;
        matchCount.value += results.length;
      } else {
        outputText.value += `\n\n--- ${title} (0) ---\n`;
      }
    } else {
      outputText.value = resultText;
      matchCount.value = results.length;
    }

    if (results.length === 0) {
      ElMessage.info('未找到匹配内容');
    } else {
      ElMessage.success(`提取到 ${results.length} 条结果`);
    }
  }

  function fillDemoData() {
    inputText.value = `文本提取器测试数据：

1. 联系方式：
- 邮箱: support@example.com 和 john.doe123@work.net
- 手机: 13800138000 (CN), 15912345678

2. 链接与网络：
- 官网: https://www.example.com/home
- API接口: http://api.test-server.org/v1/data?q=test
- IP地址: 192.168.1.1, 8.8.8.8

3. 证件与日期：
- 身份证: 110101199003078888, 31010120000101123X
- 日期: 2024-05-01, 2024/10/01
- 时间: 09:30:00, 18:45

4. 混合内容：
这里包含一段中文文本以及 English translation。
混合数字：价格 99.9 元，数量 -5，编号 #9527。

5. 扩展信息：
- MAC地址: 00:0c:29:1a:2b:3c, A1-B2-C3-D4-E5-F6
- 颜色代码: #FFFFFF, #ff0000, #369
- 车牌号: 京A88888, 粤B12345, 沪AD12345
- 护照: E12345678, G87654321
- UUID: 550e8400-e29b-41d4-a716-446655440000
- MD5: e10adc3949ba59abbe56e057f20f883e
- 磁力链: magnet:?xt=urn:btih:5b3267325e1d4583d2c8038f220f883e
- 邮编: 100080 (北京), 200001 (上海)
`;
    ElMessage.success('已加载演示数据');
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
    matchCount.value = 0;
  }

  function clearOutput() {
    outputText.value = '';
    matchCount.value = 0;
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
    min-height: 700px;
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
  .execute-btn,
  .text-white .execute-btn {
    background: #fff;
    color: #111;
  }
  .execute-btn:hover:not(:disabled),
  .text-white .execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
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
    border: 2px solid #111;
    padding: 0.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    color: #111;
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

  .options-bar {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    background: #fff;
    border: 3px solid #111;
    padding: 0.8rem;
    margin-bottom: 1.5rem;
    box-shadow: 4px 4px 0px #111;
  }

  .checkbox-label {
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    color: #111;
  }
  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 2px solid #111;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .checkbox-label input[type='checkbox']:checked {
    background-color: #111;
  }
  .checkbox-label input[type='checkbox']:checked::after {
    content: '✖';
    color: #ffd900;
    font-size: 14px;
  }

  .custom-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .brutal-input {
    flex: 1;
    background: #fff;
    color: #111;
    border: 2px solid #111;
    padding: 0.4rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    outline: none;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-input:focus {
    box-shadow: 3px 3px 0px #ff4b4b;
  }

  .small-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    box-shadow: 2px 2px 0px #111;
  }
  .small-btn:hover {
    box-shadow: 3px 3px 0px #111;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
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
  [data-theme='dark'] .options-bar {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .checkbox-label {
    color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox'] {
    background-color: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked {
    background-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked::after {
    color: #111;
  }
  [data-theme='dark'] .brutal-input {
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
