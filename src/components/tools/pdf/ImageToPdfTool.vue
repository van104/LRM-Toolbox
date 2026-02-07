<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">图片转 PDF</h1>
                <span class="tool-subtitle">Image to PDF Converter</span>
            </div>
            <div class="header-right">
                <el-button-group>
                    <el-button type="danger" :disabled="!images.length" @click="clearAll"><el-icon>
                            <Delete />
                        </el-icon> 清空</el-button>
                    <el-button type="primary" :disabled="!images.length" @click="generatePdf"><el-icon>
                            <Download />
                        </el-icon> 生成 PDF</el-button>
                </el-button-group>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div v-if="!images.length" class="upload-placeholder" @click="triggerUpload" @dragover.prevent
                        @drop.prevent="handleDrop">
                        <div class="upload-icon"><el-icon>
                                <PictureFilled />
                            </el-icon></div>
                        <h3>点击或拖拽上传图片</h3>
                        <p>支持 JPG、PNG、WebP 等格式，可多选</p>
                        <input type="file" ref="fileRef" multiple hidden accept="image/*" @change="handleUpload" />
                    </div>

                    <div v-else class="preview-stage">
                        <div class="toolbar">
                            <el-button type="primary" text @click="triggerUpload"><el-icon>
                                    <Plus />
                                </el-icon> 添加图片</el-button>
                            <input type="file" ref="fileRef" multiple hidden accept="image/*" @change="handleUpload" />
                            <span class="count-badge">共 {{ images.length }} 张</span>
                        </div>
                        <draggable v-model="images" item-key="id" handle=".drag-handle" class="images-list"
                            ghost-class="ghost">
                            <template #item="{ element: img, index }">
                                <div class="image-item">
                                    <div class="drag-handle"><el-icon>
                                            <Rank />
                                        </el-icon></div>
                                    <div class="image-preview"><img :src="img.url" /></div>
                                    <div class="image-info">
                                        <span class="image-index">{{ index + 1 }}</span>
                                        <span class="image-name">{{ img.name }}</span>
                                    </div>
                                    <el-button type="danger" text circle @click="removeImage(index)"><el-icon>
                                            <Delete />
                                        </el-icon></el-button>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>

                <div class="settings-panel glass-card">
                    <h3 class="panel-title">PDF 设置</h3>
                    <div class="settings-group">
                        <div class="label">页面尺寸</div>
                        <el-select v-model="config.pageSize" style="width: 100%;">
                            <el-option label="A4" value="a4" />
                            <el-option label="A3" value="a3" />
                            <el-option label="Letter" value="letter" />
                            <el-option label="自适应图片" value="auto" />
                        </el-select>
                    </div>
                    <div class="settings-group" v-if="config.pageSize !== 'auto'">
                        <div class="label">页面方向</div>
                        <el-radio-group v-model="config.orientation">
                            <el-radio-button value="portrait">纵向</el-radio-button>
                            <el-radio-button value="landscape">横向</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div class="settings-group">
                        <div class="label">文件名</div>
                        <el-input v-model="config.filename" placeholder="output" />
                    </div>
                    <el-divider />
                    <el-button type="primary" size="large" :disabled="!images.length" :loading="generating"
                        @click="generatePdf" style="width:100%;">
                        <el-icon>
                            <Download />
                        </el-icon> {{ generating ? '生成中...' : '生成 PDF' }}
                    </el-button>
                    <div class="tips-section">
                        <h4>使用提示</h4>
                        <ul>
                            <li>可拖拽调整顺序</li>
                            <li>自适应模式使用原图尺寸</li>
                            <li>本地处理，不上传</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - 图片转 PDF</footer>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Delete, Download, PictureFilled, Plus, Rank } from '@element-plus/icons-vue'
import { jsPDF } from 'jspdf'
import draggable from 'vuedraggable'

const router = useRouter()
const goBack = () => router.back()

const fileRef = ref(null)
const images = ref([])
const generating = ref(false)
let imageId = 0

const config = reactive({ pageSize: 'a4', orientation: 'portrait', filename: 'merged' })
const pageSizes = { a4: [210, 297], a3: [297, 420], letter: [216, 279] }

const triggerUpload = () => fileRef.value?.click()
const handleDrop = (e) => addImages(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')))
const handleUpload = (e) => { addImages(Array.from(e.target.files)); e.target.value = '' }
const addImages = (files) => files.forEach(f => images.value.push({ id: ++imageId, file: f, name: f.name, size: f.size, url: URL.createObjectURL(f) }))
const removeImage = (i) => { URL.revokeObjectURL(images.value[i].url); images.value.splice(i, 1) }
const clearAll = () => { images.value.forEach(i => URL.revokeObjectURL(i.url)); images.value = [] }
const loadImage = (url) => new Promise((res, rej) => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = url })

const generatePdf = async () => {
    if (!images.value.length) return
    generating.value = true
    try {
        let pdf
        for (let i = 0; i < images.value.length; i++) {
            const img = await loadImage(images.value[i].url)
            let w, h
            if (config.pageSize === 'auto') { w = img.width * 0.75; h = img.height * 0.75 }
            else {
                const sz = pageSizes[config.pageSize]
                w = (config.orientation === 'landscape' ? sz[1] : sz[0]) / 25.4 * 72
                h = (config.orientation === 'landscape' ? sz[0] : sz[1]) / 25.4 * 72
            }
            if (i === 0) pdf = new jsPDF({ unit: 'pt', format: [w, h] })
            else pdf.addPage([w, h])
            const scale = Math.min(w / img.width, h / img.height, 1)
            const dw = img.width * scale, dh = img.height * scale
            pdf.addImage(img, 'JPEG', (w - dw) / 2, (h - dh) / 2, dw, dh)
        }
        pdf.save(`${config.filename || 'output'}.pdf`)
        ElMessage.success('PDF 生成成功')
    } catch (e) { console.error(e); ElMessage.error('生成失败') }
    finally { generating.value = false }
}
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

.header-center {
    text-align: center;
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
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.layout-container {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    min-height: calc(100vh - 200px);
}

.workbench {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f8fafc;
}

.upload-placeholder {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    margin: 2rem;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    color: #3b82f6;
    margin-bottom: 1rem;
}

.preview-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    overflow: hidden;
}

.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 1rem;
}

.count-badge {
    font-size: 0.85rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
}

.images-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.image-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.drag-handle {
    cursor: grab;
    padding: 0.5rem;
    color: #94a3b8;
}

.image-preview {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    background: #f1f5f9;
}

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    overflow: hidden;
}

.image-index {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #3b82f6;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 50%;
}

.image-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
    border: 2px dashed #3b82f6;
}

.drag-handle:active {
    cursor: grabbing;
}

.settings-panel {
    padding: 1.5rem;
    overflow-y: auto;
    background: #fff;
}

.panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1.5rem;
}

.settings-group {
    margin-bottom: 1.25rem;
}

.label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
}

.tips-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
}

.tips-section h4 {
    font-size: 0.9rem;
    margin: 0 0 0.75rem;
    color: #475569;
}

.tips-section ul {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.8;
}

.glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

@media (max-width: 992px) {
    .layout-container {
        grid-template-columns: 1fr;
    }
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
