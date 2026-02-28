<template>
  <div class="header-wrap">
    <header class="brutal-header">
      <button class="brutal-btn back-btn" @click="$emit('back')">← 返回</button>
      <h1 class="brutal-title">日程<span>.排课()</span></h1>

      <div class="header-actions">
        <button class="brutal-btn" @click="$emit('add')">+ 添加</button>
        <button class="brutal-btn menu-btn" @click="menuOpen = !menuOpen">⚙️ 菜单 ▼</button>

        <div v-if="menuOpen" class="brutal-dropdown">
          <button class="dropdown-item" @click="handleAction('settings')">学期设置</button>
          <button class="dropdown-item" @click="handleAction('export')">导出 JSON</button>
          <button class="dropdown-item" @click="handleAction('import')">导入 JSON</button>
          <button class="dropdown-item danger" @click="handleAction('clear')">清空数据</button>
        </div>
      </div>
    </header>

    <section class="brutal-pane control-panel mt-8">
      <div class="week-selector">
        <div class="current-week-info">
          <span class="label">第</span>
          <span class="week-num">{{ modelValue }}</span>
          <span class="label">周</span>
          <span v-if="modelValue === realCurrentWeek" class="brutal-badge bg-green">本周</span>
        </div>
        <div class="week-nav">
          <button class="nav-btn" :disabled="modelValue <= 1" @click="updateWeek(1)">首页</button>
          <button class="nav-btn" :disabled="modelValue <= 1" @click="updateWeek(modelValue - 1)">
            ◀
          </button>
          <button class="nav-btn bg-yellow text-black" @click="updateWeek(realCurrentWeek)">
            回到本周
          </button>
          <button
            class="nav-btn"
            :disabled="modelValue >= totalWeeks"
            @click="updateWeek(modelValue + 1)"
          >
            ▶
          </button>
          <button
            class="nav-btn"
            :disabled="modelValue >= totalWeeks"
            @click="updateWeek(totalWeeks)"
          >
            末页
          </button>

          <select
            :value="modelValue"
            class="brutal-select week-select"
            @change="
              $emit('update:modelValue', parseInt(($event.target as HTMLSelectElement).value))
            "
          >
            <option v-for="w in totalWeeks" :key="w" :value="w">第 {{ w }} 周</option>
          </select>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import type { Course } from './useSchedule';

  interface Props {
    modelValue?: number;
    totalWeeks?: number;
    realCurrentWeek?: number;
    courses?: Course[];
  }

  withDefaults(defineProps<Props>(), {
    modelValue: 1,
    totalWeeks: 18,
    realCurrentWeek: 1,
    courses: () => []
  });

  const emit = defineEmits(['update:modelValue', 'back', 'add', 'action']);

  const menuOpen = ref(false);

  function updateWeek(w: number) {
    emit('update:modelValue', w);
  }

  function handleAction(type: string) {
    menuOpen.value = false;
    emit('action', type);
  }

  function closeMenu(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('.header-actions')) {
      menuOpen.value = false;
    }
  }

  onMounted(() => {
    document.addEventListener('click', closeMenu);
  });

  onUnmounted(() => {
    document.removeEventListener('click', closeMenu);
  });
</script>

<style scoped>
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    position: relative;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.1rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #00e572;
  }
  .brutal-title span {
    color: #00e572;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    position: relative;
  }

  .brutal-dropdown {
    position: absolute;
    top: 110%;
    right: 0;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    z-index: 100;
    display: flex;
    flex-direction: column;
    width: 160px;
  }

  .dropdown-item {
    background: transparent;
    border: none;
    font-size: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 700;
    padding: 0.75rem 1rem;
    cursor: pointer;
    text-align: left;
    border-bottom: 2px solid #111;
    display: block;
    width: 100%;
    transition: all 0.1s;
  }
  .dropdown-item:last-child {
    border-bottom: none;
  }
  .dropdown-item:hover {
    background: #4b7bff;
    color: #fff;
    transform: translate(-2px, -2px);
    box-shadow: 2px 2px 0px #111;
  }
  .dropdown-item.danger {
    color: #ff4b4b;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1.5rem;
  }

  .week-selector {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1.5rem;
  }

  .current-week-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.5rem;
  }

  .week-num {
    background: #111;
    color: #ffd900;
    padding: 0 0.8rem;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #ffd900;
  }

  .week-nav {
    display: flex;
    gap: 0.8rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .nav-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.5rem 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .nav-btn:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }

  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-select {
    border: 3px solid #111;
    padding: 0.5rem;
    font-weight: 800;
    box-shadow: 3px 3px 0px #111;
  }

  .bg-green {
    background: #00e572;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .brutal-badge {
    padding: 2px 8px;
    font-size: 0.8rem;
    border: 2px solid #111;
    font-weight: 800;
  }
  .mt-8 {
    margin-top: 2rem;
  }
</style>
