<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="icon-clock">
            <Clock />
          </el-icon>
          最近使用
        </h1>
        <p class="page-subtitle">您最近使用的工具记录</p>
      </div>
      <div class="header-actions">
        <el-button v-if="userStore.history.length > 0" @click="confirmClear">
          <el-icon>
            <Delete />
          </el-icon>
          清空记录
        </el-button>
        <el-button text @click="$router.push('/')">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回首页
        </el-button>
      </div>
    </div>

    <main class="page-main">
      
      <div class="search-section">
        <div class="search-input-wrapper">
          <el-icon class="search-icon">
            <Search />
          </el-icon>
          <input v-model="searchKeyword" type="text" placeholder="搜索历史记录..." class="search-input" />
        </div>
      </div>

      
      <div v-if="filteredHistory.length > 0" class="timeline-container">
        <DynamicScroller
          :items="flatHistory"
          :min-item-size="80"
          key-field="id"
          page-mode
          class="scroller"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :active="active"
              :size-dependencies="[item.type]"
              :data-index="index"
            >
              <div v-if="item.type === 'header'" class="timeline-group">
                 <div class="timeline-title">{{ item.title }}</div>
              </div>
              <div v-else class="timeline-list">
                 <div class="history-item" @click="goToTool(item.data)">
                  <div class="item-time-badge">{{ formatTime(item.data.usedAt) }}</div>
                  <div class="item-card">
                    <div class="item-icon">
                      <el-icon :size="20">
                        <component :is="item.data.icon" />
                      </el-icon>
                    </div>
                    <div class="item-content">
                      <div class="item-name">{{ item.data.name }}</div>
                      <div class="item-full-time">{{ formatDate(item.data.usedAt) }}</div>
                    </div>
                    <div class="item-arrow">
                      <el-icon>
                        <ArrowRight />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>

      
      <div v-else class="empty-state">
        <el-icon :size="64">
          <Clock />
        </el-icon>
        <h2>{{ searchKeyword ? '未找到相关记录' : '暂无历史记录' }}</h2>
        <p>{{ searchKeyword ? '换个关键词试试吧' : '您还没有使用过任何工具' }}</p>
        <el-button v-if="!searchKeyword" type="primary" size="large" @click="$router.push('/')">
          浏览工具
        </el-button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Clock, Delete, ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'
import { tools } from '@/data/tools'
import { useUserStore } from '@/stores/user'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')


const filteredHistory = computed(() => {
  if (!searchKeyword.value) return userStore.history
  const keyword = searchKeyword.value.toLowerCase()
  return userStore.history.filter(item =>
    item.name.toLowerCase().includes(keyword)
  )
})


const groupedHistory = computed(() => {
  const groups = {
    today: { title: '今天', items: [] },
    yesterday: { title: '昨天', items: [] },
    week: { title: '最近7天', items: [] },
    older: { title: '更早', items: [] }
  }

  const today = dayjs().startOf('day')
  const yesterday = dayjs().subtract(1, 'day').startOf('day')
  const weekAgo = dayjs().subtract(7, 'day').startOf('day')

  filteredHistory.value.forEach(item => {
    const itemDate = dayjs(item.usedAt)
    if (itemDate.isAfter(today)) {
      groups.today.items.push(item)
    } else if (itemDate.isAfter(yesterday)) {
      groups.yesterday.items.push(item)
    } else if (itemDate.isAfter(weekAgo)) {
      groups.week.items.push(item)
    } else {
      groups.older.items.push(item)
    }
  })

  return Object.values(groups).filter(group => group.items.length > 0)
})

const flatHistory = computed(() => {
  const groups = groupedHistory.value
  const flat = []
  groups.forEach(group => {
    flat.push({ type: 'header', title: group.title, id: `header-${group.title}` })
    group.items.forEach(item => {
      flat.push({ type: 'item', data: item, id: `${item.id}-${item.usedAt}` })
    })
  })
  return flat
})


function formatTime(isoString) {
  return dayjs(isoString).format('HH:mm')
}


function formatDate(isoString) {
  return dayjs(isoString).format('YYYY-MM-DD HH:mm')
}


function goToTool(item) {
  if (item.route) {
    const tool = tools.find(t => t.id === item.id)
    if (tool) {
      userStore.addToHistory(tool)
    }
    router.push(item.route)
  }
}


function confirmClear() {
  ElMessageBox.confirm(
    '确定要清空所有历史记录吗？此操作无法撤销。',
    '清空记录',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    userStore.clearHistory()
    ElMessage.success('历史记录已清空')
  }).catch(() => { })
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f0f4f8;
  padding-bottom: 2rem;
}

.page-header {
  background: #ffffff;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: relative;
  height: 100px;
}

.header-content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
}

.header-content>* {
  pointer-events: auto;
}

.header-actions {
  display: flex;
  gap: 1rem;
  
  
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.icon-clock {
  color: #06b6d4;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
}

.page-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}


.search-section {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 99px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #ffffff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #06b6d4;
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
}


.timeline-container {
  position: relative;
  
  
  
}

.timeline-group {
  margin-bottom: 2.5rem;
  position: relative;
}


.timeline-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-list::before {
  content: '';
  position: absolute;
  left: 80px;
  
  top: 10px;
  bottom: -20px;
  width: 2px;
  background: rgba(0, 0, 0, 0.05);
  z-index: 0;
}

.timeline-title {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
  margin-left: 80px;
  
  padding-left: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}


.timeline-group:first-child .timeline-list::before {
  top: 0;
}

.history-item {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.item-time-badge {
  font-size: 0.875rem;
  color: #94a3b8;
  width: 60px;
  
  text-align: right;
  flex-shrink: 0;
  margin-right: 40px;
  
}

.item-card {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}


.item-card::before {
  content: '';
  position: absolute;
  
  left: -21px;
  
  top: 50%;
  width: 10px;
  height: 10px;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  transform: translateY(-50%);
  transition: all 0.2s;
  z-index: 2;
}

.item-card:hover {
  transform: translateX(4px);
  border-color: #06b6d4;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.1);
}

.item-card:hover::before {
  border-color: #06b6d4;
  background: #06b6d4;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.item-content {
  flex: 1;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.item-full-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.item-arrow {
  color: #cbd5e1;
}

.item-card:hover .item-arrow {
  color: #06b6d4;
}


[data-theme="dark"] .page-container {
  background: var(--bg-primary);
}

[data-theme="dark"] .page-header {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .page-title,
[data-theme="dark"] .empty-state h2 {
  color: var(--text-primary);
}

[data-theme="dark"] .page-subtitle,
[data-theme="dark"] .empty-state p {
  color: var(--text-secondary);
}

[data-theme="dark"] .timeline-title {
  color: var(--text-secondary);
}

[data-theme="dark"] .item-card {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .el-button:not(.is-text) {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .el-button:not(.is-text):hover {
  background: var(--bg-primary);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

[data-theme="dark"] .item-card::before {
  background: var(--bg-primary);
  border-color: var(--text-muted);
}

[data-theme="dark"] .search-input {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .timeline-container {
  border-color: var(--border-color);
}

[data-theme="dark"] .timeline-list::before {
  background: rgba(255, 255, 255, 0.1);
}
</style>
