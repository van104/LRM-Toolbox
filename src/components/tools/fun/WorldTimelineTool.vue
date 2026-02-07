<template>
    <div class="world-timeline-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>世界时间线</h1>
                <span class="nav-subtitle">World Timeline</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="current-time-hero glass-card">
                <div class="hero-info">
                    <p class="hero-label">当地时间 (北京时间)</p>
                    <h2 class="hero-time">{{ 北京时间 }}</h2>
                    <p class="hero-date">{{ 北京日期 }}</p>
                </div>
            </div>

            <div class="timeline-container glass-card">
                <div class="timeline-header">
                    <h3>全球城市时间预览</h3>
                    <div class="time-filter">
                        <span>当前世界各地的人在干什么？</span>
                    </div>
                </div>

                <div class="city-list">
                    <div v-for="city in cities" :key="city.id" class="city-item" :class="getActivityClass(city)">
                        <div class="city-main">
                            <span class="city-flag">{{ city.flag }}</span>
                            <div class="city-info">
                                <h4 class="city-name">{{ city.name }}</h4>
                                <p class="city-tz">{{ city.tzName }} ({{ city.offset > 0 ? '+' : '' }}{{ city.offset }})
                                </p>
                            </div>
                        </div>

                        <div class="city-time-wrap">
                            <div class="activity-icon">{{ getActivityIcon(city) }}</div>
                            <div class="city-time-detail">
                                <span class="time-num">{{ getCityTime(city) }}</span>
                                <span class="activity-desc">{{ getActivityDesc(city) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 世界时间线
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Back } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const 北京时间 = ref('')
const 北京日期 = ref('')
let timer = null

const cities = [
    { id: 1, name: '北京 / 上海', tzName: 'Asia/Shanghai', offset: 8, flag: '🇨🇳' },
    { id: 2, name: '东京 / 首尔', tzName: 'Asia/Tokyo', offset: 9, flag: '🇯🇵' },
    { id: 3, name: '悉尼 / 墨尔本', tzName: 'Australia/Sydney', offset: 11, flag: '🇦🇺' },
    { id: 4, name: '伦敦 / 巴黎', tzName: 'Europe/London', offset: 0, flag: '🇬🇧' },
    { id: 5, name: '纽约 / 华盛顿', tzName: 'America/New_York', offset: -5, flag: '🇺🇸' },
    { id: 6, name: '洛杉矶 / 温哥华', tzName: 'America/Los_Angeles', offset: -8, flag: '🇺🇸' },
    { id: 7, name: '莫斯科', tzName: 'Europe/Moscow', offset: 3, flag: '🇷🇺' },
    { id: 8, name: '迪拜', tzName: 'Asia/Dubai', offset: 4, flag: '🇦🇪' },
    { id: 9, name: '曼谷', tzName: 'Asia/Bangkok', offset: 7, flag: '🇹🇭' }
]

const updateTime = () => {
    北京时间.value = dayjs().format('HH:mm:ss')
    const weekMap = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = dayjs().format('d')
    北京日期.value = dayjs().format(`YYYY年MM月DD日 星期${weekMap[weekDay]}`)
}

const getCityTime = (city) => {
    return dayjs().tz(city.tzName).format('HH:mm:ss')
}

const getActivityClass = (city) => {
    const hour = parseInt(dayjs().tz(city.tzName).format('H'))
    if (hour >= 23 || hour < 6) return 'is-sleeping'
    if (hour >= 9 && hour < 18) return 'is-working'
    if (hour >= 19 && hour < 22) return 'is-relaxing'
    return 'is-active'
}

const getActivityIcon = (city) => {
    const hour = parseInt(dayjs().tz(city.tzName).format('H'))
    if (hour >= 23 || hour < 5) return '💤'
    if (hour >= 5 && hour < 8) return '🌅'
    if (hour >= 8 && hour < 9) return '🍳'
    if (hour >= 9 && hour < 12) return '💻'
    if (hour >= 12 && hour < 14) return '🍱'
    if (hour >= 14 && hour < 18) return '☕'
    if (hour >= 18 && hour < 20) return '🏠'
    if (hour >= 20 && hour < 23) return '🎬'
    return '🚶'
}

const getActivityDesc = (city) => {
    const hour = parseInt(dayjs().tz(city.tzName).format('H'))
    if (hour >= 23 || hour < 5) return '正在熟睡中'
    if (hour >= 5 && hour < 8) return '黎明苏醒，开始新的一天'
    if (hour >= 8 && hour < 9) return '正在享用早餐/通勤路上'
    if (hour >= 9 && hour < 12) return '专注工作中'
    if (hour >= 12 && hour < 14) return '午间休息与午餐'
    if (hour >= 14 && hour < 18) return '下午的工作/学习时间'
    if (hour >= 18 && hour < 20) return '下班路上与晚餐'
    if (hour >= 20 && hour < 23) return '休闲娱乐时光'
    return '活动中'
}

onMounted(() => {
    updateTime()
    timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>

<style scoped>
.world-timeline-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-muted: #64748b;
    min-height: 100vh;
    background: var(--bg);
    font-family: 'PingFang SC', sans-serif;
}

.nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: #fff;
    border-bottom: 1px solid var(--border);
}

.nav-back,
.nav-spacer {
    width: 100px;
}

.nav-back {
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #64748b;
    font-size: 0.95rem;
    transition: color 0.2s;
}

.nav-back:hover {
    color: #1e293b;
}

.nav-center {
    flex: 1;
    text-align: center;
}

.nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: #1e293b;
    line-height: 1.2;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: #94a3b8;
    text-transform: uppercase;
    display: block;
    text-align: center;
    margin-top: 1px;
}

.main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.current-time-hero {
    background: linear-gradient(135deg, #1e293b, #334155);
    color: white;
    padding: 3rem;
    text-align: center;
    margin-bottom: 2rem;
    border: none;
}

.hero-label {
    font-size: 0.9rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
}

.hero-time {
    font-size: 4rem;
    font-weight: bold;
    letter-spacing: 2px;
    margin: 0;
}

.hero-date {
    font-size: 1.1rem;
    color: #cbd5e1;
    margin-top: 0.5rem;
}

.timeline-container {
    padding: 0;
    overflow: hidden;
}

.timeline-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.timeline-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.time-filter {
    font-size: 0.9rem;
    color: var(--text-muted);
}

.city-list {
    display: flex;
    flex-direction: column;
}

.city-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    transition: background-color 0.2s;
}

.city-item:last-child {
    border-bottom: none;
}

.city-item:hover {
    background-color: #f8fafc;
}

.city-main {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.city-flag {
    font-size: 2rem;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border-radius: 50%;
}

.city-name {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 600;
}

.city-tz {
    font-size: 0.8rem;
    color: var(--text-muted);
    margin: 2px 0 0 0;
}

.city-time-wrap {
    display: flex;
    align-items: center;
    gap: 2rem;
    text-align: right;
}

.activity-icon {
    font-size: 1.5rem;
}

.city-time-detail {
    display: flex;
    flex-direction: column;
    min-width: 140px;
}

.time-num {
    font-size: 1.25rem;
    font-weight: bold;
    font-family: monospace;
}

.activity-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-top: 2px;
}


.is-sleeping {
    background-color: rgba(241, 245, 249, 0.4);
}

.is-sleeping .time-num {
    color: #94a3b8;
}

.is-working {
    border-left: 4px solid #3b82f6;
}

.is-relaxing {
    border-left: 4px solid #f59e0b;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
}

@media (max-width: 600px) {
    .city-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .city-time-wrap {
        width: 100%;
        justify-content: space-between;
        text-align: left;
    }

    .hero-time {
        font-size: 3rem;
    }
}
</style>
