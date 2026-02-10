<template>
  <div class="crontab-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>Crontab 表达式工具</h1>
        <span class="nav-subtitle">Crontab Generator & Parser</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="layout-container">
        <aside class="preview-sidebar">
          <div class="glass-card result-card">
            <h3 class="section-title">当前表达式</h3>
            <div class="cron-display">
              <code>{{ cronExpression }}</code>
              <el-button :icon="CopyDocument" circle @click="copyToClipboard" />
            </div>

            <div class="description-box mt-6">
              <h4 class="sub-title">语义化解读</h4>
              <p class="human-desc">{{ humanDescription }}</p>
            </div>

            <div class="execution-list mt-6">
              <h4 class="sub-title">未来 5 次运行时间 (模拟)</h4>
              <ul>
                <li v-for="(time, idx) in nextTimes" :key="idx">
                  <el-icon>
                    <Timer />
                  </el-icon>
                  {{ time }}
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <section class="config-main">
          <div class="glass-card">
            <el-tabs v-model="activeTab">
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
                <CronInput v-model="week" unit="周" :max="6" :min="0" :labels="weekLabels" />
              </el-tab-pane>
            </el-tabs>
          </div>

          <div class="glass-card mt-6">
            <h3 class="section-title">常用场景模版</h3>
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

    <footer class="footer">© 2026 LRM工具箱 - Crontab 表达式工具</footer>
  </div>
</template>

<script setup>
  import { ref, computed, watch, defineComponent, h } from 'vue';
  import { Back, CopyDocument, Timer } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import useClipboard from 'vue-clipboard3';

  const { toClipboard } = useClipboard();

  const CronInput = defineComponent({
    props: {
      modelValue: {
        type: String,
        required: true
      },
      unit: {
        type: String,
        required: true
      },
      max: {
        type: Number,
        required: true
      },
      min: {
        type: Number,
        default: 0
      },
      labels: {
        type: Array,
        default: () => []
      }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      const type = ref('all');
      const range = ref([props.min || 0, props.max]);
      const step = ref({ start: props.min || 0, interval: 5 });
      const list = ref([]);

      const updateValue = () => {
        let val = '*';
        if (type.value === 'range') val = `${range.value[0]}-${range.value[1]}`;
        else if (type.value === 'step') val = `${step.value.start}/${step.value.interval}`;
        else if (type.value === 'list')
          val = list.value.length ? list.value.sort((a, b) => a - b).join(',') : '*';
        emit('update:modelValue', val);
      };

      watch([type, range, step, list], updateValue, { deep: true });

      return () =>
        h('div', { class: 'cron-input-inner' }, [
          h(
            'el-radio-group',
            {
              modelValue: type.value,
              'onUpdate:modelValue': v => (type.value = v),
              class: 'mb-6 d-block'
            },
            [
              h('el-radio', { label: 'all' }, '每' + props.unit + ' (*)'),
              h('el-radio', { label: 'range' }, '周期范围内'),
              h('el-radio', { label: 'step' }, '步长间隔'),
              h('el-radio', { label: 'list' }, '指定列表')
            ]
          ),

          type.value === 'range'
            ? h('div', { class: 'config-row' }, [
                h('el-input-number', {
                  modelValue: range.value[0],
                  'onUpdate:modelValue': v => (range.value[0] = v),
                  min: props.min || 0,
                  max: props.max,
                  size: 'small'
                }),
                h('span', { class: 'mx-2' }, '至'),
                h('el-input-number', {
                  modelValue: range.value[1],
                  'onUpdate:modelValue': v => (range.value[1] = v),
                  min: props.min || 0,
                  max: props.max,
                  size: 'small'
                }),
                h('span', { class: 'ml-2' }, props.unit)
              ])
            : null,

          type.value === 'step'
            ? h('div', { class: 'config-row' }, [
                h('span', '从'),
                h('el-input-number', {
                  modelValue: step.value.start,
                  'onUpdate:modelValue': v => (step.value.start = v),
                  min: props.min || 0,
                  max: props.max,
                  size: 'small',
                  class: 'mx-2'
                }),
                h('span', '开始，每'),
                h('el-input-number', {
                  modelValue: step.value.interval,
                  'onUpdate:modelValue': v => (step.value.interval = v),
                  min: 1,
                  max: props.max,
                  size: 'small',
                  class: 'mx-2'
                }),
                h('span', props.unit + '执行一次')
              ])
            : null,

          type.value === 'list'
            ? h(
                'el-checkbox-group',
                {
                  modelValue: list.value,
                  'onUpdate:modelValue': v => (list.value = v),
                  class: 'list-grid'
                },
                Array.from({ length: props.max - (props.min || 0) + 1 }, (_, i) => {
                  const val = i + (props.min || 0);
                  return h(
                    'el-checkbox',
                    { label: val, border: true, size: 'small' },
                    props.labels ? props.labels[val] : val
                  );
                })
              )
            : null
        ]);
    }
  });

  const second = ref('*');
  const minute = ref('*');
  const hour = ref('*');
  const day = ref('*');
  const month = ref('*');
  const week = ref('?');

  const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const cronExpression = computed(() => {
    return `${minute.value} ${hour.value} ${day.value} ${month.value} ${week.value}`;
  });

  const humanDescription = computed(() => {
    let desc = '在 ';
    if (month.value === '*') desc += '每月的 ';
    else desc += `每年的 ${month.value} 月 `;

    if (day.value === '*') desc += '每天的 ';
    else desc += `${day.value} 号 `;

    if (week.value !== '?' && week.value !== '*') {
      const ws = week.value
        .split(',')
        .map(v => weekLabels[v])
        .join('、');
      desc += `(限${ws}) `;
    }

    if (hour.value === '*') desc += '每小时的 ';
    else desc += `${hour.value} 点 `;

    if (minute.value === '*') desc += '每分钟执行一次';
    else desc += `${minute.value} 分执行一次`;

    return desc;
  });

  const nextTimes = computed(() => {
    const now = new Date();
    const list = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(now.getTime() + i * 3600000);
      list.push(d.toLocaleString());
    }
    return list;
  });

  const templates = [
    { name: '每分钟', value: '* * * * *' },
    { name: '每小时整', value: '0 * * * *' },
    { name: '每天凌晨', value: '0 0 * * *' },
    { name: '每周一凌晨', value: '0 0 * * 1' },
    { name: '每月1号凌晨', value: '0 0 1 * *' },
    { name: '每5分钟一次', value: '*/5 * * * *' },
    { name: '工作日早9点', value: '0 9 * * 1-5' }
  ];

  const applyTemplate = val => {
    const [m, h, d, mon, w] = val.split(' ');
    minute.value = m;
    hour.value = h;
    day.value = d;
    month.value = mon;
    week.value = w;
  };

  const copyToClipboard = async () => {
    try {
      await toClipboard(cronExpression.value);
      ElMessage.success('已复制到剪贴板');
    } catch {
      ElMessage.error('复制失败');
    }
  };
</script>

<style scoped>
  .crontab-tool {
    --primary: #6366f1;
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;

    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
  }

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.25rem;
    margin: 0;
    font-weight: 700;
    color: #0f172a;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .layout-container {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  }

  .preview-sidebar {
    position: sticky;
    top: 100px;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    color: #334155;
  }

  .cron-display {
    background: #1e293b;
    color: #38bdf8;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Fira Code', monospace;
    font-size: 1.2rem;
    font-weight: 700;
  }

  .sub-title {
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.75rem;
  }

  .human-desc {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid var(--primary);
    font-size: 0.95rem;
    color: #334155;
    line-height: 1.6;
  }

  .execution-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .execution-list li {
    font-size: 0.85rem;
    color: #64748b;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .template-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .template-btn {
    margin: 0 !important;
  }

  :deep(.cron-input-inner) {
    padding: 1rem 0;
  }

  :deep(.config-row) {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  :deep(.list-grid) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
  }

  :deep(.list-grid .el-checkbox) {
    margin: 0 !important;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }

  .mx-2 {
    margin: 0 0.5rem;
  }

  .ml-2 {
    margin-left: 0.5rem;
  }

  .mb-6 {
    margin-bottom: 1.5rem;
  }

  .d-block {
    display: block;
  }

  .footer {
    text-align: center;
    padding: 3rem 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 4rem;
    background: #fff;
  }

  @media (max-width: 900px) {
    .layout-container {
      grid-template-columns: 1fr;
    }

    .preview-sidebar {
      position: static;
    }
  }
</style>
