<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack"
          ><el-icon> <ArrowLeft /> </el-icon><span>返回</span></el-button
        >
      </div>
      <div class="header-center">
        <h1 class="tool-title">悬浮记事本</h1>
        <span class="tool-subtitle">Floating Sticky Note</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="openFloatingNote">
          <el-icon>
            <FullScreen />
          </el-icon>
          打开悬浮窗
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="main-editor glass-card">
        <div class="editor-header">
          <el-input v-model="noteTitle" placeholder="标题..." size="large" class="title-input" />
          <div class="word-count">{{ content.length }} 字</div>
        </div>
        <el-input
          v-model="content"
          type="textarea"
          :rows="16"
          placeholder="开始记录..."
          @input="autoSave"
        />
        <div class="editor-footer">
          <span class="save-status">{{ saveStatus }}</span>
          <div class="actions">
            <el-button text :disabled="!content" @click="copyContent">复制</el-button>
            <el-button text :disabled="!content" @click="downloadNote">下载</el-button>
            <el-button text type="danger" @click="clearContent">清空</el-button>
          </div>
        </div>
      </div>

      <div class="notes-list glass-card">
        <h3>历史记录</h3>
        <div v-if="savedNotes.length" class="notes-grid">
          <div
            v-for="(note, idx) in savedNotes"
            :key="idx"
            class="note-card"
            @click="loadNote(note)"
          >
            <div class="note-title">{{ note.title || '无标题' }}</div>
            <div class="note-preview">{{ note.content.substring(0, 80) }}...</div>
            <div class="note-time">{{ note.time }}</div>
            <el-button
              class="delete-btn"
              text
              type="danger"
              size="small"
              @click.stop="deleteNote(idx)"
            >
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
        </div>
        <div v-else class="empty-state">暂无历史记录</div>
      </div>

      <div class="tips-section glass-card">
        <h4>功能说明</h4>
        <ul>
          <li><strong>悬浮窗模式</strong>：点击"打开悬浮窗"可在新窗口中使用置顶记事本</li>
          <li><strong>自动保存</strong>：内容会自动保存到浏览器本地存储</li>
          <li><strong>快速粘贴</strong>：悬浮窗支持自动捕获剪贴板内容</li>
        </ul>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 悬浮记事本</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, FullScreen, Delete } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => router.back();

  const noteTitle = ref('');
  const content = ref('');
  const saveStatus = ref('未保存');
  const savedNotes = ref([]);

  let saveTimer = null;

  const autoSave = () => {
    saveStatus.value = '正在保存...';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(
        'floating-note-current',
        JSON.stringify({ title: noteTitle.value, content: content.value })
      );
      saveStatus.value = '已自动保存';
    }, 1000);
  };

  const loadSavedNotes = () => {
    const notes = localStorage.getItem('floating-note-history');
    if (notes) savedNotes.value = JSON.parse(notes);
    const current = localStorage.getItem('floating-note-current');
    if (current) {
      const data = JSON.parse(current);
      noteTitle.value = data.title || '';
      content.value = data.content || '';
    }
  };

  const saveToHistory = () => {
    if (!content.value.trim()) return;
    const note = {
      title: noteTitle.value || '无标题',
      content: content.value,
      time: new Date().toLocaleString('zh-CN')
    };
    savedNotes.value.unshift(note);
    if (savedNotes.value.length > 20) savedNotes.value.pop();
    localStorage.setItem('floating-note-history', JSON.stringify(savedNotes.value));
  };

  const loadNote = note => {
    noteTitle.value = note.title;
    content.value = note.content;
    autoSave();
  };

  const deleteNote = idx => {
    savedNotes.value.splice(idx, 1);
    localStorage.setItem('floating-note-history', JSON.stringify(savedNotes.value));
    ElMessage.success('已删除');
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content.value);
    ElMessage.success('已复制到剪贴板');
  };

  const downloadNote = () => {
    const blob = new Blob([content.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.value || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearContent = () => {
    saveToHistory();
    noteTitle.value = '';
    content.value = '';
    localStorage.removeItem('floating-note-current');
    saveStatus.value = '已清空';
  };

  const openFloatingNote = () => {
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>悬浮记事本</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui;background:#1e293b;color:#e2e8f0;height:100vh;display:flex;flex-direction:column}
.header{padding:8px 12px;background:#334155;display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none}
.title{font-size:12px;font-weight:600}
.btns{display:flex;gap:8px}
.btn{background:none;border:none;color:#94a3b8;font-size:12px;cursor:pointer;padding:4px 8px;border-radius:4px}
.btn:hover{background:#475569;color:#fff}
textarea{flex:1;resize:none;border:none;padding:12px;font-size:14px;line-height:1.6;background:#0f172a;color:#e2e8f0;outline:none}
textarea::placeholder{color:#64748b}
.footer{padding:6px 12px;background:#334155;font-size:11px;color:#64748b;display:flex;justify-content:space-between}
</style></head><body>
<div class="header"><span class="title">📝 悬浮记事本</span>
<div class="btns"><button class="btn" onclick="copyText()">复制</button><button class="btn" onclick="pasteText()">粘贴</button><button class="btn" onclick="clearText()">清空</button></div></div>
<textarea id="note" placeholder="开始记录..."></textarea>
<div class="footer"><span id="count">0 字</span><span id="status">就绪</span></div>
<script>
const note=document.getElementById('note'),count=document.getElementById('count'),status=document.getElementById('status');
note.value=localStorage.getItem('floating-note-popup')||'';
updateCount();
note.addEventListener('input',()=>{updateCount();save()});
function updateCount(){count.textContent=note.value.length+' 字'}
function save(){status.textContent='保存中...';clearTimeout(window.st);window.st=setTimeout(()=>{localStorage.setItem('floating-note-popup',note.value);status.textContent='已保存'},500)}
function copyText(){navigator.clipboard.writeText(note.value);status.textContent='已复制'}
async function pasteText(){try{const t=await navigator.clipboard.readText();note.value+=t;updateCount();save()}catch{status.textContent='粘贴失败'}}
function clearText(){note.value='';updateCount();save()}
\u003C/script></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, 'FloatingNote', 'width=320,height=400,top=100,left=100,alwaysRaised=yes');
  };

  onMounted(loadSavedNotes);
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .main-editor {
    padding: 1.5rem;
  }

  .editor-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .title-input {
    flex: 1;
  }

  .title-input :deep(.el-input__inner) {
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    background: transparent;
  }

  .word-count {
    font-size: 0.85rem;
    color: #64748b;
    white-space: nowrap;
  }

  .editor-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
  }

  .save-status {
    font-size: 0.8rem;
    color: #64748b;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
  }

  .notes-list {
    padding: 1.5rem;
  }

  .notes-list h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #1e293b;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .note-card {
    position: relative;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
    cursor: pointer;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
  }

  .note-card:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .note-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .note-preview {
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.5;
    margin-bottom: 0.5rem;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .note-time {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .delete-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    opacity: 0;
  }

  .note-card:hover .delete-btn {
    opacity: 1;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }

  .tips-section {
    padding: 1.5rem;
  }

  .tips-section h4 {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
    color: #475569;
  }

  .tips-section ul {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.8;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  :deep(.el-textarea__inner) {
    font-size: 0.95rem;
    line-height: 1.8;
  }
</style>
