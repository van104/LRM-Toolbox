<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container glass">
          <button class="modal-close" @click="$emit('close')">
            <el-icon :size="24"><Close /></el-icon>
          </button>

          <div class="modal-header">
            <div class="modal-icon">
              <el-icon :size="40"><component :is="tool.icon" /></el-icon>
            </div>
            <div class="modal-title-group">
              <h2 class="modal-title">{{ tool.name }}</h2>
              <div class="modal-tags">
                <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>

          <div class="modal-body">
            <section class="modal-section">
              <h3 class="section-title">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ t('toolModal.intro') }}</span>
              </h3>
              <p class="section-content">{{ tool.description }}</p>
            </section>

            <section class="modal-section">
              <h3 class="section-title">
                <el-icon><Guide /></el-icon>
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

          <div class="modal-footer">
            <el-button @click="$emit('close')">{{ t('toolModal.close') }}</el-button>
            <el-button type="primary" @click="handleUseTool">
              <el-icon><Position /></el-icon>
              <span>{{ t('toolModal.use') }}</span>
            </el-button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/stores/user';
  import { Close, InfoFilled, Guide, Position } from '@element-plus/icons-vue';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    tool: {
      type: Object,
      default: () => ({})
    }
  });

  const emit = defineEmits(['close']);
  const router = useRouter();
  const userStore = useUserStore();
  const { t } = useI18n();

  const usageSteps = computed(() => {
    if (!props.tool.usage) return [];
    return props.tool.usage.split('\n').map(s => s.replace(/^\d+\.\s*/, ''));
  });

  function handleUseTool() {
    if (props.tool.id) {
      userStore.addToHistory(props.tool);
    }

    emit('close');
    if (props.tool.route) {
      router.push(props.tool.route);
    }
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .modal-container {
    position: relative;
    width: 100%;
    max-width: 560px;
    max-height: 85vh;
    border-radius: var(--radius-xl);
    background: var(--bg-secondary);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: all var(--transition-fast);
    z-index: 1;
  }

  .modal-close:hover {
    color: var(--text-primary);
    background: var(--bg-glass);
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem 2rem 1.5rem;
    background: var(--accent-gradient);
    color: white;
  }

  .modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  }

  .modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .modal-tags .tag {
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .modal-body {
    flex: 1;
    padding: 1.5rem 2rem;
    overflow-y: auto;
  }

  .modal-section {
    margin-bottom: 1.5rem;
  }

  .modal-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.75rem;
  }

  .section-title .el-icon {
    color: var(--accent-cyan);
  }

  .section-content {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .usage-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .usage-step {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--accent-gradient);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    line-height: 1.5;
    padding-top: 2px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border-color);
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all var(--transition-normal);
  }

  .modal-enter-active .modal-container,
  .modal-leave-active .modal-container {
    transition: all var(--transition-normal);
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: scale(0.95) translateY(20px);
  }

  @media (max-width: 640px) {
    .modal-container {
      max-height: 90vh;
    }

    .modal-header {
      padding: 1.5rem;
    }

    .modal-icon {
      width: 56px;
      height: 56px;
    }

    .modal-title {
      font-size: 1.25rem;
    }

    .modal-body,
    .modal-footer {
      padding: 1rem 1.5rem;
    }
  }
</style>
