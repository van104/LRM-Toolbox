<template>
  <div v-if="hasError" class="error-boundary-container">
    <div class="glass-card error-card">
      <el-result icon="error" title="应用遇到了一点问题" :sub-title="error?.message || '未知错误'">
        <template #extra>
          <div class="action-buttons">
            <el-button type="primary" @click="retry">
              <el-icon class="mr-1"><Refresh /></el-icon>
              重新加载
            </el-button>
            <el-button @click="goHome">
              <el-icon class="mr-1"><HomeFilled /></el-icon>
              返回首页
            </el-button>
            <el-button type="danger" plain @click="reportError">
              <el-icon class="mr-1"><ChatLineRound /></el-icon>
              反馈问题
            </el-button>
          </div>

          <div class="error-details-wrapper mt-6">
            <el-button link type="info" class="toggle-btn" @click="showDetails = !showDetails">
              {{ showDetails ? '收起详细信息' : '查看错误详情' }}
              <el-icon class="ml-1">
                <ArrowDown v-if="!showDetails" />
                <ArrowUp v-else />
              </el-icon>
            </el-button>

            <transition name="el-zoom-in-top">
              <div v-if="showDetails" class="code-block-wrapper">
                <div class="code-actions">
                  <el-button size="small" link @click="copyError">复制堆栈信息</el-button>
                </div>
                <pre class="error-stack">{{ error?.stack }}</pre>
              </div>
            </transition>
          </div>
        </template>
      </el-result>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
  import { ref, onErrorCaptured } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { Refresh, HomeFilled, ChatLineRound, ArrowDown, ArrowUp } from '@element-plus/icons-vue';

  const hasError = ref(false);
  const error = ref<Error | null>(null);
  const showDetails = ref(false);
  const router = useRouter();

  onErrorCaptured(err => {
    console.error('ErrorBoundary captured error:', err);
    error.value = err as Error;
    hasError.value = true;
    return false;
  });

  const retry = () => {
    hasError.value = false;
    error.value = null;
    window.location.reload();
  };

  const goHome = () => {
    hasError.value = false;
    error.value = null;
    router.push('/');
  };

  const reportError = () => {
    // 跳转到反馈页面，并带上错误信息（可选）
    router.push('/about'); // 假设反馈入口在 About 或专门的 Feedback 页
    ElMessage.info('请在反馈页描述您遇到的问题');
  };

  const copyError = () => {
    if (error.value) {
      const text = `Error: ${error.value.message}\n\nStack:\n${error.value.stack}`;
      navigator.clipboard
        .writeText(text)
        .then(() => ElMessage.success('错误信息已复制到剪贴板'))
        .catch(() => ElMessage.error('复制失败'));
    }
  };
</script>

<style scoped>
  .error-boundary-container {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
  }

  .error-card {
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
    background: var(--bg-card);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .code-block-wrapper {
    margin-top: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    position: relative;
    text-align: left;
    border: 1px solid #e4e7ed;
  }

  .dark .code-block-wrapper {
    background: #1d1e1f;
    border-color: #363637;
  }

  .code-actions {
    position: absolute;
    top: 8px;
    right: 8px;
  }

  .error-stack {
    padding: 16px;
    padding-top: 32px;
    margin: 0;
    font-family: monospace;
    font-size: 12px;
    color: #f56c6c;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
  }

  .glass-card {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
</style>
