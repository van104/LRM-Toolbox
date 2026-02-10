<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack"
          ><el-icon>
            <ArrowLeft /> </el-icon
          ><span>返回</span></el-button
        >
      </div>
      <div class="header-center">
        <h1 class="tool-title">PDF 元数据编辑</h1>
        <span class="tool-subtitle">PDF Metadata Editor</span>
      </div>
      <div class="header-right"></div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="workbench glass-card">
          <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
            <el-icon class="upload-icon">
              <InfoFilled />
            </el-icon>
            <h3>选择 PDF 编辑元数据</h3>
            <p class="hint">修改标题、作者、主题等属性信息</p>
          </div>

          <div v-else class="workspace">
            <div class="file-info">
              <el-icon>
                <Document />
              </el-icon>
              <span>{{ pdfFile.name }}</span>
              <el-button text type="danger" @click="clearFile">移除</el-button>
            </div>

            <div class="metadata-form">
              <div class="form-item">
                <label>标题 (Title)</label>
                <el-input v-model="metadata.title" placeholder="文档标题" />
              </div>
              <div class="form-item">
                <label>作者 (Author)</label>
                <el-input v-model="metadata.author" placeholder="文档作者" />
              </div>
              <div class="form-item">
                <label>主题 (Subject)</label>
                <el-input v-model="metadata.subject" placeholder="文档主题" />
              </div>
              <div class="form-item">
                <label>关键词 (Keywords)</label>
                <el-input v-model="metadata.keywords" placeholder="用逗号分隔的关键词" />
              </div>
              <div class="form-item">
                <label>创建者 (Creator)</label>
                <el-input v-model="metadata.creator" placeholder="创建此文档的程序" />
              </div>
              <div class="form-item">
                <label>生成器 (Producer)</label>
                <el-input v-model="metadata.producer" placeholder="生成此 PDF 的程序" />
              </div>
              <div class="form-row">
                <div class="form-item">
                  <label>创建日期 (Creation Date)</label>
                  <el-date-picker
                    v-model="metadata.creationDate"
                    type="datetime"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </div>
                <div class="form-item">
                  <label>修改日期 (Modification Date)</label>
                  <el-date-picker
                    v-model="metadata.modificationDate"
                    type="datetime"
                    placeholder="选择日期"
                    style="width: 100%"
                  />
                </div>
              </div>
            </div>

            <div class="original-info glass-card">
              <h4>原始元数据</h4>
              <div class="info-grid">
                <div v-for="(value, key) in originalMetadata" :key="key" class="info-item">
                  <span class="info-label">{{ key }}</span>
                  <span class="info-value">{{ value || '(空)' }}</span>
                </div>
              </div>
            </div>

            <el-button
              type="primary"
              size="large"
              class="action-btn"
              :loading="processing"
              @click="saveMetadata"
            >
              保存元数据并下载
            </el-button>
          </div>

          <input ref="fileRef" type="file" hidden accept=".pdf" @change="handleUpload" />
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - PDF 元数据编辑</footer>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, InfoFilled, Document } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { PDFDocument } from 'pdf-lib';

  const router = useRouter();
  const goBack = () => router.back();

  const fileRef = ref(null);
  const pdfFile = ref(null);
  const pdfBytes = ref(null);
  const processing = ref(false);

  const metadata = reactive({
    title: '',
    author: '',
    subject: '',
    keywords: '',
    creator: '',
    producer: '',
    creationDate: null,
    modificationDate: null
  });

  const originalMetadata = ref({});

  const triggerUpload = () => fileRef.value?.click();

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (file) await loadPdf(file);
  };

  const clearFile = () => {
    pdfFile.value = null;
    pdfBytes.value = null;
    Object.keys(metadata).forEach(key => (metadata[key] = key.includes('Date') ? null : ''));
    originalMetadata.value = {};
  };

  const loadPdf = async file => {
    try {
      pdfFile.value = file;
      const buffer = await file.arrayBuffer();
      pdfBytes.value = new Uint8Array(buffer);

      const pdfDoc = await PDFDocument.load(pdfBytes.value);

      metadata.title = pdfDoc.getTitle() || '';
      metadata.author = pdfDoc.getAuthor() || '';
      metadata.subject = pdfDoc.getSubject() || '';
      metadata.keywords = (pdfDoc.getKeywords() || []).join(', ');
      metadata.creator = pdfDoc.getCreator() || '';
      metadata.producer = pdfDoc.getProducer() || '';
      metadata.creationDate = pdfDoc.getCreationDate() || null;
      metadata.modificationDate = pdfDoc.getModificationDate() || null;

      originalMetadata.value = {
        标题: pdfDoc.getTitle(),
        作者: pdfDoc.getAuthor(),
        主题: pdfDoc.getSubject(),
        关键词: (pdfDoc.getKeywords() || []).join(', '),
        创建者: pdfDoc.getCreator(),
        生成器: pdfDoc.getProducer(),
        创建日期: pdfDoc.getCreationDate()?.toLocaleString(),
        修改日期: pdfDoc.getModificationDate()?.toLocaleString()
      };
    } catch (e) {
      console.error(e);
      ElMessage.error('加载 PDF 失败');
    }
  };

  const saveMetadata = async () => {
    if (!pdfBytes.value) return;

    processing.value = true;
    try {
      const pdfDoc = await PDFDocument.load(pdfBytes.value);

      if (metadata.title) pdfDoc.setTitle(metadata.title);
      if (metadata.author) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords) {
        pdfDoc.setKeywords(
          metadata.keywords
            .split(',')
            .map(k => k.trim())
            .filter(k => k)
        );
      }
      if (metadata.creator) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer) pdfDoc.setProducer(metadata.producer);
      if (metadata.creationDate) pdfDoc.setCreationDate(new Date(metadata.creationDate));
      if (metadata.modificationDate)
        pdfDoc.setModificationDate(new Date(metadata.modificationDate));

      const modifiedBytes = await pdfDoc.save();
      const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metadata_${pdfFile.value.name}`;
      a.click();
      URL.revokeObjectURL(url);

      ElMessage.success('元数据保存成功');
    } catch (e) {
      console.error(e);
      ElMessage.error('保存失败: ' + e.message);
    } finally {
      processing.value = false;
    }
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    color: #1e293b;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .header-left,
  .header-right {
    width: 100px;
    display: flex;
    align-items: center;
  }

  .header-center {
    flex: 1;
    text-align: center;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    display: flex;
    justify-content: center;
  }

  .layout-container {
    width: 100%;
    max-width: 700px;
  }

  .workbench {
    padding: 2rem;
    border-radius: 16px;
    min-height: 400px;
  }

  .upload-placeholder {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #64748b;
  }

  .upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #3b82f6;
  }

  .upload-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .hint {
    font-size: 0.85rem;
    margin-top: 0.5rem;
    opacity: 0.7;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .file-info .el-icon {
    font-size: 1.5rem;
    color: #3b82f6;
  }

  .file-info span {
    flex: 1;
    font-weight: 500;
  }

  .metadata-form {
    margin-bottom: 1.5rem;
  }

  .form-item {
    margin-bottom: 1rem;
  }

  .form-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #334155;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .original-info {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }

  .original-info h4 {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem 1rem;
  }

  .info-item {
    font-size: 0.85rem;
  }

  .info-label {
    color: #64748b;
  }

  .info-value {
    color: #1e293b;
    margin-left: 0.5rem;
  }

  .action-btn {
    width: 100%;
  }

  .glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
