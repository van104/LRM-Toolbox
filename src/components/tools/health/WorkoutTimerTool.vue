<template>
  <div class="iframe-wrapper">
    <iframe
      src="/tools/WorkoutTimer/index.html"
      class="full-frame"
      title="Workout Timer"
      frameborder="0"
    ></iframe>
  </div>
</template>

<script setup>
  // iframe 直接加载 public/tools/WorkoutTimer/index.html，无需 import
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
