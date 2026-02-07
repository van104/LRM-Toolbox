<template>
    <div class="tool-page">
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack"><el-icon>
                        <ArrowLeft />
                    </el-icon><span>返回</span></el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">IP 子网计算器</h1>
                <span class="tool-subtitle">Subnet Calculator</span>
            </div>
            <div class="header-right"></div>
        </header>

        <main class="tool-content">
            <div class="layout-container">
                <div class="workbench glass-card">
                    <div class="input-section">
                        <h3>输入 IP 地址</h3>
                        <div class="ip-input-group">
                            <el-input v-model="ipAddress" placeholder="192.168.1.0" size="large" @input="calculate">
                                <template #prepend>IP 地址</template>
                            </el-input>
                            <span class="separator">/</span>
                            <el-select v-model="cidr" size="large" style="width: 120px;" @change="calculate">
                                <el-option v-for="n in 32" :key="n" :label="`/${n}`" :value="n" />
                            </el-select>
                        </div>
                        <div class="quick-masks">
                            <span class="label">常用掩码：</span>
                            <el-tag v-for="c in [8, 16, 24, 25, 26, 27, 28, 29, 30]" :key="c"
                                :type="cidr === c ? 'primary' : 'info'" @click="cidr = c; calculate()"
                                style="cursor:pointer; margin-right: 8px;">
                                /{{ c }}
                            </el-tag>
                        </div>
                    </div>

                    <el-divider />

                    <div v-if="result" class="result-section">
                        <h3>计算结果</h3>
                        <div class="result-grid">
                            <div class="result-item">
                                <div class="result-label">网络地址</div>
                                <div class="result-value">{{ result.networkAddress }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">广播地址</div>
                                <div class="result-value">{{ result.broadcastAddress }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">子网掩码</div>
                                <div class="result-value">{{ result.subnetMask }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">通配符掩码</div>
                                <div class="result-value">{{ result.wildcardMask }}</div>
                            </div>
                            <div class="result-item full-width">
                                <div class="result-label">可用 IP 范围</div>
                                <div class="result-value highlight">{{ result.firstHost }} - {{ result.lastHost }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">可用主机数</div>
                                <div class="result-value">{{ result.totalHosts.toLocaleString() }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">IP 类别</div>
                                <div class="result-value">{{ result.ipClass }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">二进制子网掩码</div>
                                <div class="result-value binary">{{ result.binaryMask }}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">是否私有地址</div>
                                <div class="result-value">{{ result.isPrivate ? '是 (Private)' : '否 (Public)' }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-panel glass-card">
                    <h3 class="panel-title">CIDR 速查表</h3>
                    <div class="cidr-table">
                        <div class="table-header">
                            <span>CIDR</span>
                            <span>掩码</span>
                            <span>主机数</span>
                        </div>
                        <div v-for="item in cidrTable" :key="item.cidr" class="table-row"
                            :class="{ active: cidr === item.cidr }">
                            <span>/{{ item.cidr }}</span>
                            <span>{{ item.mask }}</span>
                            <span>{{ item.hosts }}</span>
                        </div>
                    </div>
                    <div class="tips-section">
                        <h4>提示</h4>
                        <ul>
                            <li>CIDR 表示法: IP/前缀长度</li>
                            <li>前缀长度越大，子网越小</li>
                            <li>/24 = 256 个地址 (254 可用)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
        <footer class="footer">© 2026 LRM工具箱 - IP 子网计算器</footer>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const goBack = () => router.back()

const ipAddress = ref('192.168.1.0')
const cidr = ref(24)
const result = ref(null)

const cidrTable = [
    { cidr: 8, mask: '255.0.0.0', hosts: '16,777,214' },
    { cidr: 16, mask: '255.255.0.0', hosts: '65,534' },
    { cidr: 24, mask: '255.255.255.0', hosts: '254' },
    { cidr: 25, mask: '255.255.255.128', hosts: '126' },
    { cidr: 26, mask: '255.255.255.192', hosts: '62' },
    { cidr: 27, mask: '255.255.255.224', hosts: '30' },
    { cidr: 28, mask: '255.255.255.240', hosts: '14' },
    { cidr: 29, mask: '255.255.255.248', hosts: '6' },
    { cidr: 30, mask: '255.255.255.252', hosts: '2' },
    { cidr: 31, mask: '255.255.255.254', hosts: '0' },
    { cidr: 32, mask: '255.255.255.255', hosts: '1' },
]

const ipToInt = (ip) => {
    const parts = ip.split('.').map(Number)
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

const intToIp = (int) => {
    return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.')
}

const calculate = () => {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/
    if (!ipPattern.test(ipAddress.value)) {
        result.value = null
        return
    }

    const parts = ipAddress.value.split('.').map(Number)
    if (parts.some(p => p > 255)) {
        result.value = null
        return
    }

    const ip = ipToInt(ipAddress.value)
    const maskInt = (0xFFFFFFFF << (32 - cidr.value)) >>> 0
    const wildcardInt = ~maskInt >>> 0

    const networkInt = (ip & maskInt) >>> 0
    const broadcastInt = (networkInt | wildcardInt) >>> 0

    const totalAddresses = Math.pow(2, 32 - cidr.value)
    const totalHosts = cidr.value >= 31 ? (cidr.value === 32 ? 1 : 0) : totalAddresses - 2

    const firstHost = cidr.value >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1)
    const lastHost = cidr.value >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1)

    
    const firstOctet = parts[0]
    let ipClass = 'E'
    if (firstOctet < 128) ipClass = 'A'
    else if (firstOctet < 192) ipClass = 'B'
    else if (firstOctet < 224) ipClass = 'C'
    else if (firstOctet < 240) ipClass = 'D (组播)'

    
    const isPrivate = (firstOctet === 10) ||
        (firstOctet === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (firstOctet === 192 && parts[1] === 168) ||
        (firstOctet === 127)

    
    const binaryMask = [
        ((maskInt >>> 24) & 255).toString(2).padStart(8, '0'),
        ((maskInt >>> 16) & 255).toString(2).padStart(8, '0'),
        ((maskInt >>> 8) & 255).toString(2).padStart(8, '0'),
        (maskInt & 255).toString(2).padStart(8, '0')
    ].join('.')

    result.value = {
        networkAddress: intToIp(networkInt),
        broadcastAddress: intToIp(broadcastInt),
        subnetMask: intToIp(maskInt),
        wildcardMask: intToIp(wildcardInt),
        firstHost,
        lastHost,
        totalHosts,
        ipClass,
        isPrivate,
        binaryMask
    }
}

onMounted(calculate)
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
    grid-template-columns: 1fr 340px;
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

.ip-input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.separator {
    font-size: 1.5rem;
    color: #64748b;
    font-weight: 300;
}

.quick-masks {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.quick-masks .label {
    font-size: 0.85rem;
    color: #64748b;
}

.result-section h3 {
    margin: 0 0 1rem;
    font-size: 1rem;
    color: #1e293b;
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.result-item {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.result-item.full-width {
    grid-column: 1 / -1;
}

.result-label {
    font-size: 0.8rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.result-value {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    font-family: 'Consolas', monospace;
}

.result-value.highlight {
    color: #3b82f6;
    font-size: 1.1rem;
}

.result-value.binary {
    font-size: 0.85rem;
    word-break: break-all;
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

.cidr-table {
    background: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
}

.table-header,
.table-row {
    display: grid;
    grid-template-columns: 1fr 2fr 1.5fr;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
}

.table-header {
    background: #e2e8f0;
    font-weight: 600;
    color: #475569;
}

.table-row {
    border-bottom: 1px solid #e2e8f0;
    color: #64748b;
}

.table-row.active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 600;
}

.table-row:last-child {
    border-bottom: none;
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
