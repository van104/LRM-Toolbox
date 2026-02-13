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
        <h1 class="tool-title">康奈尔笔记生成器</h1>
        <span class="tool-subtitle">Cornell Note Template Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handlePrint">
          <el-icon><Printer /></el-icon> 打印 / 导出 PDF
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 配置栏 -->
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Setting /></el-icon> 模板设置
            </h2>

            <div class="config-item">
              <label class="section-label">笔记标题</label>
              <el-input v-model="config.title" placeholder="例如：离散数学 - 逻辑运算" />
            </div>

            <div class="config-item">
              <label class="section-label">纸张方向</label>
              <el-radio-group v-model="config.orientation" class="w-full">
                <el-radio-button label="portrait">纵向 (A4)</el-radio-button>
                <el-radio-button label="landscape">横向 (A4)</el-radio-button>
              </el-radio-group>
            </div>

            <div class="config-item">
              <label class="section-label">线索区宽度 (%)</label>
              <el-slider v-model="config.cueWidth" :min="15" :max="40" />
            </div>

            <div class="config-item">
              <label class="section-label">总结区高度 (px)</label>
              <el-slider v-model="config.summaryHeight" :min="100" :max="300" />
            </div>

            <div class="config-item">
              <label class="section-label">格线样式</label>
              <el-select v-model="config.lineStyle" class="w-full">
                <el-option label="空白 (Blank)" value="blank" />
                <el-option label="横线 (Lined)" value="lined" />
                <el-option label="网格 (Grid)" value="grid" />
                <el-option label="圆点 (Dots)" value="dots" />
              </el-select>
            </div>

            <div class="config-item">
              <label class="section-label">线条颜色</label>
              <el-color-picker v-model="config.lineColor" show-alpha />
            </div>

            <div class="config-item mt-4">
              <el-checkbox v-model="config.showDate">显示日期栏</el-checkbox>
              <el-checkbox v-model="config.showTopic">显示主题栏</el-checkbox>
            </div>
          </div>

          <div class="alert mt-6">
            <p>
              <el-icon><InfoFilled /></el-icon> 建议使用 Chrome 或 Edge 浏览器以获得最佳的 PDF
              导出效果。
            </p>
          </div>
        </aside>

        <!-- 预览区 -->
        <div class="tool-main">
          <div class="preview-container" :class="config.orientation">
            <div
              id="cornell-page"
              class="cornell-page"
              :style="{
                borderColor: config.lineColor,
                '--line-color': config.lineColor
              }"
            >
              <!-- 顶部信息栏 -->
              <header class="page-header" :style="{ borderBottomColor: config.lineColor }">
                <div class="header-main">
                  <h2 class="title-text">{{ config.title || '笔记标题' }}</h2>
                </div>
                <div v-if="config.showDate || config.showTopic" class="header-meta">
                  <div v-if="config.showTopic" class="meta-item">主题：________________</div>
                  <div v-if="config.showDate" class="meta-item">日期：____ 年 __ 月 __ 日</div>
                </div>
              </header>

              <!-- 中间主体 -->
              <main class="page-body">
                <!-- 左侧线索区 -->
                <aside
                  class="cue-column"
                  :style="{
                    width: config.cueWidth + '%',
                    borderRightColor: config.lineColor
                  }"
                >
                  <span class="column-label">线索/问题 (Cues)</span>
                </aside>

                <!-- 右侧笔记区 -->
                <section class="notes-column" :class="config.lineStyle">
                  <span class="column-label">笔记内容 (Notes)</span>
                  <!-- 只有在 Grid/Lined 时才生成背景 -->
                  <div v-if="config.lineStyle !== 'blank'" class="pattern-overlay"></div>
                </section>
              </main>

              <!-- 底部总结区 -->
              <footer
                class="summary-section"
                :style="{
                  height: config.summaryHeight + 'px',
                  borderTopColor: config.lineColor
                }"
              >
                <span class="column-label">总结 (Summary)</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 康奈尔笔记生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  import { ArrowLeft, Printer, Setting, InfoFilled } from '@element-plus/icons-vue';

  const config = reactive({
    title: '',
    orientation: 'portrait',
    cueWidth: 30,
    summaryHeight: 150,
    lineStyle: 'lined',
    lineColor: '#e2e8f0',
    showDate: true,
    showTopic: true
  });

  const handlePrint = () => {
    window.print();
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
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
    width: 180px;
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
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .tool-layout {
      grid-template-columns: 1fr;
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
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-item {
    margin-bottom: 20px;
  }
  .section-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .w-full {
    width: 100%;
  }

  .alert {
    padding: 12px;
    background: #eff6ff;
    border-radius: 8px;
    color: #1e40af;
    font-size: 0.85rem;
    line-height: 1.4;
  }

  /* 预览区样式 */
  .preview-container {
    display: flex;
    justify-content: center;
    background: #cbd5e1;
    padding: 40px;
    border-radius: 12px;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .cornell-page {
    background: white;
    width: 210mm;
    min-height: 297mm;
    padding: 15mm;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    position: relative;
    border: 1px solid #eee;
    box-sizing: border-box;
  }

  .preview-container.landscape .cornell-page {
    width: 297mm;
    min-height: 210mm;
  }

  .page-header {
    border-bottom: 2px solid;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .title-text {
    font-size: 1.5rem;
    margin: 0 0 10px 0;
    color: #334155;
  }

  .header-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #64748b;
  }

  .page-body {
    flex: 1;
    display: flex;
    border: 2px solid var(--line-color);
  }

  .cue-column {
    border-right: 2px solid;
    padding: 10px;
    position: relative;
  }

  .notes-column {
    flex: 1;
    padding: 10px;
    position: relative;
    overflow: hidden;
  }

  .column-label {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 0.7rem;
    color: #cbd5e1;
    font-weight: 700;
    text-transform: uppercase;
    pointer-events: none;
  }

  .summary-section {
    border: 2px solid;
    margin-top: 10px;
    padding: 10px;
    position: relative;
  }

  /* 格线模式 */
  .pattern-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .lined .pattern-overlay {
    background-image: linear-gradient(var(--line-color) 1px, transparent 1px);
    background-size: 100% 28px;
  }

  .grid .pattern-overlay {
    background-image:
      linear-gradient(var(--line-color) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-color) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .dots .pattern-overlay {
    background-image: radial-gradient(var(--line-color) 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  /* 打印样式优化 */
  @media print {
    body * {
      visibility: hidden;
    }
    #cornell-page,
    #cornell-page * {
      visibility: visible;
    }
    #cornell-page {
      position: absolute;
      left: 0;
      top: 0;
      margin: 0;
      padding: 10mm;
      box-shadow: none;
      border: none;
    }
    @page {
      margin: 0;
      size: auto;
    }
  }
</style>
```
