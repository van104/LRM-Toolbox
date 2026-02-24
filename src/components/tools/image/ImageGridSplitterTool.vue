<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">九宫格切分<span>.刀锋()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!imageUrl || splitting" @click="clearAll">
            抛除预设
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧: Preview / Result -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>工作台.解算矩阵</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="triggerUpload">更替实体</button>
            </div>
          </div>

          <div class="control-panel-content">
            <input
              ref="fileInput"
              type="file"
              style="display: none"
              accept="image/*"
              @change="handleFileSelect"
            />

            <div
              v-if="!imageUrl"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-placeholder">
                <span class="upload-icon">✂️</span>
                <p>点击或拖拽投入大批量像素矩阵</p>
                <small>(支持高并发分块裂解引擎)</small>
              </div>
            </div>

            <div v-else class="preview-area">
              <div class="grid-overlay-container brutal-shadow">
                <img :src="imageUrl" alt="Preview" class="preview-img" />
                <div
                  class="grid-lines"
                  :style="{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`
                  }"
                >
                  <div v-for="i in Number(rows) * Number(cols)" :key="i" class="grid-cell">
                    <span class="cell-num">{{ i }}</span>
                  </div>
                </div>
              </div>

              <div v-if="splitFiles.length > 0" class="result-area mt-4">
                <div class="brutal-form-group channel-group bg-cyan">
                  <h4 class="text-white">分离阵列完成 ({{ splitFiles.length }}区块)</h4>
                  <div class="result-grid mt-1">
                    <div
                      v-for="(file, index) in splitFiles"
                      :key="index"
                      class="result-item brutal-shadow"
                    >
                      <img :src="file.url" alt="Piece" />
                    </div>
                  </div>
                  <button
                    class="brutal-btn brutal-btn-block mt-4 download-zip-btn"
                    @click="downloadAll"
                  >
                    ↓ 拔出 ZIP 压缩包
                  </button>
                </div>
              </div>
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4" style="margin-top: auto">
              <h4>🎯 技术备忘录</h4>
              <p style="font-size: 0.95rem; line-height: 1.5; font-weight: 500">
                九宫格分列操作会将位图强制物理切除，边缘可能会根据缩放丢失极小精度。<br />
                PNG格式强制保护原生Alpha透明度且无降级压缩；而 JPEG格式无法承载透明图层。
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧: Controls -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">裂解指标.面板</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group bg-pink">
              <label class="brutal-label">宏命令预设</label>
              <div class="preset-buttons mt-1">
                <button class="preset-btn" @click="setGrid(3, 3)">3x3 (社交阵列)</button>
                <button class="preset-btn" @click="setGrid(2, 2)">2x2 (四分流)</button>
                <button class="preset-btn" @click="setGrid(3, 1)">3x1 (长轴线段)</button>
              </div>
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">自定义网格解构</label>
              <div class="grid-inputs mt-1">
                <div class="input-col">
                  <label>纬线 (行)</label>
                  <input
                    v-model.number="rows"
                    type="number"
                    class="brutal-input"
                    min="1"
                    max="20"
                  />
                </div>
                <div class="input-col">
                  <label>经线 (列)</label>
                  <input
                    v-model.number="cols"
                    type="number"
                    class="brutal-input"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
            </div>

            <div class="brutal-form-group mt-4">
              <label class="brutal-label">封装协议</label>
              <select v-model="format" class="brutal-input">
                <option value="image/png">PNG [强硬保留透明态]</option>
                <option value="image/jpeg">JPEG [底层绝对压缩]</option>
              </select>
            </div>

            <button
              class="brutal-btn brutal-btn-block action-btn mt-4"
              :disabled="!imageUrl || splitting"
              @click="splitImage"
            >
              {{ splitting ? '矩阵解构中...' : '开始撕裂位图' }}
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
    <canvas ref="splitCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';

  import { useFileHandler } from '@/composables';
  import JSZip from 'jszip';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imageUrl = ref('');
  const rows = ref(3);
  const cols = ref(3);
  const format = ref('image/png');
  const splitting = ref(false);
  const splitFiles = ref<{ url: string; index: number }[]>([]);

  const splitCanvas = ref<HTMLCanvasElement | null>(null);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data as string;
      splitFiles.value = [];
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
    splitFiles.value = [];
    if (fileInput.value) fileInput.value.value = '';
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target?.result as string;
        splitFiles.value = [];
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
          splitFiles.value = [];
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const setGrid = (r: number, c: number) => {
    rows.value = r;
    cols.value = c;
    splitFiles.value = [];
  };

  const splitImage = () => {
    if (!imageUrl.value) return;

    splitting.value = true;
    splitFiles.value = [];

    const img = new Image();
    img.onload = () => {
      const canvas = splitCanvas.value;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const r = Number(rows.value);
      const c = Number(cols.value);

      const pieceWidth = img.width / c;
      const pieceHeight = img.height / r;

      canvas.width = pieceWidth;
      canvas.height = pieceHeight;

      const results = [];

      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          ctx.clearRect(0, 0, pieceWidth, pieceHeight);
          ctx.drawImage(
            img,
            x * pieceWidth,
            y * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          results.push({
            url: canvas.toDataURL(format.value, 0.9),
            index: y * c + x + 1
          });
        }
      }

      splitFiles.value = results;
      splitting.value = false;
    };
    img.src = imageUrl.value;
  };

  const downloadAll = async () => {
    if (splitFiles.value.length === 0) return;

    const zip = new JSZip();
    const ext = format.value === 'image/png' ? 'png' : 'jpg';

    splitFiles.value.forEach(file => {
      const base64Data = file.url.replace(/^data:image\/(png|jpeg);base64,/, '');
      zip.file(`piece_${file.index}.${ext}`, base64Data, { base64: true });
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `nexus_split_array_${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const statusClass = computed(() => {
    if (splitting.value) return 'warn';
    if (splitFiles.value.length > 0) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (splitting.value) return '警告: 正在进行物理刀锋切割运算，分离矩阵构架...';
    if (splitFiles.value.length > 0) return '引擎满载 : 细胞分裂完成，已拆降落区等待回收...';
    if (imageUrl.value) return '主炮准备就绪 : 参数调谐中，随时可以进行暴力拆卸';
    return '系统进入深眠态 : 等待核心位流投喂';
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
    font-size: 1.25rem;
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
  .brutal-btn.action-btn {
    background: #00e572;
    padding: 1.25rem;
    border-color: #111;
  }
  .brutal-btn.download-zip-btn {
    background: #ff4b4b;
    color: white;
    padding: 1rem;
  }

  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 450px;
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
    height: 400px;
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

  .preview-area {
    display: flex;
    flex-direction: column;
  }

  .grid-overlay-container {
    position: relative;
    max-width: 100%;
    margin: 0 auto;
    border: 4px solid #111;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 20px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .preview-img {
    display: block;
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    display: grid;
    pointer-events: none;
  }
  .grid-cell {
    border: 2px dashed #ff4b4b;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .cell-num {
    background: #ff4b4b;
    color: white;
    width: 32px;
    height: 32px;
    border: 2px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 900;
    font-family: 'IBM Plex Mono', monospace;
    box-shadow: 2px 2px 0px #111;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    background: #fff;
    padding: 0.5rem;
    border: 4px solid #111;
  }
  .result-item {
    border: 2px solid #111;
    display: flex;
    aspect-ratio: 1;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, white 0% 50%) 50% / 10px 10px;
  }
  .result-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .brutal-shadow {
    box-shadow: 8px 8px 0px #111;
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

  .brutal-label {
    display: block;
    margin-bottom: 0.75rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #111;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .preset-btn {
    background: #fff;
    border: 2px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Noto Sans SC', monospace;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: 0.1s;
  }
  .preset-btn:hover {
    background: #111;
    color: #fff;
  }

  .grid-inputs {
    display: flex;
    gap: 1rem;
  }
  .input-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-weight: 700;
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
  [data-theme='dark'] .brutal-status.info,
  [data-theme='dark'] .brutal-input {
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
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
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
  [data-theme='dark'] .brutal-btn.action-btn {
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
  [data-theme='dark'] .preset-btn {
    background: #333;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .preset-btn:hover {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .grid-overlay-container,
  [data-theme='dark'] .result-grid,
  [data-theme='dark'] .result-item {
    border-color: #eee;
  }
  [data-theme='dark'] .result-grid {
    background: #333;
  }
  [data-theme='dark'] .grid-cell {
    border-color: #ff4b4b;
  }
  [data-theme='dark'] .cell-num {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 8px 8px 0px #eee;
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
  [data-theme='dark'] .bg-pink {
    background: #993366;
    color: #fff;
  }
</style>
