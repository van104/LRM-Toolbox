<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">隐私剔除<span>.清洗池()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="files.length === 0" @click="clearList">
            清空池水
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Upload -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>污渍过滤.进水口</span>
            <div class="pane-actions">
              <button @click="triggerUpload">投放目标</button>
            </div>
          </div>

          <div class="control-panel-content">
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              style="display: none"
              @change="handleFileChange"
            />

            <div
              class="brutal-upload-area"
              @click="triggerUpload"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <div class="upload-placeholder">
                <span class="upload-icon">🧼</span>
                <p>点击或拖拽投入脏乱像素图层</p>
                <small>(将在本地物理洗去所有 EXIF / GPS 隐私附着物)</small>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>🎯 洗涤协议备忘</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                该工程利用浏览器前端的重绘机制，将目标图像映射至极纯净的离线缓冲区 Canvas
                中重生。<br />
                所有潜在的相机型号、拍摄定位追踪(GPS)、快门时机数据将在重绘中遭遇毁灭。请安心食用。
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧: List & Actions -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">清洗清单.管理侧</span>
          </div>

          <div class="settings-content">
            <div class="channel-group bg-cyan">
              <h4 class="text-white" style="margin: 0; font-family: 'Syne', sans-serif">
                代清理队列 ({{ files.length }} Object)
              </h4>
            </div>

            <div class="file-list mt-4">
              <div v-if="files.length === 0" class="empty-list">
                槽内空无一物，等待投入清洗对象。
              </div>

              <div
                v-for="(file, index) in files"
                :key="index"
                class="file-item brutal-shadow"
                :class="{
                  'status-success': file.status === 'success',
                  'status-error': file.status === 'error'
                }"
              >
                <div class="item-name" :title="file.original.name">{{ file.original.name }}</div>
                <div class="item-size">{{ formatSize(file.original.size) }}</div>
                <div class="item-tag">
                  <span v-if="file.status === 'pending'">[ 等期待洗 ]</span>
                  <span v-else-if="file.status === 'success'" style="color: #00994c"
                    >[ 纯净萃取 ]</span
                  >
                  <span v-else-if="file.status === 'error'" style="color: #cc0000"
                    >[ 洗出故障 ]</span
                  >
                </div>
              </div>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="files.length === 0 || processing"
              @click="startCleaning"
            >
              {{ processing ? '引擎暴热运行中...' : '启动高压清洗流 & 封存导出' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 全局状态栏 -->
      <div class="brutal-status" :class="statusClass">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span>
              <span v-for="i in 10" :key="i">{{ statusText }} // &nbsp;</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';

  interface FileItem {
    original: File;
    status: 'pending' | 'success' | 'error';
    cleanedBlob?: Blob;
  }

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const fileInput = ref<HTMLInputElement | null>(null);
  const files = ref<FileItem[]>([]);
  const processing = ref(false);

  const triggerUpload = () => fileInput.value?.click();

  const handleFileChange = (e: Event) => {
    const fileList = (e.target as HTMLInputElement).files;
    if (fileList) addFiles(Array.from(fileList));
    if (fileInput.value) fileInput.value.value = '';
  };

  const handleDrop = (e: DragEvent) => {
    const fileList = e.dataTransfer?.files;
    if (fileList) addFiles(Array.from(fileList));
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      ElMessage.warning('警告：只允许投入位图类实体数据');
      return;
    }

    files.value.push(
      ...validFiles.map(f => ({
        original: f,
        status: 'pending' as const
      }))
    );
  };

  const clearList = () => {
    files.value = [];
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cleanMetadata = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context failed'));
          return;
        }
        ctx.drawImage(img, 0, 0);

        // Exporting to blob strips metadata
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else reject(new Error('Blob creation failed'));
          },
          file.type,
          0.95
        ); // High quality
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  };

  const startCleaning = async () => {
    if (files.value.length === 0) return;
    processing.value = true;

    try {
      const zip = new JSZip();
      let successCount = 0;

      for (const item of files.value) {
        if (item.status === 'success') {
          // Already processed
          if (item.cleanedBlob) {
            zip.file(`cleaned_${item.original.name}`, item.cleanedBlob);
            successCount++;
          }
          continue;
        }

        try {
          const blob = await cleanMetadata(item.original);
          item.cleanedBlob = blob;
          item.status = 'success';
          zip.file(`safe_${item.original.name}`, blob);
          successCount++;
        } catch (e) {
          console.error(e);
          item.status = 'error';
        }
      }

      if (successCount > 0) {
        if (successCount === 1 && files.value.length === 1) {
          // Single file download
          const item = files.value[0];
          if (item.cleanedBlob) {
            saveAs(item.cleanedBlob, `safe_${item.original.name}`);
          }
        } else {
          // Zip download
          const content = await zip.generateAsync({ type: 'blob' });
          saveAs(content, `lrm_safe_cargo_${Date.now()}.zip`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      processing.value = false;
    }
  };

  const statusClass = computed(() => {
    if (processing.value) return 'warn';
    if (files.value.some(f => f.status === 'success')) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (processing.value) return '警告: 正在注入高压清洗液剥离图层元数据...';
    if (files.value.some(f => f.status === 'success'))
      return '洗涤终场 : 已产生绝对无害纯净实体并抛出下载通道...';
    if (files.value.length > 0) return '流水线排队就位 : 引擎随时可以启动暴压阀门';
    return '蓄水池静默态 : 期待新一轮藏污纳秽的数据碎片投入';
  });
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
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 2rem;
  }
  .header-action.start {
    display: flex;
    justify-content: flex-start;
  }
  .header-action.end {
    display: flex;
    justify-content: flex-end;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
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
  .brutal-btn-block {
    display: block;
    width: 100%;
    text-align: center;
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
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    box-shadow: 2px 2px 0px #888;
    cursor: not-allowed;
    transform: none;
  }
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }

  .action-btn {
    background: #00e572;
    color: #111;
    padding: 1rem;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 500px;
    gap: 3rem;
    margin-bottom: 3rem;
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
  .bg-cyan {
    background: #2dfdff;
  }
  .bg-pink {
    background: #ff9ecf;
  }
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .pane-actions button:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .control-panel-content,
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }
  .settings-content {
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-upload-area {
    border: 4px dashed #111;
    background: #fff;
    padding: 2.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .brutal-upload-area:hover {
    background: #ffd900;
    border-style: solid;
  }
  .upload-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  }
  .empty-list {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    font-size: 1rem;
    color: #666;
    font-style: italic;
  }

  .file-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: 700;
  }
  .item-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-size {
    color: #666;
    font-size: 0.85rem;
  }
  .item-tag {
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
  }
  .status-success {
    background: #eaffea;
    border-color: #00994c;
  }
  .status-error {
    background: #ffeaea;
    border-color: #ff4b4b;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
  }
  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
  }
  .channel-group.group-pink {
    background: #fdfae5;
  }
  .channel-group h4 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }
  .group-pink h4 {
    color: #ff6bc9;
    text-shadow: 1px 1px 0px #111;
  }

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
  .brutal-status.info {
    background: #fff;
  }
  .brutal-status.success {
    background: #00e572;
    color: #111;
  }
  .brutal-status.warn {
    background: #ffd900;
    color: #111;
  }

  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-upload-area {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area:hover {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink,
  [data-theme='dark'] .settings-content {
    background: #222;
  }
  [data-theme='dark'] .settings-content {
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .group-pink h4 {
    color: #ff9ecf;
    text-shadow: 1px 1px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background: #1a5e5f;
    color: #fff;
  }
  [data-theme='dark'] .file-item {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .file-item.status-success {
    background: #1a3320;
    border-color: #00994c;
  }
  [data-theme='dark'] .file-item.status-error {
    background: #331a1a;
    border-color: #cc0000;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 4px 4px 0px #eee;
  }
</style>
