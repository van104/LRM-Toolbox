<template>
  <div class="tool-card-wrapper">
    <TiltedCard
      :rotate-amplitude="12"
      :scale-on-hover="1.02"
      :show-tooltip="false"
      container-height="100%"
      container-width="100%"
      class="tool-card-tilt"
    >
      <div class="tool-card" @click="handleCardClick">
        <div class="card-actions">
          <button
            class="action-btn detail-btn"
            title="查看详情"
            @click.stop="$emit('view-detail', tool)"
          >
            <el-icon :size="16">
              <InfoFilled />
            </el-icon>
          </button>

          <button
            class="action-btn favorite-btn"
            :class="{ active: isFavorite }"
            :title="isFavorite ? '取消收藏' : '添加收藏'"
            @click.stop="$emit('toggle-favorite', tool.id)"
          >
            <el-icon :size="16">
              <StarFilled v-if="isFavorite" />
              <Star v-else />
            </el-icon>
          </button>
        </div>

        <div class="card-content">
          <div class="card-icon">
            <img v-if="tool.customIcon" :src="tool.customIcon" class="custom-icon" alt="icon" />
            <el-icon v-else :size="28">
              <component :is="tool.icon" />
            </el-icon>
          </div>

          <div class="card-info">
            <h3 class="card-title">{{ tool.name }}</h3>
            <p class="card-summary">{{ tool.summary }}</p>
          </div>
        </div>

        <div class="card-tags-row">
          <span v-if="category" class="tag category-tag">
            <el-icon class="opt-icon">
              <component :is="category.icon" />
            </el-icon>
            {{ category.name }}
          </span>

          <span v-if="tool.isAi" class="ai-tag">AI</span>
          <span v-for="tag in tool.tags.slice(0, 3)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <div class="card-arrow">
          <el-icon :size="18">
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </TiltedCard>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { ArrowRight, Star, StarFilled, InfoFilled } from '@element-plus/icons-vue';
  import TiltedCard from '@/components/common/TiltedCard.vue';
  import { categories } from '@/data/tools';

  const props = defineProps({
    tool: {
      type: Object,
      required: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits(['click', 'toggle-favorite', 'view-detail']);

  const category = computed(() => {
    return categories.find(c => c.id === props.tool.category);
  });

  function handleCardClick() {
    emit('click', props.tool);
  }
</script>

<style scoped>
  .tool-card {
    position: relative;
    padding: 1.25rem;
    border-radius: var(--radius-lg);
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    box-shadow: var(--card-shadow);
    cursor: pointer;
    overflow: hidden;
    transition: all var(--transition-normal);
    height: 100%;
    transform-style: preserve-3d;
    display: flex;
    flex-direction: column;
  }

  .tool-card:hover {
    border-color: var(--accent-purple);
    box-shadow:
      0 15px 30px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .card-content {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .card-tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 1rem;
    position: relative;
    z-index: 2;
  }

  .card-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--accent-purple);
    transition: transform var(--transition-normal);
    border: 1px solid var(--border-color);
    transform: translateZ(20px);
  }

  .tool-card:hover .card-icon {
    transform: scale(1.05) translateZ(20px);
    background: var(--accent-purple);
    color: #ffffff;
    border-color: var(--accent-purple);
  }

  .custom-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
    transition: filter var(--transition-normal);
  }

  .tool-card:hover .custom-icon {
    filter: brightness(0) invert(1);
  }

  .card-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: var(--text-primary);
    line-height: 1.4;
    padding-right: 4.5rem;
    transform: translateZ(30px);
  }

  .card-summary {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    flex-grow: 1;
    transform: translateZ(10px);
  }

  .card-footer {
    margin-top: auto;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 999px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
  }

  .category-tag {
    background: var(--bg-secondary);
    color: var(--text-primary);
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-color: var(--accent-purple);
    font-weight: 500;
  }

  .opt-icon {
    font-size: 0.85em;
    display: inline-flex;

    align-items: center;
  }

  .ai-tag {
    padding: 0.125rem 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 4px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: white;
    letter-spacing: 0.05em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .card-actions {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    gap: 0.25rem;
    z-index: 2;
    opacity: 0;
    transition: opacity 0.2s ease;
    transform: translateZ(40px);
  }

  .tool-card:hover .card-actions {
    opacity: 1;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .detail-btn:hover {
    background: var(--bg-primary);
    color: var(--accent-purple);
    border-color: var(--accent-purple);
  }

  .favorite-btn:hover {
    background: var(--bg-primary);
    border-color: #fbbf24;
    color: #fbbf24;
  }

  .favorite-btn.active {
    background: rgba(251, 191, 36, 0.1);
    border-color: #fbbf24;
    color: #fbbf24;
    opacity: 1;
  }

  .card-arrow {
    position: absolute;
    right: 1.25rem;
    bottom: 1.25rem;
    top: auto;
    transform: translateX(10px);
    opacity: 0;
    color: var(--accent-purple);
    color: var(--accent-purple);
    transition: all var(--transition-normal);
    transform: translateX(10px) translateZ(20px);
  }

  .tool-card:hover .card-arrow {
    opacity: 1;
    transform: translateX(0) translateZ(20px);
  }
</style>
