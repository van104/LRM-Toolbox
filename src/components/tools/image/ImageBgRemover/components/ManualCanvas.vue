<template>
  <div class="manual-editor-container">
    <div class="editor-toolbar">
      <label class="toolbar-label">笔刷直径 ({{ brushSize }}px)</label>
      <input
        v-model.number="brushSize"
        type="range"
        class="brutal-slider small-slider mx-2"
        min="1"
        max="100"
      />

      <div class="tool-group">
        <button
          class="brutal-btn small-btn"
          :class="{ 'active-tool': brushType === 'erase' }"
          @click="brushType = 'erase'"
        >
          擦除区
        </button>
        <button
          class="brutal-btn small-btn"
          :class="{ 'active-tool': brushType === 'restore' }"
          @click="brushType = 'restore'"
        >
          挽救区
        </button>
      </div>

      <div class="tool-group right-tools">
        <button class="brutal-btn small-btn" :disabled="historyStack.length <= 1" @click="undo">
          撤回
        </button>
        <button class="brutal-btn small-btn success" @click="save">覆盖保存</button>
        <button class="brutal-btn small-btn error" @click="$emit('cancel')">放弃变更</button>
      </div>
    </div>

    <div ref="canvasWrapper" class="canvas-wrapper transparency-grid">
      <canvas
        ref="editCanvas"
        @mousedown.prevent="startDrawing"
        @mousemove.prevent="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend.prevent="stopDrawing"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';

  const props = defineProps({
    imageUrl: { type: String, required: true },
    resultUrl: { type: String, default: '' }
  });

  const emit = defineEmits(['save', 'cancel']);

  const editCanvas = ref<HTMLCanvasElement | null>(null);
  const canvasWrapper = ref<HTMLElement | null>(null);
  const brushSize = ref(20);
  const brushType = ref<'erase' | 'restore'>('erase');
  const isDrawing = ref(false);
  const historyStack = ref<string[]>([]);
  let ctx: CanvasRenderingContext2D | null = null;
  let offscreenCanvas: HTMLCanvasElement | null = null;
  let offscreenCtx: CanvasRenderingContext2D | null = null;
  let originalImage: HTMLImageElement | null = null;

  onMounted(async () => {
    await nextTick();
    initCanvas();
  });

  const initCanvas = () => {
    const canvas = editCanvas.value;
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');

    originalImage = new Image();
    originalImage.crossOrigin = 'anonymous';
    originalImage.src = props.imageUrl;

    originalImage.onload = () => {
      if (!canvas || !offscreenCanvas || !offscreenCtx || !ctx) return;
      canvas.width = originalImage!.width;
      canvas.height = originalImage!.height;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      offscreenCtx.drawImage(originalImage!, 0, 0);

      if (props.resultUrl) {
        const resImg = new Image();
        resImg.crossOrigin = 'anonymous';
        resImg.src = props.resultUrl;
        resImg.onload = () => {
          ctx!.drawImage(resImg, 0, 0, canvas.width, canvas.height);
          saveHistory();
        };
      } else {
        ctx.drawImage(originalImage!, 0, 0);
        saveHistory();
      }
    };
  };

  const saveHistory = () => {
    if (!editCanvas.value) return;
    historyStack.value.push(editCanvas.value.toDataURL('image/png'));
    if (historyStack.value.length > 20) historyStack.value.shift();
  };

  const undo = () => {
    if (historyStack.value.length <= 1 || !ctx || !editCanvas.value) return;
    historyStack.value.pop();
    const lastState = historyStack.value[historyStack.value.length - 1];
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      ctx!.clearRect(0, 0, editCanvas.value!.width, editCanvas.value!.height);
      ctx!.drawImage(img, 0, 0);
    };
  };

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    if (!ctx) return;
    isDrawing.value = true;
    ctx.beginPath();
    const { x, y } = getCoord(e);
    ctx.moveTo(x, y);
  };

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!isDrawing.value || !ctx || !offscreenCanvas) return;
    const { x, y } = getCoord(e);

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushType.value === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      const pattern = ctx.createPattern(offscreenCanvas, 'no-repeat');
      if (pattern) ctx.strokeStyle = pattern;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.value) return;
    isDrawing.value = false;
    saveHistory();
  };

  const getCoord = (e: MouseEvent | TouchEvent) => {
    const canvas = editCanvas.value;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if (window.TouchEvent && e instanceof TouchEvent) {
      clientX = (e as TouchEvent).touches[0].clientX;
      clientY = (e as TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const save = () => {
    if (!editCanvas.value) return;
    editCanvas.value.toBlob(
      blob => {
        emit('save', blob);
      },
      'image/png',
      1.0
    );
  };
</script>

<style scoped>
  .manual-editor-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    background: #111;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .editor-toolbar {
    padding: 1rem;
    background: #111;
    border-bottom: 4px solid #111;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .toolbar-label {
    color: #fff;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .tool-group {
    display: flex;
    gap: 0.5rem;
  }
  .right-tools {
    margin-left: auto;
  }

  .canvas-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 20px;
    min-height: 500px;
  }

  .transparency-grid {
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 20px 20px;
    background-color: white;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    box-shadow: 8px 8px 0px #111;
    background: transparent;
    touch-action: none;
    border: 4px solid #111;
    cursor: crosshair;
  }

  .brutal-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .brutal-btn.success {
    background: #00e572;
  }
  .brutal-btn.error {
    background: #ff4b4b;
    color: white;
  }
  .brutal-btn.active-tool {
    background: #ffd900;
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn:hover:not(:disabled):not(.active-tool) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 120px;
    height: 10px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 24px;
    background: #ff4b4b;
    border: 2px solid #111;
    cursor: pointer;
  }

  .mx-2 {
    margin: 0 0.5rem;
  }
</style>
