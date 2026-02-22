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
        <h1 class="tool-title">纪念日倒计</h1>
        <span class="tool-subtitle">Anniversary Countdown</span>
      </div>
      <div class="header-right">
        <el-button type="primary" circle @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="anniversary-tool">
        <div v-if="events.length === 0" class="empty-state">
          <el-empty description="暂无纪念日，点击右上角添加" />
        </div>

        <div class="events-grid">
          <div
            v-for="event in events"
            :key="event.id"
            class="event-card"
            :style="{ background: event.color }"
          >
            <div class="card-content">
              <div class="event-header">
                <span class="event-title">{{ event.title }}</span>
                <div class="card-actions">
                  <el-button link class="action-btn" @click="deleteEvent(event.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="event-days">
                <span class="number">{{ getDays(event.date) }}</span>
                <span class="label">{{ getLabel(event.date) }}</span>
              </div>
              <div class="event-date">{{ formatDate(event.date) }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <el-dialog v-model="showAddDialog" title="添加纪念日" width="400px">
      <el-form :model="form" label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="例如：恋爱纪念日、发薪日" />
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="背景颜色">
          <div class="color-presets">
            <div
              v-for="color in colors"
              :key="color"
              class="color-dot"
              :style="{ background: color }"
              :class="{ active: form.color === color }"
              @click="form.color = color"
            ></div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addEvent">保存</el-button>
      </template>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 纪念日倒计</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { ArrowLeft, Plus, Delete } from '@element-plus/icons-vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import dayjs from 'dayjs';

  interface EventItem {
    id: string;
    title: string;
    date: string;
    color: string;
  }

  const showAddDialog = ref(false);
  const events = ref<EventItem[]>([]);

  const colors = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  ];

  const form = ref({
    title: '',
    date: '',
    color: colors[0]
  });

  const initEvents = () => {
    const saved = localStorage.getItem('lrm-anniversaries');
    if (saved) {
      try {
        events.value = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addEvent = () => {
    if (!form.value.title || !form.value.date) {
      ElMessage.warning('请填写完整信息');
      return;
    }

    events.value.push({
      id: Date.now().toString(),
      ...form.value
    });

    showAddDialog.value = false;
    form.value = { title: '', date: '', color: colors[0] };
    ElMessage.success('添加成功');
  };

  const deleteEvent = (id: string) => {
    ElMessageBox.confirm('确定删除该纪念日吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      events.value = events.value.filter(e => e.id !== id);
      ElMessage.success('已删除');
    });
  };

  const getDays = (dateStr: string) => {
    const target = dayjs(dateStr);
    const today = dayjs().startOf('day');
    return Math.abs(target.diff(today, 'day'));
  };

  const getLabel = (dateStr: string) => {
    const target = dayjs(dateStr);
    const today = dayjs().startOf('day');
    if (target.isAfter(today)) return '天后';
    if (target.isBefore(today)) return '天已过';
    return '今天';
  };

  const formatDate = (dateStr: string) => {
    return dayjs(dateStr).format('YYYY年MM月DD日');
  };

  watch(
    events,
    newVal => {
      localStorage.setItem('lrm-anniversaries', JSON.stringify(newVal));
    },
    { deep: true }
  );

  onMounted(() => {
    initEvents();
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
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
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
    padding: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .anniversary-tool {
    padding-top: 20px;
  }

  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .event-card {
    border-radius: 20px;
    padding: 24px;
    color: #fff;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s;
    position: relative;
    overflow: hidden;
    height: 180px;
  }

  .event-card:hover {
    transform: translateY(-5px);
  }

  .card-content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .event-title {
    font-size: 1.2rem;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
  }

  .action-btn {
    color: rgba(255, 255, 255, 0.6) !important;
    padding: 0;
    height: auto;
  }

  .action-btn:hover {
    color: #fff !important;
  }

  .event-days {
    text-align: center;
  }

  .event-days .number {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .event-days .label {
    font-size: 1rem;
    margin-left: 5px;
    opacity: 0.9;
  }

  .event-date {
    font-size: 0.9rem;
    text-align: center;
    opacity: 0.8;
    margin-top: 10px;
  }

  .color-presets {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .color-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .color-dot.active {
    border-color: #333;
    transform: scale(1.1);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
