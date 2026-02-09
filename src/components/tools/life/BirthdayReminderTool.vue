<template>
    <div class="birthday-reminder-tool">
        <nav class="nav-bar">
            <button class="nav-back" @click="$router.back()">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>纪念日提醒</h1>
                <span class="nav-subtitle">Event Reminder</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            
            <div v-if="events.length" class="stats-card glass-card">
                <div class="stat-item">
                    <span class="stat-val">{{ events.length }}</span>
                    <span class="stat-label">总事件</span>
                </div>
                <div class="stat-item">
                    <span class="stat-val highlight">{{ upcomingEvents.length }}</span>
                    <span class="stat-label">30天内</span>
                </div>
                <div class="stat-item">
                    <span class="stat-val">{{ nearestEvent?.name || '-' }}</span>
                    <span class="stat-label">最近事件</span>
                </div>
            </div>

            
            <div class="actions-bar">
                <button class="add-btn" @click="showAddModal = true">
                    <el-icon>
                        <Plus />
                    </el-icon> 添加新日期
                </button>
            </div>

            
            <div class="event-list">
                <div v-if="events.length === 0" class="empty-state">
                    <el-icon class="empty-icon">
                        <Calendar />
                    </el-icon>
                    <p>还没有记录任何重要日子</p>
                    <button class="link-btn" @click="showAddModal = true">点击添加</button>
                </div>

                <div
v-for="event in sortedEvents" :key="event.id" class="event-card glass-card"
                    :class="{ 'is-near': event.daysLeft <= 30, 'is-today': event.daysLeft === 0 }">
                    <div class="card-left">
                        <div class="event-icon" :class="event.type">
                            {{ getIcon(event.type) }}
                        </div>
                        <div class="event-info">
                            <h3 class="event-name">{{ event.name }}</h3>
                            <p class="event-date">
                                {{ formatDate(event.date) }}
                                <span class="tag" :class="event.type">{{ getTypeName(event.type) }}</span>
                            </p>
                        </div>
                    </div>

                    <div class="card-right">
                        <div class="countdown">
                            <span v-if="event.daysLeft === 0" class="today-tag">今天!</span>
                            <span v-else class="days-num">{{ event.daysLeft }}</span>
                            <span v-if="event.daysLeft !== 0" class="days-label">天后</span>
                        </div>
                        <div v-if="event.type === 'birthday'" class="meta-info">
                            <span title="周岁">{{ event.age }}岁</span> /
                            <span title="虚岁">{{ event.age + 1 }}虚</span>
                        </div>
                        <div v-else class="meta-info">
                            {{ event.anniversary }}周年
                        </div>
                        <button class="delete-btn" title="删除" @click="deleteEvent(event.id)">
                            <el-icon>
                                <Delete />
                            </el-icon>
                        </button>
                    </div>
                </div>
            </div>
        </main>

        
        <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
            <div class="modal glass-card">
                <div class="modal-header">
                    <h3>添加重要日期</h3>
                    <button class="close-btn" @click="showAddModal = false"><el-icon>
                            <Close />
                        </el-icon></button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>事件名称</label>
                        <input v-model="newEvent.name" placeholder="例如：妈妈生日、结婚纪念日" />
                    </div>
                    <div class="form-group">
                        <label>日期类型</label>
                        <div class="type-selector">
                            <button
v-for="t in types" :key="t.value" :class="{ active: newEvent.type === t.value }"
                                @click="newEvent.type = t.value">
                                {{ t.label }}
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>选择日期</label>
                        <el-date-picker
v-model="newEvent.date" type="date" placeholder="选择日期" style="width: 100%"
                            :clearable="false" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn cancel" @click="showAddModal = false">取消</button>
                    <button class="btn confirm" :disabled="!isValid" @click="addEvent">确定添加</button>
                </div>
            </div>
        </div>

        <footer class="footer">
            © 2026 LRM工具箱 - 纪念日提醒
        </footer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Back, Plus, Delete, Calendar, Close } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

const showAddModal = ref(false)
const events = ref([])

const types = [
    { label: '生日', value: 'birthday' },
    { label: '纪念日', value: 'anniversary' },
    { label: '节日', value: 'holiday' },
    { label: '其他', value: 'other' }
]

const newEvent = ref({
    name: '',
    type: 'birthday',
    date: null
})

const isValid = computed(() => newEvent.value.name && newEvent.value.date)

const getIcon = (type) => {
    switch (type) {
        case 'birthday': return '🎂'
        case 'anniversary': return '💍'
        case 'holiday': return '🎉'
        default: return '📅'
    }
}

const getTypeName = (type) => types.find(t => t.value === type)?.label || '其他'

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')


const processEvents = (list) => {
    const today = dayjs().startOf('day')
    const currentYear = today.year()

    return list.map(e => {
        const dateObj = dayjs(e.date)
        const birthYear = dateObj.year()

        
        let nextDate = dateObj.year(currentYear)

        
        if (nextDate.isBefore(today)) {
            nextDate = nextDate.add(1, 'year')
        }

        const daysLeft = nextDate.diff(today, 'day')

        
        
        
        
        const yearDiff = nextDate.year() - birthYear

        return {
            ...e,
            daysLeft,
            age: yearDiff, 
            anniversary: yearDiff
        }
    })
}

const sortedEvents = computed(() => {
    return processEvents(events.value).sort((a, b) => a.daysLeft - b.daysLeft)
})

const upcomingEvents = computed(() => sortedEvents.value.filter(e => e.daysLeft <= 30))
const nearestEvent = computed(() => sortedEvents.value[0])


const addEvent = () => {
    if (!isValid.value) return

    events.value.push({
        id: Date.now(),
        name: newEvent.value.name,
        type: newEvent.value.type,
        date: newEvent.value.date
    })

    saveData()
    showAddModal.value = false
    newEvent.value = { name: '', type: 'birthday', date: null }
    ElMessage.success('添加成功')
}


const deleteEvent = (id) => {
    events.value = events.value.filter(e => e.id !== id)
    saveData()
    ElMessage.success('已删除')
}


const saveData = () => {
    localStorage.setItem('birthday-reminders', JSON.stringify(events.value))
}

const loadData = () => {
    const saved = localStorage.getItem('birthday-reminders')
    if (saved) {
        events.value = JSON.parse(saved)
    }
}

onMounted(loadData)

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

.birthday-reminder-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-secondary: #6b6b6b;
    --accent: #ec4899;
    
    --accent-light: #fce7f3;
    --brand-blue: #2563eb;

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
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
}

.nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
}

.nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    display: block;
    text-align: center;
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
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}


.stats-card {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 1rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-val {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
}

.stat-val.highlight {
    color: var(--accent);
}

.stat-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
}


.actions-bar {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.add-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--text);
    
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 24px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.add-btn:hover {
    transform: translateY(-2px);
    background: #000;
}


.empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--border);
}

.link-btn {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    text-decoration: underline;
    margin-top: 0.5rem;
}

.event-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    transition: all 0.2s;
    border: 1px solid var(--border);
}

.event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
}

.event-card.is-near {
    border-color: var(--accent);
    background: #fffafa;
}

.event-card.is-today {
    background: linear-gradient(to right, #fff0f5, #fff);
    border-color: var(--accent);
}

.card-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.event-icon {
    font-size: 2rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg);
    border-radius: 12px;
}

.event-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
}

.event-date {
    font-size: 0.85rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tag {
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
}

.tag.birthday {
    color: var(--accent);
    background: var(--accent-light);
    border-color: transparent;
}

.tag.anniversary {
    color: var(--brand-blue);
    background: #eff6ff;
    border-color: transparent;
}

.card-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.countdown {
    text-align: right;
    min-width: 60px;
}

.days-num {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
}

.event-card.is-near .days-num {
    color: var(--accent);
}

.days-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.today-tag {
    color: var(--accent);
    font-weight: 700;
}

.meta-info {
    font-size: 0.85rem;
    color: var(--text-secondary);
    min-width: 60px;
    text-align: right;
}

.delete-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 1rem;
    padding: 0.5rem;
    transition: color 0.2s;
}

.delete-btn:hover {
    color: #dc2626;
}


.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}

.modal {
    width: 90%;
    max-width: 400px;
    padding: 0;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border);
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
}

.modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 1rem;
}

.type-selector {
    display: flex;
    gap: 0.5rem;
}

.type-selector button {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid var(--border);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
}

.type-selector button.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
}

.modal-footer {
    padding: 1rem 1.5rem;
    background: var(--bg);
    display: flex;
    gap: 1rem;
    border-top: 1px solid var(--border);
}

.btn {
    flex: 1;
    padding: 0.75rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.95rem;
}

.btn.cancel {
    background: white;
    border: 1px solid var(--border);
}

.btn.confirm {
    background: var(--text);
    color: white;
}

.btn.confirm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

@media (max-width: 600px) {
    .card-right {
        gap: 0.5rem;
        flex-direction: column;
        align-items: flex-end;
    }

    .meta-info {
        text-align: right;
    }
}
</style>
