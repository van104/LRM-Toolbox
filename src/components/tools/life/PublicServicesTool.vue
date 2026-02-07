<template>
    <div class="public-services">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>常用公共服务合集</h1>
                <span class="nav-subtitle">Public Services</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <div class="tool-container">
            <div class="search-bar card">
                <el-input v-model="searchQuery" placeholder="搜索服务名称，如：社保、违章、快递..." size="large" clearable>
                    <template #prefix>
                        <el-icon>
                            <Search />
                        </el-icon>
                    </template>
                </el-input>
            </div>

            <div class="services-content">
                <div v-for="category in filteredServices" :key="category.name" class="category-section">
                    <div class="category-header">
                        <el-icon>
                            <component :is="category.icon" />
                        </el-icon>
                        <span>{{ category.name }}</span>
                    </div>

                    <div class="services-grid">
                        <div v-for="service in category.items" :key="service.title" class="service-card card"
                            @click="openService(service)">
                            <div class="service-icon" :style="{ backgroundColor: service.color }">
                                <el-icon size="24">
                                    <component :is="service.icon" />
                                </el-icon>
                            </div>
                            <div class="service-info">
                                <div class="service-title">{{ service.title }}</div>
                                <div class="service-desc">{{ service.desc }}</div>
                            </div>
                            <el-icon class="arrow-icon">
                                <ArrowRight />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredServices.length === 0" class="no-results">
                <el-empty description="没有找到匹配的服务" />
            </div>
        </div>
        <footer class="footer">
            © 2026 LRM工具箱 - 常用公共服务合集
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
    Back, Search, ArrowRight, Service, Management, List,
    Van, Wallet, House, Connection, HelpFilled, Flag,
    Stamp, User, Coordinate, Money, FirstAidKit, Reading,
    Bell, Ticket, Position, CreditCard, Postcard, Warning,
    Message, Box, Document, Tickets, Calendar, Checked,
    Notebook, Microphone, Monitor, Sunny, WindPower,
    TrendCharts, Location, DataLine, Phone, ChatDotSquare
} from '@element-plus/icons-vue'
import { serviceCategories, searchServices } from '@/data/publicServicesData'

const searchQuery = ref('')

const filteredServices = computed(() => {
    return searchServices(searchQuery.value)
})

const openService = (service) => {
    window.open(service.url, '_blank')
}
</script>

<style scoped>
.public-services {
    min-height: 100vh;
    background: var(--el-bg-color-page);
    display: flex;
    flex-direction: column;
}

.nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
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
    color: var(--el-text-color-regular);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
    transition: color 0.2s;
}

.nav-back:hover {
    color: var(--el-color-primary);
}

.nav-center {
    text-align: center;
}

.nav-center h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--el-text-color-primary);
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
}

.tool-container {
    padding: 24px;
    flex: 1;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}

.card {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.search-bar {
    margin-bottom: 24px;
}

.category-section {
    margin-bottom: 32px;
}

.category-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
}

.service-card {
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid transparent;
    padding: 16px;
}

.service-card:hover {
    transform: translateY(-2px);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.service-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
}

.service-info {
    flex: 1;
}

.service-title {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
}

.service-desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
}

.arrow-icon {
    color: var(--el-text-color-placeholder);
    transition: transform 0.3s;
}

.service-card:hover .arrow-icon {
    transform: translateX(4px);
    color: var(--el-color-primary);
}

.no-results {
    margin-top: 60px;
}

@media (max-width: 640px) {
    .services-grid {
        grid-template-columns: 1fr;
    }
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--el-text-color-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
}
</style>
