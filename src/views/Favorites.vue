<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="icon-star">
            <StarFilled />
          </el-icon>
          我的收藏
        </h1>
        <p class="page-subtitle">您收藏的常用工具 ({{ favoriteTools.length }})</p>
      </div>
      <div class="header-actions">
        <el-button v-if="favoriteTools.length > 0" @click="confirmClear">
          <el-icon>
            <Delete />
          </el-icon>
          清空收藏
        </el-button>
        <el-button text @click="$router.push('/')">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回首页
        </el-button>
      </div>
    </div>

    <main class="page-main">
      <section v-if="favoriteTools.length > 0">
        <draggable
          v-model="draggableFavorites"
          item-key="id"
          class="tools-grid animate-stagger"
          ghost-class="ghost-card"
          drag-class="drag-card"
          handle=".drag-handle"
          :animation="200"
          @start="isDragging = true"
          @end="isDragging = false"
        >
          <template #item="{ element }">
            <div class="tool-wrapper">
              <div class="drag-handle" title="按住拖动排序">
                <el-icon>
                  <Rank />
                </el-icon>
              </div>
              <ToolCard
                :tool="element"
                :is-favorite="true"
                class="favorite-tool-card"
                @click="handleToolClick(element)"
                @view-detail="openToolModal"
                @toggle-favorite="handleToggleFavorite"
              />
            </div>
          </template>
        </draggable>
      </section>

      <div v-else class="empty-state">
        <el-icon :size="64">
          <Star />
        </el-icon>
        <h2>暂无收藏</h2>
        <p>您还没有收藏任何工具，快去首页看看吧！</p>
        <el-button type="primary" size="large" @click="$router.push('/')"> 浏览工具 </el-button>
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
  import ToolModal from '@/components/tools/ToolModal.vue';
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
      router.push(tool.route);
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
    ElMessageBox.confirm('确定要清空所有收藏吗？此操作无法撤销。', '清空收藏', {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        userStore.clearFavorites();
        ElMessage.success('收藏夹已清空');
      })
      .catch(() => {});
  }
</script>

<style scoped>
  .page-container {
    min-height: 100vh;
    background: #f0f4f8;
    padding-bottom: 2rem;
  }

  .page-header {
    background: #ffffff;
    padding: 2rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    position: relative;
    height: 100px;
  }

  .header-content {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    pointer-events: none;
  }

  .header-content > * {
    pointer-events: auto;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    position: relative;
    z-index: 10;
  }

  .page-title {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 0.75rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .icon-star {
    color: #fbbf24;
  }

  .page-subtitle {
    color: #64748b;
    font-size: 1rem;
  }

  .page-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1.5rem;
    text-align: center;
    color: #94a3b8;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 1.5rem 0 0.5rem;
  }

  .empty-state p {
    margin-bottom: 2rem;
    color: #64748b;
  }

  [data-theme='dark'] .page-container {
    background: var(--bg-primary);
  }

  [data-theme='dark'] .page-header {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .page-title,
  [data-theme='dark'] .empty-state h2 {
    color: var(--text-primary);
  }

  [data-theme='dark'] .page-subtitle,
  [data-theme='dark'] .empty-state p {
    color: var(--text-secondary);
  }

  [data-theme='dark'] .el-button:not(.is-text) {
    background: var(--bg-secondary);
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  [data-theme='dark'] .el-button:not(.is-text):hover {
    background: var(--bg-primary);
    border-color: var(--accent-purple);
    color: var(--accent-purple);
  }

  .tool-wrapper {
    position: relative;
    height: 100%;
  }

  .drag-handle {
    position: absolute;
    top: 0.75rem;
    right: 4.75rem;
    z-index: 10;
    cursor: grab;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-secondary);
    opacity: 0;
    transition: all 0.2s;
    backdrop-filter: blur(4px);
  }

  .tool-wrapper:hover .drag-handle {
    opacity: 1;
  }

  .drag-handle:hover {
    background: var(--bg-primary);
    color: var(--accent-purple);
    border-color: var(--accent-purple);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .favorite-tool-card :deep(.card-title) {
    padding-right: 6.75rem;
  }

  .ghost-card {
    opacity: 0.5;
    background: #f1f5f9;
    border: 2px dashed #cbd5e1;
  }

  .drag-card {
    opacity: 1;
    transform: scale(1.02);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
</style>
