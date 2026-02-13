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
        <h1 class="tool-title">剧本杀助手</h1>
        <span class="tool-subtitle">Script Killer DM Helper</span>
      </div>
      <div class="header-right">
        <el-button v-if="assigned" type="primary" link @click="exportResult"> 导出结果 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><User /></el-icon> 玩家与角色
            </h2>

            <div class="config-item">
              <label class="section-label">参与玩家 (每行一个)</label>
              <el-input
                v-model="playersText"
                type="textarea"
                :rows="6"
                placeholder="例如：\n张三\n李四\n王五"
                @input="assigned = false"
              />
            </div>

            <div class="config-item">
              <label class="section-label">角色池 (每行一个)</label>
              <el-input
                v-model="rolesText"
                type="textarea"
                :rows="6"
                placeholder="例如：\n侦探\n凶手\n管家"
                @input="assigned = false"
              />
            </div>

            <div v-if="players.length || roles.length" class="stats mb-4">
              <el-tag :type="players.length === roles.length ? 'success' : 'warning'" size="small">
                玩家: {{ players.length }} | 角色: {{ roles.length }}
              </el-tag>
            </div>

            <el-button
              type="primary"
              class="w-full"
              :disabled="players.length === 0 || players.length !== roles.length"
              @click="handleAssign"
            >
              一键分配角色
            </el-button>
          </div>
        </aside>

        <div class="tool-main">
          <div v-if="!assigned" class="empty-state glass-card">
            <el-empty description="请在左侧输入玩家和角色信息，并确保数量一致" />
          </div>

          <div v-else class="assign-result glass-card animate-fade-in">
            <div class="result-header">
              <h2 class="viz-title">分配方案</h2>
              <el-button size="small" @click="shuffleAssign"> 重新打乱 </el-button>
            </div>

            <div class="result-grid">
              <div v-for="item in assignments" :key="item.player" class="assign-card shadow-sm">
                <div class="card-header">
                  <el-icon><Avatar /></el-icon>
                  <span class="player-name">{{ item.player }}</span>
                </div>
                <div class="card-body">
                  <div class="hidden-role" @click="item.visible = !item.visible">
                    <transition name="fade-role">
                      <span v-if="item.visible" class="role-name">{{ item.role }}</span>
                      <span v-else class="mask">点击查看身份</span>
                    </transition>
                  </div>
                </div>
              </div>
            </div>

            <div class="dm-notice mt-6">
              <p>
                <el-icon><MagicStick /></el-icon>
                提示：分配完成后，可依次请玩家点击卡片确认自己的身份。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 剧本杀助手</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, User, Avatar, MagicStick } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const playersText = ref('');
  const rolesText = ref('');
  const assigned = ref(false);
  const assignments = ref<{ player: string; role: string; visible: boolean }[]>([]);

  const players = computed(() =>
    playersText.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '')
  );
  const roles = computed(() =>
    rolesText.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '')
  );

  const handleAssign = () => {
    if (players.value.length === 0) return;
    if (players.value.length !== roles.value.length) {
      ElMessage.error('玩家人数与角色数量不匹配！');
      return;
    }
    shuffleAssign();
  };

  const shuffleAssign = () => {
    const shuffledRoles = [...roles.value].sort(() => Math.random() - 0.5);
    assignments.value = players.value.map((player, index) => ({
      player,
      role: shuffledRoles[index],
      visible: false
    }));
    assigned.value = true;
  };

  const exportResult = () => {
    let text = '剧本杀角色分配结果：\n\n';
    assignments.value.forEach(item => {
      text += `${item.player} -> ${item.role}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assignments-${Date.now()}.txt`;
    link.click();
    ElMessage.success('导出成功');
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

  .w-full {
    width: 100%;
  }

  .result-header {
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

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .assign-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }

  .card-header {
    background: #f8fafc;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e2e8f0;
    color: #64748b;
  }

  .player-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.95rem;
  }

  .card-body {
    padding: 24px 16px;
    text-align: center;
  }

  .hidden-role {
    background: #f1f5f9;
    border-radius: 8px;
    padding: 16px 8px;
    cursor: pointer;
    min-height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
  }

  .hidden-role:hover {
    background: #e2e8f0;
  }

  .mask {
    font-size: 0.8rem;
    color: #94a3b8;
    font-style: italic;
  }
  .role-name {
    font-weight: 700;
    color: #3b82f6;
    font-size: 1.1rem;
  }

  .fade-role-enter-active,
  .fade-role-leave-active {
    transition: opacity 0.3s;
  }
  .fade-role-enter-from,
  .fade-role-leave-to {
    opacity: 0;
  }

  .dm-notice {
    padding: 12px;
    background: #f0fdf4;
    border-radius: 8px;
    color: #166534;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
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
</style>
