<template>
    <div class="html-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>HTML 实体转义</h1>
                <span class="nav-subtitle">HTML Entity Escape</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="dual-pane">
                    
                    <div class="pane">
                        <div class="pane-header">
                            <label>HTML 字符 (Raw)</label>
                            <div class="actions">
                                <span class="clear-btn" @click="htmlRaw = ''" v-if="htmlRaw">清空</span>
                                <button class="action-btn encode" @click="doHtmlEscape">转义 Escape &gt;&gt;</button>
                            </div>
                        </div>
                        <textarea v-model="htmlRaw" placeholder="输入 HTML 代码，如：<div>Hello</div>..."
                            class="pane-input code-font"></textarea>
                    </div>

                    
                    <div class="pane">
                        <div class="pane-header">
                            <label>Escaped Output (实体)</label>
                            <div class="actions">
                                <button class="action-btn decode" @click="doHtmlUnescape">&lt;&lt; 还原 Unescape</button>
                                <span class="clear-btn" @click="htmlEscaped = ''" v-if="htmlEscaped">清空</span>
                            </div>
                        </div>
                        <textarea v-model="htmlEscaped" placeholder="输出实体代码，如：&lt;div&gt;Hello&lt;/div&gt;..."
                            class="pane-input code-font"></textarea>
                    </div>
                </div>

                <div class="entity-table">
                    <h4>常用实体对照表</h4>
                    <div class="table-scroll">
                        <table>
                            <thead>
                                <tr>
                                    <th>字符</th>
                                    <th>实体名称</th>
                                    <th>实体编号</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="e in commonEntities" :key="e.char">
                                    <td class="char-cell">{{ e.char }}</td>
                                    <td><code class="tag">{{ e.name }}</code></td>
                                    <td><code>{{ e.num }}</code></td>
                                    <td class="desc">{{ e.desc }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - HTML 实体转义工具
        </footer>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back } from '@element-plus/icons-vue'

const htmlRaw = ref('<div>Hello & Welcome</div>')
const htmlEscaped = ref('')


const doHtmlEscape = () => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    htmlEscaped.value = htmlRaw.value.replace(/[&<>"']/g, m => map[m]);
}
const doHtmlUnescape = () => {
    const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
    htmlEscaped.value = htmlEscaped.value.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, m => map[m]);
}

const commonEntities = [
    { char: '<', name: '&lt;', num: '&#60;', desc: '小于号' },
    { char: '>', name: '&gt;', num: '&#62;', desc: '大于号' },
    { char: '&', name: '&amp;', num: '&#38;', desc: '和号' },
    { char: '"', name: '&quot;', num: '&#34;', desc: '双引号' },
    { char: '\'', name: '&apos;', num: '&#39;', desc: '单引号 (HTML5)' },
    { char: ' ', name: '&nbsp;', num: '&#160;', desc: '不换行空格' },
    { char: '©', name: '&copy;', num: '&#169;', desc: '版权符号' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.html-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #ea580c;
    
    --accent-dark: #c2410c;

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
    min-height: 350px;
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
    font-size: 0.95rem;
    resize: none;
    outline: none;
    background: #fff7ed;
    transition: all 0.2s;
    line-height: 1.6;
}

.pane-input:focus {
    border-color: var(--accent);
    background: white;
    box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
}

.code-font {
    font-family: monospace;
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


.entity-table {
    margin-top: 3rem;
}

.entity-table h4 {
    margin-bottom: 1rem;
    font-size: 1rem;
    border-left: 3px solid var(--accent);
    padding-left: 0.8rem;
}

.table-scroll {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 12px;
}

table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
}

th,
td {
    padding: 0.8rem 1.2rem;
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
}

th {
    background: #fff7ed;
    font-weight: 600;
    color: var(--text-2);
}

.char-cell {
    font-family: monospace;
    font-size: 1.2rem;
    param-weight: 700;
    color: var(--accent);
    text-align: center;
    width: 60px;
}

.tag {
    color: #c2410c;
    background: #ffedd5;
    padding: 2px 6px;
    border-radius: 4px;
}

.desc {
    color: var(--text-2);
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
