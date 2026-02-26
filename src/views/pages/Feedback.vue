<template>
  <div class="brutal-page-container">
    <header class="brutal-page-header">
      <button class="brutal-btn-secondary" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon> {{ t('nav.backToHome') }}
      </button>
    </header>

    <main class="brutal-page-content">
      <h1 class="brutal-page-title">{{ t('footer.feedbackTitle') }}.REPORT()</h1>

      <section class="brutal-content-section bg-yellow">
        <h2 class="section-title">01 // {{ t('footer.feedbackType') }}</h2>
        <div class="brutal-type-selector">
          <button
            v-for="type in feedbackTypes"
            :key="type.value"
            :class="['type-btn', { active: feedbackForm.type === type.value }]"
            @click="feedbackForm.type = type.value"
          >
            {{ type.label }}
          </button>
        </div>
      </section>

      <section class="brutal-content-section bg-blue">
        <h2 class="section-title variant-light">02 // {{ t('footer.feedbackContent') }}</h2>
        <div class="brutal-input-group">
          <textarea
            v-model="feedbackForm.content"
            class="brutal-textarea"
            :placeholder="t('footer.feedbackPlaceholder')"
            rows="6"
          ></textarea>
        </div>
      </section>

      <section class="brutal-content-section bg-green">
        <h2 class="section-title">03 // {{ t('footer.contact') }}</h2>
        <div class="brutal-input-group">
          <input
            v-model="feedbackForm.contact"
            type="text"
            class="brutal-input"
            :placeholder="t('footer.contactPlaceholder')"
          />
        </div>
      </section>

      <div class="brutal-page-actions">
        <button class="brutal-submit-btn" :disabled="isSubmitting" @click="submitFeedback">
          <span v-if="!isSubmitting">{{ t('footer.submit') }}</span>
          <span v-else>SUBMITTING...</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { ElMessage } from 'element-plus';
  import { ArrowLeft } from '@element-plus/icons-vue';
  import { submitFeedbackToBackend } from '@/api/feedback';

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  const isSubmitting = ref(false);

  const feedbackTypes = [
    { label: t('footer.featureRequest'), value: 'feature' },
    { label: t('footer.bugReport'), value: 'bug' },
    { label: t('footer.otherIssue'), value: 'other' }
  ];

  const feedbackForm = ref({
    type: 'feature',
    content: '',
    contact: ''
  });

  onMounted(() => {
    const toolName = route.query.tool;
    if (toolName) {
      feedbackForm.value.content = `[${t('app.title')} - ${toolName}] \n`;
      feedbackForm.value.type = 'bug'; // Default to bug report for specific tool feedback
    }
  });

  const submitFeedback = async () => {
    if (!feedbackForm.value.content || feedbackForm.value.content.trim().length < 5) {
      ElMessage.warning(t('footer.feedbackPlaceholder'));
      return;
    }

    isSubmitting.value = true;
    try {
      await submitFeedbackToBackend(feedbackForm.value);
      ElMessage.success(t('footer.feedbackSuccess'));
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      ElMessage.error(t('footer.feedbackError'));
      console.error(error);
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<style scoped>
  .brutal-page-container {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    padding-bottom: 5rem;
  }

  .brutal-page-header {
    background: #fff;
    padding: 1.5rem 2rem;
    border-bottom: 4px solid #111;
    box-shadow: 0px 8px 0px #111;
    position: relative;
    z-index: 10;
  }

  .brutal-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    color: #111;
  }

  .brutal-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #ff4b4b;
    color: #fff;
  }

  .brutal-page-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  .brutal-page-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 900;
    color: #111;
    margin-bottom: 3rem;
    text-transform: uppercase;
    text-align: center;
    text-shadow: 5px 5px 0px #4b7bff;
  }

  .brutal-content-section {
    border: 4px solid #111;
    padding: 2rem;
    margin-bottom: 2.5rem;
    box-shadow: 8px 8px 0px #111;
    position: relative;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-green {
    background: #00e572;
  }

  .section-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    display: inline-block;
    background: #111;
    color: #fff;
    padding: 0.4rem 1rem;
    border: 3px solid #111;
  }

  .section-title.variant-light {
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-type-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .type-btn {
    padding: 1rem;
    background: #fff;
    border: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .type-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .type-btn.active {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-input-group {
    width: 100%;
  }

  .brutal-textarea,
  .brutal-input {
    width: 100%;
    border: 4px solid #111;
    padding: 1rem;
    font-family: inherit;
    font-weight: 600;
    font-size: 1rem;
    outline: none;
    box-shadow: 4px 4px 0px #111;
    box-sizing: border-box;
  }

  .brutal-textarea:focus,
  .brutal-input:focus {
    box-shadow: 8px 8px 0px #111;
    background: #fff;
  }

  .brutal-page-actions {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .brutal-submit-btn {
    width: 100%;
    max-width: 400px;
    background: #ff4b4b;
    color: #fff;
    border: 4px solid #111;
    padding: 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 10px 10px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .brutal-submit-btn:hover:not(:disabled) {
    transform: translate(-4px, -4px);
    box-shadow: 14px 14px 0px #111;
    background: #00e572;
  }

  .brutal-submit-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  [data-theme='dark'] .brutal-page-container {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-page-header {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-page-title {
    color: #eee;
    text-shadow: 5px 5px 0px #cc0000;
  }
  [data-theme='dark'] .brutal-page-actions .brutal-submit-btn {
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .brutal-content-section {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .type-btn {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .type-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .brutal-textarea,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .section-title {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .section-title.variant-light {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  @media (max-width: 768px) {
    .brutal-page-title {
      font-size: 2rem;
    }
    .brutal-submit-btn {
      font-size: 1.25rem;
    }
  }
</style>
