<template>
  <div
    v-if="modelValue"
    class="brutal-modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="brutal-modal-content brutal-pane" style="max-width: 400px">
      <div class="pane-header bg-yellow text-black">
        <span>+ 新增预设</span>
        <button class="close-btn" style="color: black" @click="$emit('update:modelValue', false)">
          ✖
        </button>
      </div>
      <div class="pane-body">
        <div class="custom-input-group mt-2">
          <div class="input-item">
            <input
              v-model.number="newPresetHours"
              type="number"
              min="0"
              max="99"
              class="num-input"
            />
            <span class="unit">时</span>
          </div>
          <div class="input-item">
            <input
              v-model.number="newPresetMinutes"
              type="number"
              min="0"
              max="59"
              class="num-input"
            />
            <span class="unit">分</span>
          </div>
          <div class="input-item">
            <input
              v-model.number="newPresetSeconds"
              type="number"
              min="0"
              max="59"
              class="num-input"
            />
            <span class="unit">秒</span>
          </div>
        </div>
        <input
          v-model="newPresetLabel"
          class="brutal-input full mt-3"
          placeholder="预设名称（留空推断时长）"
        />
        <div class="flex-row mt-4" style="gap: 1rem">
          <button class="brutal-action-btn full" @click="$emit('update:modelValue', false)">
            取消
          </button>
          <button class="brutal-action-btn bg-dark text-white full" @click="confirmAddPreset">
            确认新增
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  defineProps({
    modelValue: Boolean
  });

  const emit = defineEmits(['update:modelValue', 'add']);

  const newPresetHours = ref(0);
  const newPresetMinutes = ref(0);
  const newPresetSeconds = ref(0);
  const newPresetLabel = ref('');

  function formatDuration(seconds) {
    if (seconds >= 3600) return (seconds / 3600).toFixed(1).replace('.0', '') + '小时';
    if (seconds >= 60) return (seconds / 60).toFixed(0) + '分钟';
    return seconds + '秒';
  }

  function confirmAddPreset() {
    const total =
      newPresetHours.value * 3600 + newPresetMinutes.value * 60 + newPresetSeconds.value;
    if (total > 0) {
      emit('add', {
        time: total,
        label: newPresetLabel.value || formatDuration(total)
      });
      emit('update:modelValue', false);
    }
  }
</script>

<style scoped>
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .brutal-modal-content {
    width: 90%;
    max-width: 400px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .pane-body {
    padding: 1.5rem;
  }

  .custom-input-group {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
  }

  .input-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .num-input {
    width: 50px;
    height: 40px;
    border: 3px solid #111;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .unit {
    font-weight: 800;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.75rem;
    font-weight: 700;
    width: 100%;
    box-sizing: border-box;
  }

  .flex-row {
    display: flex;
    align-items: center;
  }

  .brutal-action-btn {
    border: 3px solid #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    background: #fff;
    color: #111;
  }

  .full {
    width: 100%;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }
</style>
