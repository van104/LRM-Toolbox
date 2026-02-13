<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">图片九宫格切图</h1>
        <span class="tool-subtitle">Image Grid Splitter</span>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :disabled="!imageUrl || splitting"
          :loading="splitting"
          @click="splitImage"
        >
          开始切图
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
            <el-icon class="upload-icon"><Grid /></el-icon>
            <h3>上传大图</h3>
            <p>支持 JPG, PNG, WebP 格式</p>
          </div>

          <div v-else class="preview-area">
            <div class="grid-overlay-container">
              <img :src="imageUrl" alt="Preview" class="preview-img" />
              <div
                class="grid-lines"
                :style="{
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`
                }"
              >
                <div v-for="i in rows * cols" :key="i" class="grid-cell">
                  <span class="cell-num">{{ i }}</span>
                </div>
              </div>
            </div>
            <div class="actions">
              <el-button @click="triggerFileInput">更换图片</el-button>
            </div>
          </div>
        </div>

        <div class="sidebar glass-card">
          <h3>网格设置</h3>
          <div class="settings-form">
            <div class="form-item">
              <label>预设模式</label>
              <div class="preset-buttons">
                <el-button size="small" @click="setGrid(3, 3)">3x3 (九宫格)</el-button>
                <el-button size="small" @click="setGrid(2, 2)">2x2 (四宫格)</el-button>
                <el-button size="small" @click="setGrid(3, 1)">3x1 (长图三段)</el-button>
              </div>
            </div>

            <div class="form-item">
              <label>自定义行列</label>
              <div class="input-row">
                <div class="sub-item">
                  <span>行</span>
                  <el-input-number v-model="rows" :min="1" :max="10" />
                </div>
                <div class="sub-item">
                  <span>列</span>
                  <el-input-number v-model="cols" :min="1" :max="10" />
                </div>
              </div>
            </div>

            <div class="form-item">
              <label>输出格式</label>
              <el-radio-group v-model="format">
                <el-radio label="image/png">PNG</el-radio>
                <el-radio label="image/jpeg">JPG</el-radio>
              </el-radio-group>
            </div>

            <el-divider />

            <div v-if="splitFiles.length > 0" class="result-area">
              <h4>切图结果 ({{ splitFiles.length }} 张)</h4>
              <div class="result-grid">
                <div v-for="(file, index) in splitFiles" :key="index" class="result-item">
                  <img :src="file.url" alt="Piece" />
                </div>
              </div>
              <el-button type="success" class="download-btn" @click="downloadAll">
                打包下载 (ZIP)
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>使用技巧</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>社交媒体</b>：九宫格（3x3）是朋友圈、小红书最常用的创意发布形式。</li>
            <li><b>透明度</b>：如果原图是透明 PNG，请选择 PNG 输出格式以保持透明背景。</li>
            <li><b>保存方式</b>：点击“打包下载”将获得一个包含所有切片的压缩包，按序号排列。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 图片九宫格切图</footer>

    <canvas ref="splitCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, Grid } from '@element-plus/icons-vue';
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
  const splitFiles = ref([]);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data;
      splitFiles.value = [];
    }
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target.result;
        splitFiles.value = [];
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
        splitFiles.value = [];
      };
      reader.readAsDataURL(file);
    }
  };

  const setGrid = (r, c) => {
    rows.value = r;
    cols.value = c;
  };

  const splitCanvas = ref(null);

  const splitImage = () => {
    if (!imageUrl.value) return;

    splitting.value = true;
    splitFiles.value = [];

    const img = new Image();
    img.onload = () => {
      const canvas = splitCanvas.value;
      const ctx = canvas.getContext('2d');

      const pieceWidth = img.width / cols.value;
      const pieceHeight = img.height / rows.value;

      canvas.width = pieceWidth;
      canvas.height = pieceHeight;

      const results = [];

      for (let r = 0; r < rows.value; r++) {
        for (let c = 0; c < cols.value; c++) {
          ctx.clearRect(0, 0, pieceWidth, pieceHeight);
          ctx.drawImage(
            img,
            c * pieceWidth,
            r * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          results.push({
            url: canvas.toDataURL(format.value, 0.9),
            index: r * cols.value + c + 1
          });
        }
      }

      splitFiles.value = results;
      splitting.value = false;
      ElMessage.success('切图完成');
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
    link.download = `grid_split_images.zip`;
    link.click();
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
    min-height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .upload-area {
    width: 100%;
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

  .preview-area {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .grid-overlay-container {
    position: relative;
    max-width: 100%;
    max-height: 600px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .preview-img {
    display: block;
    max-width: 100%;
    max-height: 600px;
  }

  .grid-lines {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    pointer-events: none;
  }

  .grid-cell {
    border: 1px dashed rgba(255, 255, 255, 0.8);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cell-num {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .sidebar h3 {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
  }

  .settings-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #475569;
    font-weight: 600;
  }

  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .input-row {
    display: flex;
    gap: 1rem;
  }

  .sub-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
    color: #64748b;
  }

  .result-area {
    margin-top: 1rem;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin-bottom: 1rem;
    background: #f1f5f9;
    padding: 4px;
    border-radius: 4px;
  }

  .result-item img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    display: block;
  }

  .download-btn {
    width: 100%;
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
