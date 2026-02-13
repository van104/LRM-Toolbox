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
        <h1 class="tool-title">脊椎健康指南</h1>
        <span class="tool-subtitle">Spine Exercise Guide</span>
      </div>
      <div class="header-right">
        <el-button type="primary" link @click="reminderVisible = true">
          <el-icon><AlarmClock /></el-icon> 开启提醒
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Collection /></el-icon> 练习分类
            </h2>
            <div class="category-list">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="category-item"
                :class="{ active: activeCategory === cat.id }"
                @click="activeCategory = cat.id"
              >
                <div class="cat-icon">{{ cat.icon }}</div>
                <div class="cat-info">
                  <span class="cat-name">{{ cat.name }}</span>
                  <span class="cat-desc">{{ cat.desc }}</span>
                </div>
              </div>
            </div>

            <div class="health-tip mt-6">
              <p>
                <el-icon><InfoFilled /></el-icon>
                温馨提示：所有动作应平缓进行，如感到剧烈疼痛请立即停止并咨询医生。
              </p>
            </div>
          </div>
        </aside>

        <div class="tool-main">
          <div class="exercise-grid">
            <div
              v-for="ex in filteredExercises"
              :key="ex.name"
              class="exercise-card glass-card animate-slide-up"
            >
              <div class="ex-image">
                <div class="placeholder-img">
                  <el-icon><VideoPlay /></el-icon>
                  <span>演示内容</span>
                </div>
              </div>
              <div class="ex-body">
                <div class="ex-header">
                  <h3 class="ex-name">{{ ex.name }}</h3>
                  <el-tag size="small" type="info">{{ ex.duration }}</el-tag>
                </div>
                <p class="ex-description">{{ ex.description }}</p>
                <div class="ex-steps">
                  <div v-for="(step, i) in ex.steps" :key="i" class="step-item">
                    <span class="step-num">{{ i + 1 }}</span>
                    <span class="step-text">{{ step }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <el-dialog v-model="reminderVisible" title="开启久坐提醒" width="340px">
      <div class="reminder-config">
        <div class="config-row">
          <span>提醒间隔 (分钟)</span>
          <el-input-number v-model="reminderMinutes" :min="15" :max="120" :step="15" size="small" />
        </div>
        <p class="mt-4 text-xs text-secondary">
          开启后，系统将在后台运行并在到达间隔时间时弹出通知提示您该活动脊椎了。
        </p>
      </div>
      <template #footer>
        <el-button @click="reminderVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReminder">确认开启</el-button>
      </template>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - 脊椎健康指南</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    ArrowLeft,
    Collection,
    InfoFilled,
    AlarmClock,
    VideoPlay
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const reminderVisible = ref(false);
  const reminderMinutes = ref(45);
  const activeCategory = ref('neck');

  const categories = [
    { id: 'neck', name: '颈椎拉伸', desc: '缓解肩颈僵硬', icon: '🧘' },
    { id: 'thoracic', name: '胸椎释放', desc: '打开胸腔纠正驼背', icon: '🦋' },
    { id: 'lumbar', name: '腰椎保护', desc: '缓解下腰部酸痛', icon: '🌳' }
  ];

  const exercises = [
    {
      category: 'neck',
      name: '左右侧拉伸',
      duration: '30秒',
      description: '伸展颈部侧边肌群，缓解斜方肌紧张。',
      steps: [
        '挺胸收腹坐正，右手自然垂下',
        '左手轻扶头部右侧，缓慢向左侧牵拉',
        '保持15秒，换另一侧'
      ]
    },
    {
      category: 'neck',
      name: '颈部旋转',
      duration: '1分钟',
      description: '增加颈部关节活动度。',
      steps: ['保持头部平正直视前方', '缓慢将下巴向左肩转动至极限', '停留3秒回正，再向右侧转动']
    },
    {
      category: 'thoracic',
      name: '扩胸伸展',
      duration: '45秒',
      description: '针对长期伏案导致的圆肩驼背。',
      steps: ['两手向后交叉相扣', '挺胸抬头，双臂用力向后上方抬起', '感受胸部和肩膀前侧的拉伸']
    },
    {
      category: 'thoracic',
      name: '坐姿转体',
      duration: '1分钟',
      description: '通过扭转增加胸椎灵活性。',
      steps: [
        '坐在椅子前三分之一处，左手扶右膝',
        '右手向后扶住椅背，带动上身向右后方扭转',
        '深呼吸保持15秒，换侧进行'
      ]
    },
    {
      category: 'lumbar',
      name: '猫式伸展(坐姿)',
      duration: '1分钟',
      description: '温和地活动整个嵴柱，特别是下腰部。',
      steps: [
        '吸气时挺胸收腹，微微抬头看向斜上方',
        '呼气时低头含胸卷腹，背部向后弯曲如拱形',
        '跟随呼吸节奏重复5-8次'
      ]
    },
    {
      category: 'lumbar',
      name: '坐姿侧弯',
      duration: '45秒',
      description: '拉伸腰部两侧的腰方肌。',
      steps: [
        '举起左手伸直向上，右手扶住椅子侧面',
        '上身向右侧平缓倾斜，保持左臀贴合椅面',
        '侧腰有明显拉伸感后停留15秒'
      ]
    }
  ];

  const filteredExercises = computed(() =>
    exercises.filter(ex => ex.category === activeCategory.value)
  );

  const confirmReminder = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          ElMessage.success(`提醒已开启！每 ${reminderMinutes.value} 分钟会提醒您活动。`);
          reminderVisible.value = false;
        } else {
          ElMessage.warning('未获得通知权限，无法开启提醒。');
        }
      });
    } else {
      ElMessage.error('您的浏览器不支持通知功能。');
    }
  };
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
  }

  .panel {
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

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .category-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid transparent;
  }

  .category-item:hover {
    background: #f1f5f9;
  }
  .category-item.active {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  .cat-icon {
    font-size: 1.5rem;
  }
  .cat-info {
    display: flex;
    flex-direction: column;
  }
  .cat-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
  }
  .cat-desc {
    font-size: 0.75rem;
    color: #64748b;
  }

  .health-tip {
    padding: 12px;
    background: #fffbeb;
    border-radius: 8px;
    font-size: 0.8rem;
    color: #92400e;
  }

  .exercise-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    .exercise-grid {
      grid-template-columns: 1fr;
    }
  }

  .exercise-card {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .ex-image {
    height: 200px;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-img {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
  }

  .placeholder-img .el-icon {
    font-size: 3rem;
  }

  .ex-body {
    padding: 20px;
  }
  .ex-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .ex-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  .ex-description {
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .ex-steps {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .step-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .step-num {
    width: 18px;
    height: 18px;
    background: #3b82f6;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .step-text {
    font-size: 0.85rem;
    color: #334155;
  }

  .reminder-config {
    padding: 10px 0;
  }
  .config-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .animate-slide-up {
    animation: slideUp 0.6s ease;
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }
  .text-secondary {
    color: #64748b;
  }
  .text-xs {
    font-size: 0.75rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
