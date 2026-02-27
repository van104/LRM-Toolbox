<template>
  <el-dialog
    v-model="visible"
    :title="t('footer.changelog')"
    width="600px"
    class="brutal-dialog brutal-dialog-blue"
    append-to-body
    @close="$emit('update:modelValue', false)"
  >
    <div class="changelog-container">
      <div class="changelog-timeline">
        <div class="changelog-item featured">
          <div class="version-tag">LATEST</div>
          <div class="item-header">
            <span class="version-num">v2.5.0</span>
            <span class="version-date">2026-02-26</span>
          </div>
          <ul class="change-list">
            <li><span class="tag tag-ui">视觉</span>全站工具分类图标全面更新</li>
            <li><span class="tag tag-ui">图标</span>升级 250+ 工具的独立专属 SVG 图标</li>
            <li><span class="tag tag-ui">优化</span>适配 Neobrutalism 风格的视觉表现力</li>
          </ul>
        </div>

        <div class="changelog-item">
          <div class="item-header">
            <span class="version-num">v2.0.0</span>
            <span class="version-date">2026-02-23</span>
          </div>
          <ul class="change-list">
            <li><span class="tag tag-ui">视觉</span>全域 Neobrutalism (新粗野主义) 设计语言重构</li>
            <li><span class="tag tag-ui">排版</span>全局硬核黑体备选加强与文本超重描边特效</li>
            <li><span class="tag tag-fx">动效</span>新增平滑沉浮式的返回顶部/底部专属操作模块</li>
            <li>
              <span class="tag tag-fix">修复</span>所有荧光色板实施马卡龙降调，彻底解决滚动感光频闪
            </li>
          </ul>
        </div>

        <div class="changelog-item">
          <div class="item-header">
            <span class="version-num">v1.9.0</span>
            <span class="version-date">2026-02-11</span>
          </div>
          <ul class="change-list">
            <li>
              <span class="tag tag-refactor">重构</span>工具数据模块化：异步按需导入，秒开体验
            </li>
            <li><span class="tag tag-ui">预览</span>首页布局优化：截断展示与一键展开</li>
            <li>
              <span class="tag tag-fx">动效</span>主题转场：View Transitions 圆形扩散/消退动画
            </li>
            <li><span class="tag tag-ui">重构</span>页脚重构：磨砂质感与实时运行状态指示</li>
          </ul>
        </div>

        <div class="changelog-item">
          <div class="item-header">
            <span class="version-num">v1.8.0</span>
            <span class="version-date">2026-02-11</span>
          </div>
          <ul class="change-list">
            <li><span class="tag tag-perf">性能</span>特定大工具数据 JSON 化拆分</li>
            <li><span class="tag tag-fix">工程</span>全站 Linter 错误与警告深度清理修复</li>
          </ul>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="brutal-dialog-actions" style="justify-content: center">
        <button class="brutal-btn-primary width-full" @click="visible = false">
          {{ t('pwa.close') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const props = defineProps({
    modelValue: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const { t } = useI18n();

  const visible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  });
</script>

<style scoped>
  .changelog-container {
    padding: 0.5rem 1rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .changelog-timeline {
    position: relative;
    padding-left: 2rem;
    border-left: 2px solid var(--border-color);
  }

  .changelog-item {
    position: relative;
    margin-bottom: 3rem;
  }

  .changelog-item::before {
    content: '';
    position: absolute;
    left: -2.35rem;
    top: 0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: var(--bg-card);
    border: 2px solid var(--border-color);
    z-index: 2;
  }

  .changelog-item.featured::before {
    background: var(--accent-purple);
    border-color: var(--accent-purple);
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
  }

  .version-tag {
    position: absolute;
    top: -1.5rem;
    left: 0;
    font-size: 0.625rem;
    font-weight: 800;
    background: var(--accent-purple);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.05em;
  }

  .item-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .version-num {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--text-primary);
  }

  .version-date {
    font-size: 0.8125rem;
    color: var(--text-muted);
    font-family: monospace;
  }

  .change-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .change-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    color: var(--text-secondary);
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  /* Tags */
  .tag {
    flex-shrink: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .tag-refactor {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
  .tag-ui {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
  }
  .tag-fx {
    background: rgba(236, 72, 153, 0.1);
    color: #ec4899;
  }
  .tag-perf {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
  }
  .tag-fix {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }
  .tag-sys {
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
  }

  .brutal-btn-primary.width-full {
    width: 100%;
  }
</style>
