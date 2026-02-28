<template>
  <div class="calc-body">
    <!-- 顶部屏幕 -->
    <div class="brutal-pane screen-pane">
      <div class="pane-header bg-yellow">
        <span>🧮 计算器 (CALCULATOR)</span>
        <div class="gender-switch">
          <span class="gender-label">我的性别：</span>
          <button
            class="gender-btn"
            :class="{ active: myGender === 1 }"
            @click="$emit('set-gender', 1)"
          >
            ♂ 男
          </button>
          <button
            class="gender-btn"
            :class="{ active: myGender === 0 }"
            @click="$emit('set-gender', 0)"
          >
            ♀ 女
          </button>
        </div>
      </div>

      <div class="screen-body">
        <div class="expression-line">{{ expressionText }}</div>
        <div class="result-line" :class="{ unknown: resultText === '未知亲戚' }">
          {{ resultText }}
        </div>
      </div>
    </div>

    <!-- 键盘区 -->
    <div class="brutal-pane keyboard-pane">
      <div class="pane-header bg-blue">
        <span class="text-white">⌨️ 关系键盘 (KEYPAD)</span>
      </div>

      <div class="key-grid">
        <button
          v-for="btn in buttons"
          :key="btn.label"
          class="key-btn"
          :class="[btn.colorClass || '', { 'key-disabled': btn.disabled }]"
          :disabled="btn.disabled"
          @click="btn.action"
        >
          {{ btn.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    myGender: { type: Number, default: 1 },
    expressionText: { type: String, default: '' },
    resultText: { type: String, default: '' },
    currentGender: { type: Number, default: 1 }
  });

  const emit = defineEmits(['set-gender', 'append', 'backspace', 'clear']);

  const buttons = computed(() => [
    // 第一行：长辈/年长
    { label: '父', action: () => emit('append', '父') },
    { label: '母', action: () => emit('append', '母') },
    { label: '兄', action: () => emit('append', '兄') },
    { label: '姐', action: () => emit('append', '姐') },

    // 第二行：配偶/平辈
    { label: '夫', action: () => emit('append', '夫'), disabled: props.currentGender === 1 },
    { label: '妻', action: () => emit('append', '妻'), disabled: props.currentGender === 0 },
    { label: '弟', action: () => emit('append', '弟') },
    { label: '妹', action: () => emit('append', '妹') },

    // 第三行：晚辈/功能
    { label: '子', action: () => emit('append', '子') },
    { label: '女', action: () => emit('append', '女') },
    {
      label: '退',
      action: () => emit('backspace'),
      colorClass: 'key-warn'
    },
    {
      label: 'C',
      action: () => emit('clear'),
      colorClass: 'key-danger'
    }
  ]);
</script>

<style scoped>
  .calc-body {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  }

  .pane-header {
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .text-white {
    color: #fff;
  }

  .gender-switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .gender-label {
    font-size: 0.85rem;
    font-weight: 800;
  }
  .gender-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .gender-btn:hover:not(.active) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .gender-btn.active {
    background: #111;
    color: #ffd900;
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 transparent;
  }

  .screen-body {
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    min-height: 150px;
    justify-content: flex-end;
    background: #fdfae5;
  }

  .expression-line {
    font-weight: 700;
    color: #888;
    font-size: 1.2rem;
    text-align: right;
    width: 100%;
    word-break: break-all;
  }

  .result-line {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 4.5rem;
    font-weight: 900;
    color: #111;
    text-align: right;
    width: 100%;
    word-break: break-all;
    line-height: 1.1;
    text-shadow: 3px 3px 0px #ffd900;
    transition: all 0.3s;
  }

  .result-line.unknown {
    font-size: 2.5rem;
    color: #888;
    text-shadow: none;
  }

  .key-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    background: #111;
    border: 2px solid #111;
  }

  .key-btn {
    aspect-ratio: 1.6 / 1;
    background: #fff;
    border: 2px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .key-btn:hover:not(.key-disabled) {
    background: #fdfae5;
    z-index: 10;
    box-shadow: inset 0 0 0 2px #111;
  }

  .key-btn:active:not(.key-disabled) {
    background: #ddd;
    transform: scale(0.95);
  }

  .key-warn {
    background: #ff9900;
  }
  .key-danger {
    background: #ff4b4b;
    color: #fff;
  }

  .key-disabled {
    background: #eee;
    color: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 600px) {
    .result-line {
      font-size: 3rem;
    }
    .key-btn {
      font-size: 1.2rem;
    }
  }
</style>
