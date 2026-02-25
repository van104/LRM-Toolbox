<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-left">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">正则<span>.测试()</span></h1>
        <div class="header-right">
          <button class="brutal-btn clear-btn" @click="clearAll">清空全部</button>
        </div>
      </header>

      <div class="brutal-toolbar">
        <div class="regex-wrapper">
          <span class="slash">/</span>
          <input
            v-model="regexPattern"
            type="text"
            class="regex-field"
            placeholder="在此输入正则表达式"
            spellcheck="false"
          />
          <span class="slash">/</span>
          <input
            v-model="regexFlags"
            type="text"
            class="flags-field"
            placeholder="gims"
            spellcheck="false"
          />
        </div>

        <div style="display: flex; gap: 1rem; align-items: center">
          <el-dropdown trigger="click" @command="handleTemplateSelect">
            <button class="brutal-btn brutal-action-btn">
              {{ currentTemplateName }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="temp in templates" :key="temp.name" :command="temp">
                  {{ temp.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-popover
            v-model:visible="aiVisible"
            placement="bottom"
            title="AI 智能生成"
            :width="300"
            trigger="click"
          >
            <template #reference>
              <button
                class="brutal-btn brutal-action-btn primary"
                :class="{ 'is-loading': isAiGenerating }"
              >
                <el-icon class="mr-1"><MagicStick /></el-icon> AI 生成
              </button>
            </template>
            <div class="ai-prompt-box">
              <el-input
                v-model="aiPrompt"
                type="textarea"
                :rows="3"
                placeholder="例如：匹配中国手机号，或者匹配 1900-2099 年之间的日期..."
                @keyup.enter.ctrl="generateRegexWithAi"
              />
              <div class="mt-2 flex justify-end">
                <el-button
                  size="small"
                  type="primary"
                  :disabled="!aiPrompt"
                  @click="generateRegexWithAi"
                >
                  生成正则
                </el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <div v-if="regexError" class="brutal-status error">
        <el-icon><Warning /></el-icon> {{ regexError }}
      </div>

      <div class="test-area brutal-pane bg-white mt-4">
        <div class="area-header">
          <span class="brutal-label">测试文本</span>
          <div v-if="matchCount > 0" class="stats">找到 {{ matchCount }} 个匹配</div>
        </div>

        <div class="editor-container">
          <!-- eslint-disable vue/no-v-html -->
          <div
            ref="highlightRef"
            class="highlight-layer"
            aria-hidden="true"
            v-html="sanitizedHighlightedContent"
          ></div>
          <!-- eslint-enable vue/no-v-html -->

          <textarea
            ref="textareaRef"
            v-model="testText"
            class="input-layer"
            placeholder="在此输入待测试文本..."
            spellcheck="false"
            @scroll="syncScroll"
          ></textarea>
        </div>
      </div>

      <div v-if="matchGroups.length > 0" class="matches-list brutal-pane bg-white mt-4">
        <div class="brutal-label" style="display: inline-block; margin-bottom: 1rem">匹配详情</div>
        <el-collapse class="brutal-collapse">
          <el-collapse-item
            v-for="(match, index) in matchGroups.slice(0, 50)"
            :key="index"
            :title="`Match ${index + 1}: ${match[0]}`"
          >
            <div v-if="match.length > 1" class="group-detail">
              <div v-for="(group, gIndex) in match.slice(1)" :key="gIndex" class="group-item">
                <span class="group-label">Group {{ gIndex + 1 }}:</span>
                <span class="group-value">{{ group }}</span>
              </div>
            </div>
            <div v-else class="no-groups">无捕获组</div>
            <div class="match-index">Index: {{ match.index }}</div>
          </el-collapse-item>
        </el-collapse>
        <div v-if="matchGroups.length > 50" class="more-matches mt-4">仅显示前 50 个匹配项...</div>
      </div>

      <footer class="footer">© 2026 LRM工具箱 - 正则表达式测试</footer>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowDown, Warning, MagicStick } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import DOMPurify from 'dompurify';

  const router = useRouter();

  const regexPattern = ref('');
  const regexFlags = ref('g');
  const testText = ref('');
  const regexError = ref('');
  const aiVisible = ref(false);
  const aiPrompt = ref('');
  const isAiGenerating = ref(false);

  const textareaRef = ref(null);
  const currentTemplateName = ref('常用模板');

  const templates = [
    { name: 'Email 邮箱', pattern: '[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}', flags: 'g' },
    { name: '手机号 (中国)', pattern: '1[3-9]\\d{9}', flags: 'g' },
    {
      name: '身份证 (18位)',
      pattern:
        '[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]',
      flags: 'g'
    },
    {
      name: 'URL 网址',
      pattern:
        'https?://(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
      flags: 'g'
    },
    { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
    { name: 'IPv4 地址', pattern: '((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}', flags: 'g' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', flags: 'g' }
  ];

  function handleTemplateSelect(temp) {
    regexPattern.value = temp.pattern;
    regexFlags.value = temp.flags;
    currentTemplateName.value = temp.name;
  }

  const compiledRegex = ref(null);

  watch(
    [regexPattern, regexFlags],
    () => {
      if (!regexPattern.value) {
        compiledRegex.value = null;
        regexError.value = '';
        return;
      }
      try {
        compiledRegex.value = new RegExp(regexPattern.value, regexFlags.value);
        regexError.value = '';
      } catch (e) {
        compiledRegex.value = null;
        regexError.value = e.message;
      }
    },
    { immediate: true }
  );

  const matchGroups = computed(() => {
    if (!compiledRegex.value || !testText.value) return [];

    if (regexPattern.value === '' || regexPattern.value === '(?:)') return [];

    const matches = [];

    const regex = new RegExp(
      regexPattern.value,
      regexFlags.value.includes('g') ? regexFlags.value : regexFlags.value + 'g'
    );

    let match;

    let count = 0;
    while ((match = regex.exec(testText.value)) !== null && count < 1000) {
      matches.push(match);

      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      count++;
    }
    return matches;
  });

  const matchCount = computed(() => matchGroups.value.length);

  const highlightedContent = computed(() => {
    if (!testText.value) return '';

    const escapeHtml = unsafe => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    if (!compiledRegex.value) return escapeHtml(testText.value) + '<br>';

    try {
      let html = '';
      let lastIndex = 0;
      const text = testText.value;

      for (const match of matchGroups.value) {
        html += escapeHtml(text.slice(lastIndex, match.index));
        const matchedStr = match[0];
        html += `<span class="highlight-match">${escapeHtml(matchedStr)}</span>`;
        lastIndex = match.index + matchedStr.length;
      }

      html += escapeHtml(text.slice(lastIndex));
      if (html.endsWith('\n')) html += '<br>';
      return html;
    } catch {
      return escapeHtml(testText.value);
    }
  });

  const sanitizedHighlightedContent = computed(() => DOMPurify.sanitize(highlightedContent.value));

  function syncScroll(e) {
    const scrollTop = e.target.scrollTop;
    const scrollLeft = e.target.scrollLeft;
    const highlightLayer = e.target.previousElementSibling;
    if (highlightLayer) {
      highlightLayer.scrollTop = scrollTop;
      highlightLayer.scrollLeft = scrollLeft;
    }
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    regexPattern.value = '';
    testText.value = '';
    regexFlags.value = 'g';
  }

  async function generateRegexWithAi() {
    if (!aiPrompt.value || isAiGenerating.value) return;

    isAiGenerating.value = true;
    try {
      const response = await fetch('/lrm-api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                '你是一个正则表达式专家。请根据用户的描述，直接给出正则表达式的模式字符串，不要包含两侧的斜杠。如果有必要，在单独的一行给出建议的 flags。请保持回答极其简洁，只包含匹配模式和 flags。'
            },
            {
              role: 'user',
              content: aiPrompt.value
            }
          ]
        })
      });

      if (!response.ok) throw new Error('AI 服务响应错误');

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      // 简单的正则表达式和 flags 拆解逻辑
      // 假设 AI 返回: ^\d+$ \n g
      const lines = content.split('\n');
      const pattern = lines[0].replace(/^\/|\/$/g, '').trim();
      const flags = lines.length > 1 ? lines[1].replace(/[^gimsuy]/g, '').trim() : 'g';

      regexPattern.value = pattern;
      if (flags) regexFlags.value = flags;

      ElMessage.success('AI 已成功生成正则表达式');
      aiVisible.value = false;
      aiPrompt.value = '';
    } catch (error) {
      console.error('AI Generation Error:', error);
      ElMessage.error('AI 生成失败，请稍后重试');
    } finally {
      isAiGenerating.value = false;
    }
  }
</script>

<style scoped>
  /* 核心设计元素与变量定义 */
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    border-radius: 0;
    padding: 1.5rem;
  }

  .bg-yellow {
    background-color: #ffd900 !important;
  }
  .bg-blue {
    background-color: #4b7bff !important;
    color: white !important;
  }
  .bg-green {
    background-color: #00e572 !important;
  }
  .bg-pink {
    background-color: #ff4b4b !important;
    color: white !important;
  }
  .bg-white {
    background-color: #fff !important;
  }

  /* Header */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
    -webkit-text-stroke: 1px #111;
    color: #111;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  /* 按钮 */
  .brutal-btn {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', sans-serif;
    font-weight: 800;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
    padding: 0.5rem 1.5rem;
    cursor: pointer;
    transition: all 0.15s ease-out;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1rem;
    border-radius: 0;
    color: #111;
  }

  .brutal-action-btn {
    padding: 0.3rem 1rem;
    font-size: 0.9rem;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-action-btn.primary {
    background: #00e572;
    color: #111;
  }

  .brutal-label {
    font-weight: 800;
    font-size: 1.1rem;
    border-bottom: 3px solid #111;
    padding-bottom: 0.2rem;
    display: inline-block;
    color: #111;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }

  .regex-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 3px solid #111;
    box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.05);
    padding: 0 1rem;
    height: 48px;
    min-width: 300px;
    transition: all 0.2s;
  }

  .regex-wrapper:focus-within {
    border-color: #4b7bff;
    background: #fdfae5;
  }

  .slash {
    color: #111;
    font-weight: 900;
    font-size: 1.5rem;
  }

  .regex-field,
  .flags-field {
    border: none;
    outline: none;
    background: transparent;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    color: #111;
  }
  .regex-field {
    flex: 1;
    margin: 0 0.5rem;
  }
  .flags-field {
    width: 60px;
    padding-left: 0.5rem;
    border-left: 3px solid #111;
  }

  .brutal-status.error {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1rem;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
  }

  .editor-container {
    position: relative;
    border: 3px solid #111;
    box-shadow: inset 4px 4px 0px rgba(0, 0, 0, 0.05);
    background: #fafafa;
    min-height: 250px;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 16px;
    line-height: 1.5;
    margin-top: 1rem;
  }

  .input-layer,
  .highlight-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 1rem;
    border: none;
    outline: none;
    box-sizing: border-box;
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .input-layer {
    z-index: 2;
    background: transparent;
    color: #111;
    font-family: inherit;
    resize: none;
  }

  .input-layer:focus {
    background: rgba(255, 255, 255, 0.5);
  }

  .highlight-layer {
    color: transparent;
    z-index: 1;
    pointer-events: none;
  }

  .highlight-layer :deep(.highlight-match) {
    background-color: #ffd900;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    color: transparent;
    border-radius: 0;
  }

  .area-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .stats {
    font-weight: 800;
    color: #4b7bff;
  }

  :deep(.brutal-collapse) {
    border: 3px solid #111;
    border-bottom: none;
  }
  :deep(.el-collapse-item__header) {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    background: #fdfae5;
    border-bottom: 3px solid #111;
    color: #111;
    padding: 0 1rem;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: 3px solid #111;
  }

  :deep(.el-collapse-item__content) {
    padding: 1rem;
    background: #fff;
  }

  .group-item {
    font-weight: 600;
    color: #111;
    margin-bottom: 0.5rem;
  }
  .group-label {
    margin-right: 0.5rem;
    font-weight: 800;
  }
  .group-value {
    background: #eee;
    border: 2px solid #111;
    padding: 2px 6px;
    font-family: monospace;
    word-break: break-all;
  }
  .match-index {
    font-size: 0.8rem;
    font-weight: bold;
    color: #666;
    margin-top: 0.5rem;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    font-weight: 700;
    border-top: 3px solid #111;
    margin-top: 2rem;
    color: #111;
  }

  /* Dark Mode 适配 */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status.error {
    background: #1a1a1a !important;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c !important;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000 !important;
    color: #fff;
  }

  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00 !important;
  }
  [data-theme='dark'] .bg-blue {
    background-color: #2a4eb2 !important;
    color: #eee !important;
  }
  [data-theme='dark'] .bg-green {
    background-color: #00994c !important;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000 !important;
    color: white !important;
  }
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a !important;
    color: #eee !important;
  }

  [data-theme='dark'] .regex-wrapper {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .regex-wrapper:focus-within {
    border-color: #4b7bff;
    background: #222;
  }
  [data-theme='dark'] .slash,
  [data-theme='dark'] .regex-field,
  [data-theme='dark'] .flags-field {
    color: #eee;
  }
  [data-theme='dark'] .flags-field {
    border-color: #eee;
  }

  [data-theme='dark'] .editor-container {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .input-layer {
    color: #eee;
  }
  [data-theme='dark'] .input-layer:focus {
    background: rgba(0, 0, 0, 0.5);
  }
  [data-theme='dark'] .highlight-layer :deep(.highlight-match) {
    background-color: #00994c;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-title {
    -webkit-text-stroke: 1px #eee;
    text-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .brutal-label,
  [data-theme='dark'] .footer {
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .stats {
    color: #4b7bff;
  }

  :deep([data-theme='dark'] .brutal-collapse) {
    border-color: #eee;
  }
  :deep([data-theme='dark'] .el-collapse-item__header) {
    background: #222;
    border-color: #eee;
    color: #eee;
  }
  :deep([data-theme='dark'] .el-collapse-item__wrap) {
    border-color: #eee;
  }
  :deep([data-theme='dark'] .el-collapse-item__content) {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .group-item {
    color: #eee;
  }
  [data-theme='dark'] .group-value {
    background: #111;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .match-index {
    color: #aaa;
  }
</style>
