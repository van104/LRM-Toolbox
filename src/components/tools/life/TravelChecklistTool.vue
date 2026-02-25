<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">旅行<span>.清单()</span></h1>
        <div class="header-actions">
          <button class="brutal-btn" @click="handleReset">重置</button>
          <button class="brutal-btn" @click="handleClear">清空勾选</button>
        </div>
      </header>

      <main class="main-content">
        <div class="scenario-selector">
          <button
            v-for="s in scenarios"
            :key="s.id"
            class="brutal-action-btn scenario-btn"
            :class="{ active: currentScenario === s.id }"
            @click="currentScenario = s.id"
          >
            {{ s.name }}
          </button>
        </div>

        <div class="progress-section brutal-pane">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <span class="progress-text">{{ progress }}% 已完成</span>
        </div>

        <div class="brutal-pane checklist-container">
          <div v-for="(group, gIndex) in currentList" :key="gIndex" class="check-group">
            <div class="group-title-bar">
              <h3>{{ group.category }}</h3>
              <span class="group-count"
                >{{ getGroupChecked(gIndex) }}/{{ group.items.length }}</span
              >
            </div>
            <div class="items-grid">
              <button
                v-for="(item, iIndex) in group.items"
                :key="iIndex"
                class="check-item"
                :class="{ checked: item.checked }"
                @click="toggleItem(gIndex, iIndex)"
              >
                <span class="check-box" :class="{ done: item.checked }">{{
                  item.checked ? '✔' : ''
                }}</span>
                <span class="item-name">{{ item.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 旅行打包清单 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';

  interface CheckItem {
    name: string;
    checked: boolean;
  }
  interface CheckGroup {
    category: string;
    items: CheckItem[];
  }
  interface Scenario {
    id: string;
    name: string;
    data: CheckGroup[];
  }

  const scenarios: Scenario[] = [
    {
      id: 'general',
      name: '通用/短途',
      data: [
        {
          category: '证件/财务',
          items: [
            { name: '身份证', checked: false },
            { name: '手机', checked: false },
            { name: '充电器/充电宝', checked: false },
            { name: '耳机', checked: false },
            { name: '钥匙', checked: false },
            { name: '现金/银行卡', checked: false },
            { name: '纸巾/湿巾', checked: false }
          ]
        },
        {
          category: '衣物',
          items: [
            { name: '换洗衣物', checked: false },
            { name: '睡衣', checked: false },
            { name: '内衣裤', checked: false },
            { name: '袜子', checked: false },
            { name: '舒适的鞋子', checked: false }
          ]
        },
        {
          category: '洗漱用品',
          items: [
            { name: '牙刷牙膏', checked: false },
            { name: '毛巾', checked: false },
            { name: '洗发水/沐浴露', checked: false },
            { name: '护肤品', checked: false },
            { name: '梳子', checked: false }
          ]
        }
      ]
    },
    {
      id: 'beach',
      name: '海边度假',
      data: [
        {
          category: '海边必备',
          items: [
            { name: '泳衣/泳裤', checked: false },
            { name: '泳镜', checked: false },
            { name: '防晒霜', checked: false },
            { name: '太阳镜', checked: false },
            { name: '遮阳帽', checked: false },
            { name: '沙滩鞋/拖鞋', checked: false },
            { name: '防水袋', checked: false }
          ]
        },
        {
          category: '常规',
          items: [
            { name: '身份证', checked: false },
            { name: '手机', checked: false },
            { name: '充电器', checked: false },
            { name: '换洗衣物', checked: false }
          ]
        }
      ]
    },
    {
      id: 'business',
      name: '商务出差',
      data: [
        {
          category: '办公',
          items: [
            { name: '笔记本电脑', checked: false },
            { name: '电源适配器', checked: false },
            { name: '名片', checked: false },
            { name: '笔记本/笔', checked: false },
            { name: 'U盘/硬盘', checked: false },
            { name: '合同/文件', checked: false }
          ]
        },
        {
          category: '衣物',
          items: [
            { name: '正装/衬衫', checked: false },
            { name: '皮鞋', checked: false },
            { name: '领带', checked: false },
            { name: '便装', checked: false }
          ]
        }
      ]
    },
    {
      id: 'abroad',
      name: '出国旅行',
      data: [
        {
          category: '证件',
          items: [
            { name: '护照', checked: false },
            { name: '签证', checked: false },
            { name: '身份证', checked: false },
            { name: '行程单/酒店预订', checked: false },
            { name: '国际驾照', checked: false },
            { name: '证件复印件', checked: false }
          ]
        },
        {
          category: '工具',
          items: [
            { name: '转换插头', checked: false },
            { name: '随身WiFi/SIM卡', checked: false },
            { name: '谷歌地图离线包', checked: false },
            { name: '翻译软件', checked: false },
            { name: '信用卡(Visa/Master)', checked: false },
            { name: '当地货币', checked: false }
          ]
        }
      ]
    }
  ];

  const currentScenario = ref('general');
  const lists = ref<Record<string, CheckGroup[]>>({});

  const initLists = () => {
    const saved = localStorage.getItem('lrm-travel-checklists-brutal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const newLists: Record<string, CheckGroup[]> = {};
        scenarios.forEach(s => {
          newLists[s.id] = parsed[s.id] || JSON.parse(JSON.stringify(s.data));
        });
        lists.value = newLists;
      } catch {
        resetAll();
      }
    } else {
      resetAll();
    }
  };

  const resetAll = () => {
    const newLists: Record<string, CheckGroup[]> = {};
    scenarios.forEach(s => {
      newLists[s.id] = JSON.parse(JSON.stringify(s.data));
    });
    lists.value = newLists;
  };

  const currentList = computed(() => lists.value[currentScenario.value] || []);

  const progress = computed(() => {
    let total = 0,
      checked = 0;
    currentList.value.forEach(g => {
      g.items.forEach(i => {
        total++;
        if (i.checked) checked++;
      });
    });
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  });

  const getGroupChecked = (gIndex: number) => {
    return currentList.value[gIndex].items.filter(i => i.checked).length;
  };

  const toggleItem = (gIndex: number, iIndex: number) => {
    currentList.value[gIndex].items[iIndex].checked =
      !currentList.value[gIndex].items[iIndex].checked;
  };

  const handleReset = () => {
    if (confirm('确定要重置当前清单吗？')) {
      const original = scenarios.find(s => s.id === currentScenario.value);
      if (original) lists.value[currentScenario.value] = JSON.parse(JSON.stringify(original.data));
    }
  };

  const handleClear = () => {
    currentList.value.forEach(g => {
      g.items.forEach(i => (i.checked = false));
    });
  };

  watch(
    lists,
    newVal => {
      localStorage.setItem('lrm-travel-checklists-brutal', JSON.stringify(newVal));
    },
    { deep: true }
  );
  onMounted(() => {
    initLists();
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 850px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
  }
  .header-actions {
    display: flex;
    gap: 0.75rem;
  }
  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    color: #111;
    white-space: nowrap;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .scenario-selector {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    white-space: nowrap;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .brutal-action-btn.active {
    background: #4b7bff;
    color: #fff;
    box-shadow: 0 0 0 #111;
    transform: translate(4px, 4px);
  }
  .progress-section {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
    padding: 1.25rem 1.5rem;
  }
  .progress-bar-track {
    flex: 1;
    height: 20px;
    background: #fdfae5;
    border: 3px solid #111;
    box-shadow: 2px 2px 0px #111;
    position: relative;
    overflow: hidden;
  }
  .progress-bar-fill {
    height: 100%;
    background: #00e572;
    transition: width 0.3s;
  }
  .progress-text {
    font-weight: 800;
    font-size: 1.1rem;
    font-family: 'Syne', monospace;
    white-space: nowrap;
  }
  .checklist-container {
    padding: 1.5rem;
  }
  .check-group {
    margin-bottom: 2rem;
  }
  .check-group:last-child {
    margin-bottom: 0;
  }
  .group-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 4px solid #111;
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
  }
  .group-title-bar h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin: 0;
  }
  .group-count {
    font-weight: 800;
    font-size: 1rem;
    color: #555;
    background: #ffd900;
    padding: 2px 8px;
    border: 2px solid #111;
  }
  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .check-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 3px 3px 0px #111;
    text-align: left;
  }
  .check-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
    background: #fdfae5;
  }
  .check-item.checked {
    background: #00e572;
    box-shadow: 0 0 0 #111;
    transform: translate(3px, 3px);
  }
  .check-box {
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1rem;
    background: #fff;
    flex-shrink: 0;
  }
  .check-box.done {
    background: #111;
    color: #fff;
  }
  .item-name {
    font-size: 0.95rem;
    font-weight: 700;
    user-select: none;
  }
  .check-item.checked .item-name {
    text-decoration: line-through;
    opacity: 0.7;
  }
  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
  }
  .marquee-wrapper {
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .items-grid {
      grid-template-columns: 1fr;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .check-item {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.active {
    background: #2a4eb2;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .check-item {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .check-item:hover {
    box-shadow: 5px 5px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .check-item.checked {
    background: #00994c;
    box-shadow: 0 0 0 #eee;
  }
  [data-theme='dark'] .check-box {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .check-box.done {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .group-title-bar {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .group-count {
    background: #b28f00;
    border-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .progress-bar-track {
    background: #222;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .progress-bar-fill {
    background: #00994c;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
