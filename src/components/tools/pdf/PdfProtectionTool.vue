<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">PDF 密码保护与移除</h1>
                <span class="tool-subtitle">PDF Protection & Unlock</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container center-layout">
                <div class="workbench glass-card">
                    <el-tabs v-model="activeTab" class="action-tabs">
                        <el-tab-pane label="加密保护" name="encrypt">
                            <div class="tab-content">
                                <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
                                    <el-icon class="upload-icon">
                                        <Lock />
                                    </el-icon>
                                    <h3>选择 PDF 进行加密</h3>
                                    <p class="hint">支持设置打开密码和权限密码</p>
                                </div>
                                <div v-else class="file-ready">
                                    <div class="file-info">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <span>{{ pdfFile.name }} ({{ (pdfFile.size / 1024 / 1024).toFixed(2) }}
                                            MB)</span>
                                        <el-button text type="danger" @click="clearFile">移除</el-button>
                                    </div>

                                    <div class="form-section">
                                        <div class="form-item">
                                            <span class="label">打开密码 (User Password) <el-tag size="small"
                                                    type="danger">必填</el-tag></span>
                                            <el-input v-model="encryptConfig.userPassword" type="password" show-password
                                                placeholder="设置文件打开密码" />
                                        </div>
                                        <div class="form-item">
                                            <span class="label">权限密码 (Owner Password)</span>
                                            <el-input v-model="encryptConfig.ownerPassword" type="password"
                                                show-password placeholder="可选，用于限制编辑/打印权限" />
                                        </div>
                                    </div>

                                    
                                    <div class="security-tips">
                                        <el-alert type="info" :closable="false" show-icon>
                                            <template #title>
                                                <span class="tip-title">🔒 安全说明</span>
                                            </template>
                                            <ul class="tip-list">
                                                <li><strong>本地处理</strong>：文件仅在您的浏览器中处理，不会上传到服务器</li>
                                                <li><strong>加密算法</strong>：使用 RC4 128-bit 加密（PDF 标准）</li>
                                                <li><strong>密码建议</strong>：建议使用 8 位以上包含字母和数字的强密码</li>
                                            </ul>
                                        </el-alert>
                                    </div>

                                    <el-button type="primary" size="large" class="action-btn" :loading="processing"
                                        @click="handleEncrypt" :disabled="!encryptConfig.userPassword">
                                        加密并下载
                                    </el-button>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="移除密码" name="decrypt">
                            <div class="tab-content">
                                <div v-if="!pdfFile" class="upload-placeholder" @click="triggerUpload">
                                    <el-icon class="upload-icon">
                                        <Unlock />
                                    </el-icon>
                                    <h3>选择 PDF 移除密码</h3>
                                    <p class="hint">输入正确的密码后可移除保护</p>
                                </div>
                                <div v-else class="file-ready">
                                    <div class="file-info">
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                        <span>{{ pdfFile.name }}</span>
                                        <el-button text type="danger" @click="clearFile">移除</el-button>
                                    </div>

                                    <div class="form-section">
                                        <div class="form-item">
                                            <span class="label">当前密码</span>
                                            <el-input v-model="decryptPassword" type="password" show-password
                                                placeholder="输入当前打开密码以解锁" />
                                        </div>
                                    </div>

                                    
                                    <div class="security-tips">
                                        <el-alert type="warning" :closable="false" show-icon>
                                            <template #title>
                                                <span class="tip-title">⚠️ 注意事项</span>
                                            </template>
                                            <ul class="tip-list">
                                                <li>移除密码后，PDF 中的<strong>文本将转为图片</strong></li>
                                                <li>仅在您拥有合法访问权限时使用此功能</li>
                                                <li>处理完全在本地进行，密码不会被记录</li>
                                            </ul>
                                        </el-alert>
                                    </div>

                                    <el-button type="success" size="large" class="action-btn" :loading="processing"
                                        @click="handleDecrypt">
                                        移除密码并下载
                                    </el-button>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    <input type="file" ref="fileRef" hidden accept=".pdf" @change="handleUpload" />
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - PDF 密码工具</footer>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Lock, Unlock, Document } from '@element-plus/icons-vue'
import { PDFDocument } from 'pdf-lib'
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goBack = () => router.back()

const activeTab = ref('encrypt')
const fileRef = ref(null)
const pdfFile = ref(null)
const pdfBytes = ref(null)
const processing = ref(false)

const encryptConfig = reactive({
    userPassword: '',
    ownerPassword: ''
})

const decryptPassword = ref('')

const triggerUpload = () => fileRef.value?.click()
const clearFile = () => {
    pdfFile.value = null
    pdfBytes.value = null
    fileRef.value.value = ''
    decryptPassword.value = ''
    encryptConfig.userPassword = ''
    encryptConfig.ownerPassword = ''
}

const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') return ElMessage.error('请上传 PDF 文件')

    pdfFile.value = file
    const buffer = await file.arrayBuffer()
    pdfBytes.value = new Uint8Array(buffer)
}

const handleEncrypt = async () => {
    if (!encryptConfig.userPassword) {
        return ElMessage.warning('请设置打开密码')
    }

    processing.value = true
    try {
        
        
        const encryptedBytes = await encryptPDF(
            pdfBytes.value,
            encryptConfig.userPassword,
            encryptConfig.ownerPassword || encryptConfig.userPassword
        )

        downloadFile(encryptedBytes, `encrypted_${pdfFile.value.name}`)
        ElMessage.success('加密成功！打开此 PDF 需要输入密码。')
    } catch (e) {
        console.error(e)
        ElMessage.error('加密失败: ' + e.message)
    } finally {
        processing.value = false
    }
}

const handleDecrypt = async () => {
    if (!decryptPassword.value) return ElMessage.warning('请输入当前密码')

    processing.value = true
    try {
        
        const pdfjsLib = (await import('@/utils/pdf')).default

        const loadingTask = pdfjsLib.getDocument({
            data: pdfBytes.value,
            password: decryptPassword.value
        })

        const pdfDocProxy = await loadingTask.promise

        
        const newPdfDoc = await PDFDocument.create()
        const numPages = pdfDocProxy.numPages

        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        for (let i = 1; i <= numPages; i++) {
            const page = await pdfDocProxy.getPage(i)
            const viewport = page.getViewport({ scale: 2 }) 

            canvas.width = viewport.width
            canvas.height = viewport.height

            await page.render({ canvasContext: ctx, viewport }).promise

            
            const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92)
            const imgBytes = await fetch(imgDataUrl).then(r => r.arrayBuffer())
            const jpgImage = await newPdfDoc.embedJpg(imgBytes)

            
            const origViewport = page.getViewport({ scale: 1 })
            const newPage = newPdfDoc.addPage([origViewport.width, origViewport.height])
            newPage.drawImage(jpgImage, {
                x: 0, y: 0,
                width: origViewport.width,
                height: origViewport.height
            })
        }

        const unlockedBytes = await newPdfDoc.save()
        downloadFile(unlockedBytes, `unlocked_${pdfFile.value.name}`)
        ElMessage.success('密码移除成功！(注意：文本已转为图片)')
    } catch (e) {
        console.error(e)
        if (e.name === 'PasswordException' || (e.message && e.message.includes('password'))) {
            ElMessage.error('密码错误，请重试')
        } else {
            ElMessage.error('解锁失败: ' + e.message)
        }
    } finally {
        processing.value = false
    }
}

const downloadFile = (data, filename) => {
    const blob = new Blob([data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
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
    width: 100%;
    display: flex;
    justify-content: center;
}

.layout-container {
    width: 100%;
    max-width: 600px;
}

.workbench {
    background: #fff;
    padding: 2rem;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

.file-ready {
    animation: fadeIn 0.3s ease;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.file-info .el-icon {
    font-size: 1.5rem;
    color: #3b82f6;
}

.file-info span {
    flex: 1;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.form-item .label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #334155;
}

.action-btn {
    width: 100%;
    font-weight: 600;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.security-tips {
    margin-bottom: 1.5rem;
}

.security-tips .tip-title {
    font-weight: 600;
}

.security-tips .tip-list {
    margin: 0.5rem 0 0 0;
    padding-left: 1.2rem;
    font-size: 0.85rem;
    line-height: 1.8;
}

.security-tips .tip-list li {
    color: #475569;
}

.glass-card {
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}
</style>