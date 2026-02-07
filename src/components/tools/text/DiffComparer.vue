<template>
  <div class="diff-comparer">
    
    <nav class="nav-bar">
      <button @click="goHome" class="nav-back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="nav-center">
        <h1>文本差异比较</h1>
        <span class="nav-subtitle">Text Diff Checker</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      
      <div class="toolbar-card">
        <div class="top-controls">
          <div class="primary-actions">
            <button @click="handleCompare" class="btn primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              比较差异
            </button>
            <button @click="handleClear" class="btn secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              清空
            </button>
            <button @click="handleSwap" class="btn secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
              交换
            </button>
          </div>

          <div class="settings-group">
            <div class="setting-item">
              <label>模式:</label>
              <select v-model="compareMode" class="select-input">
                <option value="line">按行比较</option>
                <option value="word">按词比较</option>
                <option value="character">按字符比较</option>
              </select>
            </div>

            <label class="setting-item checkbox">
              <input type="checkbox" v-model="ignoreWhitespace">
              <span class="check-box"></span>
              忽略空白
            </label>

            <label class="setting-item checkbox">
              <input type="checkbox" v-model="ignoreCase">
              <span class="check-box"></span>
              忽略大小写
            </label>
          </div>
        </div>
      </div>

      
      <div class="editors-grid">
        
        <div class="editor-card">
          <div class="card-header">
            <div class="header-title">
              <span class="dot original"></span>
              <h3>原始文本</h3>
            </div>
            <div class="header-actions">
              <label class="icon-btn" title="上传文件">
                <input type="file" @change="(e) => handleFileUpload(e, 'original')" hidden
                  accept=".txt,.js,.css,.html,.json,.md" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </label>
              <button @click="loadSample('original')" class="icon-btn" title="加载示例">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </button>
            </div>
          </div>
          <textarea v-model="originalText" placeholder="输入原始内容..." class="text-input"></textarea>
        </div>

        
        <div class="editor-card">
          <div class="card-header">
            <div class="header-title">
              <span class="dot modified"></span>
              <h3>修改后文本</h3>
            </div>
            <div class="header-actions">
              <label class="icon-btn" title="上传文件">
                <input type="file" @change="(e) => handleFileUpload(e, 'modified')" hidden
                  accept=".txt,.js,.css,.html,.json,.md" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </label>
              <button @click="loadSample('modified')" class="icon-btn" title="加载示例">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </button>
            </div>
          </div>
          <textarea v-model="modifiedText" placeholder="输入修改后内容..." class="text-input"></textarea>
        </div>
      </div>

      
      <div class="results-section" v-if="diffResult">
        <div class="stats-bar">
          <div class="stat-item added"><span class="dot"></span>新增: {{ stats.added }}</div>
          <div class="stat-item removed"><span class="dot"></span>删除: {{ stats.removed }}</div>
          <div class="stat-item modified"><span class="dot"></span>修改: {{ stats.modified }}</div>
          <div class="stat-item unchanged"><span class="dot"></span>未变: {{ stats.unchanged }}</div>
          <div class="spacer"></div>
          <button @click="toggleSideBySide" class="view-toggle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="isSideBySide" d="M3 3h18v18H3zM12 3v18" />
              <path v-else d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            </svg>
            {{ isSideBySide ? '合并视图' : '并排视图' }}
          </button>
          <button @click="copyResult" class="icon-btn" title="复制结果">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        
        <div v-if="isSideBySide && compareMode === 'line'" class="diff-view side-by-side">
          <div class="side-panel">
            <div class="panel-label">原始</div>
            <div class="diff-content">
              <div v-for="(line, idx) in sideBySideData.original" :key="'orig-' + idx" class="diff-line"
                :class="line.type">
                <span class="line-num">{{ idx + 1 }}</span>
                <span class="line-text">{{ line.content }}</span>
              </div>
            </div>
          </div>
          <div class="side-panel">
            <div class="panel-label">修改后</div>
            <div class="diff-content">
              <div v-for="(line, idx) in sideBySideData.modified" :key="'mod-' + idx" class="diff-line"
                :class="line.type">
                <span class="line-num">{{ idx + 1 }}</span>
                <span class="line-text">{{ line.content }}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div v-else class="diff-view unified">
          <div v-for="(item, idx) in diffResult" :key="idx" class="diff-item" :class="item.type">
            <span v-if="item.content === '\n'" class="newline-mark">↵</span>
            <span v-else>{{ item.content }}</span>
          </div>
        </div>
      </div>

      
      <section class="intro-section">
        <h2>功能特性</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon-box primary">🔍</div>
            <h4>多种比较模式</h4>
            <p>支持按行、按单词、按字符三种精度的文本比对，满足不同粒度的差异分析需求。</p>
          </div>
          <div class="feature-card">
            <div class="icon-box secondary">📄</div>
            <h4>文件支持</h4>
            <p>支持直接上传 txt、js、css、json、md 等多种文本格式文件进行快速比较。</p>
          </div>
          <div class="feature-card">
            <div class="icon-box accent">👁️</div>
            <h4>双视图展示</h4>
            <p>提供"合并视图"与"并排视图"两种模式，可根据习惯自由切换，差异一目了然。</p>
          </div>
          <div class="feature-card">
            <div class="icon-box success">📊</div>
            <h4>智能统计</h4>
            <p>实时统计新增、删除、修改和未变的内容数量，并支持自动跳转到差异点。</p>
          </div>
        </div>

        <div class="usage-guide">
          <h3>使用指南</h3>
          <ol>
            <li>在左侧输入或上传<strong>原始文本</strong>，在右侧输入或上传<strong>修改后文本</strong>。</li>
            <li>在顶部工具栏选择<strong>比较模式</strong>（默认推荐"按行比较"）。</li>
            <li>点击<strong>比较差异</strong>按钮，系统将自动分析并高亮显示不同之处。</li>
            <li>点击结果右上角的<strong>并排视图</strong>按钮，可左右对照查看差异。</li>
            <li>支持一键<strong>复制</strong>差异结果，或使用<strong>交换</strong>按钮快速对调文本。</li>
          </ol>
        </div>
      </section>
    </main>

    <footer class="footer">
      © 2026 LRM工具箱 - 文本差异比较
    </footer>

    
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from "vue";


const originalText = ref("");
const modifiedText = ref("");
const compareMode = ref("line");
const ignoreWhitespace = ref(false);
const ignoreCase = ref(false);
const isSideBySide = ref(false);
const diffResult = ref(null);
const stats = reactive({ added: 0, removed: 0, modified: 0, unchanged: 0 });
const toast = reactive({ show: false, message: "", type: "info" });


function longestCommonSubsequence(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1]);
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return lcs;
}


function preprocess(text) {
  let res = text;
  if (ignoreWhitespace.value) res = res.replace(/\s+/g, "");
  if (ignoreCase.value) res = res.toLowerCase();
  return res;
}

function preprocessItem(item) {
  return preprocess(item);
}


function handleCompare() {
  if (!originalText.value && !modifiedText.value) {
    showToast("请输入需要比较的文本", "error");
    return;
  }

  
  stats.added = 0;
  stats.removed = 0;
  stats.modified = 0;
  stats.unchanged = 0;

  
  let arrA = [], arrB = [];

  if (compareMode.value === 'line') {
    arrA = originalText.value.split('\n');
    arrB = modifiedText.value.split('\n');
  } else if (compareMode.value === 'word') {
    arrA = originalText.value.split(/(\s+|[.,;!?()[\]{}'"`])/).filter(x => x);
    arrB = modifiedText.value.split(/(\s+|[.,;!?()[\]{}'"`])/).filter(x => x);
  } else {
    arrA = originalText.value.split('');
    arrB = modifiedText.value.split('');
  }

  // 预处理用于比较的数组（保持原数组用于显示）
  const compareA = arrA.map(preprocessItem);
  const compareB = arrB.map(preprocessItem);

  const lcs = longestCommonSubsequence(compareA, compareB);

  // 构建差异结果
  const result = [];
  let i = 0, j = 0;
  let lcsIdx = 0;

  // 简单的 diff 算法
  // 注意：LCS 只能找到相同的，中间不同的需要判断是删除还是新增
  // 这里简化处理：A中不同是删除，B中不同是新增

  while (i < arrA.length || j < arrB.length) {
    // 匹配到 LCS 结尾
    if (lcsIdx >= lcs.length) {
      while (i < arrA.length) {
        result.push({ type: 'removed', content: arrA[i] });
        stats.removed++;
        i++;
      }
      while (j < arrB.length) {
        result.push({ type: 'added', content: arrB[j] });
        stats.added++;
        j++;
      }
      break;
    }

    const currentLCS = lcs[lcsIdx];
    const itemA = arrA[i];
    const itemB = arrB[j];

    const processedA = i < arrA.length ? preprocessItem(itemA) : null;
    const processedB = j < arrB.length ? preprocessItem(itemB) : null;

    if (processedA === currentLCS && processedB === currentLCS) {
      result.push({ type: 'unchanged', content: itemA }); // 这里的 itemA 和 itemB 及其相似
      stats.unchanged++;
      i++; j++; lcsIdx++;
    } else if (processedB === currentLCS) {
      // B 匹配 LCS，说明 A 是多余的（删除）
      result.push({ type: 'removed', content: itemA });
      stats.removed++;
      i++;
    } else if (processedA === currentLCS) {
      // A 匹配 LCS，说明 B 是多余的（新增）
      result.push({ type: 'added', content: itemB });
      stats.added++;
      j++;
    } else {
      // 都不匹配，简单的处理方式：认为 A 的是删除，B 的是新增
      // 可以优化为修改（如果相似）
      if (i < arrA.length) {
        result.push({ type: 'removed', content: itemA });
        stats.removed++;
        i++;
      }
      if (j < arrB.length) {
        result.push({ type: 'added', content: itemB });
        stats.added++;
        j++;
      }
    }
  }

  diffResult.value = result;

  // 自动滚动到第一个差异点
  nextTick(() => {
    const container = document.querySelector('.diff-view');
    if (container) {
      const firstDiff = container.querySelector('.added, .removed, .modified');
      if (firstDiff) {
        firstDiff.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  // 如果是行模式，可以在 Side by Side 中做更好的对齐（这里简化处理）
}

const sideBySideData = computed(() => {
  if (compareMode.value !== 'line' || !diffResult.value) {
    return { original: [], modified: [] };
  }

  const original = [];
  const modified = [];

  diffResult.value.forEach(item => {
    if (item.type === 'unchanged') {
      original.push(item);
      modified.push(item);
    } else if (item.type === 'removed') {
      original.push(item);
      // 右侧占位？或者显示为空行
      modified.push({ type: 'empty', content: '' });
    } else if (item.type === 'added') {
      // 左侧占位
      original.push({ type: 'empty', content: '' });
      modified.push(item);
    }
  });

  return { original, modified };
});

function handleClear() {
  originalText.value = "";
  modifiedText.value = "";
  diffResult.value = null;
}

function handleSwap() {
  const temp = originalText.value;
  originalText.value = modifiedText.value;
  modifiedText.value = temp;
  if (diffResult.value) handleCompare();
}

function handleFileUpload(event, target) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (target === 'original') originalText.value = e.target.result;
    else modifiedText.value = e.target.result;
    showToast("文件加载成功", "success");
  };
  reader.readAsText(file);
  event.target.value = '';
}

function loadSample(target) {
  if (target === 'original') {
    originalText.value = `这是原始文本示例。
这是第二行内容。
这是第三行，包含一些关键字。
第四行内容。
最后一行。`;
  } else {
    modifiedText.value = `这是修改后的文本示例。
这是第二行内容，有一些变化。
这是第三行，包含一些不同的关键字。
新增的一行内容。
最后一行，有变化。`;
  }
}

function toggleSideBySide() {
  isSideBySide.value = !isSideBySide.value;
}

function copyResult() {
  if (!diffResult.value) return;
  const text = diffResult.value.map(d => {
    const prefix = d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  ';
    return prefix + d.content;
  }).join(compareMode.value === 'line' ? '\n' : '');

  navigator.clipboard.writeText(text).then(() => {
    showToast("结果已复制", "success");
  });
}

function showToast(msg, type = "info") {
  toast.message = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => toast.show = false, 2000);
}

function goHome() {
  if (window.history.length > 1) window.history.back();
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.diff-comparer {
  --bg: #f5f7fa;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-secondary: #64748b;
  --primary: #10b981;
  --primary-hover: #059669;
  --secondary: #64748b;
  --danger: #ef4444;
  --warning: #f59e0b;
  --added-bg: rgba(16, 185, 129, 0.1);
  --added-text: #047857;
  --removed-bg: rgba(239, 68, 68, 0.1);
  --removed-text: #b91c1c;
  --modified-bg: rgba(245, 158, 11, 0.1);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Noto Sans SC', sans-serif;
  display: flex;
  flex-direction: column;
}


.nav-bar {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.nav-back {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-back:hover {
  background: #f1f5f9;
  color: var(--primary);
}

.nav-center h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.nav-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}


.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.toolbar-card {
  background: var(--card);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.top-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.primary-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn.primary {
  background: var(--primary);
  color: white;
}

.btn.primary:hover {
  background: var(--primary-hover);
}

.btn.secondary {
  background: #f1f5f9;
  color: var(--text);
  border: 1px solid var(--border);
}

.btn.secondary:hover {
  background: #e2e8f0;
}

.settings-group {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text);
}

.select-input {
  padding: 0.4rem 2rem 0.4rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  font-size: 0.9rem;
  color: var(--text);
}

.checkbox {
  cursor: pointer;
  user-select: none;
}

.checkbox input {
  display: none;
}

.check-box {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-radius: 4px;
  display: inline-block;
  position: relative;
  vertical-align: middle;
  margin-right: 0.25rem;
}

.checkbox input:checked+.check-box {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox input:checked+.check-box::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}


.editors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  height: 400px;
}

.editor-card {
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-title h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot.original {
  background: var(--secondary);
}

.dot.modified {
  background: var(--primary);
}

.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
}

.icon-btn:hover {
  background: #e2e8f0;
  color: var(--text);
}

.text-input {
  flex: 1;
  width: 100%;
  resize: none;
  border: none;
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text);
  background: var(--card);
}

.text-input:focus {
  outline: none;
  background: #fafafa;
}


.results-section {
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.stats-bar {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.9rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}

.stat-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-item.added {
  color: var(--added-text);
}

.stat-item.added .dot {
  background: var(--added-text);
}

.stat-item.removed {
  color: var(--removed-text);
}

.stat-item.removed .dot {
  background: var(--removed-text);
}

.stat-item.modified {
  color: var(--warning);
}

.stat-item.modified .dot {
  background: var(--warning);
}

.stat-item.unchanged {
  color: var(--text-secondary);
}

.stat-item.unchanged .dot {
  background: var(--text-secondary);
}

.spacer {
  flex: 1;
}

.view-toggle {
  border: 1px solid var(--border);
  background: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-toggle:hover {
  background: #f1f5f9;
}

.diff-view {
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  max-height: 500px;
  overflow-y: auto;
}


.diff-item {
  display: inline;
  white-space: pre-wrap;
}

.diff-view.unified .diff-item.added {
  background: var(--added-bg);
  color: var(--added-text);
}

.diff-view.unified .diff-item.removed {
  background: var(--removed-bg);
  color: var(--removed-text);
  text-decoration: line-through;
}

.diff-item.modified {
  background: var(--modified-bg);
}


.diff-view.side-by-side {
  display: flex;
  padding: 0;
}

.side-panel {
  flex: 1;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.side-panel:last-child {
  border-right: none;
}

.panel-label {
  padding: 0.5rem;
  background: #f1f5f9;
  border-bottom: 1px solid var(--border);
  font-size: 0.8rem;
  text-align: center;
  color: var(--text-secondary);
}

.diff-content {
  flex: 1;
  overflow-x: auto;
}

.diff-line {
  display: flex;
  padding: 0 0.5rem;
}

.diff-line:hover {
  background: #f8fafc;
}

.diff-line.added {
  background: var(--added-bg);
}

.diff-line.removed {
  background: var(--removed-bg);
}

.diff-line.empty {
  background: #f3f3f3;
}

.line-num {
  width: 2rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
  user-select: none;
  text-align: right;
  margin-right: 0.8rem;
  opacity: 0.6;
}

.line-text {
  white-space: pre;
}


@media (max-width: 768px) {
  .editors-grid {
    grid-template-columns: 1fr;
    height: auto;
  }

  .text-input {
    height: 200px;
  }

  .top-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 1rem;
  }
}


.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  color: white;
  font-size: 0.9rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: var(--text);
  z-index: 200;
}

.toast.success {
  background: var(--primary);
}

.toast.error {
  background: var(--danger);
}

.toast.info {
  background: var(--text);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(-50%);
}


.intro-section {
  margin-top: 3rem;
  border-top: 1px solid var(--border);
  padding-top: 3rem;
}

.intro-section h2,
.usage-guide h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.intro-section h2::before,
.usage-guide h3::before {
  content: '';
  width: 6px;
  height: 24px;
  background: var(--primary);
  border-radius: 4px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.feature-card {
  background: var(--card);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: var(--primary);
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.icon-box.primary {
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary);
}

.icon-box.secondary {
  background: rgba(100, 116, 139, 0.1);
  color: var(--secondary);
}

.icon-box.accent {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-box.success {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.feature-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.feature-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.usage-guide {
  background: var(--card);
  padding: 2.5rem;
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.usage-guide ol {
  padding-left: 1.5rem;
  color: var(--text-secondary);
  margin: 0;
}

.usage-guide li {
  margin-bottom: 0.75rem;
  line-height: 1.8;
  font-size: 0.95rem;
}

.usage-guide li strong {
  color: var(--text);
  font-weight: 600;
  color: var(--primary);
}


.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary, #64748b);
  font-size: 0.85rem;
}
</style>
