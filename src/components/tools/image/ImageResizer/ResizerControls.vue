<template>
  <div class="settings-content">
    <div class="brutal-form-group channel-group bg-pink">
      <label class="brutal-label">引爆方向 (Mode)</label>
      <div class="mode-tabs mt-1">
        <button
          :class="['mode-tab', modelValue.resizeMode === 'percentage' ? 'active' : '']"
          @click="updateConfig('resizeMode', 'percentage')"
        >
          比率坍缩 (Percentage)
        </button>
        <button
          :class="['mode-tab', modelValue.resizeMode === 'fixed' ? 'active' : '']"
          @click="updateConfig('resizeMode', 'fixed')"
        >
          物理定格 (Fixed)
        </button>
      </div>
    </div>

    <div v-if="modelValue.resizeMode === 'percentage'" class="brutal-form-group mt-4">
      <label class="brutal-label">压榨比率 [ {{ modelValue.percentage }}% ]</label>
      <div class="slider-group mt-1">
        <input
          :value="modelValue.percentage"
          type="range"
          class="brutal-slider"
          min="1"
          max="200"
          step="1"
          @input="updateConfig('percentage', parseInt(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>

    <div
      v-if="modelValue.resizeMode === 'fixed'"
      class="brutal-form-group channel-group group-pink mt-4"
    >
      <label class="brutal-label">X轴 物理像素量级 (Width: px)</label>
      <input
        :value="modelValue.fixedWidth"
        type="number"
        class="brutal-input mt-1"
        min="1"
        @input="handleWidthInput"
      />

      <label class="brutal-label mt-4">Y轴 物理像素量级 (Height: px)</label>
      <input
        :value="modelValue.fixedHeight"
        type="number"
        class="brutal-input mt-1"
        min="1"
        @input="handleHeightInput"
      />

      <div class="checkbox-wrapper mt-4">
        <label class="brutal-checkbox-label">
          <input
            :checked="modelValue.lockAspectRatio"
            type="checkbox"
            class="brutal-checkbox"
            @change="updateConfig('lockAspectRatio', ($event.target as HTMLInputElement).checked)"
          />
          开启绝对防扭曲屏障 (锁定宽高比)
        </label>
      </div>
    </div>

    <div class="brutal-form-group mt-4">
      <label class="brutal-label"
        >品质降解阈值 [ {{ Math.round(modelValue.quality * 100) }}% ]</label
      >
      <div class="slider-group mt-1">
        <input
          :value="modelValue.quality"
          type="range"
          class="brutal-slider"
          min="0.1"
          max="1"
          step="0.05"
          @input="updateConfig('quality', parseFloat(($event.target as HTMLInputElement).value))"
        />
      </div>
    </div>

    <button
      class="brutal-btn brutal-btn-block action-btn mt-4"
      :disabled="disabled || isProcessing"
      @click="$emit('start')"
    >
      {{ isProcessing ? '量纲碾压中...' : '启动降维打击！' }}
    </button>
  </div>
</template>

<script setup lang="ts">
  import type { ResizeConfig, FileItem } from './useImageResizer';

  interface Props {
    modelValue?: ResizeConfig;
    isProcessing?: boolean;
    disabled?: boolean;
    firstFileMetadata?: FileItem;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({
      resizeMode: 'percentage',
      percentage: 50,
      fixedWidth: 800,
      fixedHeight: 600,
      lockAspectRatio: true,
      quality: 0.9
    }),
    isProcessing: false,
    disabled: true,
    firstFileMetadata: undefined
  });

  const emit = defineEmits(['update:modelValue', 'start']);

  function updateConfig(key: keyof ResizeConfig, value: string | number | boolean) {
    emit('update:modelValue', { ...props.modelValue, [key]: value });
  }

  function handleWidthInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value) || 0;
    const newConfig = { ...props.modelValue, fixedWidth: val };

    if (props.modelValue.lockAspectRatio && props.firstFileMetadata?.width) {
      const ratio = props.firstFileMetadata.height / props.firstFileMetadata.width;
      newConfig.fixedHeight = Math.round(val * ratio);
    }
    emit('update:modelValue', newConfig);
  }

  function handleHeightInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value) || 0;
    const newConfig = { ...props.modelValue, fixedHeight: val };

    if (props.modelValue.lockAspectRatio && props.firstFileMetadata?.height) {
      const ratio = props.firstFileMetadata.width / props.firstFileMetadata.height;
      newConfig.fixedWidth = Math.round(val * ratio);
    }
    emit('update:modelValue', newConfig);
  }
</script>

<style scoped>
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    flex: 1;
    background: #f8fafc;
    background-image:
      linear-gradient(#e5e5e5 1px, transparent 1px),
      linear-gradient(90deg, #e5e5e5 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .brutal-form-group {
    display: flex;
    flex-direction: column;
  }
  .brutal-label {
    font-weight: 800;
    font-size: 1rem;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.8rem;
    font-weight: 700;
    width: 100%;
    box-sizing: border-box;
  }

  .mode-tabs {
    display: flex;
    gap: 0.5rem;
  }
  .mode-tab {
    flex: 1;
    padding: 0.6rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
  }
  .mode-tab.active {
    background: #111;
    color: #fff;
    box-shadow: none;
    transform: translate(3px, 3px);
  }

  .bg-pink {
    background: #ff9ecf;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 12px;
    background: #fff;
    border: 3px solid #111;
    outline: none;
  }
  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
  }
  .brutal-checkbox-label {
    font-weight: 800;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brutal-checkbox {
    width: 20px;
    height: 20px;
    border: 3px solid #111;
    cursor: pointer;
  }

  .action-btn {
    background: #00e572;
    color: #111;
    padding: 1rem;
    font-weight: 900;
  }
  .brutal-btn {
    border: 4px solid #111;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
  }
  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:disabled {
    background: #e0e0e0;
    color: #888;
    border-color: #888;
    cursor: not-allowed;
    box-shadow: 2px 2px 0px #888;
  }
  .brutal-btn-block {
    width: 100%;
  }
  .mt-1 {
    margin-top: 0.25rem;
  }
  .mt-4 {
    margin-top: 1.5rem;
  }
</style>
