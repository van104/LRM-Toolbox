<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">图片 EXIF 查看/移除</h1>
        <span class="tool-subtitle">EXIF Viewer & Remover</span>
      </div>
      <div class="header-right">
        <el-button v-if="exifData" type="danger" @click="removeExif"> 擦除隐私信息 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <input
            ref="fileInput"
            type="file"
            hidden
            accept="image/jpeg,image/tiff"
            @change="handleFileSelect"
          />
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
            <p>目前仅支持 JPG / JPEG / TIFF 格式（含 EXIF 信息）</p>
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

        <div class="info-section glass-card">
          <h3>EXIF 元数据</h3>
          <div v-if="loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>正在解析数据...</span>
          </div>
          <div v-else-if="exifData" class="exif-list">
            <div v-for="(value, key) in exifData" :key="key" class="exif-item">
              <span class="exif-key">{{ key }}</span>
              <span class="exif-value">{{ value }}</span>
            </div>
          </div>
          <div v-else-if="imageUrl" class="empty-info">
            <el-icon><InfoFilled /></el-icon>
            <p>未在该图片中找到 EXIF 信息</p>
          </div>
          <div v-else class="empty-info">
            <p>预览图片以查看 EXIF 信息</p>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>工具说明</h4>
        </div>
        <div class="tips-content">
          <p>EXIF 信息包含了图片的拍摄器材、时间、地理位置 (GPS) 等隐私数据。本工具可以帮助您：</p>
          <ul class="premium-list">
            <li>查看图片的完整拍摄参数（如光圈、快门、感光度等）。</li>
            <li>清除隐私信息：通过重新编码图片，剥离所有 EXIF 元数据，保护您的隐私。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - EXIF 查看/移除</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, UploadFilled, Loading, InfoFilled } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const imageUrl = ref('');
  const exifData = ref(null);
  const loading = ref(false);

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/jpeg,image/tiff',
    readMode: 'dataURL',
    onSuccess: result => {
      imageUrl.value = result.data;
      readExif(result.file);
    }
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target.result;
        readExif(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDrop = event => {
    dragLeave();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/tiff')) {
      const reader = new FileReader();
      reader.onload = e => {
        imageUrl.value = e.target.result;
        readExif(file);
      };
      reader.readAsDataURL(file);
    } else {
      ElMessage.warning('仅支持 JPG/TIFF 格式');
    }
  };

  const readExif = file => {
    if (!window.EXIF) return;

    loading.value = true;
    exifData.value = null;

    window.EXIF.getData(file, function () {
      const allMetaData = window.EXIF.getAllTags(this);
      if (Object.keys(allMetaData).length > 0) {
        // 过滤和格式化一些常见信息
        const formattedData = {};
        const keyMap = {
          Make: '制造厂商',
          Model: '设备型号',
          DateTime: '拍摄时间',
          ExposureTime: '曝光时间',
          FNumber: '光圈值',
          ISOSpeedRatings: 'ISO',
          FocalLength: '焦距',
          GPSLatitude: 'GPS 纬度',
          GPSLongitude: 'GPS 经度',
          Software: '处理软件'
        };

        for (const [key, value] of Object.entries(allMetaData)) {
          if (typeof value === 'object' && value.numerator !== undefined) {
            formattedData[keyMap[key] || key] = value.numerator / (value.denominator || 1);
          } else if (Array.isArray(value)) {
            formattedData[keyMap[key] || key] = value.join(', ');
          } else {
            formattedData[keyMap[key] || key] = value;
          }
        }
        exifData.value = formattedData;
      }
      loading.value = false;
    });
  };

  const removeExif = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Canvas.toBlob/toDataURL naturally strips EXIF data
      canvas.toBlob(
        blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'cleaned_image.jpg';
          a.click();
          URL.revokeObjectURL(url);
          ElMessage.success('已移除 EXIF 并保存图片');
        },
        'image/jpeg',
        0.95
      );
    };
    img.src = imageUrl.value;
  };

  onMounted(() => {
    if (!window.EXIF) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js';
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
    grid-template-columns: 1fr 400px;
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

  .info-section {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    max-height: 600px;
    overflow-y: auto;
  }

  .info-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
  }

  .exif-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .exif-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    font-size: 0.9rem;
  }

  .exif-key {
    color: #64748b;
    font-weight: 500;
  }

  .exif-value {
    color: #1e293b;
    font-weight: 600;
  }

  .loading-state,
  .empty-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    color: #94a3b8;
    height: 300px;
  }

  .loading-state .is-loading {
    font-size: 2rem;
    animation: rotate 1s linear infinite;
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

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
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
