<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <div class="header-left">
          <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
          <button class="brutal-btn guide-trigger-btn" @click="showGuide = true">
            📖 使用指南
          </button>
        </div>
        <h1 class="brutal-title">亲戚<span>称呼()</span></h1>
        <div class="badge">👨‍👩‍👧‍👦 Family Calc</div>
      </header>

      <main class="brutal-main">
        <div class="calc-sidebar-layout">
          <div class="calc-body-wrap">
            <!-- 计算器核心 -->
            <RelationCalculator
              :my-gender="myGender"
              :expression-text="expressionText"
              :result-text="resultText"
              :current-gender="currentGender"
              @set-gender="setGender"
              @append="append"
              @backspace="backspace"
              @clear="clear"
            />

            <!-- 使用指南弹窗 -->
            <RelationGuide v-model="showGuide" />
          </div>

          <!-- 右侧：查询与预设 -->
          <div class="calc-sidebar-wrap">
            <!-- 反向查询 -->
            <RelationReverseSearch @apply="handleApplyReverse" />

            <!-- 常用称呼 -->
            <RelationPresets
              :my-gender="myGender"
              :active-chain-str="chain.join(',')"
              @apply="handleApplyPreset"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useFamilyRelation } from './FamilyRelation/useFamilyRelation';
  import RelationCalculator from './FamilyRelation/RelationCalculator.vue';
  import RelationReverseSearch from './FamilyRelation/RelationReverseSearch.vue';
  import RelationPresets from './FamilyRelation/RelationPresets.vue';
  import RelationGuide from './FamilyRelation/RelationGuide.vue';

  const {
    myGender,
    chain,
    currentGender,
    expressionText,
    resultText,
    setGender,
    append,
    backspace,
    clear
  } = useFamilyRelation();

  const showGuide = ref(false);

  function handleApplyReverse(item: { chain: string[] }) {
    chain.value = [...item.chain];
    scrollToTop();
  }

  function handleApplyPreset(preset: { chain: string[] }) {
    chain.value = [...preset.chain];
    scrollToTop();
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1200px;
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
    gap: 1.5rem;
  }

  .header-left {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .guide-trigger-btn {
    background: #ff7be5 !important;
    color: #fff;
    border-color: #111;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
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
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .badge {
    background: #111;
    color: #ff4b4b;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #ff4b4b;
    box-shadow: 5px 5px 0px #ff4b4b;
  }

  .calc-sidebar-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2.5rem;
    align-items: stretch;
  }

  .calc-sidebar-wrap {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    height: 100%;
  }

  @media (max-width: 1024px) {
    .calc-sidebar-layout {
      grid-template-columns: 1fr;
    }
  }
</style>
