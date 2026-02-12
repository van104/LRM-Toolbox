<template>
  <div class="barcode-generator-tool">
    <div class="nav-header">
      <button class="back-btn" @click="goBack">
        <el-icon>
          <Back />
        </el-icon>
        <span>返回</span>
      </button>
    </div>

    <div class="tool-header">
      <h1 class="font-display">条形码生成器</h1>
      <p class="summary">生成多种格式的条形码，支持自定义样式和实时预览</p>
    </div>

    <div class="tool-content">
      <div class="controls-panel glass-card">
        <div class="form-group">
          <label>条码内容</label>
          <textarea
            v-model="barcodeValue"
            class="input-area"
            placeholder="请输入条形码内容..."
            rows="2"
          ></textarea>
        </div>

        <div class="form-group">
          <label>格式</label>
          <select v-model="barcodeFormat" class="select-input">
            <option value="CODE128">CODE128 (Auto)</option>
            <option value="EAN13">EAN-13</option>
            <option value="UPC">UPC</option>
            <option value="EAN8">EAN-8</option>
            <option value="EAN5">EAN-5</option>
            <option value="EAN2">EAN-2</option>
            <option value="CODE39">CODE39</option>
            <option value="ITF14">ITF-14</option>
            <option value="MSI">MSI</option>
            <option value="pharmacode">Pharmacode</option>
          </select>
        </div>

        <div class="settings-grid">
          <div class="form-group">
            <label>宽度 (Width)</label>
            <input
              v-model.number="barcodeWidth"
              type="number"
              min="1"
              max="4"
              step="0.5"
              class="number-input"
            />
          </div>
          <div class="form-group">
            <label>高度 (Height)</label>
            <input
              v-model.number="barcodeHeight"
              type="number"
              min="10"
              max="150"
              step="5"
              class="number-input"
            />
          </div>
          <div class="form-group">
            <label>条码颜色</label>
            <input v-model="lineColor" type="color" class="color-input" />
          </div>
          <div class="form-group">
            <label>背景颜色</label>
            <input v-model="background" type="color" class="color-input" />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input v-model="displayValue" type="checkbox" />
            显示文本内容
          </label>
        </div>

        <div class="action-buttons">
          <button class="btn-download" :disabled="!isValid" @click="downloadBarcode">
            <el-icon>
              <Download />
            </el-icon>
            下载图片
          </button>
        </div>
      </div>

      <div class="preview-panel glass-card">
        <div class="preview-header">
          <h3>实时预览</h3>
        </div>
        <div ref="barcodeContainer" class="barcode-container">
          <svg ref="barcodeSvg"></svg>
          <div v-if="!isValid && barcodeValue" class="error-msg">该内容不符合选定格式的要求</div>
          <div v-if="!barcodeValue" class="empty-msg">请输入内容以生成条形码</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Back, Download } from '@element-plus/icons-vue';
  import JsBarcode from 'jsbarcode';

  const router = useRouter();

  const barcodeValue = ref('1234567890');
  const barcodeFormat = ref('CODE128');
  const barcodeWidth = ref(2);
  const barcodeHeight = ref(100);
  const displayValue = ref(true);
  const lineColor = ref('#000000');
  const background = ref('#ffffff');
  const isValid = ref(true);

  const barcodeSvg = ref(null);

  const generateBarcode = () => {
    if (!barcodeValue.value) {
      isValid.value = false;

      if (barcodeSvg.value) barcodeSvg.value.innerHTML = '';
      return;
    }

    try {
      JsBarcode(barcodeSvg.value, barcodeValue.value, {
        format: barcodeFormat.value,
        lineColor: lineColor.value,
        background: background.value,
        width: barcodeWidth.value,
        height: barcodeHeight.value,
        displayValue: displayValue.value,
        margin: 10
      });
      isValid.value = true;
    } catch (e) {
      console.warn('Barcode generation failed:', e);
      isValid.value = false;
    }
  };

  watch(
    [barcodeValue, barcodeFormat, barcodeWidth, barcodeHeight, displayValue, lineColor, background],
    () => {
      generateBarcode();
    }
  );

  onMounted(() => {
    generateBarcode();
  });

  const downloadBarcode = () => {
    if (!barcodeSvg.value || !isValid.value) return;

    const svgData = new XMLSerializer().serializeToString(barcodeSvg.value);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `barcode-${barcodeValue.value}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };
</script>

<style scoped>
  .barcode-generator-tool {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .nav-header {
    margin-bottom: 20px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 1rem;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-btn:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--text-primary);
  }

  .tool-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .tool-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 16px;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .summary {
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .tool-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
  }

  @media (max-width: 768px) {
    .tool-content {
      grid-template-columns: 1fr;
    }
  }

  .glass-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .form-group {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.95rem;
  }

  .input-area,
  .select-input,
  .number-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg-secondary);
    transition: all 0.2s;
  }

  .input-area:focus,
  .select-input:focus,
  .number-input:focus {
    outline: none;
    border-color: var(--accent-purple);
    background: white;
  }

  .number-input {
    padding-right: 4px;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .color-input {
    width: 100%;
    height: 42px;
    padding: 2px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
  }

  .checkbox-group {
    flex-direction: row;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .action-buttons {
    margin-top: 30px;
  }

  .btn-download {
    width: 100%;
    padding: 12px;
    background: var(--accent-gradient);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
  }

  .btn-download:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .btn-download:disabled {
    background: var(--bg-secondary);
    color: var(--text-muted);
    cursor: not-allowed;
  }

  .preview-panel {
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .preview-header h3 {
    margin-bottom: 20px;
    font-size: 1.1rem;
    color: var(--text-secondary);
  }

  .barcode-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 20px;
    overflow: hidden;
    position: relative;
  }

  .error-msg {
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
  }

  .empty-msg {
    color: var(--text-muted);
    font-size: 0.9rem;
  }
</style>
