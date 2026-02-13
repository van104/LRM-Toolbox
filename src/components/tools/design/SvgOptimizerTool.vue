<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">SVG 压缩工具</h1>
        <span class="tool-subtitle">SVG Optimizer</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :disabled="!optimizedSvg" @click="downloadSvg">
          <el-icon><Download /></el-icon>
          下载处理后
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧输入与选项 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Upload /></el-icon> 输入内容
            </h2>

            <div class="input-container">
              <textarea
                v-model="inputSvg"
                class="svg-textarea"
                placeholder="在此粘贴 <svg>...</svg> 代码..."
                @input="handleInput"
              ></textarea>

              <div class="upload-actions">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".svg"
                  :on-change="handleFileUpload"
                >
                  <button class="btn-secondary-sm">上传 SVG</button>
                </el-upload>
                <button
                  class="btn-link-sm"
                  @click="
                    inputSvg = demoSvg;
                    handleInput();
                  "
                >
                  使用示例
                </button>
              </div>
            </div>

            <div class="options-section mt-8">
              <h3 class="section-label">优化选项</h3>
              <div class="options-grid">
                <label v-for="opt in availableOptions" :key="opt.id" class="option-checkbox">
                  <input v-model="options" type="checkbox" :value="opt.id" @change="optimize" />
                  <span class="checkbox-custom"></span>
                  <span class="option-label">{{ opt.label }}</span>
                </label>
              </div>
            </div>

            <div class="actions-group mt-8">
              <button class="btn-primary" :disabled="!optimizedSvg" @click="copyCode">
                <el-icon><CopyDocument /></el-icon> 复制代码
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="tool-main">
          <div v-if="optimizedSvg" class="panel glass-card">
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-label">原始大小</span>
                <span class="stat-value">{{ formatSize(originalSize) }}</span>
              </div>
              <div class="stat-arrow">
                <el-icon><Right /></el-icon>
              </div>
              <div class="stat-box">
                <span class="stat-label">压缩后</span>
                <span class="stat-value success">{{ formatSize(optimizedSize) }}</span>
              </div>
              <div class="stat-box reduction">
                <span class="stat-label">压缩率</span>
                <span class="stat-value highlight">{{ reductionPercentage }}%</span>
              </div>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <div class="panel-header-row">
              <h2 class="panel-title">实时预览</h2>
              <div class="preview-controls">
                <div class="toggle-bg">
                  <span class="toggle-label">透明格</span>
                  <el-switch v-model="showBg" size="small" />
                </div>
                <div class="zoom-controls">
                  <button class="zoom-btn" @click="zoom = Math.max(0.1, zoom - 0.2)">-</button>
                  <span class="zoom-val">{{ Math.round(zoom * 100) }}%</span>
                  <button class="zoom-btn" @click="zoom += 0.2">+</button>
                </div>
              </div>
            </div>

            <div class="preview-box" :class="{ checkered: showBg }">
              <!-- eslint-disable vue/no-v-html -->
              <div
                v-if="optimizedSvg"
                :style="{ transform: `scale(${zoom})` }"
                class="svg-render"
                v-html="safeOptimizedSvg"
              ></div>
              <!-- eslint-enable vue/no-v-html -->
              <div v-else class="empty-preview">
                <el-icon class="empty-icon"><Picture /></el-icon>
                <span>等待输入 SVG 代码</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - SVG 压缩工具</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ElMessage } from 'element-plus';
  import {
    ArrowLeft,
    Upload,
    Download,
    CopyDocument,
    Right,
    Picture
  } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';
  import DOMPurify from 'dompurify';

  const { copyToClipboard } = useCopy();

  const inputSvg = ref('');
  const optimizedSvg = ref('');
  const originalSize = ref(0);
  const optimizedSize = ref(0);
  const options = ref(['removeComments', 'removeMetadata', 'minifyWhitespace', 'roundPoints']);
  const showBg = ref(true);
  const zoom = ref(1);

  const availableOptions = [
    { id: 'removeComments', label: '移除注释' },
    { id: 'removeMetadata', label: '移除元数据' },
    { id: 'removeUselessStroke', label: '移除冗余描边' },
    { id: 'minifyWhitespace', label: '精简空格' },
    { id: 'roundPoints', label: '保留 1 位小数' }
  ];

  const safeOptimizedSvg = computed(() => {
    return DOMPurify.sanitize(optimizedSvg.value, {
      USE_PROFILES: { svg: true, svgFilters: true }
    });
  });

  const reductionPercentage = computed(() => {
    if (originalSize.value === 0) return 0;
    return Math.round(((originalSize.value - optimizedSize.value) / originalSize.value) * 100);
  });

  const handleInput = () => {
    if (!inputSvg.value.trim()) {
      optimizedSvg.value = '';
      return;
    }
    originalSize.value = new Blob([inputSvg.value]).size;
    optimize();
  };

  const handleFileUpload = (file: { raw: File }) => {
    const reader = new FileReader();
    reader.onload = e => {
      inputSvg.value = e.target?.result as string;
      handleInput();
    };
    reader.readAsText(file.raw);
  };

  const optimize = () => {
    let code = inputSvg.value;
    code = code.replace(/<\?xml.*?\?>/gi, '');
    if (options.value.includes('removeComments')) code = code.replace(/<!--[\s\S]*?-->/g, '');
    if (options.value.includes('removeMetadata')) {
      code = code.replace(/<(metadata|desc|title)[\s\S]*?<\/\1>/gi, '');
      code = code.replace(/<!DOCTYPE.*?>/gi, '');
    }
    if (options.value.includes('roundPoints')) {
      code = code.replace(/(\d+\.\d{2,})/g, match => parseFloat(match).toFixed(1));
    }
    if (options.value.includes('removeUselessStroke')) {
      code = code.replace(/stroke="none"/gi, '').replace(/stroke-width="0"/gi, '');
    }
    if (options.value.includes('minifyWhitespace')) {
      code = code.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    }
    optimizedSvg.value = code;
    optimizedSize.value = new Blob([code]).size;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const downloadSvg = () => {
    const blob = new Blob([optimizedSvg.value], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('压缩文件已下载');
  };

  const copyCode = async () => {
    await copyToClipboard(optimizedSvg.value, {
      success: 'SVG 代码已复制'
    });
  };

  const demoSvg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Author: LRM Toolbox -->
  <metadata>Demo SVG File</metadata>
  <circle cx="50.123" cy="50.456" r="40" fill="#3b82f6" />
  <rect x="30" y="30" width="40" height="40" fill="white" fill-opacity="0.3" />
</svg>`;
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

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
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

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 1.5rem;
      align-items: start;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .svg-textarea {
    width: 100%;
    height: 240px;
    padding: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-family: monospace;
    font-size: 0.9rem;
    resize: vertical;
    outline: none;
    color: #475569;
  }

  .svg-textarea:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: white;
  }

  .upload-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn-secondary-sm {
    padding: 6px 12px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    color: #475569;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .btn-link-sm {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .section-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .option-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #475569;
  }

  .option-checkbox input {
    display: none;
  }

  .checkbox-custom {
    width: 18px;
    height: 18px;
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    position: relative;
    transition: all 0.2s;
  }

  .option-checkbox input:checked + .checkbox-custom {
    background: #3b82f6;
    border-color: #3b82f6;
  }

  .option-checkbox input:checked + .checkbox-custom::after {
    content: '✓';
    color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
  }

  .btn-primary {
    width: 100%;
    padding: 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  .stats-grid {
    display: flex;
    justify-content: space-around;
    align-items: center;
    text-align: center;
  }

  .stat-box {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
  }

  .stat-value.success {
    color: #10b981;
  }

  .stat-value.highlight {
    color: #3b82f6;
    font-size: 1.5rem;
  }

  .stat-arrow {
    color: #cbd5e1;
    font-size: 1.2rem;
  }

  .panel-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .preview-controls {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .toggle-bg {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-label {
    font-size: 0.8rem;
    color: #64748b;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    background: #f1f5f9;
    padding: 2px;
    border-radius: 6px;
  }

  .zoom-btn {
    width: 28px;
    height: 24px;
    border: none;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    color: #475569;
    font-weight: 700;
  }

  .zoom-val {
    min-width: 44px;
    text-align: center;
    font-size: 0.8rem;
    font-family: monospace;
    font-weight: 600;
    color: #64748b;
  }

  .preview-box {
    width: 100%;
    height: 400px;
    background: white;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .preview-box.checkered {
    background-image:
      linear-gradient(45deg, #f8fafc 25%, transparent 25%),
      linear-gradient(-45deg, #f8fafc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f8fafc 75%),
      linear-gradient(-45deg, transparent 75%, #f8fafc 75%);
    background-size: 20px 20px;
    background-position:
      0 0,
      0 10px,
      10px -10px,
      -10px 0px;
  }

  .svg-render {
    max-width: 90%;
    max-height: 90%;
    display: flex;
    transition: transform 0.2s;
  }

  .empty-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #cbd5e1;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-8 {
    margin-top: 2rem;
  }

  @media (max-width: 640px) {
    .tool-title {
      font-size: 1.1rem;
    }
    .header-left,
    .header-right {
      width: 80px;
    }
  }
</style>
