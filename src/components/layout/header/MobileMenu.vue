<template>
  <Transition name="slide">
    <div v-if="visible" class="mobile-menu">
      <button
        v-for="cat in categories"
        :key="cat.id"
        :class="['mobile-nav-item', { active: activeCategory === cat.id }]"
        @click="$emit('change', cat.id)"
      >
        <el-icon :size="24">
          <component :is="cat.svgIcon ? iconMap[cat.svgIcon] : iconMap[cat.icon]" />
        </el-icon>
        <span>{{ t('category.' + cat.id) }}</span>
        <span class="count-badge mobile">{{ counts[cat.id] || 0 }}</span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';
  import {
    Grid,
    Monitor,
    Document,
    Picture,
    Brush,
    Wallet,
    Service,
    Coffee,
    Notebook,
    IceTea
  } from '@element-plus/icons-vue';
  import * as CategoryIcons from '@/components/icons/categories';

  defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    activeCategory: {
      type: String,
      default: 'all'
    },
    categories: {
      type: Array,
      required: true
    },
    counts: {
      type: Object,
      default: () => ({})
    }
  });

  defineEmits(['change']);

  const { t } = useI18n();

  const iconMap = {
    Grid,
    Monitor,
    Document,
    Picture,
    Brush,
    Wallet,
    Service,
    Coffee,
    Notebook,
    IceTea,
    ...CategoryIcons
  };
</script>

<style scoped>
  .mobile-menu {
    position: absolute;
    top: var(--header-height);
    left: 1rem;
    right: 1rem;
    padding: 1.5rem;
    background: #fff;
    border: 4px solid #111;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    box-shadow: 10px 10px 0px #111;
    transform-origin: top center;
    z-index: 101;
  }

  [data-theme='dark'] .mobile-menu {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }

  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 0.5rem;
    background: #fff;
    color: #111;
    gap: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 800;
    transition: all 0.2s;
    border: 3px solid #111;
    cursor: pointer;
    position: relative;
  }

  [data-theme='dark'] .mobile-nav-item {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
  }

  .mobile-nav-item:hover,
  .mobile-nav-item.active {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
  }

  [data-theme='dark'] .mobile-nav-item:hover,
  [data-theme='dark'] .mobile-nav-item.active {
    background: #b28f00;
    box-shadow: 4px 4px 0px #eee;
  }

  .count-badge.mobile {
    position: absolute;
    top: 5px;
    right: 5px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    font-weight: 800;
    background: #111;
    color: #fff;
    padding: 1px 4px;
    border: 2px solid #111;
  }

  [data-theme='dark'] .count-badge.mobile {
    background: #eee;
    color: #111;
    border-color: #eee;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
</style>
