<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  // 开发模式下禁用 PWA 注册，避免 Service Worker 干扰
  let offlineReady = ref(false);
  let needRefresh = ref(false);
  let updateServiceWorker = () => {};

  if (import.meta.env.PROD) {
    const { useRegisterSW } = await import('virtual:pwa-register/vue');
    const sw = useRegisterSW();
    offlineReady.value = sw.offlineReady;
    needRefresh.value = sw.needRefresh;
    updateServiceWorker = sw.updateServiceWorker;
  }

  const close = async () => {
    offlineReady.value = false;
    needRefresh.value = false;
  };
</script>

<template>
  <div
    v-if="offlineReady || needRefresh"
    class="pwa-toast fixed bottom-4 right-4 z-[2000] p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
    role="alert"
  >
    <div class="mb-3 text-sm font-medium">
      <span v-if="offlineReady">
        {{ t('pwa.offlineReady') }}
      </span>
      <span v-else>
        {{ t('pwa.needRefresh') }}
      </span>
    </div>
    <div class="flex gap-2">
      <button
        v-if="needRefresh"
        class="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        @click="updateServiceWorker()"
      >
        {{ t('pwa.reload') }}
      </button>
      <button
        class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        @click="close"
      >
        {{ t('pwa.close') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  .pwa-toast {
    backdrop-filter: blur(10px);
  }
</style>
