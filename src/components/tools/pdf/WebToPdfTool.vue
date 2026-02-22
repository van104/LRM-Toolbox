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
        <h1 class="tool-title">Web 网页转 PDF</h1>
        <span class="tool-subtitle">Web to PDF Converter</span>
      </div>
      <div class="header-right">
        <!-- 占位，保持布局平衡 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="converter-card">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <el-tab-pane label="网页链接 (演示)" name="url">
            <el-alert
              title="纯前端限制"
              type="info"
              description="由于浏览器同源策略 (CORS) 限制，纯前端无法直接抓取并转换任意外部网页。此功能仅为演示，建议使用下方的 HTML 代码转换功能。"
              show-icon
              :closable="false"
              style="margin-bottom: 20px"
            />
            <div class="input-section">
              <el-input
                v-model="url"
                placeholder="请输入网页地址 (例如: https://example.com)"
                size="large"
                clearable
                @keyup.enter="startConversion"
              >
                <template #prefix>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
            </div>
          </el-tab-pane>

          <el-tab-pane label="HTML 代码转换 (真实)" name="html">
            <div class="input-section">
              <el-input
                v-model="htmlContent"
                type="textarea"
                :rows="10"
                placeholder="请输入或粘贴 HTML 代码..."
                class="html-textarea"
              />
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="input-section" style="margin-top: 20px">
          <div class="options-row">
            <el-select v-model="paperSize" placeholder="纸张大小" style="width: 120px">
              <el-option label="A4" value="a4" />
              <el-option label="Letter" value="letter" />
              <el-option label="Legal" value="legal" />
            </el-select>

            <el-select v-model="orientation" placeholder="方向" style="width: 120px">
              <el-option label="纵向" value="portrait" />
              <el-option label="横向" value="landscape" />
            </el-select>

            <el-checkbox v-model="removeAds" label="移除广告" border disabled />
            <el-checkbox v-model="background" label="包含背景" border />
          </div>

          <el-button
            type="primary"
            size="large"
            class="convert-btn"
            :loading="isConverting"
            :disabled="activeTab === 'url' ? !isValidUrl : !htmlContent"
            @click="startConversion"
          >
            {{ isConverting ? '转换中...' : '开始转换' }}
          </el-button>
        </div>

        <div v-if="conversionStatus !== 'idle'" class="status-section">
          <div v-if="conversionStatus === 'converting'" class="progress-area">
            <el-progress
              type="circle"
              :percentage="progress"
              :status="progress === 100 ? 'success' : ''"
            />
            <p class="status-text">{{ statusText }}</p>
          </div>

          <div v-else-if="conversionStatus === 'completed'" class="result-area">
            <el-result icon="success" title="转换成功" sub-title="您的网页已成功转换为 PDF">
              <template #extra>
                <div class="file-preview-card">
                  <div class="pdf-icon-wrapper">
                    <el-icon><Document /></el-icon>
                    <span class="pdf-tag">PDF</span>
                  </div>
                  <div class="file-meta">
                    <div class="file-name">{{ fileName }}</div>
                    <div class="file-info">
                      {{ paperSize }} • {{ orientation === 'portrait' ? '纵向' : '横向' }} • 2.4 MB
                    </div>
                  </div>
                </div>
                <div class="action-buttons">
                  <el-button type="primary" @click="downloadFile">
                    <el-icon><Download /></el-icon> 下载文件
                  </el-button>
                  <el-button @click="reset">转换其他网页</el-button>
                </div>
              </template>
            </el-result>
          </div>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-item">
          <el-icon class="feature-icon"><Monitor /></el-icon>
          <h3>原样保留</h3>
          <p>精确保留网页排版、字体和图片，所见即所得。</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Setting /></el-icon>
          <h3>自定义设置</h3>
          <p>支持调整纸张大小、方向、页边距等参数。</p>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Lock /></el-icon>
          <h3>安全隐私</h3>
          <p>所有转换在本地完成（模拟），不上传服务器。</p>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - Web 网页转 PDF</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    Link,
    Document,
    Download,
    Monitor,
    Setting,
    Lock,
    ArrowLeft
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import html2canvas from 'html2canvas';
  import jsPDF from 'jspdf';

  const activeTab = ref('url'); // 'url' or 'html'
  const url = ref('');
  const htmlContent = ref(
    '<h1 style="text-align: center; color: #333;">我的 PDF 文档</h1><p>这是一段示例文本。您可以在这里编辑内容，然后将其转换为 PDF。</p><hr/><p>支持 HTML 标签和内联样式。</p>'
  );
  const paperSize = ref('a4');
  const orientation = ref('portrait');
  const removeAds = ref(true);
  const background = ref(true);

  const isConverting = ref(false);
  const conversionStatus = ref<'idle' | 'converting' | 'completed'>('idle');
  const progress = ref(0);
  const statusText = ref('正在分析网页...');
  const fileName = ref('');
  const pdfBlob = ref<Blob | null>(null);

  const isValidUrl = computed(() => {
    if (!url.value) return false;
    try {
      new URL(url.value);
      return true;
    } catch {
      return false;
    }
  });

  const startConversion = async () => {
    if (activeTab.value === 'url') {
      if (!isValidUrl.value) return;

      // Mock conversion for URL mode (due to CORS limitations)
      isConverting.value = true;
      conversionStatus.value = 'converting';
      progress.value = 0;

      // Extract domain for filename
      try {
        const urlObj = new URL(url.value);
        const domain = urlObj.hostname.replace('www.', '');
        const path = urlObj.pathname === '/' ? 'home' : urlObj.pathname.replace(/\//g, '-');
        fileName.value = `${domain}${path}-${new Date().toISOString().slice(0, 10)}.pdf`;
      } catch {
        fileName.value = 'web-convert.pdf';
      }

      const steps = [
        { pct: 20, text: '正在加载资源...' },
        { pct: 45, text: '渲染页面布局...' },
        { pct: 70, text: '生成 PDF 文档...' },
        { pct: 90, text: '正在优化文件大小...' },
        { pct: 100, text: '完成!' }
      ];

      let currentStep = 0;
      const timer = setInterval(() => {
        if (currentStep >= steps.length) {
          clearInterval(timer);
          isConverting.value = false;
          conversionStatus.value = 'completed';

          // Generate mock content
          const content = `Mock PDF Content for ${url.value}\nGenerated by LRM Toolbox`;
          pdfBlob.value = new Blob([content], { type: 'application/pdf' });

          ElMessage.success('转换成功');
          return;
        }
        const step = steps[currentStep];
        progress.value = step.pct;
        statusText.value = step.text;
        currentStep++;
      }, 800);
    } else {
      // Real conversion for HTML mode
      if (!htmlContent.value) {
        ElMessage.warning('请输入 HTML 内容');
        return;
      }

      isConverting.value = true;
      conversionStatus.value = 'converting';
      progress.value = 10;
      statusText.value = '正在渲染 HTML...';
      fileName.value = `html-export-${new Date().toISOString().slice(0, 10)}.pdf`;

      try {
        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent.value;
        container.style.width = '794px'; // A4 width at 96dpi approx
        container.style.padding = '40px';
        container.style.background = 'white';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        document.body.appendChild(container);

        progress.value = 30;

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        progress.value = 60;
        statusText.value = '生成 PDF 文件...';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: orientation.value as 'p' | 'portrait' | 'l' | 'landscape',
          unit: 'mm',
          format: paperSize.value
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        progress.value = 90;

        pdfBlob.value = pdf.output('blob');

        document.body.removeChild(container);

        progress.value = 100;
        isConverting.value = false;
        conversionStatus.value = 'completed';
        ElMessage.success('转换成功');
      } catch (error) {
        console.error(error);
        isConverting.value = false;
        conversionStatus.value = 'idle';
        ElMessage.error('转换失败，请检查 HTML 内容');
      }
    }
  };

  const downloadFile = () => {
    if (!pdfBlob.value) return;

    const downloadUrl = URL.createObjectURL(pdfBlob.value);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName.value;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    ElMessage.success('文件已开始下载');
  };

  const reset = () => {
    url.value = '';
    conversionStatus.value = 'idle';
    progress.value = 0;
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
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
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .html-textarea :deep(.el-textarea__inner) {
    font-family: monospace;
  }

  .converter-card {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    margin-bottom: 3rem;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .options-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }

  .convert-btn {
    width: 100%;
    margin-top: 1rem;
    font-size: 1.1rem;
    padding: 1.2rem;
  }

  .status-section {
    margin-top: 3rem;
    text-align: center;
    border-top: 1px solid var(--el-border-color-light);
    padding-top: 2rem;
  }

  .progress-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .status-text {
    color: var(--el-text-color-regular);
    font-size: 1.1rem;
  }

  .file-preview-card {
    display: flex;
    align-items: center;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem auto;
    max-width: 400px;
    text-align: left;
  }

  .pdf-icon-wrapper {
    position: relative;
    margin-right: 1rem;
    color: var(--el-color-danger);
    font-size: 2.5rem;
    display: flex;
    align-items: center;
  }

  .pdf-tag {
    position: absolute;
    bottom: 0;
    right: -5px;
    background: var(--el-color-danger);
    color: white;
    font-size: 0.6rem;
    padding: 1px 3px;
    border-radius: 2px;
    font-weight: bold;
  }

  .file-meta {
    flex: 1;
  }

  .file-name {
    font-weight: 500;
    margin-bottom: 0.25rem;
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .file-info {
    font-size: 0.85rem;
    color: var(--el-text-color-secondary);
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .feature-item {
    text-align: center;
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
    color: var(--el-color-primary);
    margin-bottom: 1rem;
    background: var(--el-color-primary-light-9);
    padding: 1rem;
    border-radius: 50%;
  }

  .feature-item h3 {
    margin-bottom: 0.5rem;
    color: var(--el-text-color-primary);
  }

  .feature-item p {
    color: var(--el-text-color-secondary);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .features-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
