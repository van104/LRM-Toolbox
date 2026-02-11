<script setup>
  import { RouterView } from 'vue-router';
  import ErrorBoundary from '@/components/common/ErrorBoundary.vue';
  import MobileTabBar from '@/components/layout/MobileTabBar.vue';
  import CommandPalette from '@/components/common/CommandPalette.vue';
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
</template>

<style></style>
