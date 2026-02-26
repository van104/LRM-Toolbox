<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-main-grid">
        <!-- Brand Section -->
        <div class="brand-section">
          <div class="footer-brand-logo">
            <LrmLogo :size="40" />
            <h3 class="brand-name font-display">{{ t('app.title') }}</h3>
          </div>
          <p class="brand-slogan whitespace-pre-line">{{ t('footer.slogan') }}</p>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">{{ t('footer.status', { count: totalTools }) }}</span>
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
              title="Email"
              @click.prevent="handleEmailClick"
            >
              <i class="fa-solid fa-envelope"></i>
            </a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="nav-sections">
          <div class="nav-column">
            <h4 class="nav-title">{{ t('footer.coreResources') }}</h4>
            <ul class="nav-list">
              <li>
                <router-link to="/">{{ t('footer.allTools') }}</router-link>
              </li>
              <li>
                <router-link to="/favorites">{{ t('footer.myFavorites') }}</router-link>
              </li>
              <li>
                <router-link to="/history">{{ t('footer.recentHistory') }}</router-link>
              </li>
            </ul>
          </div>

          <div class="nav-column">
            <h4 class="nav-title">{{ t('footer.aboutSupport') }}</h4>
            <ul class="nav-list">
              <li>
                <router-link to="/about">{{ t('footer.aboutUs') }}</router-link>
              </li>
              <li>
                <router-link to="/changelog">{{ t('footer.changelog') }}</router-link>
              </li>
              <li>
                <router-link to="/feedback">{{ t('footer.feedback') }}</router-link>
              </li>
            </ul>
          </div>

          <div class="nav-column">
            <h4 class="nav-title">{{ t('footer.legal') }}</h4>
            <ul class="nav-list">
              <li>
                <router-link to="/privacy">{{ t('footer.privacyPolicy') }}</router-link>
              </li>
              <li>
                <router-link to="/terms">{{ t('footer.termsOfService') }}</router-link>
              </li>
              <li>
                <a href="#" @click.prevent="showDisclaimer = true">{{ t('footer.disclaimer') }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-legal">
        <div class="copyright-info">
          <span>{{ t('footer.copyright', { year: currentYear }) }}</span>
          <span class="dot-separator">•</span>
          <span>{{ t('footer.craftedBy') }}</span>
        </div>
        <div class="beian-info">
          <a href="https://beian.miit.gov.cn/" target="_blank">桂ICP备2025070985号-1</a>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showFeedback"
      :title="t('footer.feedbackTitle')"
      width="500px"
      class="brutal-dialog brutal-dialog-yellow"
      append-to-body
    >
      <el-form :model="feedbackForm" label-position="top" class="brutal-form">
        <el-form-item :label="t('footer.feedbackType')">
          <el-select
            v-model="feedbackForm.type"
            :placeholder="t('footer.feedbackTypePlaceholder')"
            style="width: 100%"
          >
            <el-option :label="t('footer.featureRequest')" value="feature" />
            <el-option :label="t('footer.bugReport')" value="bug" />
            <el-option :label="t('footer.otherIssue')" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('footer.feedbackContent')">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            :placeholder="t('footer.feedbackPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('footer.contact')">
          <el-input v-model="feedbackForm.contact" :placeholder="t('footer.contactPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="brutal-dialog-actions">
          <button class="brutal-btn-secondary" @click="showFeedback = false">
            {{ t('footer.cancel') }}
          </button>
          <button class="brutal-btn-primary" :disabled="isSubmitting" @click="submitFeedback">
            {{ t('footer.submit') }}
          </button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showChangelog"
      :title="t('footer.changelog')"
      width="600px"
      class="brutal-dialog brutal-dialog-blue"
      append-to-body
    >
      <div class="changelog-container">
        <div class="changelog-timeline">
          <div class="changelog-item featured">
            <div class="version-tag">LATEST</div>
            <div class="item-header">
              <span class="version-num">v2.5.0</span>
              <span class="version-date">2026-02-26</span>
            </div>
            <ul class="change-list">
              <li><span class="tag tag-ui">视觉</span>全站工具分类图标全面更新</li>
              <li><span class="tag tag-ui">图标</span>升级 250+ 工具的独立专属 SVG 图标</li>
              <li><span class="tag tag-ui">优化</span>适配 Neobrutalism 风格的视觉表现力</li>
            </ul>
          </div>

          <div class="changelog-item">
            <div class="item-header">
              <span class="version-num">v2.0.0</span>
              <span class="version-date">2026-02-23</span>
            </div>
            <ul class="change-list">
              <li>
                <span class="tag tag-ui">视觉</span>全域 Neobrutalism (新粗野主义) 设计语言重构
              </li>
              <li><span class="tag tag-ui">排版</span>全局硬核黑体备选加强与文本超重描边特效</li>
              <li><span class="tag tag-fx">动效</span>新增平滑沉浮式的返回顶部/底部专属操作模块</li>
              <li>
                <span class="tag tag-fix">修复</span
                >所有荧光色板实施马卡龙降调，彻底解决滚动感光频闪
              </li>
            </ul>
          </div>

          <div class="changelog-item">
            <div class="item-header">
              <span class="version-num">v1.9.0</span>
              <span class="version-date">2026-02-11</span>
            </div>
            <ul class="change-list">
              <li>
                <span class="tag tag-refactor">重构</span>工具数据模块化：异步按需导入，秒开体验
              </li>
              <li><span class="tag tag-ui">预览</span>首页布局优化：截断展示与一键展开</li>
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
              <li><span class="tag tag-fix">工程</span>全站 Linter 错误与警告深度清理修复</li>
            </ul>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="brutal-dialog-actions" style="justify-content: center">
          <button class="brutal-btn-primary width-full" @click="showChangelog = false">
            {{ t('pwa.close') }}
          </button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showDisclaimer"
      :title="t('footer.disclaimerTitle')"
      width="500px"
      class="brutal-dialog brutal-dialog-pink"
      append-to-body
    >
      <div class="disclaimer-content">
        <div
          v-for="(item, idx) in tm('footer.disclaimerPoints')"
          :key="idx"
          class="disclaimer-item mb-4"
        >
          <div class="disclaimer-point-title">
            <strong>{{ rt(item.title) }}</strong>
          </div>
          <div class="disclaimer-point-text">
            {{ rt(item.text, { email: 'powelabraham67@gmail.com' }) }}
          </div>
        </div>
      </div>
      <template #footer>
        <div class="brutal-dialog-actions" style="justify-content: center">
          <button class="brutal-btn-primary width-full" @click="showDisclaimer = false">
            {{ t('footer.understood') }}
          </button>
        </div>
      </template>
    </el-dialog>
  </footer>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ElMessage } from 'element-plus';
  import LrmLogo from '@/components/icons/LrmLogo.vue';
  import { loadAllTools } from '@/data/tools';

  import { submitFeedbackToBackend } from '@/api/feedback';

  const { t, tm, rt } = useI18n();
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

  const submitFeedback = async () => {
    if (!feedbackForm.value.content) {
      ElMessage.warning(t('footer.feedbackPlaceholder'));
      return;
    }

    isSubmitting.value = true;
    try {
      await submitFeedbackToBackend(feedbackForm.value);
      ElMessage.success(t('footer.feedbackSuccess'));
      showFeedback.value = false;
      feedbackForm.value = {
        type: 'feature',
        content: '',
        contact: ''
      };
    } catch (error) {
      ElMessage.error(t('footer.feedbackError'));
      console.error(error);
    } finally {
      isSubmitting.value = false;
    }
  };

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
  /* === Brutalist Dialogs Global Styles === */
  .brutal-dialog {
    border: 4px solid #111 !important;
    border-radius: 0 !important;
    box-shadow: 12px 12px 0px #111 !important;
    background: #fff !important;
    font-family: 'Syne', 'Noto Sans SC', sans-serif !important;
  }

  /* Specific Header Colors based on Dialog Type */
  .brutal-dialog-yellow .el-dialog__header {
    background: #ffd900;
  }
  .brutal-dialog-blue .el-dialog__header {
    background: #4b7bff;
  }
  .brutal-dialog-pink .el-dialog__header {
    background: #ff4b4b;
  }

  .brutal-dialog .el-dialog__header {
    margin-right: 0 !important;
    padding: 1.5rem !important;
    border-bottom: 4px solid #111 !important;
  }

  .brutal-dialog .el-dialog__title {
    color: #111 !important;
    font-weight: 900 !important;
    font-size: 1.5rem !important;
    text-transform: uppercase;
  }

  .brutal-dialog .el-dialog__headerbtn {
    top: 1.25rem !important;
    right: 1.25rem !important;
    width: 32px !important;
    height: 32px !important;
    background: #fff !important;
    border: 3px solid #111 !important;
    border-radius: 0 !important;
    box-shadow: 3px 3px 0px #111 !important;
    transition: all 0.1s;
  }
  .brutal-dialog .el-dialog__headerbtn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111 !important;
    background: #ff4b4b !important;
  }
  .brutal-dialog .el-dialog__headerbtn:hover .el-dialog__close {
    color: #fff !important;
  }

  .brutal-dialog .el-dialog__body {
    padding: 2rem 1.5rem !important;
    color: #111 !important;
  }

  .brutal-dialog .el-dialog__footer {
    border-top: 4px solid #111 !important;
    padding: 1.5rem !important;
  }

  /* Brutalist Buttons in Dialog */
  .brutal-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }

  .brutal-dialog-actions .brutal-btn-primary,
  .brutal-dialog-actions .brutal-btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-family: inherit;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    text-transform: uppercase;
    transition: all 0.1s;
  }

  .width-full {
    width: 100%;
  }

  .brutal-dialog-actions .brutal-btn-primary {
    background: #00e572;
    color: #111;
  }
  .brutal-dialog-actions .brutal-btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #00c964;
  }
  .brutal-dialog-actions .brutal-btn-primary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-dialog-actions .brutal-btn-secondary {
    background: #fff;
    color: #111;
  }
  .brutal-dialog-actions .brutal-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #e5e5e5;
  }
  .brutal-dialog-actions .brutal-btn-secondary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  /* Form & Input Overrides */
  .brutal-form .el-form-item__label {
    font-weight: 800 !important;
    color: #111 !important;
    font-size: 1.1rem !important;
    padding-bottom: 0.5rem !important;
  }

  .brutal-form .el-input__wrapper,
  .brutal-form .el-textarea__inner {
    border: 3px solid #111 !important;
    border-radius: 0 !important;
    box-shadow: 4px 4px 0px #111 !important;
    background: #fff !important;
    color: #111 !important;
    transition: all 0.2s;
    font-weight: bold;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .brutal-form .el-input__wrapper:focus-within,
  .brutal-form .el-textarea__inner:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #4b7bff !important;
  }

  /* Disclaimer Content styling */
  .brutal-raw-text {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    line-height: 1.8;
    background: #fdfae5;
    padding: 1.5rem;
    border: 3px dashed #111;
  }

  /* --- Dark Mode Overrides (Global) --- */
  [data-theme='dark'] .brutal-dialog {
    background: #1a1a1a !important;
    border-color: #eee !important;
    box-shadow: 12px 12px 0px #eee !important;
  }

  [data-theme='dark'] .brutal-dialog .el-dialog__header {
    border-bottom-color: #eee !important;
    background: #111 !important;
  }
  [data-theme='dark'] .brutal-dialog-yellow .el-dialog__header {
    background: #000 !important;
    border-bottom: 4px solid #b28f00 !important;
  }
  [data-theme='dark'] .brutal-dialog-blue .el-dialog__header {
    background: #000 !important;
    border-bottom: 4px solid #2a4eb2 !important;
  }
  [data-theme='dark'] .brutal-dialog-pink .el-dialog__header {
    background: #000 !important;
    border-bottom: 4px solid #cc0000 !important;
  }

  [data-theme='dark'] .brutal-dialog .el-dialog__title {
    color: #eee !important;
  }
  [data-theme='dark'] .brutal-dialog .el-dialog__body {
    color: #eee !important;
  }
  [data-theme='dark'] .brutal-dialog .el-dialog__footer {
    border-top-color: #eee !important;
  }

  [data-theme='dark'] .brutal-dialog .el-dialog__headerbtn {
    background: #222 !important;
    border-color: #eee !important;
    box-shadow: 3px 3px 0px #eee !important;
  }
  [data-theme='dark'] .brutal-dialog .el-dialog__headerbtn .el-dialog__close {
    color: #eee !important;
  }
  [data-theme='dark'] .brutal-dialog .el-dialog__headerbtn:hover {
    background: #cc0000 !important;
    box-shadow: 5px 5px 0px #eee !important;
  }

  [data-theme='dark'] .brutal-dialog-actions .brutal-btn-primary,
  [data-theme='dark'] .brutal-dialog-actions .brutal-btn-secondary {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-dialog-actions .brutal-btn-primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-dialog-actions .brutal-btn-secondary {
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .brutal-dialog-actions .brutal-btn-primary:active,
  [data-theme='dark'] .brutal-dialog-actions .brutal-btn-secondary:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-form .el-form-item__label {
    color: #eee !important;
  }

  [data-theme='dark'] .brutal-form .el-input__wrapper,
  [data-theme='dark'] .brutal-form .el-textarea__inner {
    background: #111 !important;
    border-color: #eee !important;
    box-shadow: 4px 4px 0px #eee !important;
    color: #eee !important;
  }

  [data-theme='dark'] .brutal-raw-text {
    background: #222;
    border-color: #eee;
    color: #eee;
  }
</style>
