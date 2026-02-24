<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">图片<span>.转PDF()</span></h1>
        <button class="brutal-btn clear-btn" :disabled="!images.length" @click="clearAll">
          清空全部
        </button>
      </header>

      <div class="brutal-toolbar">
        <div class="tools-left">
          <button class="brutal-action-btn primary" :disabled="!images.length" @click="generatePdf">
            生成 PDF
          </button>
          <button class="brutal-action-btn" @click="triggerUpload">添加图片</button>
          <input
            ref="fileInput"
            type="file"
            multiple
            hidden
            accept="image/*"
            @change="handleFileSelect"
          />
        </div>
        <div class="tools-right">
          <span
            >当前负载: <span class="badge">{{ images.length }}</span> 张图片</span
          >
        </div>
      </div>

      <div class="brutal-grid">
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span class="text-black">原文件.列表</span>
          </div>
          <div class="upload-wrapper" :class="{ 'has-images': images.length }">
            <div
              v-if="!images.length"
              class="brutal-upload-area"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-text">
                <h3>[ 点击 / 拖拽载入图像 ]</h3>
                <p>支持 JPG, PNG, WebP... 允许多选</p>
              </div>
            </div>

            <draggable
              v-else
              v-model="images"
              item-key="id"
              handle=".drag-handle"
              class="brutal-images-list"
              ghost-class="ghost"
            >
              <template #item="{ element: img, index }">
                <div class="brutal-image-item">
                  <div class="drag-handle">≡</div>
                  <div class="image-preview"><img :src="img.url" /></div>
                  <div class="image-info">
                    <span class="image-index">{{ index + 1 }}</span>
                    <span class="image-name">{{ img.name }}</span>
                  </div>
                  <button class="brutal-delete-btn" @click="removeImage(index)">╳</button>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">配置.格式参数</span>
          </div>
          <div class="brutal-settings">
            <div class="settings-group">
              <label>页面尺寸</label>
              <select v-model="config.pageSize" class="brutal-select">
                <option value="a4">A4 (标准)</option>
                <option value="a3">A3 (大尺寸)</option>
                <option value="letter">Letter</option>
                <option value="auto">自适应纵横比</option>
              </select>
            </div>
            <div v-if="config.pageSize !== 'auto'" class="settings-group">
              <label>页面方向</label>
              <div class="brutal-radio-group">
                <button
                  class="brutal-action-btn"
                  :class="{ active: config.orientation === 'portrait' }"
                  @click="config.orientation = 'portrait'"
                >
                  [ 纵向 ]
                </button>
                <button
                  class="brutal-action-btn"
                  :class="{ active: config.orientation === 'landscape' }"
                  @click="config.orientation = 'landscape'"
                >
                  [ 横向 ]
                </button>
              </div>
            </div>
            <div class="settings-group">
              <label>输出文件命名</label>
              <input v-model="config.filename" class="brutal-input" placeholder="output" />
            </div>

            <div class="brutal-status-panel">
              <h4>// 作业提示</h4>
              <p>› 拖动列表项 ≡ 以改变合成顺序。</p>
              <p>› [自适应纵横比] 将保留原始图片分辨率大小。</p>
              <p>› 完全本地化处理，无隐私泄露风险。</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="generating" class="brutal-status success">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i"
              >系统正在拼合处理 PDF 块... 引擎正常工作中 // &nbsp;</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { jsPDF } from 'jspdf';
  // 移除 Element 相关的 Icons
  import draggable from 'vuedraggable';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const { fileInput, triggerFileInput, handleFileSelect, handleFileDrop, dragOver, dragLeave } =
    useFileHandler({
      accept: 'image/*',
      readMode: 'none',
      multiple: true,
      onSuccess: result => {
        addImages([result.file]);
      }
    });

  const images = ref([]);
  const generating = ref(false);
  let imageId = 0;

  const config = reactive({ pageSize: 'a4', orientation: 'portrait', filename: 'merged' });
  const pageSizes = { a4: [210, 297], a3: [297, 420], letter: [216, 279] };

  const triggerUpload = () => triggerFileInput();
  const addImages = files =>
    files.forEach(f =>
      images.value.push({
        id: ++imageId,
        file: f,
        name: f.name,
        size: f.size,
        url: URL.createObjectURL(f)
      })
    );

  const removeImage = i => {
    URL.revokeObjectURL(images.value[i].url);
    images.value.splice(i, 1);
  };

  const clearAll = () => {
    images.value.forEach(i => URL.revokeObjectURL(i.url));
    images.value = [];
  };

  const loadImage = url =>
    new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = url;
    });

  const generatePdf = async () => {
    if (!images.value.length) return;
    generating.value = true;
    try {
      let pdf;
      for (let i = 0; i < images.value.length; i++) {
        const img = await loadImage(images.value[i].url);
        let w, h;
        if (config.pageSize === 'auto') {
          w = img.width * 0.75;
          h = img.height * 0.75;
        } else {
          const sz = pageSizes[config.pageSize];
          w = ((config.orientation === 'landscape' ? sz[1] : sz[0]) / 25.4) * 72;
          h = ((config.orientation === 'landscape' ? sz[0] : sz[1]) / 25.4) * 72;
        }
        if (i === 0) pdf = new jsPDF({ unit: 'pt', format: [w, h] });
        else pdf.addPage([w, h]);
        const scale = Math.min(w / img.width, h / img.height, 1);
        const dw = img.width * scale,
          dh = img.height * scale;
        pdf.addImage(img, 'JPEG', (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
      pdf.save(`${config.filename || 'output'}.pdf`);
      ElMessage.success({ message: '操作完成：PDF生成成功', grouping: true });
    } catch (e) {
      console.error(e);
      ElMessage.error({ message: '致命错误: 生成中止', grouping: true });
    } finally {
      generating.value = false;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
  }

  /* 通用 */
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

    flex: 1;
    text-align: center;
  }

  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: 6px 6px 0px #666;
    border-color: #666;
  }

  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
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
  }

  .tools-left {
    display: flex;
    gap: 1.5rem;
  }

  .tools-right {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .badge {
    background: #111;
    color: #fff;
    padding: 0.2rem 0.6rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }

  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active:not(:disabled),
  .brutal-action-btn.active {
    background: #ffd900;
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn:disabled {
    background: #eee;
    color: #999;
    border-color: #999;
    box-shadow: 4px 4px 0px #999;
    cursor: not-allowed;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 2.5rem;
    margin-bottom: 2rem;
    min-height: 60vh;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }

  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }

  /* 左侧工作区 */
  .upload-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    overflow: hidden;
  }

  .brutal-upload-area {
    flex: 1;
    min-height: 300px;
    margin: 2rem;
    border: 4px dashed #111;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #fdfae5;
    cursor: pointer;
    transition: all 0.2s;
  }

  .brutal-upload-area:hover {
    background: #ffeba0;
    transform: scale(1.02);
  }

  .upload-text h3 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin: 0 0 1rem 0;
  }
  .upload-text p {
    font-family: 'IBM Plex Mono', monospace;
    color: #666;
    margin: 0;
  }

  .brutal-images-list {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: #f9f9f9;
  }

  .brutal-image-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem;
    box-shadow: 4px 4px 0px #111;
    transition: transform 0.1s;
  }

  .brutal-image-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .drag-handle {
    cursor: grab;
    font-size: 1.5rem;
    font-weight: bold;
    color: #111;
    padding: 0 0.5rem;
  }
  .drag-handle:active {
    cursor: grabbing;
  }
  .ghost {
    opacity: 0.5;
    background: #ffd900;
  }

  .image-preview {
    width: 60px;
    height: 60px;
    border: 2px solid #111;
    background: #eee;
  }
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .image-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    overflow: hidden;
  }

  .image-index {
    background: #111;
    color: #fff;
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #4b7bff;
  }

  .image-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .brutal-delete-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: transform 0.1s;
  }
  .brutal-delete-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-delete-btn:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  /* 右侧设置 */
  .brutal-settings {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .settings-group label {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .brutal-select,
  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: transform 0.1s;
  }
  .brutal-select:focus,
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #fdfae5;
  }

  .brutal-radio-group {
    display: flex;
    gap: 0.5rem;
  }
  .brutal-radio-group .brutal-action-btn {
    flex: 1;
    padding: 0.5rem;
    font-size: 1rem;
  }

  .brutal-status-panel {
    background: #f1f5f9;
    padding: 1.25rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    margin-top: auto;
  }
  .brutal-status-panel h4 {
    margin: 0 0 0.75rem 0;
    font-weight: 800;
    color: #111;
  }
  .brutal-status-panel p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #444;
  }

  /* 状态栏滚动 */
  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    overflow: hidden;
    position: relative;
    text-transform: uppercase;
  }
  .brutal-status.success {
    background: #00e572;
    color: #111;
  }
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 15s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 1024px) {
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-toolbar {
      flex-direction: column;
      gap: 1.5rem;
      align-items: flex-start;
    }
    .tools-left {
      flex-wrap: wrap;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-image-item,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-images-list {
    background: #111;
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover:not(:disabled) {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active:not(:disabled) {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-image-item,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-status-panel {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn:hover:not(:disabled),
  [data-theme='dark'] .brutal-image-item:hover,
  [data-theme='dark'] .brutal-select:focus,
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn:active:not(:disabled),
  [data-theme='dark'] .brutal-action-btn.active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }

  [data-theme='dark'] .image-index {
    box-shadow: 2px 2px 0px #eee;
    background: #333;
  }
  [data-theme='dark'] .brutal-delete-btn {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-delete-btn:hover {
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .text-black {
    color: #fff;
  }
  [data-theme='dark'] .drag-handle {
    color: #eee;
  }
  [data-theme='dark'] .image-preview {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel h4 {
    color: #eee;
  }
  [data-theme='dark'] .brutal-status-panel p {
    color: #aaa;
  }
</style>
