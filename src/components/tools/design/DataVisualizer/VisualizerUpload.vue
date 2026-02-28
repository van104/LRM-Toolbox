<template>
  <div>
    <section class="intro-section">
      <h2 class="pane-title mb-4">功能特性</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-content">
            <div class="icon-box bg-blue text-white">📊</div>
            <h4>多维图表</h4>
            <p>支持柱状图、折线图、饼图、环形图和雷达图，全方位展示数据。</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-content">
            <div class="icon-box bg-yellow">⚡</div>
            <h4>即时预览</h4>
            <p>自由切换 X/Y 轴数据列，实时渲染图表，所见即所得。</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-content">
            <div class="icon-box bg-pink">🎨</div>
            <h4>高清导出</h4>
            <p>内置智能重绘引擎，支持导出 3 倍高清 PNG 图片，适应需求。</p>
          </div>
        </div>
        <div class="feature-card">
          <div class="feature-content">
            <div class="icon-box bg-cyan">📁</div>
            <h4>广泛兼容</h4>
            <p>原生支持 Excel (.xlsx, .xls) 和 CSV 格式，无需手动转换。</p>
          </div>
        </div>
      </div>

      <h2 class="pane-title mt-12 mb-4">使用指南</h2>
      <div class="steps-grid">
        <div class="step-card">
          <span class="step-num bg-blue text-white">1</span>
          <div class="step-content">
            <h4>上传文件</h4>
            <p>将 Excel 或 CSV 文件拖拽到上传区域。</p>
          </div>
        </div>
        <div class="step-card">
          <span class="step-num bg-yellow">2</span>
          <div class="step-content">
            <h4>配置图表</h4>
            <p>在左侧选择图表类型，并指定 X 轴和 Y 轴对应的数据列。</p>
          </div>
        </div>
        <div class="step-card">
          <span class="step-num bg-pink">3</span>
          <div class="step-content">
            <h4>导出分享</h4>
            <p>调整配色和标题，点击"导出图片"保存高清图表。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="upload-section mt-12">
      <div
        class="brutal-pane upload-card"
        :class="{ dragover: isDragOver }"
        @click="openUpload"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          @change="handleFileSelect"
        />

        <div class="upload-grid">
          <div class="upload-area">
            <div class="upload-icon">
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3>点击或拖拽上传文件</h3>
            <p class="upload-hint">支持 .xlsx, .xls, .csv</p>
          </div>

          <div class="divider-wrap">
            <div class="divider-line"></div>
            <span class="divider-text">OR</span>
          </div>

          <div class="generator-area">
            <div class="generator-content">
              <button class="brutal-btn demo-btn bg-cyan" @click.stop="$emit('open-generator')">
                <span class="mr-2">✨</span> 使用演示数据
              </button>
              <p class="demo-hint mt-3">快速生成 100+ 条模拟数据进行体验</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { useFileHandler } from '@/composables/useFileHandler';

  const emit = defineEmits(['file-process', 'open-generator']);

  const { isDragOver, fileInput, onFileSelect, onDrop, triggerUpload } = useFileHandler({
    accept: '.xlsx,.xls,.csv'
  });

  function openUpload() {
    triggerUpload();
  }

  async function handleFileSelect(event) {
    const results = await onFileSelect(event);
    if (results.length > 0) emit('file-process', results[0].file);
  }

  async function handleDrop(event) {
    const results = await onDrop(event);
    if (results.length > 0) emit('file-process', results[0].file);
  }
</script>

<style scoped>
  .intro-section {
    margin-bottom: 4rem;
  }

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: #111;
    border-left: 8px solid #111;
    padding-left: 1rem;
    position: relative;
    margin-top: 4rem;
    margin-bottom: 2.5rem;
  }

  .pane-title:first-child {
    margin-top: 0;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
    margin-bottom: 1rem; /* 为黑色阴影留出空间 */
  }

  .feature-card {
    background: #111;
    padding: 0;
    border: none;
    transition: all 0.2s;
  }

  .feature-content {
    background: #fff;
    border: 4px solid #111;
    padding: 24px;
    height: 100%;
    transform: translate(-8px, -8px);
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
  }

  .feature-card:hover .feature-content {
    transform: translate(-4px, -4px);
  }

  .feature-card h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin: 1rem 0 0.5rem 0;
  }

  .feature-card p {
    font-size: 0.95rem;
    color: #444;
    line-height: 1.6;
    margin: 0;
  }

  .icon-box {
    width: 60px;
    height: 60px;
    border: 4px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    box-shadow: 4px 4px 0px #111;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .step-card {
    display: flex;
    gap: 1.25rem;
    background: #fff;
    padding: 1.5rem;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: all 0.2s;
  }

  .step-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px 0px #111;
  }

  .step-num {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border: 4px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.5rem;
    box-shadow: 3px 3px 0px #111;
  }

  .step-content h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
  }

  .step-content p {
    margin: 0;
    font-size: 0.95rem;
    color: #444;
    line-height: 1.5;
  }

  .upload-section {
    max-width: 960px;
    margin: 0 auto;
  }

  .brutal-pane.upload-card {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 16px 16px 0px #111;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
  }

  .upload-grid {
    display: grid;
    grid-template-columns: 1fr 100px 1fr;
    align-items: center;
    min-height: 320px;
  }

  .upload-area {
    padding: 3rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.2s;
    height: 100%;
    justify-content: center;
  }

  .upload-card:hover .upload-area {
    background: #fdfae5;
  }

  .upload-icon {
    color: #111;
    margin-bottom: 1.5rem;
  }

  .upload-card h3 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.6rem;
    font-weight: 900;
    margin: 0 0 0.75rem 0;
  }

  .upload-hint {
    font-size: 1.1rem;
    color: #666;
    font-weight: 600;
  }

  .divider-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: relative;
    user-select: none;
  }

  .divider-line {
    width: 4px;
    height: 180px;
    background: #111;
  }

  .divider-text {
    position: absolute;
    background: #ffd900;
    border: 3px solid #111;
    padding: 4px 12px;
    font-weight: 900;
    font-family: 'Syne', sans-serif;
    transform: rotate(5deg);
    z-index: 10;
  }

  .generator-area {
    padding: 3rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f8fafc;
    height: 100%;
    justify-content: center;
    transition: all 0.2s;
  }

  .upload-card:hover .generator-area {
    background: #f1f5f9;
  }

  .demo-btn {
    font-size: 1.2rem;
    padding: 1rem 2rem;
  }

  .demo-hint {
    color: #666;
    font-weight: 600;
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    .upload-grid {
      grid-template-columns: 1fr;
    }
    .divider-line {
      width: 150px;
      height: 4px;
    }
    .divider-wrap {
      padding: 2rem 0;
    }
    .generator-area {
      padding: 2rem;
    }
  }

  .bg-blue {
    background-color: #4b7bff;
  }
  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-pink {
    background-color: #ff66b2;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .text-white {
    color: #fff;
  }
</style>
