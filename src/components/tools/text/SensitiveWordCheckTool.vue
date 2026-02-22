<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">敏感词在线检测</h1>
        <span class="tool-subtitle">Sensitive Word Check</span>
      </div>
      <div class="header-right">
        <!-- Placeholder -->
      </div>
    </header>

    <main class="tool-content">
      <div class="main-container">
        <el-alert
          title="检测说明"
          type="info"
          description="本工具使用本地敏感词库进行检测，仅供参考。实际审核结果请以各平台标准为准。"
          show-icon
          :closable="false"
          class="mb-4"
        />

        <div class="input-area">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="10"
            placeholder="请输入需要检测的文本内容..."
            resize="none"
          />
        </div>

        <div class="action-bar">
          <el-button type="primary" size="large" :loading="isChecking" @click="checkText">
            开始检测
          </el-button>
          <el-button size="large" @click="clearText">清空</el-button>
        </div>

        <div v-if="hasChecked" class="result-area">
          <el-divider content-position="left">检测结果</el-divider>

          <div class="stats mb-4">
            <el-tag :type="sensitiveWords.length > 0 ? 'danger' : 'success'" size="large">
              发现敏感词: {{ sensitiveWords.length }} 个
            </el-tag>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="highlight-text" v-html="highlightedText"></div>

          <div v-if="sensitiveWords.length > 0" class="word-list mt-4">
            <h4>敏感词列表：</h4>
            <div class="tags">
              <el-tag
                v-for="(word, index) in uniqueSensitiveWords"
                :key="index"
                type="danger"
                effect="plain"
                class="mr-2 mb-2"
              >
                {{ word }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 敏感词在线检测</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const inputText = ref('');
  const isChecking = ref(false);
  const hasChecked = ref(false);
  const sensitiveWords = ref<string[]>([]);
  const highlightedText = ref('');

  // Mock sensitive dictionary
  const MOCK_DICT = [
    '暴力',
    '赌博',
    '色情',
    '违规',
    '测试敏感词',
    '私人侦探',
    '代考',
    '办证',
    '枪支',
    '毒品',
    '恐怖',
    '邪教',
    '传销',
    '高利贷'
  ];

  const uniqueSensitiveWords = computed(() => {
    return [...new Set(sensitiveWords.value)];
  });

  const checkText = () => {
    if (!inputText.value.trim()) {
      ElMessage.warning('请输入需要检测的文本');
      return;
    }

    isChecking.value = true;
    hasChecked.value = false;
    sensitiveWords.value = [];

    // Simulate processing delay
    setTimeout(() => {
      let text = inputText.value;
      const foundWords: string[] = [];

      // Simple matching
      MOCK_DICT.forEach(word => {
        if (text.includes(word)) {
          // Find all occurrences
          const regex = new RegExp(word, 'g');
          const matches = text.match(regex);
          if (matches) {
            foundWords.push(...matches);
          }
          // Highlight
          text = text.replace(regex, `<span class="sensitive-highlight">${word}</span>`);
        }
      });

      sensitiveWords.value = foundWords;
      highlightedText.value = text.replace(/\n/g, '<br/>');
      hasChecked.value = true;
      isChecking.value = false;

      if (foundWords.length === 0) {
        ElMessage.success('未发现敏感词');
      } else {
        ElMessage.warning(`发现 ${foundWords.length} 个敏感词`);
      }
    }, 500);
  };

  const clearText = () => {
    inputText.value = '';
    hasChecked.value = false;
    sensitiveWords.value = [];
    highlightedText.value = '';
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color-page);
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-center {
    text-align: center;
    flex: 1;
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .main-container {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .mb-4 {
    margin-bottom: 1rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .mr-2 {
    margin-right: 0.5rem;
  }

  .mb-2 {
    margin-bottom: 0.5rem;
  }

  .action-bar {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .highlight-text {
    padding: 1rem;
    background-color: var(--el-bg-color-page);
    border-radius: 4px;
    border: 1px solid var(--el-border-color);
    line-height: 1.6;
    min-height: 100px;
    white-space: pre-wrap;
  }

  :deep(.sensitive-highlight) {
    background-color: #f56c6c;
    color: white;
    padding: 0 2px;
    border-radius: 2px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
