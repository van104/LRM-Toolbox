<template>
  <transition name="fade">
    <div v-if="visible" class="palette-overlay" @mousedown.self="close">
      <div class="palette-content glass-effect scale-in">
        <div class="palette-header">
          <el-icon class="search-icon"><Search /></el-icon>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            placeholder="搜索工具或命令... (Pinyin support)"
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
            <div class="section-title">搜索结果 ({{ filteredTools.length }})</div>
            <div
              v-for="(tool, index) in filteredTools"
              :key="tool.id"
              class="result-item"
              :class="{ active: index === selectedIndex }"
              @mouseenter="selectedIndex = index"
              @click="selectTool(tool)"
            >
              <el-icon class="item-icon">
                <component :is="tool.icon || 'Tools'" />
              </el-icon>
              <div class="item-info">
                <span class="item-name">{{ tool.name }}</span>
                <span class="item-summary">{{ tool.summary }}</span>
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
  import { Search, HomeFilled, InfoFilled } from '@element-plus/icons-vue';
  import { searchTools, type Tool } from '@/data/tools';

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

  const filteredTools = computed(() => {
    return searchTools(query.value);
  });

  const totalItems = computed(() => {
    return query.value ? filteredTools.value.length : staticCommands.length;
  });

  watch(query, () => {
    selectedIndex.value = 0;
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

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
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
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    padding-top: 15vh;
  }

  .palette-content {
    width: 90%;
    max-width: 640px;
    max-height: 480px;
    background: var(--bg-primary, #ffffff);
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .dark .palette-content {
    background: #1e1e1e;
    border-color: #333;
  }

  .palette-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .search-icon {
    font-size: 20px;
    color: #94a3b8;
    margin-right: 12px;
  }

  .palette-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 16px;
    color: var(--text-primary);
    height: 32px;
  }

  .kbd-hint {
    font-size: 12px;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    color: #64748b;
  }

  .results-container {
    overflow-y: auto;
    flex: 1;
    padding: 8px;
  }

  .section-title {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    padding: 8px 12px;
    text-transform: uppercase;
  }

  .result-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    gap: 12px;
  }

  .result-item.active {
    background: var(--primary-color-light, #e0f2fe);
    color: var(--primary-color, #0ea5e9);
  }

  .dark .result-item.active {
    background: rgba(14, 165, 233, 0.2);
  }

  .item-icon {
    font-size: 20px;
    opacity: 0.7;
  }

  .item-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .item-name {
    font-size: 14px;
    font-weight: 500;
  }

  .item-summary {
    font-size: 12px;
    opacity: 0.6;
  }

  .item-shortcut {
    font-size: 12px;
    opacity: 0.4;
  }

  .no-results {
    padding: 40px;
    text-align: center;
    color: #94a3b8;
  }

  .palette-footer {
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.02);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .footer-hint {
    display: flex;
    gap: 16px;
    color: #94a3b8;
    font-size: 12px;
  }

  kbd {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
    padding: 1px 4px;
    margin: 0 2px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    font-family: sans-serif;
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
