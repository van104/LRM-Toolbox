<template>
  <div
    v-if="modelValue"
    class="brutal-modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="brutal-modal-content">
      <div class="brutal-pane">
        <div class="pane-header bg-pink">
          <span class="text-white">📖 使用指南 (GUIDE)</span>
          <button class="close-btn" @click="$emit('update:modelValue', false)">✖</button>
        </div>
        <div class="pane-body">
          <div class="guide-block">
            <div class="guide-step">
              <span class="step-num">01</span>
              <span class="step-text">先选择「我的性别」</span>
            </div>
            <div class="guide-step">
              <span class="step-num">02</span>
              <span class="step-text">按关系链逐步点击对应按钮</span>
            </div>
            <div class="guide-step">
              <span class="step-num">03</span>
              <span class="step-text">结果自动显示在屏幕上</span>
            </div>
          </div>

          <div class="guide-example">
            <div class="example-title">💡 示例</div>
            <div class="example-content">
              <p>我(男) → 父 → 兄 → 妻 = <strong>伯母</strong></p>
              <p>我(女) → 母 → 姐 = <strong>大姨</strong></p>
              <p>我(男) → 兄 → 子 = <strong>侄子</strong></p>
            </div>
          </div>

          <div class="guide-new">
            <div class="example-title">🆕 新功能</div>
            <div class="example-content">
              <p>🔍 <strong>反向查询</strong>：输入称呼查对应关系链</p>
              <p>⚡ <strong>常用预设</strong>：过年常用称呼一键生成</p>
            </div>
          </div>

          <div class="guide-tip">
            <span class="tip-icon">⚡</span>
            <span>按「退」可撤销，按「C」清空全部</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    modelValue: Boolean
  });
  defineEmits(['update:modelValue']);
</script>

<style scoped>
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .brutal-modal-content {
    width: 100%;
    max-width: 500px;
    animation: slideIn 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }

  @keyframes slideIn {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 12px 12px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
    line-height: 1;
  }

  .bg-pink {
    background: #ff7be5;
  }

  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-height: 80vh;
    overflow-y: auto;
  }

  .guide-block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .guide-step {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .step-num {
    width: 32px;
    height: 32px;
    background: #111;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
    box-shadow: 3px 3px 0px #ff7be5;
    flex-shrink: 0;
  }

  .step-text {
    font-weight: 800;
    font-size: 1rem;
  }

  .guide-example,
  .guide-new {
    border: 3px solid #111;
    padding: 1.2rem;
    background: #fdfae5;
  }

  .example-title {
    font-weight: 900;
    margin-bottom: 0.8rem;
    display: inline-block;
    border-bottom: 2px solid #111;
  }

  .example-content p {
    margin: 0.4rem 0;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .guide-tip {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    background: #111;
    color: #fff;
    padding: 1rem 1.2rem;
    font-weight: 800;
    font-size: 0.9rem;
  }

  .tip-icon {
    color: #ffd900;
    font-size: 1.2rem;
  }
</style>
