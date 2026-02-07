<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 拆分与合并</h1>
                <span class="tool-subtitle">PDF Split & Merge</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <el-tabs v-model="activeTab" class="main-tabs">
                
                <el-tab-pane label="拆分 PDF" name="split">
                    <div class="tab-content">
                        <div class="workbench glass-card">
                            <div v-if="!splitFile" class="upload-placeholder" @click="triggerSplitUpload"
                                @dragover.prevent @drop.prevent="handleSplitDrop">
                                <div class="upload-icon"><el-icon>
                                        <Document />
                                    </el-icon></div>
                                <h3>上传需要拆分的 PDF</h3>
                                <p>选择要提取的页面范围</p>
                                <input type="file" ref="splitFileRef" hidden accept=".pdf"
                                    @change="handleSplitUpload" />
                            </div>
                            <div v-else class="file-loaded">
                                <div class="file-info-card">
                                    <el-icon class="pdf-icon">
                                        <Document />
                                    </el-icon>
                                    <div class="file-details">
                                        <span class="file-name">{{ splitFile.name }}</span>
                                        <span class="file-meta">{{ splitPageCount }} 页</span>
                                    </div>
                                    <el-button text type="primary" @click="triggerSplitUpload">重新选择</el-button>
                                    <input type="file" ref="splitFileRef" hidden accept=".pdf"
                                        @change="handleSplitUpload" />
                                </div>
                                <div class="split-options">
                                    <div class="option-group">
                                        <div class="label">提取方式</div>
                                        <el-radio-group v-model="splitMode">
                                            <el-radio value="range">页面范围</el-radio>
                                            <el-radio value="single">逐页拆分</el-radio>
                                        </el-radio-group>
                                    </div>
                                    <div v-if="splitMode === 'range'" class="option-group">
                                        <div class="label">页面范围 (如: 1-3,5,7-9)</div>
                                        <el-input v-model="splitRange" placeholder="1-3,5,7-9" />
                                    </div>
                                    <el-button type="primary" size="large" @click="executeSplit" :loading="splitLoading"
                                        style="width:100%; margin-top: 1rem;">
                                        <el-icon>
                                            <Scissor />
                                        </el-icon> {{ splitMode === 'single' ? '逐页拆分' : '提取选定页面' }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>

                
                <el-tab-pane label="合并 PDF" name="merge">
                    <div class="tab-content">
                        <div class="workbench glass-card">
                            <div v-if="!mergeFiles.length" class="upload-placeholder" @click="triggerMergeUpload"
                                @dragover.prevent @drop.prevent="handleMergeDrop">
                                <div class="upload-icon"><el-icon>
                                        <FolderOpened />
                                    </el-icon></div>
                                <h3>上传多个 PDF 文件</h3>
                                <p>文件将按顺序合并为一个 PDF</p>
                                <input type="file" ref="mergeFileRef" multiple hidden accept=".pdf"
                                    @change="handleMergeUpload" />
                            </div>
                            <div v-else class="files-loaded">
                                <div class="files-toolbar">
                                    <el-button type="primary" text @click="triggerMergeUpload"><el-icon>
                                            <Plus />
                                        </el-icon> 添加更多</el-button>
                                    <input type="file" ref="mergeFileRef" multiple hidden accept=".pdf"
                                        @change="handleMergeUpload" />
                                    <el-button type="danger" text @click="clearMergeFiles"><el-icon>
                                            <Delete />
                                        </el-icon> 清空</el-button>
                                </div>
                                <div class="files-list">
                                    <div v-for="(f, i) in mergeFiles" :key="f.id" class="file-item">
                                        <div class="drag-handle"><el-icon>
                                                <Rank />
                                            </el-icon></div>
                                        <el-icon class="pdf-icon-sm">
                                            <Document />
                                        </el-icon>
                                        <span class="file-index">{{ i + 1 }}</span>
                                        <span class="file-name">{{ f.name }}</span>
                                        <el-button type="danger" text circle size="small"
                                            @click="removeMergeFile(i)"><el-icon>
                                                <Delete />
                                            </el-icon></el-button>
                                    </div>
                                </div>
                                <el-button type="primary" size="large" @click="executeMerge" :loading="mergeLoading"
                                    style="width:100%; margin-top: 1rem;">
                                    <el-icon>
                                        <Connection />
                                    </el-icon> 合并 {{ mergeFiles.length }} 个 PDF
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 拆分与合并</footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document, FolderOpened, Plus, Delete, Rank, Scissor, Connection } from '@element-plus/icons-vue'
import { PDFDocument } from 'pdf-lib'

const router = useRouter()
const goBack = () => router.back()

const activeTab = ref('split')


const splitFileRef = ref(null)
const splitFile = ref(null)
const splitPdfDoc = ref(null)
const splitPageCount = ref(0)
const splitMode = ref('range')
const splitRange = ref('')
const splitLoading = ref(false)


const mergeFileRef = ref(null)
const mergeFiles = ref([])
const mergeLoading = ref(false)
let mergeId = 0


const triggerSplitUpload = () => splitFileRef.value?.click()
const handleSplitDrop = (e) => { const f = e.dataTransfer.files[0]; if (f?.type === 'application/pdf') loadSplitFile(f) }
const handleSplitUpload = (e) => { const f = e.target.files[0]; if (f) loadSplitFile(f); e.target.value = '' }

const loadSplitFile = async (file) => {
    splitFile.value = file
    const bytes = await file.arrayBuffer()
    splitPdfDoc.value = await PDFDocument.load(bytes)
    splitPageCount.value = splitPdfDoc.value.getPageCount()
    splitRange.value = `1-${splitPageCount.value}`
}

const parseRange = (rangeStr, max) => {
    const pages = new Set()
    rangeStr.split(',').forEach(part => {
        part = part.trim()
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number)
            for (let i = Math.max(1, start); i <= Math.min(max, end); i++) pages.add(i)
        } else {
            const n = parseInt(part)
            if (n >= 1 && n <= max) pages.add(n)
        }
    })
    return Array.from(pages).sort((a, b) => a - b)
}

const executeSplit = async () => {
    if (!splitPdfDoc.value) return
    splitLoading.value = true
    try {
        if (splitMode.value === 'single') {
            for (let i = 0; i < splitPageCount.value; i++) {
                const newPdf = await PDFDocument.create()
                const [page] = await newPdf.copyPages(splitPdfDoc.value, [i])
                newPdf.addPage(page)
                const bytes = await newPdf.save()
                downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${splitFile.value.name.replace('.pdf', '')}_page${i + 1}.pdf`)
                await new Promise(r => setTimeout(r, 200))
            }
            ElMessage.success(`已拆分为 ${splitPageCount.value} 个文件`)
        } else {
            const pages = parseRange(splitRange.value, splitPageCount.value)
            if (!pages.length) { ElMessage.warning('请输入有效的页面范围'); return }
            const newPdf = await PDFDocument.create()
            const copiedPages = await newPdf.copyPages(splitPdfDoc.value, pages.map(p => p - 1))
            copiedPages.forEach(p => newPdf.addPage(p))
            const bytes = await newPdf.save()
            downloadBlob(new Blob([bytes], { type: 'application/pdf' }), `${splitFile.value.name.replace('.pdf', '')}_extracted.pdf`)
            ElMessage.success('提取完成')
        }
    } catch (e) { console.error(e); ElMessage.error('拆分失败') }
    finally { splitLoading.value = false }
}


const triggerMergeUpload = () => mergeFileRef.value?.click()
const handleMergeDrop = (e) => addMergeFiles(Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf'))
const handleMergeUpload = (e) => { addMergeFiles(Array.from(e.target.files)); e.target.value = '' }
const addMergeFiles = (files) => files.forEach(f => mergeFiles.value.push({ id: ++mergeId, file: f, name: f.name }))
const removeMergeFile = (i) => mergeFiles.value.splice(i, 1)
const clearMergeFiles = () => { mergeFiles.value = [] }

const executeMerge = async () => {
    if (mergeFiles.value.length < 2) { ElMessage.warning('至少需要2个PDF文件'); return }
    mergeLoading.value = true
    try {
        const merged = await PDFDocument.create()
        for (const f of mergeFiles.value) {
            const bytes = await f.file.arrayBuffer()
            const doc = await PDFDocument.load(bytes)
            const pages = await merged.copyPages(doc, doc.getPageIndices())
            pages.forEach(p => merged.addPage(p))
        }
        const bytes = await merged.save()
        downloadBlob(new Blob([bytes], { type: 'application/pdf' }), 'merged.pdf')
        ElMessage.success('合并完成')
    } catch (e) { console.error(e); ElMessage.error('合并失败') }
    finally { mergeLoading.value = false }
}

const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
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
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
}

.main-tabs :deep(.el-tabs__header) {
    margin-bottom: 1.5rem;
}

.tab-content {
    min-height: 500px;
}

.workbench {
    min-height: 450px;
    padding: 1.5rem;
}

.upload-placeholder {
    height: 100%;
    min-height: 380px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
}

.upload-placeholder:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.upload-icon {
    font-size: 4rem;
    color: #ef4444;
    margin-bottom: 1rem;
}

.file-loaded,
.files-loaded {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.file-info-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    margin-bottom: 1.5rem;
}

.pdf-icon {
    font-size: 2.5rem;
    color: #ef4444;
}

.pdf-icon-sm {
    font-size: 1.25rem;
    color: #ef4444;
}

.file-details {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.file-name {
    font-weight: 600;
    color: #1e293b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.file-meta {
    font-size: 0.85rem;
    color: #64748b;
}

.split-options {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1.5rem;
}

.option-group {
    margin-bottom: 1rem;
}

.label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
}

.files-toolbar {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.files-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 300px;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
}

.drag-handle {
    cursor: grab;
    color: #94a3b8;
}

.file-index {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #3b82f6;
    color: white;
    font-size: 0.7rem;
    font-weight: 600;
    border-radius: 50%;
}

.glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>
