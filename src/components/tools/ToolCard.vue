<template>
  <div class="brutal-card-wrapper" @click="handleCardClick">
    <div class="brutal-card">
      <div class="card-header" :class="getRandomColorClass(tool.id)">
        <div class="card-icon-wrapper">
          <img v-if="tool.customIcon" :src="tool.customIcon" class="custom-icon" alt="icon" />
          <el-icon v-else :size="24">
            <component :is="tool.icon" />
          </el-icon>
        </div>
        <div class="card-actions">
          <button
            class="brutal-action-small"
            :title="t('toolCard.viewDetail')"
            @click.stop="$emit('view-detail', tool)"
          >
            <el-icon :size="14"><InfoFilled /></el-icon>
          </button>
          <button
            class="brutal-action-small"
            :class="{ active: isFavorite }"
            :title="isFavorite ? t('toolCard.removeFavorite') : t('toolCard.addFavorite')"
            @click.stop="$emit('toggle-favorite', tool.id)"
          >
            <el-icon :size="14">
              <StarFilled v-if="isFavorite" />
              <Star v-else />
            </el-icon>
          </button>
        </div>
      </div>

      <div class="card-body">
        <h3 class="brutal-card-title">{{ tool.name }}</h3>
        <p class="brutal-card-summary">{{ tool.summary }}</p>
      </div>

      <div class="brutal-card-footer">
        <div class="tags-container">
          <span v-if="category" class="brutal-tag category-tag">
            <el-icon class="opt-icon"><component :is="category.icon" /></el-icon>
            {{ t('category.' + category.id) }}
          </span>
          <span v-if="tool.isAi" class="brutal-tag ai-tag">AI</span>
          <span v-for="tag in tool.tags.slice(0, 2)" :key="tag" class="brutal-tag">
            {{ tag }}
          </span>
        </div>
        <div class="card-arrow-icon">
          <el-icon :size="20"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ArrowRight, Star, StarFilled, InfoFilled } from '@element-plus/icons-vue';
  import { categories } from '@/data/tools';

  const { t } = useI18n();

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

  // Generate deterministic color class based on string
  function getRandomColorClass(str) {
    if (!str) return 'bg-yellow';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorClasses = ['bg-yellow', 'bg-blue', 'bg-pink', 'bg-green'];
    return colorClasses[Math.abs(hash) % colorClasses.length];
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-card-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
  }

  .brutal-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
    position: relative;
    min-height: 200px;
  }

  .brutal-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .brutal-card:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 4px solid #111;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }

  .bg-blue .custom-icon,
  .bg-pink .custom-icon {
    filter: brightness(0) invert(1);
  }

  .card-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .custom-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    opacity: 1; /* Always visible in brutalism, or keep it raw */
  }

  .brutal-action-small {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
    padding: 0;
  }

  .brutal-action-small:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .brutal-action-small:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-small.active {
    background: #ff4b4b;
    color: #fff;
  }

  .card-body {
    padding: 1.25rem 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
  }

  .brutal-card-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0 0 0.5rem 0;
    color: #111;
    text-transform: uppercase;
    letter-spacing: -0.5px;
  }

  .brutal-card-summary {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.85rem;
    color: #444;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .brutal-card-footer {
    padding: 0.75rem 1rem;
    border-top: 4px solid #111;
    background: #f8f8f8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tags-container {
    display: flex;
    gap: 0.5rem;
    overflow: hidden;
    flex-wrap: nowrap;
  }

  .brutal-tag {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border: 2px solid #111;
    background: #fff;
    color: #111;
    white-space: nowrap;
    box-shadow: 2px 2px 0px #111;
    text-transform: uppercase;
  }

  .category-tag {
    background: #111;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 2px 2px 0px #ffd900;
  }

  .ai-tag {
    background: #ff4b4b;
    color: #fff;
  }

  .card-arrow-icon {
    color: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .brutal-card:hover .card-arrow-icon {
    transform: translateX(4px);
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .card-body,
  [data-theme='dark'] .brutal-action-small,
  [data-theme='dark'] .brutal-tag {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-card {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-card:hover {
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .brutal-card:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .card-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-card-footer {
    border-top-color: #eee;
    background: #111;
  }

  [data-theme='dark'] .brutal-action-small {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-small:hover {
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-small:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-small.active {
    background: #cc0000;
    color: #fff;
  }

  [data-theme='dark'] .brutal-card-title {
    color: #eee;
  }
  [data-theme='dark'] .brutal-card-summary {
    color: #aaa;
  }

  [data-theme='dark'] .brutal-tag {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .category-tag {
    background: #eee;
    color: #111;
    box-shadow: 2px 2px 0px #b28f00;
    border-color: #eee;
  }
  [data-theme='dark'] .ai-tag {
    background: #cc0000;
    color: #fff;
    border-color: #eee;
  }

  [data-theme='dark'] .card-arrow-icon {
    color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
</style>
