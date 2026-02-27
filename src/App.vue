<script setup>
  import { RouterView } from 'vue-router';
  import ErrorBoundary from '@/components/common/ErrorBoundary.vue';
  import MobileTabBar from '@/components/layout/mobile/MobileTabBar.vue';
  import CommandPalette from '@/components/common/CommandPalette.vue';
  import ReloadPrompt from '@/components/common/ReloadPrompt.vue';
</script>

<template>
  <ErrorBoundary>
    <router-view v-slot="{ Component }">
      <keep-alive include="Home">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </ErrorBoundary>
  <MobileTabBar />
  <CommandPalette />
  <ReloadPrompt />
</template>

<style></style>
