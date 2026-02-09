<template>
    <div class="special-text-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>特殊文字生成器</h1>
                <span class="nav-subtitle">Special Text Generator</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                <div class="input-section">
                    <input v-model="inputText" placeholder="输入英文或数字 (部分效果支持中文)..." />
                </div>

                <div class="effects-grid">
                    <div v-for="effect in effects" :key="effect.name" class="effect-item">
                        <div class="effect-header">
                            <span>{{ effect.name }}</span>
                            <button @click="copy(applyEffect(effect.id))">复制</button>
                        </div>
                        <div class="effect-preview">{{ applyEffect(effect.id) || '预览区域' }}</div>
                    </div>
                </div>
            </div>


        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 特殊文字生成器
        </footer>

        <Transition name="toast">
            <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
        </Transition>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Back, InfoFilled } from '@element-plus/icons-vue'

const inputText = ref('Hello 2026')
const toastMsg = ref('')

const effects = [
    { id: 'hollow', name: '空心字 (Hollow)' },
    { id: 'bold-serif', name: '粗衬线 (Bold Serif)' },
    { id: 'script', name: '花体 (Script)' },
    { id: 'fraktur', name: '哥特体 (Fraktur)' },
    { id: 'monospace', name: '等宽 (Monospace)' },
    { id: 'circled', name: '带圈 (Circled)' },
    { id: 'underline', name: '下划线 (Underline, All)' },
    { id: 'strikethrough', name: '删除线 (Strike, All)' },
]


const maps = {
    hollow: {
        base: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        target: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'
    },
    'bold-serif': {
        base: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        target: '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'
    },
    script: {
        base: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        target: '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'
    },
    fraktur: {
        base: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        target: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷' 
    },
    monospace: {
        base: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        target: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
    },
    circled: {
        base: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        target: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨'
    }
}


const getMapper = (id) => {
    const map = maps[id]
    if (!map) return (c) => c
    
    
    
    const targetChars = [...map.target] 
    const baseChars = map.base.split('')
    return (char) => {
        const idx = baseChars.indexOf(char)
        return idx !== -1 ? targetChars[idx] || char : char
    }
}

const applyEffect = (id) => {
    const text = inputText.value
    if (!text) return ''
    if (id === 'underline') return [...text].map(c => c + '\u0332').join('')
    if (id === 'strikethrough') return [...text].map(c => c + '\u0336').join('')

    const mapper = getMapper(id)
    return [...text].map(mapper).join('') 
}

const copy = async (txt) => {
    try {
        await navigator.clipboard.writeText(txt)
        toastMsg.value = '已复制!'
        setTimeout(() => toastMsg.value = '', 1500)
    } catch (e) { }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.special-text-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #8b5cf6;
    

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

.input-section input {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1.2rem;
    outline: none;
    margin-bottom: 2rem;
    transition: border-color 0.2s;
}

.input-section input:focus {
    border-color: var(--accent);
}

.effects-grid {
    display: grid;
    gap: 1rem;
}

.effect-item {
    background: #f9fafb;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
}

.effect-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    align-items: center;
}

.effect-header span {
    font-size: 0.8rem;
    color: var(--text-2);
    font-weight: 500;
}

.effect-header button {
    background: white;
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s;
}

.effect-header button:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.effect-preview {
    font-size: 1.2rem;
    word-break: break-all;
    min-height: 1.5rem;
}



.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
}

.toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 200;
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.3s;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
}
</style>
