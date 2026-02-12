<template>
  <div class="text-line-break-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>文案分行整理</h1>
        <span class="nav-subtitle">Text Line Breaker</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-layout">
        <div class="settings-panel glass-card">
          <h3>排版设置</h3>

          <div class="control-group">
            <label>单行最大字数: {{ maxLength }}</label>
            <input
              v-model.number="maxLength"
              type="range"
              min="10"
              max="50"
              step="1"
              class="slider"
            />
          </div>

          <div class="control-group">
            <label>分行模式</label>
            <div class="radio-group">
              <label class="radio-label">
                <input v-model="mode" type="radio" value="smart" />
                智能语义
                <span class="tip">按标点符号分行</span>
              </label>
              <label class="radio-label">
                <input v-model="mode" type="radio" value="fixed" />
                固定字数
                <span class="tip">强制截断</span>
              </label>
            </div>
          </div>

          <div class="control-group">
            <label class="checkbox-label">
              <input v-model="removeEmptyLines" type="checkbox" />
              去除原空行
            </label>
            <label class="checkbox-label">
              <input v-model="addSpaceBetween" type="checkbox" />
              段落增加空行
            </label>
            <label class="checkbox-label">
              <input v-model="centerMode" type="checkbox" />
              居中对齐预览
            </label>
          </div>

          <button class="action-btn" @click="handleCopy">
            <el-icon>
              <DocumentCopy />
            </el-icon>
            复制结果
          </button>
          <button class="action-btn outline" @click="clearInput">
            <el-icon>
              <Delete />
            </el-icon>
            清空
          </button>
        </div>

        <div class="work-area">
          <div class="input-card glass-card">
            <div class="card-header">
              <span>输入文本</span>
              <span class="count">{{ inputText.length }} 字</span>
            </div>
            <textarea v-model="inputText" placeholder="请粘贴长文本、歌词或文案..."></textarea>
          </div>

          <div class="output-card glass-card">
            <div class="card-header">
              <span>预览结果</span>
              <span class="count">{{ resultLines.length }} 行</span>
            </div>
            <div class="preview-box" :class="{ centered: centerMode }">
              <div v-if="resultText" class="preview-content">{{ resultText }}</div>
              <div v-else class="empty-preview">排版预览区域</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 文案分行整理</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, DocumentCopy, Delete } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const inputText = ref('');
  const maxLength = ref(18);
  const mode = ref('smart');
  const removeEmptyLines = ref(true);
  const addSpaceBetween = ref(false);
  const centerMode = ref(false);

  const resultLines = computed(() => {
    if (!inputText.value) return [];

    let text = inputText.value;

    if (removeEmptyLines.value) {
      text = text.replace(/^\s*[\r\n]/gm, '');
    }

    let lines = [];

    if (mode.value === 'fixed') {
      const paragraphs = text.split('\n');

      paragraphs.forEach(p => {
        if (!p.trim()) return;
        for (let i = 0; i < p.length; i += maxLength.value) {
          lines.push(p.slice(i, i + maxLength.value));
        }
        if (addSpaceBetween.value) lines.push('');
      });
    } else {
      const paragraphs = text.split('\n');

      paragraphs.forEach(p => {
        p = p.trim();
        if (!p) return;

        const segments = p.split(/([，。！？；;,.!?])/).filter(s => s.trim());

        let currentLine = '';

        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];

          if (/^[，。！？；;,.!?]$/.test(seg)) {
            currentLine += seg;

            lines.push(currentLine);
            currentLine = '';
            continue;
          }

          if ((currentLine + seg).length > maxLength.value) {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = '';
            }

            if (seg.length > maxLength.value) {
              for (let k = 0; k < seg.length; k += maxLength.value) {
                const chunk = seg.slice(k, k + maxLength.value);
                if (k + maxLength.value >= seg.length) {
                  currentLine = chunk;
                } else {
                  lines.push(chunk);
                }
              }
            } else {
              currentLine = seg;
            }
          } else {
            currentLine += seg;
          }
        }

        if (currentLine) lines.push(currentLine);
        if (addSpaceBetween.value) lines.push('');
      });
    }

    if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

    return lines;
  });

  const resultText = computed(() => resultLines.value.join('\n'));

  const handleCopy = () => {
    copyToClipboard(resultText.value, { success: '已复制到剪贴板' });
  };

  const clearInput = () => {
    inputText.value = '';
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .text-line-break-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #8b5cf6;

    --accent-light: #f3f0ff;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
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

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .settings-panel h3 {
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .control-group {
    margin-bottom: 1.5rem;
  }

  .control-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: bold;
    color: var(--text);
    margin-bottom: 0.75rem;
  }

  .slider {
    width: 100%;
    accent-color: var(--accent);
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: normal;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .radio-label input {
    accent-color: var(--accent);
    transform: scale(1.2);
  }

  .tip {
    font-size: 0.75rem;
    color: var(--text-2);
    font-weight: normal;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    font-weight: normal;
    font-size: 0.9rem;
    user-select: none;
    margin-bottom: 0.5rem;
  }

  .checkbox-label input {
    accent-color: var(--accent);
    transform: scale(1.2);
  }

  .action-btn {
    width: 100%;
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    border-radius: 8px;
    border: none;
    font-size: 0.95rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--text);
    color: white;
    transition: all 0.2s;
  }

  .action-btn.outline {
    background: white;
    border: 1px solid var(--border);
    color: var(--text);
  }

  .action-btn:hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  .work-area {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: var(--text-2);
    font-weight: 600;
  }

  .input-card textarea {
    width: 100%;
    height: 150px;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    font-family: inherit;
    background: #fdfdfd;
  }

  .input-card textarea:focus {
    border-color: var(--accent);
  }

  .preview-box {
    background: #f9f9f9;

    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 2rem;
    min-height: 200px;
  }

  .preview-box.centered {
    text-align: center;
  }

  .preview-content {
    white-space: pre-wrap;
    font-size: 1rem;
    line-height: 2;

    color: var(--text);
    font-family: 'Noto Serif SC', serif;
  }

  .empty-preview {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    height: 150px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }

  @media (max-width: 800px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
