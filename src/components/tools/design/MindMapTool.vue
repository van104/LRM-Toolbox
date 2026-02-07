<template>
    <div class="mindmap-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>思维导图生成器</h1>
                <span class="nav-subtitle">Mind Map Generator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="editor-layout">
                
                <div class="left-panel glass-card">
                    <div class="panel-header">
                        <h3><el-icon>
                                <Edit />
                            </el-icon> 编辑大纲 (Markdown)</h3>
                        <div class="actions">
                            <button @click="loadExample" class="action-btn">载入示例</button>
                            <button @click="clearText" class="action-btn danger">清空</button>
                        </div>
                    </div>
                    <textarea v-model="markdownInput" class="md-editor" placeholder="# 中心主题
## 分支1
- 子节点A
- 子节点B
## 分支2
..."></textarea>
                </div>

                
                <div class="right-panel glass-card">
                    <div class="panel-header">
                        <h3><el-icon>
                                <View />
                            </el-icon> 导图预览</h3>
                        <div class="actions">
                            <button @click="fitView" class="action-btn">
                                <el-icon>
                                    <FullScreen />
                                </el-icon> 适应视图
                            </button>
                            <button @click="downloadSVG" class="action-btn primary">
                                <el-icon>
                                    <Download />
                                </el-icon> 导出 SVG
                            </button>
                        </div>
                    </div>
                    <div class="svg-container" ref="svgContainerRef">
                        <svg ref="svgRef" style="width: 100%; height: 100%;"></svg>
                    </div>
                    <div class="tips">
                        提示：支持拖拽移动画布，鼠标滚轮缩放，点击节点收缩/展开。
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">
            © 2026 LRM工具箱 - 思维导图生成器
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Back, Edit, View, FullScreen, Download } from '@element-plus/icons-vue'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { ElMessage } from 'element-plus'

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
`)

const svgRef = ref(null)
const svgContainerRef = ref(null)
let markmapInstance = null
const transformer = new Transformer()

const updateMindMap = () => {
    if (!markmapInstance || !svgRef.value) return

    const { root } = transformer.transform(markdownInput.value)
    markmapInstance.setData(root)
    markmapInstance.fit()
}

onMounted(() => {
    if (svgRef.value) {
        
        markmapInstance = Markmap.create(svgRef.value, {
            autoFit: true,
            padding: 20
        }) 
        updateMindMap()
    }
})

onUnmounted(() => {
    if (markmapInstance) {
        markmapInstance.destroy()
        markmapInstance = null
    }
})


watch(markdownInput, () => {
    updateMindMap()
})

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
`
}

const clearText = () => {
    markdownInput.value = '# 中心主题'
}

const fitView = () => {
    markmapInstance?.fit()
}

const downloadSVG = () => {
    if (!svgRef.value) return

    
    const svgData = new XMLSerializer().serializeToString(svgRef.value)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `mindmap_${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('已导出 SVG 图片')
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.mindmap-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #2563eb;

    font-family: 'Noto Sans SC', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
    
}

.nav-bar {
    
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    z-index: 10;
}

.nav-back,
.nav-spacer {
    width: 80px;
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
}

.main-content {
    flex: 1;
    padding: 1.5rem;
    min-height: 0;
    
}

.editor-layout {
    display: flex;
    height: 100%;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.left-panel {
    flex: 1;
    max-width: 400px;
    display: flex;
    flex-direction: column;
}

.right-panel {
    flex: 2;
    display: flex;
    flex-direction: column;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    background: #fdfdfd;
}

.panel-header h3 {
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
}

.actions {
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    padding: 4px 10px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--text-2);
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
}

.action-btn:hover {
    border-color: var(--text-2);
    color: var(--text);
}

.action-btn.primary {
    background: var(--text);
    color: white;
    border-color: var(--text);
}

.action-btn.primary:hover {
    opacity: 0.9;
}

.action-btn.danger {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
}

.action-btn.danger:hover {
    background: #fee2e2;
    border-color: #ef4444;
}

.md-editor {
    flex: 1;
    width: 100%;
    border: none;
    padding: 1rem;
    resize: none;
    outline: none;
    font-family: monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    background: #fafaf9;
}

.svg-container {
    flex: 1;
    width: 100%;
    position: relative;
    overflow: hidden;
    background: white;
}

.tips {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: var(--text-2);
    background: #fdfdfd;
    border-top: 1px solid var(--border);
    text-align: center;
}

@media (max-width: 768px) {
    .editor-layout {
        flex-direction: column;
    }

    .left-panel {
        max-width: none;
        height: 300px;
        flex: none;
    }
}

.footer {
    text-align: center;
    padding: 1rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    margin-top: auto;
}
</style>
