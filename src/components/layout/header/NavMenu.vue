<template>
  <el-tooltip :content="t('nav.dragTip')" placement="bottom" :effect="isDark ? 'dark' : 'light'">
    <nav
      ref="navMenuRef"
      class="nav-menu"
      :class="{ 'is-dragging': isDragging }"
      @mousedown="handleMouseDown"
      @mouseleave="handleMouseLeave"
      @mouseup="handleMouseUp"
      @mousemove="handleMouseMove"
    >
      <button
        v-for="cat in categories"
        :key="cat.id"
        :ref="el => setNavItemRef(el, cat.id)"
        :class="['nav-item', { active: activeCategory === cat.id }]"
        @click="handleCategoryClick($event, cat.id)"
      >
        <el-icon :size="20" class="nav-icon">
          <component :is="cat.svgIcon ? iconMap[cat.svgIcon] : iconMap[cat.icon]" />
        </el-icon>
        <span class="nav-text">{{ t('category.' + cat.id) }}</span>
        <span class="count-badge">{{ counts[cat.id] || 0 }}</span>
      </button>
      <div ref="indicatorRef" class="nav-indicator"></div>
    </nav>
  </el-tooltip>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
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

  const props = defineProps({
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
    },
    isDark: {
      type: Boolean,
      default: false
    }
  });

  const emit = defineEmits(['change']);

  const { t } = useI18n();
  const navMenuRef = ref(null);
  const indicatorRef = ref(null);
  const navItemsRef = ref({});

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

  const setNavItemRef = (el, id) => {
    if (el) navItemsRef.value[id] = el;
  };

  const updateIndicator = id => {
    const el = navItemsRef.value[id];
    if (el && indicatorRef.value) {
      indicatorRef.value.style.width = `${el.offsetWidth}px`;
      indicatorRef.value.style.left = `${el.offsetLeft}px`;
      indicatorRef.value.style.opacity = '1';

      if (navMenuRef.value) {
        const navRect = navMenuRef.value.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        if (elRect.left < navRect.left || elRect.right > navRect.right) {
          const scrollTarget =
            el.offsetLeft - navMenuRef.value.offsetWidth / 2 + el.offsetWidth / 2;
          navMenuRef.value.scrollTo({ left: scrollTarget, behavior: 'instant' });
        }
      }
    }
  };

  // Dragging logic
  const isDragging = ref(false);
  let startX = 0;
  let scrollLeft = 0;
  let dragMoved = false;

  function handleMouseDown(e) {
    isDragging.value = true;
    dragMoved = false;
    startX = e.pageX - navMenuRef.value.offsetLeft;
    scrollLeft = navMenuRef.value.scrollLeft;
  }

  function handleMouseLeave() {
    isDragging.value = false;
  }

  function handleMouseUp() {
    isDragging.value = false;
  }

  function handleMouseMove(e) {
    if (!isDragging.value) return;
    e.preventDefault();
    const x = e.pageX - navMenuRef.value.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) {
      dragMoved = true;
    }
    navMenuRef.value.scrollLeft = scrollLeft - walk;
  }

  function handleCategoryClick(event, categoryId) {
    if (dragMoved) {
      event.preventDefault();
      return;
    }
    emit('change', categoryId);
  }

  onMounted(() => {
    setTimeout(() => {
      updateIndicator(props.activeCategory);
    }, 100);
  });

  watch(
    () => props.activeCategory,
    newId => {
      updateIndicator(newId);
    }
  );
</script>

<style scoped>
  .nav-menu {
    display: flex;
    gap: 0.75rem;
    padding: 0.5rem;
    background: transparent;
    position: relative;
    overflow-x: auto;
    scrollbar-width: none;
    cursor: grab;
    user-select: none;
    align-items: center;
  }

  .nav-menu.is-dragging {
    cursor: grabbing;
    scroll-behavior: auto;
  }

  .nav-menu::-webkit-scrollbar {
    display: none;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.6rem 1rem;
    color: #111;
    font-size: 0.95rem;
    font-weight: 800;
    white-space: nowrap;
    transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    z-index: 1;
    border: 3px solid transparent;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
  }

  .nav-item .nav-icon {
    transition: transform 0.2s;
  }

  .nav-item:hover {
    transform: translateY(-2px);
    color: #4b7bff;
  }

  .nav-item:hover .nav-icon {
    transform: scale(1.1);
  }

  .nav-item.active {
    color: #111;
  }

  .nav-indicator {
    position: absolute;
    height: calc(100% - 1rem);
    border: 4px solid #111;
    background: #ffd900;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 0;
    opacity: 0;
    pointer-events: none;
  }

  .nav-text {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    letter-spacing: -0.01em;
  }

  [data-theme='dark'] .nav-item {
    color: #eee;
  }
  [data-theme='dark'] .nav-item:hover {
    color: #2a4eb2;
  }
  [data-theme='dark'] .nav-item.active {
    color: #111;
  }
  [data-theme='dark'] .nav-indicator {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  .count-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    font-weight: 800;
    background: #111;
    color: #fff;
    padding: 1px 6px;
    border: 3px solid #111;
    transition: all 0.2s;
    height: 18px;
    display: flex;
    align-items: center;
    line-height: 1;
  }

  .nav-item:hover .count-badge {
    background: #4b7bff;
    border-color: #111;
  }

  .nav-item.active .count-badge {
    background: #fff;
    color: #111;
    border-color: #111;
  }

  [data-theme='dark'] .count-badge {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .nav-item.active .count-badge {
    background: #111;
    color: #eee;
    border-color: #111;
  }

  @media (max-width: 1024px) {
    .nav-menu {
      display: none;
    }
  }
</style>
