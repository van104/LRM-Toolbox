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
        <h1 class="tool-title">文案美化润色助手</h1>
        <span class="tool-subtitle">Text Polisher</span>
      </div>
      <div class="header-right">
        <!-- Placeholder -->
      </div>
    </header>

    <main class="tool-content">
      <div class="main-container">
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <div class="input-panel">
              <h3>原始文案</h3>
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="15"
                placeholder="请输入需要润色的文案..."
                resize="none"
              />
              <div class="options mt-4">
                <el-form label-position="top">
                  <el-form-item label="选择风格">
                    <el-radio-group v-model="style">
                      <el-radio-button label="business">商务专业</el-radio-button>
                      <el-radio-button label="humor">幽默风趣</el-radio-button>
                      <el-radio-button label="literary">文艺清新</el-radio-button>
                      <el-radio-button label="simple">简洁明了</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-form>
                <el-button type="primary" class="w-full" :loading="isPolishing" @click="polishText">
                  <el-icon class="mr-2"><MagicStick /></el-icon> 开始润色
                </el-button>
              </div>
            </div>
          </el-col>

          <el-col :span="12" :xs="24">
            <div class="output-panel">
              <h3>润色结果 (模拟)</h3>
              <div class="result-box">
                <div v-if="!outputText" class="placeholder">
                  <el-empty description="润色结果将显示在这里" />
                </div>
                <div v-else class="result-content">
                  {{ outputText }}
                </div>
              </div>
              <div v-if="outputText" class="actions mt-4">
                <el-button @click="copyResult">复制结果</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 文案美化润色助手</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ArrowLeft, MagicStick } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';
  import { ElMessage } from 'element-plus';

  const inputText = ref('');
  const outputText = ref('');
  const style = ref('business');
  const isPolishing = ref(false);
  const { copyToClipboard } = useCopy();

  const polishText = () => {
    if (!inputText.value.trim()) {
      ElMessage.warning('请输入文案');
      return;
    }

    isPolishing.value = true;
    outputText.value = '';

    // Simulate API call
    setTimeout(() => {
      const text = inputText.value.trim();
      let polished = '';

      // Mock logic: Apply simple transformations based on style
      switch (style.value) {
        case 'business':
          polished = `尊敬的合作伙伴：\n\n关于您提到的事项，我们经过深入研讨，认为：\n${text}\n\n期待与您达成共识，共创双赢局面。\n\n顺颂商祺。`;
          break;
        case 'humor':
          polished = `哎呀，听说大家对这个感兴趣：\n${text}\n\n是不是觉得很有意思？哈哈，我也这么觉得！如果不服，来打我呀~ (开玩笑的)`;
          break;
        case 'literary':
          polished = `时光荏苒，岁月静好。\n${text}\n\n愿所有的美好都如期而至，愿所有的幸运都不期而遇。`;
          break;
        case 'simple':
          polished = `简而言之：\n${text}\n\n以上。`;
          break;
        default:
          polished = text;
      }

      outputText.value = polished;
      isPolishing.value = false;
      ElMessage.success('润色完成');
    }, 1000);
  };

  const copyResult = () => {
    copyToClipboard(outputText.value);
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
    max-width: 1200px;
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

  .input-panel,
  .output-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  h3 {
    margin-bottom: 1rem;
    color: var(--el-text-color-primary);
  }

  .result-box {
    flex: 1;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 1rem;
    min-height: 380px;
    background-color: var(--el-bg-color-page);
    overflow-y: auto;
  }

  .result-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .w-full {
    width: 100%;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .mr-2 {
    margin-right: 0.5rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 768px) {
    .el-col {
      margin-bottom: 2rem;
    }
  }
</style>
