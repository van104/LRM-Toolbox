<template>
    <div class="url-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>URL 编解码</h1>
                <span class="nav-subtitle">URL Encoder / Decoder</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="dual-pane">
                    
                    <div class="pane">
                        <div class="pane-header">
                            <label>Decoded (原始字符)</label>
                            <div class="actions">
                                <span v-if="urlDecoded" class="clear-btn" @click="urlDecoded = ''">清空</span>
                                <button class="action-btn encode" @click="doUrlEncode">编码 Encode &gt;&gt;</button>
                            </div>
                        </div>
                        <textarea
v-model="urlDecoded" placeholder="输入原始文本，如：你好 World!..."
                            class="pane-input"></textarea>
                    </div>

                    
                    <div class="pane">
                        <div class="pane-header">
                            <label>Encoded (URL 编码)</label>
                            <div class="actions">
                                <button class="action-btn decode" @click="doUrlDecode">&lt;&lt; 解码 Decode</button>
                                <span v-if="urlEncoded" class="clear-btn" @click="urlEncoded = ''">清空</span>
                            </div>
                        </div>
                        <textarea
v-model="urlEncoded" placeholder="输出编码结果，如：%E4%BD%A0%E5%A5%BD..."
                            class="pane-input code-font"></textarea>
                    </div>
                </div>
            </div>

            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>说明：使用 <code>encodeURIComponent</code> 进行编码，适用于处理 URL 参数。空格会被编码为 <code>%20</code>。</p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - URL 编解码工具
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const urlDecoded = ref('')
const urlEncoded = ref('')

const doUrlEncode = () => { urlEncoded.value = encodeURIComponent(urlDecoded.value) }
const doUrlDecode = () => {
    try { urlDecoded.value = decodeURIComponent(urlEncoded.value) }
    catch (e) { urlDecoded.value = 'Error: Malformed URI sequence (编码格式错误)' }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.url-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #3b82f6;
    
    --accent-dark: #1d4ed8;

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
    max-width: 1000px;
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

.dual-pane {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    min-height: 400px;
}

.pane {
    display: flex;
    flex-direction: column;
}

.pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
}

.pane-header label {
    font-weight: 600;
    color: var(--text);
    font-size: 0.95rem;
}

.pane-input {
    flex: 1;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    resize: none;
    outline: none;
    background: #f9fafb;
    transition: all 0.2s;
    line-height: 1.6;
}

.pane-input:focus {
    border-color: var(--accent);
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.code-font {
    font-family: monospace;
    font-size: 0.9rem;
}

.actions {
    display: flex;
    gap: 0.8rem;
    align-items: center;
}

.clear-btn {
    font-size: 0.8rem;
    color: var(--text-2);
    cursor: pointer;
    text-decoration: underline;
}

.clear-btn:hover {
    color: #ef4444;
}

.action-btn {
    border: none;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.action-btn.encode {
    background: var(--accent);
    color: white;
}

.action-btn.encode:hover {
    background: var(--accent-dark);
}

.action-btn.decode {
    background: white;
    border: 1px solid var(--border);
    color: var(--text);
}

.action-btn.decode:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #eff6ff;
    color: #1e40af;
    border-radius: 12px;
    font-size: 0.85rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
}

@media(max-width: 768px) {
    .dual-pane {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .pane-input {
        min-height: 150px;
    }
}
</style>
