<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack"
          ><el-icon> <ArrowLeft /> </el-icon><span>返回</span></el-button
        >
      </div>
      <div class="header-center">
        <h1 class="tool-title">图片主题色提取</h1>
        <span class="tool-subtitle">Image Color Palette</span>
      </div>
      <div class="header-right"></div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <input ref="fileRef" type="file" hidden accept="image/*" @change="handleUpload" />
        <div class="main-section glass-card">
          <div
            v-if="!imageUrl"
            class="upload-area"
            @click="triggerUpload"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <el-icon class="upload-icon">
              <UploadFilled />
            </el-icon>
            <h3>点击或拖拽上传图片</h3>
            <p>支持 JPG, PNG, WebP 格式</p>
          </div>

          <div v-else class="preview-area">
            <div class="image-wrapper">
              <img
                ref="imgRef"
                :src="imageUrl"
                alt="Original"
                crossorigin="anonymous"
                @load="extractColors"
              />
            </div>
            <div class="actions">
              <el-button @click="triggerUpload">更换图片</el-button>
              <el-button type="primary" @click="extractColors">重新提取</el-button>
            </div>
          </div>
        </div>

        <div v-if="imageUrl" class="palette-section glass-card">
          <h3>提取结果</h3>

          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>正在提取颜色...</span>
          </div>

          <div v-else class="palette-grid">
            <div
              v-for="(color, index) in palette"
              :key="index"
              class="color-card"
              :style="{ backgroundColor: `rgb(${color.join(',')})` }"
              @click="copyColor(color)"
            >
              <div class="color-info" :class="{ 'light-text': isDark(color) }">
                <span class="hex">{{ rgbToHex(color) }}</span>
                <span class="rgb">RGB({{ color.join(', ') }})</span>
              </div>
              <div class="copy-hint">点击复制</div>
            </div>
          </div>

          <div v-if="!loading && palette.length > 0" class="palette-actions">
            <el-button @click="downloadPalette">下载色板信息 (JSON)</el-button>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <h4>工作原理</h4>
        <p>
          工具使用 ColorThief 算法分析图片像素，提取出最具代表性的 8
          种主色调。这些颜色可用于设计配色参考、UI 主题生成等场景。
        </p>
      </div>
    </main>

    <component
      :is="'script'"
      src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.min.js"
    >
    </component>

    <footer class="footer">© 2026 LRM工具箱 - 图片主题色提取</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, UploadFilled, Loading } from '@element-plus/icons-vue';

  const router = useRouter();
  const goBack = () => router.back();
  const fileRef = ref(null);
  const imgRef = ref(null);
  const imageUrl = ref('');
  const palette = ref([]);
  const loading = ref(false);

  const triggerUpload = () => fileRef.value?.click();

  const handleDrop = e => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processFile(file);
  };

  const handleUpload = e => {
    const file = e.target.files[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const processFile = file => {
    const reader = new FileReader();
    reader.onload = e => {
      imageUrl.value = e.target.result;
      palette.value = [];
    };
    reader.readAsDataURL(file);
  };

  const extractColors = () => {
    if (!imgRef.value || !window.ColorThief) return;

    if (!imgRef.value.complete) return;

    loading.value = true;
    try {
      const colorThief = new window.ColorThief();

      const result = colorThief.getPalette(imgRef.value, 8);
      palette.value = result;
    } catch (error) {
      console.error('Color extraction failed:', error);
      ElMessage.warning('颜色提取失败，请尝试其他图片');
    } finally {
      loading.value = false;
    }
  };

  const rgbToHex = rgb => {
    return (
      '#' +
      rgb
        .map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
  };

  const isDark = rgb => {
    const yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return yiq < 128;
  };

  const copyColor = rgb => {
    const hex = rgbToHex(rgb);
    navigator.clipboard.writeText(hex);
    ElMessage.success(`已复制 ${hex}`);
  };

  const downloadPalette = () => {
    const data = palette.value.map(rgb => ({
      rgb: `rgb(${rgb.join(', ')})`,
      hex: rgbToHex(rgb)
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  onMounted(() => {
    if (!window.ColorThief) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.0/color-thief.min.js';
      script.onload = () => {
        if (imageUrl.value) extractColors();
      };
      document.head.appendChild(script);
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
    grid-template-columns: 350px 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .upload-area {
    height: 400px;
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

  .upload-area h3 {
    margin: 0 0 0.5rem;
    color: #1e293b;
  }

  .upload-area p {
    margin: 0;
    color: #64748b;
  }

  .preview-area {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .image-wrapper {
    width: 100%;
    height: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  }

  .image-wrapper img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .palette-section {
    padding: 1.5rem;
    min-height: 400px;
  }

  .palette-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
    color: #1e293b;
  }

  .palette-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .color-card {
    aspect-ratio: 1;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
  }

  .color-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }

  .color-info {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    padding: 0.75rem;
    color: #fff;
    font-family: 'Consolas', monospace;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .color-info.light-text {
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
  }

  .hex {
    font-weight: 700;
    font-size: 1rem;
  }

  .rgb {
    font-size: 0.75rem;
    opacity: 0.9;
  }

  .copy-hint {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    font-weight: 600;
  }

  .color-card:hover .copy-hint {
    opacity: 1;
  }

  .loading-state {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: #64748b;
  }

  .loading-state .is-loading {
    font-size: 2rem;
    animation: rotate 1s linear infinite;
  }

  .palette-actions {
    margin-top: 2rem;
    display: flex;
    justify-content: flex-end;
  }

  .tips-section {
    padding: 1.5rem;
  }

  .tips-section h4 {
    margin: 0 0 0.5rem;
    font-size: 0.95rem;
    color: #475569;
  }

  .tips-section p {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.6;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .layout-container {
      grid-template-columns: 1fr;
    }

    .upload-area {
      height: 250px;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
