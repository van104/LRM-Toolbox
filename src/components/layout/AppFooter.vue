<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-main-grid">
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="footer-brand-logo">
            <LrmLogo :size="40" />
            <h3 class="brand-name font-display">LRM工具箱</h3>
          </div>
          <p class="brand-slogan">
            探索极致的高效工具，为开发者而生。<br />
            纯净、安全、全开源，让灵感即刻落地。
          </p>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">系统运行正常 | 已上线 {{ totalTools }}+ 工具</span>
          </div>
          <div class="footer-social">
            <a
              href="https://github.com/van104/LRM-Toolbox"
              target="_blank"
              class="social-link-item github"
              title="GitHub"
            >
              <i class="fa-brands fa-github"></i>
            </a>
            <a
              href="mailto:powelabraham67@gmail.com"
              class="social-link-item email"
              title="联系我们"
              @click.prevent="handleEmailClick"
            >
              <i class="fa-solid fa-envelope"></i>
            </a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="nav-sections">
          <div class="nav-column">
            <h4 class="nav-title">核心资源</h4>
            <ul class="nav-list">
              <li><router-link to="/">全部工具库</router-link></li>
              <li><router-link to="/favorites">我的收藏</router-link></li>
              <li><router-link to="/history">最近记录</router-link></li>
            </ul>
          </div>

          <div class="nav-column">
            <h4 class="nav-title">关于与支持</h4>
            <ul class="nav-list">
              <li><router-link to="/about">关于本站</router-link></li>
              <li><router-link to="/changelog">更新日志</router-link></li>
              <li><a href="#" @click.prevent="showFeedback = true">意见反馈</a></li>
            </ul>
          </div>

          <div class="nav-column">
            <h4 class="nav-title">法律合规</h4>
            <ul class="nav-list">
              <li><router-link to="/privacy">隐私政策</router-link></li>
              <li><router-link to="/terms">服务条款</router-link></li>
              <li><a href="#" @click.prevent="showDisclaimer = true">免责声明</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-legal">
        <div class="copyright-info">
          <span
            >© {{ currentYear }}
            <a href="https://www.lrm123.site" class="copyright-link">LRM Toolbox</a></span
          >
          <span class="dot-separator">•</span>
          <span>Crafted with ❤️ by LRM</span>
        </div>
        <div class="beian-info">
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
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的问题或建议..."
          />
        </el-form-item>
        <el-form-item label="联系方式（可选）">
          <el-input v-model="feedbackForm.contact" placeholder="邮箱或其他联系方式" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFeedback = false">取消</el-button>
        <el-button type="primary" :loading="isSubmitting" @click="submitFeedback"
          >提交反馈</el-button
        >
      </template>
    </el-dialog>

    <el-dialog
      v-model="showChangelog"
      title="🚀 更新日志"
      width="600px"
      custom-class="changelog-dialog"
    >
      <div class="changelog-container">
        <div class="changelog-timeline">
          <div class="changelog-item featured">
            <div class="version-tag">LATEST</div>
            <div class="item-header">
              <span class="version-num">v1.9.0</span>
              <span class="version-date">2026-02-11</span>
            </div>
            <ul class="change-list">
              <li>
                <span class="tag tag-refactor">重构</span>工具数据模块化：异步按需导入，秒开体验
              </li>
              <li>
                <span class="tag tag-ui">预览</span>首页布局优化：截断展示与一键展开，告别杂乱
              </li>
              <li>
                <span class="tag tag-fx">动效</span>主题转场：View Transitions 圆形扩散/消退动画
              </li>
              <li><span class="tag tag-ui">重构</span>页脚重构：磨砂质感与实时运行状态指示</li>
            </ul>
          </div>

          <div class="changelog-item">
            <div class="item-header">
              <span class="version-num">v1.8.0</span>
              <span class="version-date">2026-02-11</span>
            </div>
            <ul class="change-list">
              <li><span class="tag tag-perf">性能</span>特定大工具数据 JSON 化拆分</li>
              <li><span class="tag tag-fix">修复</span>全站 Linter 清理，极致代码质量</li>
              <li><span class="tag tag-fix">修复</span>ESLint 与 Prettier 冲突配置修正</li>
            </ul>
          </div>

          <div class="changelog-item">
            <div class="item-header">
              <span class="version-num">v1.7.0</span>
              <span class="version-date">2026-02-09</span>
            </div>
            <ul class="change-list">
              <li><span class="tag tag-fix">2048</span>深度逻辑优化，支持撤销与多规格网格</li>
              <li><span class="tag tag-sys">系统</span>默认汉化配置与生产环境接口修复</li>
              <li><span class="tag tag-sys">SEO</span>GitHub 检索权重优化</li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button class="close-btn" @click="showChangelog = false">我知道了</el-button>
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
  import { ref, computed, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import LrmLogo from '@/components/icons/LrmLogo.vue';
  import { loadAllTools } from '@/data/tools';

  import { submitFeedbackToBackend } from '@/api/feedback';

  const showFeedback = ref(false);
  const showChangelog = ref(false);
  const showDisclaimer = ref(false);
  const isSubmitting = ref(false);

  const currentYear = computed(() => new Date().getFullYear());
  const totalTools = ref(168);

  onMounted(async () => {
    try {
      const allTools = await loadAllTools();
      totalTools.value = allTools.length;
    } catch (err) {
      console.error('Failed to load tools count for footer:', err);
    }
  });

  const feedbackForm = ref({
    type: '',
    content: '',
    contact: ''
  });

  async function submitFeedback() {
    if (!feedbackForm.value.type || !feedbackForm.value.content) {
      ElMessage.warning('请填写反馈类型和内容');
      return;
    }

    isSubmitting.value = true;
    try {
      // 调用后端 API 提交
      await submitFeedbackToBackend(feedbackForm.value);

      ElMessage.success('感谢您的反馈！我们会尽快处理。');
      showFeedback.value = false;
      feedbackForm.value = { type: '', content: '', contact: '' };
    } catch {
      ElMessage.error('提交失败，请稍后重试或通过邮件联系我们');
    } finally {
      isSubmitting.value = false;
    }
  }

  function handleEmailClick() {
    const email = 'powelabraham67@gmail.com';
    navigator.clipboard
      .writeText(email)
      .then(() => {
        ElMessage.success('邮箱已复制到剪贴板');
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制');
      });
  }
</script>

<style scoped>
  .app-footer {
    background: linear-gradient(to bottom, transparent, var(--bg-secondary));
    border-top: 1px solid var(--border-color);
    margin-top: auto;
    padding-top: 6rem;
    padding-bottom: 3rem;
    position: relative;
    overflow: hidden;
  }

  /* 装饰背景 */
  .app-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--accent-cyan),
      var(--accent-purple),
      transparent
    );
    opacity: 0.3;
  }

  .footer-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .footer-main-grid {
    display: grid;
    grid-template-columns: 1.2fr 2fr;
    gap: 4rem;
    margin-bottom: 5rem;
  }

  /* Brand Section */
  .brand-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer-brand-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .brand-name {
    font-size: 1.75rem;
    font-weight: 800;
    background: var(--accent-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .brand-slogan {
    font-size: 1rem;
    line-height: 1.8;
    color: var(--text-secondary);
    max-width: 360px;
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.1);
    border-radius: 99px;
    width: fit-content;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
    100% {
      opacity: 0.4;
      transform: scale(1);
    }
  }

  .status-text {
    font-size: 0.8125rem;
    color: #10b981;
    font-weight: 500;
  }

  .footer-social {
    display: flex;
    gap: 1.25rem;
    margin-top: 0.5rem;
  }

  .social-link-item {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 1.25rem;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .social-link-item:hover {
    transform: translateY(-4px) scale(1.1);
    color: white;
  }

  .social-link-item.github:hover {
    background: #24292f;
    border-color: #24292f;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .social-link-item.email:hover {
    background: var(--accent-purple);
    border-color: var(--accent-purple);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);
  }

  /* Nav Sections */
  .nav-sections {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }

  .nav-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    position: relative;
  }

  .nav-title::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 1.5rem;
    height: 2px;
    background: var(--accent-purple);
    border-radius: 2px;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-list a {
    color: var(--text-muted);
    font-size: 0.9375rem;
    transition: all 0.3s ease;
    display: inline-block;
  }

  .nav-list a:hover {
    color: var(--accent-purple);
    transform: translateX(6px);
  }

  /* Footer Bottom */
  .footer-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border-color), transparent);
    margin-bottom: 2.5rem;
  }

  /* Changelog UI Upgrade */
  .changelog-container {
    padding: 0.5rem 1rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .changelog-timeline {
    position: relative;
    padding-left: 2rem;
    border-left: 2px solid var(--border-color);
  }

  .changelog-item {
    position: relative;
    margin-bottom: 3rem;
  }

  .changelog-item::before {
    content: '';
    position: absolute;
    left: -2.35rem;
    top: 0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: var(--bg-card);
    border: 2px solid var(--border-color);
    z-index: 2;
  }

  .changelog-item.featured::before {
    background: var(--accent-purple);
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
  }

  .version-tag {
    position: absolute;
    top: -1.5rem;
    left: 0;
    font-size: 0.625rem;
    font-weight: 800;
    background: var(--accent-purple);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }

  .item-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .version-num {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .version-date {
    font-size: 0.8125rem;
    color: var(--text-muted);
    font-family: monospace;
  }

  .change-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .change-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: var(--text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  /* Tags */
  .tag {
    flex-shrink: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .tag-refactor {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  .tag-ui {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
  }
  .tag-fx {
    background: rgba(236, 72, 153, 0.1);
    color: #ec4899;
  }
  .tag-perf {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
  .tag-fix {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  .tag-sys {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }

  .changelog-more {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8125rem;
    font-style: italic;
    margin-top: 1rem;
    padding-bottom: 2rem;
  }

  .close-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-weight: 600;
  }

  .footer-legal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .copyright-info {
    font-size: 0.875rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .copyright-link {
    font-weight: 600;
    color: var(--text-secondary);
    transition: color 0.2s;
  }

  .copyright-link:hover {
    color: var(--accent-purple);
  }

  .dot-separator {
    opacity: 0.5;
  }

  .beian-info a {
    font-size: 0.8125rem;
    color: var(--text-muted);
    transition: all 0.2s;
    opacity: 0.7;
  }

  .beian-info a:hover {
    opacity: 1;
    color: var(--text-primary);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .footer-main-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
    .brand-section {
      text-align: center;
      align-items: center;
    }
    .brand-slogan {
      max-width: 100%;
    }
    .nav-sections {
      justify-items: center;
      text-align: center;
    }
    .nav-title::after {
      left: 50%;
      transform: translateX(-50%);
    }
    .nav-list a:hover {
      transform: translateY(-2px);
    }
  }

  @media (max-width: 768px) {
    .nav-sections {
      grid-template-columns: 1fr;
      gap: 3rem;
    }
    .footer-legal {
      flex-direction: column;
      text-align: center;
    }
    .app-footer {
      padding-top: 4rem;
    }
  }

  /* Dialog Styles for Changelog */
  .changelog {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 1.5rem;
  }
  .changelog::-webkit-scrollbar {
    width: 6px;
  }
  .changelog::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 10px;
  }
</style>

<style>
  [data-theme='dark'] .el-dialog {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
  }

  [data-theme='dark'] .el-dialog__header .el-dialog__title {
    color: var(--text-primary);
  }

  [data-theme='dark'] .el-dialog__body {
    color: var(--text-secondary);
  }

  [data-theme='dark'] .el-input__wrapper,
  [data-theme='dark'] .el-textarea__inner {
    background-color: var(--bg-primary);
    box-shadow: 0 0 0 1px var(--border-color) inset;
  }

  [data-theme='dark'] .el-input__inner {
    color: var(--text-primary);
  }

  [data-theme='dark'] .el-form-item__label {
    color: var(--text-primary);
  }

  [data-theme='dark'] .changelog-version {
    color: var(--text-primary);
  }

  [data-theme='dark'] .changelog-date {
    color: var(--text-muted);
  }

  [data-theme='dark'] .changelog-list li {
    color: var(--text-secondary);
  }

  [data-theme='dark'] .el-dialog .el-button {
    background: var(--bg-primary);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  [data-theme='dark'] .el-dialog .el-button--primary {
    background: var(--accent-purple);
    border-color: var(--accent-purple);
    color: white;
  }

  [data-theme='dark'] .el-dialog .el-button:hover {
    opacity: 0.9;
    border-color: var(--accent-purple);
    color: var(--accent-purple);
  }

  [data-theme='dark'] .el-dialog .el-button--primary:hover {
    color: white;
  }
</style>
