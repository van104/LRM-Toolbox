<template>
  <transition name="fade">
    <div v-if="visible" class="palette-overlay" @mousedown.self="close">
      <div class="palette-content scale-in">
        <div class="palette-header">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            :placeholder="t('home.searchPlaceholder', { count: totalToolsCount })"
            class="palette-input"
            @keydown.down.prevent="moveDown"
            @keydown.up.prevent="moveUp"
            @keydown.enter="handleSelect"
            @keydown.esc="close"
          />
          <div class="kbd-hint">ESC</div>
        </div>

        <div ref="resultsRef" class="results-container">
          <!-- 常规命令 -->
          <template v-if="!query">
            <div class="section-title">常用操作</div>
            <div
              v-for="(cmd, index) in staticCommands"
              :key="cmd.id"
              class="result-item"
              :class="{ active: index === selectedIndex }"
              @mouseenter="selectedIndex = index"
              @click="executeCommand(cmd)"
            >
              <el-icon class="item-icon"><component :is="cmd.icon" /></el-icon>
              <span class="item-name">{{ cmd.name }}</span>
              <span v-if="cmd.shortcut" class="item-shortcut">{{ cmd.shortcut }}</span>
            </div>
          </template>

          <!-- 搜索结果 -->
          <template v-if="query">
            <div class="section-title">RESULTS.FIND({{ filteredTools.length }})</div>
            <div
              v-for="(tool, index) in filteredTools"
              :key="tool.id"
              class="result-item"
              :class="{ active: index === selectedIndex }"
              @mouseenter="selectedIndex = index"
              @click="selectTool(tool)"
            >
              <div class="item-icon-box" :class="getRandomColorClass(tool.id)">
                <img
                  v-if="tool.customIcon"
                  :src="tool.customIcon"
                  class="item-custom-icon"
                  alt="icon"
                />
                <el-icon v-else-if="tool.svgIcon" class="item-icon">
                  <component :is="getToolIcon(tool.svgIcon)" />
                </el-icon>
                <el-icon v-else class="item-icon">
                  <component :is="tool.icon || Tools" />
                </el-icon>
              </div>
              <div class="item-info">
                <span class="item-name">{{ tool.name }}</span>
                <span class="item-summary">{{ tool.summary }}</span>
              </div>
              <div v-if="tool.category" class="item-category-tag">
                {{ t('category.' + tool.category) }}
              </div>
            </div>
          </template>

          <div v-if="query && filteredTools.length === 0" class="no-results">未找到相关工具</div>
        </div>

        <div class="palette-footer">
          <div class="footer-hint">
            <span><kbd>↑</kbd><kbd>↓</kbd> 导航</span>
            <span><kbd>Enter</kbd> 选择</span>
            <span><kbd>Ctrl</kbd>+<kbd>K</kbd> 唤起</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onUnmounted, computed, nextTick, type Component } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { Search, HomeFilled, InfoFilled, Tools } from '@element-plus/icons-vue';
  import { searchToolsAsync, loadAllTools, type Tool } from '@/data/tools';
  import * as ToolIcons from '@/components/icons/tools';

  const { t } = useI18n();
  const totalToolsCount = ref(0);

  const getToolIcon = (name: string) => (ToolIcons as Record<string, Component>)[name];

  // Generate deterministic color class based on string
  const getRandomColorClass = (str: string) => {
    if (!str) return 'bg-yellow';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorClasses = ['bg-yellow', 'bg-blue', 'bg-pink', 'bg-green'];
    return colorClasses[Math.abs(hash) % colorClasses.length];
  };

  interface Command {
    id: string;
    name: string;
    icon: Component;
    action: () => void;
    shortcut?: string;
  }

  const visible = ref(false);
  const query = ref('');
  const selectedIndex = ref(0);
  const inputRef = ref<HTMLInputElement | null>(null);
  const resultsRef = ref<HTMLElement | null>(null);
  const filteredTools = ref<Tool[]>([]);
  const router = useRouter();

  const staticCommands: Command[] = [
    { id: 'go-home', name: '返回首页', icon: HomeFilled, action: () => router.push('/') },
    {
      id: 'go-about',
      name: '关于 LRM工具箱',
      icon: InfoFilled,
      action: () => router.push('/about')
    }
    // 可以在此添加更多全局动作
  ];

  const totalItems = computed(() => {
    return query.value ? filteredTools.value.length : staticCommands.length;
  });

  watch(query, async newVal => {
    selectedIndex.value = 0;
    if (newVal) {
      filteredTools.value = await searchToolsAsync(newVal);
    } else {
      filteredTools.value = [];
    }
  });

  const open = () => {
    visible.value = true;
    query.value = '';
    selectedIndex.value = 0;
    nextTick(() => {
      inputRef.value?.focus();
    });
  };

  const close = () => {
    visible.value = false;
  };

  const moveDown = () => {
    selectedIndex.value = (selectedIndex.value + 1) % totalItems.value;
    scrollToSelected();
  };

  const moveUp = () => {
    selectedIndex.value = (selectedIndex.value - 1 + totalItems.value) % totalItems.value;
    scrollToSelected();
  };

  const scrollToSelected = () => {
    nextTick(() => {
      const activeItem = document.querySelector('.result-item.active') as HTMLElement;
      if (activeItem && resultsRef.value) {
        const container = resultsRef.value;
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (itemTop < containerTop) {
          container.scrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          container.scrollTop = itemBottom - container.offsetHeight;
        }
      }
    });
  };

  const handleSelect = () => {
    if (totalItems.value === 0) return;

    if (!query.value) {
      executeCommand(staticCommands[selectedIndex.value]);
    } else {
      selectTool(filteredTools.value[selectedIndex.value]);
    }
  };

  const selectTool = (tool: Tool) => {
    router.push(tool.route);
    close();
  };

  const executeCommand = (cmd: Command) => {
    if (cmd.action) cmd.action();
    close();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      open();
    }
  };

  onMounted(async () => {
    window.addEventListener('keydown', handleKeyDown);
    const tools = await loadAllTools();
    totalToolsCount.value = tools.length;
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<style scoped>
  .palette-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    padding-top: 15vh;
  }

  .palette-content {
    width: 95%;
    max-width: 680px;
    max-height: 520px;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  [data-theme='dark'] .palette-content {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
    color: #eee;
  }

  .palette-header {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    background: #fff;
  }

  [data-theme='dark'] .palette-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
  }

  .search-icon {
    font-size: 24px;
    color: #4b7bff;
    margin-right: 1rem;
    font-weight: 900;
  }

  .palette-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1.25rem;
    font-weight: 700;
    color: #111;
    height: 40px;
    font-family: inherit;
  }

  [data-theme='dark'] .palette-input {
    color: #eee;
  }

  .kbd-hint {
    font-size: 0.75rem;
    background: #111;
    padding: 4px 8px;
    color: #fff;
    font-weight: 800;
    border: 2px solid #111;
    box-shadow: 3px 3px 0px #ffd900;
  }

  .results-container {
    overflow-y: auto;
    flex: 1;
    padding: 1rem;
    background: #fdfae5;
  }

  [data-theme='dark'] .results-container {
    background: #111;
  }

  /* Custom scrollbar for results */
  .results-container::-webkit-scrollbar {
    width: 10px;
  }
  .results-container::-webkit-scrollbar-track {
    background: #111;
  }
  .results-container::-webkit-scrollbar-thumb {
    background: #ffd900;
    border: 3px solid #111;
  }

  .section-title {
    font-size: 0.75rem;
    font-weight: 900;
    color: #fff;
    background: #111;
    padding: 4px 12px;
    width: fit-content;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .result-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    border: 3px solid transparent;
    cursor: pointer;
    transition: all 0.1s;
    gap: 1rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
  }

  [data-theme='dark'] .result-item {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  .result-item.active {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
    background: #ffd900;
  }

  [data-theme='dark'] .result-item.active {
    background: #b28f00;
    box-shadow: 7px 7px 0px #eee;
  }

  .item-icon-box {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #111;
    flex-shrink: 0;
    transition: all 0.2s;
  }

  /* LRM Brand Colors */
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

  .item-icon {
    font-size: 24px;
    color: #111 !important; /* Force icons to be dark on light backgrounds */
  }

  .item-custom-icon {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }

  [data-theme='dark'] .item-icon-box {
    border-color: #eee;
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

  [data-theme='dark'] .item-icon {
    color: #fff !important;
  }

  [data-theme='dark'] .item-custom-icon {
    filter: brightness(0) invert(1);
  }

  .item-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 1rem;
    font-weight: 800;
    color: #111;
  }

  [data-theme='dark'] .item-name {
    color: #eee;
  }

  .item-summary {
    font-size: 0.75rem;
    font-weight: 600;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  [data-theme='dark'] .item-summary {
    color: #aaa;
  }

  .item-category-tag {
    font-size: 0.65rem;
    font-weight: 900;
    background: #111;
    color: #fff;
    padding: 2px 6px;
    text-transform: uppercase;
  }

  .item-shortcut {
    font-size: 0.75rem;
    font-weight: 800;
    color: #ff4b4b;
    border-left: 2px solid #111;
    padding-left: 0.5rem;
  }

  .no-results {
    padding: 3rem;
    text-align: center;
    font-weight: 900;
    color: #111;
    text-transform: uppercase;
    font-size: 1.25rem;
  }

  [data-theme='dark'] .no-results {
    color: #eee;
  }

  .palette-footer {
    padding: 0.75rem 1.5rem;
    background: #111;
    color: #fff;
    border-top: 4px solid #111;
  }

  .footer-hint {
    display: flex;
    gap: 1.5rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  kbd {
    background: #fff;
    color: #111;
    border: 2px solid #111;
    border-radius: 0;
    padding: 1px 6px;
    margin: 0 4px;
    box-shadow: 2px 2px 0px #ffd900;
    font-family: inherit;
    font-size: 0.7rem;
  }

  /* Animations */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .scale-in {
    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
</style>
