<template>
  <div class="brutal-card-wrapper" @click="handleCardClick">
    <div class="brutal-card">
      <!-- 顶部色带 Header -->
      <div class="card-header" :class="getRandomColorClass(tool.id)">
        <div class="header-left">
          <div class="card-icon-wrapper">
            <img v-if="tool.customIcon" :src="tool.customIcon" class="custom-icon" alt="icon" />
            <el-icon v-else-if="tool.svgIcon" :size="32">
              <component :is="ToolIcons[tool.svgIcon]" />
            </el-icon>
            <el-icon v-else :size="32">
              <component :is="tool.icon" />
            </el-icon>
          </div>
          <span v-if="category" class="brutal-tag category-tag header-tag">
            <el-icon class="opt-icon">
              <component :is="CategoryIcons[category.svgIcon]" v-if="category.svgIcon" />
              <component :is="category.icon" v-else />
            </el-icon>
            {{ t('category.' + category.id) }}
          </span>
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

      <!-- 主体内容 Body -->
      <div class="card-body">
        <div class="body-accent" :class="getRandomColorClass(tool.id)"></div>
        <div class="card-body-content">
          <div class="card-body-text">
            <h3 class="brutal-card-title">{{ tool.name }}</h3>
            <p class="brutal-card-summary">{{ tool.summary }}</p>
          </div>
          <div class="card-body-deco" :class="getRandomColorClass(tool.id) + '-deco'">
            <img v-if="tool.customIcon" :src="tool.customIcon" class="deco-icon custom" alt="" />
            <el-icon v-else-if="tool.svgIcon" class="deco-icon">
              <component :is="ToolIcons[tool.svgIcon]" />
            </el-icon>
            <el-icon v-else class="deco-icon">
              <component :is="tool.icon" />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 底部标签栏 Footer -->
      <div class="brutal-card-footer">
        <div class="tags-container">
          <span v-if="tool.isAi" class="brutal-tag ai-tag">AI</span>
          <span v-for="tag in tool.tags.slice(0, 4)" :key="tag" class="brutal-tag">
            {{ tag }}
          </span>
        </div>
        <div class="card-arrow-icon">
          <span class="arrow-circle">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Star, StarFilled, InfoFilled } from '@element-plus/icons-vue';
  import { categories } from '@/data/tools';
  import * as ToolIcons from '@/components/icons/tools';
  import * as CategoryIcons from '@/components/icons/categories';

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
    min-height: 210px;
  }

  .brutal-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .brutal-card:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  /* ======== Header ======== */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.65rem 1rem;
    border-bottom: 4px solid #111;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0; /* Prevent overflow */
  }

  .bg-yellow {
    background: #ffeba0;
    color: #111;
  }
  .bg-blue {
    background: #89b4f8;
    color: #111;
  }
  .bg-pink {
    background: #ff9fb2;
    color: #111;
  }
  .bg-green {
    background: #81e6b3;
    color: #111;
  }

  .bg-blue .custom-icon,
  .bg-pink .custom-icon {
    filter: brightness(0);
  }

  .card-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .custom-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  .card-actions {
    display: flex;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .brutal-action-small {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    padding: 0;
  }

  .brutal-action-small:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-action-small:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-small.active {
    background: #ff4b4b;
    color: #fff;
  }

  /* ======== Body ======== */
  .card-body {
    padding: 1.1rem 1rem 1rem 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    position: relative;
    overflow: hidden;
  }

  /* 左侧色条点缀 */
  .body-accent {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
  }

  .card-body-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .card-body-text {
    flex: 1;
    min-width: 0;
    z-index: 1;
  }

  /* 右侧装饰图标 */
  .card-body-deco {
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
    opacity: 0.65;
    transition: all 0.2s ease;
    transform: rotate(-6deg);
  }

  .card-body-deco .deco-icon {
    font-size: 28px;
    color: #111;
  }

  .card-body-deco .deco-icon.custom {
    width: 28px;
    height: 28px;
    object-fit: contain;
    filter: brightness(0);
  }

  /* 装饰图标的颜色变体 */
  .bg-yellow-deco {
    background: #ffeba0;
  }
  .bg-blue-deco {
    background: #89b4f8;
  }
  .bg-pink-deco {
    background: #ff9fb2;
  }
  .bg-green-deco {
    background: #81e6b3;
  }

  .brutal-card:hover .card-body-deco {
    opacity: 1;
    transform: rotate(0deg) scale(1.1);
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-card-title {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', sans-serif;
    font-size: 1.2rem;
    font-weight: 900;
    margin: 0 0 0.4rem 0;
    color: #111;
    letter-spacing: -0.5px;
    -webkit-text-stroke: 0.3px #111;
    line-height: 1.3;
  }

  .brutal-card-summary {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', monospace;
    font-size: 0.82rem;
    font-weight: 500;
    color: #555;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ======== Footer ======== */
  .brutal-card-footer {
    padding: 0.6rem 0.75rem;
    border-top: 4px solid #111;
    background: #f5f5f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .tags-container {
    display: flex;
    gap: 0.35rem;
    overflow: hidden;
    flex-wrap: nowrap;
    flex: 1;
    min-width: 0;
  }

  .brutal-tag {
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border: 2px solid #111;
    background: #fff;
    color: #111;
    white-space: nowrap;
    box-shadow: 1px 1px 0px #111;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .category-tag {
    background: #111;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 2px 2px 0px #ffd900;
  }

  .category-tag.header-tag {
    background: #111;
    color: #fff;
    box-shadow: 3px 3px 0px #ffd900;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 0.8rem;
    font-weight: 800;
    padding: 0.3rem 0.65rem;
    border: 3px solid #111;
    letter-spacing: 0.5px;
    transition: all 0.15s;
  }

  .brutal-card:hover .category-tag.header-tag {
    background: #ffd900;
    color: #111;
    box-shadow: 3px 3px 0px #111;
  }

  .ai-tag {
    background: #ff4b4b;
    color: #fff;
    animation: ai-pulse 2s ease-in-out infinite;
  }

  @keyframes ai-pulse {
    0%,
    100% {
      box-shadow: 1px 1px 0px #111;
    }
    50% {
      box-shadow: 1px 1px 6px #ff4b4b;
    }
  }

  /* Arrow Button */
  .card-arrow-icon {
    flex-shrink: 0;
  }

  .arrow-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 3px solid #111;
    background: #fff;
    font-weight: 900;
    font-size: 1rem;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.15s;
  }

  .brutal-card:hover .arrow-circle {
    background: #111;
    color: #fff;
    transform: translateX(2px);
    box-shadow: 0px 0px 0px #111;
  }

  /* ======== Dark Mode ======== */
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
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-small:hover {
    box-shadow: 4px 4px 0px #eee;
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
    -webkit-text-stroke: 0.3px #eee;
  }
  [data-theme='dark'] .brutal-card-summary {
    color: #aaa;
  }

  /* Dark Mode 装饰图标 */
  [data-theme='dark'] .card-body-deco {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    opacity: 0.5;
  }
  [data-theme='dark'] .card-body-deco .deco-icon {
    color: #eee;
  }
  [data-theme='dark'] .card-body-deco .deco-icon.custom {
    filter: brightness(0) invert(1);
  }
  [data-theme='dark'] .brutal-card:hover .card-body-deco {
    opacity: 0.85;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow-deco {
    background: #a98d36;
  }
  [data-theme='dark'] .bg-blue-deco {
    background: #405d9e;
  }
  [data-theme='dark'] .bg-pink-deco {
    background: #b25465;
  }
  [data-theme='dark'] .bg-green-deco {
    background: #3c9165;
  }

  [data-theme='dark'] .brutal-tag {
    box-shadow: 1px 1px 0px #eee;
  }
  [data-theme='dark'] .category-tag {
    background: #eee;
    color: #111;
    box-shadow: 2px 2px 0px #b28f00;
    border-color: #eee;
  }
  [data-theme='dark'] .category-tag.header-tag {
    box-shadow: 2px 2px 0px rgba(255, 255, 255, 0.3);
  }
  [data-theme='dark'] .ai-tag {
    background: #cc0000;
    color: #fff;
    border-color: #eee;
  }
  @media (prefers-color-scheme: dark) {
    @keyframes ai-pulse {
      0%,
      100% {
        box-shadow: 1px 1px 0px #eee;
      }
      50% {
        box-shadow: 1px 1px 6px #cc0000;
      }
    }
  }

  [data-theme='dark'] .arrow-circle {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-card:hover .arrow-circle {
    background: #eee;
    color: #111;
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #a98d36;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #405d9e;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #b25465;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #3c9165;
    color: #fff;
  }
</style>
