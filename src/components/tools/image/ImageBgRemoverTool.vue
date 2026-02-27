<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <Header :has-result="!!resultUrl" @back="goBack" @download="downloadResult" />

      <div class="brutal-grid">
        <!-- Left Pane: Workbench -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>智能剥离.主控区</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="reset">更换解析物</button>
            </div>
          </div>

          <div class="control-panel-content">
            <!-- Upload Area -->
            <UploadArea
              v-if="!image"
              :is-drag-over="isDragOver"
              @click="triggerUpload"
              @dragover="dragOver"
              @dragleave="dragLeave"
              @drop="handleFileDrop"
            />
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileSelect"
            />

            <!-- Editor Area -->
            <div v-show="image" class="editor-area">
              <!-- View Mode: Slider Comparison -->
              <CompareSlider
                v-if="editMode === 'view'"
                :image-url="imageUrl"
                :result-url="resultUrl"
                :display-url="strokeConfig.enabled ? strokeUrl : resultUrl"
                :processing="processing"
              />

              <!-- Manual Mode: Canvas Editor -->
              <ManualCanvas
                v-if="editMode === 'manual'"
                :image-url="imageUrl"
                :result-url="resultUrl"
                @save="handleManualSave"
                @cancel="exitManualEdit"
              />

              <!-- Actions inside Workbench -->
              <div v-if="image && !processing" class="stage-actions mt-4">
                <button
                  v-if="!resultUrl && editMode === 'view'"
                  class="brutal-btn brutal-btn-block action-btn"
                  :disabled="!isConfigValid"
                  @click="onProcessBgRemoval"
                >
                  🚀 启动神经网络剥除
                </button>

                <div v-if="editMode === 'view'" class="action-row mt-3">
                  <button
                    v-if="!resultUrl"
                    class="brutal-btn small-btn full-width"
                    @click="enterManualEdit"
                  >
                    完全手动修剪
                  </button>
                  <button
                    v-if="resultUrl"
                    class="brutal-btn small-btn full-width"
                    @click="enterManualEdit"
                  >
                    进行局部涂抹微调
                  </button>
                </div>

                <p v-if="!resultUrl && !isConfigValid" class="config-warn mt-3">
                  ⚠️ 警告: 接口通信配置缺失，请先在右侧终端注册鉴权凭证。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Pane: Configuration -->
        <ConfigPanel
          v-model:api-config="apiConfig"
          v-model:output-config="outputConfig"
          v-model:stroke-config="strokeConfig"
        />
      </div>

      <!-- Global Status Bar -->
      <StatusBar :status-class="statusClass" :status-text="statusText" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  // Sub-components
  import Header from './ImageBgRemover/components/Header.vue';
  import StatusBar from './ImageBgRemover/components/StatusBar.vue';
  import UploadArea from './ImageBgRemover/components/UploadArea.vue';
  import ConfigPanel from './ImageBgRemover/components/ConfigPanel.vue';
  import CompareSlider from './ImageBgRemover/components/CompareSlider.vue';
  import ManualCanvas from './ImageBgRemover/components/ManualCanvas.vue';

  // Composables
  import { useBgRemoval } from './ImageBgRemover/composables/useBgRemoval';
  import { useStrokeEffect } from './ImageBgRemover/composables/useStrokeEffect';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  // State
  const image = ref<File | null>(null);
  const imageUrl = ref('');
  const resultUrl = ref('');
  const editMode = ref<'view' | 'manual'>('view');
  const fileInputRef = ref<HTMLInputElement | null>(null);

  // API Config
  const encryptKey = (str: string) => {
    if (!str) return '';
    try {
      return btoa(encodeURIComponent(str));
    } catch {
      return str;
    }
  };

  const decryptKey = (str: string | null) => {
    if (!str) return '';
    try {
      return decodeURIComponent(atob(str));
    } catch {
      return str;
    }
  };

  const apiConfig = ref({
    provider: localStorage.getItem('bg_remover_provider') || 'builtin',
    apiKey: decryptKey(localStorage.getItem('bg_remover_key')),
    baiduSecret: decryptKey(localStorage.getItem('bg_remover_baidu_secret')),
    customHeaders: decryptKey(localStorage.getItem('bg_remover_headers'))
  });

  const outputConfig = ref({
    size: 'preview',
    filename: ''
  });

  const strokeConfig = ref({
    enabled: false,
    color: '#111111',
    width: 5
  });

  // Composables usage
  const { processing, processBgRemoval } = useBgRemoval();
  const { strokeUrl } = useStrokeEffect(
    computed(() => resultUrl.value),
    strokeConfig.value
  );

  const { isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'none',
    onSuccess: result => {
      processFile(result.file);
    }
  });

  // Actions
  const triggerUpload = () => {
    if (fileInputRef.value) fileInputRef.value.click();
    else triggerFileInput();
  };

  const handleFileDrop = (event: DragEvent) => {
    dragLeave();
    if (event.dataTransfer && event.dataTransfer.files) {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processFile(file);
      } else {
        ElMessage.warning('装填取消: 指纹库未命中允许装载的位图阵列');
      }
    }
  };

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      processFile(target.files[0]);
      target.value = '';
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      ElMessage.warning('图像承载包过大，强制拦截（上限 12MB）');
      return;
    }
    resetStateOnly();
    image.value = file;
    imageUrl.value = URL.createObjectURL(file);
    const lastDotIndex = file.name.lastIndexOf('.');
    outputConfig.value.filename =
      lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) + '_no-bg' : file.name + '_no-bg';
  };

  const isConfigValid = computed(() => {
    if (apiConfig.value.provider === 'builtin') return true;
    if (apiConfig.value.provider === 'custom') return apiConfig.value.apiKey.startsWith('http');
    if (apiConfig.value.provider === 'baidu')
      return apiConfig.value.apiKey.length > 10 && apiConfig.value.baiduSecret.length > 10;
    return apiConfig.value.apiKey.length > 10;
  });

  const onProcessBgRemoval = async () => {
    if (!image.value || !isConfigValid.value) return;

    localStorage.setItem('bg_remover_provider', apiConfig.value.provider);
    localStorage.setItem('bg_remover_key', encryptKey(apiConfig.value.apiKey));
    if (apiConfig.value.provider === 'baidu')
      localStorage.setItem('bg_remover_baidu_secret', encryptKey(apiConfig.value.baiduSecret));
    if (apiConfig.value.provider === 'custom')
      localStorage.setItem('bg_remover_headers', encryptKey(apiConfig.value.customHeaders));

    try {
      const blob = await processBgRemoval(image.value, apiConfig.value, outputConfig.value);
      resultUrl.value = URL.createObjectURL(blob);
      ElMessage.success('去背指令已完结执行过程！');
    } catch {
      // Error handled in composable
    }
  };

  const handleManualSave = (blob: Blob) => {
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    resultUrl.value = URL.createObjectURL(blob);
    editMode.value = 'view';
    ElMessage.success('人工介入涂抹轨已压入堆栈保存');
  };

  const enterManualEdit = () => {
    editMode.value = 'manual';
  };
  const exitManualEdit = () => {
    editMode.value = 'view';
  };

  const resetStateOnly = () => {
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    image.value = null;
    imageUrl.value = '';
    resultUrl.value = '';
    editMode.value = 'view';
  };

  const reset = () => {
    resetStateOnly();
    triggerUpload();
  };

  const downloadResult = () => {
    const targetUrl = strokeConfig.value.enabled ? strokeUrl.value : resultUrl.value;
    if (!targetUrl) return;
    const link = document.createElement('a');
    const finalName = outputConfig.value.filename || `no-bg_${Date.now()}`;
    link.download = `${finalName}.png`;
    link.href = targetUrl;
    link.click();
  };

  // Status
  const statusClass = computed(() => {
    if (processing.value) return 'warn';
    if (resultUrl.value) return 'success';
    return 'info';
  });

  const statusText = computed(() => {
    if (processing.value) return '警告: 数据通道高负载传输中... 服务器正在强行解构前景坐标谱';
    if (resultUrl.value)
      return '系统通知 : 多层光栅已被肢解提取，新合成层已装填。可继续下发【手动抹匀】或【抛出】指令';
    if (image.value) return '探测矩阵启动，请确认右路控制台的安全凭证，准备执行特征提取算法';
    return '内核进入待机轮询... 等待高维度源图注入';
  });

  onUnmounted(() => {
    resetStateOnly();
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

  .control-panel-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }

  .editor-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .mt-3 {
    margin-top: 1rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
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
  .brutal-btn.small-btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }
  .full-width {
    width: 100%;
  }

  .brutal-btn.action-btn {
    background: #00e572;
    padding: 1.25rem;
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

  .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
  }
  .config-warn {
    font-weight: bold;
    color: #ff4b4b;
    margin: 0;
    font-size: 1rem;
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .control-panel-content {
    background: #1a1a1a;
  }
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.action-btn {
    background: #00994c;
    color: #fff;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
