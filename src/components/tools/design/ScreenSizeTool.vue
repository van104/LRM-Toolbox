<template>
    <div class="screen-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>屏幕分辨率适配</h1>
                <span class="nav-subtitle">Screen Resolutions & PPI</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="tool-card glass-card">
                
                <div class="filter-bar">
                    <button
v-for="cat in categories" :key="cat.id" :class="{ active: currentFilter === cat.id }"
                        @click="currentFilter = cat.id">
                        {{ cat.name }}
                    </button>
                    
                    <div class="search-wrap">
                        <el-icon>
                            <Search />
                        </el-icon>
                        <input v-model="searchText" placeholder="搜索设备..." />
                    </div>
                </div>

                
                <div class="screen-list animate-fade-in">
                    <div class="list-header">
                        <div class="col name">设备名称</div>
                        <div class="col logic">逻辑分辨率 (pt/dp)</div>
                        <div class="col phys">物理分辨率 (px)</div>
                        <div class="col ratio">倍率</div>
                        <div class="col ppi">PPI</div>
                        <div class="col size">尺寸</div>
                    </div>

                    <div v-for="dev in filteredDevices" :key="dev.name" class="list-item">
                        <div class="col name">
                            <span class="dev-name">{{ dev.name }}</span>
                            <span v-if="dev.year" class="dev-year">{{ dev.year }}</span>
                        </div>
                        <div class="col logic">
                            <span class="val">{{ dev.lw }} x {{ dev.lh }}</span>
                        </div>
                        <div class="col phys">
                            <span class="val">{{ dev.pw }} x {{ dev.ph }}</span>
                        </div>
                        <div class="col ratio">
                            <span class="tag">@{{ dev.ratio }}x</span>
                        </div>
                        <div class="col ppi">{{ dev.ppi }}</div>
                        <div class="col size">{{ dev.size }}"</div>
                    </div>

                    <div v-if="filteredDevices.length === 0" class="empty">
                        无匹配设备
                    </div>
                </div>
            </div>

            <div class="tips-card">
                <el-icon>
                    <InfoFilled />
                </el-icon>
                <div class="tip-content">
                    <p>适配建议：设计稿通常以 **逻辑分辨率** 为基准（如 iPhone 的 375pt 或 393pt），导出切图时再根据倍率（@2x, @3x）生成对应资源。</p>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 屏幕分辨率适配表
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, Search, InfoFilled } from '@element-plus/icons-vue'

const currentFilter = ref('mobile')
const searchText = ref('')

const categories = [
    { id: 'mobile', name: '📱 手机' },
    { id: 'tablet', name: '📟 平板' },
    { id: 'desktop', name: '💻 电脑' },
    { id: 'watch', name: '⌚ 手表' },
]

const devices = [
    
    { type: 'mobile', name: 'iPhone 17 Pro Max', year: '2025', lw: 432, lh: 936, pw: 1302, ph: 2820, ratio: 3, ppi: '~460', size: 6.9 },
    { type: 'mobile', name: 'iPhone 17 Pro', year: '2025', lw: 396, lh: 864, pw: 1190, ph: 2600, ratio: 3, ppi: '~460', size: 6.3 },
    { type: 'mobile', name: 'iPhone 16 Pro Max', year: '2024', lw: 430, lh: 932, pw: 1290, ph: 2796, ratio: 3, ppi: 460, size: 6.9 },
    { type: 'mobile', name: 'iPhone 16 Pro', year: '2024', lw: 393, lh: 852, pw: 1179, ph: 2556, ratio: 3, ppi: 460, size: 6.3 },
    { type: 'mobile', name: 'iPhone 16 / 16 Plus', year: '2024', lw: 393, lh: 852, pw: 1179, ph: 2556, ratio: 3, ppi: 460, size: '6.1/6.7' },
    { type: 'mobile', name: 'iPhone 15 Pro Max', year: '2023', lw: 430, lh: 932, pw: 1290, ph: 2796, ratio: 3, ppi: 460, size: 6.7 },
    { type: 'mobile', name: 'iPhone 15 Pro', year: '2023', lw: 393, lh: 852, pw: 1179, ph: 2556, ratio: 3, ppi: 460, size: 6.1 },
    { type: 'mobile', name: 'iPhone 15 / 15 Plus', year: '2023', lw: 393, lh: 852, pw: 1179, ph: 2556, ratio: 3, ppi: 460, size: '6.1/6.7' },
    { type: 'mobile', name: 'iPhone 14 Pro Max', year: '2022', lw: 430, lh: 932, pw: 1290, ph: 2796, ratio: 3, ppi: 460, size: 6.7 },
    { type: 'mobile', name: 'iPhone 13 / 14', year: '2021', lw: 390, lh: 844, pw: 1170, ph: 2532, ratio: 3, ppi: 460, size: 6.1 },
    { type: 'mobile', name: 'iPhone 13 mini', year: '2021', lw: 375, lh: 812, pw: 1125, ph: 2436, ratio: 3, ppi: 476, size: 5.4 },

    
    { type: 'mobile', name: 'Samsung S26 Ultra (Est.)', year: '2026', lw: 420, lh: 920, pw: 1440, ph: 3220, ratio: 3.5, ppi: '~500', size: 6.9 },
    { type: 'mobile', name: 'Pixel 10 Pro', year: '2025', lw: 412, lh: 892, pw: 1440, ph: 3120, ratio: 3.5, ppi: 512, size: 6.8 },
    { type: 'mobile', name: 'Android Standard', year: '-', lw: 360, lh: 800, pw: 1080, ph: 2400, ratio: 3, ppi: '~400', size: '-' },
    { type: 'mobile', name: 'Android Large', year: '-', lw: 412, lh: 915, pw: 1440, ph: 3200, ratio: 3.5, ppi: '~500', size: '-' },

    
    { type: 'tablet', name: 'iPad Pro 13" (M4)', year: '2024', lw: 1032, lh: 1376, pw: 2064, ph: 2752, ratio: 2, ppi: 264, size: 13.0 },
    { type: 'tablet', name: 'iPad Pro 11" (M4)', year: '2024', lw: 834, lh: 1210, pw: 1668, ph: 2420, ratio: 2, ppi: 264, size: 11.0 },
    { type: 'tablet', name: 'iPad Pro 12.9"', year: 'M2', lw: 1024, lh: 1366, pw: 2048, ph: 2732, ratio: 2, ppi: 264, size: 12.9 },
    { type: 'tablet', name: 'iPad Air 13"', year: '2024', lw: 1024, lh: 1366, pw: 2048, ph: 2732, ratio: 2, ppi: 264, size: 12.9 },
    { type: 'tablet', name: 'iPad mini 6', year: '2021', lw: 744, lh: 1133, pw: 1488, ph: 2266, ratio: 2, ppi: 326, size: 8.3 },

    
    { type: 'desktop', name: 'MacBook Pro 16" (M4)', year: '2025', lw: 1728, lh: 1117, pw: 3456, ph: 2234, ratio: 2, ppi: 254, size: 16.2 },
    { type: 'desktop', name: 'MacBook Pro 14" (M4)', year: '2025', lw: 1512, lh: 982, pw: 3024, ph: 1964, ratio: 2, ppi: 254, size: 14.2 },
    { type: 'desktop', name: 'MacBook Air 15" (M3)', year: '2024', lw: 1440, lh: 932, pw: 2880, ph: 1864, ratio: 2, ppi: 224, size: 15.3 },
    { type: 'desktop', name: 'MacBook Air 13" (M3)', year: '2024', lw: 1280, lh: 832, pw: 2560, ph: 1664, ratio: 2, ppi: 224, size: 13.6 },
    { type: 'desktop', name: 'Full HD Monitor', year: '-', lw: 1920, lh: 1080, pw: 1920, ph: 1080, ratio: 1, ppi: '~96', size: '24' },
    { type: 'desktop', name: '4K Monitor', year: '-', lw: 1920, lh: 1080, pw: 3840, ph: 2160, ratio: 2, ppi: '~160', size: '27' },
    { type: 'desktop', name: '5K Studio Display', year: '-', lw: 2560, lh: 1440, pw: 5120, ph: 2880, ratio: 2, ppi: 218, size: '27' },

    
    { type: 'watch', name: 'Apple Watch Ultra 2', year: '2024', lw: 205, lh: 251, pw: 410, ph: 502, ratio: 2, ppi: 338, size: 49 },
    { type: 'watch', name: 'Apple Watch Series 10 46mm', year: '2024', lw: 208, lh: 248, pw: 416, ph: 496, ratio: 2, ppi: 326, size: 46 },
    { type: 'watch', name: 'Apple Watch Series 10 42mm', year: '2024', lw: 187, lh: 223, pw: 374, ph: 446, ratio: 2, ppi: 326, size: 42 },
]

const filteredDevices = computed(() => {
    return devices.filter(d => {
        const matchType = d.type === currentFilter.value
        const matchSearch = !searchText.value || d.name.toLowerCase().includes(searchText.value.toLowerCase())
        return matchType && matchSearch
    })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.screen-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #6366f1;
    

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


.filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-bottom: 1.5rem;
    align-items: center;
}

.filter-bar button {
    padding: 0.5rem 1.2rem;
    background: #f3f4f6;
    border: 1px solid transparent;
    border-radius: 100px;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.filter-bar button:hover {
    background: #e5e7eb;
}

.filter-bar button.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.search-wrap {
    margin-left: auto;
    display: flex;
    align-items: center;
    background: #f9fafb;
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 0.4rem 1rem;
    width: 200px;
}

.search-wrap input {
    border: none;
    background: transparent;
    outline: none;
    margin-left: 0.5rem;
    width: 100%;
    font-size: 0.9rem;
}

@media(max-width: 600px) {
    .search-wrap {
        margin-left: 0;
        width: 100%;
        margin-top: 0.5rem;
    }
}


.screen-list {
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow-x: auto;
}

.list-header,
.list-item {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 1fr 1fr 1fr;
    min-width: 800px;
}

.list-header {
    background: #f3f4f6;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-2);
    border-bottom: 1px solid var(--border);
}

.list-item {
    border-bottom: 1px solid var(--border);
    font-size: 0.9rem;
}

.list-item:last-child {
    border-bottom: none;
}

.list-item:hover {
    background: #fafafa;
}

.col {
    padding: 1rem;
    display: flex;
    align-items: center;
}

.dev-name {
    font-weight: 600;
    color: var(--text);
}

.dev-year {
    font-size: 0.75rem;
    color: var(--text-2);
    background: #e5e7eb;
    padding: 1px 4px;
    border-radius: 4px;
    margin-left: 0.5rem;
}

.val {
    font-family: monospace;
}

.tag {
    font-size: 0.8rem;
    background: #e0e7ff;
    color: var(--accent);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
}

.empty {
    padding: 2rem;
    text-align: center;
    color: var(--text-2);
}

.tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #eef2ff;
    color: #4338ca;
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

.animate-fade-in {
    animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>
