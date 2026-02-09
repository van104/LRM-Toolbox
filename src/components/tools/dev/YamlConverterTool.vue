<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">YAML 转换器</h1>
                <span class="tool-subtitle">YAML Converter</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="editor-panel glass-card">
                    <div class="panel-header">
                        <el-select v-model="inputFormat" size="small" style="width: 140px;">
                            <el-option label="YAML" value="yaml" />
                            <el-option label="JSON" value="json" />
                            <el-option label="Properties" value="properties" />
                        </el-select>
                        <div class="panel-actions">
                            <el-button text size="small" @click="loadSample">示例</el-button>
                            <el-button text size="small" @click="clearInput">清空</el-button>
                        </div>
                    </div>
                    <el-input
v-model="inputText" type="textarea" :rows="18"
                        :placeholder="`输入 ${inputFormat.toUpperCase()} 内容...`" />
                </div>

                <div class="convert-center">
                    <el-button type="primary" circle size="large" :disabled="!inputText" @click="convert">
                        <el-icon>
                            <Right />
                        </el-icon>
                    </el-button>
                    <el-button type="primary" circle size="large" @click="swap">
                        <el-icon>
                            <Switch />
                        </el-icon>
                    </el-button>
                </div>

                <div class="editor-panel glass-card">
                    <div class="panel-header">
                        <el-select v-model="outputFormat" size="small" style="width: 140px;">
                            <el-option label="YAML" value="yaml" />
                            <el-option label="JSON" value="json" />
                            <el-option label="Properties" value="properties" />
                        </el-select>
                        <div class="panel-actions">
                            <el-button
text size="small" type="primary" :disabled="!outputText"
                                @click="copyOutput">复制</el-button>
                            <el-button text size="small" :disabled="!outputText" @click="downloadOutput">下载</el-button>
                        </div>
                    </div>
                    <el-input v-model="outputText" type="textarea" :rows="18" readonly placeholder="转换结果..." />
                </div>
            </div>

            <div v-if="error" class="error-message glass-card">
                <el-icon>
                    <WarningFilled />
                </el-icon>
                <span>{{ error }}</span>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - YAML 转换器</footer>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Right, Switch, WarningFilled } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const inputText = ref('')
const outputText = ref('')
const inputFormat = ref('yaml')
const outputFormat = ref('json')
const error = ref('')

const samples = {
    yaml: `server:
  port: 8080
  host: localhost
database:
  driver: mysql
  url: jdbc:mysql://localhost:3306/mydb
  username: root
  password: secret
features:
  - name: auth
    enabled: true
  - name: cache
    enabled: false`,
    json: `{
  "server": {
    "port": 8080,
    "host": "localhost"
  },
  "database": {
    "driver": "mysql",
    "url": "jdbc:mysql://localhost:3306/mydb",
    "username": "root",
    "password": "secret"
  },
  "features": [
    { "name": "auth", "enabled": true },
    { "name": "cache", "enabled": false }
  ]
}`,
    properties: `server.port=8080
server.host=localhost
database.driver=mysql
database.url=jdbc:mysql://localhost:3306/mydb
database.username=root
database.password=secret`
}

const loadSample = () => {
    inputText.value = samples[inputFormat.value]
    error.value = ''
}

const clearInput = () => {
    inputText.value = ''
    outputText.value = ''
    error.value = ''
}


const parseYaml = (yaml) => {
    const lines = yaml.split('\n')
    const result = {}
    const stack = [{ indent: -1, obj: result }]
    let currentArray = null

    for (let line of lines) {
        if (!line.trim() || line.trim().startsWith('#')) continue

        const indent = line.search(/\S/)
        const content = line.trim()

        
        if (content.startsWith('- ')) {
            const value = content.slice(2).trim()
            while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
            const parent = stack[stack.length - 1]
            if (currentArray && currentArray.indent === indent) {
                if (value.includes(':')) {
                    const obj = {}
                    const [k, v] = value.split(':').map(s => s.trim())
                    obj[k] = parseValue(v)
                    currentArray.arr.push(obj)
                } else {
                    currentArray.arr.push(parseValue(value))
                }
            }
            continue
        }

        const colonIdx = content.indexOf(':')
        if (colonIdx === -1) continue

        const key = content.slice(0, colonIdx).trim()
        const value = content.slice(colonIdx + 1).trim()

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
        const parent = stack[stack.length - 1].obj

        if (value === '') {
            
            const nextLine = lines[lines.indexOf(line) + 1]
            if (nextLine && nextLine.trim().startsWith('-')) {
                parent[key] = []
                currentArray = { indent: nextLine.search(/\S/), arr: parent[key] }
            } else {
                parent[key] = {}
                stack.push({ indent, obj: parent[key] })
            }
        } else {
            parent[key] = parseValue(value)
        }
    }
    return result
}

const parseValue = (str) => {
    if (str === 'true') return true
    if (str === 'false') return false
    if (str === 'null') return null
    if (/^-?\d+$/.test(str)) return parseInt(str)
    if (/^-?\d*\.\d+$/.test(str)) return parseFloat(str)
    return str.replace(/^["']|["']$/g, '')
}

// 简单的 YAML 生成器
const toYaml = (obj, indent = 0) => {
    const pad = '  '.repeat(indent)
    let result = ''
    for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            result += `${pad}${key}:\n`
            for (const item of value) {
                if (typeof item === 'object') {
                    const entries = Object.entries(item)
                    result += `${pad}  - ${entries[0][0]}: ${entries[0][1]}\n`
                    for (let i = 1; i < entries.length; i++) {
                        result += `${pad}    ${entries[i][0]}: ${entries[i][1]}\n`
                    }
                } else {
                    result += `${pad}  - ${item}\n`
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            result += `${pad}${key}:\n${toYaml(value, indent + 1)}`
        } else {
            result += `${pad}${key}: ${value}\n`
        }
    }
    return result
}

// Properties 解析
const parseProperties = (props) => {
    const result = {}
    for (const line of props.split('\n')) {
        if (!line.trim() || line.trim().startsWith('#')) continue
        const eqIdx = line.indexOf('=')
        if (eqIdx === -1) continue
        const key = line.slice(0, eqIdx).trim()
        const value = line.slice(eqIdx + 1).trim()
        const parts = key.split('.')
        let obj = result
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {}
            obj = obj[parts[i]]
        }
        obj[parts[parts.length - 1]] = parseValue(value)
    }
    return result
}

// Properties 生成
const toProperties = (obj, prefix = '') => {
    let result = ''
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result += toProperties(value, fullKey)
        } else {
            result += `${fullKey}=${value}\n`
        }
    }
    return result
}

const convert = () => {
    error.value = ''
    try {
        let data
        // 解析输入
        if (inputFormat.value === 'yaml') {
            data = parseYaml(inputText.value)
        } else if (inputFormat.value === 'json') {
            data = JSON.parse(inputText.value)
        } else {
            data = parseProperties(inputText.value)
        }

        // 生成输出
        if (outputFormat.value === 'yaml') {
            outputText.value = toYaml(data)
        } else if (outputFormat.value === 'json') {
            outputText.value = JSON.stringify(data, null, 2)
        } else {
            outputText.value = toProperties(data)
        }
        ElMessage.success('转换成功')
    } catch (e) {
        error.value = e.message
        ElMessage.error('转换失败')
    }
}

const swap = () => {
    [inputFormat.value, outputFormat.value] = [outputFormat.value, inputFormat.value]
    if (outputText.value) {
        inputText.value = outputText.value
        outputText.value = ''
    }
}

const copyOutput = () => {
    navigator.clipboard.writeText(outputText.value)
    ElMessage.success('已复制到剪贴板')
}

const downloadOutput = () => {
    const ext = { yaml: 'yml', json: 'json', properties: 'properties' }
    const blob = new Blob([outputText.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output.${ext[outputFormat.value]}`
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
    grid-template-columns: 1fr auto 1fr;
    gap: 1rem;
    align-items: center;
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

.panel-actions {
    display: flex;
    gap: 0.5rem;
}

.convert-center {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
}

.error-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    margin-top: 1rem;
    background: #fee2e2;
    color: #dc2626;
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

    .convert-center {
        flex-direction: row;
        justify-content: center;
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
