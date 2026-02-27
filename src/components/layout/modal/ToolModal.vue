<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <!-- 关闭按钮 -->
          <button class="modal-close" @click="$emit('close')">✕</button>

          <ToolModalHeader :tool="tool" />
          <ToolModalBody :tool="tool" />
          <ToolModalFooter @close="$emit('close')" @use="handleUseTool" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import ToolModalHeader from './ToolModalHeader.vue';
  import ToolModalBody from './ToolModalBody.vue';
  import ToolModalFooter from './ToolModalFooter.vue';

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

  /* 响应式 */
  @media (max-width: 640px) {
    .modal-container {
      max-height: 90vh;
    }
  }
</style>
