<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">ICO 图标转换器</h1>
        <span class="tool-subtitle">ICO Converter</span>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :disabled="!imageUrl || selectedSizes.length === 0"
          @click="generateIco"
        >
          生成 ICO
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
            <h3>点击或拖拽上传图片</h3>
            <p>支持 JPG, PNG, WebP（推荐正方形图片）</p>
          </div>

          <div v-else class="preview-area">
            <div class="image-wrapper">
              <img :src="imageUrl" alt="Preview" />
            </div>
            <div class="actions">
              <el-button @click="triggerFileInput">更换图片</el-button>
            </div>
          </div>
        </div>

        <div class="sidebar glass-card">
          <h3>选项设置</h3>
          <div class="settings-group">
            <label class="group-label">选择包含的尺寸</label>
            <el-checkbox-group v-model="selectedSizes" class="size-grid">
              <el-checkbox v-for="size in availableSizes" :key="size" :label="size">
                {{ size }}x{{ size }}
              </el-checkbox>
            </el-checkbox-group>
            <div class="group-actions">
              <el-button size="small" @click="selectAll">全选</el-button>
              <el-button size="small" @click="selectedSizes = [32]">仅 32px</el-button>
            </div>
          </div>

          <el-divider />

          <div v-if="convertedUrl" class="result-section">
            <h4>保存结果</h4>
            <div class="result-box">
              <el-icon class="ico-icon"><Picture /></el-icon>
              <span>{{ resultName }}</span>
            </div>
            <el-button type="success" class="download-btn" @click="downloadIco">
              下载 ICO 文件
            </el-button>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>工具说明</h4>
        </div>
        <div class="tips-content">
          <p>ICO 是 Windows 的图标格式，能够在一个文件中包含多个不同尺寸的图像。</p>
          <ul class="premium-list">
            <li>多尺寸支持：可一次勾选多个尺寸，生成的 ICO 将包含所有选中的规格。</li>
            <li>透明度：保持原图的透明通道（推荐使用透明背景的 PNG）。</li>
            <li>兼容性：生成的图标可用于网站 Favicon、桌面软件或文件夹图标。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - ICO 转换器</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, UploadFilled, Picture } from '@element-plus/icons-vue';
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

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data;
      resultName.value = result.file.name.replace(/\.[^/.]+$/, '') + '.ico';
      convertedUrl.value = '';
    }
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target.result;
        resultName.value = file.name.replace(/\.[^/.]+$/, '') + '.ico';
        convertedUrl.value = '';
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
        resultName.value = file.name.replace(/\.[^/.]+$/, '') + '.ico';
        convertedUrl.value = '';
      };
      reader.readAsDataURL(file);
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
        const blobs = await Promise.all(
          selectedSizes.value
            .sort((a, b) => a - b)
            .map(size => {
              return new Promise(resolve => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                // 保持比例缩放并居中
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (size - w) / 2;
                const y = (size - h) / 2;

                ctx.drawImage(img, x, y, w, h);
                canvas.toBlob(blob => resolve(blob), 'image/png');
              });
            })
        );

        // 组装 ICO 格式
        // ICO Header: Reserved(2), Type(2), Count(2)
        // ICO Entry: Width(1), Height(1), Colors(1), Reserved(1), Planes(2), Bits(2), Size(4), Offset(4)

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

        // Header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // Type (1 for ICO)
        view.setUint16(4, entryCount, true); // Count

        let currentOffset = headerLength + entryCount * entryLength;

        for (let i = 0; i < entryCount; i++) {
          const size = selectedSizes.value[i];
          const data = blobDatas[i];
          const entryOffset = headerLength + i * entryLength;

          // Entry
          buffer[entryOffset] = size >= 256 ? 0 : size; // Width
          buffer[entryOffset + 1] = size >= 256 ? 0 : size; // Height
          buffer[entryOffset + 2] = 0; // Colors
          buffer[entryOffset + 3] = 0; // Reserved
          view.setUint16(entryOffset + 4, 1, true); // Planes
          view.setUint16(entryOffset + 6, 32, true); // BPP
          view.setUint32(entryOffset + 8, data.length, true); // Size
          view.setUint32(entryOffset + 12, currentOffset, true); // Offset

          // Data
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
    grid-template-columns: 1fr 350px;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .main-section {
    padding: 1.5rem;
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .upload-area {
    flex: 1;
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .image-wrapper {
    width: 100%;
    max-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    background-image:
      linear-gradient(45deg, #eee 25%, transparent 25%),
      linear-gradient(-45deg, #eee 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #eee 75%),
      linear-gradient(-45deg, transparent 75%, #eee 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .image-wrapper img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .sidebar {
    padding: 1.5rem;
  }

  .sidebar h3 {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .group-label {
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 500;
  }

  .size-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .group-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .result-section {
    margin-top: 1rem;
  }

  .result-section h4 {
    margin: 0 0 1rem;
    font-size: 0.95rem;
  }

  .result-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f0fdf4;
    border: 1px solid #bcf0da;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .ico-icon {
    font-size: 1.5rem;
    color: #10b981;
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
    margin: 1rem 0 0;
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
