<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <!-- 关闭按钮 -->
          <button class="modal-close" @click="$emit('close')">✕</button>

          <!-- 头部 -->
          <div class="modal-header">
            <div class="modal-icon">
              <el-icon :size="36">
                <component :is="tool.svgIcon ? ToolIcons[tool.svgIcon] : tool.icon" />
              </el-icon>
            </div>
            <div class="modal-title-group">
              <h2 class="modal-title">{{ tool.name }}</h2>
              <div class="modal-tags">
                <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>

          <!-- 内容 -->
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

          <!-- 底部 -->
          <div class="modal-footer">
            <button class="brutal-btn footer-close" @click="$emit('close')">
              {{ t('toolModal.close') }}
            </button>
            <button class="brutal-btn footer-use" @click="handleUseTool">
              ⚡ {{ t('toolModal.use') }}
            </button>
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
  import * as ToolIcons from '@/components/icons/tools';

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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;700;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1000;
  }

  .modal-container {
    position: relative;
    width: 100%;
    max-width: 580px;
    max-height: 85vh;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: brutal-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes brutal-pop-in {
    0% {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* 关闭按钮 */
  .modal-close {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    border: 3px solid #111;
    background: #fff;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    z-index: 2;
    color: #111;
  }

  .modal-close:hover {
    background: #ff4b4b;
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .modal-close:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  /* 头部 */
  .modal-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.75rem 2rem;
    background: #ffd900;
    border-bottom: 4px solid #111;
  }

  .modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 68px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
    flex-shrink: 0;
    color: #111;
  }

  .modal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.6rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
    color: #111;
    letter-spacing: -0.5px;
  }

  .modal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag {
    padding: 0.2rem 0.65rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    background: #111;
    color: #fff;
    border: 2px solid #111;
    letter-spacing: 0.5px;
  }

  /* 内容 */
  .modal-body {
    flex: 1;
    padding: 1.5rem 2rem;
    overflow-y: auto;
    background: #fff;
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

  /* 步骤 */
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

  /* 底部 */
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.25rem 2rem;
    border-top: 4px solid #111;
    background: #f9f9f5;
  }

  .brutal-btn {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    padding: 0.6rem 1.5rem;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .brutal-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .footer-close {
    background: #fff;
    color: #111;
  }

  .footer-close:hover {
    background: #eee;
  }

  .footer-use {
    background: #00e572;
    color: #111;
  }

  .footer-use:hover {
    background: #00cc66;
  }

  /* 过渡动画 */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-enter-active .modal-container {
    animation: brutal-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .modal-leave-active .modal-container {
    transition: all 0.15s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-leave-to .modal-container {
    transform: scale(0.95) translateY(10px);
    opacity: 0;
  }

  /* 暗色模式 */
  [data-theme='dark'] .modal-container {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .modal-close {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }

  [data-theme='dark'] .modal-close:hover {
    background: #cc0000;
    color: #fff;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .modal-header {
    background: #b28f00;
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .modal-icon {
    background: #222;
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
    color: #eee;
  }

  [data-theme='dark'] .modal-title {
    color: #111;
  }

  [data-theme='dark'] .tag {
    background: #eee;
    color: #111;
    border-color: #eee;
  }

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

  [data-theme='dark'] .modal-footer {
    background: #222;
    border-top-color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .footer-close {
    background: #333;
    color: #eee;
  }

  [data-theme='dark'] .footer-close:hover {
    background: #444;
  }

  [data-theme='dark'] .footer-use {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .footer-use:hover {
    background: #00b35b;
  }

  /* 响应式 */
  @media (max-width: 640px) {
    .modal-container {
      max-height: 90vh;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
    }

    .modal-icon {
      width: 52px;
      height: 52px;
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
