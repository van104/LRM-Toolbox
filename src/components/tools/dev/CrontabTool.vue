<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Cron<span>.生成器()</span></h1>
        <button class="brutal-btn copy-btn" @click="handleCopy(cronExpression)">📋 复制结果</button>
      </header>

      <!-- Cron 结果展示横条 -->
      <div class="cron-result-bar">
        <div class="cron-label-row">
          <span class="cron-part-label">秒</span>
          <span class="cron-part-label">分</span>
          <span class="cron-part-label">时</span>
          <span class="cron-part-label">日</span>
          <span class="cron-part-label">月</span>
          <span class="cron-part-label">周</span>
        </div>
        <div class="cron-value-row">
          <span v-for="(p, i) in cronParts" :key="i" :class="['cron-token', `token-${i}`]">{{
            p
          }}</span>
        </div>
        <div class="cron-full">
          <code>{{ cronExpression }}</code>
        </div>
      </div>

      <!-- 主布局 -->
      <div class="brutal-grid">
        <!-- 左侧：预览与说明 -->
        <div class="brutal-pane result-pane">
          <div class="pane-header bg-yellow">
            <span>解读 &amp; 预估时间</span>
          </div>
          <div class="pane-body">
            <div class="human-desc-box">
              <div class="desc-label">// 语义化解读</div>
              <p class="human-desc">{{ humanDescription }}</p>
            </div>

            <div class="execution-list">
              <div class="desc-label">// 预估运行时间 (参考)</div>
              <div v-for="(time, idx) in nextExecutionTimes" :key="idx" class="time-item">
                <span class="time-idx">{{ idx + 1 }}</span>
                <span>{{ time }}</span>
              </div>
            </div>

            <div class="info-note">
              <strong>ℹ️ 说明：</strong> 生成 6 位表达式 (秒 分 时 日 月 周)，适用于 Spring / Quartz
              框架。
            </div>
          </div>
        </div>

        <!-- 右侧：配置区 -->
        <div class="config-section">
          <!-- Tab 切换 -->
          <div class="brutal-pane config-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">// 表达式配置</span>
            </div>
            <div class="inner-tab-bar">
              <button
                v-for="tab in unitTabs"
                :key="tab.id"
                :class="['inner-tab', { active: activeTab === tab.id }]"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="tab-body">
              <CronInput
                v-if="activeTab === 'second'"
                v-model="second"
                unit="秒"
                :max="59"
                :min="0"
              />
              <CronInput
                v-else-if="activeTab === 'minute'"
                v-model="minute"
                unit="分"
                :max="59"
                :min="0"
              />
              <CronInput
                v-else-if="activeTab === 'hour'"
                v-model="hour"
                unit="时"
                :max="23"
                :min="0"
              />
              <CronInput
                v-else-if="activeTab === 'day'"
                v-model="day"
                unit="日"
                :max="31"
                :min="1"
              />
              <CronInput
                v-else-if="activeTab === 'month'"
                v-model="month"
                unit="月"
                :max="12"
                :min="1"
              />
              <CronInput
                v-else-if="activeTab === 'week'"
                v-model="week"
                unit="周"
                :max="7"
                :min="1"
                :labels="weekLabels"
              />
            </div>
          </div>

          <!-- 模版选择 -->
          <div class="brutal-pane template-pane">
            <div class="pane-header bg-green">
              <span>// 常用场景模版</span>
            </div>
            <div class="template-grid">
              <button
                v-for="tmp in templates"
                :key="tmp.name"
                class="brutal-action-btn template-btn"
                @click="applyTemplate(tmp.value)"
              >
                {{ tmp.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, defineComponent, h, watch } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';
  import dayjs from 'dayjs';

  const { copyToClipboard } = useCopy();

  // ---- 内部 CronInput 组件 (原生 HTML 实现，不依赖 Element Plus) ----
  const CronInput = defineComponent({
    props: {
      modelValue: { type: String, required: true },
      unit: { type: String, required: true },
      max: { type: Number, required: true },
      min: { type: Number, default: 0 },
      labels: { type: Array as () => string[], default: () => [] }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const type = ref('all');
      const rangeStart = ref(props.min);
      const rangeEnd = ref(props.min + 1);
      const stepStart = ref(props.min);
      const stepInterval = ref(1);
      const list = ref<number[]>([]);

      watch(
        () => props.modelValue,
        newVal => {
          if (!newVal) return;
          if (newVal === '*' || newVal === '?') {
            type.value = 'all';
          } else if (newVal.includes('-')) {
            type.value = 'range';
            const [a, b] = newVal.split('-').map(Number);
            rangeStart.value = a;
            rangeEnd.value = b;
          } else if (newVal.includes('/')) {
            type.value = 'step';
            const [a, b] = newVal.split('/').map(Number);
            stepStart.value = a;
            stepInterval.value = b;
          } else {
            type.value = 'list';
            list.value = newVal
              .split(',')
              .map(Number)
              .filter(n => !isNaN(n));
          }
        },
        { immediate: true }
      );

      const updateValue = () => {
        let val = '*';
        if (type.value === 'all') val = '*';
        else if (type.value === 'range') val = `${rangeStart.value}-${rangeEnd.value}`;
        else if (type.value === 'step') val = `${stepStart.value}/${stepInterval.value}`;
        else if (type.value === 'list') {
          val = list.value.length
            ? list.value.sort((a, b) => a - b).join(',')
            : props.min.toString();
        }
        if (val !== props.modelValue) emit('update:modelValue', val);
      };

      watch([type, rangeStart, rangeEnd, stepStart, stepInterval, list], updateValue, {
        deep: true
      });

      const toggleItem = (val: number) => {
        const idx = list.value.indexOf(val);
        if (idx === -1) list.value = [...list.value, val];
        else list.value = list.value.filter(v => v !== val);
      };

      const nums = computed(() =>
        Array.from({ length: props.max - props.min + 1 }, (_, i) => i + props.min)
      );

      return () =>
        h('div', { class: 'ci-wrap' }, [
          // 四个模式按钮
          h(
            'div',
            { class: 'ci-modes' },
            [
              ['all', `每${props.unit} (*)`],
              ['range', '周期范围 (-)'],
              ['step', '步长间隔 (/)'],
              ['list', '指定数值 (,)']
            ].map(([id, label]) =>
              h(
                'button',
                {
                  class: ['ci-mode-btn', { active: type.value === id }],
                  onClick: () => {
                    type.value = id as string;
                  }
                },
                label as string
              )
            )
          ),

          // 范围模式
          type.value === 'range'
            ? h('div', { class: 'ci-controls' }, [
                h('span', { class: 'ci-label' }, '从'),
                h('input', {
                  type: 'number',
                  class: 'ci-num-input',
                  value: rangeStart.value,
                  min: props.min,
                  max: props.max,
                  onInput: (e: Event) => {
                    rangeStart.value = Number((e.target as HTMLInputElement).value);
                  }
                }),
                h('span', { class: 'ci-label' }, '至'),
                h('input', {
                  type: 'number',
                  class: 'ci-num-input',
                  value: rangeEnd.value,
                  min: props.min,
                  max: props.max,
                  onInput: (e: Event) => {
                    rangeEnd.value = Number((e.target as HTMLInputElement).value);
                  }
                }),
                h('span', { class: 'ci-label' }, props.unit)
              ])
            : null,

          // 步长模式
          type.value === 'step'
            ? h('div', { class: 'ci-controls' }, [
                h('span', { class: 'ci-label' }, '从'),
                h('input', {
                  type: 'number',
                  class: 'ci-num-input',
                  value: stepStart.value,
                  min: props.min,
                  max: props.max,
                  onInput: (e: Event) => {
                    stepStart.value = Number((e.target as HTMLInputElement).value);
                  }
                }),
                h('span', { class: 'ci-label' }, '起，每'),
                h('input', {
                  type: 'number',
                  class: 'ci-num-input',
                  value: stepInterval.value,
                  min: 1,
                  max: props.max,
                  onInput: (e: Event) => {
                    stepInterval.value = Number((e.target as HTMLInputElement).value);
                  }
                }),
                h('span', { class: 'ci-label' }, props.unit)
              ])
            : null,

          // 列表模式
          type.value === 'list'
            ? h(
                'div',
                { class: 'ci-checkbox-grid' },
                nums.value.map(val => {
                  const label =
                    props.labels && props.labels[val - props.min]
                      ? props.labels[val - props.min]
                      : String(val);
                  const checked = list.value.includes(val);
                  return h(
                    'button',
                    {
                      class: ['ci-checkbox-btn', { selected: checked }],
                      onClick: () => toggleItem(val)
                    },
                    label as string
                  );
                })
              )
            : null
        ]);
    }
  });

  // ---- 主逻辑 ----
  const activeTab = ref('second');

  const unitTabs = [
    { id: 'second', label: '秒' },
    { id: 'minute', label: '分' },
    { id: 'hour', label: '时' },
    { id: 'day', label: '日' },
    { id: 'month', label: '月' },
    { id: 'week', label: '周' }
  ];

  const second = ref('*');
  const minute = ref('*');
  const hour = ref('*');
  const day = ref('*');
  const month = ref('*');
  const week = ref('?');

  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const cronExpression = computed(
    () => `${second.value} ${minute.value} ${hour.value} ${day.value} ${month.value} ${week.value}`
  );

  const cronParts = computed(() => cronExpression.value.split(' '));

  const humanDescription = computed(() => {
    const expr = cronExpression.value;
    if (expr === '* * * * * ?' || expr === '* * * * * *') return '每秒钟都在执行';

    const isEvery = (v: string) => v === '*' || v === '?';

    // 格式化单个字段为可读描述（不含单位后缀，由调用方添加）
    const fmt = (val: string, unit: string, labels?: string[]): string => {
      if (isEvery(val)) return '';
      if (val.includes('-')) {
        const [a, b] = val.split('-');
        const la = labels ? (labels[Number(a) - 1] ?? a) : a;
        const lb = labels ? (labels[Number(b) - 1] ?? b) : b;
        return `${la}至${lb}`;
      }
      if (val.includes('/')) {
        const [, interval] = val.split('/');
        return `每${interval}个${unit}`;
      }
      if (val.includes(',')) {
        return val
          .split(',')
          .map(v => (labels ? (labels[Number(v) - 1] ?? v) : v))
          .join('、');
      }
      return labels ? (labels[Number(val) - 1] ?? val) : val;
    };

    const parts: string[] = [];

    // 月
    if (!isEvery(month.value)) parts.push(fmt(month.value, '月') + '月');
    // 日
    if (!isEvery(day.value)) parts.push(fmt(day.value, '日') + '日');
    // 周
    if (!isEvery(week.value)) parts.push('每周 ' + fmt(week.value, '天', weekLabels));

    // 时：是否每小时
    if (!isEvery(hour.value)) {
      parts.push(fmt(hour.value, '小时') + '时');
    } else if (parts.length > 0) {
      // 有日期限定但时间全通配，加"每小时"说明
      parts.push('每小时');
    }

    // 分：是否每分钟
    if (!isEvery(minute.value)) {
      parts.push(fmt(minute.value, '分钟') + '分');
    } else if (!isEvery(hour.value)) {
      // 有具体小时但分通配
      parts.push('整点');
    } else if (isEvery(minute.value) && isEvery(hour.value) && parts.length === 0) {
      // 纯秒级：分/时都是 *
      // 什么都不加，后面秒来体现
    }

    // 秒：跳过 0（整分执行），通配符也跳过
    if (second.value !== '0' && !isEvery(second.value)) {
      parts.push(fmt(second.value, '秒') + '秒');
    }

    // 如果所有字段都通配（此处应该在开头已拦截），兜底
    if (parts.length === 0) {
      if (second.value === '0' && isEvery(minute.value) && isEvery(hour.value))
        return '每分钟整点执行';
      return '每秒钟都在执行';
    }

    // 特殊优化：0 * * * * ? → "每分钟"
    if (
      second.value === '0' &&
      isEvery(minute.value) &&
      isEvery(hour.value) &&
      isEvery(day.value) &&
      isEvery(month.value) &&
      isEvery(week.value)
    ) {
      return '每分钟执行';
    }

    // 特殊优化：0 0 * * * ? → "每小时整点"
    if (
      second.value === '0' &&
      minute.value === '0' &&
      isEvery(hour.value) &&
      isEvery(day.value) &&
      isEvery(month.value) &&
      isEvery(week.value)
    ) {
      return '每小时整点执行';
    }

    return `将在 ${parts.join(' ')} 执行`;
  });

  const nextExecutionTimes = computed(() => {
    const base = dayjs();
    return Array.from({ length: 5 }, (_, i) =>
      base.add(i + 1, 'minute').format('YYYY-MM-DD HH:mm:00')
    );
  });

  const templates = [
    { name: '每秒钟', value: '* * * * * ?' },
    { name: '每分钟', value: '0 * * * * ?' },
    { name: '每5秒', value: '*/5 * * * * ?' },
    { name: '每小时整', value: '0 0 * * * ?' },
    { name: '每天凌晨', value: '0 0 0 * * ?' },
    { name: '工作日早9点', value: '0 0 9 ? * 2-6' },
    { name: '每月1号', value: '0 0 0 1 * ?' }
  ];

  const applyTemplate = (val: string) => {
    const parts = val.split(' ');
    if (parts.length === 6) {
      [second.value, minute.value, hour.value, day.value, month.value, week.value] = parts;
    } else if (parts.length === 5) {
      second.value = '0';
      [minute.value, hour.value, day.value, month.value, week.value] = parts;
    }
    ElMessage.success('已应用模版');
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text, { success: '已复制到剪贴板' });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }
  .brutal-btn.copy-btn {
    background: #00e572;
  }

  /* Cron Result Bar */
  .cron-result-bar {
    border: 4px solid #111;
    background: #111;
    box-shadow: 8px 8px 0px #555;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cron-label-row {
    display: flex;
    gap: 0.75rem;
  }

  .cron-part-label {
    flex: 1;
    text-align: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    color: #aaa;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .cron-value-row {
    display: flex;
    gap: 0.75rem;
  }

  .cron-token {
    flex: 1;
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.6rem;
    font-weight: 900;
    padding: 0.5rem;
    border: 3px solid;
  }

  .token-0 {
    color: #ff7be5;
    border-color: #ff7be5;
    background: rgba(255, 123, 229, 0.1);
  }
  .token-1 {
    color: #00e572;
    border-color: #00e572;
    background: rgba(0, 229, 114, 0.1);
  }
  .token-2 {
    color: #4b7bff;
    border-color: #4b7bff;
    background: rgba(75, 123, 255, 0.1);
  }
  .token-3 {
    color: #ffd900;
    border-color: #ffd900;
    background: rgba(255, 217, 0, 0.1);
  }
  .token-4 {
    color: #ff9f43;
    border-color: #ff9f43;
    background: rgba(255, 159, 67, 0.1);
  }
  .token-5 {
    color: #ff4b4b;
    border-color: #ff4b4b;
    background: rgba(255, 75, 75, 0.1);
  }

  .cron-full {
    text-align: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid #333;
  }

  .cron-full code {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    letter-spacing: 4px;
  }

  /* Layout */
  .brutal-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .bg-green {
    background: #00e572;
  }
  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .desc-label {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #555;
    margin-bottom: 0.5rem;
  }

  .human-desc {
    background: #fdfae5;
    border: 3px solid #111;
    padding: 1rem;
    font-weight: 700;
    font-size: 1rem;
    box-shadow: 4px 4px 0px #111;
    margin: 0;
    line-height: 1.6;
  }

  .execution-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .time-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid #111;
    background: #f0f0f0;
    font-weight: 600;
  }

  .time-idx {
    background: #111;
    color: #ffd900;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.8rem;
  }

  .info-note {
    background: #fff8e0;
    border: 3px solid #f59e0b;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    font-weight: 600;
    box-shadow: 3px 3px 0px #f59e0b;
    line-height: 1.6;
  }

  /* Config Section */
  .config-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Inner Tabs */
  .inner-tab-bar {
    display: flex;
    border-bottom: 4px solid #111;
    background: #fdfae5;
  }

  .inner-tab {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-right: 3px solid #111;
    background: transparent;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    text-transform: uppercase;
    color: #555;
    transition: all 0.1s;
  }

  .inner-tab:last-child {
    border-right: none;
  }
  .inner-tab:hover {
    background: #e0e0e0;
  }
  .inner-tab.active {
    background: #111;
    color: #ffd900;
  }

  .tab-body {
    padding: 2rem;
    min-height: 260px;
  }

  /* CronInput 内部样式 */
  .ci-wrap {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ci-modes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .ci-mode-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .ci-mode-btn:hover {
    background: #f0f0f0;
  }
  .ci-mode-btn.active {
    background: #111;
    color: #ffd900;
    box-shadow: 0px 0px 0px #111;
  }

  .ci-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 1rem;
    border: 3px solid #111;
    background: #fdfae5;
    box-shadow: 4px 4px 0px #111;
  }

  .ci-label {
    font-weight: 700;
    font-size: 1rem;
  }

  .ci-num-input {
    border: 3px solid #111;
    padding: 0.4rem 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    font-size: 1.1rem;
    background: #fff;
    color: #111;
    outline: none;
    width: 80px;
    box-shadow: 3px 3px 0px #111;
    text-align: center;
    transition: all 0.1s;
  }

  .ci-num-input:focus {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }

  .ci-checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.5rem;
  }

  .ci-checkbox-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-align: center;
  }

  .ci-checkbox-btn:hover {
    background: #f0f0f0;
  }
  .ci-checkbox-btn.selected {
    background: #00e572;
    box-shadow: 0px 0px 0px #111;
  }

  /* Templates */
  .template-pane {
    box-shadow: 8px 8px 0px #111;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 1rem;
    padding: 1.5rem;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.7rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-align: center;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
    }
    .cron-label-row,
    .cron-value-row {
      flex-wrap: wrap;
    }
    .cron-token,
    .cron-part-label {
      flex: 0 0 calc(33% - 0.5rem);
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.copy-btn {
    background: #007a3d;
    color: #fff;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .template-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }

  [data-theme='dark'] .inner-tab-bar {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .inner-tab {
    color: #aaa;
    border-right-color: #eee;
  }
  [data-theme='dark'] .inner-tab:hover {
    background: #222;
  }
  [data-theme='dark'] .inner-tab.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .human-desc {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .time-item {
    background: #222;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .info-note {
    background: #2a1a00;
    border-color: #b86c00;
    color: #ffcc77;
    box-shadow: 3px 3px 0px #b86c00;
  }

  [data-theme='dark'] .ci-mode-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .ci-mode-btn:hover {
    background: #333;
  }
  [data-theme='dark'] .ci-mode-btn.active {
    background: #eee;
    color: #111;
    box-shadow: none;
  }

  [data-theme='dark'] .ci-controls {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .ci-num-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .ci-num-input:focus {
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .ci-checkbox-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .ci-checkbox-btn:hover {
    background: #333;
  }
  [data-theme='dark'] .ci-checkbox-btn.selected {
    background: #007a3d;
    color: #fff;
    box-shadow: none;
  }

  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .cron-result-bar {
    box-shadow: 8px 8px 0px #333;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .desc-label {
    color: #aaa;
  }
</style>

<!-- 全局样式：CronInput 基于 h() 渲染，无法继承 scoped 属性，需放在非 scoped 块中 -->
<style>
  .ci-wrap {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ci-modes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .ci-mode-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    color: #111;
  }

  .ci-mode-btn:hover {
    background: #e8e8e8;
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }
  .ci-mode-btn.active {
    background: #111;
    color: #ffd900;
    box-shadow: 0px 0px 0px #111;
    transform: translate(4px, 4px);
  }

  .ci-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 1rem 1.5rem;
    border: 3px solid #111;
    background: #fdfae5;
    box-shadow: 4px 4px 0px #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .ci-label {
    font-weight: 700;
    font-size: 1.05rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    color: #111;
  }

  .ci-num-input {
    border: 3px solid #111;
    padding: 0.45rem 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    font-size: 1.2rem;
    background: #fff;
    color: #111;
    outline: none;
    width: 80px;
    box-shadow: 3px 3px 0px #111;
    text-align: center;
    transition: all 0.1s;
  }

  .ci-num-input:focus {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
    background: #fdfae5;
  }

  .ci-checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 0.6rem;
  }

  .ci-checkbox-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.5rem 0.25rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    text-align: center;
    color: #111;
  }

  .ci-checkbox-btn:hover {
    background: #e8e8e8;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .ci-checkbox-btn.selected {
    background: #00e572;
    color: #111;
    box-shadow: 0px 0px 0px #111;
    transform: translate(3px, 3px);
    border-color: #111;
  }

  /* Dark Mode for CronInput global styles */
  [data-theme='dark'] .ci-mode-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .ci-mode-btn:hover {
    background: #333;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .ci-mode-btn.active {
    background: #eee;
    color: #111;
    box-shadow: none;
  }

  [data-theme='dark'] .ci-controls {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .ci-label {
    color: #eee;
  }

  [data-theme='dark'] .ci-num-input {
    background: #111;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .ci-num-input:focus {
    box-shadow: 5px 5px 0px #eee;
    background: #1a1a1a;
  }

  [data-theme='dark'] .ci-checkbox-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .ci-checkbox-btn:hover {
    background: #333;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .ci-checkbox-btn.selected {
    background: #007a3d;
    color: #fff;
    box-shadow: none;
  }
</style>
