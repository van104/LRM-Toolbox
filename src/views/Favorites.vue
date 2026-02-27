<template>
  <div class="brutal-page-container">
    <div class="brutal-page-header">
      <div class="header-content">
        <h1 class="brutal-page-title">
          <el-icon class="icon-star"><StarFilled /></el-icon>
          我的收藏.FAV()
        </h1>
        <p class="brutal-page-subtitle">已收录高优先级工具模块 [{{ favoriteTools.length }}]</p>
      </div>
      <div class="header-actions">
        <button v-if="favoriteTools.length > 0" class="brutal-btn-danger" @click="confirmClear">
          <el-icon><Delete /></el-icon> 清空收藏
        </button>
        <button class="brutal-btn-secondary" @click="$router.push('/')">
          <el-icon><ArrowLeft /></el-icon> 返回首页
        </button>
      </div>
    </div>

    <main class="page-main">
      <section v-if="favoriteTools.length > 0">
        <draggable
          v-model="draggableFavorites"
          item-key="id"
          class="brutal-tools-grid animate-stagger"
          ghost-class="ghost-card"
          drag-class="brutal-drag-card"
          handle=".brutal-drag-handle"
          :animation="200"
          @start="isDragging = true"
          @end="isDragging = false"
        >
          <template #item="{ element }">
            <div class="tool-wrapper">
              <div class="brutal-drag-handle" title="按住拖动排序">
                <el-icon><Rank /></el-icon>
              </div>
              <ToolCard
                :tool="element"
                :is-favorite="true"
                @click="handleToolClick(element)"
                @view-detail="openToolModal"
                @toggle-favorite="handleToggleFavorite"
              />
            </div>
          </template>
        </draggable>
      </section>

      <div v-else class="brutal-empty-state">
        <div class="empty-icon-box bg-yellow">
          <el-icon :size="48"><Star /></el-icon>
        </div>
        <h2 class="empty-text">这里空空如也</h2>
        <p class="empty-sub">尚未部署任何关注模块，请返回主节点进行挑选</p>
        <button class="brutal-btn-primary" @click="$router.push('/')">&lt; 浏览工具目录</button>
      </div>
    </main>

    <ToolModal :visible="modalVisible" :tool="selectedTool" @close="modalVisible = false" />
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { Star, StarFilled, ArrowLeft, Rank, Delete } from '@element-plus/icons-vue';
  import ToolCard from '@/components/tools/ToolCard.vue';
  import ToolModal from '@/components/layout/modal/ToolModal.vue';
  import { tools } from '@/data/tools';
  import { useUserStore } from '@/stores/user';
  import draggable from 'vuedraggable';

  const router = useRouter();
  const userStore = useUserStore();

  const modalVisible = ref(false);
  const selectedTool = ref({});
  const isDragging = ref(false);

  const favoriteTools = computed(() => {
    return userStore.favorites.map(id => tools.find(t => t.id === id)).filter(t => !!t);
  });

  const draggableFavorites = computed({
    get: () => favoriteTools.value,
    set: newVal => {
      userStore.reorderFavorites(newVal.map(t => t.id));
    }
  });

  function handleToolClick(tool) {
    if (isDragging.value) return;

    if (tool.route) {
      userStore.addToHistory(tool);
      if (tool.isLocal === false || tool.route.startsWith('http')) {
        window.open(tool.route, '_blank');
      } else {
        router.push(tool.route);
      }
    } else {
      openToolModal(tool);
    }
  }

  function openToolModal(tool) {
    selectedTool.value = tool;
    modalVisible.value = true;
  }

  function handleToggleFavorite(toolId) {
    userStore.toggleFavorite(toolId);
  }

  function confirmClear() {
    ElMessageBox.confirm('这将会擦除所有收藏配置，是否继续？', '指令确认：擦除', {
      confirmButtonText: '确认执行',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        userStore.clearFavorites();
        ElMessage.success('操作完成：收藏清单已清空');
      })
      .catch(() => {});
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-page-container {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    padding-bottom: 4rem;
    color: #111;
  }

  .brutal-page-header {
    background: #fff;
    padding: 2.5rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 4px solid #111;
    box-shadow: 0px 8px 0px #111;
    margin-bottom: 3rem;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .brutal-page-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 2.5rem;
    font-weight: 900;
    color: #111;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -1px;
    text-shadow: 4px 4px 0px #ffd900;
  }

  .icon-star {
    color: #ff4b4b;
    filter: drop-shadow(3px 3px 0px #111);
  }

  .brutal-page-subtitle {
    font-size: 1.15rem;
    font-weight: 600;
    margin: 0;
    padding: 0.25rem 0.75rem;
    background: #111;
    color: #fff;
    display: table;
  }

  .header-actions {
    display: flex;
    gap: 1.5rem;
  }

  .brutal-btn-secondary,
  .brutal-btn-danger,
  .brutal-btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.15rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 5px 5px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
    background: #4b7bff;
    color: #fff;
  }
  .brutal-btn-secondary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn-danger {
    background: #ff4b4b;
    color: #fff;
  }
  .brutal-btn-danger:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
    background: #e03131;
  }
  .brutal-btn-danger:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn-primary {
    background: #00e572;
    color: #111;
    margin-top: 1.5rem;
  }
  .brutal-btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 7px 7px 0px #111;
    background: #00c964;
  }
  .brutal-btn-primary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .page-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .brutal-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2.5rem;
  }

  .tool-wrapper {
    position: relative;
    height: 100%;
  }

  .brutal-drag-handle {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 10;
    cursor: grab;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffd900;
    border: 3px solid #111;
    color: #111;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .brutal-drag-handle:active {
    cursor: grabbing;
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 #111;
  }

  .ghost-card {
    opacity: 0.3;
    border: 4px dashed #111;
    background: #e5e5e5;
  }

  .brutal-drag-card {
    opacity: 1;
    transform: rotate(2deg) scale(1.02);
    box-shadow: 16px 16px 0px #111 !important;
    z-index: 999;
  }

  .brutal-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6rem 2rem;
    text-align: center;
  }

  .empty-icon-box {
    width: 100px;
    height: 100px;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    transform: rotate(-5deg);
    margin-bottom: 2rem;
  }

  .bg-yellow {
    background: #ffd900;
  }

  .empty-text {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #111;
    margin-bottom: 1rem;
    background: #fff;
    padding: 0.5rem 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  .empty-sub {
    font-size: 1.15rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: #444;
    background: #fdfae5;
    padding: 4px 12px;
    border: 2px dashed #111;
  }

  @media (max-width: 768px) {
    .brutal-page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .brutal-page-title {
      font-size: 2rem;
    }
    .header-actions {
      width: 100%;
      flex-wrap: wrap;
    }
    .brutal-tools-grid {
      grid-template-columns: 1fr;
    }
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-page-container {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-page-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-page-title {
    color: #eee;
    text-shadow: 4px 4px 0px #b28f00;
  }
  [data-theme='dark'] .icon-star {
    filter: drop-shadow(3px 3px 0px #eee);
  }
  [data-theme='dark'] .brutal-page-subtitle {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-btn-primary,
  [data-theme='dark'] .brutal-btn-secondary,
  [data-theme='dark'] .brutal-btn-danger {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-primary:hover,
  [data-theme='dark'] .brutal-btn-secondary:hover,
  [data-theme='dark'] .brutal-btn-danger:hover {
    box-shadow: 7px 7px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-primary:active,
  [data-theme='dark'] .brutal-btn-secondary:active,
  [data-theme='dark'] .brutal-btn-danger:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-btn-secondary {
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn-danger {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn-primary {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-drag-handle {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-drag-handle:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .ghost-card {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-drag-card {
    box-shadow: 16px 16px 0px #eee !important;
  }

  [data-theme='dark'] .empty-icon-box {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
  }
  [data-theme='dark'] .empty-text {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .empty-sub {
    background: #1a1a1a;
    color: #aaa;
    border-color: #eee;
  }
</style>
