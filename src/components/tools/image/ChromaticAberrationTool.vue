<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">色散效果模拟</h1>
        <span class="tool-subtitle">Chromatic Aberration</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="chromatic-aberration-tool">
        <div class="tool-layout">
          <div class="settings-panel glass">
            <h3 class="panel-title">参数设置</h3>

            <div
              class="upload-area"
              @click="triggerUpload"
              @drop.prevent="handleDrop"
              @dragover.prevent
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileChange"
              />
              <div v-if="!imageUrl" class="upload-placeholder">
                <el-icon :size="48"><UploadFilled /></el-icon>
                <p>点击或拖拽上传图片</p>
              </div>
              <div v-else class="preview-thumbnail">
                <img :src="imageUrl" alt="Preview" />
                <button class="change-btn" @click.stop="triggerUpload">更换图片</button>
              </div>
            </div>

            <div v-if="imageUrl" class="controls">
              <div class="channel-group red">
                <h4>🔴 红通道偏移 (Red)</h4>
                <div class="control-row">
                  <span>X:</span>
                  <el-slider v-model="redX" :min="-50" :max="50" size="small" />
                </div>
                <div class="control-row">
                  <span>Y:</span>
                  <el-slider v-model="redY" :min="-50" :max="50" size="small" />
                </div>
              </div>

              <div class="channel-group green">
                <h4>🟢 绿通道偏移 (Green)</h4>
                <div class="control-row">
                  <span>X:</span>
                  <el-slider v-model="greenX" :min="-50" :max="50" size="small" />
                </div>
                <div class="control-row">
                  <span>Y:</span>
                  <el-slider v-model="greenY" :min="-50" :max="50" size="small" />
                </div>
              </div>

              <div class="channel-group blue">
                <h4>🔵 蓝通道偏移 (Blue)</h4>
                <div class="control-row">
                  <span>X:</span>
                  <el-slider v-model="blueX" :min="-50" :max="50" size="small" />
                </div>
                <div class="control-row">
                  <span>Y:</span>
                  <el-slider v-model="blueY" :min="-50" :max="50" size="small" />
                </div>
              </div>

              <div class="options mt-4">
                <el-checkbox v-model="keepBounds">保持边缘 (不扩展)</el-checkbox>
              </div>

              <el-button
                type="primary"
                class="w-full mt-6"
                :loading="processing"
                @click="downloadImage"
              >
                <el-icon><Download /></el-icon>
                下载处理后图片
              </el-button>
            </div>
          </div>

          <div class="preview-panel glass">
            <h3 class="panel-title">效果预览</h3>
            <div class="canvas-container">
              <div v-if="!imageUrl" class="empty-state">
                <el-icon :size="64" color="#909399"><Picture /></el-icon>
                <p>请先上传图片</p>
              </div>
              <canvas v-show="imageUrl" ref="canvasRef"></canvas>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 色散效果模拟</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { UploadFilled, Download, Picture, ArrowLeft } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const fileInput = ref<HTMLInputElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const imageUrl = ref('');
  const imageObj = ref<HTMLImageElement | null>(null);
  const processing = ref(false);

  // Offsets
  const redX = ref(5);
  const redY = ref(0);
  const greenX = ref(0);
  const greenY = ref(0);
  const blueX = ref(-5);
  const blueY = ref(0);
  const keepBounds = ref(true);

  const triggerUpload = () => fileInput.value?.click();

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    const file = e.dataTransfer?.files[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      imageUrl.value = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        imageObj.value = img;
        applyEffect();
      };
      img.src = imageUrl.value;
    };
    reader.readAsDataURL(file);
  };

  const applyEffect = () => {
    if (!canvasRef.value || !imageObj.value) return;

    // Throttle heavy processing if needed, but for small previews it's fine.
    // For full size download, we re-process.

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObj.value;

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original to get data
    ctx.drawImage(img, 0, 0);

    const width = canvas.width;
    const height = canvas.height;

    // Get raw pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Create new buffer
    const newImageData = ctx.createImageData(width, height);
    const newData = newImageData.data;

    const rX = redX.value;
    const rY = redY.value;
    const gX = greenX.value;
    const gY = greenY.value;
    const bX = blueX.value;
    const bY = blueY.value;

    // Loop through pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;

        // Red source
        const srcRx = x - rX; // We want pixel at (x,y) to take value from (x-offset, y-offset) to simulate shift?
        // Actually: if we shift Red Channel by +10px (Right), then pixel at x=10 should display Red from x=0.
        // So srcX = x - offsetX.
        const srcRy = y - rY;

        // Green source
        const srcGx = x - gX;
        const srcGy = y - gY;

        // Blue source
        const srcBx = x - bX;
        const srcBy = y - bY;

        // Get R
        if (srcRx >= 0 && srcRx < width && srcRy >= 0 && srcRy < height) {
          const srcIndex = (srcRy * width + srcRx) * 4;
          newData[index] = data[srcIndex]; // R
        } else {
          newData[index] = 0; // Out of bounds
        }

        // Get G
        if (srcGx >= 0 && srcGx < width && srcGy >= 0 && srcGy < height) {
          const srcIndex = (srcGy * width + srcGx) * 4;
          newData[index + 1] = data[srcIndex + 1]; // G
        } else {
          newData[index + 1] = 0;
        }

        // Get B
        if (srcBx >= 0 && srcBx < width && srcBy >= 0 && srcBy < height) {
          const srcIndex = (srcBy * width + srcBx) * 4;
          newData[index + 2] = data[srcIndex + 2]; // B
        } else {
          newData[index + 2] = 0;
        }

        // Alpha
        if (keepBounds.value) {
          newData[index + 3] = data[index + 3]; // Original Alpha
        } else {
          // Simple merge: max alpha of sources? Or just 255?
          // Let's use max alpha to show ghosting
          let a = 0;
          if (srcRx >= 0 && srcRx < width && srcRy >= 0 && srcRy < height)
            a = Math.max(a, data[(srcRy * width + srcRx) * 4 + 3]);
          if (srcGx >= 0 && srcGx < width && srcGy >= 0 && srcGy < height)
            a = Math.max(a, data[(srcGy * width + srcGx) * 4 + 3]);
          if (srcBx >= 0 && srcBx < width && srcBy >= 0 && srcBy < height)
            a = Math.max(a, data[(srcBy * width + srcBx) * 4 + 3]);
          newData[index + 3] = a;
        }
      }
    }

    ctx.putImageData(newImageData, 0, 0);
  };

  const downloadImage = () => {
    if (!canvasRef.value) return;
    const link = document.createElement('a');
    link.download = 'chromatic-effect.png';
    link.href = canvasRef.value.toDataURL('image/png');
    link.click();
  };

  watch([redX, redY, greenX, greenY, blueX, blueY, keepBounds], () => {
    if (imageObj.value) {
      // Debounce slightly for performance if image is huge?
      // For now direct call.
      requestAnimationFrame(applyEffect);
    }
  });
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

  .header-left,
  .header-right {
    width: 140px;
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
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }

  .chromatic-aberration-tool {
    height: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 20px;
    height: 100%;
  }

  .settings-panel,
  .preview-panel {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .panel-title {
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: 600;
  }

  .upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    margin-bottom: 20px;
  }

  .upload-area:hover {
    border-color: var(--primary-color);
    background: var(--bg-tertiary);
  }

  .preview-thumbnail img {
    max-width: 100%;
    max-height: 150px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .channel-group {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    background: var(--bg-tertiary);
  }

  .channel-group h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .channel-group.red h4 {
    color: #f56c6c;
  }
  .channel-group.green h4 {
    color: #67c23a;
  }
  .channel-group.blue h4 {
    color: #409eff;
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }

  .control-row span {
    width: 20px;
    font-weight: bold;
  }

  .canvas-container {
    width: 100%;
    height: calc(100% - 60px);
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1a1a1a; /* Dark background for better effect visibility */
    border-radius: 8px;
    overflow: auto;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    gap: 10px;
  }

  @media (max-width: 768px) {
    .tool-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
  }
</style>
