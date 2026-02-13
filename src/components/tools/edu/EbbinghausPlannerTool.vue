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
        <h1 class="tool-title">艾宾浩斯复习计划</h1>
        <span class="tool-subtitle">Ebbinghaus Retention Planner</span>
      </div>
      <div class="header-right">
        <el-button type="primary" link @click="exportPlan"> 导出计划 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 配置 -->
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Calendar /></el-icon> 新建学习任务
            </h2>

            <div class="config-item">
              <label class="section-label">学习主题</label>
              <el-input v-model="newTask.title" placeholder="例如: 英语单词 List 1" />
            </div>

            <div class="config-item">
              <label class="section-label">起始日期</label>
              <el-date-picker
                v-model="newTask.date"
                type="date"
                placeholder="选择日期"
                class="w-full"
              />
            </div>

            <div class="config-item">
              <label class="section-label">复习阶段 (天)</label>
              <div class="tag-group">
                <el-tag v-for="d in intervals" :key="d" size="small">{{ d }}d</el-tag>
              </div>
            </div>

            <el-button type="primary" class="w-full mt-4" @click="addTask"> 生成计划 </el-button>
          </div>

          <div class="tips-card mt-6">
            <h3>💡 科学复习法</h3>
            <p>
              艾宾浩斯遗忘曲线告诉我们，有规律的复习能将瞬时记忆转化为长期记忆。本系统自动为您规划
              1、2、4、7、15、30 天后的复习节点。
            </p>
          </div>
        </aside>

        <!-- 计划表 -->
        <div class="tool-main">
          <div v-if="plannerData.length === 0" class="empty-state">
            <el-empty description="暂无计划，请在左侧添加您的学习任务" />
          </div>

          <div v-else class="planner-view">
            <div class="view-header">
              <h2 class="viz-title">复习时间表</h2>
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button label="list">列表</el-radio-button>
                <el-radio-button label="timeline">时间轴</el-radio-button>
              </el-radio-group>
            </div>

            <div v-if="viewMode === 'list'" class="list-container">
              <div v-for="group in groupedData" :key="group.date" class="date-group">
                <h3 class="group-date">
                  <el-icon><Timer /></el-icon> {{ group.date }}
                  <small>{{ group.label }}</small>
                </h3>
                <div class="task-items">
                  <div v-for="item in group.items" :key="item.id" class="task-card">
                    <div class="task-info">
                      <span class="task-title">{{ item.title }}</span>
                      <el-tag size="small" :type="item.isReview ? 'warning' : 'success'">
                        {{ item.isReview ? '复习: 第 ' + item.stage + ' 阶段' : '初次学习' }}
                      </el-tag>
                    </div>
                    <el-checkbox v-model="item.done" @change="saveData" />
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="timeline-container">
              <el-timeline>
                <el-timeline-item
                  v-for="group in groupedData"
                  :key="group.date"
                  :timestamp="group.date"
                  placement="top"
                >
                  <el-card class="timeline-card">
                    <div v-for="item in group.items" :key="item.id" class="timeline-task-item">
                      <span class="dot" :class="item.isReview ? 'orange' : 'green'"></span>
                      <span>{{ item.title }}</span>
                      <small>{{
                        item.isReview ? '第 ' + item.stage + ' 次复习' : '初次学习'
                      }}</small>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 艾宾浩斯复习计划</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from 'vue';
  import { ArrowLeft, Calendar, Timer } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import dayjs from 'dayjs';

  interface TaskInstance {
    id: string;
    title: string;
    date: string;
    stage: number;
    isReview: boolean;
    done: boolean;
  }

  const newTask = reactive({
    title: '',
    date: new Date()
  });

  const intervals = [1, 2, 4, 7, 15, 30];
  const plannerData = ref<TaskInstance[]>([]);
  const viewMode = ref('list');

  const addTask = () => {
    if (!newTask.title.trim()) {
      ElMessage.warning('请输入学习主题');
      return;
    }

    const baseDate = dayjs(newTask.date);
    const tasks: TaskInstance[] = [];

    // 初次学习
    tasks.push({
      id: `task-${Date.now()}-0`,
      title: newTask.title,
      date: baseDate.format('YYYY-MM-DD'),
      stage: 0,
      isReview: false,
      done: false
    });

    // 生成复习任务
    intervals.forEach((days, index) => {
      tasks.push({
        id: `task-${Date.now()}-${index + 1}`,
        title: newTask.title,
        date: baseDate.add(days, 'day').format('YYYY-MM-DD'),
        stage: index + 1,
        isReview: true,
        done: false
      });
    });

    plannerData.value = [...plannerData.value, ...tasks];
    saveData();
    newTask.title = '';
    ElMessage.success('计划已生成');
  };

  const groupedData = computed(() => {
    const groups: Record<string, TaskInstance[]> = {};
    plannerData.value.forEach(task => {
      if (!groups[task.date]) groups[task.date] = [];
      groups[task.date].push(task);
    });

    return Object.keys(groups)
      .sort()
      .map(date => {
        const diff = dayjs(date).diff(dayjs().startOf('day'), 'day');
        let label = '';
        if (diff === 0) label = '今天';
        else if (diff === 1) label = '明天';
        else if (diff === -1) label = '昨天';
        else if (diff > 0) label = `${diff} 天后`;
        else label = `${Math.abs(diff)} 天前`;

        return {
          date,
          label,
          items: groups[date]
        };
      });
  });

  const saveData = () => {
    localStorage.setItem('lrm_ebbinghaus_plan', JSON.stringify(plannerData.value));
  };

  const exportPlan = () => {
    const data = JSON.stringify(plannerData.value, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ebbinghaus-plan-${dayjs().format('YYYYMMDD')}.json`;
    link.click();
  };

  onMounted(() => {
    const saved = localStorage.getItem('lrm_ebbinghaus_plan');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          plannerData.value = parsed.map((item: TaskInstance) => ({
            ...item,
            done: !!item.done
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .header-left,
  .header-right {
    width: 140px;
  }
  .header-center {
    text-align: center;
    flex: 1;
  }
  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-item {
    margin-bottom: 20px;
  }
  .section-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .w-full {
    width: 100%;
  }

  .tips-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e2e8f0;
  }

  .tips-card h3 {
    font-size: 0.9rem;
    margin-bottom: 8px;
    color: #1e293b;
  }
  .tips-card p {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.6;
  }

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .viz-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .date-group {
    margin-bottom: 30px;
  }
  .group-date {
    font-size: 1rem;
    color: #1e293b;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .group-date small {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-left: 8px;
    font-weight: normal;
  }

  .task-items {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .task-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .task-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .task-title {
    font-weight: 600;
    font-size: 0.95rem;
    color: #334155;
  }

  .timeline-card {
    border-radius: 12px !important;
  }

  .timeline-task-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .timeline-task-item:last-child {
    border-bottom: none;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .dot.green {
    background: #10b981;
  }
  .dot.orange {
    background: #f59e0b;
  }

  .timeline-task-item span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
  }
  .timeline-task-item small {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-left: auto;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
