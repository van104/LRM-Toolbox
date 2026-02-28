<template>
  <div class="brutal-pane preset-pane">
    <div class="pane-header bg-orange">
      <span>⚡ 常用称呼 (一键查询)</span>
    </div>
    <div class="pane-body">
      <RecycleScroller
        v-slot="{ item }"
        class="preset-scroller"
        :items="virtualizedPresets"
        :item-size="60"
        key-field="id"
      >
        <div class="preset-item-wrapper">
          <button
            class="preset-btn"
            :class="{ 'preset-active': isPresetActive(item) }"
            @click="$emit('apply', item)"
          >
            <span class="preset-emoji">{{ item.emoji }}</span>
            <span class="preset-label">{{ item.label }}</span>
          </button>
        </div>
      </RecycleScroller>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import { presets } from './FamilyRelationData';

  const props = defineProps({
    myGender: { type: Number, default: 1 },
    activeChainStr: { type: String, default: '' }
  });

  defineEmits(['apply']);

  const filteredPresets = computed(() => {
    return presets.filter(
      p =>
        p.gender === 'both' ||
        (props.myGender === 1 && p.gender === 'male') ||
        (props.myGender === 0 && p.gender === 'female')
    );
  });

  const virtualizedPresets = computed(() => {
    return filteredPresets.value.map((p, idx) => ({
      ...p,
      id: `${p.label}-${idx}`
    }));
  });

  function isPresetActive(preset) {
    return props.activeChainStr === preset.chain.join(',');
  }
</script>

<style scoped>
  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1; /* 占据侧边栏剩余空间 */
    min-height: 0; /* 关键：允许 flex 项目缩小，以便内部虚拟滚动生效 */
  }

  .pane-header {
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
  }

  .bg-orange {
    background: #ff9900;
  }

  .pane-body {
    padding: 0;
    flex: 1;
    background: #fdfae5; /* 与整体背景呼应 */
    min-height: 400px;
    position: relative; /* 必须设置定位上下文 */
    overflow: hidden; /* 防止子元素撑开高度导致虚拟滚动失效 */
  }

  .preset-scroller {
    position: absolute; /* 绝对定位，强制继承父级 flex: 1 后的显示区域 */
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1rem;
    box-sizing: border-box;
    scrollbar-width: thin;
    scrollbar-color: #111 transparent;
  }

  /* Webkit custom scrollbar */
  .preset-scroller::-webkit-scrollbar {
    width: 8px;
  }
  .preset-scroller::-webkit-scrollbar-thumb {
    background: #111;
    border: 2px solid #fdfae5;
  }

  .preset-item-wrapper {
    padding-bottom: 8px; /* 卡片间的间距 */
  }

  .preset-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.25rem;
    padding: 0 1.25rem;
    height: 52px;
    width: 100%;
    background: #fff;
    border: 3px solid #111;
    cursor: pointer;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1); /* 减弱投影，更清爽 */
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    text-align: left;
  }

  .preset-btn:hover {
    background: #fff;
    border-color: #ff9900;
    box-shadow: 4px 4px 0px #ff9900;
    transform: scale(1.01);
  }

  .preset-active {
    background: #111 !important;
    border-color: #111 !important;
    color: #ffd900;
    box-shadow: 0px 0px 0px transparent !important;
    transform: none !important;
  }

  .preset-emoji {
    font-size: 1.4rem;
    filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
  }

  .preset-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: 1px;
    flex: 1;
  }
</style>
