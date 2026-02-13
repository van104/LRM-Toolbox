<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">视频转 GIF</h1>
        <span class="tool-subtitle">Video to GIF</span>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          :disabled="!videoUrl || processing"
          :loading="processing"
          @click="startProcessing"
        >
          {{ processing ? '正在生成...' : '生成 GIF' }}
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="main-section glass-card">
          <input ref="fileInput" type="file" hidden accept="video/*" @change="handleFileSelect" />
          <div
            v-if="!videoUrl"
            class="upload-area"
            :class="{ 'is-dragover': isDragOver }"
            @click="triggerFileInput"
            @dragover.prevent="dragOver"
            @dragleave.prevent="dragLeave"
            @drop.prevent="handleFileDrop"
          >
            <el-icon class="upload-icon"><VideoCamera /></el-icon>
            <h3>点击或拖拽上传视频</h3>
            <p>支持 MP4, WebM, OGG 格式</p>
          </div>

          <div v-else class="video-preview-area">
            <video
              ref="videoRef"
              :src="videoUrl"
              controls
              class="video-player"
              @loadedmetadata="onVideoLoaded"
            ></video>

            <div v-if="videoDuration > 0" class="timeline-controls">
              <div class="range-info">
                <span>截取范围: {{ startTime.toFixed(2) }}s - {{ endTime.toFixed(2) }}s</span>
                <span>总长: {{ (endTime - startTime).toFixed(2) }}s</span>
              </div>
              <el-slider
                v-model="timeRange"
                range
                :min="0"
                :max="videoDuration"
                :step="0.1"
                @change="onTimeRangeChange"
              />
            </div>
          </div>
        </div>

        <div class="sidebar glass-card">
          <h3>参数设置</h3>
          <div class="settings-form">
            <div class="form-item">
              <label>输出宽度 (px)</label>
              <el-input-number
                v-model="settings.width"
                :min="50"
                :max="1280"
                @change="syncHeight"
              />
            </div>

            <div class="form-item">
              <label>输出高度 (px)</label>
              <el-input-number v-model="settings.height" :min="50" :max="1280" />
            </div>

            <div class="form-item">
              <label>帧率 (FPS: {{ settings.fps }})</label>
              <el-slider v-model="settings.fps" :min="1" :max="30" />
            </div>

            <div class="form-item">
              <label>质量 (1-20: {{ settings.quality }})</label>
              <el-slider v-model="settings.quality" :min="1" :max="20" />
              <p class="hint">1 为最高质量，生成较慢</p>
            </div>

            <el-divider />

            <div v-if="resultGif" class="result-area">
              <h4>生成结果</h4>
              <div class="gif-preview">
                <img :src="resultGif" alt="Result GIF" />
              </div>
              <div class="result-info">大小: {{ resultSize }}</div>
              <el-button type="success" class="download-btn" @click="downloadGif">
                下载 GIF
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>工具说明</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>本地处理</b>：所有操作均在您的浏览器内完成，视频不会被上传到服务器。</li>
            <li>
              <b>性能提示</b>：建议截取 5
              秒以内的片段，过长的视频或过高的帧率会导致处理时间变长且文件极大。
            </li>
            <li><b>帧率建议</b>：常见的动态表情包通常使用 10-15 FPS。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 视频转 GIF</footer>

    <!-- 用于抓取帧的 Canvas -->
    <canvas ref="frameCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft, VideoCamera } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const videoUrl = ref('');
  const videoRef = ref(null);
  const videoDuration = ref(0);
  const videoAspectRatio = ref(1);
  const timeRange = ref([0, 5]);
  const startTime = ref(0);
  const endTime = ref(5);
  const processing = ref(false);
  const resultGif = ref('');
  const resultSize = ref('');

  const settings = reactive({
    width: 400,
    height: 300,
    fps: 12,
    quality: 10
  });

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'video/*',
    readMode: 'dataURL',
    onSuccess: result => {
      videoUrl.value = result.data;
      resultGif.value = '';
    }
  });

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      videoUrl.value = URL.createObjectURL(file);
      resultGif.value = '';
    }
  };

  const handleFileDrop = event => {
    dragLeave();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      videoUrl.value = URL.createObjectURL(file);
      resultGif.value = '';
    }
  };

  const onVideoLoaded = () => {
    const v = videoRef.value;
    videoDuration.value = v.duration;
    videoAspectRatio.value = v.videoWidth / v.videoHeight;

    // 默认截取前 5 秒或整段
    startTime.value = 0;
    endTime.value = Math.min(5, v.duration);
    timeRange.value = [0, endTime.value];

    // 初始化输出尺寸
    settings.width = Math.min(480, v.videoWidth);
    settings.height = Math.round(settings.width / videoAspectRatio.value);
  };

  const syncHeight = () => {
    settings.height = Math.round(settings.width / videoAspectRatio.value);
  };

  const onTimeRangeChange = val => {
    startTime.value = val[0];
    endTime.value = val[1];
    // 自动预览起始点
    if (videoRef.value) videoRef.value.currentTime = startTime.value;
  };

  const frameCanvas = ref(null);

  const startProcessing = async () => {
    if (!window.GIF) return ElMessage.error('GIF 库加载中，请稍候');

    processing.value = true;
    resultGif.value = '';

    try {
      const gif = new window.GIF({
        workers: 2,
        quality: settings.quality,
        width: settings.width,
        height: settings.height,
        workerScript: '/lib/gif.worker.js'
      });

      const v = videoRef.value;
      const canvas = frameCanvas.value;
      const ctx = canvas.getContext('2d');
      canvas.width = settings.width;
      canvas.height = settings.height;

      const duration = endTime.value - startTime.value;
      const frameInterval = 1 / settings.fps;
      const totalFrames = Math.floor(duration * settings.fps);

      ElMessage.info(`正在准备抓取 ${totalFrames} 帧...`);

      v.pause();

      for (let i = 0; i < totalFrames; i++) {
        const time = startTime.value + i * frameInterval;
        v.currentTime = time;

        // 等待 seek 完成
        await new Promise(resolve => {
          const onSeeked = () => {
            v.removeEventListener('seeked', onSeeked);
            resolve();
          };
          v.addEventListener('seeked', onSeeked);
        });

        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        gif.addFrame(ctx, { copy: true, delay: frameInterval * 1000 });
      }

      gif.on('finished', blob => {
        resultGif.value = URL.createObjectURL(blob);
        resultSize.value = (blob.size / 1024 / 1024).toFixed(2) + ' MB';
        processing.value = false;
        ElMessage.success('GIF 生成成功');
      });

      gif.render();
    } catch (err) {
      console.error(err);
      ElMessage.error('转换失败: ' + err.message);
      processing.value = false;
    }
  };

  const downloadGif = () => {
    const a = document.createElement('a');
    a.href = resultGif.value;
    a.download = 'video_extract.gif';
    a.click();
  };

  onMounted(() => {
    if (!window.GIF) {
      const script = document.createElement('script');
      script.src = '/lib/gif.js';
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
    max-width: 1400px;
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

  .video-preview-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .video-player {
    width: 100%;
    max-height: 500px;
    background: #000;
    border-radius: 8px;
  }

  .timeline-controls {
    padding: 0 1rem;
  }

  .range-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #64748b;
    margin-bottom: 0.5rem;
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

  .hint {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  .result-area {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .gif-preview {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .gif-preview img {
    width: 100%;
    display: block;
  }

  .result-info {
    font-size: 0.85rem;
    color: #64748b;
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
