<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">Crontab 表达式工具</h1>
        <span class="tool-subtitle">Spring / Quartz Cron Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCopy(cronExpression)">
          <el-icon><CopyDocument /></el-icon>
          复制结果
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧：结果预览 -->
        <aside class="tool-sidebar">
          <div class="panel glass-card result-card">
            <h2 class="panel-title">生成结果</h2>
            <div class="cron-display">
              <code>{{ cronExpression }}</code>
              <el-tooltip content="复制" placement="top">
                <el-icon class="copy-icon" @click="handleCopy(cronExpression)"
                  ><CopyDocument
                /></el-icon>
              </el-tooltip>
            </div>

            <div class="description-box mt-6">
              <h3 class="section-label">语义化解读</h3>
              <p class="human-desc">{{ humanDescription }}</p>
            </div>

            <div v-if="nextExecutionTimes.length" class="execution-list mt-6">
              <h3 class="section-label">预估运行时间</h3>
              <div class="time-list">
                <div v-for="(time, idx) in nextExecutionTimes" :key="idx" class="time-item">
                  <el-icon><Timer /></el-icon>
                  <span>{{ time }}</span>
                </div>
              </div>
            </div>

            <div class="info-box mt-6">
              <el-icon><InfoFilled /></el-icon>
              <div>
                <p>生成 6 位表达式 (秒 分 时 日 月 周)。</p>
                <p class="sub-info">适用于 Spring/Quartz 等框架。</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧：配置区域 -->
        <section class="tool-main">
          <div class="panel glass-card">
            <h2 class="panel-title">表达式配置</h2>
            <el-tabs v-model="activeTab" type="border-card" class="cron-tabs">
              <el-tab-pane label="秒" name="second">
                <CronInput v-model="second" unit="秒" :max="59" />
              </el-tab-pane>
              <el-tab-pane label="分" name="minute">
                <CronInput v-model="minute" unit="分" :max="59" />
              </el-tab-pane>
              <el-tab-pane label="时" name="hour">
                <CronInput v-model="hour" unit="时" :max="23" />
              </el-tab-pane>
              <el-tab-pane label="日" name="day">
                <CronInput v-model="day" unit="日" :max="31" :min="1" />
              </el-tab-pane>
              <el-tab-pane label="月" name="month">
                <CronInput v-model="month" unit="月" :max="12" :min="1" />
              </el-tab-pane>
              <el-tab-pane label="周" name="week">
                <CronInput v-model="week" unit="周" :max="7" :min="1" :labels="weekLabels" />
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">常用场景模版</h2>
            <div class="template-grid">
              <el-button
                v-for="tmp in templates"
                :key="tmp.name"
                plain
                class="template-btn"
                @click="applyTemplate(tmp.value)"
              >
                {{ tmp.name }}
              </el-button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineComponent, h } from 'vue';
  import { ArrowLeft, CopyDocument, Timer, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';
  import dayjs from 'dayjs';

  const { copyToClipboard } = useCopy();

  // --- 内部组件: CronInput (修复了双向绑定) ---
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
      const range = ref([props.min, props.min + 1]);
      const step = ref({ start: props.min, interval: 1 });
      const list = ref<number[]>([]);

      // 核心修复：监听外部 modelValue 变化，反向解析更新内部 UI 状态
      watch(
        () => props.modelValue,
        newVal => {
          if (!newVal) return;
          if (newVal === '*' || newVal === '?') {
            type.value = 'all';
          } else if (newVal.includes('-')) {
            type.value = 'range';
            const [min, max] = newVal.split('-').map(Number);
            range.value = [min, max];
          } else if (newVal.includes('/')) {
            type.value = 'step';
            const [start, interval] = newVal.split('/').map(Number);
            step.value = { start, interval };
          } else {
            // 列表或单数字
            type.value = 'list';
            list.value = newVal
              .split(',')
              .map(Number)
              .filter(n => !isNaN(n));
          }
        },
        { immediate: true }
      );

      // 内部状态变化 -> 更新 modelValue
      const updateValue = () => {
        let val = '*';
        if (type.value === 'all') val = '*';
        else if (type.value === 'range') val = `${range.value[0]}-${range.value[1]}`;
        else if (type.value === 'step') val = `${step.value.start}/${step.value.interval}`;
        else if (type.value === 'list') {
          val = list.value.length
            ? list.value.sort((a, b) => a - b).join(',')
            : props.min.toString(); // 列表为空时默认为最小值
        }
        // 避免死循环：只有值真正改变才 emit
        if (val !== props.modelValue) {
          emit('update:modelValue', val);
        }
      };

      // 监听内部操作
      watch([type, range, step, list], updateValue, { deep: true });

      // 渲染函数：通过直接映射提高渲染稳定性，避免布局断层
      return () =>
        h('div', { class: 'cron-input-container' }, [
          h(
            'el-radio-group',
            {
              modelValue: type.value,
              'onUpdate:modelValue': (v: string) => (type.value = v),
              class: 'radio-column'
            },
            [
              h(
                'div',
                { class: 'radio-option' },
                h('el-radio', { label: 'all', size: 'large' }, '每' + props.unit + ' (*)')
              ),
              h('div', { class: 'radio-option' }, [
                h('el-radio', { label: 'range', size: 'large' }, '周期范围内 (-)'),
                type.value === 'range'
                  ? h('div', { class: 'config-controls' }, [
                      h('el-input-number', {
                        modelValue: range.value[0],
                        'onUpdate:modelValue': (v: number) => (range.value[0] = v),
                        min: props.min,
                        max: props.max,
                        size: 'small',
                        controlsPosition: 'right'
                      }),
                      h('span', { class: 'math-symbol' }, '-'),
                      h('el-input-number', {
                        modelValue: range.value[1],
                        'onUpdate:modelValue': (v: number) => (range.value[1] = v),
                        min: props.min,
                        max: props.max,
                        size: 'small',
                        controlsPosition: 'right'
                      })
                    ])
                  : null
              ]),
              h('div', { class: 'radio-option' }, [
                h('el-radio', { label: 'step', size: 'large' }, '步长间隔 (/)'),
                type.value === 'step'
                  ? h('div', { class: 'config-controls' }, [
                      h('span', { class: 'unit-text' }, '从'),
                      h('el-input-number', {
                        modelValue: step.value.start,
                        'onUpdate:modelValue': (v: number) => (step.value.start = v),
                        min: props.min,
                        max: props.max,
                        size: 'small',
                        controlsPosition: 'right'
                      }),
                      h('span', { class: 'unit-text' }, '开始，每'),
                      h('el-input-number', {
                        modelValue: step.value.interval,
                        'onUpdate:modelValue': (v: number) => (step.value.interval = v),
                        min: 1,
                        max: props.max,
                        size: 'small',
                        controlsPosition: 'right'
                      }),
                      h('span', { class: 'unit-text' }, props.unit)
                    ])
                  : null
              ]),
              h('div', { class: 'radio-option' }, [
                h('el-radio', { label: 'list', size: 'large' }, '指定数值 (,)'),
                type.value === 'list'
                  ? h(
                      'el-checkbox-group',
                      {
                        modelValue: list.value,
                        'onUpdate:modelValue': (v: number[]) => (list.value = v),
                        class: 'checkbox-grid'
                      },
                      Array.from({ length: props.max - props.min + 1 }, (_, i) => {
                        const val = i + props.min;
                        const label =
                          props.labels && props.labels[i] ? props.labels[i] : val.toString();
                        return h('el-checkbox', { label: val, border: true, size: 'small' }, label);
                      })
                    )
                  : null
              ])
            ]
          )
        ]);
    }
  });

  // --- 主逻辑 ---
  const activeTab = ref('second'); // 默认看秒，因为这是6位表达式
  const second = ref('*');
  const minute = ref('*');
  const hour = ref('*');
  const day = ref('*');
  const month = ref('*');
  const week = ref('?'); // 默认为 ?，Spring Cron 中日和周通常互斥，或者为了兼容性

  // 周的显示 Label
  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // 6位表达式计算
  const cronExpression = computed(() => {
    return `${second.value} ${minute.value} ${hour.value} ${day.value} ${month.value} ${week.value}`;
  });

  // 优化的语义化描述逻辑
  const humanDescription = computed(() => {
    if (cronExpression.value === '* * * * * ?' || cronExpression.value === '* * * * * *')
      return '每秒钟都在执行';

    const getPartDesc = (val: string, u: string, labels?: string[]) => {
      if (val === '*' || val === '?') return '每' + u;
      if (val.includes('-')) {
        const [a, b] = val.split('-');
        const la = labels ? labels[Number(a) - 1] : a;
        const lb = labels ? labels[Number(b) - 1] : b;
        return `${la}至${lb}`;
      }
      if (val.includes('/')) {
        const [a, b] = val.split('/');
        return `从${a}${u}起，每隔${b}${u}`;
      }
      if (val.includes(',')) {
        const parts = val.split(',').map(v => (labels ? labels[Number(v) - 1] : v));
        return parts.join('、');
      }
      return labels ? labels[Number(val) - 1] : val;
    };

    const s = second.value === '0' ? '' : getPartDesc(second.value, '秒') + '秒';
    const m = getPartDesc(minute.value, '分') + '分';
    const h = getPartDesc(hour.value, '时') + '点';
    const d = day.value === '*' || day.value === '?' ? '' : getPartDesc(day.value, '日') + '号';
    const mon = month.value === '*' ? '' : getPartDesc(month.value, '月') + '月';
    const w =
      week.value === '*' || week.value === '?'
        ? ''
        : '每周' + getPartDesc(week.value, '周', weekLabels);

    const timeStr = `${mon}${d}${w} ${h}${m}${s}`;
    return `将在 ${timeStr.trim().replace(/\s+/g, ' ')} 执行`;
  });

  // 简单的未来时间预估 (仅用于演示，实际生产需 cron-parser)
  const nextExecutionTimes = computed(() => {
    const times = [];
    const base = dayjs();
    // 简单模拟未来 5 分钟的执行点
    for (let i = 1; i <= 5; i++) {
      times.push(base.add(i, 'minute').format('YYYY-MM-DD HH:mm:00'));
    }
    return times;
  });

  // 模版改为6位格式 (秒 分 时 日 月 周)
  const templates = [
    { name: '每秒钟', value: '* * * * * ?' },
    { name: '每分钟', value: '0 * * * * ?' },
    { name: '每5秒一次', value: '*/5 * * * * ?' },
    { name: '每小时整', value: '0 0 * * * ?' },
    { name: '每天凌晨', value: '0 0 0 * * ?' },
    { name: '工作日早9点', value: '0 0 9 ? * 2-6' }, // 2-6 代表周一到周五
    { name: '每月1号凌晨', value: '0 0 0 1 * ?' }
  ];

  const applyTemplate = (val: string) => {
    const parts = val.split(' ');
    // 处理 5位 或 6位
    if (parts.length === 6) {
      [second.value, minute.value, hour.value, day.value, month.value, week.value] = parts;
    } else if (parts.length === 5) {
      // 兼容 Linux cron 格式，默认秒为 0
      second.value = '0';
      [minute.value, hour.value, day.value, month.value, week.value] = parts;
    }
    ElMessage.success('已应用模版');
  };

  // 使用 useCopy 统一剪贴板操作
  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
  };
</script>

<style scoped>
  /* 样式调整以适应深浅色和更好的布局 */
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .header-left,
  .header-right {
    width: 120px;
  }
  .header-right {
    display: flex;
    justify-content: flex-end;
  }
  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      align-items: start;
    }
  }

  .glass-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 20px;
    border-left: 4px solid #3b82f6;
    padding-left: 12px;
  }
  .section-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .cron-display {
    background: #0f172a;
    color: #38bdf8;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
  }
  .cron-display code {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 1.25rem;
    font-weight: 700;
  }
  .copy-icon {
    cursor: pointer;
    color: #94a3b8;
    transition: color 0.2s;
  }
  .copy-icon:hover {
    color: #fff;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  .template-btn {
    margin: 0 !important;
    width: 100%;
    justify-content: center;
  }

  /* 深度选择器覆盖 Element 样式，修复布局断层和对齐问题 */
  :deep(.cron-tabs) {
    border-radius: 8px;
    overflow: hidden;
  }
  :deep(.el-tabs__content) {
    padding: 20px !important;
    background: #fff;
    min-height: 200px;
  }

  .cron-input-container {
    width: 100%;
  }

  .radio-column {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    gap: 16px;
  }

  .radio-option {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .radio-option:has(.el-radio.is-checked) {
    background: #f8fafc;
  }

  .config-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 32px;
    animation: fadeIn 0.2s ease-out;
  }

  .unit-text {
    font-size: 13px;
    color: #64748b;
  }

  .math-symbol {
    color: #94a3b8;
    font-weight: bold;
    padding: 0 4px;
  }

  .checkbox-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)) !important;
    gap: 8px !important;
    margin-left: 32px;
    margin-top: 8px;
    animation: fadeIn 0.2s ease-out;
  }

  :deep(.checkbox-grid .el-checkbox) {
    margin: 0 !important;
    justify-content: center;
  }

  .human-desc {
    background: #f0f7ff;
    color: #0369a1;
    padding: 16px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.6;
    border: 1px solid #bae6fd;
  }

  .time-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .time-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #475569;
    padding: 4px 8px;
    background: #f8fafc;
    border-radius: 4px;
  }

  .info-box {
    display: flex;
    gap: 10px;
    padding: 12px;
    background: #fff7ed;
    border: 1px solid #ffedd5;
    border-radius: 8px;
    color: #9a3412;
    font-size: 13px;
  }

  .info-box .el-icon {
    font-size: 16px;
    margin-top: 2px;
  }

  .animate-fade {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
  .mx-2 {
    margin: 0 0.5rem;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }
  .ml-2 {
    margin-left: 0.5rem;
  }
</style>
