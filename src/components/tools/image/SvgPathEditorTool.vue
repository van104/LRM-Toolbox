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
        <h1 class="tool-title">SVG 路径编辑器</h1>
        <span class="tool-subtitle">SVG Path Editor</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="svg-editor-tool">
        <div class="tool-layout">
          <div class="editor-panel glass">
            <div class="panel-header">
              <h3 class="panel-title">路径代码 (d 属性)</h3>
              <div class="actions">
                <el-button size="small" @click="formatPath">格式化</el-button>
                <el-button size="small" type="primary" @click="copyPath">复制</el-button>
              </div>
            </div>
            <el-input
              v-model="pathData"
              type="textarea"
              :rows="10"
              placeholder="M10 10 L90 90..."
              class="code-input"
            />

            <div class="presets mt-4">
              <h4>常用预设</h4>
              <div class="preset-grid">
                <button
                  v-for="p in presets"
                  :key="p.name"
                  class="preset-btn"
                  @click="applyPreset(p.path)"
                >
                  {{ p.name }}
                </button>
              </div>
            </div>

            <div class="settings mt-4">
              <h4>预览设置</h4>
              <div class="setting-row">
                <span>填充颜色</span>
                <el-color-picker v-model="fillColor" show-alpha />
              </div>
              <div class="setting-row">
                <span>描边颜色</span>
                <el-color-picker v-model="strokeColor" show-alpha />
              </div>
              <div class="setting-row">
                <span>描边宽度</span>
                <el-input-number v-model="strokeWidth" :min="0" :max="20" size="small" />
              </div>
            </div>
          </div>

          <div class="preview-panel glass">
            <h3 class="panel-title">实时预览</h3>
            <div class="svg-container">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="rgba(0,0,0,0.1)"
                      stroke-width="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <path
                  :d="pathData"
                  :fill="fillColor"
                  :stroke="strokeColor"
                  :stroke-width="strokeWidth"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="help-text">
              <p>提示：预览视口默认为 100x100，路径坐标请参照此比例。</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - SVG 路径编辑器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ArrowLeft } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const pathData = ref('M10 10 H90 V90 H10 Z');
  const fillColor = ref('#409EFF');
  const strokeColor = ref('#000000');
  const strokeWidth = ref(2);

  const presets = [
    { name: '矩形', path: 'M10 10 H90 V90 H10 Z' },
    { name: '圆形', path: 'M50 10 A40 40 0 1 0 50 90 A40 40 0 1 0 50 10 Z' },
    { name: '三角形', path: 'M50 10 L90 90 L10 90 Z' },
    {
      name: '心形',
      path: 'M50 30 C50 30 20 0 20 50 C20 80 50 95 50 95 C50 95 80 80 80 50 C80 0 50 30 50 30 Z'
    },
    { name: '星形', path: 'M50 10 L61 38 H90 L67 55 L75 85 L50 70 L25 85 L33 55 L10 38 H39 Z' },
    { name: '闪电', path: 'M55 10 L35 50 H50 L45 90 L65 50 H50 Z' }
  ];

  const applyPreset = (d: string) => {
    pathData.value = d;
  };

  const formatPath = () => {
    // Simple formatter: add space after commands and trim
    pathData.value = pathData.value
      .replace(/([a-zA-Z])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const copyPath = async () => {
    await copyToClipboard(pathData.value);
  };
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
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }

  .svg-editor-tool {
    height: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 20px;
    height: 100%;
  }

  .editor-panel,
  .preview-panel {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .code-input :deep(textarea) {
    font-family: monospace;
    background: var(--bg-tertiary);
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 10px;
  }

  .preset-btn {
    padding: 6px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-tertiary);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .svg-container {
    flex: 1;
    background: white;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    overflow: hidden;
    position: relative;
    background-image:
      linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee),
      linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee);
    background-size: 20px 20px;
    background-position:
      0 0,
      10px 10px;
  }

  .help-text {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-secondary);
    text-align: center;
  }

  @media (max-width: 768px) {
    .tool-content {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }
  }
</style>
