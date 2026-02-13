<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">证件照制作</h1>
        <span class="tool-subtitle">ID Photo Maker</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :disabled="!imageUrl" @click="downloadPhoto">
          保存照片
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileSelect" />
          <div
            v-if="!imageUrl"
            class="upload-area"
            :class="{ 'is-dragover': isDragOver }"
            @click="triggerFileInput"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleFileDrop"
          >
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <h3>上传人像照片</h3>
            <p>请上传背景简单、光线均匀的正面半身照</p>
          </div>

          <div v-else class="editor-area">
            <div class="canvas-container">
              <div
                class="photo-preview-box"
                :style="{
                  width: previewWidth + 'px',
                  height: previewHeight + 'px',
                  backgroundColor: bgColor
                }"
              >
                <div
                  class="image-dragger"
                  :style="{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }"
                  @mousedown="startDrag"
                  @wheel.prevent="handleZoom"
                >
                  <img :src="imageUrl" alt="User" draggable="false" />
                </div>
                <!-- 辅助线 -->
                <div class="guides">
                  <div class="guide-h" style="top: 30%"></div>
                  <div class="guide-v" style="left: 50%"></div>
                </div>
              </div>
            </div>

            <div class="editor-tips">
              <p>
                <el-icon><InfoFilled /></el-icon> 鼠标滚轮缩放，左键拖动调整位置
              </p>
            </div>
          </div>
        </div>

        <div class="sidebar glass-card">
          <div class="setting-item">
            <label>常用尺寸</label>
            <el-select v-model="selectedSizeKey" @change="updateSize">
              <el-option v-for="(s, k) in sizes" :key="k" :label="s.name" :value="k" />
            </el-select>
            <div v-if="currentSize" class="size-info">
              规格: {{ currentSize.w_mm }}x{{ currentSize.h_mm }} mm ({{ currentSize.w_px }}x{{
                currentSize.h_px
              }}
              px)
            </div>
          </div>

          <el-divider />

          <div class="setting-item">
            <label>背景颜色</label>
            <div class="color-presets">
              <div
                v-for="color in bgColors"
                :key="color.value"
                class="color-circle"
                :style="{ backgroundColor: color.value }"
                :class="{ active: bgColor === color.value }"
                :title="color.label"
                @click="bgColor = color.value"
              ></div>
              <el-color-picker v-model="bgColor" size="small" />
            </div>
          </div>

          <el-divider />

          <div class="setting-item">
            <label>缩放调整</label>
            <el-slider v-model="zoom" :min="0.1" :max="3" :step="0.01" />
          </div>

          <div class="sidebar-actions">
            <el-button @click="resetTransform">重置位置</el-button>
            <el-button @click="triggerFileInput">更换照片</el-button>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>制作小技巧</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>拍摄建议</b>：正对镜头，头部正直，两肩平齐，表情自然，避免大面积阴影。</li>
            <li>
              <b>关于抠图</b>：本工具目前提供基础的手动位移和缩放，建议先使用<a
                href="/tools/bg-remover"
                @click.prevent="router.push('/tools/bg-remover')"
                >“AI 去背景”</a
              >获取透明 PNG，效果更佳。
            </li>
            <li><b>打印规格</b>：导出的图片符合 300DPI 打印要求。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 证件照制作</footer>

    <!-- 隐藏的 Canvas 用于导出 -->
    <canvas ref="exportCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, UploadFilled, InfoFilled } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imageUrl = ref('');
  const bgColor = ref('#FFFFFF');
  const zoom = ref(1);
  const dragOffset = ref({ x: 0, y: 0 });
  const isDragging = ref(false);
  const startPos = ref({ x: 0, y: 0 });

  const sizes = {
    '1inch': { name: '一寸 (25*35mm)', w_mm: 25, h_mm: 35, w_px: 295, h_px: 413 },
    '2inch': { name: '二寸 (35*49mm)', w_mm: 35, h_mm: 49, w_px: 413, h_px: 579 },
    small1: { name: '小一寸 (22*32mm)', w_mm: 22, h_mm: 32, w_px: 260, h_px: 378 },
    large1: { name: '大一寸 (33*48mm)', w_mm: 33, h_mm: 48, w_px: 390, h_px: 567 },
    passport: { name: '护照 (33*48mm)', w_mm: 33, h_mm: 48, w_px: 390, h_px: 567 },
    visa_us: { name: '美国签证 (51*51mm)', w_mm: 51, h_mm: 51, w_px: 600, h_px: 600 }
  };

  const bgColors = [
    { label: '白色', value: '#FFFFFF' },
    { label: '红色', value: '#FF0000' },
    { label: '蓝色', value: '#00BFFF' },
    { label: '灰色', value: '#CCCCCC' }
  ];

  const selectedSizeKey = ref('1inch');
  const currentSize = computed(() => sizes[selectedSizeKey.value]);

  const previewScale = 8; // 预览缩放比例
  const previewWidth = computed(() => currentSize.value.w_mm * previewScale);
  const previewHeight = computed(() => currentSize.value.h_mm * previewScale);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data;
      resetTransform();
    }
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target.result;
        resetTransform();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = event => {
    dragLeave();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target.result;
        resetTransform();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetTransform = () => {
    zoom.value = 0.5;
    dragOffset.value = { x: 0, y: 0 };
  };

  const startDrag = e => {
    isDragging.value = true;
    startPos.value = { x: e.clientX - dragOffset.value.x, y: e.clientY - dragOffset.value.y };

    const handleMouseMove = me => {
      if (!isDragging.value) return;
      dragOffset.value = {
        x: me.clientX - startPos.value.x,
        y: me.clientY - startPos.value.y
      };
    };

    const handleMouseUp = () => {
      isDragging.value = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleZoom = e => {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    zoom.value = Math.max(0.1, Math.min(3, zoom.value + delta));
  };

  const exportCanvas = ref(null);
  const downloadPhoto = () => {
    if (!imageUrl.value) return;

    const canvas = exportCanvas.value;
    const ctx = canvas.getContext('2d');
    const size = currentSize.value;

    canvas.width = size.w_px;
    canvas.height = size.h_px;

    // 绘制背景
    ctx.fillStyle = bgColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      // 计算在导出画布上的缩放和偏移
      const drawZoom = zoom.value * (size.w_px / previewWidth.value);
      const drawX = dragOffset.value.x * (size.w_px / previewWidth.value);
      const drawY = dragOffset.value.y * (size.w_px / previewWidth.value);

      ctx.save();
      ctx.translate(drawX + canvas.width / 2, drawY + canvas.height / 2);
      ctx.scale(drawZoom, drawZoom);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `id_photo_${selectedSizeKey.value}.jpg`;
      link.click();
      ElMessage.success('已导出证件照');
    };
    img.src = imageUrl.value;
  };
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
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .main-section {
    padding: 1.5rem;
    min-height: 600px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .upload-area {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    padding: 2rem;
    text-align: center;
  }

  .upload-area:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .upload-icon {
    font-size: 4rem;
    color: #3b82f6;
    margin-bottom: 1rem;
  }

  .editor-area {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .canvas-container {
    background: #cbd5e1;
    padding: 40px;
    border-radius: 8px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
  }

  .photo-preview-box {
    position: relative;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    border: 4px solid #fff;
  }

  .image-dragger {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-dragger img {
    user-select: none;
    pointer-events: none;
  }

  .guides {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .guide-h {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1px dashed rgba(255, 255, 255, 0.5);
  }

  .guide-v {
    position: absolute;
    top: 0;
    bottom: 0;
    border-left: 1px dashed rgba(255, 255, 255, 0.5);
  }

  .editor-tips {
    color: #64748b;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .setting-item {
    margin-bottom: 1.5rem;
  }

  .setting-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #475569;
    font-weight: 600;
  }

  .size-info {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .color-presets {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .color-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  }

  .color-circle:hover {
    transform: scale(1.1);
  }

  .color-circle.active {
    border-color: #3b82f6;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  }

  .sidebar-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .tips-section {
    padding: 1.5rem 2rem;
    background: linear-gradient(to bottom right, #ffffff, #f8fafc);
    border: 1px solid rgba(59, 130, 246, 0.1);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .tips-header h4 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .tips-content p {
    color: #475569;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
  }

  .premium-list {
    padding-left: 1.25rem;
    margin: 0.5rem 0 0;
  }

  .premium-list li {
    margin-bottom: 0.75rem;
    color: #475569;
    font-size: 0.9rem;
    position: relative;
    list-style-type: none;
  }

  .premium-list li::before {
    content: '•';
    color: #3b82f6;
    font-weight: bold;
    display: inline-block;
    width: 1em;
    margin-left: -1em;
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

  @media (max-width: 992px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }
</style>
