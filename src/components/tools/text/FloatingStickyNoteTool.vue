<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">悬浮<span>记事本()</span></h1>
        <div class="badge">📌 Floating Note</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- 1. 编辑区 -->
          <section class="brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 编辑区 (EDITOR)</span>
              <div class="panel-actions">
                <span class="stats-info bg-yellow">{{ saveStatus }}</span>
                <span class="stats-info bg-yellow">{{ content.length }} 字</span>
                <button
                  class="brutal-btn icon-btn"
                  title="在新窗口中打开置顶记事本"
                  @click="openFloatingNote"
                >
                  🚀 悬浮窗
                </button>
              </div>
            </div>
            <div class="editor-wrapper">
              <div class="title-bar">
                <input v-model="noteTitle" class="brutal-input" placeholder="输入标题..." />
              </div>
              <textarea
                v-model="content"
                class="code-editor"
                placeholder="开始记录..."
                spellcheck="false"
                @input="autoSave"
              ></textarea>
            </div>
            <div class="pane-footer bg-yellow">
              <button class="brutal-btn icon-btn" :disabled="!content" @click="copyContent">
                📋 复制
              </button>
              <button class="brutal-btn icon-btn" :disabled="!content" @click="downloadNote">
                📥 下载
              </button>
              <button class="brutal-btn icon-btn" style="color: #ff4b4b" @click="clearContent">
                🗑️ 清空
              </button>
            </div>
          </section>

          <!-- 2. 历史与说明区 -->
          <div class="side-panel">
            <section class="brutal-pane history-pane">
              <div class="pane-header bg-pink text-white">
                <span class="panel-title">2. 历史记录 (HISTORY)</span>
              </div>
              <div class="tools-scroll-area">
                <div v-if="savedNotes.length" class="notes-grid">
                  <div
                    v-for="(note, idx) in savedNotes"
                    :key="idx"
                    class="note-card brutal-btn"
                    @click="loadNote(note)"
                  >
                    <div class="note-title">{{ note.title || '无标题' }}</div>
                    <div class="note-preview">{{ note.content.substring(0, 80) }}...</div>
                    <div class="note-footer">
                      <span class="note-time">{{ note.time }}</span>
                      <button class="del-btn" @click.stop="deleteNote(idx)">🗑️</button>
                    </div>
                  </div>
                </div>
                <div v-else class="no-data">暂无历史记录</div>
              </div>
            </section>

            <section class="brutal-pane mt-2">
              <div class="pane-header bg-blue text-white">
                <span class="panel-title">💡 功能说明</span>
              </div>
              <div class="tips-content">
                <ul>
                  <li>
                    <strong>悬浮窗模式</strong
                    >：点击"悬浮窗"可在新窗口中使用置顶记事本（需要浏览器允许弹窗弹窗）。
                  </li>
                  <li><strong>自动保存</strong>：内容会自动保存到浏览器本地缓存中。</li>
                  <li><strong>快速复制</strong>：支持一键复制，随时记录和整理。</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const noteTitle = ref('');
  const content = ref('');
  const saveStatus = ref('未保存');
  const savedNotes = ref([]);
  const { copyToClipboard } = useCopy();

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
    copyToClipboard(content.value, { success: '已复制到剪贴板' });
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
<html><head><meta charset="UTF-8"><title>悬浮记事本 (Brutal)</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@700;800&family=Noto+Sans+SC:wght@700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'IBM Plex Mono','Noto Sans SC',monospace;background:#fdfae5;color:#111;height:100vh;display:flex;flex-direction:column;border:4px solid #111;box-shadow:inset 0 0 0 2px #ffd900;}
.header{padding:8px 12px;background:#ffd900;border-bottom:4px solid #111;display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none}
.title{font-size:14px;font-family:'Syne',sans-serif;font-weight:800;text-transform:uppercase}
.btns{display:flex;gap:4px}
.btn{background:#fff;border:3px solid #111;color:#111;font-size:12px;font-weight:700;cursor:pointer;padding:4px 8px;box-shadow:2px 2px 0px #111;transition:all 0.1s;font-family:'Noto Sans SC',sans-serif;}
.btn:active{transform:translate(2px,2px);box-shadow:0 0 0 #111;}
textarea{flex:1;resize:none;border:none;padding:12px;font-size:14px;line-height:1.6;background:#fff;color:#111;outline:none;font-family:'IBM Plex Mono',monospace;}
textarea::placeholder{color:#999}
.footer{padding:6px 12px;background:#111;color:#ffd900;font-size:12px;display:flex;justify-content:space-between;border-top:4px solid #111;font-weight:700;}
</style></head><body>
<div class="header"><span class="title">📌 Note</span>
<div class="btns"><button class="btn" onclick="copyText()">复制</button><button class="btn" onclick="pasteText()">粘贴</button><button class="btn" onclick="clearText()">清空</button></div></div>
<textarea id="note" placeholder="在此快速输入..."></textarea>
<div class="footer"><span id="count">0 字</span><span id="status">就绪</span></div>
<script>
const note=document.getElementById('note'),count=document.getElementById('count'),status=document.getElementById('status');
note.value=localStorage.getItem('floating-note-popup')||'';
updateCount();
note.addEventListener('input',()=>{updateCount();save()});
function updateCount(){count.textContent=note.value.length+' 字'}
function save(){status.textContent='保存中...';clearTimeout(window.st);window.st=setTimeout(()=>{localStorage.setItem('floating-note-popup',note.value);status.textContent='已保存'},500)}
function copyText(){navigator.clipboard.writeText(note.value);status.textContent='已复制'}
async function pasteText(){try{const t=await navigator.clipboard.readText();note.value+=t;updateCount();save()}catch{status.textContent='失败'}}
function clearText(){note.value='';updateCount();save()}
<'+'/script></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, 'FloatingNote', 'width=340,height=420,top=100,left=100,alwaysRaised=yes');
  };

  onMounted(loadSavedNotes);
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
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    align-items: stretch;
    min-height: 600px;
    height: calc(100vh - 180px);
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
    gap: 0.5rem;
    align-items: center;
  }
  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
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

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .title-bar {
    padding: 0.5rem 1rem;
    border-bottom: 3px solid #111;
    background: #fdfae5;
  }

  .brutal-input {
    width: 100%;
    background: transparent;
    border: none;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 900;
    color: #111;
    outline: none;
  }
  .brutal-input::placeholder {
    color: #999;
  }

  .code-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Consolas', monospace;
    font-size: 1rem;
    line-height: 1.6;
    background: #fdfdfd;
    color: #111;
    box-sizing: border-box;
  }

  .pane-footer {
    padding: 0.5rem 1rem;
    border-top: 3px solid #111;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .history-pane {
    flex: 1;
  }
  .mt-2 {
    margin-top: 0;
  }

  .tools-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: #fdfae5;
    height: 100%;
  }

  .notes-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .note-card {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    text-align: left;
    text-transform: none;
  }

  .note-title {
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .note-preview {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.85rem;
    font-weight: 400;
    line-height: 1.4;
    max-height: 2.8em;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.5rem;
    flex: 1;
  }

  .note-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }
  .note-time {
    font-size: 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    color: #444;
  }
  .del-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    padding: 2px;
  }
  .del-btn:hover {
    transform: scale(1.1);
  }

  .no-data {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    text-align: center;
    color: #666;
    padding: 2rem;
  }

  .tips-content {
    padding: 1.5rem;
    background: #fff;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.8;
  }
  .tips-content ul {
    padding-left: 1.5em;
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
  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .pane-footer,
  [data-theme='dark'] .title-bar {
    border-color: #eee;
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
  [data-theme='dark'] .brutal-input {
    color: #eee;
  }
  [data-theme='dark'] .tools-scroll-area {
    background: #111;
  }
  [data-theme='dark'] .note-time {
    color: #aaa;
  }
  [data-theme='dark'] .tips-content {
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
  [data-theme='dark'] .title-bar {
    background: #222;
  }
  [data-theme='dark'] .stats-info {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
  }
</style>
