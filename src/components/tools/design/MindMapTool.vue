<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">思维<span>.导图()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <div class="brutal-grid">
        <!-- 左侧编辑面板 -->
        <div class="brutal-pane editor-pane">
          <div class="pane-header bg-yellow">
            <span>编辑大纲.MARKDOWN</span>
            <div class="pane-actions">
              <button @click="loadExample">示例</button>
              <button class="danger" @click="clearText">清空</button>
            </div>
          </div>
          <div class="pane-content editor-content">
            <textarea
              v-model="markdownInput"
              class="brutal-editor"
              placeholder="# 中心主题
## 分支1
- 子节点A
- 子节点B
## 分支2
..."
            ></textarea>
          </div>
        </div>

        <!-- 右侧预览面板 -->
        <div class="brutal-pane preview-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">导图预览.PREVIEW</span>
            <div class="pane-actions">
              <button @click="fitView">适应视图</button>
              <button class="primary" @click="downloadSVG">导出 SVG</button>
            </div>
          </div>
          <div class="pane-content svg-area">
            <div ref="svgContainerRef" class="svg-container">
              <svg ref="svgRef" style="width: 100%; height: 100%"></svg>
            </div>
          </div>
          <div class="brutal-tips">提示：支持拖拽移动画布，鼠标滚轮缩放，点击节点收缩/展开。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Transformer } from 'markmap-lib';
  import { Markmap } from 'markmap-view';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const markdownInput = ref(`# 思维导图生成器
## 核心功能
- 简单易用
- 实时预览
- 结构化梳理
## 适用场景
- 读书笔记
- 方案大纲
- 会议记录
## 使用方法
- 使用 Markdown 语法
- # 表示一级标题
- - 表示列表项
`);

  const svgRef = ref(null);
  const svgContainerRef = ref(null);
  let markmapInstance = null;
  const transformer = new Transformer();

  const updateMindMap = () => {
    if (!markmapInstance || !svgRef.value) return;
    const { root } = transformer.transform(markdownInput.value);
    markmapInstance.setData(root);
    markmapInstance.fit();
  };

  onMounted(() => {
    if (svgRef.value) {
      markmapInstance = Markmap.create(svgRef.value, { autoFit: true, padding: 20 });
      updateMindMap();
    }
  });

  onUnmounted(() => {
    if (markmapInstance) {
      markmapInstance.destroy();
      markmapInstance = null;
    }
  });

  watch(markdownInput, () => {
    updateMindMap();
  });

  const loadExample = () => {
    markdownInput.value = `# 项目计划
## 准备阶段
- 需求分析
- 技术选型
## 开发阶段
- 前端开发
  - 界面设计
  - 组件实现
- 后端开发
  - API设计
  - 数据库构建
## 测试阶段
- 单元测试
- 集成测试
## 上线部署
`;
  };

  const clearText = () => {
    markdownInput.value = '# 中心主题';
  };
  const fitView = () => {
    markmapInstance?.fit();
  };

  const downloadSVG = () => {
    if (!svgRef.value) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.value);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mindmap_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success('已导出 SVG 图片');
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .brutal-container {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-shrink: 0;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-grid {
    display: flex;
    gap: 2rem;
    flex: 1;
    min-height: 0;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
  }
  .editor-pane {
    flex: 1;
    max-width: 420px;
  }
  .preview-pane {
    flex: 2;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 1px;
    gap: 0.75rem;
    flex-shrink: 0;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .pane-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }
  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }
  .pane-actions button.primary {
    background: #111;
    color: #fff;
  }
  .pane-actions button.danger {
    background: #ff4b4b;
    color: #fff;
  }

  .pane-content {
    flex: 1;
    min-height: 0;
  }
  .editor-content {
    display: flex;
  }
  .brutal-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1.25rem;
    resize: none;
    outline: none;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.95rem;
    line-height: 1.7;
    background: #fdfae5;
    color: #111;
  }

  .svg-area {
    display: flex;
    flex-direction: column;
  }
  .svg-container {
    flex: 1;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: #fff;
  }

  .brutal-tips {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    background: #ffd900;
    border-top: 4px solid #111;
    text-align: center;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      flex-direction: column;
    }
    .editor-pane {
      max-width: none;
      height: 300px;
      flex: none;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
  }

  /* --- Dark Mode --- */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .pane-actions button {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .pane-actions button.primary {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .pane-actions button.danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-editor {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .svg-container {
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-tips {
    background: #b28f00;
    border-top-color: #eee;
    color: #fff;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
</style>
