<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">帧抽取器<span>.GIF()</span></h1>
        <div class="header-action end">
          <button
            class="brutal-btn action-btn"
            :disabled="!videoUrl || processing"
            @click="startProcessing"
          >
            {{ processing ? '抽帧中...' : '启动帧抽取' }}
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- 左: Upload / Preview -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>视频源信号.反应堆</span>
            <div class="pane-actions">
              <button v-if="videoUrl" @click="clearVideo">重置</button>
            </div>
          </div>

          <div class="control-panel-content">
            <input ref="fileInput" type="file" hidden accept="video/*" @change="handleFileSelect" />

            <div
              v-if="!videoUrl"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerFileInput"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <div class="upload-placeholder">
                <span class="upload-icon">🎬</span>
                <p>点击或拖拽投入视频帧序列</p>
                <small>(支持 MP4, WebM, OGG · 纯前端处理)</small>
              </div>
            </div>

            <div v-else class="video-area">
              <video
                ref="videoRef"
                :src="videoUrl"
                controls
                class="video-player brutal-shadow"
                @loadedmetadata="onVideoLoaded"
              ></video>

              <div v-if="videoDuration > 0" class="timeline-section mt-4 brutal-shadow">
                <div class="timeline-header bg-cyan">
                  <span>截取范围: {{ startTime.toFixed(2) }}s - {{ endTime.toFixed(2) }}s</span>
                  <span>总长: {{ (endTime - startTime).toFixed(2) }}s</span>
                </div>
                <div class="timeline-body">
                  <input
                    v-model.number="startTime"
                    type="range"
                    class="brutal-slider"
                    :min="0"
                    :max="videoDuration"
                    step="0.1"
                    @input="onStartChange"
                  />
                  <input
                    v-model.number="endTime"
                    type="range"
                    class="brutal-slider"
                    :min="0"
                    :max="videoDuration"
                    step="0.1"
                    @input="onEndChange"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右: Settings -->
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">参数约束.面板</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group channel-group">
              <label class="brutal-label">输出宽度 [ {{ settings.width }}px ]</label>
              <input
                v-model.number="settings.width"
                type="range"
                class="brutal-slider mt-1"
                min="50"
                max="1280"
                step="10"
                @change="syncHeight"
              />

              <label class="brutal-label mt-4">输出高度 [ {{ settings.height }}px ]</label>
              <input
                v-model.number="settings.height"
                type="number"
                class="brutal-input mt-1"
                min="50"
                max="1280"
              />
            </div>

            <div class="brutal-form-group channel-group group-pink mt-4">
              <label class="brutal-label">帧率 FPS [ {{ settings.fps }} ]</label>
              <input
                v-model.number="settings.fps"
                type="range"
                class="brutal-slider mt-1"
                min="1"
                max="30"
              />

              <label class="brutal-label mt-4">品质系数 [ {{ settings.quality }} ]</label>
              <input
                v-model.number="settings.quality"
                type="range"
                class="brutal-slider mt-1"
                min="1"
                max="20"
              />
              <small class="hint mt-1">1 = 极致品质(慢)，20 = 极速压缩</small>
            </div>

            <!-- Result -->
            <div v-if="resultGif" class="brutal-form-group channel-group mt-4">
              <h4>🎉 生成结果</h4>
              <div class="gif-preview brutal-shadow mt-1">
                <img :src="resultGif" alt="Result GIF" />
              </div>
              <div class="result-info mt-1">文件大小: {{ resultSize }}</div>
              <button class="brutal-btn brutal-btn-block action-btn mt-4" @click="downloadGif">
                下载 GIF
              </button>
            </div>

            <!-- Tips -->
            <div class="brutal-form-group channel-group tips-box mt-4">
              <h4>⚡ 工具说明</h4>
              <ul class="tips-list mt-1">
                <li><b>本地处理</b>：视频不会上传到服务器。</li>
                <li><b>性能提示</b>：建议截取 5 秒以内片段。</li>
                <li><b>帧率建议</b>：表情包通常 10-15 FPS。</li>
              </ul>
            </div>
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

    <canvas ref="frameCanvas" style="display: none"></canvas>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
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
    readMode: 'none'
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

  const clearVideo = () => {
    videoUrl.value = '';
    resultGif.value = '';
    videoDuration.value = 0;
  };

  const onVideoLoaded = () => {
    const v = videoRef.value;
    videoDuration.value = v.duration;
    videoAspectRatio.value = v.videoWidth / v.videoHeight;

    startTime.value = 0;
    endTime.value = Math.min(5, v.duration);

    settings.width = Math.min(480, v.videoWidth);
    settings.height = Math.round(settings.width / videoAspectRatio.value);
  };

  const syncHeight = () => {
    settings.height = Math.round(settings.width / videoAspectRatio.value);
  };

  const onStartChange = () => {
    if (startTime.value >= endTime.value) startTime.value = Math.max(0, endTime.value - 0.1);
    if (videoRef.value) videoRef.value.currentTime = startTime.value;
  };
  const onEndChange = () => {
    if (endTime.value <= startTime.value)
      endTime.value = Math.min(videoDuration.value, startTime.value + 0.1);
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

  const statusClass = computed(() => {
    if (processing.value) return 'warn';
    if (resultGif.value) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (processing.value) return '警告: 帧抽取引擎全功率运行中...';
    if (resultGif.value) return '任务达成 : GIF 已生成等待下载导出!';
    if (videoUrl.value) return '视频源就位 : 调整参数后启动帧抽取...';
    return '系统待命 : 等待投入视频帧序列...';
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
  }
  .action-btn {
    background: #00e572;
    color: #111;
  }

  .mt-1 {
    margin-top: 0.5rem;
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
  .text-white {
    color: #fff;
    text-shadow: 1px 1px 0 #111;
  }

  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .control-panel-content,
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
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
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
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

  .video-area {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  .video-player {
    width: 100%;
    max-height: 420px;
    background: #000;
    border: 4px solid #111;
  }

  .timeline-section {
    border: 4px solid #111;
  }
  .timeline-header {
    padding: 0.75rem 1rem;
    border-bottom: 4px solid #111;
    font-weight: 800;
    font-size: 0.9rem;
    display: flex;
    justify-content: space-between;
  }
  .timeline-body {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .brutal-label {
    display: block;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    color: #111;
  }
  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    padding: 0.5rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .brutal-slider {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    background: #111;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
    margin: 5px 0;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }

  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
    background: #fdfdfd;
  }
  .channel-group.group-pink {
    background: #fff0f5;
  }
  .channel-group h4 {
    margin: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .gif-preview {
    border: 4px solid #111;
    overflow: hidden;
  }
  .gif-preview img {
    width: 100%;
    display: block;
  }
  .result-info {
    font-weight: 700;
    font-size: 0.9rem;
    color: #555;
  }
  .hint {
    font-weight: bold;
    color: #888;
    font-size: 0.8rem;
    display: block;
  }

  .tips-box {
    background: #f0f8ff;
  }
  .tips-list {
    padding-left: 1.25rem;
    margin: 0;
  }
  .tips-list li {
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .brutal-shadow {
    box-shadow: 8px 8px 0px #111;
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
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
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
  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #2a1a20;
  }
  [data-theme='dark'] .settings-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }
  [data-theme='dark'] .brutal-upload-area {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
    background: #b28f00;
  }
  [data-theme='dark'] .video-player {
    border-color: #eee;
  }
  [data-theme='dark'] .timeline-section {
    border-color: #eee;
  }
  [data-theme='dark'] .timeline-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
  }
  [data-theme='dark'] .bg-cyan {
    background: #1a5e5f;
  }
  [data-theme='dark'] .gif-preview {
    border-color: #eee;
  }
  [data-theme='dark'] .tips-box {
    background: #1a2030;
  }
  [data-theme='dark'] .brutal-slider {
    background: #eee;
    border-color: #eee;
  }
</style>
