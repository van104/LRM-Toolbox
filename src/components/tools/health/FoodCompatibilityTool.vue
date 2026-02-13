<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>食材相克简易参考</h1>
        <span class="nav-subtitle">Food Combination Compatibility</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="form-container">
          <div class="input-group">
            <label>食材 A</label>
            <input
              v-model="foodA"
              type="text"
              placeholder="例如: 螃蟹"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="divider">
            <span class="cross">⚡</span>
          </div>

          <div class="input-group">
            <label>食材 B</label>
            <input
              v-model="foodB"
              type="text"
              placeholder="例如: 柿子"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="action-row">
            <button class="search-btn" :disabled="!foodA || !foodB" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询相克/宜忌
            </button>
          </div>
        </div>

        <div class="disclaimer">
          <el-icon class="icon"><Warning /></el-icon>
          <div class="text">
            <h4>科学提示</h4>
            <p>
              “食物相克”主要源于传统民间说法，现代营养学研究表明，绝大多数所谓的“相克”其实是由于食物不洁、过敏、或乳糖不耐受等原因引起的。
            </p>
            <p>本工具仅通过搜索引擎提供相关说法作为参考，请以科学认知为准，保持膳食均衡多样。</p>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 生活百科系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back, Search, Warning } from '@element-plus/icons-vue';

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
  .tool-container {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', system-ui, sans-serif;
    color: #334155;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    width: 80px;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 600px;
    margin: 4rem auto;
    padding: 0 1.5rem;
  }

  .glass-card {
    background: white;
    border-radius: 20px;
    padding: 3rem 2rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .form-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-group label {
    font-weight: 600;
    color: #475569;
  }

  .input-group input {
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1.1rem;
    outline: none;
    transition: all 0.2s;
  }

  .input-group input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 20px;
  }

  .divider::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: #e2e8f0;
  }

  .cross {
    position: relative;
    background: white;
    padding: 0 1rem;
    font-size: 1.5rem;
    font-weight: 800;
    color: #f59e0b;
  }

  .action-row {
    margin-top: 1rem;
  }

  .search-btn {
    width: 100%;
    padding: 1rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .search-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  .search-btn:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }

  .disclaimer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    background: #eff6ff;
    border: 1px solid #dbeafe;
    border-radius: 12px;
    color: #1e40af;
  }

  .disclaimer .icon {
    font-size: 1.5rem;
    margin-top: 2px;
  }

  .disclaimer h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
  }

  .disclaimer p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: #1e3a8a;
  }
  .disclaimer p + p {
    margin-top: 0.5rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
