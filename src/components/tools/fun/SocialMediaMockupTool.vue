<template>
    <div class="social-mockup-tool">
        <nav class="nav-bar">
            <button @click="$router.back()" class="nav-back">
                <el-icon>
                    <Back />
                </el-icon> 返回
            </button>
            <div class="nav-center">
                <h1>社交媒体模拟</h1>
                <span class="nav-subtitle">Social Media Mockup</span>
            </div>
            <div class="nav-spacer"></div>
        </nav>

        <main class="main-content">
            <div class="layout-grid">
                
                <div class="edit-section glass-card">
                    <div class="tabs">
                        <button v-for="t in platforms" :key="t.id" :class="{ active: activePlatform === t.id }"
                            @click="activePlatform = t.id">
                            {{ t.name }}
                        </button>
                    </div>

                    <div class="form-content">
                        <div class="form-group">
                            <label>头像</label>
                            <div class="avatar-upload">
                                <img :src="config.avatar" v-if="config.avatar" class="preview-avatar" />
                                <input type="file" accept="image/*" @change="handleAvatarUpload" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>用户名</label>
                            <input v-model="config.username" placeholder="输入用户名" />
                        </div>

                        <div class="form-group">
                            <label>发布内容</label>
                            <textarea v-model="config.content" rows="4" placeholder="输入发布内容..."></textarea>
                        </div>

                        <div class="form-group">
                            <label>发布图片 (最多9张)</label>
                            <div class="images-upload">
                                <div v-for="(img, idx) in config.images" :key="idx" class="img-item">
                                    <img :src="img" />
                                    <button class="remove-img" @click="config.images.splice(idx, 1)">×</button>
                                </div>
                                <label v-if="config.images.length < 9" class="add-img">
                                    <span>+</span>
                                    <input type="file" accept="image/*" @change="handleImageUpload" hidden />
                                </label>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>发布时间</label>
                                <input v-model="config.time" placeholder="例如：2小时前" />
                            </div>
                            <div class="form-group">
                                <label>定位/设备</label>
                                <input v-model="config.location" placeholder="例如：北京 · 798艺术区" />
                            </div>
                        </div>

                        <div class="form-group" v-if="activePlatform === 'moments'">
                            <label>点赞列表</label>
                            <input v-model="config.likes" placeholder="名字用逗号分隔" />
                        </div>

                        <div class="actions">
                            <button class="reset-btn" @click="resetConfig">重置</button>
                            <button class="download-btn" @click="downloadMockup">导出截图</button>
                        </div>
                    </div>
                </div>

                
                <div class="preview-section">
                    <div class="phone-frame">
                        <div class="phone-content" id="mockup-content">
                            
                            <div v-if="activePlatform === 'moments'" class="wechat-moments">
                                <div class="header-bar">
                                    <span class="back-icon">〈</span>
                                    <span>朋友圈</span>
                                    <span class="camera-icon">📷</span>
                                </div>
                                <div class="post-item">
                                    <img :src="config.avatar || defaultAvatar" class="user-avatar" />
                                    <div class="post-main">
                                        <h4 class="username">{{ config.username || '用户名' }}</h4>
                                        <p class="content-text">{{ config.content || '在这里输入你想说的话...' }}</p>

                                        
                                        <div class="image-grid" :class="'grid-' + config.images.length">
                                            <div v-for="(img, idx) in config.images" :key="idx" class="grid-item">
                                                <img :src="img" mode="aspectFill" />
                                            </div>
                                        </div>

                                        <div class="location-label" v-if="config.location">{{ config.location }}</div>

                                        <div class="footer-row">
                                            <span class="time-label">{{ config.time || '刚刚' }}</span>
                                            <div class="more-btn">••</div>
                                        </div>

                                        
                                        <div class="interaction-card" v-if="config.likes">
                                            <div class="likes-list">
                                                <span class="heart">❤️</span>
                                                <span class="likes-names">{{ config.likes }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div v-else class="coming-soon">
                                <el-icon>
                                    <Monitor />
                                </el-icon>
                                <p>{{ activePlatformName }} 模版设计中...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            © 2026 LRM工具箱 - 社交媒体模拟
        </footer>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Back, Monitor } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import { ElMessage } from 'element-plus'

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
const platforms = [
    { id: 'moments', name: '微信朋友圈' },
    { id: 'weibo', name: '新浪微博' },
    { id: 'xhs', name: '小红书' }
]
const activePlatform = ref('moments')
const activePlatformName = computed(() => platforms.find(p => p.id === activePlatform.value)?.name)

const config = reactive({
    avatar: '',
    username: '',
    content: '',
    images: [],
    time: '',
    location: '',
    likes: '路人甲, 鹿人乙, 陆人丙'
})

const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => config.avatar = ev.target.result
        reader.readAsDataURL(file)
    }
}

const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => config.images.push(ev.target.result)
        reader.readAsDataURL(file)
    }
}

const resetConfig = () => {
    config.avatar = ''
    config.username = ''
    config.content = ''
    config.images = []
    config.time = ''
    config.location = ''
    config.likes = ''
}

const downloadMockup = async () => {
    const element = document.getElementById('mockup-content')
    if (!element) return

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff'
        })
        const link = document.createElement('a')
        link.download = `mockup_${activePlatform.value}_${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        ElMessage.success('导出成功')
    } catch (err) {
        ElMessage.error('导出失败: ' + err.message)
    }
}
</script>

<style scoped>
.social-mockup-tool {
    --bg: #f0f2f5;
    --card: #ffffff;
    --border: #e8e8e8;
    --primary: #52c41a;
    
    font-family: sans-serif;
    min-height: 100vh;
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
    color: #666;
    font-size: 0.95rem;
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
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.layout-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
}

.glass-card {
    background: #fff;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
}

.tabs button {
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    color: #666;
    position: relative;
}

.tabs button.active {
    color: var(--primary);
    font-weight: bold;
}

.tabs button.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--primary);
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
}

.form-group input,
.form-group textarea {
    width: 100%;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.6rem;
    font-size: 0.95rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.avatar-upload {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.preview-avatar {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    object-fit: cover;
}

.images-upload {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.img-item {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
}

.img-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.remove-img {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    border: none;
    width: 20px;
    height: 20px;
    cursor: pointer;
}

.add-img {
    width: 80px;
    height: 80px;
    border: 2px dashed var(--border);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #ccc;
    cursor: pointer;
}

.actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.reset-btn {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid var(--border);
    background: #f5f5f5;
    border-radius: 8px;
    cursor: pointer;
}

.download-btn {
    flex: 2;
    padding: 0.8rem;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}


.phone-frame {
    width: 375px;
    height: 700px;
    background: #000;
    border: 12px solid #333;
    border-radius: 40px;
    margin: 0 auto;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    position: relative;
}

.phone-content {
    width: 100%;
    height: 100%;
    background: #fff;
    overflow-y: auto;
}


.phone-content::-webkit-scrollbar {
    display: none;
}

.wechat-moments .header-bar {
    background: #ededed;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 0.9rem;
    position: sticky;
    top: 0;
    z-index: 5;
}

.post-item {
    display: flex;
    padding: 16px 12px;
    gap: 12px;
    border-bottom: 0.5px solid #f0f0f0;
}

.user-avatar {
    width: 44px;
    height: 44px;
    border-radius: 4px;
    object-fit: cover;
    background: #eee;
}

.post-main {
    flex: 1;
}

.username {
    color: #576b95;
    margin: 0 0 6px 0;
    font-size: 1rem;
    font-weight: 600;
}

.content-text {
    font-size: 0.95rem;
    line-height: 1.5;
    color: #111;
    margin-bottom: 8px;
    white-space: pre-wrap;
}

.image-grid {
    display: grid;
    gap: 4px;
    margin-bottom: 8px;
    width: 240px;
}

.grid-item {
    position: relative;
    background: #f7f7f7;
    aspect-ratio: 1;
    overflow: hidden;
}

.grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.grid-1 {
    width: 180px;
    grid-template-columns: 1fr;
}

.grid-1 .grid-item {
    aspect-ratio: unset;
    min-height: 120px;
}

.grid-2,
.grid-4 {
    grid-template-columns: 1fr 1fr;
}

.grid-3,
.grid-5,
.grid-6,
.grid-7,
.grid-8,
.grid-9 {
    grid-template-columns: 1fr 1fr 1fr;
}

.location-label {
    color: #576b95;
    font-size: 0.8rem;
    margin-bottom: 8px;
}

.footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.time-label {
    color: #999;
    font-size: 0.8rem;
}

.more-btn {
    background: #f7f7f7;
    color: #576b95;
    padding: 2px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.7rem;
}

.interaction-card {
    background: #f7f7f7;
    border-radius: 4px;
    margin-top: 10px;
    padding: 8px;
    position: relative;
}

.interaction-card::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 12px;
    border: 4px solid transparent;
    border-bottom-color: #f7f7f7;
}

.likes-list {
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 4px;
}

.heart {
    font-size: 0.75rem;
}

.likes-names {
    color: #576b95;
    font-weight: 500;
}

.coming-soon {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #ccc;
}

.footer {
    text-align: center;
    padding: 2rem;
    color: #999;
    font-size: 0.8rem;
}

@media (max-width: 900px) {
    .layout-grid {
        grid-template-columns: 1fr;
    }

    .phone-frame {
        scale: 0.85;
        margin-top: -50px;
    }
}
</style>
