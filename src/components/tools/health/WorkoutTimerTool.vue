<template>
  <div class="iframe-wrapper">
    <iframe
      :src="
        isDev
          ? '/src/components/tools/health/WorkoutTimer/index.html'
          : '/tools/WorkoutTimer/index.html'
      "
      class="full-frame"
      title="Workout Timer"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script setup>
  const isDev = import.meta.env.DEV;
</script>

<style scoped>
  .iframe-wrapper {
    width: 100%;
    height: 100vh;
    background: transparent;
    display: flex;
    flex-direction: column;
  }

  .full-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
</style>
