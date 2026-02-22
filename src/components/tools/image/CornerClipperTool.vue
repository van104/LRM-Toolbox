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
        <h1 class="tool-title">图片圆角裁切</h1>
        <span class="tool-subtitle">Image Corner Clipper</span>
      </div>
      <div class="header-right">
        <!-- 占位，保持布局平衡 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="corner-clipper-tool">
        <div class="tool-layout">
          <div class="settings-panel glass">
            <h3 class="panel-title">设置</h3>

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
              <div class="control-group">
                <label>圆角半径 ({{ borderRadius }}px)</label>
                <el-slider v-model="borderRadius" :min="0" :max="maxRadius" />
              </div>

              <div class="control-group">
                <div class="flex justify-between items-center mb-2">
                  <label>边框宽度</label>
                  <el-switch v-model="enableBorder" />
                </div>
                <template v-if="enableBorder">
                  <el-slider v-model="borderWidth" :min="0" :max="50" />
                  <div class="color-picker-row">
                    <span>边框颜色</span>
                    <el-color-picker v-model="borderColor" show-alpha />
                  </div>
                </template>
              </div>

              <div class="control-group">
                <div class="flex justify-between items-center mb-2">
                  <label>阴影效果</label>
                  <el-switch v-model="enableShadow" />
                </div>
                <template v-if="enableShadow">
                  <div class="shadow-controls">
                    <div class="control-item">
                      <span>模糊</span>
                      <el-slider v-model="shadowBlur" :min="0" :max="100" size="small" />
                    </div>
                    <div class="control-item">
                      <span>扩散</span>
                      <el-slider v-model="shadowSpread" :min="-20" :max="50" size="small" />
                    </div>
                    <div class="control-item">
                      <span>X 偏移</span>
                      <el-slider v-model="shadowX" :min="-50" :max="50" size="small" />
                    </div>
                    <div class="control-item">
                      <span>Y 偏移</span>
                      <el-slider v-model="shadowY" :min="-50" :max="50" size="small" />
                    </div>
                    <div class="color-picker-row">
                      <span>阴影颜色</span>
                      <el-color-picker v-model="shadowColor" show-alpha />
                    </div>
                  </div>
                </template>
              </div>

              <el-button type="primary" class="w-full mt-4" @click="downloadImage">
                <el-icon><Download /></el-icon>
                下载图片
              </el-button>
            </div>
          </div>

          <div class="preview-panel glass">
            <h3 class="panel-title">实时预览</h3>
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
    <footer class="footer">© 2026 LRM工具箱 - 图片圆角裁切</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { UploadFilled, Download, Picture, ArrowLeft } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const fileInput = ref<HTMLInputElement | null>(null);
  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const imageUrl = ref('');
  const imageObj = ref<HTMLImageElement | null>(null);

  // Settings
  const borderRadius = ref(20);
  const maxRadius = ref(200);

  const enableBorder = ref(false);
  const borderWidth = ref(0);
  const borderColor = ref('#000000');

  const enableShadow = ref(false);
  const shadowBlur = ref(20);
  const shadowSpread = ref(0);
  const shadowX = ref(0);
  const shadowY = ref(10);
  const shadowColor = ref('rgba(0, 0, 0, 0.3)');

  const triggerUpload = () => {
    fileInput.value?.click();
  };

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
        maxRadius.value = Math.min(img.width, img.height) / 2;
        drawCanvas();
      };
      img.src = imageUrl.value;
    };
    reader.readAsDataURL(file);
  };

  const drawCanvas = () => {
    if (!canvasRef.value || !imageObj.value) return;

    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObj.value;

    // Calculate padding needed for shadow and border
    const shadowPadding = enableShadow.value
      ? Math.max(
          Math.abs(shadowX.value) + shadowBlur.value + Math.abs(shadowSpread.value),
          Math.abs(shadowY.value) + shadowBlur.value + Math.abs(shadowSpread.value)
        ) + 20
      : 0;
    const borderPadding = enableBorder.value ? borderWidth.value : 0;
    const totalPadding = Math.max(shadowPadding, borderPadding);

    // Set canvas size
    canvas.width = img.width + totalPadding * 2;
    canvas.height = img.height + totalPadding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate image position (centered)
    const x = totalPadding;
    const y = totalPadding;
    const w = img.width;
    const h = img.height;
    const r = Math.min(borderRadius.value, w / 2, h / 2);

    ctx.save();

    // Draw Shadow
    if (enableShadow.value) {
      ctx.shadowColor = shadowColor.value;
      ctx.shadowBlur = shadowBlur.value;
      ctx.shadowOffsetX = shadowX.value;
      ctx.shadowOffsetY = shadowY.value;

      // Draw a shape for shadow
      // We draw a filled rect with rounded corners to cast shadow
      // Note: shadowSpread is simulated by increasing rect size, but native shadow doesn't support spread directly easily in 2d context for shapes
      // Standard approach: draw shape, let shadow cast.
      // For spread, we can just adjust the rect size slightly if needed, but standard CSS box-shadow spread is complex in canvas.
      // Here we ignore spread for simplicity or treat it as extra padding?
      // Let's just use standard shadow.

      // To make shadow visible behind the image, we draw the shape first
      ctx.fillStyle = 'white'; // Color doesn't matter much if covered, but white is safe
      roundRect(ctx, x, y, w, h, r);
      ctx.fill();
    }

    // Reset shadow for image clipping
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Clip for image
    ctx.beginPath();
    roundRect(ctx, x, y, w, h, r);
    ctx.clip();

    // Draw Image
    ctx.drawImage(img, x, y, w, h);

    ctx.restore();

    // Draw Border (Stroke)
    if (enableBorder.value && borderWidth.value > 0) {
      ctx.save();
      ctx.beginPath();
      // Stroke is centered on path, so we might need to adjust path if we want inner/outer stroke
      // Standard is centered. To keep image inside, we might stroke inside?
      // Let's just draw on top.
      roundRect(ctx, x, y, w, h, r);
      ctx.lineWidth = borderWidth.value;
      ctx.strokeStyle = borderColor.value;
      ctx.stroke();
      ctx.restore();
    }
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const downloadImage = () => {
    if (!canvasRef.value) return;
    const link = document.createElement('a');
    link.download = 'clipped-image.png';
    link.href = canvasRef.value.toDataURL('image/png');
    link.click();
  };

  watch(
    [
      borderRadius,
      enableBorder,
      borderWidth,
      borderColor,
      enableShadow,
      shadowBlur,
      shadowX,
      shadowY,
      shadowColor,
      shadowSpread
    ],
    () => {
      drawCanvas();
    }
  );

  onMounted(() => {
    // Init
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

  .corner-clipper-tool {
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

  .control-group {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
  }

  .control-group:last-child {
    border-bottom: none;
  }

  .control-group label {
    display: block;
    margin-bottom: 10px;
    font-weight: 500;
  }

  .color-picker-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .canvas-container {
    width: 100%;
    height: calc(100% - 60px);
    display: flex;
    justify-content: center;
    align-items: center;
    background: repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    border-radius: 8px;
    overflow: auto;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--text-secondary);
    gap: 10px;
  }

  .shadow-controls {
    padding-left: 10px;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }

  .control-item span {
    width: 50px;
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .tool-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
  }
</style>
