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
      <h1 class="tool-title">JSON 格式化</h1>
      <div class="header-right">
        <el-button text @click="clearAll">
          <el-icon>
            <Delete />
          </el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </header>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="formatJson">
          <el-icon>
            <MagicStick />
          </el-icon>
          格式化
        </el-button>
        <el-button @click="compressJson">
          <el-icon>
            <Fold />
          </el-icon>
          压缩
        </el-button>
        <el-button @click="validateJson">
          <el-icon>
            <CircleCheck />
          </el-icon>
          校验
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="indent-label">缩进:</span>
        <el-select v-model="indentSize" size="small" style="width: 100px">
          <el-option label="2 空格" :value="2" />
          <el-option label="4 空格" :value="4" />
          <el-option label="Tab" value="tab" />
        </el-select>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">输入 JSON</span>
          <div class="panel-actions">
            <el-button text size="small" @click="pasteFromClipboard">
              <el-icon>
                <DocumentCopy />
              </el-icon>
              粘贴
            </el-button>
            <el-button text size="small" @click="loadSample">
              <el-icon>
                <Document />
              </el-icon>
              示例
            </el-button>
          </div>
        </div>
        <textarea
          v-model="inputJson"
          class="code-editor"
          placeholder="在此粘贴 JSON 数据..."
          spellcheck="false"
          @input="autoValidate"
        ></textarea>
      </div>

      <div class="editor-panel">
        <div class="panel-header">
          <span class="panel-title">输出结果</span>
          <div class="panel-actions">
            <el-button text size="small" :disabled="!outputJson" @click="copyToClipboard">
              <el-icon>
                <CopyDocument />
              </el-icon>
              复制
            </el-button>
            <el-button text size="small" :disabled="!outputJson" @click="downloadJson">
              <el-icon>
                <Download />
              </el-icon>
              下载
            </el-button>
          </div>
        </div>
        <textarea
          v-model="outputJson"
          class="code-editor output"
          readonly
          placeholder="格式化结果将显示在这里..."
        ></textarea>
      </div>
    </div>

    <div class="status-bar" :class="statusType">
      <el-icon v-if="statusType === 'success'">
        <CircleCheckFilled />
      </el-icon>
      <el-icon v-else-if="statusType === 'error'">
        <CircleCloseFilled />
      </el-icon>
      <el-icon v-else>
        <InfoFilled />
      </el-icon>
      <span>{{ statusMessage }}</span>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - JSON 格式化</footer>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import {
    ArrowLeft,
    Delete,
    MagicStick,
    Fold,
    CircleCheck,
    DocumentCopy,
    Document,
    CopyDocument,
    Download,
    CircleCheckFilled,
    CircleCloseFilled,
    InfoFilled
  } from '@element-plus/icons-vue';

  const router = useRouter();

  const inputJson = ref('');
  const outputJson = ref('');
  const indentSize = ref(2);
  const statusMessage = ref('等待输入 JSON 数据...');
  const statusType = ref('info');

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  function clearAll() {
    inputJson.value = '';
    outputJson.value = '';
    statusMessage.value = '已清空';
    statusType.value = 'info';
  }

  function formatJson() {
    if (!inputJson.value.trim()) {
      showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(inputJson.value);
      const indent = indentSize.value === 'tab' ? '\t' : indentSize.value;
      outputJson.value = JSON.stringify(parsed, null, indent);
      showStatus('格式化成功', 'success');
    } catch (e) {
      showStatus(`JSON 解析错误: ${e.message}`, 'error');
      outputJson.value = '';
    }
  }

  function compressJson() {
    if (!inputJson.value.trim()) {
      showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      const parsed = JSON.parse(inputJson.value);
      outputJson.value = JSON.stringify(parsed);
      showStatus('压缩成功', 'success');
    } catch (e) {
      showStatus(`JSON 解析错误: ${e.message}`, 'error');
      outputJson.value = '';
    }
  }

  function validateJson() {
    if (!inputJson.value.trim()) {
      showStatus('请输入 JSON 数据', 'error');
      return;
    }

    try {
      JSON.parse(inputJson.value);
      showStatus('✓ JSON 格式正确', 'success');
    } catch (e) {
      showStatus(`✗ JSON 格式错误: ${e.message}`, 'error');
    }
  }

  function autoValidate() {
    if (!inputJson.value.trim()) {
      statusMessage.value = '等待输入 JSON 数据...';
      statusType.value = 'info';
      return;
    }

    try {
      JSON.parse(inputJson.value);
      statusMessage.value = 'JSON 格式正确';
      statusType.value = 'success';
    } catch (e) {
      statusMessage.value = `格式错误: ${e.message}`;
      statusType.value = 'error';
    }
  }

  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard: copy } = useCopy();

  async function pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      inputJson.value = text;
      autoValidate();
      ElMessage.success('已粘贴');
    } catch {
      ElMessage.error('无法访问剪贴板');
    }
  }

  function copyToClipboard() {
    copy(outputJson.value, { success: '已复制到剪贴板' });
  }

  function loadSample() {
    inputJson.value = JSON.stringify(
      {
        name: '在线工具箱',
        version: '1.0.0',
        description: '高效便捷的开发者工具集合',
        features: ['JSON 格式化', 'Base64 编解码', '时间戳转换'],
        author: {
          name: '开发者',
          email: 'dev@example.com'
        },
        isActive: true,
        count: 12
      },
      null,
      2
    );
    autoValidate();
  }

  function downloadJson() {
    const blob = new Blob([outputJson.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('下载成功');
  }

  function showStatus(message, type) {
    statusMessage.value = message;
    statusType.value = type;
  }
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .header-left,
  .header-right {
    width: 100px;
  }

  .header-right {
    text-align: right;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .toolbar-left {
    display: flex;
    gap: 0.5rem;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .indent-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .editor-container {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    min-height: 0;
  }

  .editor-panel {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: #f8fafc;
  }

  .panel-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e293b;
  }

  .panel-actions {
    display: flex;
    gap: 0.25rem;
  }

  .code-editor {
    flex: 1;
    padding: 1rem;
    border: none;
    resize: none;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.6;
    color: #1e293b;
    background: #ffffff;
    outline: none;
  }

  .code-editor::placeholder {
    color: #94a3b8;
  }

  .code-editor.output {
    background: #f8fafc;
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    background: #ffffff;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }

  .status-bar.info {
    color: #64748b;
  }

  .status-bar.success {
    color: #10b981;
  }

  .status-bar.error {
    color: #ef4444;
  }

  @media (max-width: 768px) {
    .editor-container {
      grid-template-columns: 1fr;
      padding: 0.75rem;
    }

    .toolbar {
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .toolbar-left,
    .toolbar-right {
      width: 100%;
      justify-content: center;
    }
  }

  .footer {
    text-align: center;
    padding: 3rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
