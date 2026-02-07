<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-main">

        <div class="footer-brand">
          <div class="footer-logo">
            <LrmLogo :size="32" />
            <span class="font-display">LRM工具箱</span>
          </div>
          <p class="brand-desc">
            免费、在线的开发者实用工具箱。<br>
            无需下载，即开即用，让工作更高效。
          </p>
          <div class="social-links">
            <a href="https://github.com/van104/LRM-Toolbox" target="_blank" title="GitHub" class="social-btn">
              <i class="fa-brands fa-github"></i>
            </a>
            <a href="mailto:powelabraham67@gmail.com" title="点击复制邮箱" class="social-btn"
              @click.prevent="handleEmailClick">
              <i class="fa-solid fa-envelope"></i>
            </a>
          </div>
        </div>


        <div class="footer-nav-grid">

          <div class="footer-col">
            <h4 class="col-title">关于</h4>
            <ul class="col-links">
              <li><router-link to="/about">关于本站</router-link></li>
              <li><router-link to="/about#contact">联系我们</router-link></li>
            </ul>
          </div>


          <div class="footer-col">
            <h4 class="col-title">支持</h4>
            <ul class="col-links">
              <li><router-link to="/">全部工具</router-link></li>
              <li><a href="#" @click.prevent="showFeedback = true">意见反馈</a></li>
              <li><a href="#" @click.prevent="showChangelog = true">更新日志</a></li>
            </ul>
          </div>


          <div class="footer-col">
            <h4 class="col-title">条款</h4>
            <ul class="col-links">
              <li><router-link to="/privacy">隐私政策</router-link></li>
              <li><router-link to="/terms">服务条款</router-link></li>
              <li><a href="#" @click.prevent="showDisclaimer = true">免责声明</a></li>
            </ul>
          </div>

        </div>
      </div>


      <div class="footer-bottom">
        <div class="copyright">
          © {{ currentYear }} <a href="https://www.lrm123.site">LRM工具箱</a> (www.lrm123.site). All Rights Reserved.
        </div>
        <div class="icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">桂ICP备2025070985号-1</a>
        </div>
      </div>
    </div>


    <el-dialog v-model="showFeedback" title="意见反馈" width="500px">

      <el-form :model="feedbackForm" label-position="top">
        <el-form-item label="反馈类型">
          <el-select v-model="feedbackForm.type" placeholder="请选择" style="width: 100%">
            <el-option label="功能建议" value="feature" />
            <el-option label="Bug 反馈" value="bug" />
            <el-option label="其他问题" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈内容">
          <el-input v-model="feedbackForm.content" type="textarea" :rows="4" placeholder="请详细描述您的问题或建议..." />
        </el-form-item>
        <el-form-item label="联系方式（可选）">
          <el-input v-model="feedbackForm.contact" placeholder="邮箱或其他联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFeedback = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback" :loading="isSubmitting">提交反馈</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showChangelog" title="更新日志" width="500px">
      <div class="changelog">
        <div class="changelog-item">
          <div class="changelog-version">v1.6.0</div>
          <div class="changelog-date">2026-02-08</div>
          <ul class="changelog-list">
            <li>修复了新工具的页脚样式对齐问题，优化了整体视觉一致性</li>
            <li>修复已知问题，提升系统稳定性</li>
          </ul>
        </div>
        <div class="changelog-item">
          <div class="changelog-version">v1.5.0</div>
          <div class="changelog-date">2026-02-04</div>
          <ul class="changelog-list">
            <li>[UI 重构] 全新首页设计，集成 React Bits 动效库</li>
            <li>[新增] 首页标题解密动画 (Decrypted Text)</li>
            <li>[新增] 沉浸式粒子背景 (Particles Background)</li>
            <li>[优化] 工具卡片 3D 视差倾斜效果 (Tilted Card)</li>
            <li>[优化] 页面元素平滑过渡动画 (GSAP)</li>
          </ul>
        </div>
        <div class="changelog-item">
          <div class="changelog-version">v1.4.0</div>
          <div class="changelog-date">2026-02-03</div>
          <ul class="changelog-list">
            <li>新增多款 PDF 处理工具（签名、元数据编辑、裁剪、叠加、修复、比例调整、附件提取等）</li>
            <li>新增 Markdown 转 PDF 工具</li>
            <li>修复了新工具的页脚样式对齐问题，优化了整体视觉一致性</li>
            <li>修复已知问题，提升系统稳定性</li>
          </ul>
        </div>
        <div class="changelog-item">
          <div class="changelog-version">v1.3.0</div>
          <div class="changelog-date">2026-01-31</div>
          <ul class="changelog-list">
            <li>新增若干工具</li>
            <li>优化全站工具 UI 细节，统一导航栏标题居中样式</li>
            <li>优化浏览体验</li>
          </ul>
        </div>
        <div class="changelog-item">
          <div class="changelog-version">v1.2.0</div>
          <div class="changelog-date">2026-01-30</div>
          <ul class="changelog-list">
            <li>新增多款实用文本、图片处理工具</li>
            <li>优化网站交互体验与视觉细节</li>
            <li>修复已知问题，提升系统稳定性</li>
          </ul>
        </div>
        <div class="changelog-item">
          <div class="changelog-version">v1.1.0</div>
          <div class="changelog-date">2026-01-28</div>
          <ul class="changelog-list">
            <li>网站正式上线</li>
            <li>UI 视觉与交互细节优化</li>
            <li>页脚布局重构与体验改进</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showChangelog = false">我知道了</el-button>
      </template>
    </el-dialog>


    <el-dialog v-model="showDisclaimer" title="免责声明" width="500px">
      <div class="disclaimer-content">
        <p>1. 本站工具仅供学习和参考使用，不保证结果的准确性和完整性。</p>
        <p>2. 用户使用本站工具产生的任何后果，本站不承担任何责任。</p>
        <p>3. 本站不对因网络传输、系统故障等原因导致的数据丢失负责。</p>
        <p>4. 本站保留对服务内容进行修改、中断的权利。</p>
        <p>5. 如有任何问题，请联系 powelabraham67@gmail.com</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="showDisclaimer = false">我已了解</el-button>
      </template>
    </el-dialog>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import LrmLogo from '@/components/icons/LrmLogo.vue'


import { submitFeedbackToBackend } from '@/api/feedback'

const showFeedback = ref(false)
const showChangelog = ref(false)
const showDisclaimer = ref(false)
const isSubmitting = ref(false)


const currentYear = computed(() => new Date().getFullYear())


const feedbackForm = ref({
  type: '',
  content: '',
  contact: ''
})


async function submitFeedback() {
  if (!feedbackForm.value.type || !feedbackForm.value.content) {
    ElMessage.warning('请填写反馈类型和内容')
    return
  }

  isSubmitting.value = true
  try {
    // 调用后端 API 提交
    await submitFeedbackToBackend(feedbackForm.value)

    ElMessage.success('感谢您的反馈！我们会尽快处理。')
    showFeedback.value = false
    feedbackForm.value = { type: '', content: '', contact: '' }
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试或通过邮件联系我们')
  } finally {
    isSubmitting.value = false
  }
}


function handleEmailClick() {
  const email = 'powelabraham67@gmail.com'
  navigator.clipboard.writeText(email).then(() => {
    ElMessage.success('邮箱已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}
</script>

<style scoped>
.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  padding-top: 4rem;
  padding-bottom: 2rem;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}


.footer-main {
  display: flex;
  justify-content: space-between;
  gap: 4rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}


.changelog-item {
  margin-bottom: 2rem;
}

.changelog-version {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.changelog-date {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  font-family: monospace;
}

.changelog-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.changelog-list li {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 0.9375rem;
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
}

.changelog-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-purple);
  opacity: 0.7;
}


.disclaimer-content p {
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 0.75rem;
}


.footer-brand {
  max-width: 320px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.logo-icon {
  color: var(--accent-cyan);
}

.brand-desc {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
  font-size: 1.125rem;
}

.social-btn:hover {
  background: var(--accent-purple);
  color: white;
  border-color: var(--accent-purple);
  transform: translateY(-2px);
}


.footer-nav-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 800px;
}

.col-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.col-links {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.col-links a {
  color: var(--text-muted);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.col-links a:hover {
  color: var(--accent-purple);
  transform: translateX(2px);
}


.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.copyright a,
.icp a {
  color: var(--text-muted);
  transition: color 0.2s;
}

.copyright a:hover,
.icp a:hover {
  color: var(--text-primary);
}

.copyright {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.icp {
  font-size: 0.8125rem;
  color: var(--text-muted);
  opacity: 0.8;
}


@media (max-width: 1024px) {
  .footer-main {
    flex-direction: column;
    gap: 3rem;
  }

  .footer-nav-grid {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .footer-nav-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem 1rem;
  }

  .app-footer {
    padding-top: 3rem;
  }
}
</style>

<style>
[data-theme="dark"] .el-dialog {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

[data-theme="dark"] .el-dialog__header .el-dialog__title {
  color: var(--text-primary);
}

[data-theme="dark"] .el-dialog__body {
  color: var(--text-secondary);
}


[data-theme="dark"] .el-input__wrapper,
[data-theme="dark"] .el-textarea__inner {
  background-color: var(--bg-primary);
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

[data-theme="dark"] .el-input__inner {
  color: var(--text-primary);
}

[data-theme="dark"] .el-form-item__label {
  color: var(--text-primary);
}


[data-theme="dark"] .changelog-version {
  color: var(--text-primary);
}

[data-theme="dark"] .changelog-date {
  color: var(--text-muted);
}

[data-theme="dark"] .changelog-list li {
  color: var(--text-secondary);
}


[data-theme="dark"] .el-dialog .el-button {
  background: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

[data-theme="dark"] .el-dialog .el-button--primary {
  background: var(--accent-purple);
  border-color: var(--accent-purple);
  color: white;
}

[data-theme="dark"] .el-dialog .el-button:hover {
  opacity: 0.9;
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

[data-theme="dark"] .el-dialog .el-button--primary:hover {
  color: white;
}
</style>
