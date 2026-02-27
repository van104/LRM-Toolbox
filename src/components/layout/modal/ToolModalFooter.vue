<template>
  <div class="modal-footer">
    <button class="brutal-btn footer-close" @click="$emit('close')">
      {{ t('toolModal.close') }}
    </button>
    <button class="brutal-btn footer-use" @click="$emit('use')">⚡ {{ t('toolModal.use') }}</button>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  defineEmits(['close', 'use']);
</script>

<style scoped>
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

  /* 暗色模式 */
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

  @media (max-width: 640px) {
    .modal-footer {
      padding: 1rem 1.5rem;
    }
  }
</style>
