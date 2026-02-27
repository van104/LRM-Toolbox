<template>
  <div class="modal-body">
    <section class="modal-section">
      <h3 class="section-title">
        <span class="title-icon">📋</span>
        <span>{{ t('toolModal.intro') }}</span>
      </h3>
      <p class="section-content">{{ tool.description }}</p>
    </section>

    <section class="modal-section">
      <h3 class="section-title">
        <span class="title-icon">⚡</span>
        <span>{{ t('toolModal.usage') }}</span>
      </h3>
      <div class="usage-steps">
        <div v-for="(step, index) in usageSteps" :key="index" class="usage-step">
          <span class="step-number">{{ index + 1 }}</span>
          <span class="step-text">{{ step }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const props = defineProps({
    tool: {
      type: Object,
      required: true
    }
  });

  const { t } = useI18n();

  const usageSteps = computed(() => {
    if (!props.tool.usage) return [];
    return props.tool.usage.split('\n').map(s => s.replace(/^\d+\.\s*/, ''));
  });
</script>

<style scoped>
  .modal-body {
    flex: 1;
    padding: 1.5rem 2rem;
    overflow-y: auto;
    background: #fff;
  }

  .modal-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.05rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 3px solid #111;
  }

  .title-icon {
    font-size: 1.1rem;
  }

  .section-content {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.92rem;
    color: #333;
    line-height: 1.8;
    padding: 1rem;
    background: #f9f9f5;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .usage-steps {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .usage-step {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.65rem 0.85rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .usage-step:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
    background: #fffbe6;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: #4b7bff;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    flex-shrink: 0;
    border: 3px solid #111;
  }

  .step-text {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.9rem;
    color: #111;
    line-height: 1.6;
    padding-top: 3px;
    font-weight: 600;
  }

  /* 暗色模式 */
  [data-theme='dark'] .modal-body {
    background: #1a1a1a;
  }

  [data-theme='dark'] .section-title {
    color: #eee;
    border-bottom-color: #555;
  }

  [data-theme='dark'] .section-content {
    background: #222;
    color: #ddd;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .usage-step {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .usage-step:hover {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .step-number {
    background: #2a4eb2;
    border-color: #eee;
  }

  [data-theme='dark'] .step-text {
    color: #eee;
  }

  @media (max-width: 640px) {
    .modal-body {
      padding: 1rem 1.5rem;
    }
  }
</style>
