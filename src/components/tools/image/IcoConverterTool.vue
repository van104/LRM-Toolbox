<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">ICO图标<span>.重铸()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!imageUrl" @click="clearAll">
            放弃当前载荷
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: Info & Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>图像矩阵.注入区</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="triggerUpload">更换载荷</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              v-if="!imageUrl"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">⬇️</span>
                <p>点击或拖拽上传以灌注图像模版</p>
                <small>(建议使用正比例且具备透明通道的矩阵层)</small>
              </div>
            </div>

            <div v-else class="preview-thumbnail">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <img :src="imageUrl" alt="Preview" />
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>🎯 说明与功能</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                ▶ 【多维切片】 本操作将执行切分并融合策略，支持一键封印多档分辨率。<br />
                ▶ 【通道保持】 严格继承 Alpha 映射层，原汁原味还原轮廓。<br />
                ▶ 【绝对适应】 完美匹配桌面设备以及 Web 浏览器 Favicon 指纹特征。
              </p>
            </div>
          </div>
        </div>

        <!-- Right Pane: Controls & Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">编译选项.控制台</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group bg-cyan">
              <h4>🎯 指定容纳边界</h4>
              <div class="size-grid mt-3">
                <label v-for="size in availableSizes" :key="size" class="brutal-checkbox-label">
                  <input
                    v-model="selectedSizes"
                    type="checkbox"
                    :value="size"
                    class="brutal-checkbox"
                  />
                  [ {{ size }}x{{ size }} ]
                </label>
              </div>
              <div class="group-actions mt-3">
                <button class="brutal-btn small-btn" @click="selectAll">选择全部矩阵</button>
                <button class="brutal-btn small-btn" @click="selectedSizes = [32]">
                  仅限 32px
                </button>
              </div>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="!imageUrl || selectedSizes.length === 0"
              @click="generateIco"
            >
              启动联合装配 (ICO格式)
            </button>

            <!-- Result Box -->
            <div v-if="convertedUrl" class="result-box mt-4">
              <h4 class="result-title">编译完成</h4>
              <div class="result-file-display">
                <span class="file-icon">📦</span>
                <span class="file-name">{{ resultName }}</span>
              </div>
              <button class="brutal-btn small-btn brutal-btn-block mt-3" @click="downloadIco">
                提取提取制品
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
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
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imageUrl = ref('');
  const resultName = ref('');
  const convertedUrl = ref('');
  const selectedSizes = ref([16, 32, 48, 64]);
  const availableSizes = [16, 32, 48, 64, 128, 256];

  const statusClass = computed(() => {
    if (convertedUrl.value) return 'success';
    if (imageUrl.value) return 'warn';
    return 'info';
  });

  const statusText = computed(() => {
    if (convertedUrl.value) return '执行结束 : 复合格式已装帧，等待向系统磁盘下放';
    if (imageUrl.value) return '阵列已锁定，请校准融合规格并向中央引擎下发编译指令';
    return '主控台就绪 : 监控线程空闲，可承接任意位图矩阵输入动作';
  });

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data as string;
      resultName.value = result.file.name.replace(/\.[^/.]+$/, '') + '.ico';
      convertedUrl.value = '';
    }
  });

  const triggerUpload = () => {
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      triggerFileInput();
    }
  };

  const clearAll = () => {
    imageUrl.value = '';
    resultName.value = '';
    convertedUrl.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target?.result as string;
        resultName.value = file.name.replace(/\.[^/.]+$/, '') + '.ico';
        convertedUrl.value = '';
      };
      reader.readAsDataURL(file);
      target.value = '';
    }
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files) {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          imageUrl.value = e.target?.result as string;
          resultName.value = file.name.replace(/\.[^/.]+$/, '') + '.ico';
          convertedUrl.value = '';
        };
        reader.readAsDataURL(file);
      } else {
        ElMessage.warning('目标结构拒绝：仅支持位图格式图像');
      }
    }
  };

  const selectAll = () => {
    selectedSizes.value = [...availableSizes];
  };

  const generateIco = async () => {
    if (!imageUrl.value) return;

    const img = new Image();
    img.onload = async () => {
      try {
        const sortedSizes = [...selectedSizes.value].sort((a, b) => a - b);
        const blobs = await Promise.all(
          sortedSizes.map(size => {
            return new Promise<Blob>((resolve, reject) => {
              const canvas = document.createElement('canvas');
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext('2d');

              if (!ctx) return reject('Canvas error');

              const scale = Math.min(size / img.width, size / img.height);
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (size - w) / 2;
              const y = (size - h) / 2;

              ctx.drawImage(img, x, y, w, h);
              canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject('Blob error');
              }, 'image/png');
            });
          })
        );

        const entryCount = blobs.length;
        const headerLength = 6;
        const entryLength = 16;

        let totalSize = headerLength + entryCount * entryLength;
        const blobDatas = await Promise.all(
          blobs.map(async b => new Uint8Array(await b.arrayBuffer()))
        );
        blobDatas.forEach(data => (totalSize += data.length));

        const buffer = new Uint8Array(totalSize);
        const view = new DataView(buffer.buffer);

        view.setUint16(0, 0, true);
        view.setUint16(2, 1, true);
        view.setUint16(4, entryCount, true);

        let currentOffset = headerLength + entryCount * entryLength;

        for (let i = 0; i < entryCount; i++) {
          const size = sortedSizes[i];
          const data = blobDatas[i];
          const entryOffset = headerLength + i * entryLength;

          buffer[entryOffset] = size >= 256 ? 0 : size;
          buffer[entryOffset + 1] = size >= 256 ? 0 : size;
          buffer[entryOffset + 2] = 0;
          buffer[entryOffset + 3] = 0;
          view.setUint16(entryOffset + 4, 1, true);
          view.setUint16(entryOffset + 6, 32, true);
          view.setUint32(entryOffset + 8, data.length, true);
          view.setUint32(entryOffset + 12, currentOffset, true);

          buffer.set(data, currentOffset);
          currentOffset += data.length;
        }

        const finalBlob = new Blob([buffer], { type: 'image/x-icon' });
        convertedUrl.value = URL.createObjectURL(finalBlob);
        ElMessage.success('ICO 生成成功');
      } catch (err) {
        console.error(err);
        ElMessage.error('生成失败');
      }
    };
    img.src = imageUrl.value;
  };

  const downloadIco = () => {
    if (!convertedUrl.value) return;
    const a = document.createElement('a');
    a.href = convertedUrl.value;
    a.download = resultName.value;
    a.click();
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
    font-size: 1.25rem;
  }

  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }

  .brutal-btn.small-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #111;
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

  .brutal-btn.action-btn {
    background: #00e572;
    padding: 1.25rem;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-3 {
    margin-top: 1rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 450px 1fr;
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
    color: #fff;
  }
  .bg-cyan {
    background: #2dfdff;
  }
  .text-white {
    color: #fff;
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

  .pane-actions button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
    height: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #ffd900;
    border-style: solid;
  }

  .upload-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    margin: 0 0 0.5rem 0;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .preview-thumbnail {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    height: 300px;
    background: #eee;
    overflow: hidden;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 10px 10px;
    background-color: white;
  }

  .preview-thumbnail img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
  }
  .channel-group.group-pink {
    background: #fdfae5;
  }
  .channel-group.bg-cyan {
    background: #2dfdff;
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

  .size-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }

  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    border: 2px solid #111;
    padding: 0.5rem;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .brutal-checkbox-label:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #111;
    background: #fff;
    cursor: pointer;
    position: relative;
    margin: 0;
    flex-shrink: 0;
  }

  .brutal-checkbox:checked {
    background: #111;
  }

  .brutal-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 6px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .group-actions {
    display: flex;
    gap: 1rem;
  }

  .result-box {
    border: 4px solid #111;
    background: #fff;
    padding: 1rem;
    box-shadow: 6px 6px 0px #111;
  }

  .result-title {
    margin: 0 0 1rem 0;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .result-file-display {
    background: #ffd900;
    padding: 1rem;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .file-icon {
    font-size: 2rem;
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

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
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
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-upload-area {
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
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .preview-thumbnail {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #1a1a1a;
  }
  [data-theme='dark'] .channel-group.bg-cyan {
    background: #1a1a1a;
  }
  [data-theme='dark'] .group-pink h4 {
    color: #ff9ecf;
    text-shadow: 1px 1px 0px #eee;
  }

  [data-theme='dark'] .settings-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }

  [data-theme='dark'] .brutal-checkbox-label {
    background: #111;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-checkbox {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked {
    background: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked::after {
    border-color: #111;
  }

  [data-theme='dark'] .result-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .result-file-display {
    background: #222;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.action-btn:disabled {
    background: #333;
    color: #888;
    border-color: #888;
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
</style>
