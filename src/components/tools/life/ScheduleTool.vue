<template>
    <div class="tool-page">
        
        <header class="tool-header">
            <div class="header-left">
                <el-button text @click="goBack">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    <span>返回</span>
                </el-button>
            </div>
            <div class="header-center">
                <h1 class="tool-title">课程表管理</h1>
                <span class="tool-subtitle">Weekly Schedule</span>
            </div>
            <div class="header-right">
                <el-button-group>
                    <el-button type="primary" @click="showAddDialog">
                        <el-icon>
                            <Plus />
                        </el-icon>添加
                    </el-button>
                    <el-dropdown @command="handleDropdown">
                        <el-button type="info">
                            <el-icon>
                                <Setting />
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="settings">学期设置</el-dropdown-item>
                                <el-dropdown-item command="export">导出 JSON</el-dropdown-item>
                                <el-dropdown-item command="import">导入 JSON</el-dropdown-item>
                                <el-dropdown-item command="clear" divided style="color: #f56c6c">清空数据</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-button-group>
            </div>
        </header>

        <main class="tool-content">
            
            <section class="control-panel glass-card">
                <div class="week-selector">
                    <div class="current-week-info">
                        <span class="label">第</span>
                        <span class="week-num">{{ currentViewWeek }}</span>
                        <span class="label">周</span>
                        <el-tag v-if="currentViewWeek === realCurrentWeek" size="small" type="success" effect="dark"
                            class="today-tag">本周</el-tag>
                    </div>
                    <div class="week-nav">
                        <el-button-group>
                            <el-button @click="changeWeek(1)" :disabled="currentViewWeek <= 1">第一周</el-button>
                            <el-button @click="changeWeek(currentViewWeek - 1)" :disabled="currentViewWeek <= 1">
                                <el-icon>
                                    <ArrowLeft />
                                </el-icon>
                            </el-button>
                            <el-button @click="currentViewWeek = realCurrentWeek">本周</el-button>
                            <el-button @click="changeWeek(currentViewWeek + 1)"
                                :disabled="currentViewWeek >= totalWeeks">
                                <el-icon>
                                    <ArrowRight />
                                </el-icon>
                            </el-button>
                            <el-button @click="changeWeek(totalWeeks)"
                                :disabled="currentViewWeek >= totalWeeks">最后周</el-button>
                        </el-button-group>

                        <el-select v-model="currentViewWeek" style="width: 100px; margin-left: 1rem">
                            <el-option v-for="w in totalWeeks" :key="w" :label="`第 ${w} 周`" :value="w" />
                        </el-select>
                    </div>
                </div>
            </section>

            
            <section class="schedule-container glass-card" v-loading="loading">
                <div class="table-wrapper">
                    <table class="schedule-table">
                        <thead>
                            <tr>
                                <th class="time-col">时间段</th>
                                <th v-for="(day, index) in weekDays" :key="index"
                                    :class="{ 'is-today': isToday(index) }">
                                    <div class="day-name">{{ day }}</div>
                                    <div class="day-date">{{ getDayDate(index) }}</div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(slot, slotIdx) in timeSlots" :key="slotIdx">
                                <td class="time-slot-cell">
                                    <div class="slot-idx">{{ slotIdx + 1 }}</div>
                                    <div class="slot-time">{{ slot }}</div>
                                </td>
                                <td v-for="(day, dayIdx) in weekDays" :key="dayIdx" class="course-cell"
                                    :class="{ 'is-today': isToday(dayIdx) }">
                                    <div v-for="course in getCoursesAt(dayIdx, slotIdx)" :key="course.id"
                                        class="course-card"
                                        :style="{ backgroundColor: getCourseColor(course.course_name) }"
                                        @click="editCourse(course)">
                                        <div class="course-name">{{ course.course_name }}</div>
                                        <div class="course-info">
                                            <el-icon>
                                                <User />
                                            </el-icon> {{ course.teacher }}
                                        </div>
                                        <div class="course-info">
                                            <el-icon>
                                                <Location />
                                            </el-icon> {{ course.classroom }}
                                        </div>
                                        <div class="course-week">{{ course.week_range }}</div>

                                        <div class="course-actions">
                                            <el-button link type="primary" size="small"
                                                @click.stop="confirmDelete(course.id)">
                                                <el-icon>
                                                    <Delete />
                                                </el-icon>
                                            </el-button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '添加课程'" width="500px">
            <div class="paste-parser" v-if="!isEdit">
                <el-input v-model="pasteData" type="textarea" :rows="3" placeholder="粘贴课程信息识别，格式如：
计算机网络
(3-4节)3-12周/6号楼301/张老师" />
                <el-button type="primary" link @click="parsePaste" class="parse-btn">识别并填充</el-button>
            </div>

            <el-form :model="courseForm" label-width="80px" class="mt-4">
                <el-form-item label="课程名称" required>
                    <el-input v-model="courseForm.course_name" placeholder="请输入课程名称" />
                </el-form-item>
                <el-form-item label="教师姓名" required>
                    <el-input v-model="courseForm.teacher" placeholder="请输入教师姓名" />
                </el-form-item>
                <el-form-item label="上课教室" required>
                    <el-input v-model="courseForm.classroom" placeholder="请输入教室" />
                </el-form-item>
                <el-form-item label="周次范围" required>
                    <el-input v-model="courseForm.week_range" placeholder="如：1-18周, 1,3,5周, 1-15周(单)" />
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="星期" required>
                            <el-select v-model="courseForm.week_day" placeholder="选择星期">
                                <el-option v-for="(day, idx) in weekDays" :key="idx" :label="day" :value="idx" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="节次" required>
                            <el-select v-model="courseForm.time_slot" placeholder="选择节次">
                                <el-option v-for="(slot, idx) in timeSlots" :key="idx" :label="slot" :value="idx" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveCourse">保存</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="settingsVisible" title="学期设置" width="500px">
            <el-form :model="settingsForm" label-width="100px">
                <el-form-item label="开学日期">
                    <el-date-picker v-model="settingsForm.start_date" type="date" placeholder="选择第一周周一的日期"
                        format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
                <el-form-item label="总周数">
                    <el-input-number v-model="settingsForm.total_weeks" :min="1" :max="52" style="width: 100%" />
                </el-form-item>
                <el-divider>时间段设置</el-divider>
                <div v-for="(slot, index) in settingsForm.time_slots" :key="index" class="setting-slot-item">
                    <el-input v-model="settingsForm.time_slots[index]" placeholder="HH:mm-HH:mm"
                        style="margin-bottom: 0.5rem">
                        <template #append>
                            <el-button @click="removeSlot(index)" :disabled="settingsForm.time_slots.length <= 1">
                                <el-icon>
                                    <Delete />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </div>
                <el-button type="dashed" block @click="addSlot" class="w-full">+ 添加时间段</el-button>
            </el-form>
            <template #footer>
                <el-button @click="settingsVisible = false">取消</el-button>
                <el-button type="primary" @click="saveSettings">保存配置</el-button>
            </template>
        </el-dialog>

        
        <input type="file" ref="fileInput" style="display: none" accept=".json" @change="handleFileImport" />

        
        <footer class="footer">
            © 2026 LRM工具箱 - 课程表管理
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    ArrowLeft, ArrowRight, Plus, Setting,
    Delete, User, Location, PictureFilled
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const loading = ref(false)


const DEFAULT_WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五']
const DEFAULT_TIME_SLOTS = [
    '08:00-09:50',
    '10:10-12:00',
    '14:00-15:50',
    '16:10-18:00',
    '19:00-20:50'
]


const courses = ref([])
const weekDays = ref([...DEFAULT_WEEK_DAYS])
const timeSlots = ref([...DEFAULT_TIME_SLOTS])
const startDate = ref('2025-08-31')
const totalWeeks = ref(18)
const currentViewWeek = ref(1)
const realCurrentWeek = ref(1)


const dialogVisible = ref(false)
const isEdit = ref(false)
const pasteData = ref('')
const courseForm = reactive({
    id: null,
    course_name: '',
    teacher: '',
    classroom: '',
    week_range: '',
    week_day: 0,
    time_slot: 0
})

const settingsVisible = ref(false)
const settingsForm = reactive({
    start_date: '',
    total_weeks: 18,
    time_slots: []
})

const fileInput = ref(null)


const goBack = () => router.back()

const calculateCurrentWeek = () => {
    const start = dayjs(startDate.value)
    const now = dayjs()

    if (now.isBefore(start)) return 1

    
    let startMonday = start
    const day = start.day() 
    if (day !== 1) {
        startMonday = start.subtract(day === 0 ? 6 : day - 1, 'day')
    }

    const diffDays = now.diff(startMonday, 'day')
    const week = Math.floor(diffDays / 7) + 1

    return week > totalWeeks.value ? totalWeeks.value : week
}

const isToday = (dayIdx) => {
    const today = dayjs().day() 
    const mapping = [6, 0, 1, 2, 3, 4, 5] 
    
    return today === (dayIdx === 6 ? 0 : dayIdx + 1)
}

const getDayDate = (dayIdx) => {
    const start = dayjs(startDate.value)
    let startMonday = start
    const day = start.day()
    if (day !== 1) {
        startMonday = start.subtract(day === 0 ? 6 : day - 1, 'day')
    }

    const targetDate = startMonday.add((currentViewWeek.value - 1) * 7 + dayIdx, 'day')
    return targetDate.format('MM-DD')
}

const loadData = () => {
    try {
        const savedCourses = localStorage.getItem('schedule_courses')
        const savedSettings = localStorage.getItem('schedule_settings')

        if (savedCourses) {
            courses.value = JSON.parse(savedCourses)
        }

        if (savedSettings) {
            const settings = JSON.parse(savedSettings)
            startDate.value = settings.start_date
            totalWeeks.value = settings.total_weeks
            timeSlots.value = settings.time_slots || [...DEFAULT_TIME_SLOTS]
            weekDays.value = settings.week_days || [...DEFAULT_WEEK_DAYS]
        }

        realCurrentWeek.value = calculateCurrentWeek()
        currentViewWeek.value = realCurrentWeek.value
    } catch (e) {
        console.error('Failed to load schedule data', e)
    }
}

const saveData = () => {
    localStorage.setItem('schedule_courses', JSON.stringify(courses.value))
    localStorage.setItem('schedule_settings', JSON.stringify({
        start_date: startDate.value,
        total_weeks: totalWeeks.value,
        time_slots: timeSlots.value,
        week_days: weekDays.value
    }))
}

const getCoursesAt = (dayIdx, slotIdx) => {
    return courses.value.filter(c => {
        if (c.week_day !== dayIdx || c.time_slot !== slotIdx) return false
        return isWeekInRange(currentViewWeek.value, c.week_range)
    })
}

const isWeekInRange = (week, rangeStr) => {
    if (!rangeStr) return true
    const cleanStr = rangeStr.replace(/\s/g, '')

    let isSingle = cleanStr.includes('(单)')
    let isDouble = cleanStr.includes('(双)')
    const rangePart = cleanStr.replace('(单)', '').replace('(双)', '').replace('周', '')

    const ranges = rangePart.split(',')
    for (const r of ranges) {
        if (r.includes('-')) {
            const [start, end] = r.split('-').map(Number)
            if (week >= start && week <= end) {
                if (isSingle && week % 2 === 0) continue
                if (isDouble && week % 2 !== 0) continue
                return true
            }
        } else {
            if (parseInt(r) === week) {
                if (isSingle && week % 2 === 0) continue
                if (isDouble && week % 2 !== 0) continue
                return true
            }
        }
    }
    return false
}


const getCourseColor = (name) => {
    const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = [
        '#e0f2fe', '#f0fdf4', '#fefce8', '#fdf2f8', '#f5f3ff',
        '#ecfdf5', '#fff7ed', '#f0f9ff', '#f5f3ff', '#eff6ff'
    ]
    return colors[hash % colors.length]
}

const showAddDialog = () => {
    isEdit.value = false
    pasteData.value = ''
    Object.assign(courseForm, {
        id: null,
        course_name: '',
        teacher: '',
        classroom: '',
        week_range: '',
        week_day: 0,
        time_slot: 0
    })
    dialogVisible.value = true
}

const editCourse = (course) => {
    isEdit.value = true
    Object.assign(courseForm, course)
    dialogVisible.value = true
}

const saveCourse = () => {
    if (!courseForm.course_name || !courseForm.teacher || !courseForm.classroom) {
        return ElMessage.warning('请填写必填字段')
    }

    if (isEdit.value) {
        const idx = courses.value.findIndex(c => c.id === courseForm.id)
        if (idx !== -1) {
            courses.value[idx] = { ...courseForm, updated_at: new Date().toISOString() }
        }
    } else {
        courses.value.push({
            ...courseForm,
            id: Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    }

    saveData()
    dialogVisible.value = false
    ElMessage.success('保存成功')
}

const confirmDelete = (id) => {
    ElMessageBox.confirm('确定要删除这门课程吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        courses.value = courses.value.filter(c => c.id !== id)
        saveData()
        ElMessage.success('已删除')
    })
}


const parsePaste = () => {
    if (!pasteData.value) return

    try {
        const content = pasteData.value.trim()
        const allText = content.replace(/\n/g, ' ').trim()

        
        const timeMatch = allText.match(/\((\d+-\d+节)\)/)
        if (timeMatch) {
            const slotText = timeMatch[1]
            const idx = DEFAULT_TIME_SLOTS.findIndex(s => s.includes(slotText))
            if (idx !== -1) courseForm.time_slot = idx
        }

        
        const weekMatch = allText.match(/(\d+-\d+周\(单\)|\d+-\d+周\(双\)|\d+-\d+周)/)
        if (weekMatch) {
            courseForm.week_range = weekMatch[1]
        }

        
        const parts = allText.split('/')
        if (parts.length >= 2) {
            courseForm.classroom = parts[1].trim()
            if (parts.length >= 3) {
                courseForm.teacher = parts[2].trim()
            }
        }

        
        let courseName = allText
        if (timeMatch) courseName = courseName.replace(timeMatch[0], '')
        if (weekMatch) courseName = courseName.replace(weekMatch[0], '')
        const slashIdx = courseName.indexOf('/')
        if (slashIdx !== -1) courseName = courseName.substring(0, slashIdx)
        courseForm.course_name = courseName.trim()

        ElMessage.success('解析成功，请补充星期信息')
    } catch (e) {
        ElMessage.error('解析失败，格式不正确')
    }
}


const handleDropdown = (command) => {
    if (command === 'settings') {
        Object.assign(settingsForm, {
            start_date: startDate.value,
            total_weeks: totalWeeks.value,
            time_slots: [...timeSlots.value]
        })
        settingsVisible.value = true
    } else if (command === 'export') {
        const data = {
            version: '1.0',
            export_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            settings: {
                week_days: weekDays.value,
                time_slots: timeSlots.value,
                start_date: startDate.value,
                total_weeks: totalWeeks.value
            },
            courses: courses.value
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `course_table_${dayjs().format('YYYYMMDD_HHmmss')}.json`
        a.click()
    } else if (command === 'import') {
        fileInput.value.click()
    } else if (command === 'clear') {
        ElMessageBox.confirm('确定要清空所有数据吗？此操作不可撤销！', '高危操作', {
            type: 'danger'
        }).then(() => {
            courses.value = []
            saveData()
            ElMessage.success('已清空')
        })
    }
}

const addSlot = () => settingsForm.time_slots.push('00:00-00:00')
const removeSlot = (idx) => settingsForm.time_slots.splice(idx, 1)

const saveSettings = () => {
    startDate.value = settingsForm.start_date
    totalWeeks.value = settingsForm.total_weeks
    timeSlots.value = [...settingsForm.time_slots]
    saveData()
    realCurrentWeek.value = calculateCurrentWeek()
    settingsVisible.value = false
    ElMessage.success('设置已保存')
}

const handleFileImport = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result)
            if (data.courses && data.settings) {
                courses.value = data.courses
                startDate.value = data.settings.start_date || startDate.value
                totalWeeks.value = data.settings.total_weeks || totalWeeks.value
                timeSlots.value = data.settings.time_slots || timeSlots.value
                saveData()
                ElMessage.success('导入成功')
                loadData()
            } else {
                throw new Error('Invalid format')
            }
        } catch (e) {
            ElMessage.error('导入失败：文件格式不符合要求')
        }
    }
    reader.readAsText(file)
}

const changeWeek = (w) => {
    currentViewWeek.value = w
}

onMounted(() => {
    loadData()
})

watch([courses, startDate, totalWeeks, timeSlots], () => {
    
}, { deep: true })
</script>

<style scoped>
.tool-page {
    min-height: 100vh;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
}

.tool-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-center {
    text-align: center;
}

.tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
}

.tool-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.glass-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
}

.control-panel {
    display: flex;
    justify-content: center;
}

.week-selector {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.current-week-info {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 1.1rem;
}

.week-num {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
}

.today-tag {
    margin-left: 0.5rem;
}

.schedule-container {
    padding: 0;
    overflow: hidden;
}

.table-wrapper {
    overflow-x: auto;
}

.schedule-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    min-width: 800px;
}

.schedule-table th,
.schedule-table td {
    border: 1px solid #e2e8f0;
    padding: 0.75rem;
    vertical-align: top;
}

.schedule-table th {
    background: #f8fafc;
    text-align: center;
}

.day-name {
    font-weight: 600;
    color: #1e293b;
}

.day-date {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 2px;
}

.time-col {
    width: 80px;
}

.is-today {
    background: #f0f9ff !important;
}

.is-today .day-name {
    color: #3b82f6;
}

.time-slot-cell {
    text-align: center;
    padding: 1rem 0.5rem;
}

.slot-idx {
    font-weight: 700;
    color: #64748b;
    font-size: 1.2rem;
}

.slot-time {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 4px;
}

.course-cell {
    height: 120px;
    background: #fff;
    transition: background 0.2s;
}

.course-card {
    border-radius: 8px;
    padding: 0.6rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    cursor: pointer;
    border-left: 3px solid #3b82f6;
    position: relative;
    transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-name {
    font-weight: 600;
    color: #1a365d;
    margin-bottom: 0.4rem;
    line-height: 1.2;
}

.course-info {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #4a5568;
    font-size: 0.75rem;
    margin-top: 0.2rem;
}

.course-week {
    margin-top: 0.4rem;
    font-size: 0.7rem;
    color: #3b82f6;
    font-weight: 500;
}

.course-actions {
    position: absolute;
    right: 4px;
    bottom: 4px;
    opacity: 0;
    transition: opacity 0.2s;
}

.course-card:hover .course-actions {
    opacity: 1;
}

.paste-parser {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
    border: 1px dashed #cbd5e1;
    margin-bottom: 1rem;
}

.parse-btn {
    margin-top: 0.5rem;
}

.mt-4 {
    margin-top: 1rem;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
}


@media (max-width: 768px) {
    .tool-header {
        padding: 0.5rem 1rem;
    }

    .tool-title {
        font-size: 1.1rem;
    }

    .week-selector {
        flex-direction: column;
        gap: 0.8rem;
    }

    .header-left,
    .header-right {
        width: auto;
    }
}
</style>
