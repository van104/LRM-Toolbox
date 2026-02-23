<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">文本<span>计数器()</span></h1>
        <div class="badge">📊 Text Counter</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 输入 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 输入 (INPUT)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn" @click="clearText">🗑️ 清空</button>
                <button class="brutal-btn icon-btn" @click="saveManually">💾 保存</button>
                <button class="brutal-btn icon-btn" @click="copyText">📋 {{ copyBtnText }}</button>
              </div>
            </div>
            <div class="editor-wrapper">
              <textarea
                v-model="textContent"
                class="code-editor"
                placeholder="在此输入或粘贴文本..."
                spellcheck="false"
                @input="updateStats"
              ></textarea>
            </div>
          </section>

          <!-- 2. 统计结果 -->
          <section class="brutal-pane">
            <div class="pane-header bg-pink text-white">
              <span class="panel-title">2. 统计结果 (STATS)</span>
              <div class="panel-actions">
                <button class="brutal-btn icon-btn" @click="showExportModal = true">📤 导出</button>
              </div>
            </div>
            <div class="tools-scroll-area">
              <div class="stats-grid">
                <div v-for="stat in statsCards" :key="stat.label" class="stat-card">
                  <div class="stat-info">
                    <span class="stat-value">{{ stat.value }}</span>
                    <span class="stat-label">{{ stat.label }}</span>
                  </div>
                </div>
              </div>

              <div class="divider mt-2 mb-2"></div>

              <div class="advanced-section">
                <label class="checkbox-label mb-2">
                  <input v-model="includeSpaces" type="checkbox" @change="updateStats" />
                  包含空格统计频次
                </label>

                <div class="advanced-card">
                  <h3 class="group-label">字符频率 TOP 10</h3>
                  <div class="frequency-list">
                    <div v-if="charFrequency.length === 0" class="no-data">请输入文本</div>
                    <div v-for="(item, idx) in charFrequency" :key="item.char" class="freq-item">
                      <span class="freq-rank">{{ idx + 1 }}</span>
                      <span class="freq-char">{{ item.char }}</span>
                      <div class="freq-bar-wrap">
                        <div class="freq-bar bg-blue" :style="{ width: item.percent + '%' }"></div>
                      </div>
                      <span class="freq-count">{{ item.count }}</span>
                    </div>
                  </div>
                </div>

                <div class="advanced-card mt-2">
                  <h3 class="group-label">常用单词 TOP 10</h3>
                  <div class="word-list">
                    <div v-if="commonWords.length === 0" class="no-data">请输入文本</div>
                    <div v-for="(item, idx) in commonWords" :key="item.word" class="word-item">
                      <span class="word-rank">{{ idx + 1 }}</span>
                      <span class="word-text">{{ item.word }}</span>
                      <span class="word-count">{{ item.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 3. 历史记录 -->
          <section class="brutal-pane">
            <div class="pane-header bg-blue text-white">
              <span class="panel-title">3. 历史记录 (HISTORY)</span>
              <div class="panel-actions">
                <button v-if="history.length > 0" class="brutal-btn icon-btn" @click="clearHistory">
                  🗑️ 清空历史
                </button>
              </div>
            </div>
            <div class="tools-scroll-area">
              <div class="history-list">
                <div v-if="history.length === 0" class="no-data center">暂无历史记录</div>
                <div
                  v-for="item in history"
                  :key="item.id"
                  class="history-item"
                  @click="loadHistory(item)"
                >
                  <div class="history-preview">{{ item.preview }}</div>
                  <div class="history-meta mt-1">
                    <span>⏱️ {{ item.date }}</span>
                    <span>🔡 字符: {{ item.chars }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <!-- 导出弹窗 -->
    <div v-if="showExportModal" class="brutal-modal-overlay" @click.self="showExportModal = false">
      <div class="brutal-modal">
        <div class="modal-header bg-yellow">
          <h3 style="font-family: 'Syne', sans-serif; font-weight: 900">导出统计结果</h3>
          <button class="brutal-btn icon-btn" @click="showExportModal = false">X</button>
        </div>
        <div class="modal-body">
          <div class="control-row">
            <label v-for="opt in exportFormats" :key="opt.value" class="radio-label">
              <input v-model="exportFormat" type="radio" :value="opt.value" />
              <span class="radio-box">{{ opt.label }}</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="brutal-btn execute-btn" style="width: 100%" @click="exportStats">
            执行导出
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const textContent = ref('');
  const includeSpaces = ref(false);
  const copyBtnText = ref('复制');
  const showExportModal = ref(false);
  const exportFormat = ref('txt');
  const history = ref([]);
  const historyLimit = 8;
  const { copyToClipboard } = useCopy();

  const exportFormats = [
    { value: 'txt', label: '纯文本格式 (.txt)' },
    { value: 'csv', label: 'CSV 表格格式 (.csv)' },
    { value: 'json', label: 'JSON 数据格式 (.json)' }
  ];

  const stats = reactive({
    chars: 0,
    charsNoSpaces: 0,
    chineseChars: 0,
    englishWords: 0,
    lines: 0,
    paragraphs: 0,
    spaces: 0,
    readingTime: 0
  });

  const statsCards = computed(() => [
    { label: '总字符数', value: stats.chars },
    { label: '不含空格', value: stats.charsNoSpaces },
    { label: '中文字数', value: stats.chineseChars },
    { label: '英文单词', value: stats.englishWords },
    { label: '行数', value: stats.lines },
    { label: '段落数', value: stats.paragraphs },
    { label: '空格数', value: stats.spaces },
    { label: '阅读时间', value: stats.readingTime + ' m' }
  ]);

  const charFrequency = ref([]);
  const commonWords = ref([]);

  function updateStats() {
    const text = textContent.value;
    stats.chars = text.length;
    stats.charsNoSpaces = text.replace(/\s/g, '').length;
    stats.chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    stats.englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    stats.lines = text === '' ? 0 : text.split('\n').length;
    stats.paragraphs =
      text.trim() === ''
        ? 0
        : text
            .trim()
            .split(/\n\s*\n/)
            .filter(p => p.trim()).length;
    stats.spaces = (text.match(/\s/g) || []).length;
    const totalWords = stats.chineseChars + stats.englishWords;
    if (totalWords === 0) {
      stats.readingTime = 0;
    } else {
      stats.readingTime = Math.max(1, Math.ceil(totalWords / 300));
    }
    updateCharFrequency();
    updateCommonWords();
  }

  function updateCharFrequency() {
    const text = includeSpaces.value ? textContent.value : textContent.value.replace(/\s/g, '');
    const freq = {};
    for (const char of text.toLowerCase()) {
      if (/[\u4e00-\u9fa5a-z0-9]/.test(char)) {
        freq[char] = (freq[char] || 0) + 1;
      }
    }
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const max = sorted[0]?.[1] || 1;
    charFrequency.value = sorted.map(([char, count]) => ({
      char,
      count,
      percent: Math.round((count / max) * 100)
    }));
  }

  function updateCommonWords() {
    const text = textContent.value.toLowerCase();
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'is',
      'are',
      'was',
      'were',
      'in',
      'on',
      'at',
      'to',
      'of',
      'for',
      'with',
      'by',
      'from',
      'about',
      'as',
      'if',
      'it',
      'this',
      'that',
      'i',
      'you',
      'he',
      'she',
      'we',
      'they',
      'be',
      'have',
      'do',
      '的',
      '是',
      '了',
      '和',
      '在',
      '有',
      '我',
      '你',
      '他',
      '她',
      '它'
    ];
    const words = text.match(/[\u4e00-\u9fa5]+|[a-z]{2,}/g) || [];
    const freq = {};
    words.forEach(w => {
      if (!stopWords.includes(w)) freq[w] = (freq[w] || 0) + 1;
    });
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    commonWords.value = sorted.map(([word, count]) => ({ word, count }));
  }

  function clearText() {
    if (textContent.value.trim()) saveToHistory();
    textContent.value = '';
    updateStats();
  }

  function copyText() {
    if (!textContent.value) return;
    copyToClipboard(textContent.value).then(success => {
      if (success) {
        copyBtnText.value = '已复制!';
        setTimeout(() => (copyBtnText.value = '复制'), 2000);
      }
    });
  }

  function saveManually() {
    if (!textContent.value.trim()) {
      ElMessage.warning('内容为空，无法保存');
      return;
    }
    saveToHistory();
    ElMessage.success('已保存到历史记录');
  }

  function saveToHistory() {
    const text = textContent.value;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const item = {
      id: Date.now(),
      preview: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
      fullText: text,
      date: new Date().toLocaleString('zh-CN'),
      chars: text.length,
      chineseChars: chineseChars,
      englishWords: englishWords
    };
    history.value.unshift(item);
    if (history.value.length > historyLimit) history.value.pop();
    localStorage.setItem('textCounterHistory', JSON.stringify(history.value));
  }

  function loadHistoryData() {
    try {
      const saved = localStorage.getItem('textCounterHistory');
      if (saved) {
        history.value = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history', e);
      localStorage.removeItem('textCounterHistory');
    }
  }

  function loadHistory(item) {
    textContent.value = item.fullText;
    updateStats();
  }

  function clearHistory() {
    history.value = [];
    localStorage.removeItem('textCounterHistory');
    ElMessage.success('历史记录已清空');
  }

  function exportStats() {
    if (!textContent.value.trim()) {
      ElMessage.warning('没有可导出的内容');
      return;
    }
    let content, ext, mime;
    const data = {
      text: textContent.value,
      stats: { ...stats },
      charFrequency: charFrequency.value,
      commonWords: commonWords.value
    };

    switch (exportFormat.value) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        ext = 'json';
        mime = 'application/json';
        break;
      case 'csv':
        content = '指标,数值\n';
        content += `字符数,${stats.chars}\n`;
        content += `不含空格,${stats.charsNoSpaces}\n`;
        content += `单词数,${stats.chineseChars + stats.englishWords}\n`;
        content += `行数,${stats.lines}\n`;
        content += `段落数,${stats.paragraphs}\n`;
        content += `空格数,${stats.spaces}\n`;
        content += `阅读时间,${stats.readingTime}分钟\n`;
        ext = 'csv';
        mime = 'text/csv';
        break;
      default:
        content = `文本计数器统计报告\n${'='.repeat(30)}\n`;
        content += `字符数: ${stats.chars}\n`;
        content += `不含空格: ${stats.charsNoSpaces}\n`;
        content += `单词数: ${stats.chineseChars + stats.englishWords}\n`;
        content += `行数: ${stats.lines}\n`;
        content += `段落数: ${stats.paragraphs}\n`;
        content += `空格数: ${stats.spaces}\n`;
        content += `阅读时间: ${stats.readingTime} 分钟\n`;
        content += `\n原始文本:\n${'-'.repeat(30)}\n${textContent.value}`;
        ext = 'txt';
        mime = 'text/plain';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text_stats_${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showExportModal.value = false;
    ElMessage.success('导出成功!');
  }

  function goHome() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  onMounted(() => {
    loadHistoryData();
    updateStats();
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
    grid-template-columns: 1.2fr 1.2fr 0.8fr;
    gap: 2rem;
    align-items: stretch;
    height: calc(100vh - 180px);
    min-height: 600px;
  }

  @media (max-width: 1100px) {
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
    gap: 0.5rem;
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
    line-height: 1.6;
    background: #fdfdfd;
    color: #111;
    box-sizing: border-box;
  }

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #fdfae5;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    box-shadow: 4px 4px 0px #111;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    color: #ff4b4b;
    display: block;
    margin-bottom: 0.2rem;
  }
  .stat-label {
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    color: #111;
    text-transform: uppercase;
  }

  .divider {
    height: 3px;
    background: #111;
    width: 100%;
  }
  .mt-2 {
    margin-top: 1rem;
  }
  .mb-2 {
    margin-bottom: 1rem;
  }
  .mt-1 {
    margin-top: 0.5rem;
  }

  .checkbox-label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
  }
  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 20px;
    height: 20px;
    border: 3px solid #111;
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

  .group-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    display: inline-block;
    padding: 0.3rem 0.6rem;
    margin-bottom: 1rem;
  }

  .advanced-card {
    background: #fff;
    border: 3px solid #111;
    padding: 1rem;
    box-shadow: 4px 4px 0px #111;
  }

  .no-data {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    color: #666;
    font-size: 0.9rem;
    text-align: center;
    padding: 1rem;
  }

  .freq-item,
  .word-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    font-weight: 600;
  }
  .freq-rank,
  .word-rank {
    width: 24px;
    height: 24px;
    background: #111;
    color: #ffd900;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.8rem;
    flex-shrink: 0;
  }
  .freq-char,
  .word-text {
    width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .freq-bar-wrap {
    flex: 1;
    height: 12px;
    background: #eee;
    border: 2px solid #111;
  }
  .freq-bar {
    height: 100%;
    background: #111;
  }
  .freq-count,
  .word-count {
    width: 40px;
    text-align: right;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .history-item {
    background: #fff;
    padding: 1rem;
    text-align: left;
    display: block;
  }
  .history-preview {
    font-size: 0.9rem;
    line-height: 1.4;
    max-height: 2.8em;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .history-meta {
    display: flex;
    gap: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    color: #333;
    font-weight: 600;
  }

  /* Modal */
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  .brutal-modal {
    background: #fff;
    border: 3px solid #111;
    box-shadow: 12px 12px 0px #111;
    width: 400px;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
  }
  .brutal-modal .modal-header {
    padding: 1rem;
    border-bottom: 3px solid #111;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brutal-modal .modal-body {
    padding: 1.5rem;
    background: #fdfae5;
  }
  .brutal-modal .modal-footer {
    padding: 1rem;
    border-top: 3px solid #111;
    background: #fff;
  }

  .radio-label {
    cursor: pointer;
    display: block;
    margin-bottom: 0.8rem;
  }
  .radio-label input {
    display: none;
  }
  .radio-box {
    display: block;
    padding: 0.6rem 1rem;
    background: #fff;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    border: 3px solid #111;
    transition: all 0.1s;
    box-shadow: 2px 2px 0px #111;
  }
  .radio-label input:checked + .radio-box {
    background: #111;
    color: #ffd900;
    box-shadow: 4px 4px 0px #ffd900;
    transform: translate(-2px, -2px);
  }

  .execute-btn {
    background: #111;
    color: #fff;
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
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .stat-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .stat-value {
    color: #ff4b4b;
  }
  [data-theme='dark'] .stat-label {
    color: #eee;
  }
  [data-theme='dark'] .advanced-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .group-label {
    background: #eee;
    color: #111;
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
  [data-theme='dark'] .divider {
    background: #eee;
  }
  [data-theme='dark'] .freq-rank,
  [data-theme='dark'] .word-rank {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .freq-bar-wrap {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .freq-bar {
    background: #eee;
  }
  [data-theme='dark'] .history-item {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .history-meta {
    color: #ccc;
  }
  [data-theme='dark'] .brutal-modal {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-modal .modal-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-modal .modal-body {
    background: #111;
  }
  [data-theme='dark'] .brutal-modal .modal-footer {
    background: #1a1a1a;
    border-top-color: #eee;
  }
  [data-theme='dark'] .radio-box {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box {
    background: #eee;
    color: #111;
    box-shadow: 4px 4px 0px #ffd900;
  }
  [data-theme='dark'] .execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled) {
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
</style>
