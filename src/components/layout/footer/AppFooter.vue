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
          <span class="copyright-owner" data-license="AGPL-3.0"
            >© {{ currentYear }} LRM (van104)</span
          >
          <span class="dot-separator">•</span>
          <a
            href="https://github.com/van104/LRM-Toolbox/blob/main/LICENSE"
            target="_blank"
            class="license-badge"
          >
            AGPL-3.0
          </a>
          <span class="commercial-warning">禁止未经授权商用</span>
        </div>
        <div class="beian-info">
          <a href="https://beian.miit.gov.cn/" target="_blank">桂ICP备2025070985号-1</a>
        </div>
      </div>
    </div>

    <FeedbackDialog v-model="showFeedback" />
    <ChangelogModal v-model="showChangelog" />
    <DisclaimerDialog v-model="showDisclaimer" />
  </footer>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ElMessage } from 'element-plus';
  import LrmLogo from '@/components/icons/LrmLogo.vue';
  import FeedbackDialog from './FeedbackDialog.vue';
  import ChangelogModal from './ChangelogModal.vue';
  import DisclaimerDialog from './DisclaimerDialog.vue';
  import { loadAllTools } from '@/data/tools';

  const { t } = useI18n();
  const showFeedback = ref(false);
  const showChangelog = ref(false);
  const showDisclaimer = ref(false);

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
    flex-wrap: wrap;
  }

  .license-badge {
    font-size: 0.7rem;
    font-weight: 800;
    background: #ffd900;
    color: #111;
    padding: 2px 6px;
    border: 2px solid #111;
    box-shadow: 2px 2px 0px #111;
    text-decoration: none;
    transition: all 0.1s;
  }

  .license-badge:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .commercial-warning {
    color: #ff4b4b;
    font-weight: 800;
    font-size: 0.75rem;
    background: rgba(255, 75, 75, 0.1);
    padding: 1px 6px;
    border: 1px dashed #ff4b4b;
  }

  [data-theme='dark'] .license-badge {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
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
</style>
