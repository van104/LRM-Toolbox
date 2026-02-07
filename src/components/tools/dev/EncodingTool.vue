<template>
    <div class="encoding-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>编码格式查看器</h1>
                <span class="nav-subtitle">Text Encoding Viewer</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="input-group">
                    <label>输入文本</label>
                    <textarea v-model="encodingText" placeholder="在此输入文字，实时分析 UTF-8、GBK、ASCII 编码长度..."
                        rows="6"></textarea>
                </div>

                <div class="result-grid">
                    <div class="result-item">
                        <span class="label">字符数 (Char Count)</span>
                        <span class="value">{{ encodingText.length }}</span>
                    </div>
                    <div class="result-item highlight">
                        <span class="label">UTF-8 字节数</span>
                        <span class="value">{{ getByteLen(encodingText, 'utf8') }}</span>
                        
                        <div class="visual-bytes">
                            <span v-for="(b, i) in getBytes(encodingText).slice(0, 12)" :key="i" class="byte-box">{{ b
                                }}</span>
                            <span v-if="encodingText && getByteLen(encodingText, 'utf8') > 12"
                                class="more-dots">...</span>
                        </div>
                    </div>
                    <div class="result-item">
                        <span class="label">GBK/GB2312 字节数 (估算)</span>
                        <span class="value">{{ getByteLen(encodingText, 'gbk') }}</span>
                        <span class="desc">中文通常占 2 字节，英文 1 字节</span>
                    </div>
                    <div class="result-item">
                        <span class="label">ASCII 兼容性</span>
                        <span class="value status" :class="isAscii ? 'ok' : 'warn'">
                            {{ isAscii ? '纯 ASCII' : '包含非 ASCII 字符' }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>常见乱码原因：<br>
                        1. UTF-8 网页显示 GBK 文本：中文会变成 "" 或古怪汉字<br>
                        2. 数据库字段长度限制：通常指字节数而非字符数 (如 varchar(50))
                    </p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 编码格式查看器
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const encodingText = ref('你好 World')

const isAscii = computed(() => /^[\x00-\x7F]*$/.test(encodingText.value))

const getByteLen = (str, charset) => {
    if (!str) return 0
    if (charset === 'gbk') {
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            len += str.charCodeAt(i) > 255 ? 2 : 1;
        }
        return len;
    }
    return new Blob([str]).size
}

const getBytes = (str) => {
    if (!str) return []
    const encoder = new TextEncoder()
    const arr = encoder.encode(str)
    return Array.from(arr).map(b => '0x' + b.toString(16).toUpperCase().padStart(2, '0'))
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.encoding-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #d946ef;
    

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
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.1rem;
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
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.input-group label {
    display: block;
    margin-bottom: 0.8rem;
    color: var(--text-2);
    font-weight: 500;
}

.input-group textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1.1rem;
    outline: none;
    resize: vertical;
    background: #fdfdfd;
    font-family: monospace;
    transition: border-color 0.2s;
}

.input-group textarea:focus {
    border-color: var(--accent);
}

.result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
}

.result-item {
    background: #f9fafb;
    padding: 1.25rem;
    border-radius: 12px;
    border: 1px solid var(--border);
    position: relative;
}

.result-item.highlight {
    background: #fdf4ff;
    
    border-color: #f0abfc;
}

.result-item .label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-2);
    margin-bottom: 0.5rem;
}

.result-item .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text);
}

.result-item.highlight .value {
    color: var(--accent);
}

.result-item .desc {
    display: block;
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 0.5rem;
}

.status {
    font-size: 1rem;
    font-weight: 600;
}

.status.ok {
    color: #16a34a;
}

.status.warn {
    color: #ca8a04;
}

.visual-bytes {
    display: flex;
    gap: 6px;
    margin-top: 0.8rem;
    flex-wrap: wrap;
}

.byte-box {
    background: white;
    color: var(--accent);
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #f0abfc;
    font-family: monospace;
}

.more-dots {
    color: var(--text-2);
    align-self: center;
    font-size: 1.2rem;
    line-height: 0.5;
}

.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(217, 70, 239, 0.05);
    color: #a21caf;
    border-radius: 12px;
    font-size: 0.85rem;
    line-height: 1.6;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
}
</style>
