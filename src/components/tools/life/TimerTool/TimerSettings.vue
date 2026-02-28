<template>
  <div
    v-if="modelValue"
    class="brutal-modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="brutal-modal-content brutal-pane">
      <div class="pane-header bg-dark text-white">
        <span>⚙️ 高级配置</span>
        <button class="close-btn" @click="$emit('update:modelValue', false)">✖</button>
      </div>
      <div class="pane-body settings-body">
        <div class="settings-section">
          <h3 class="settings-title">提示音</h3>
          <div class="sound-grid">
            <button
              v-for="sound in soundOptions"
              :key="sound.key"
              class="sound-btn"
              :class="{ active: settings.currentSound === sound.key }"
              @click="$emit('update:settings', { ...settings, currentSound: sound.key })"
            >
              {{ sound.name }}
            </button>
          </div>
          <label class="brutal-checkbox mt-3">
            <input
              :checked="settings.loopSound"
              type="checkbox"
              @change="$emit('update:settings', { ...settings, loopSound: $event.target.checked })"
            />
            <span>循环播放提示音</span>
          </label>
        </div>

        <div class="settings-section">
          <h3 class="settings-title">通知提示</h3>
          <label class="brutal-checkbox">
            <input
              :checked="settings.enableNotification"
              type="checkbox"
              @change="handleNotificationChange"
            />
            <span>浏览器系统通知</span>
          </label>
          <label class="brutal-checkbox mt-2">
            <input
              :checked="settings.enableVibration"
              type="checkbox"
              @change="
                $emit('update:settings', { ...settings, enableVibration: $event.target.checked })
              "
            />
            <span>震动反馈 (支持的设备)</span>
          </label>
        </div>

        <div class="settings-section">
          <h3 class="settings-title">预设管理</h3>
          <div class="preset-edit-list">
            <div
              v-for="(preset, index) in settings.quickPresets"
              :key="preset.label + index"
              class="preset-edit-item"
            >
              <span class="time">{{ formatDuration(preset.time) }}</span>
              <span class="label">{{ preset.label }}</span>
              <button class="del-btn" @click="handleRemovePreset(index)">✖</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    modelValue: Boolean,
    settings: {
      type: Object,
      required: true
    },
    soundOptions: {
      type: Array,
      required: true
    }
  });

  const emit = defineEmits(['update:modelValue', 'update:settings']);

  function formatDuration(seconds) {
    if (seconds >= 3600) return (seconds / 3600).toFixed(1).replace('.0', '') + '小时';
    if (seconds >= 60) return (seconds / 60).toFixed(0) + '分钟';
    return seconds + '秒';
  }

  function handleNotificationChange(e) {
    const val = e.target.checked;
    if (val && Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    emit('update:settings', { ...props.settings, enableNotification: val });
  }

  function handleRemovePreset(index) {
    const newPresets = [...props.settings.quickPresets];
    newPresets.splice(index, 1);
    emit('update:settings', { ...props.settings, quickPresets: newPresets });
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
    max-width: 500px;
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
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .pane-body {
    padding: 1.5rem;
  }

  .settings-section {
    margin-bottom: 2rem;
  }

  .settings-title {
    font-weight: 800;
    margin-bottom: 1rem;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
  }

  .sound-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .sound-btn {
    padding: 0.75rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: 700;
    cursor: pointer;
  }

  .sound-btn.active {
    background: #4b7bff;
    color: #fff;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    cursor: pointer;
  }

  .preset-edit-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preset-edit-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    background: #fdfae5;
  }

  .preset-edit-item .time {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    width: 80px;
  }

  .preset-edit-item .label {
    flex: 1;
    font-weight: 700;
  }

  .del-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .bg-dark {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .mt-3 {
    margin-top: 0.75rem;
  }
  .mt-2 {
    margin-top: 0.5rem;
  }
</style>
