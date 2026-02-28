<template>
  <div class="sidebar brutal-pane bg-white p-4">
    <div class="panel-section">
      <h3 class="section-label">图表类型</h3>
      <div class="chart-types">
        <button
          v-for="type in chartTypes"
          :key="type.value"
          class="type-btn brutal-btn"
          :class="{ 'bg-yellow': config.chartType === type.value }"
          @click="updateConfig('chartType', type.value)"
        >
          <span class="type-icon">{{ type.icon }}</span>
          <span class="type-label">{{ type.label }}</span>
        </button>
      </div>
    </div>

    <div class="panel-section mt-6">
      <h3 class="section-label">数据映射</h3>
      <div class="form-group">
        <label class="font-bold">X轴 / 类别 (Label)</label>
        <select
          :value="config.xAxis"
          class="brutal-input form-select mt-2 w-full"
          @change="updateConfig('xAxis', parseInt($event.target.value))"
        >
          <option value="" disabled>请选择列</option>
          <option v-for="(col, idx) in columns" :key="idx" :value="idx">{{ col }}</option>
        </select>
      </div>
      <div class="form-group mt-4">
        <label class="font-bold">Y轴 / 数值 (Value)</label>
        <select
          :value="config.yAxis"
          class="brutal-input form-select mt-2 w-full"
          @change="updateConfig('yAxis', parseInt($event.target.value))"
        >
          <option value="" disabled>请选择列</option>
          <option v-for="(col, idx) in columns" :key="idx" :value="idx">{{ col }}</option>
        </select>
      </div>
    </div>

    <div class="panel-section mt-6">
      <h3 class="section-label">样式配置</h3>
      <div class="form-group">
        <label class="font-bold">图表标题</label>
        <input
          :value="config.title"
          type="text"
          class="brutal-input form-input mt-2 w-full"
          placeholder="输入图表标题"
          @input="updateConfig('title', $event.target.value)"
        />
      </div>

      <div class="form-group mt-4">
        <label class="font-bold">配色主题</label>
        <div class="color-themes mt-2 flex gap-2 flex-wrap">
          <button
            v-for="theme in themes"
            :key="theme.name"
            class="theme-dot brutal-btn"
            :style="{ background: theme.color }"
            :class="{ active: config.theme === theme.name }"
            :title="theme.label"
            @click="updateConfig('theme', theme.name)"
          ></button>
        </div>
      </div>

      <div class="options-row mt-4">
        <label class="brutal-checkbox">
          <input
            :checked="config.showLegend"
            type="checkbox"
            @change="updateConfig('showLegend', $event.target.checked)"
          />
          <span class="check-box"></span>
          <strong>显示图例</strong>
        </label>
        <label class="brutal-checkbox ml-4">
          <input
            :checked="config.showGrid"
            type="checkbox"
            @change="updateConfig('showGrid', $event.target.checked)"
          />
          <span class="check-box"></span>
          <strong>显示网格</strong>
        </label>
      </div>
    </div>

    <div class="mt-8 flex flex-col gap-4">
      <button class="brutal-btn action-btn bg-cyan w-full text-lg py-3" @click="$emit('generate')">
        🚀 生成图表
      </button>
      <button
        class="brutal-btn action-btn bg-blue text-white w-full text-lg py-3"
        @click="$emit('export')"
      >
        💾 导出高清图片
      </button>
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    config: {
      type: Object,
      required: true
    },
    columns: {
      type: Array,
      required: true
    }
  });

  const emit = defineEmits(['update:config', 'generate', 'export']);

  const chartTypes = [
    { value: 'bar', label: '柱状图', icon: '📊' },
    { value: 'line', label: '折线图', icon: '📈' },
    { value: 'pie', label: '饼图', icon: '🍕' },
    { value: 'doughnut', label: '环形图', icon: '🍩' },
    { value: 'radar', label: '雷达图', icon: '🕸️' }
  ];

  const themes = [
    { name: 'blue', color: '#4b7bff', label: '蓝色' },
    { name: 'green', color: '#00e572', label: '绿色' },
    { name: 'purple', color: '#b34bff', label: '紫色' },
    { name: 'red', color: '#ff4b4b', label: '红色' },
    { name: 'orange', color: '#ffa500', label: '橙色' },
    { name: 'yellow', color: '#ffd900', label: '黄色' }
  ];

  function updateConfig(key, value) {
    emit('update:config', { ...props.config, [key]: value });
  }
</script>

<style scoped>
  .section-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 12px;
    border-bottom: 2px solid #111;
    padding-bottom: 6px;
  }

  .chart-types {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 4px;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .type-icon {
    font-size: 1.8rem;
  }

  .color-themes {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .theme-dot {
    width: 36px;
    height: 36px;
    border-radius: 0;
    padding: 0;
    border: 3px solid #111;
  }

  .theme-dot.active {
    box-shadow: 4px 4px 0px #111;
    transform: translate(-2px, -2px);
  }

  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .brutal-checkbox input {
    display: none;
  }

  .check-box {
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    display: inline-block;
    background: #fff;
    transition: all 0.1s;
    position: relative;
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-checkbox input:checked + .check-box {
    background: #00e572;
  }

  .brutal-checkbox input:checked + .check-box::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #111;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .bg-blue {
    background-color: #4b7bff;
  }
</style>
