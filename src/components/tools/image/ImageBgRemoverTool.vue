<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">图片去背景 <span class="ai-badge">AI</span></h1>
        <span class="tool-subtitle">Background Remover (AI Powered)</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :disabled="!resultUrl" @click="downloadResult">
          <el-icon>
            <Download />
          </el-icon>
          导出透明图片
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-show="!image" class="upload-placeholder" @click="triggerFileInput">
            <div class="upload-icon">
              <el-icon>
                <PictureFilled />
              </el-icon>
            </div>
            <h3>选择图片开始去背景</h3>
            <p>支持人物、物品、动物等主体的智能识别</p>
            <input ref="fileInput" type="file" hidden accept="image/*" @change="handleFileSelect" />
          </div>

          <div v-show="image" class="remover-stage">
            <div
              v-if="editMode === 'view'"
              ref="compareBox"
              class="compare-container"
              :class="{ 'has-result': resultUrl, 'is-dragging': isSliding }"
              @mousedown="startSliding"
              @touchstart="startSliding"
            >
              <div v-if="!resultUrl" class="original-box">
                <img :src="imageUrl" class="preview-img" alt="Original" />
                <div class="tag">原始图片</div>
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

                <div class="compare-tags">
                  <span class="tag left">原始</span>
                  <span class="tag right">去背景</span>
                </div>

                <div class="slider-line" :style="{ left: sliderPos + '%' }">
                  <div class="slider-button">
                    <el-icon>
                      <DArrowLeft />
                    </el-icon>
                    <el-icon>
                      <DArrowRight />
                    </el-icon>
                  </div>
                </div>
              </div>

              <div v-if="processing" class="processing-overlay">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>正在云端处理中...</span>
              </div>
            </div>

            <div
              v-if="image && !resultUrl && !processing && editMode === 'view'"
              class="stage-actions"
            >
              <div class="flex gap-4">
                <el-button
                  type="primary"
                  size="large"
                  :disabled="!isConfigValid"
                  @click="processBgRemoval"
                >
                  <el-icon>
                    <MagicStick />
                  </el-icon>
                  开始 AI 抠图
                </el-button>
                <el-button size="large" @click="enterManualEdit">
                  <el-icon>
                    <Edit />
                  </el-icon>
                  手动抠图
                </el-button>
              </div>
              <p v-if="!isConfigValid" class="config-warn">
                请先在右侧配置 API 服务商信息，或使用手动模式
              </p>
            </div>

            <div v-if="editMode === 'manual'" class="manual-editor-container">
              <div class="editor-toolbar">
                <div class="tool-group">
                  <span class="label">画笔大小</span>
                  <el-slider v-model="brushSize" :min="1" :max="100" style="width: 150px" />
                </div>
                <div class="tool-group">
                  <el-button-group>
                    <el-button
                      :type="brushType === 'erase' ? 'primary' : ''"
                      @click="brushType = 'erase'"
                    >
                      擦除 (前景)
                    </el-button>
                    <el-button
                      :type="brushType === 'restore' ? 'primary' : ''"
                      @click="brushType = 'restore'"
                    >
                      恢复 (背景)
                    </el-button>
                  </el-button-group>
                </div>
                <div class="tool-group">
                  <el-button :disabled="historyStack.length <= 1" @click="undoEdit">撤销</el-button>
                  <el-button type="success" @click="saveManualEdit">保存编辑</el-button>
                  <el-button @click="exitManualEdit">取消</el-button>
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

            <div v-if="resultUrl && editMode === 'view'" class="stage-actions">
              <el-button type="primary" plain @click="enterManualEdit">
                <el-icon>
                  <Edit />
                </el-icon>
                进一步修补
              </el-button>
              <el-button @click="reset">处理另一张</el-button>
            </div>
          </div>
        </div>

        <div class="settings-panel glass-card">
          <div class="panel-section">
            <h3 class="section-title">
              服务商配置
              <el-tooltip content="抠图功能依赖外部 AI 能力，请先申请 API Key" placement="top">
                <el-icon class="info-icon">
                  <InfoFilled />
                </el-icon>
              </el-tooltip>
            </h3>

            <div class="settings-group">
              <div class="label">选择服务商</div>
              <el-select v-model="apiConfig.provider" class="full-width" @change="onProviderChange">
                <el-option label="系统内置 (推荐-免费)" value="builtin" />
                <el-option label="Remove.bg" value="remove.bg" />
                <el-option label="百度智能云 AI" value="baidu" />
                <el-option label="自定义接口 (Custom)" value="custom" />
              </el-select>
            </div>

            <div v-if="apiConfig.provider === 'builtin'" class="provider-info">
              <p>使用 LRM 工具箱内置的 API 密钥，每月有一定免费额度。</p>
              <p class="text-xs mt-1 color-blue">
                注：内置模式默认输出预览画质 (0.25MP)。如需高清，请配置自己的密钥并开启“高清”选项。
              </p>
              <p class="text-xs mt-1 color-blue">无需配置，直接点击“开始 AI 抠图”即可。</p>
            </div>

            <div v-if="apiConfig.provider === 'baidu'" class="provider-info">
              <p>
                1. 前往
                <a href="https://console.bce.baidu.com/ai/" target="_blank">百度智能云控制台</a>
                创建“人像分割”或“通用物体分割”应用。
              </p>
              <p>2. 获取 API Key 和 Secret Key 填入下方。</p>
            </div>

            <div v-if="apiConfig.provider === 'remove.bg'" class="provider-info">
              <p>
                1. 前往
                <a href="https://www.remove.bg/api" target="_blank">Remove.bg官网</a> 注册并获取 API
                Key
              </p>
              <p>2. 每月提供 50 次免费 API 调用额度</p>
            </div>

            <div
              v-if="apiConfig.provider !== 'adobe' && apiConfig.provider !== 'builtin'"
              class="settings-group"
            >
              <div v-if="apiConfig.provider === 'baidu'">
                <div class="label">Baidu API Key</div>
                <el-input
                  v-model="apiConfig.apiKey"
                  placeholder="输入 Baidu API Key..."
                  show-password
                  clearable
                  class="mb-2"
                />
                <div class="label">Baidu Secret Key</div>
                <el-input
                  v-model="apiConfig.baiduSecret"
                  placeholder="输入 Baidu Secret Key..."
                  show-password
                  clearable
                />
              </div>
              <div v-else>
                <div class="label">
                  {{ apiConfig.provider === 'custom' ? '接口地址' : 'API Key' }}
                </div>
                <el-input
                  v-model="apiConfig.apiKey"
                  :type="apiConfig.provider === 'custom' ? 'text' : 'password'"
                  :placeholder="
                    apiConfig.provider === 'custom'
                      ? 'https://api.example.com/removebg'
                      : '输入您的 API Key...'
                  "
                  show-password
                  clearable
                />
              </div>
            </div>

            <div v-if="apiConfig.provider === 'custom'" class="settings-group">
              <div class="label">自定义 Header (JSON字符串)</div>
              <el-input
                v-model="apiConfig.customHeaders"
                type="textarea"
                :rows="3"
                placeholder='{"Authorization": "Bearer xxx"}'
              />
            </div>
          </div>

          <el-divider />

          <div class="panel-section">
            <h3 class="section-title">输出选项</h3>
            <div class="settings-group">
              <div class="label">输出尺寸</div>
              <el-radio-group v-model="outputConfig.size" size="small">
                <el-radio-button value="preview">普通 (0.25MP)</el-radio-button>
                <el-radio-button value="full">高清 (需要点数)</el-radio-button>
              </el-radio-group>
            </div>

            <div class="settings-group">
              <div class="label">输出文件名</div>
              <el-input
                v-model="outputConfig.filename"
                placeholder="输入自定义文件名 (不含后缀)"
                clearable
              >
                <template #append>.png</template>
              </el-input>
            </div>

            <div class="settings-group mb-4">
              <div class="label-row">
                <div class="label">背景描边</div>
                <el-switch v-model="strokeConfig.enabled" />
              </div>
              <div v-if="strokeConfig.enabled" class="stroke-settings mt-2">
                <div class="setting-item">
                  <span class="sub-label">颜色</span>
                  <el-color-picker v-model="strokeConfig.color" show-alpha />
                </div>
                <div class="setting-item">
                  <span class="sub-label">粗细 ({{ strokeConfig.width }}px)</span>
                  <el-slider
                    v-model="strokeConfig.width"
                    :min="1"
                    :max="50"
                    size="small"
                    style="flex: 1; margin-left: 10px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="security-tip">
            <el-icon>
              <Lock />
            </el-icon>
            <span>API Key 仅保存在浏览器本地，不会上传。接口调用通过浏览器直连。</span>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 图片去背景</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onUnmounted, nextTick, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import {
    ArrowLeft,
    Download,
    PictureFilled,
    MagicStick,
    Loading,
    InfoFilled,
    Lock,
    DArrowLeft,
    DArrowRight,
    Edit
  } from '@element-plus/icons-vue';
  import { useFileHandler } from '@/composables';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const image = ref(null);
  const imageUrl = ref('');
  const resultUrl = ref('');
  const processing = ref(false);
  const sliderPos = ref(50);
  const compareBox = ref(null);
  const isSliding = ref(false);

  const { fileInput, triggerFileInput, handleFileSelect } = useFileHandler({
    accept: 'image/*',
    readMode: 'none',
    onSuccess: result => {
      processFile(result.file);
    }
  });

  const processFile = file => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过 12MB');
      return;
    }

    reset();
    image.value = file;
    imageUrl.value = URL.createObjectURL(file);

    const lastDotIndex = file.name.lastIndexOf('.');
    outputConfig.filename =
      lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) + '_no-bg' : file.name + '_no-bg';
  };

  const editMode = ref('view');
  const editCanvas = ref(null);
  const canvasWrapper = ref(null);
  const brushSize = ref(20);
  const brushType = ref('erase');
  const isDrawing = ref(false);
  const historyStack = ref([]);
  let ctx = null;
  let offscreenCanvas = null;
  let offscreenCtx = null;
  let originalImage = null;

  const apiConfig = reactive({
    provider: localStorage.getItem('bg_remover_provider') || 'builtin',
    apiKey: localStorage.getItem('bg_remover_key') || '',
    baiduSecret: localStorage.getItem('bg_remover_baidu_secret') || '',
    customHeaders: localStorage.getItem('bg_remover_headers') || ''
  });

  const outputConfig = reactive({
    size: 'preview',
    filename: ''
  });

  const strokeConfig = reactive({
    enabled: false,
    color: '#FFFFFF',
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

    localStorage.setItem('bg_remover_key', apiConfig.apiKey);
    if (apiConfig.provider === 'baidu') {
      localStorage.setItem('bg_remover_baidu_secret', apiConfig.baiduSecret);
    }
    if (apiConfig.provider === 'custom') {
      localStorage.setItem('bg_remover_headers', apiConfig.customHeaders);
    }

    try {
      let responseBlob;
      if (apiConfig.provider === 'builtin') {
        responseBlob = await callBuiltinApi();
      } else if (apiConfig.provider === 'remove.bg') {
        responseBlob = await callRemoveBg();
      } else if (apiConfig.provider === 'baidu') {
        responseBlob = await callBaiduAi();
      } else if (apiConfig.provider === 'custom') {
        responseBlob = await callCustomApi();
      } else {
        throw new Error('当前服务商暂不支持直连，请选择其他模式或自定义接口');
      }

      resultUrl.value = URL.createObjectURL(responseBlob);
      ElMessage.success('抠图完成！');
    } catch (err) {
      console.error(err);
      ElMessage.error(err.message || '抠图请求失败，请检查 API Key 或网络环境');
    } finally {
      processing.value = false;
    }
  };

  const callRemoveBg = async () => {
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
      throw new Error(errorData.errors?.[0]?.title || 'Remove.bg 服务调用失败');
    }

    return await response.blob();
  };

  const callBuiltinApi = async () => {
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
      throw new Error(err.errors?.[0]?.title || '内置服务响应错误');
    }
    return await response.blob();
  };

  const callBaiduAi = async () => {
    const tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiConfig.apiKey}&client_secret=${apiConfig.baiduSecret}`;
    const tokenRes = await fetch(tokenUrl);
    if (!tokenRes.ok) throw new Error('百度授权失败，请检查 Key');
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const reader = new FileReader();
    const base64Promise = new Promise(resolve => {
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(image.value);
    });
    const base64Str = await base64Promise;

    const apiUrl = `https://aip.baidubce.com/rest/2.0/image-process/v1/body_seg?access_token=${accessToken}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `image=${encodeURIComponent(base64Str)}`
    });

    if (!response.ok) throw new Error('百度抠图接口调用错误');
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
    const formData = new FormData();

    formData.append('image', image.value);

    let headers = {};
    if (apiConfig.customHeaders) {
      try {
        headers = JSON.parse(apiConfig.customHeaders);
      } catch {
        throw new Error('自定义 Header JSON 格式错误');
      }
    }

    const response = await fetch(apiConfig.apiKey, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`自定义接口返回错误: ${response.status}`);
    }

    return await response.blob();
  };

  const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
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

  const generateStrokedBlob = async (srcUrl, config) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = srcUrl;
      img.onload = () => {
        const padding = config.width * 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width + padding;
        canvas.height = img.height + padding;
        const ctx = canvas.getContext('2d');

        const centerX = padding / 2;
        const centerY = padding / 2;

        const dCanvas = document.createElement('canvas');
        dCanvas.width = canvas.width;
        dCanvas.height = canvas.height;
        const dCtx = dCanvas.getContext('2d');

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

        ctx.drawImage(dCanvas, 0, 0);

        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(img, centerX, centerY);

        canvas.toBlob(blob => resolve(blob), 'image/png');
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

  const reset = () => {
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
    ctx = canvas.getContext('2d');

    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');

    originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';
    originalImage.src = imageUrl.value;

    originalImage.onload = () => {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCtx.drawImage(originalImage, 0, 0);

      if (resultUrl.value) {
        const resImg = new Image();
        resImg.crossOrigin = 'anonymous';
        resImg.src = resultUrl.value;
        resImg.onload = () => {
          ctx.drawImage(resImg, 0, 0, canvas.width, canvas.height);
          saveHistory();
        };
      } else {
        ctx.drawImage(originalImage, 0, 0);
        saveHistory();
      }
    };
  };

  const saveHistory = () => {
    historyStack.value.push(editCanvas.value.toDataURL('image/png'));
    if (historyStack.value.length > 20) historyStack.value.shift();
  };

  const undoEdit = () => {
    if (historyStack.value.length <= 1) return;
    historyStack.value.pop();
    const lastState = historyStack.value[historyStack.value.length - 1];
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      ctx.clearRect(0, 0, editCanvas.value.width, editCanvas.value.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const startDrawing = e => {
    isDrawing.value = true;
    ctx.beginPath();
    const { x, y } = getCoord(e);
    ctx.moveTo(x, y);
  };

  const draw = e => {
    if (!isDrawing.value) return;
    const { x, y } = getCoord(e);

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType.value === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = ctx.createPattern(offscreenCanvas, 'no-repeat');
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.value) return;
    isDrawing.value = false;
    saveHistory();
  };

  const getCoord = e => {
    const canvas = editCanvas.value;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const saveManualEdit = () => {
    if (resultUrl.value) URL.revokeObjectURL(resultUrl.value);

    editCanvas.value.toBlob(
      blob => {
        resultUrl.value = URL.createObjectURL(blob);
        editMode.value = 'view';
        sliderPos.value = 50;
        ElMessage.success('手动编辑已保存 (高分辨率)');
      },
      'image/png',
      1.0
    );
  };

  const startSliding = e => {
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

  const handleSliderMove = e => {
    if (!isSliding.value || !compareBox.value) return;
    const rect = compareBox.value.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    sliderPos.value = Math.max(0, Math.min(100, position));
  };

  onUnmounted(() => {
    reset();
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stroke-settings {
    background: #f8fafc;
    border-radius: 8px;
    padding: 10px;
    border: 1px solid #e2e8f0;
  }

  .setting-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .setting-item:last-child {
    margin-bottom: 0;
  }

  .sub-label {
    font-size: 12px;
    color: #64748b;
    width: 60px;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-center {
    text-align: center;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ai-badge {
    font-size: 0.65rem;
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
    line-height: 1;
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
    grid-template-columns: 1fr 340px;
    gap: 1.5rem;
  }

  .workbench {
    min-height: 500px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .upload-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    margin: 2rem;
    cursor: pointer;
    background: rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
  }

  .upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .upload-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 1rem;
  }

  .remover-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2rem;
  }

  .compare-container {
    flex: 1;
    border-radius: 12px;
    overflow: hidden;
    background: #e2e8f0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .original-box,
  .result-box {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .result-box {
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3Mh4iOGm5/8EEBsYGBgYmJiYBoRQ9M8C6gbSgxwoW39LqAsAt4YSc/+Uis8AAAAASUVORK5CYII=');
  }

  .preview-img {
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tag {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .tag.success {
    background: #10b981;
  }

  .manual-editor-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    border-radius: 12px;
    height: 100%;
  }

  .editor-toolbar {
    padding: 10px 20px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .tool-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tool-group .label {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
  }

  .canvas-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 20px;
    min-height: 400px;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    background: transparent;
    touch-action: none;
  }

  .compare-container.is-dragging {
    cursor: col-resize;
  }

  .slider-compare-box {
    width: 100%;
    height: 100%;
    position: relative;
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
    padding: 20px;
  }

  .original-layer {
    z-index: 2;
    background: #e2e8f0;
  }

  .slider-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: white;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .slider-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    color: #3b82f6;
    gap: -2px;
  }

  .slider-button .el-icon {
    font-size: 14px;
  }

  .compare-tags {
    position: absolute;
    top: 1rem;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 1rem;
    z-index: 20;
    pointer-events: none;
  }

  .compare-tags .tag.left {
    background: rgba(0, 0, 0, 0.5);
  }

  .compare-tags .tag.right {
    background: #10b981;
  }

  .processing-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 10;
  }

  .processing-overlay .el-icon {
    font-size: 2.5rem;
    color: #3b82f6;
  }

  .stage-actions {
    padding: 2rem 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .config-warn {
    color: #f59e0b;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .settings-panel {
    padding: 1.5rem;
    background: #fff;
  }

  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .info-icon {
    color: #94a3b8;
    cursor: help;
    font-size: 0.85rem;
  }

  .settings-group {
    margin-bottom: 1.25rem;
  }

  .label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .provider-info {
    background: #f8fafc;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .provider-info p {
    margin: 0;
    font-size: 0.75rem;
    color: #475569;
    line-height: 1.6;
  }

  .provider-info a {
    color: #3b82f6;
    text-decoration: none;
  }

  .security-tip {
    margin-top: 2rem;
    padding: 1rem;
    background: #f0fdf4;
    border-radius: 8px;
    display: flex;
    gap: 8px;
    color: #166534;
    font-size: 0.75rem;
    line-height: 1.4;
  }

  .security-tip .el-icon {
    margin-top: 2px;
    flex-shrink: 0;
  }

  .full-width {
    width: 100%;
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
