<template>
  <div
    ref="compareBox"
    class="photo-preview-box brutal-shadow"
    :class="{ 'has-result': resultUrl, 'is-dragging': isSliding }"
    @mousedown="onStartSliding"
    @touchstart="onStartSliding"
  >
    <div v-if="!resultUrl" class="original-box">
      <img :src="imageUrl" class="preview-img" alt="Original" />
      <div class="tip-badge overlay-tag">原始介质</div>
    </div>

    <div v-else class="slider-compare-box">
      <div class="result-layer transparency-grid">
        <img :src="displayUrl" class="preview-img" alt="Result" />
      </div>

      <div class="original-layer" :style="{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }">
        <img :src="imageUrl" class="preview-img" alt="Original" />
      </div>

      <div class="slider-line" :style="{ left: sliderPos + '%' }">
        <div class="slider-button">↔</div>
      </div>
    </div>

    <div v-if="processing" class="processing-overlay">
      <span class="loading-spinner">⚙️</span>
      <span>正在执行云端剥离程序...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onUnmounted } from 'vue';

  const props = defineProps({
    imageUrl: { type: String, required: true },
    resultUrl: { type: String, default: '' },
    displayUrl: { type: String, default: '' }, // Can be resultUrl or strokeUrl
    processing: { type: Boolean, default: false }
  });

  const sliderPos = ref(50);
  const isSliding = ref(false);
  const compareBox = ref<HTMLElement | null>(null);

  const onStartSliding = (e: MouseEvent | TouchEvent) => {
    if (!props.resultUrl) return;
    isSliding.value = true;
    handleSliderMove(e);
    window.addEventListener('mousemove', handleSliderMove);
    window.addEventListener('mouseup', stopSliding);
    window.addEventListener('touchmove', handleSliderMove, { passive: false });
    window.addEventListener('touchend', stopSliding);
  };

  const stopSliding = () => {
    isSliding.value = false;
    window.removeEventListener('mousemove', handleSliderMove);
    window.removeEventListener('mouseup', stopSliding);
    window.removeEventListener('touchmove', handleSliderMove);
    window.removeEventListener('touchend', stopSliding);
  };

  const handleSliderMove = (e: MouseEvent | TouchEvent) => {
    if (!isSliding.value || !compareBox.value) return;
    const rect = compareBox.value.getBoundingClientRect();

    let clientX = 0;
    if (window.TouchEvent && e instanceof TouchEvent) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }

    const position = ((clientX - rect.left) / rect.width) * 100;
    sliderPos.value = Math.max(0, Math.min(100, position));
  };

  onUnmounted(() => {
    stopSliding();
  });
</script>

<style scoped>
  .photo-preview-box {
    position: relative;
    overflow: hidden;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    min-height: 500px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
  }

  .photo-preview-box.is-dragging {
    cursor: col-resize;
  }

  .slider-compare-box {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    user-select: none;
    overflow: hidden;
  }

  .result-layer,
  .original-layer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .transparency-grid {
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    background-color: white;
  }

  .original-layer {
    z-index: 2;
    background: #e2e8f0;
  }

  .slider-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #111;
    z-index: 10;
    pointer-events: none;
    box-shadow: 4px 0px 0px #ff4b4b;
  }

  .slider-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 48px;
    height: 48px;
    background: #ffd900;
    border: 4px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 4px 4px 0px #111;
    font-weight: 900;
    font-size: 1.2rem;
    cursor: col-resize;
  }

  .preview-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .overlay-tag {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 20;
    background: #111;
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-weight: bold;
    border: 2px solid #fff;
    box-shadow: 2px 2px 0px #111;
  }

  .processing-overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 30;
    font-size: 1.25rem;
    font-weight: 800;
    color: #111;
  }

  .loading-spinner {
    font-size: 3rem;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
