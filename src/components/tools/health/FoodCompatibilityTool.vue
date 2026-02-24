<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.食材相克查询()</span></h1>
      </header>

      <main class="tool-content">
        <div class="brutal-pane main-pane">
          <div class="pane-header bg-black">
            <span class="text-white">🔍 输入食材查询冲突</span>
          </div>
          <div class="pane-body padding-large">
            <div class="form-container">
              <div class="input-group">
                <label>食材 A</label>
                <input
                  v-model="foodA"
                  type="text"
                  class="brutal-input large-input"
                  placeholder="例如: 螃蟹"
                  @keyup.enter="handleSearch"
                />
              </div>

              <div class="divider-cross">
                <span class="cross-icon">⚡</span>
              </div>

              <div class="input-group">
                <label>食材 B</label>
                <input
                  v-model="foodB"
                  type="text"
                  class="brutal-input large-input"
                  placeholder="例如: 柿子"
                  @keyup.enter="handleSearch"
                />
              </div>

              <div class="action-row">
                <button
                  class="brutal-action-btn primary large-btn"
                  :disabled="!foodA || !foodB"
                  @click="handleSearch"
                >
                  查询相克与宜忌
                </button>
              </div>
            </div>

            <div class="disclaimer-brutal mt-8">
              <strong>⚠️ 科学提示</strong>
              <p>
                “食物相克”主要源于传统民间说法，现代营养学研究表明，绝大多数所谓的“相克”其实是由于食物不洁、过敏、或乳糖不耐受等原因引起的。
              </p>
              <p>本工具仅通过搜索引擎提供相关说法作为参考，请以科学认知为准，保持膳食均衡多样。</p>
            </div>
          </div>
        </div>
      </main>

      <footer class="footer mt-8">© 2026 LRM工具箱 - 生活百科系列</footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const foodA = ref('');
  const foodB = ref('');

  const handleSearch = () => {
    if (!foodA.value || !foodB.value) return;
    const query = `${foodA.value}+${foodB.value}+相克吗`;
    const url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .pane-body {
    padding: 2rem;
  }
  .padding-large {
    padding: 3rem;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .input-group label {
    font-size: 1.2rem;
    font-weight: 900;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .brutal-input {
    width: 100%;
    padding: 1rem;
    font-size: 1.25rem;
    border: 4px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    box-shadow: 4px 4px 0 #111;
    font-family: 'IBM Plex Mono', monospace;
    transition: transform 0.1s;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    transform: translate(-2px, -2px);
    border-color: #111;
  }

  .divider-cross {
    text-align: center;
    position: relative;
    margin: 1.5rem 0;
    font-size: 2rem;
    font-weight: 900;
  }
  .divider-cross::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 4px;
    background: #111;
    z-index: 0;
  }
  .cross-icon {
    position: relative;
    z-index: 1;
    background: #fff;
    padding: 0 1rem;
    border: 4px solid #111;
    border-radius: 50%;
    aspect-ratio: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    line-height: 1;
    margin: 0 auto;
    font-family: 'Segoe UI Emoji', sans-serif;
  }

  .action-row {
    margin-top: 2rem;
  }
  .brutal-action-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 1rem;
    width: 100%;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn.primary {
    background: #4b7bff;
    color: white;
    font-family: 'Noto Sans SC', 'Syne', sans-serif;
    text-transform: uppercase;
  }
  .brutal-action-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-action-btn:active:not(:disabled) {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-action-btn:disabled {
    background: #eee;
    color: #999;
    cursor: not-allowed;
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
    border-color: #999;
  }

  .disclaimer-brutal {
    border: 4px dashed #111;
    padding: 1.5rem;
    background: #fdfae5;
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.6;
  }
  .disclaimer-brutal strong {
    display: block;
    font-size: 1.2rem;
    color: #ff4b4b;
    margin-bottom: 0.5rem;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 900;
  }
  .disclaimer-brutal p {
    margin: 0 0 0.5rem;
  }

  .mt-8 {
    margin-top: 2rem;
  }
  .footer {
    text-align: center;
    font-weight: 900;
  }

  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2.2rem;
    }
    .padding-large {
      padding: 1.5rem;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-input {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0 #2a4eb2;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }

  [data-theme='dark'] .divider-cross::before {
    background: #eee;
  }
  [data-theme='dark'] .cross-icon {
    background: #111;
    border-color: #eee;
  }

  [data-theme='dark'] .brutal-action-btn {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    box-shadow: 6px 6px 0 #eee;
    background: #2a4eb2;
  }
  [data-theme='dark'] .brutal-action-btn.primary:hover:not(:disabled) {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:disabled {
    background: #333;
    color: #666;
    border-color: #666;
    box-shadow: none;
  }

  [data-theme='dark'] .disclaimer-brutal {
    background: #3a2a00;
    border-color: #eee;
  }
  [data-theme='dark'] .disclaimer-brutal strong {
    color: #ff8b8b;
  }
</style>
