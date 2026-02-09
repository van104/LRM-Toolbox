<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">User Agent 分析器</h1>
                <span class="tool-subtitle">UA Parser</span>
            </div>
            <div class="header-right">
                <el-button type="primary" @click="useCurrentUA">使用当前浏览器 UA</el-button>
            </div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div class="input-section">
                        <h3>输入 User Agent 字符串</h3>
                        <el-input
v-model="uaString" type="textarea" :rows="4" placeholder="粘贴 User Agent 字符串..."
                            @input="parseUA" />
                        <div class="input-actions">
                            <el-button text type="primary" @click="useCurrentUA">获取当前 UA</el-button>
                            <el-button text @click="clearUA">清空</el-button>
                        </div>
                    </div>

                    <el-divider />

                    <div v-if="result" class="result-section">
                        <h3>解析结果</h3>
                        <div class="result-cards">
                            <div class="info-card browser">
                                <div class="card-icon"><el-icon>
                                        <Monitor />
                                    </el-icon></div>
                                <div class="card-content">
                                    <div class="card-label">浏览器</div>
                                    <div class="card-value">{{ result.browser.name || '未知' }}</div>
                                    <div class="card-sub">版本: {{ result.browser.version || '-' }}</div>
                                </div>
                            </div>
                            <div class="info-card os">
                                <div class="card-icon"><el-icon>
                                        <Platform />
                                    </el-icon></div>
                                <div class="card-content">
                                    <div class="card-label">操作系统</div>
                                    <div class="card-value">{{ result.os.name || '未知' }}</div>
                                    <div class="card-sub">版本: {{ result.os.version || '-' }}</div>
                                </div>
                            </div>
                            <div class="info-card device">
                                <div class="card-icon"><el-icon>
                                        <Cellphone />
                                    </el-icon></div>
                                <div class="card-content">
                                    <div class="card-label">设备类型</div>
                                    <div class="card-value">{{ result.device.type || '桌面设备' }}</div>
                                    <div class="card-sub">{{ result.device.vendor || '-' }} {{ result.device.model || ''
                                        }}</div>
                                </div>
                            </div>
                            <div class="info-card engine">
                                <div class="card-icon"><el-icon>
                                        <Cpu />
                                    </el-icon></div>
                                <div class="card-content">
                                    <div class="card-label">渲染引擎</div>
                                    <div class="card-value">{{ result.engine.name || '未知' }}</div>
                                    <div class="card-sub">版本: {{ result.engine.version || '-' }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="detail-table">
                            <h4>详细信息</h4>
                            <div v-for="(value, key) in flatResult" :key="key" class="table-row">
                                <span class="key">{{ key }}</span>
                                <span class="value">{{ value || '-' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-panel glass-card">
                    <h3 class="panel-title">常见 UA 示例</h3>
                    <div class="ua-examples">
                        <div
v-for="(ua, idx) in uaExamples" :key="idx" class="ua-example"
                            @click="uaString = ua.value; parseUA()">
                            <div class="ua-name">{{ ua.name }}</div>
                            <div class="ua-preview">{{ ua.value.substring(0, 50) }}...</div>
                        </div>
                    </div>
                    <div class="tips-section">
                        <h4>什么是 User Agent?</h4>
                        <p>User Agent 是浏览器向服务器发送的标识字符串，包含浏览器类型、版本、操作系统等信息。</p>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - User Agent 分析器</footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Monitor, Platform, Cellphone, Cpu } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const uaString = ref('')
const result = ref(null)

const uaExamples = [
    { name: 'Chrome Windows', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    { name: 'Safari macOS', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15' },
    { name: 'iPhone Safari', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' },
    { name: 'Android Chrome', value: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36' },
    { name: 'Firefox Linux', value: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0' },
]

const flatResult = computed(() => {
    if (!result.value) return {}
    return {
        '浏览器名称': result.value.browser.name,
        '浏览器版本': result.value.browser.version,
        '操作系统': result.value.os.name,
        '系统版本': result.value.os.version,
        '设备类型': result.value.device.type || '桌面设备',
        '设备厂商': result.value.device.vendor,
        '设备型号': result.value.device.model,
        '渲染引擎': result.value.engine.name,
        '引擎版本': result.value.engine.version,
        'CPU 架构': result.value.cpu.architecture
    }
})

const parseUA = () => {
    if (!uaString.value.trim()) {
        result.value = null
        return
    }

    const ua = uaString.value

    
    const browser = { name: '', version: '' }
    const os = { name: '', version: '' }
    const device = { type: '', vendor: '', model: '' }
    const engine = { name: '', version: '' }
    const cpu = { architecture: '' }

    
    if (/Edg\/(\d+[\.\d]*)/.test(ua)) { browser.name = 'Edge'; browser.version = RegExp.$1 }
    else if (/OPR\/(\d+[\.\d]*)/.test(ua)) { browser.name = 'Opera'; browser.version = RegExp.$1 }
    else if (/Chrome\/(\d+[\.\d]*)/.test(ua)) { browser.name = 'Chrome'; browser.version = RegExp.$1 }
    else if (/Firefox\/(\d+[\.\d]*)/.test(ua)) { browser.name = 'Firefox'; browser.version = RegExp.$1 }
    else if (/Version\/(\d+[\.\d]*).*Safari/.test(ua)) { browser.name = 'Safari'; browser.version = RegExp.$1 }
    else if (/MSIE\s(\d+[\.\d]*)/.test(ua)) { browser.name = 'IE'; browser.version = RegExp.$1 }
    else if (/Trident.*rv:(\d+[\.\d]*)/.test(ua)) { browser.name = 'IE'; browser.version = RegExp.$1 }

    
    if (/Windows NT 10/.test(ua)) { os.name = 'Windows'; os.version = '10/11' }
    else if (/Windows NT 6\.3/.test(ua)) { os.name = 'Windows'; os.version = '8.1' }
    else if (/Windows NT 6\.2/.test(ua)) { os.name = 'Windows'; os.version = '8' }
    else if (/Windows NT 6\.1/.test(ua)) { os.name = 'Windows'; os.version = '7' }
    else if (/Mac OS X ([\d_]+)/.test(ua)) { os.name = 'macOS'; os.version = RegExp.$1.replace(/_/g, '.') }
    else if (/Android ([\d\.]+)/.test(ua)) { os.name = 'Android'; os.version = RegExp.$1 }
    else if (/iPhone OS ([\d_]+)/.test(ua)) { os.name = 'iOS'; os.version = RegExp.$1.replace(/_/g, '.') }
    else if (/iPad.*OS ([\d_]+)/.test(ua)) { os.name = 'iPadOS'; os.version = RegExp.$1.replace(/_/g, '.') }
    else if (/Linux/.test(ua)) { os.name = 'Linux'; os.version = '' }

    
    if (/Mobile|Android.*Mobile|iPhone/.test(ua)) device.type = '手机'
    else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) device.type = '平板'
    else if (/Smart-TV|SmartTV|GoogleTV|HbbTV/.test(ua)) device.type = '智能电视'
    else device.type = '桌面设备'

    
    if (/iPhone/.test(ua)) { device.vendor = 'Apple'; device.model = 'iPhone' }
    else if (/iPad/.test(ua)) { device.vendor = 'Apple'; device.model = 'iPad' }
    else if (/SM-([A-Z0-9]+)/.test(ua)) { device.vendor = 'Samsung'; device.model = RegExp.$1 }
    else if (/Pixel\s?([\w]+)?/.test(ua)) { device.vendor = 'Google'; device.model = 'Pixel ' + (RegExp.$1 || '') }
    else if (/Macintosh/.test(ua)) { device.vendor = 'Apple'; device.model = 'Mac' }

    
    if (/AppleWebKit\/(\d+[\.\d]*)/.test(ua)) { engine.name = 'WebKit'; engine.version = RegExp.$1 }
    else if (/Gecko\/(\d+)/.test(ua)) { engine.name = 'Gecko'; engine.version = RegExp.$1 }
    else if (/Trident\/(\d+[\.\d]*)/.test(ua)) { engine.name = 'Trident'; engine.version = RegExp.$1 }

    
    if (/x86_64|x64|Win64|WOW64/.test(ua)) cpu.architecture = 'x64'
    else if (/arm64|aarch64/.test(ua)) cpu.architecture = 'ARM64'
    else if (/arm/.test(ua)) cpu.architecture = 'ARM'
    else if (/i686|i386/.test(ua)) cpu.architecture = 'x86'

    result.value = { browser, os, device, engine, cpu }
}

const useCurrentUA = () => {
    uaString.value = navigator.userAgent
    parseUA()
}

const clearUA = () => {
    uaString.value = ''
    result.value = null
}

onMounted(useCurrentUA)
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
    grid-template-columns: 1fr 360px;
    gap: 1.5rem;
}

.workbench {
    padding: 1.5rem;
}

.input-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #1e293b;
}

.input-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.75rem;
}

.result-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #1e293b;
}

.result-cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.info-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}

.card-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.info-card.browser .card-icon {
    background: #dbeafe;
    color: #2563eb;
}

.info-card.os .card-icon {
    background: #dcfce7;
    color: #16a34a;
}

.info-card.device .card-icon {
    background: #fef3c7;
    color: #d97706;
}

.info-card.engine .card-icon {
    background: #f3e8ff;
    color: #9333ea;
}

.card-label {
    font-size: 0.75rem;
    color: #64748b;
}

.card-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
}

.card-sub {
    font-size: 0.8rem;
    color: #94a3b8;
}

.detail-table {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1rem;
}

.detail-table h4 {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: #475569;
}

.table-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.85rem;
}

.table-row:last-child {
    border-bottom: none;
}

.table-row .key {
    color: #64748b;
}

.table-row .value {
    color: #1e293b;
    font-weight: 500;
    font-family: 'Consolas', monospace;
}

.settings-panel {
    padding: 1.5rem;
}

.panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem;
}

.ua-examples {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.ua-example {
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s;
}

.ua-example:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.ua-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.ua-preview {
    font-size: 0.75rem;
    color: #64748b;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tips-section {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
}

.tips-section h4 {
    font-size: 0.9rem;
    margin: 0 0 0.5rem;
    color: #475569;
}

.tips-section p {
    margin: 0;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.6;
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

    .result-cards {
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
