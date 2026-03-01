<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- ▸ 顶部标题栏 -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">JS 混淆工具<span>.obfuscate()</span></h1>
      </header>

      <!-- ▸ 操作工具栏 -->
      <div class="brutal-toolbar">
        <div class="tools-left">
          <div class="mode-selector">
            <span class="label">混淆模式：</span>
            <div class="brutal-radio-group">
              <label
                v-for="(mode, key) in MODES"
                :key="key"
                :class="['brutal-radio', { active: selectedMode === key }]"
              >
                <input v-model="selectedMode" :value="key" type="radio" />
                {{ mode.name }}
              </label>
            </div>
          </div>
        </div>
        <div class="tools-right">
          <div class="tab-switcher">
            <button
              :class="['tab-btn', { active: activeTab === 'text' }]"
              @click="activeTab = 'text'"
            >
              代码模式
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'file' }]"
              @click="activeTab = 'file'"
            >
              文件模式
            </button>
          </div>
        </div>
      </div>

      <!-- ▸ 主内容区 -->
      <div class="brutal-grid">
        <div class="grid-layout">
          <!-- 1. 代码模式视图 -->
          <template v-if="activeTab === 'text'">
            <div class="brutal-pane">
              <div class="pane-header bg-yellow">
                <span>源代码 (JavaScript)</span>
                <div class="pane-actions">
                  <button class="pane-action" @click="triggerInputUpload">上传文件</button>
                  <button :disabled="!inputCode" class="pane-action" @click="copyInput">
                    复制
                  </button>
                  <button class="pane-action" @click="clearInput">清空</button>
                </div>
                <!-- 隐藏的 input -->
                <input
                  ref="sourceFileInput"
                  type="file"
                  accept=".js"
                  style="display: none"
                  @change="handleSourceFileChange"
                />
              </div>
              <div class="pane-body no-padding">
                <textarea
                  v-model="inputCode"
                  placeholder="在此粘贴或拖入 JavaScript 代码文件..."
                  class="brutal-textarea"
                  @dragover.prevent
                  @drop.prevent="handleTextareaDrop"
                ></textarea>
              </div>
            </div>

            <div class="brutal-pane">
              <div class="pane-header bg-blue">
                <span>混淆结果</span>
                <div class="pane-actions">
                  <button :disabled="!outputCode" class="pane-action" @click="copyResult">
                    复制
                  </button>
                  <button :disabled="!outputCode" class="pane-action" @click="downloadResult">
                    下载
                  </button>
                </div>
              </div>
              <div class="pane-body no-padding">
                <textarea
                  v-model="outputCode"
                  readonly
                  placeholder="混淆后的代码将显示在这里..."
                  class="brutal-textarea result-area"
                ></textarea>
              </div>
            </div>
          </template>

          <!-- 2. 文件模式视图 -->
          <template v-else>
            <div class="brutal-pane full-width">
              <div class="pane-header bg-yellow">
                <span>批量文件混淆</span>
                <div class="pane-actions">
                  <button v-if="fileList.length > 0" class="pane-action" @click="clearFiles">
                    清空列表
                  </button>
                </div>
              </div>
              <div class="pane-body">
                <ObfuscatorUpload @select="addFiles" />

                <ObfuscatorFileList
                  v-if="fileList.length > 0"
                  :file-list="fileList"
                  :is-processing="isBatchProcessing"
                  @remove="removeFile"
                  @preview="handlePreview"
                />

                <div v-if="fileList.length > 0" class="batch-actions mt-4">
                  <button
                    class="brutal-btn bg-green full-btn"
                    :disabled="isBatchProcessing"
                    @click="startBatchObfuscate"
                  >
                    {{ isBatchProcessing ? '批量处理中...' : '启动批量维度坍缩' }}
                  </button>
                  <button
                    v-if="hasFinishedFiles"
                    class="brutal-btn bg-blue full-btn mt-2"
                    @click="downloadAllAsZip"
                  >
                    打包并下载全部 (.zip)
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 侧边说明面板 -->
        <div class="brutal-pane info-pane">
          <div class="pane-header bg-pink">
            <span>配置选项：{{ currentMode.name }}</span>
          </div>
          <div class="pane-body">
            <p class="mode-desc">{{ currentMode.desc }}</p>

            <button
              v-if="activeTab === 'text'"
              :disabled="isObfuscating"
              class="brutal-btn bg-green full-btn mb-4"
              @click="obfuscateText"
            >
              {{ isObfuscating ? '混淆中...' : '开始混淆' }}
            </button>

            <!-- 选项预览/详细参数 -->
            <div v-if="selectedMode !== 'custom'" class="options-preview-container">
              <h4 class="preview-title">策略详情 (Strategy):</h4>
              <div class="options-preview">
                <div
                  v-for="(val, key) in activeOptions"
                  :key="key"
                  class="option-tag"
                  :class="{ 'is-true': val === true, 'is-false': val === false }"
                >
                  <span class="opt-key">{{ key }}:</span>
                  <span class="opt-val">{{ val }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedMode === 'custom'" class="custom-options">
              <!-- 自定义表单部分保持不变，但使用 Composable 中的 customOptions -->
              <div class="option-item">
                <label>紧凑模式 (Compact)</label>
                <input v-model="customOptions.compact" type="checkbox" />
              </div>
              <div class="option-item">
                <label>控制流扁平化</label>
                <input v-model="customOptions.controlFlowFlattening" type="checkbox" />
              </div>
              <div class="option-item">
                <label>死代码注入</label>
                <input v-model="customOptions.deadCodeInjection" type="checkbox" />
              </div>
              <div class="option-item">
                <label>数字转表达式</label>
                <input v-model="customOptions.numbersToExpressions" type="checkbox" />
              </div>
              <div class="option-item">
                <label>Unicode 转义</label>
                <input v-model="customOptions.unicodeEscapeSequence" type="checkbox" />
              </div>
              <div class="option-item">
                <label>代码自保护</label>
                <input v-model="customOptions.selfDefending" type="checkbox" />
              </div>
              <div class="option-item">
                <label>禁用调试 (Debug)</label>
                <input v-model="customOptions.debugProtection" type="checkbox" />
              </div>
              <div class="option-item">
                <label>字符串拆分</label>
                <input v-model="customOptions.splitStrings" type="checkbox" />
              </div>
              <div class="option-item">
                <label>字符串池 (Array)</label>
                <input v-model="customOptions.stringArray" type="checkbox" />
              </div>
              <div class="option-item">
                <label>字符串加密</label>
                <select v-model="customOptions.stringArrayEncoding" class="brutal-select">
                  <option :value="[]">无 (None)</option>
                  <option :value="['base64']">Base64</option>
                  <option :value="['rc4']">RC4</option>
                </select>
              </div>
              <div class="option-item">
                <label>变量名混淆</label>
                <select v-model="customOptions.identifierNamesGenerator" class="brutal-select">
                  <option value="hexadecimal">十六进制</option>
                  <option value="mangled">简短字符</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ▸ 底部状态栏 -->
      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">
              🔒 浏览器端本地混淆，代码不上传云端 // 安全、隐私、高效 // 支持 ES6+ 语法 //
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ▸ 预览对比弹窗 (Modal) -->
    <div v-if="showPreview" class="brutal-modal-overlay" @click.self="showPreview = false">
      <div class="brutal-modal">
        <header class="modal-header">
          <span class="modal-title">内容预览对比: {{ previewFile?.file.name }}</span>
          <button class="close-btn" @click="showPreview = false">✕</button>
        </header>
        <div class="modal-body">
          <div class="preview-split">
            <div class="preview-pane">
              <div class="pane-label bg-yellow">原始代码</div>
              <pre class="code-view">{{ originalCodePreview }}</pre>
            </div>
            <div class="preview-pane">
              <div class="pane-label bg-green">混淆后</div>
              <pre v-if="previewFile?.status === 'done'" class="code-view">{{
                previewFile.obfuscatedCode
              }}</pre>
              <div v-else class="preview-placeholder">
                {{ previewFile?.status === 'processing' ? '正在压缩维度...' : '尚未开始混淆' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { MODES } from './JSObfuscator/types';
  import { useJSObfuscator } from './JSObfuscator/useJSObfuscator';
  import type { JSFileItem } from './JSObfuscator/types';
  import ObfuscatorUpload from './JSObfuscator/ObfuscatorUpload.vue';
  import ObfuscatorFileList from './JSObfuscator/ObfuscatorFileList.vue';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const activeTab = ref<'text' | 'file'>('text');
  const sourceFileInput = ref<HTMLInputElement | null>(null);

  // 预览状态
  const showPreview = ref(false);
  const previewFile = ref<JSFileItem | null>(null);
  const originalCodePreview = ref('');

  const {
    inputCode,
    outputCode,
    isObfuscating,
    selectedMode,
    fileList,
    isBatchProcessing,
    customOptions,
    currentMode,
    activeOptions,
    obfuscateText,
    addFiles,
    removeFile,
    clearFiles,
    startBatchObfuscate,
    downloadAllAsZip
  } = useJSObfuscator();

  const hasFinishedFiles = computed(() => fileList.value.some(f => f.status === 'done'));

  const handleTextareaDrop = (e: DragEvent) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.js')) {
      ElMessage.warning('仅支持 .js 文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      inputCode.value = reader.result as string;
      ElMessage.success('文件内容已加载');
    };
    reader.readAsText(file);
  };

  const handlePreview = async (item: JSFileItem) => {
    previewFile.value = item;
    showPreview.value = true;
    originalCodePreview.value = '正在读取原始代码...';

    const reader = new FileReader();
    reader.onload = () => {
      originalCodePreview.value = reader.result as string;
    };
    reader.readAsText(item.file);
  };

  const triggerInputUpload = () => {
    sourceFileInput.value?.click();
  };

  const handleSourceFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      inputCode.value = reader.result as string;
      ElMessage.success('文件内容已加载');
    };
    reader.readAsText(file);
    // 重置 input 以便下次选择同一文件
    target.value = '';
  };

  const clearInput = () => {
    inputCode.value = '';
    outputCode.value = '';
  };

  const copyInput = () => {
    if (!inputCode.value) return;
    navigator.clipboard.writeText(inputCode.value).then(() => {
      ElMessage.success('源代码已复制到剪贴板');
    });
  };

  const copyResult = () => {
    if (!outputCode.value) return;
    navigator.clipboard.writeText(outputCode.value).then(() => {
      ElMessage.success('结果已复制到剪贴板');
    });
  };

  const downloadResult = () => {
    if (!outputCode.value) return;
    const blob = new Blob([outputCode.value], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obfuscated_${Date.now()}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@800&display=swap');

  .brutal-wrapper {
    min-height: 100vh;
    background: #f0f0f0;
    padding: 2rem;
    font-family: 'Space Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1400px;
    margin: 0 auto;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
  }

  /* 标题栏 */
  .brutal-header {
    background: #111;
    color: #fff;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    border-bottom: 4px solid #111;
  }

  .back-btn {
    background: #fff;
    color: #111;
    padding: 0.5rem 1rem;
    font-weight: 800;
  }

  .brutal-title {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    margin: 0;
    text-shadow: 2px 2px 0 #ff4b4b;
  }

  .brutal-title span {
    font-size: 1rem;
    opacity: 0.7;
    margin-left: 0.5rem;
  }

  /* 工具栏 */
  .brutal-toolbar {
    padding: 1rem 1.5rem;
    background: #ffd900;
    border-bottom: 4px solid #111;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .tools-left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .mode-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .label {
    font-weight: 800;
    font-size: 1rem;
  }

  .brutal-radio-group {
    display: flex;
    gap: 0.5rem;
  }

  .brutal-radio {
    background: #fff;
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0 #111;
    transition: all 0.1s;
    user-select: none;
  }

  .brutal-radio:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0 #111;
  }

  .brutal-radio.active {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  .brutal-radio input {
    display: none;
  }

  .tab-switcher {
    display: flex;
    gap: 10px;
    background: rgba(0, 0, 0, 0.1);
    padding: 4px;
    border-radius: 4px;
  }

  .tab-btn {
    border: 2px solid #111;
    background: white;
    padding: 6px 16px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab-btn.active {
    background: #111;
    color: white;
  }

  /* 主内容网格 */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 350px;
    min-height: 600px;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-right: 4px solid #111;
  }

  @media (max-width: 1100px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .grid-layout {
      grid-template-columns: 1fr;
      border-right: none;
    }
    .info-pane {
      border-top: 4px solid #111;
    }
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border-bottom: 4px solid #111;
  }

  .brutal-pane.full-width {
    grid-column: span 2;
  }

  .grid-layout .brutal-pane:first-child {
    border-right: 4px solid #111;
  }

  @media (max-width: 1100px) {
    .grid-layout .brutal-pane:first-child {
      border-right: none;
    }
    .brutal-pane.full-width {
      grid-column: span 1;
    }
  }

  .pane-header {
    padding: 0.75rem 1rem;
    border-bottom: 4px solid #111;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }

  .pane-action {
    background: #fff;
    border: 2px solid #111;
    padding: 0.2rem 0.6rem;
    font-weight: 800;
    font-size: 0.8rem;
    cursor: pointer;
    box-shadow: 2px 2px 0 #111;
  }

  .pane-action:hover:not(:disabled) {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #111;
  }

  .pane-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pane-body {
    padding: 1.5rem;
    flex: 1;
  }

  .pane-body.no-padding {
    padding: 0;
  }

  /* 文本域 */
  .brutal-textarea {
    width: 100%;
    height: 100%;
    min-height: 500px;
    border: none;
    padding: 1.5rem;
    font-family: 'Space Mono', monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    resize: none;
    outline: none;
    background-color: #fafafa;
  }

  .result-area {
    background-color: #f8f9fa;
  }

  /* 辅助背景色 */
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #19d4ff;
    color: #111;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }
  .bg-pink {
    background: #ff9ecf;
  }

  /* 说明面板 */
  .info-pane {
    background: #fff;
  }

  .mode-desc {
    font-weight: 700;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    color: #444;
  }

  /* 说明面板配置预览 */
  .options-preview-container {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 3px dashed #111;
  }

  .preview-title {
    font-size: 0.9rem;
    font-weight: 800;
    margin: 0 0 0.8rem 0;
    color: #111;
    text-transform: uppercase;
  }

  .options-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .option-tag {
    background: #fff;
    padding: 3px 6px;
    font-size: 0.7rem;
    border: 2px solid #111;
    font-family: 'Space Mono', monospace;
    display: flex;
    gap: 4px;
    box-shadow: 2px 2px 0 #111;
  }

  .opt-key {
    color: #666;
    font-weight: bold;
  }

  .opt-val {
    font-weight: 800;
  }

  .option-tag.is-true {
    background: #e6fffa;
    border-color: #38b2ac;
  }
  .option-tag.is-true .opt-val {
    color: #2c7a7b;
  }

  .option-tag.is-false {
    background: #fff5f5;
    border-color: #feb2b2;
  }
  .option-tag.is-false .opt-val {
    color: #c53030;
  }

  /* 自定义选项表单 */
  .custom-options {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px dashed #ccc;
  }

  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .option-item label {
    font-size: 0.85rem;
    font-weight: 800;
    line-height: 1.2;
    word-break: break-all;
    flex: 1;
  }

  .option-item input[type='checkbox'] {
    width: 20px;
    height: 20px;
    border: 3px solid #111;
    cursor: pointer;
  }

  .brutal-select {
    border: 2px solid #111;
    padding: 4px;
    font-weight: 800;
    font-family: inherit;
    outline: none;
    max-width: 120px;
  }

  /* 按钮通用 */
  .brutal-btn {
    border: 4px solid #111;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition: all 0.1s;
    font-family: 'Syne', sans-serif;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }

  .brutal-btn:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: none;
  }

  .brutal-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #ccc;
  }

  .full-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 900;
  }

  /* 跑马灯 */
  .brutal-status {
    border-bottom: 4px solid #111;
    overflow: hidden;
    background: #111;
    color: #fff;
    height: 48px;
    display: flex;
    align-items: center;
  }

  .marquee-wrapper {
    display: flex;
    width: 100%;
  }

  .marquee-content {
    display: flex;
    white-space: nowrap;
    animation: marquee 30s linear infinite;
    font-weight: 800;
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .marquee-content span {
    padding: 0 2rem;
  }

  /* Modal 弹窗样式 */
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .brutal-modal {
    width: 90vw;
    max-width: 1200px;
    height: 85vh;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 16px 16px 0 #111;
    display: flex;
    flex-direction: column;
    animation: modal-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes modal-pop {
    0% {
      transform: scale(0.9);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .modal-header {
    background: #111;
    color: #fff;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid #111;
  }

  .modal-title {
    font-weight: 800;
    font-size: 1.2rem;
  }

  .close-btn {
    background: #ff4b4b;
    border: 3px solid #111;
    color: #fff;
    width: 32px;
    height: 32px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 2px 2px 0 #000;
  }

  .close-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #000;
  }

  .modal-body {
    flex: 1;
    overflow: hidden;
    padding: 1rem;
    background: #f0f0f0;
  }

  .preview-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    height: 100%;
  }

  .preview-pane {
    background: #fff;
    border: 3px solid #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-label {
    padding: 0.5rem 1rem;
    font-weight: 800;
    border-bottom: 3px solid #111;
    font-size: 0.9rem;
  }

  .code-view {
    margin: 0;
    padding: 1rem;
    flex: 1;
    overflow: auto;
    font-family: 'Space Mono', monospace;
    font-size: 0.85rem;
    line-height: 1.5;
    background: #fff;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .preview-placeholder {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    color: #888;
    background: #eee;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
</style>
