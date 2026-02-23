<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">敏感词<span>在线检测()</span></h1>
        <div class="badge">🚨 Sensitive Check</div>
      </header>

      <main class="brutal-main">
        <div class="alert-box">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <b>检测说明：</b
            >本工具使用本地敏感词库进行检测，仅供参考。实际审核结果请以各平台标准为准。
          </div>
        </div>

        <div class="layout-grid">
          <!-- Input pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入检测文本 (INPUT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn" @click="clearText">🗑️ 清空</button>
              </div>
            </div>

            <div class="editor-wrapper">
              <textarea
                v-model="inputText"
                class="code-editor"
                placeholder="在此粘贴需要检测的文章或文本内容..."
                spellcheck="false"
              ></textarea>
            </div>
          </section>

          <!-- Middle action -->
          <div class="switch-area">
            <button
              class="brutal-btn min-btn bg-pink text-white"
              :disabled="isChecking"
              @click="checkText"
            >
              <span v-if="isChecking">⏳ 检测中...</span>
              <span v-else>🔍 开始检测</span>
            </button>
          </div>

          <!-- Output pane -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">2. 检测报告 (REPORT)</span>
              <div v-if="hasChecked" class="panel-actions">
                <span
                  class="count-badge"
                  :class="{
                    'danger-badge': sensitiveWords.length > 0,
                    'success-badge': sensitiveWords.length === 0
                  }"
                >
                  {{
                    sensitiveWords.length > 0
                      ? `发现 ${sensitiveWords.length} 处敏感词`
                      : '未发现敏感词'
                  }}
                </span>
              </div>
            </div>

            <div class="result-area">
              <div v-if="hasChecked" class="report-content">
                <div class="highlight-wrapper">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="highlight-text" v-html="highlightedText"></div>
                </div>

                <div v-if="sensitiveWords.length > 0" class="sensitive-list">
                  <div class="list-header"><span class="icon">🚨</span> 涉及敏感词列表：</div>
                  <div class="tags-cloud">
                    <span
                      v-for="(word, index) in uniqueSensitiveWords"
                      :key="index"
                      class="brutal-tag danger"
                    >
                      #{{ word }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="empty-state">
                <span class="empty-icon">🛡️</span>
                <p>提交文本后在此查看检测报告</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';

  const inputText = ref('');
  const isChecking = ref(false);
  const hasChecked = ref(false);
  const sensitiveWords = ref<string[]>([]);
  const highlightedText = ref('');

  // Mock sensitive dictionary
  const MOCK_DICT = [
    '暴力',
    '赌博',
    '色情',
    '违规',
    '测试敏感词',
    '私人侦探',
    '代考',
    '办证',
    '枪支',
    '毒品',
    '恐怖',
    '邪教',
    '传销',
    '高利贷'
  ];

  const uniqueSensitiveWords = computed(() => {
    return [...new Set(sensitiveWords.value)];
  });

  const checkText = () => {
    if (!inputText.value.trim()) {
      ElMessage.warning('请输入需要检测的文本');
      return;
    }

    isChecking.value = true;
    hasChecked.value = false;
    sensitiveWords.value = [];

    // Simulate processing delay
    setTimeout(() => {
      let text = inputText.value;
      const foundWords: string[] = [];

      MOCK_DICT.forEach(word => {
        if (text.includes(word)) {
          // Find all occurrences
          const regex = new RegExp(word, 'g');
          const matches = text.match(regex);
          if (matches) {
            foundWords.push(...matches);
          }
          // Highlight
          text = text.replace(regex, `<mark class="sh-mark">${word}</mark>`);
        }
      });

      sensitiveWords.value = foundWords;
      highlightedText.value = text.replace(/\n/g, '<br/>');
      hasChecked.value = true;
      isChecking.value = false;

      if (foundWords.length === 0) {
        ElMessage.success('✅ 检测完成：未发现敏感词');
      } else {
        ElMessage.warning(`🚨 警告：发现 ${foundWords.length} 处敏感词`);
      }
    }, 500);
  };

  const clearText = () => {
    inputText.value = '';
    hasChecked.value = false;
    sensitiveWords.value = [];
    highlightedText.value = '';
  };
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

  .min-btn {
    padding: 0.8rem 1.6rem;
    font-size: 1.1rem;
    box-shadow: 6px 6px 0px #111;
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
    gap: 1.5rem;
  }

  .alert-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #111;
    color: #fff;
    padding: 1rem 1.5rem;
    border: 3px solid #111;
    box-shadow: 6px 6px 0px #ffd900;
  }

  .alert-icon {
    font-size: 2rem;
  }

  .alert-text {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.05rem;
  }

  .alert-text b {
    color: #ffd900;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    align-items: stretch;
    height: calc(100vh - 250px);
    min-height: 500px;
  }

  @media (max-width: 900px) {
    .layout-grid {
      grid-template-columns: 1fr;
      height: auto;
    }
    .switch-area {
      transform: none !important;
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

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
    box-shadow: 2px 2px 0px #111;
  }

  .icon-btn:hover {
    box-shadow: 3px 3px 0px #111;
  }

  .count-badge {
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: bold;
    border: 2px solid #fff;
    color: #fff;
  }

  .danger-badge {
    background: #ff4b4b;
    border-color: #111;
    color: #111;
  }

  .success-badge {
    background: #4ade80;
    border-color: #111;
    color: #111;
  }

  .switch-area {
    display: flex;
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
    padding: 1.5rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.15rem;
    line-height: 1.8;
    background: transparent;
    color: #111;
    box-sizing: border-box;
  }

  .result-area {
    flex: 1;
    background: #fdfdfd;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .report-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .highlight-wrapper {
    flex: 1;
    padding: 1.5rem;
    border-bottom: 3px dashed #111;
  }

  .highlight-text {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    line-height: 1.8;
    color: #111;
    white-space: pre-wrap;
  }

  :deep(.sh-mark) {
    background-color: #ff4b4b;
    color: #fff;
    padding: 0.1rem 0.3rem;
    font-weight: bold;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    border-radius: 4px;
    margin: 0 0.1rem;
    text-shadow: 1px 1px 0px #111;
  }

  .sensitive-list {
    padding: 1.5rem;
    background: #fdfae5;
  }

  .list-header {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tags-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-tag {
    background: #ff4b4b;
    color: #fff;
    padding: 0.5rem 1rem;
    border: 2px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 800;
    font-size: 1rem;
    box-shadow: 3px 3px 0px #111;
    text-shadow: 1px 1px 0px #111;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 1.1rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 600;
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
    border-top-color: transparent !important;
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
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
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
  [data-theme='dark'] .alert-box {
    border-color: #eee;
  }
  [data-theme='dark'] .highlight-text {
    color: #eee;
  }
  [data-theme='dark'] .highlight-wrapper {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .sensitive-list {
    background: #222;
  }
  [data-theme='dark'] .brutal-tag {
    border-color: #111;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] :deep(.sh-mark) {
    border-color: #111;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .count-badge {
    border-color: #111;
  }
</style>
