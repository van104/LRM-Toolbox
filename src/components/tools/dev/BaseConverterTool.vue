<template>
    <div class="base-converter-tool">
        
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>进制转换器</h1>
                <span class="nav-subtitle">Base Converter</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            
            <section class="converter-card glass-card">
                <div class="input-group" :class="{ error: errors.dec }">
                    <label>
                        <span class="label-text">十进制 (Decimal)</span>
                        <span class="base-tag">DEC</span>
                    </label>
                    <div class="input-wrapper">
                        <input type="text" v-model="values.dec" @input="handleInput('dec')" placeholder="例如: 255"
                            class="base-input" />
                        <button class="copy-btn" @click="copy(values.dec)" title="复制">
                            <el-icon>
                                <CopyDocument />
                            </el-icon>
                        </button>
                    </div>
                </div>

                <div class="input-group" :class="{ error: errors.hex }">
                    <label>
                        <span class="label-text">十六进制 (Hexadecimal)</span>
                        <span class="base-tag">HEX</span>
                    </label>
                    <div class="input-wrapper">
                        <span class="prefix">0x</span>
                        <input type="text" v-model="values.hex" @input="handleInput('hex')" placeholder="例如: FF"
                            class="base-input" />
                        <button class="copy-btn" @click="copy(values.hex)" title="复制">
                            <el-icon>
                                <CopyDocument />
                            </el-icon>
                        </button>
                    </div>
                </div>

                <div class="input-group" :class="{ error: errors.bin }">
                    <label>
                        <span class="label-text">二进制 (Binary)</span>
                        <span class="base-tag">BIN</span>
                    </label>
                    <div class="input-wrapper">
                        <input type="text" v-model="values.bin" @input="handleInput('bin')" placeholder="例如: 11111111"
                            class="base-input font-mono" />
                        <button class="copy-btn" @click="copy(values.bin)" title="复制">
                            <el-icon>
                                <CopyDocument />
                            </el-icon>
                        </button>
                    </div>
                </div>

                <div class="input-group" :class="{ error: errors.oct }">
                    <label>
                        <span class="label-text">八进制 (Octal)</span>
                        <span class="base-tag">OCT</span>
                    </label>
                    <div class="input-wrapper">
                        <span class="prefix">0</span>
                        <input type="text" v-model="values.oct" @input="handleInput('oct')" placeholder="例如: 377"
                            class="base-input" />
                        <button class="copy-btn" @click="copy(values.oct)" title="复制">
                            <el-icon>
                                <CopyDocument />
                            </el-icon>
                        </button>
                    </div>
                </div>

                <div class="actions">
                    <button class="clear-btn" @click="clearAll">
                        <el-icon>
                            <Delete />
                        </el-icon> 清空
                    </button>
                </div>
            </section>

            
            <section class="ascii-section glass-card">
                <div class="section-header">
                    <h3>ASCII 常用字符对照表</h3>
                    <div class="search-box">
                        <el-icon>
                            <Search />
                        </el-icon>
                        <input type="text" v-model="asciiSearch" placeholder="搜索字符或编码..." />
                    </div>
                </div>

                <div class="ascii-table-container">
                    <table class="ascii-table">
                        <thead>
                            <tr>
                                <th>DEC</th>
                                <th>HEX</th>
                                <th>Char</th>
                                <th>描述</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredAscii" :key="item.dec">
                                <td>{{ item.dec }}</td>
                                <td>{{ item.hex }}</td>
                                <td class="char-cell"><span class="char-badge">{{ item.char }}</span></td>
                                <td class="desc-cell">{{ item.desc }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="filteredAscii.length === 0" class="empty-state">
                        未找到匹配项
                    </div>
                </div>
            </section>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 进制转换器
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Back, CopyDocument, Delete, Search } from '@element-plus/icons-vue' 
import { ElMessage } from 'element-plus'


const values = reactive({
    dec: '',
    hex: '',
    bin: '',
    oct: ''
})

const errors = reactive({
    dec: false,
    hex: false,
    bin: false,
    oct: false
})


const validators = {
    dec: /^-?\d*$/,
    hex: /^[0-9a-fA-F]*$/,
    bin: /^[01]*$/,
    oct: /^[0-7]*$/
}


const handleInput = (sourceBase) => {
    const val = values[sourceBase].trim()

    
    Object.keys(errors).forEach(k => errors[k] = false)

    if (!val) {
        clearAll()
        return
    }

    
    if (!validators[sourceBase].test(val)) {
        errors[sourceBase] = true
        return
    }

    let decimalValue = NaN

    
    try {
        switch (sourceBase) {
            case 'dec':
                decimalValue = parseInt(val, 10)
                break
            case 'hex':
                decimalValue = parseInt(val, 16)
                break
            case 'bin':
                decimalValue = parseInt(val, 2)
                break
            case 'oct':
                decimalValue = parseInt(val, 8)
                break
        }
    } catch (e) {
        decimalValue = NaN
    }

    if (isNaN(decimalValue)) {
        
        errors[sourceBase] = true
        return
    }

    
    if (sourceBase !== 'dec') values.dec = decimalValue.toString(10)
    if (sourceBase !== 'hex') values.hex = decimalValue.toString(16).toUpperCase()
    if (sourceBase !== 'bin') values.bin = decimalValue.toString(2)
    if (sourceBase !== 'oct') values.oct = decimalValue.toString(8)
}

const clearAll = () => {
    Object.keys(values).forEach(k => values[k] = '')
    Object.keys(errors).forEach(k => errors[k] = false)
}

const copy = async (text) => {
    if (!text) return
    try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('已复制')
    } catch (e) {
        ElMessage.error('复制失败')
    }
}


const asciiData = [
    { dec: 0, hex: '00', char: 'NUL', desc: 'Null character' },
    { dec: 8, hex: '08', char: 'BS', desc: 'Backspace' },
    { dec: 9, hex: '09', char: 'HT', desc: 'Horizontal Tab' },
    { dec: 10, hex: '0A', char: 'LF', desc: 'Line Feed' },
    { dec: 13, hex: '0D', char: 'CR', desc: 'Carriage Return' },
    { dec: 27, hex: '1B', char: 'ESC', desc: 'Escape' },
    { dec: 32, hex: '20', char: 'Space', desc: 'Space' },
    
    ...Array.from({ length: 95 }, (_, i) => {
        const code = i + 33
        return {
            dec: code,
            hex: code.toString(16).toUpperCase().padStart(2, '0'),
            char: String.fromCharCode(code),
            desc: ''
        }
    })
]

const asciiSearch = ref('')

const filteredAscii = computed(() => {
    const q = asciiSearch.value.toLowerCase()
    if (!q) return asciiData
    return asciiData.filter(item =>
        item.dec.toString().includes(q) ||
        item.hex.toLowerCase().includes(q) ||
        item.char.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
    )
})

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');

.base-converter-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-secondary: #6b6b6b;
    --text-muted: #9a9a9a;
    --accent: #2563eb;
    --accent-light: #eff6ff;
    --error: #ef4444;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
}


.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
}

.nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
}

.nav-back:hover {
    background: var(--accent-light);
    color: var(--accent);
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.nav-spacer {
    width: 60px;
}


.main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}


.input-group {
    margin-bottom: 1.5rem;
}

.input-group:last-child {
    margin-bottom: 0;
}

.input-group label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
}

.base-tag {
    font-size: 0.75rem;
    background: var(--bg);
    padding: 2px 8px;
    border-radius: 4px;
    color: var(--text-muted);
    font-weight: 700;
    letter-spacing: 0.05em;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border: 2px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
    transition: border-color 0.2s;
}

.input-group.error .input-wrapper {
    border-color: var(--error);
}

.input-wrapper:focus-within {
    border-color: var(--accent);
}

.prefix {
    padding-left: 1rem;
    color: var(--text-muted);
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.1rem;
}

.base-input {
    flex: 1;
    background: transparent;
    border: none;
    padding: 1rem;
    font-size: 1.2rem;
    color: var(--text);
    width: 100%;
    font-family: 'JetBrains Mono', monospace;
}

.base-input:focus {
    outline: none;
}

.copy-btn {
    background: none;
    border: none;
    padding: 0 1rem;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
}

.copy-btn:hover {
    color: var(--accent);
}

.actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.clear-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: white;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
}

.clear-btn:hover {
    border-color: #dc2626;
    color: #dc2626;
    background: #fef2f2;
}


.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.section-header h3 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.1rem;
    margin: 0;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    width: 240px;
}

.search-box input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.9rem;
    width: 100%;
}

.ascii-table-container {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
}

.ascii-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.ascii-table th {
    background: var(--bg);
    padding: 0.75rem;
    text-align: left;
    position: sticky;
    top: 0;
    font-weight: 600;
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.ascii-table td {
    padding: 0.75rem;
    border-top: 1px solid var(--border);
    font-family: 'JetBrains Mono', monospace;
}

.char-cell {
    text-align: center;
}

.char-badge {
    background: var(--accent-light);
    color: var(--accent);
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
}

.desc-cell {
    color: var(--text-secondary);
    font-family: 'Noto Sans SC', sans-serif !important;
}

.empty-state {
    padding: 2rem;
    text-align: center;
    color: var(--text-muted);
}


.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

@media (max-width: 640px) {
    .section-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .search-box {
        width: 100%;
    }

    .base-input {
        font-size: 1rem;
    }
}
</style>
