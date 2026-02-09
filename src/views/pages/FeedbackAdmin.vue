<template>
    <div class="feedback-admin">
        <!-- 登录遮罩 -->
        <div v-if="!isLoggedIn" class="login-overlay">
            <el-card class="login-card" shadow="always">
                <template #header>
                    <div class="login-header">
                        <h3>管理员登录</h3>
                        <p>请输入密码以访问反馈管理中心</p>
                    </div>
                </template>
                <el-form @submit.prevent="handleLogin">
                    <el-form-item>
                        <el-input
v-model="loginPassword" type="password" placeholder="请输入密码" show-password
                            @keyup.enter="handleLogin">
                            <template #prefix>
                                <el-icon>
                                    <Lock />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
                        登录
                    </el-button>
                    <el-button class="login-btn-back" @click="$router.push('/')">
                        返回首页
                    </el-button>
                </el-form>
            </el-card>
        </div>

        <!-- 主内容 -->
        <template v-else>
            <div class="header">
                <div class="header-content">
                    <el-button icon="ArrowLeft" @click="$router.push('/')">返回首页</el-button>
                    <h2>反馈管理中心</h2>
                    <div class="actions">
                        <el-button plain style="margin-right: 12px;" @click="handleLogout">退出登录</el-button>
                        <el-button
type="primary" :icon="Refresh" :loading="loading"
                            @click="fetchFeedback">刷新数据</el-button>
                    </div>
                </div>
            </div>

            <div class="content">
                <el-card shadow="never" class="stats-card">
                    <el-row :gutter="20">
                        <el-col :span="4">
                            <div class="stat-item">
                                <div class="label">总反馈量</div>
                                <div class="value">{{ feedbackList.length }}</div>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="stat-item">
                                <div class="label">待处理</div>
                                <div class="value text-warning">{{ stats.pending }}</div>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="stat-item">
                                <div class="label">已处理</div>
                                <div class="value text-success">{{ stats.resolved }}</div>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="stat-item">
                                <div class="label">功能建议</div>
                                <div class="value text-primary">{{ stats.feature }}</div>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="stat-item">
                                <div class="label">Bug 反馈</div>
                                <div class="value text-danger">{{ stats.bug }}</div>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="stat-item">
                                <div class="label">其他问题</div>
                                <div class="value text-info">{{ stats.other }}</div>
                            </div>
                        </el-col>
                    </el-row>
                </el-card>

                <el-table
v-loading="loading" :data="feedbackList" style="width: 100%" border stripe
                    class="feedback-table">
                    <el-table-column type="index" width="50" />
                    <el-table-column prop="status" label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 'resolved' ? 'success' : 'warning'">
                                {{ row.status === 'resolved' ? '已处理' : '待处理' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="类型" width="100">
                        <template #default="{ row }">
                            <el-tag :type="getTypeTag(row.type)">{{ getTypeText(row.type) }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="content" label="反馈内容" min-width="250">
                        <template #default="{ row }">
                            <div class="content-text">{{ row.content }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="contact" label="联系方式" width="150">
                        <template #default="{ row }">
                            <el-tooltip v-if="row.contact" :content="row.contact">
                                <span>{{ row.contact }}</span>
                            </el-tooltip>
                            <span v-else class="text-muted">未提供</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="timestamp" label="提交时间" width="160">
                        <template #default="{ row }">
                            {{ formatDate(row.timestamp) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" fixed="right">
                        <template #default="{ row }">
                            <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
                            <el-button
v-if="row.status !== 'resolved'" type="success" link
                                @click="handleResolve(row)">标记已办</el-button>
                            <el-popconfirm title="确定删除这条反馈吗？" @confirm="handleDelete(row)">
                                <template #reference>
                                    <el-button type="danger" link>删除</el-button>
                                </template>
                            </el-popconfirm>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </template>

        <el-dialog v-model="detailVisible" title="反馈详情" width="600px">
            <div v-if="currentDetail" class="detail-dialog-content">
                <div class="detail-row">
                    <span class="label">状态：</span>
                    <el-tag :type="currentDetail.status === 'resolved' ? 'success' : 'warning'">
                        {{ currentDetail.status === 'resolved' ? '已处理' : '待处理' }}
                    </el-tag>
                </div>
                <div class="detail-row">
                    <span class="label">类型：</span>
                    <el-tag :type="getTypeTag(currentDetail.type)">{{ getTypeText(currentDetail.type) }}</el-tag>
                </div>
                <div class="detail-row">
                    <span class="label">时间：</span>
                    <span>{{ formatDate(currentDetail.timestamp) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">内容：</span>
                    <div class="detail-text">{{ currentDetail.content }}</div>
                </div>
                <div class="detail-row">
                    <span class="label">联系方式：</span>
                    <span>{{ currentDetail.contact || '未提供' }}</span>
                </div>
                <div class="detail-separator">设备信息</div>
                <div class="detail-row device-info">
                    {{ currentDetail.userAgent }}
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Refresh, ArrowLeft, Lock } from '@element-plus/icons-vue'
import { getFeedbackFromBackend, updateFeedbackStatus, deleteFeedback } from '@/api/feedback'
import { ElMessage, ElMessageBox } from 'element-plus'

const isLoggedIn = ref(false)
const loginPassword = ref('')
const feedbackList = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const currentDetail = ref(null)

const stats = computed(() => {
    return feedbackList.value.reduce((acc, item) => {
        if (acc[item.type] !== undefined) {
            acc[item.type]++
        }
        if (item.status === 'resolved') {
            acc.resolved++
        } else {
            acc.pending++
        }
        return acc
    }, { feature: 0, bug: 0, other: 0, resolved: 0, pending: 0 })
})

const handleLogin = async () => {
    if (!loginPassword.value) {
        ElMessage.warning('请输入密码')
        return
    }
    loading.value = true
    try {
        const data = await getFeedbackFromBackend(loginPassword.value)
        feedbackList.value = data
        isLoggedIn.value = true
        sessionStorage.setItem('lrm_admin_token', loginPassword.value)
        ElMessage.success('登录成功')
    } catch (error) {
        ElMessage.error(error.message || '登录失败')
        loginPassword.value = ''
    } finally {
        loading.value = false
    }
}

const handleLogout = () => {
    isLoggedIn.value = false
    loginPassword.value = ''
    feedbackList.value = []
    sessionStorage.removeItem('lrm_admin_token')
}

const fetchFeedback = async () => {
    const token = sessionStorage.getItem('lrm_admin_token')
    if (!token) {
        isLoggedIn.value = false
        return
    }
    loading.value = true
    try {
        const data = await getFeedbackFromBackend(token)
        feedbackList.value = data
    } catch (error) {
        if (error.message.includes('密码错误')) {
            isLoggedIn.value = false
            sessionStorage.removeItem('lrm_admin_token')
        }
        ElMessage.error('获取反馈失败：' + error.message)
    } finally {
        loading.value = false
    }
}

const handleResolve = async (row) => {
    const token = sessionStorage.getItem('lrm_admin_token')
    try {
        await updateFeedbackStatus(row.id, 'resolved', token)
        ElMessage.success('已标记为处理完成')
        fetchFeedback()
    } catch (error) {
        ElMessage.error('操作失败')
    }
}

const handleDelete = async (row) => {
    const token = sessionStorage.getItem('lrm_admin_token')
    try {
        await deleteFeedback(row.id, token)
        ElMessage.success('已删除')
        fetchFeedback()
    } catch (error) {
        ElMessage.error('删除失败')
    }
}

const getTypeText = (type) => {
    const maps = {
        feature: '功能建议',
        bug: 'Bug 反馈',
        other: '其他问题'
    }
    return maps[type] || type
}

const getTypeTag = (type) => {
    const maps = {
        feature: 'primary',
        bug: 'danger',
        other: 'info'
    }
    return maps[type] || ''
}

const formatDate = (ts) => {
    if (!ts) return '-'
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const viewDetail = (row) => {
    currentDetail.value = row
    detailVisible.value = true
}

onMounted(() => {
    const savedToken = sessionStorage.getItem('lrm_admin_token')
    if (savedToken) {
        loginPassword.value = savedToken
        fetchFeedback().then(() => {
            isLoggedIn.value = true
        }).catch(() => {
            isLoggedIn.value = false
        })
    }
})
</script>

<style scoped>
.feedback-admin {
    min-height: 100vh;
    background: var(--bg-primary);
}

.login-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    z-index: 1000;
}

.login-card {
    width: 100%;
    max-width: 400px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
}

.login-header {
    text-align: center;
}

.login-header h3 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    color: var(--text-primary);
}

.login-header p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-muted);
}

.login-btn {
    width: 100%;
}

.login-btn-back {
    width: 100%;
    margin-top: 12px;
}

.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
}

.content {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1.5rem;
}

.stats-card {
    margin-bottom: 2rem;
    border: 1px solid var(--border-color);
    background: var(--bg-secondary);
}

.stat-item {
    text-align: center;
    padding: 1rem 0;
}

.stat-item .label {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.stat-item .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
}

.feedback-table {
    border-radius: 8px;
    overflow: hidden;
    --el-table-bg-color: var(--bg-secondary);
    --el-table-tr-bg-color: var(--bg-secondary);
    --el-table-header-bg-color: var(--bg-primary);
    --el-table-border-color: var(--border-color);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-primary);
}

.content-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text-secondary);
}

.detail-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.detail-row {
    display: flex;
    line-height: 1.6;
}

.detail-row .label {
    width: 80px;
    color: var(--text-muted);
    flex-shrink: 0;
}

.detail-text {
    flex: 1;
    background: var(--bg-primary);
    padding: 1rem;
    border-radius: 8px;
    white-space: pre-wrap;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.detail-separator {
    height: 1px;
    background: var(--border-color);
    text-align: center;
    position: relative;
    margin: 1rem 0;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.device-info {
    font-family: monospace;
    font-size: 0.8125rem;
    color: var(--text-muted);
    background: var(--bg-primary);
    padding: 0.75rem;
    border-radius: 4px;
}

.text-primary {
    color: var(--el-color-primary);
}

.text-success {
    color: var(--el-color-success);
}

.text-warning {
    color: var(--el-color-warning);
}

.text-danger {
    color: var(--el-color-danger);
}

.text-info {
    color: var(--el-color-info);
}

.text-muted {
    color: var(--text-muted);
}
</style>
