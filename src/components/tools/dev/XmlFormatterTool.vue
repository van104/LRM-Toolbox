<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">XML 格式化工具</h1>
                <span class="tool-subtitle">XML Formatter & Converter</span>
            </div>
            <div class="header-right">
                <el-button-group>
                    <el-button @click="formatXml" :disabled="!inputText"><el-icon>
                            <MagicStick />
                        </el-icon> 格式化</el-button>
                    <el-button @click="minifyXml" :disabled="!inputText"><el-icon>
                            <Minus />
                        </el-icon> 压缩</el-button>
                </el-button-group>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="editor-panel glass-card">
                    <div class="panel-header">
                        <span class="panel-title">输入 XML</span>
                        <div class="panel-actions">
                            <el-button text size="small" @click="loadSample">加载示例</el-button>
                            <el-button text size="small" @click="clearInput">清空</el-button>
                        </div>
                    </div>
                    <el-input v-model="inputText" type="textarea" :rows="20" placeholder="粘贴 XML 内容..."
                        @input="autoValidate" />
                    <div class="validation-status" :class="validationStatus.type">
                        <el-icon v-if="validationStatus.type === 'success'">
                            <CircleCheck />
                        </el-icon>
                        <el-icon v-else-if="validationStatus.type === 'error'">
                            <CircleClose />
                        </el-icon>
                        <span>{{ validationStatus.message }}</span>
                    </div>
                </div>

                <div class="editor-panel glass-card">
                    <div class="panel-header">
                        <span class="panel-title">输出结果</span>
                        <div class="panel-actions">
                            <el-button text size="small" type="primary" @click="copyOutput"
                                :disabled="!outputText">复制</el-button>
                            <el-button text size="small" @click="downloadOutput" :disabled="!outputText">下载</el-button>
                        </div>
                    </div>
                    <el-input v-model="outputText" type="textarea" :rows="20" readonly placeholder="输出结果..." />
                </div>
            </div>

            <div class="converter-section glass-card">
                <h3>XML ⇄ JSON 互转</h3>
                <div class="converter-actions">
                    <el-button type="primary" @click="xmlToJson" :disabled="!inputText">
                        <el-icon>
                            <Right />
                        </el-icon> XML → JSON
                    </el-button>
                    <el-button type="success" @click="jsonToXml" :disabled="!inputText">
                        <el-icon>
                            <Right />
                        </el-icon> JSON → XML
                    </el-button>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - XML 格式化工具</footer>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, MagicStick, Minus, CircleCheck, CircleClose, Right } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const inputText = ref('')
const outputText = ref('')
const validationStatus = reactive({ type: '', message: '等待输入...' })

const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="fiction">
    <title lang="en">Harry Potter</title>
    <author>J.K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`

const loadSample = () => { inputText.value = sampleXml; autoValidate() }
const clearInput = () => { inputText.value = ''; outputText.value = ''; validationStatus.type = ''; validationStatus.message = '等待输入...' }

const parseXml = (xml) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
    const errorNode = doc.querySelector('parsererror')
    if (errorNode) throw new Error(errorNode.textContent)
    return doc
}

const autoValidate = () => {
    if (!inputText.value.trim()) {
        validationStatus.type = ''
        validationStatus.message = '等待输入...'
        return
    }
    try {
        parseXml(inputText.value)
        validationStatus.type = 'success'
        validationStatus.message = 'XML 格式正确'
    } catch (e) {
        validationStatus.type = 'error'
        validationStatus.message = 'XML 格式错误'
    }
}

const formatXml = () => {
    try {
        const doc = parseXml(inputText.value)
        const serializer = new XMLSerializer()
        let xml = serializer.serializeToString(doc)
        
        xml = xml.replace(/></g, '>\n<')
        const lines = xml.split('\n')
        let indent = 0
        const formatted = lines.map(line => {
            line = line.trim()
            if (!line) return ''
            if (line.startsWith('</')) indent--
            const result = '  '.repeat(Math.max(0, indent)) + line
            if (line.match(/^<[^/?][^>]*[^/]>$/) && !line.includes('</')) indent++
            return result
        }).filter(l => l).join('\n')
        outputText.value = formatted
        ElMessage.success('格式化成功')
    } catch (e) {
        ElMessage.error('格式化失败: ' + e.message)
    }
}

const minifyXml = () => {
    try {
        const doc = parseXml(inputText.value)
        const serializer = new XMLSerializer()
        let xml = serializer.serializeToString(doc)
        xml = xml.replace(/>\s+</g, '><').trim()
        outputText.value = xml
        ElMessage.success('压缩成功')
    } catch (e) {
        ElMessage.error('压缩失败: ' + e.message)
    }
}

const xmlToJson = () => {
    try {
        const doc = parseXml(inputText.value)
        const xmlToObj = (node) => {
            const obj = {}
            if (node.attributes) {
                for (const attr of node.attributes) {
                    obj['@' + attr.name] = attr.value
                }
            }
            for (const child of node.childNodes) {
                if (child.nodeType === 3) {
                    const text = child.textContent.trim()
                    if (text) obj['#text'] = text
                } else if (child.nodeType === 1) {
                    const childObj = xmlToObj(child)
                    if (obj[child.nodeName]) {
                        if (!Array.isArray(obj[child.nodeName])) obj[child.nodeName] = [obj[child.nodeName]]
                        obj[child.nodeName].push(childObj)
                    } else {
                        obj[child.nodeName] = childObj
                    }
                }
            }
            
            const keys = Object.keys(obj)
            if (keys.length === 1 && keys[0] === '#text') return obj['#text']
            return obj
        }
        const result = { [doc.documentElement.nodeName]: xmlToObj(doc.documentElement) }
        outputText.value = JSON.stringify(result, null, 2)
        ElMessage.success('转换成功')
    } catch (e) {
        ElMessage.error('转换失败: ' + e.message)
    }
}

const jsonToXml = () => {
    try {
        const json = JSON.parse(inputText.value)
        const objToXml = (obj, nodeName) => {
            if (typeof obj !== 'object' || obj === null) return `<${nodeName}>${obj}</${nodeName}>`
            if (Array.isArray(obj)) return obj.map(item => objToXml(item, nodeName)).join('\n')
            let attrs = '', children = ''
            for (const [key, val] of Object.entries(obj)) {
                if (key.startsWith('@')) attrs += ` ${key.slice(1)}="${val}"`
                else if (key === '#text') children += val
                else children += objToXml(val, key)
            }
            return `<${nodeName}${attrs}>${children}</${nodeName}>`
        }
        const rootKey = Object.keys(json)[0]
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n${objToXml(json[rootKey], rootKey)}`
        
        xml = xml.replace(/></g, '>\n<')
        outputText.value = xml
        ElMessage.success('转换成功')
    } catch (e) {
        ElMessage.error('JSON 解析失败: ' + e.message)
    }
}

const copyOutput = () => {
    navigator.clipboard.writeText(outputText.value)
    ElMessage.success('已复制到剪贴板')
}

const downloadOutput = () => {
    const blob = new Blob([outputText.value], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.xml'
    a.click()
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
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.layout-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.editor-panel {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
}

.panel-actions {
    display: flex;
    gap: 0.5rem;
}

.validation-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background: #f8fafc;
}

.validation-status.success {
    background: #dcfce7;
    color: #16a34a;
}

.validation-status.error {
    background: #fee2e2;
    color: #dc2626;
}

.converter-section {
    padding: 1.25rem;
}

.converter-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #1e293b;
    text-align: center;
}

.converter-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
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

:deep(.el-textarea__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.85rem;
}
</style>
