<template>
  <div class="text-counter">
    
    <nav class="nav-bar">
      <button @click="goHome" class="nav-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="nav-center">
        <h1>文本计数器</h1>
        <span class="nav-subtitle">Text Counter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    
    <main class="main-content">
      
      <section class="input-section">
        <textarea v-model="textContent" @input="updateStats" placeholder="在此输入或粘贴文本..." class="text-input"
          rows="8"></textarea>
        <div class="input-actions">
          <button @click="clearText" class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            清空
          </button>
          <button @click="saveManually" class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            保存
          </button>
          <button @click="copyText" class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copyBtnText }}
          </button>
          <button @click="showExportModal = true" class="action-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            导出结果
          </button>
        </div>
      </section>

      
      <section class="stats-section">
        <h2 class="section-title">统计结果</h2>
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in statsCards" :key="stat.label">
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-info">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </section>

      
      <section class="advanced-section">
        <div class="section-header">
          <h2 class="section-title">高级统计</h2>
          <div class="toggle-options">
            <label class="checkbox-wrap">
              <input type="checkbox" v-model="includeSpaces" @change="updateStats">
              <span class="checkmark"></span>
              包含空格
            </label>
          </div>
        </div>
        <div class="advanced-grid">
          
          <div class="advanced-card">
            <h3>字符频率 TOP 10</h3>
            <div class="frequency-list">
              <div v-if="charFrequency.length === 0" class="no-data">请输入文本</div>
              <div v-for="(item, idx) in charFrequency" :key="item.char" class="freq-item">
                <span class="freq-rank">{{ idx + 1 }}</span>
                <span class="freq-char">{{ item.char }}</span>
                <div class="freq-bar-wrap">
                  <div class="freq-bar" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="freq-count">{{ item.count }}</span>
              </div>
            </div>
          </div>
          
          <div class="advanced-card">
            <h3>常用单词 TOP 10</h3>
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
      </section>

      
      <section class="history-section">
        <div class="section-header">
          <h2 class="section-title">最近分析</h2>
          <button v-if="history.length > 0" @click="clearHistory" class="clear-btn">清空历史</button>
        </div>
        <div class="history-list">
          <div v-if="history.length === 0" class="no-data center">暂无历史记录</div>
          <div v-for="(item, idx) in history" :key="item.id" @click="loadHistory(item)" class="history-item">
            <div class="history-preview">{{ item.preview }}</div>
            <div class="history-meta">
              <span>{{ item.date }}</span>
              <span>字符: {{ item.chars }}</span>
              <span>中文: {{ item.chineseChars || 0 }}</span>
              <span>英文: {{ item.englishWords || 0 }}</span>
            </div>
          </div>
        </div>
      </section>
    </main>

    
    <footer class="footer">
      <p class="disclaimer">⚠️ 说明：统计结果仅供参考，可能存在误差，请以实际情况为准</p>
      <p>© 2026 LRM工具箱 - 文本计数器</p>
    </footer>

    
    <Transition name="modal">
      <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>导出统计结果</h3>
            <button @click="showExportModal = false" class="close-btn">✕</button>
          </div>
          <div class="modal-body">
            <div class="export-options">
              <label class="radio-option" v-for="opt in exportFormats" :key="opt.value">
                <input type="radio" v-model="exportFormat" :value="opt.value">
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="exportStats" class="action-btn primary">导出</button>
          </div>
        </div>
      </div>
    </Transition>

    
    <Transition name="toast">
      <div v-if="toast.show" class="toast">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

const textContent = ref("");
const includeSpaces = ref(false);
const copyBtnText = ref("复制");
const showExportModal = ref(false);
const exportFormat = ref("txt");
const history = ref([]);
const historyLimit = 8;
const toast = reactive({ show: false, message: "" });

const exportFormats = [
  { value: "txt", label: "纯文本格式 (.txt)" },
  { value: "csv", label: "CSV 表格格式 (.csv)" },
  { value: "json", label: "JSON 数据格式 (.json)" },
];


const stats = reactive({
  chars: 0,
  charsNoSpaces: 0,
  chineseChars: 0,
  englishWords: 0,
  lines: 0,
  paragraphs: 0,
  spaces: 0,
  readingTime: 0,
});


const statsCards = computed(() => [
  { label: "字符数", value: stats.chars, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>' },
  { label: "不含空格", value: stats.charsNoSpaces, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>' },
  { label: "中文字数", value: stats.chineseChars, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M7 12h10M3 17h18"/></svg>' },
  { label: "英文单词", value: stats.englishWords, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' },
  { label: "行数", value: stats.lines, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' },
  { label: "段落数", value: stats.paragraphs, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v16"/><path d="M17 4v16"/><path d="M13 4H9a4 4 0 0 0 0 8h4"/></svg>' },
  { label: "空格数", value: stats.spaces, icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/></svg>' },
  { label: "阅读时间", value: stats.readingTime + " 分钟", icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' },
]);


const charFrequency = ref([]);

const commonWords = ref([]);

function updateStats() {
  const text = textContent.value;

  stats.chars = text.length;
  stats.charsNoSpaces = text.replace(/\s/g, "").length;

  
  stats.chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  stats.englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  stats.lines = text === "" ? 0 : text.split("\n").length;
  stats.paragraphs = text.trim() === "" ? 0 : text.trim().split(/\n\s*\n/).filter(p => p.trim()).length;
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
  const text = includeSpaces.value ? textContent.value : textContent.value.replace(/\s/g, "");
  const freq = {};
  for (const char of text.toLowerCase()) {
    if (/[\u4e00-\u9fa5a-z0-9]/.test(char)) {
      freq[char] = (freq[char] || 0) + 1;
    }
  }
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = sorted[0]?.[1] || 1;
  charFrequency.value = sorted.map(([char, count]) => ({
    char,
    count,
    percent: Math.round((count / max) * 100),
  }));
}

function updateCommonWords() {
  const text = textContent.value.toLowerCase();
  const stopWords = ["the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "of", "for", "with", "by", "from", "about", "as", "if", "it", "this", "that", "i", "you", "he", "she", "we", "they", "be", "have", "do", "的", "是", "了", "和", "在", "有", "我", "你", "他", "她", "它"];
  const words = text.match(/[\u4e00-\u9fa5]+|[a-z]{2,}/g) || [];
  const freq = {};
  words.forEach(w => { if (!stopWords.includes(w)) freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  commonWords.value = sorted.map(([word, count]) => ({ word, count }));
}

function clearText() {
  if (textContent.value.trim()) saveToHistory();
  textContent.value = "";
  updateStats();
}

function copyText() {
  if (!textContent.value) return;
  navigator.clipboard.writeText(textContent.value).then(() => {
    copyBtnText.value = "已复制!";
    setTimeout(() => copyBtnText.value = "复制", 2000);
  });
}

function saveManually() {
  if (!textContent.value.trim()) {
    showToast("内容为空，无法保存");
    return;
  }
  saveToHistory();
  showToast("已保存到历史记录");
}

function saveToHistory() {
  const text = textContent.value;
  
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;

  const item = {
    id: Date.now(),
    preview: text.slice(0, 60) + (text.length > 60 ? "..." : ""),
    fullText: text,
    date: new Date().toLocaleString("zh-CN"),
    chars: text.length,
    chineseChars: chineseChars,
    englishWords: englishWords,
  };

  history.value.unshift(item);
  if (history.value.length > historyLimit) history.value.pop();
  localStorage.setItem("textCounterHistory", JSON.stringify(history.value));
}

function loadHistoryData() {
  try {
    const saved = localStorage.getItem("textCounterHistory");
    if (saved) {
      history.value = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load history", e);
    
    localStorage.removeItem("textCounterHistory");
  }
}

function loadHistory(item) {
  textContent.value = item.fullText;
  updateStats();
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem("textCounterHistory");
  showToast("历史记录已清空");
}

function exportStats() {
  if (!textContent.value.trim()) {
    showToast("没有可导出的内容");
    return;
  }
  let content, ext, mime;
  const data = {
    text: textContent.value,
    stats: { ...stats },
    charFrequency: charFrequency.value,
    commonWords: commonWords.value,
  };

  switch (exportFormat.value) {
    case "json":
      content = JSON.stringify(data, null, 2);
      ext = "json";
      mime = "application/json";
      break;
    case "csv":
      content = "指标,数值\n";
      content += `字符数,${stats.chars}\n`;
      content += `不含空格,${stats.charsNoSpaces}\n`;
      content += `单词数,${stats.words}\n`;
      content += `行数,${stats.lines}\n`;
      content += `段落数,${stats.paragraphs}\n`;
      content += `空格数,${stats.spaces}\n`;
      content += `阅读时间,${stats.readingTime}分钟\n`;
      ext = "csv";
      mime = "text/csv";
      break;
    default:
      content = `文本计数器统计报告\n${"=".repeat(30)}\n`;
      content += `字符数: ${stats.chars}\n`;
      content += `不含空格: ${stats.charsNoSpaces}\n`;
      content += `单词数: ${stats.words}\n`;
      content += `行数: ${stats.lines}\n`;
      content += `段落数: ${stats.paragraphs}\n`;
      content += `空格数: ${stats.spaces}\n`;
      content += `阅读时间: ${stats.readingTime} 分钟\n`;
      content += `\n原始文本:\n${"-".repeat(30)}\n${textContent.value}`;
      ext = "txt";
      mime = "text/plain";
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `text_stats_${new Date().toISOString().slice(0, 10)}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  showExportModal.value = false;
  showToast("导出成功!");
}

function showToast(msg) {
  toast.message = msg;
  toast.show = true;
  setTimeout(() => toast.show = false, 2000);
}

function goHome() {
  if (window.history.length > 1) window.history.back();
  else alert("返回首页");
}

onMounted(() => {
  loadHistoryData();
  updateStats();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.text-counter {
  --bg: #f5f7fa;
  --card: #ffffff;
  --border: #e5e7eb;
  --text: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent: #6366f1;
  --accent-light: #eef2ff;
  --success: #10b981;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);

  font-family: 'Noto Sans SC', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
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

.nav-center {
  text-align: center;
}

.nav-center h1 {
  font-size: 1.25rem;
  font-weight: 600;
}

.nav-subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-spacer {
  width: 60px;
}


.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
}


.input-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.text-input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: var(--accent);
}

.input-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--accent);
  color: white;
}

.action-btn.primary:hover {
  background: #4f46e5;
}

.action-btn.secondary {
  background: var(--bg);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.action-btn.secondary:hover {
  background: var(--accent-light);
  color: var(--accent);
  border-color: var(--accent);
}


.stats-section,
.advanced-section,
.history-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header .section-title {
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg);
  padding: 1rem;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  color: var(--accent);
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}


.toggle-options {
  display: flex;
  gap: 1rem;
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-wrap input {
  accent-color: var(--accent);
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.advanced-card {
  background: var(--bg);
  border-radius: 12px;
  padding: 1rem;
}

.advanced-card h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-secondary);
}

.frequency-list,
.word-list {
  max-height: 250px;
  overflow-y: auto;
}

.freq-item,
.word-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.freq-item:last-child,
.word-item:last-child {
  border-bottom: none;
}

.freq-rank,
.word-rank {
  width: 20px;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

.freq-char {
  width: 24px;
  font-weight: 600;
  text-align: center;
  color: var(--accent);
}

.freq-bar-wrap {
  flex: 1;
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.freq-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.3s;
}

.freq-count,
.word-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent);
  min-width: 30px;
  text-align: right;
}

.word-text {
  flex: 1;
  font-size: 0.9rem;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.no-data.center {
  text-align: center;
}


.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.clear-btn:hover {
  color: #ef4444;
  background: #fef2f2;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  border-left: 3px solid var(--accent);
  transition: background 0.2s;
}

.history-item:hover {
  background: var(--accent-light);
}

.history-preview {
  font-size: 0.9rem;
  color: var(--text);
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}


.footer {
  text-align: center;
  padding: 2rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.footer p {
  margin: 0.25rem 0;
}

.disclaimer {
  font-size: 0.75rem;
  color: #f59e0b;
  background: #fffbeb;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 1.5rem;
}


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: var(--card);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
}

.close-btn:hover {
  color: var(--text);
}

.modal-body {
  padding: 1.25rem;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.radio-option:hover {
  background: var(--accent-light);
}

.radio-option input {
  accent-color: var(--accent);
}

.modal-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  text-align: right;
}


.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 100px;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1100;
}


.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.9);
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
</style>
