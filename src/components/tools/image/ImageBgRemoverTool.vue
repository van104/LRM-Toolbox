<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-action start">
          <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        </div>
        <h1 class="brutal-title">自动去背景<span>.AI()</span></h1>
        <div class="header-action end">
          <button class="brutal-btn clear-btn" :disabled="!resultUrl" @click="downloadResult">
            输出纯净实体图
          </button>
        </div>
      </header>

      <div class="brutal-grid">
        <!-- Left Pane: AI Workbench -->
        <div class="brutal-pane">
          <div class="pane-header bg-yellow">
            <span>智能剥离.主控区</span>
            <div class="pane-actions">
              <button :disabled="!imageUrl" @click="reset">更换解析物</button>
            </div>
          </div>

          <div class="control-panel-content">
            <div
              v-show="!image"
              class="brutal-upload-area"
              :class="{ 'is-dragover': isDragOver }"
              @click="triggerUpload"
              @dragover.prevent="dragOver"
              @dragleave.prevent="dragLeave"
              @drop.prevent="handleFileDrop"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <div class="upload-placeholder">
                <span class="upload-icon">🪄</span>
                <p>点击或拖拽上传以开启深度扫描</p>
                <small>(智能识别所有特征显著的主体矩阵)</small>
              </div>
            </div>

            <div v-show="image" class="editor-area">
              <div
                v-if="editMode === 'view'"
                ref="compareBox"
                class="photo-preview-box brutal-shadow"
                :class="{ 'has-result': resultUrl, 'is-dragging': isSliding }"
                @mousedown="startSliding"
                @touchstart="startSliding"
              >
                <div v-if="!resultUrl" class="original-box">
                  <img :src="imageUrl" class="preview-img" alt="Original" />
                  <div class="tip-badge overlay-tag">原始介质</div>
                </div>

                <div v-else class="slider-compare-box">
                  <div class="result-layer transparency-grid">
                    <img :src="strokeUrl || resultUrl" class="preview-img" alt="Result" />
                  </div>

                  <div
                    class="original-layer"
                    :style="{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }"
                  >
                    <img :src="imageUrl" class="preview-img" alt="Original" />
                  </div>

                  <div class="slider-line" :style="{ left: sliderPos + '%' }">
                    <div class="slider-button">↔</div>
                  </div>
                </div>

                <div v-if="processing" class="processing-overlay">
                  <span class="loading-spinner">⚙️</span>
                  <span>正在执行云端剥离程序...</span>
                </div>
              </div>

              <div v-if="editMode === 'manual'" class="manual-editor-container">
                <div class="editor-toolbar">
                  <label class="toolbar-label">笔刷直径 ({{ brushSize }}px)</label>
                  <input
                    v-model.number="brushSize"
                    type="range"
                    class="brutal-slider small-slider mx-2"
                    min="1"
                    max="100"
                  />

                  <div class="tool-group">
                    <button
                      class="brutal-btn small-btn"
                      :class="{ 'active-tool': brushType === 'erase' }"
                      @click="brushType = 'erase'"
                    >
                      擦除区
                    </button>
                    <button
                      class="brutal-btn small-btn"
                      :class="{ 'active-tool': brushType === 'restore' }"
                      @click="brushType = 'restore'"
                    >
                      挽救区
                    </button>
                  </div>

                  <div class="tool-group right-tools">
                    <button
                      class="brutal-btn small-btn"
                      :disabled="historyStack.length <= 1"
                      @click="undoEdit"
                    >
                      撤回
                    </button>
                    <button class="brutal-btn small-btn success" @click="saveManualEdit">
                      覆盖保存
                    </button>
                    <button class="brutal-btn small-btn error" @click="exitManualEdit">
                      放弃变更
                    </button>
                  </div>
                </div>

                <div ref="canvasWrapper" class="canvas-wrapper transparency-grid">
                  <canvas
                    ref="editCanvas"
                    @mousedown.prevent="startDrawing"
                    @mousemove.prevent="draw"
                    @mouseup="stopDrawing"
                    @mouseleave="stopDrawing"
                    @touchstart.prevent="startDrawing"
                    @touchmove.prevent="draw"
                    @touchend.prevent="stopDrawing"
                  ></canvas>
                </div>
              </div>

              <div v-if="image && !processing" class="stage-actions mt-4">
                <button
                  v-if="!resultUrl && editMode === 'view'"
                  class="brutal-btn brutal-btn-block action-btn"
                  :disabled="!isConfigValid"
                  @click="processBgRemoval"
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
        <div class="brutal-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">API配置.控制台</span>
          </div>

          <div class="settings-content">
            <div class="brutal-form-group">
              <label class="brutal-label">接口通信协议提供商</label>
              <select v-model="apiConfig.provider" class="brutal-input" @change="onProviderChange">
                <option value="builtin">LRM 系统内置管道 (低精度免费)</option>
                <option value="remove.bg">Remove.bg 专用轨道</option>
                <option value="baidu">Baidu 智能云 AI 集群</option>
                <option value="custom">定制网关路由 (Custom API)</option>
              </select>
            </div>

            <div v-if="apiConfig.provider === 'builtin'" class="tool-note mt-3">
              内置 API 每月享有免费调用池。默认以 0.25MP 分辨率工作以节省带宽。
            </div>
            <div v-else-if="apiConfig.provider === 'baidu'" class="tool-note mt-3">
              需前往百度智能云获取 Access Token 所需的控制密钥。
            </div>

            <!-- Credentials Block -->
            <div
              v-if="apiConfig.provider !== 'builtin'"
              class="brutal-form-group channel-group mt-4"
            >
              <h4>🔑 通信凭证鉴权库</h4>

              <div v-if="apiConfig.provider === 'baidu'">
                <label class="brutal-label text-sm mt-3">API Client ID</label>
                <input
                  v-model="apiConfig.apiKey"
                  type="password"
                  class="brutal-input"
                  placeholder="输入 Baidu API Key"
                />

                <label class="brutal-label text-sm mt-3">Client Secret</label>
                <input
                  v-model="apiConfig.baiduSecret"
                  type="password"
                  class="brutal-input"
                  placeholder="输入 Baidu Secret Key"
                />
              </div>

              <div v-else>
                <label class="brutal-label text-sm mt-3">{{
                  apiConfig.provider === 'custom' ? '请求入口 URL' : '核心 Authorization Key'
                }}</label>
                <input
                  v-model="apiConfig.apiKey"
                  :type="apiConfig.provider === 'custom' ? 'text' : 'password'"
                  class="brutal-input"
                  placeholder="输入授权码/URL"
                />
              </div>

              <div v-if="apiConfig.provider === 'custom'" class="mt-3">
                <label class="brutal-label text-sm">自定义 Header 报文 (JSON)</label>
                <textarea
                  v-model="apiConfig.customHeaders"
                  class="brutal-input"
                  rows="3"
                  placeholder='{"Authorization": "Bearer xxx"}'
                ></textarea>
              </div>
            </div>

            <!-- Render Settings -->
            <div class="brutal-form-group channel-group group-pink mt-4">
              <h4>⚙️ 图形编译及渲染设置</h4>

              <label class="brutal-label text-sm mt-3">导出精度阈值</label>
              <div class="radio-bar mt-1">
                <label class="radio-pill" :class="{ active: outputConfig.size === 'preview' }">
                  <input
                    v-model="outputConfig.size"
                    type="radio"
                    value="preview"
                    class="hidden-radio"
                  />
                  基础探测 (0.25MP)
                </label>
                <label class="radio-pill" :class="{ active: outputConfig.size === 'full' }">
                  <input
                    v-model="outputConfig.size"
                    type="radio"
                    value="full"
                    class="hidden-radio"
                  />
                  全精度满载 (耗点)
                </label>
              </div>

              <div class="divider mt-4"></div>

              <label class="brutal-label text-sm mt-3">强制白边勾画补完计划</label>
              <label class="brutal-checkbox-label">
                <input v-model="strokeConfig.enabled" type="checkbox" class="brutal-checkbox" />
                激活外部扩充描边路径
              </label>

              <div v-if="strokeConfig.enabled" class="mt-3 indent-group">
                <div class="flex-row">
                  <input
                    v-model="strokeConfig.color"
                    type="color"
                    class="brutal-color-picker brutal-shadow-sm me-3"
                  />
                  <div style="flex: 1">
                    <label class="brutal-label text-sm mb-1"
                      >蔓延厚度: {{ strokeConfig.width }}px</label
                    >
                    <input
                      v-model.number="strokeConfig.width"
                      type="range"
                      class="brutal-slider small-slider"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              <div class="divider mt-4"></div>

              <label class="brutal-label text-sm mt-3">导出前缀自定义</label>
              <input
                v-model="outputConfig.filename"
                type="text"
                class="brutal-input"
                placeholder="自动计算命名规则"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Global Status Bar -->
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
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onUnmounted, nextTick, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const image = ref<File | null>(null);
  const imageUrl = ref('');
  const resultUrl = ref('');
  const processing = ref(false);
  const sliderPos = ref(50);
  const compareBox = ref<HTMLElement | null>(null);
  const isSliding = ref(false);

  const statusClass = computed(() => {
    if (processing.value) return 'warn';
    if (resultUrl.value) return 'success';
    if (image.value) return 'info';
    return 'info';
  });

  const statusText = computed(() => {
    if (processing.value) return '警告: 数据通道高负载传输中... 服务器正在强行解构前景坐标谱';
    if (resultUrl.value)
      return '系统通知 : 多层光栅已被肢解提取，新合成层已装填。可继续下发【手动抹匀】或【抛出】指令';
    if (image.value) return '探测矩阵启动，请确认右路控制台的安全凭证，准备执行特征提取算法';
    return '内核进入待机轮询... 等待高维度源图注入';
  });

  const { fileInput, isDragOver, triggerFileInput, dragOver, dragLeave } = useFileHandler({
    accept: 'image/*',
    readMode: 'none',
    onSuccess: result => {
      processFile(result.file);
    }
  });

  const triggerUpload = () => {
    if (fileInput.value) {
      fileInput.value.click();
    } else {
      triggerFileInput();
    }
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
    outputConfig.filename =
      lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) + '_no-bg' : file.name + '_no-bg';
  };

  type EditMode = 'view' | 'manual';
  const editMode = ref<EditMode>('view');
  const editCanvas = ref<HTMLCanvasElement | null>(null);
  const canvasWrapper = ref<HTMLElement | null>(null);
  const brushSize = ref(20);
  const brushType = ref<'erase' | 'restore'>('erase');
  const isDrawing = ref(false);
  const historyStack = ref<string[]>([]);
  let ctx: CanvasRenderingContext2D | null = null;
  let offscreenCanvas: HTMLCanvasElement | null = null;
  let offscreenCtx: CanvasRenderingContext2D | null = null;
  let originalImage: HTMLImageElement | null = null;

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
      return str; // Fallback for old unencrypted strings
    }
  };

  const apiConfig = reactive({
    provider: localStorage.getItem('bg_remover_provider') || 'builtin',
    apiKey: decryptKey(localStorage.getItem('bg_remover_key')),
    baiduSecret: decryptKey(localStorage.getItem('bg_remover_baidu_secret')),
    customHeaders: decryptKey(localStorage.getItem('bg_remover_headers'))
  });

  const outputConfig = reactive({
    size: 'preview',
    filename: ''
  });

  const strokeConfig = reactive({
    enabled: false,
    color: '#111111',
    width: 5
  });

  const strokeUrl = ref('');
  const isStroking = ref(false);

  const isConfigValid = computed(() => {
    if (apiConfig.provider === 'builtin') return true;
    if (apiConfig.provider === 'custom') {
      return apiConfig.apiKey.startsWith('http');
    }
    if (apiConfig.provider === 'baidu') {
      return apiConfig.apiKey.length > 10 && apiConfig.baiduSecret.length > 10;
    }
    return apiConfig.apiKey.length > 10;
  });

  const onProviderChange = () => {
    localStorage.setItem('bg_remover_provider', apiConfig.provider);
  };

  const processBgRemoval = async () => {
    if (!image.value || !isConfigValid.value) return;

    processing.value = true;

    localStorage.setItem('bg_remover_key', encryptKey(apiConfig.apiKey));
    if (apiConfig.provider === 'baidu') {
      localStorage.setItem('bg_remover_baidu_secret', encryptKey(apiConfig.baiduSecret));
    }
    if (apiConfig.provider === 'custom') {
      localStorage.setItem('bg_remover_headers', encryptKey(apiConfig.customHeaders));
    }

    try {
      let responseBlob: Blob;
      if (apiConfig.provider === 'builtin') {
        responseBlob = await callBuiltinApi();
      } else if (apiConfig.provider === 'remove.bg') {
        responseBlob = await callRemoveBg();
      } else if (apiConfig.provider === 'baidu') {
        responseBlob = await callBaiduAi();
      } else if (apiConfig.provider === 'custom') {
        responseBlob = await callCustomApi();
      } else {
        throw new Error('当前服务商流管道出现偏离，请检查控制台配置。');
      }

      resultUrl.value = URL.createObjectURL(responseBlob);
      ElMessage.success('去背指令已完结执行过程！');
    } catch (err: unknown) {
      console.error(err);
      const e = err as Error;
      ElMessage.error(e.message || '去背通讯回路崩溃，请查验网络代理或 API Key 有效期');
    } finally {
      processing.value = false;
    }
  };

  const callRemoveBg = async () => {
    if (!image.value) throw new Error('No image');
    const formData = new FormData();
    formData.append('image_file', image.value);
    formData.append('size', outputConfig.size);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiConfig.apiKey
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.title || 'Remove.bg 服务拒绝了连接申请');
    }
    return await response.blob();
  };

  const callBuiltinApi = async () => {
    if (!image.value) throw new Error('No image');
    const BUILTIN_KEY = atob('VzNDTUpSbmJjNjZhYmZUeTZpU3ZHaHlU');

    const formData = new FormData();
    formData.append('image_file', image.value);
    formData.append('size', 'preview');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': BUILTIN_KEY },
      body: formData
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.errors?.[0]?.title || '内置备用网关目前处于拥塞限制状态');
    }
    return await response.blob();
  };

  const callBaiduAi = async () => {
    if (!image.value) throw new Error('No image');
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiConfig.apiKey}&client_secret=${apiConfig.baiduSecret}`;
    const tokenRes = await fetch(tokenUrl);
    if (!tokenRes.ok) throw new Error('密钥交汇失败由于公私钥拒签。');
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const reader = new FileReader();
    const base64Promise = new Promise<string>(resolve => {
      reader.onloadend = () => {
        const res = reader.result as string;
        resolve(res.split(',')[1]);
      };
      reader.readAsDataURL(image.value!);
    });
    const base64Str = await base64Promise;

    const apiUrl = `https://aip.baidubce.com/rest/2.0/image-process/v1/body_seg?access_token=${accessToken}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(base64Str)}`
    });

    if (!response.ok) throw new Error('远程调用过程返回 HTTP 中断码');
    const result = await response.json();
    if (result.error_code) throw new Error(result.error_msg);

    const byteCharacters = atob(result.foreground);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  };

  const callCustomApi = async () => {
    if (!image.value) throw new Error('No image');
    const formData = new FormData();
    formData.append('image', image.value);

    let headers: Record<string, string> = {};
    if (apiConfig.customHeaders) {
      try {
        headers = JSON.parse(apiConfig.customHeaders);
      } catch {
        throw new Error('非法字符注入请求头块引发语法崩溃');
      }
    }

    const response = await fetch(apiConfig.apiKey, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`定制目标抛出异常码: ${response.status}`);
    }

    return await response.blob();
  };

  const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const updateStrokeImage = debounce(async () => {
    if (!resultUrl.value) {
      strokeUrl.value = '';
      return;
    }
    if (!strokeConfig.enabled || strokeConfig.width <= 0) {
      strokeUrl.value = resultUrl.value;
      return;
    }

    isStroking.value = true;
    try {
      const blob = await generateStrokedBlob(resultUrl.value, strokeConfig);
      if (strokeUrl.value && strokeUrl.value !== resultUrl.value)
        URL.revokeObjectURL(strokeUrl.value);
      strokeUrl.value = URL.createObjectURL(blob);
    } catch (e) {
      console.error('Stroke generation failed', e);
      strokeUrl.value = resultUrl.value;
    } finally {
      isStroking.value = false;
    }
  }, 300);

  watch(
    [resultUrl, () => strokeConfig.enabled, () => strokeConfig.color, () => strokeConfig.width],
    () => {
      updateStrokeImage();
    }
  );

  const generateStrokedBlob = async (
    srcUrl: string,
    config: { width: number; color: string }
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = srcUrl;
      img.onload = () => {
        const padding = config.width * 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width + padding;
        canvas.height = img.height + padding;
        const localCtx = canvas.getContext('2d');
        if (!localCtx) return reject('No context');

        const centerX = padding / 2;
        const centerY = padding / 2;

        const dCanvas = document.createElement('canvas');
        dCanvas.width = canvas.width;
        dCanvas.height = canvas.height;
        const dCtx = dCanvas.getContext('2d');
        if (!dCtx) return reject('No dCtx');

        const r = config.width;
        const density = Math.max(1, Math.floor(r / 2));

        for (let rad = 1; rad <= r; rad += density) {
          const numAngles = Math.max(12, rad * 4);
          for (let i = 0; i < numAngles; i++) {
            const angle = (i / numAngles) * 2 * Math.PI;
            const dx = Math.cos(angle) * rad;
            const dy = Math.sin(angle) * rad;
            dCtx.drawImage(img, centerX + dx, centerY + dy);
          }
        }

        dCtx.globalCompositeOperation = 'source-in';
        dCtx.fillStyle = config.color;
        dCtx.fillRect(0, 0, dCanvas.width, dCanvas.height);

        localCtx.drawImage(dCanvas, 0, 0);

        localCtx.globalCompositeOperation = 'source-over';
        localCtx.drawImage(img, centerX, centerY);

        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject('Blob conversion failed');
        }, 'image/png');
      };
      img.onerror = reject;
    });
  };

  const downloadResult = () => {
    const targetUrl = strokeUrl.value || resultUrl.value;
    if (!targetUrl) return;
    const link = document.createElement('a');
    const finalName = outputConfig.filename || `no-bg_${Date.now()}`;
    link.download = `${finalName}.png`;
    link.href = targetUrl;
    link.click();
  };

  const resetStateOnly = () => {
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value);
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);
    if (strokeUrl.value) URL.revokeObjectURL(strokeUrl.value);
    image.value = null;
    imageUrl.value = '';
    resultUrl.value = '';
    strokeUrl.value = '';
    sliderPos.value = 50;
    editMode.value = 'view';
    historyStack.value = [];
    isSliding.value = false;
  };

  const reset = () => {
    resetStateOnly();
    triggerUpload();
  };

  const enterManualEdit = async () => {
    editMode.value = 'manual';
    await nextTick();
    initCanvas();
  };

  const exitManualEdit = () => {
    editMode.value = 'view';
  };

  const initCanvas = () => {
    const canvas = editCanvas.value;
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');

    originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';
    originalImage.src = imageUrl.value;

    originalImage.onload = () => {
      if (!canvas || !offscreenCanvas || !offscreenCtx || !ctx) return;
      canvas.width = originalImage!.width;
      canvas.height = originalImage!.height;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCtx.drawImage(originalImage!, 0, 0);

      if (resultUrl.value) {
        const resImg = new Image();
        resImg.crossOrigin = 'anonymous';
        resImg.src = resultUrl.value;
        resImg.onload = () => {
          ctx!.drawImage(resImg, 0, 0, canvas.width, canvas.height);
          saveHistory();
        };
      } else {
        ctx.drawImage(originalImage!, 0, 0);
        saveHistory();
      }
    };
  };

  const saveHistory = () => {
    if (!editCanvas.value) return;
    historyStack.value.push(editCanvas.value.toDataURL('image/png'));
    if (historyStack.value.length > 20) historyStack.value.shift();
  };

  const undoEdit = () => {
    if (historyStack.value.length <= 1 || !ctx || !editCanvas.value) return;
    historyStack.value.pop();
    const lastState = historyStack.value[historyStack.value.length - 1];
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      ctx!.clearRect(0, 0, editCanvas.value!.width, editCanvas.value!.height);
      ctx!.drawImage(img, 0, 0);
    };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    if (!ctx) return;
    isDrawing.value = true;
    ctx.beginPath();
    const { x, y } = getCoord(e);
    ctx.moveTo(x, y);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.value || !ctx || !offscreenCanvas) return;
    const { x, y } = getCoord(e);

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType.value === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      const pattern = ctx.createPattern(offscreenCanvas, 'no-repeat');
      if (pattern) ctx.strokeStyle = pattern;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.value) return;
    isDrawing.value = false;
    saveHistory();
  };

  const getCoord = (e: MouseEvent | TouchEvent) => {
    const canvas = editCanvas.value;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if (window.TouchEvent && e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const saveManualEdit = () => {
    if (!editCanvas.value) return;
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);

    editCanvas.value.toBlob(
      blob => {
        if (!blob) return;
        resultUrl.value = URL.createObjectURL(blob);
        editMode.value = 'view';
        sliderPos.value = 50;
        ElMessage.success('人工介入涂抹轨已压入堆栈保存');
      },
      'image/png',
      1.0
    );
  };

  const startSliding = (e: MouseEvent | TouchEvent) => {
    if (!resultUrl.value) return;
    isSliding.value = true;
    handleSliderMove(e);
    window.addEventListener('mousemove', handleSliderMove);
    window.addEventListener('mouseup', stopSliding);
    window.addEventListener('touchmove', handleSliderMove, { passive: false });
    window.addEventListener('touchend', stopSliding);
  };

  const stopSliding = () => {
    isSliding.value = false;
    window.removeEventListener('mousemove', handleSliderMove);
    window.removeEventListener('mouseup', stopSliding);
    window.removeEventListener('touchmove', handleSliderMove);
    window.removeEventListener('touchend', stopSliding);
  };

  const handleSliderMove = (e: MouseEvent | TouchEvent) => {
    if (!isSliding.value || !compareBox.value) return;
    const rect = compareBox.value.getBoundingClientRect();

    let clientX = 0;
    if (window.TouchEvent && e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }

    const position = ((clientX - rect.left) / rect.width) * 100;
    sliderPos.value = Math.max(0, Math.min(100, position));
  };

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
    font-size: 1.25rem;
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

  .brutal-btn.success {
    background: #00e572;
  }
  .brutal-btn.error {
    background: #ff4b4b;
    color: white;
  }
  .brutal-btn.active-tool {
    background: #ffd900;
    box-shadow:
      inset 4px 4px 0px rgba(0, 0, 0, 0.2),
      0px 0px 0px #111;
    transform: translate(3px, 3px);
  }

  .brutal-btn:hover:not(:disabled):not(.active-tool) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn.small-btn:hover:not(:disabled):not(.active-tool) {
    box-shadow: 6px 6px 0px #111;
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
  .brutal-btn.clear-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-btn.action-btn {
    background: #00e572;
    padding: 1.25rem;
    border: 4px solid #111;
  }

  .flex-row {
    display: flex;
    align-items: center;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-3 {
    margin-top: 1rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
  .me-3 {
    margin-right: 1rem;
  }
  .mb-1 {
    margin-bottom: 0.25rem;
    text-align: left;
  }
  .mx-2 {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
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
    background: #2dfdff;
    color: #111;
  }
  .text-white {
    color: #111 !important;
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

  .control-panel-content,
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #fdfdfd;
  }
  .settings-content {
    background: #fdfae5;
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
    height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .brutal-upload-area:hover,
  .brutal-upload-area.is-dragover {
    background: #4b7bff;
    border-style: solid;
    color: white;
  }
  .brutal-upload-area:hover p,
  .brutal-upload-area.is-dragover p {
    color: white;
  }
  .brutal-upload-area:hover small,
  .brutal-upload-area.is-dragover small {
    color: #fdfae5;
  }

  .upload-icon {
    font-size: 5rem;
    display: block;
    margin-bottom: 1rem;
    text-shadow: 4px 4px 0 #111;
  }

  .upload-placeholder p {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: #111;
  }
  .upload-placeholder small {
    font-weight: bold;
    color: #666;
  }

  .editor-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }

  .photo-preview-box {
    position: relative;
    overflow: hidden;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    min-height: 500px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
  }

  .compare-container.is-dragging,
  .photo-preview-box.is-dragging {
    cursor: col-resize;
  }

  .slider-compare-box {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    user-select: none;
    overflow: hidden;
  }

  .result-layer,
  .original-layer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
  }

  .transparency-grid {
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    background-color: white;
  }

  .original-layer {
    z-index: 2;
    background: #e2e8f0;
  }

  .slider-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #111;
    z-index: 10;
    pointer-events: none;
    box-shadow: 4px 0px 0px #ff4b4b;
  }

  .slider-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background: #ffd900;
    border: 4px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0px #111;
    font-weight: 900;
    font-size: 1.2rem;
    cursor: col-resize;
  }

  .preview-img {
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
  }

  .overlay-tag {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 20;
    background: #111;
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-weight: bold;
    border: 2px solid #fff;
    box-shadow: 2px 2px 0px #111;
  }

  .processing-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 30;
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .loading-spinner {
    font-size: 3rem;
    animation: spin 2s linear infinite;
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }

  .action-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
  }

  .manual-editor-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #111;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .editor-toolbar {
    padding: 1rem;
    background: #111;
    border-bottom: 4px solid #111;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .toolbar-label {
    color: #fff;
    font-weight: bold;
  }

  .tool-group {
    display: flex;
    gap: 0.5rem;
  }
  .right-tools {
    margin-left: auto;
  }

  .canvas-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 20px;
    min-height: 500px;
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    background-color: white;
  }
  canvas {
    max-width: 100%;
    max-height: 100%;
    box-shadow: 8px 8px 0px #111;
    background: transparent;
    touch-action: none;
    border: 4px solid #111;
  }

  /* Forms & Config */
  .channel-group {
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1.25rem;
    background: #fff;
  }
  .channel-group h4 {
    margin: 0 0 1rem 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .channel-group.group-pink {
    background: #ff9ecf;
  }
  .group-pink h4 {
    color: #111;
    text-shadow: 1px 1px 0px #fff;
  }

  .brutal-label {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: #111;
  }
  .text-sm {
    font-size: 0.9rem;
  }

  .brutal-input {
    width: 100%;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    padding: 0.75rem;
    border: 3px solid #111;
    border-radius: 0;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.1s;
    background: #fff;
    box-sizing: border-box;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .tool-note {
    font-size: 0.85rem;
    color: #111;
    font-weight: bold;
    border-left: 4px solid #ff4b4b;
    padding-left: 0.5rem;
    background: rgba(255, 75, 75, 0.1);
    padding: 0.5rem;
  }
  .config-warn {
    font-weight: bold;
    color: #ff4b4b;
    margin: 0;
    font-size: 1rem;
  }

  .radio-bar {
    display: flex;
    gap: 0.5rem;
    background: #fff;
    padding: 0.5rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }
  .radio-pill {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    border: 2px solid transparent;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.1s;
    background: transparent;
  }
  .radio-pill.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }
  .hidden-radio {
    display: none;
  }

  .divider {
    height: 4px;
    background: #111;
    border-radius: 2px;
  }

  .brutal-checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.95rem;
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .brutal-checkbox-label:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }
  .brutal-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    position: relative;
    margin: 0;
    flex-shrink: 0;
  }
  .brutal-checkbox:checked {
    background: #111;
  }
  .brutal-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #fff;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  .indent-group {
    padding-left: 1rem;
    border-left: 4px solid #111;
  }

  .brutal-color-picker {
    width: 48px;
    height: 48px;
    padding: 0;
    border: 3px solid #111;
    cursor: pointer;
    background: none;
    transition: all 0.1s;
  }
  .brutal-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .brutal-color-picker::-webkit-color-swatch {
    border: none;
  }
  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 16px;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-slider.small-slider {
    height: 12px;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 32px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-slider::-moz-range-thumb {
    width: 20px;
    height: 32px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-slider::-webkit-slider-thumb:active {
    background: #111;
  }

  /* Status Base */
  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    overflow: hidden;
    position: relative;
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
    background: #ff4b4b;
    color: #fff;
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

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-status.info {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button,
  [data-theme='dark'] .brutal-upload-area {
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
    color: #eee;
  }

  [data-theme='dark'] .brutal-upload-area {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-upload-area:hover,
  [data-theme='dark'] .brutal-upload-area.is-dragover {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .brutal-upload-area p,
  [data-theme='dark'] .upload-placeholder p {
    color: #eee;
  }

  [data-theme='dark'] .photo-preview-box {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .slider-button {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .slider-line {
    background: #eee;
    box-shadow: 4px 0px 0px #9d174d;
  }
  [data-theme='dark'] .overlay-tag {
    background: #eee;
    color: #111;
    border-color: #111;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .processing-overlay {
    background: rgba(17, 17, 17, 0.9);
    color: #eee;
  }

  [data-theme='dark'] .manual-editor-container {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .editor-toolbar {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .canvas-wrapper canvas {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .channel-group {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .channel-group.group-pink {
    background: #9d174d;
    color: #eee;
  }
  [data-theme='dark'] .group-pink h4 {
    color: #eee;
    text-shadow: 1px 1px 0px #111;
  }

  [data-theme='dark'] .settings-content {
    background: #222;
    background-image:
      linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px);
  }

  [data-theme='dark'] .brutal-input {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .tool-note {
    color: #eee;
    border-left-color: #eee;
    background: rgba(238, 238, 238, 0.1);
  }
  [data-theme='dark'] .brutal-label {
    color: #eee;
  }
  [data-theme='dark'] .divider {
    background: #eee;
  }

  [data-theme='dark'] .radio-bar {
    background: #111;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .radio-pill.active {
    background: #eee;
    color: #111;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-checkbox-label {
    background: #111;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-checkbox {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked {
    background: #eee;
  }
  [data-theme='dark'] .brutal-checkbox:checked::after {
    border-color: #111;
  }
  [data-theme='dark'] .indent-group {
    border-left-color: #eee;
  }

  [data-theme='dark'] .brutal-color-picker {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .brutal-slider {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-slider::-moz-range-thumb {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .brutal-status {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.action-btn {
    background: #00994c;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn.action-btn:disabled {
    background: #333;
    color: #888;
    border-color: #888;
  }
  [data-theme='dark'] .brutal-status.success {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-status.warn {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
</style>
