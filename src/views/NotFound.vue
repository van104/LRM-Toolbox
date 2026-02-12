<template>
  <div class="not-found-page">
    <div class="content">
      <div class="error-code">404</div>
      <h1 class="error-title">{{ t('notFound.title') }}</h1>
      <p class="error-desc">{{ t('notFound.desc') }}</p>
      <el-button type="primary" size="large" @click="$router.push('/')">
        <el-icon>
          <HomeFilled />
        </el-icon>
        {{ t('notFound.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';
  import { HomeFilled } from '@element-plus/icons-vue';

  const { t } = useI18n();
</script>

<style scoped>
  .not-found-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary, #f8fafc);
    padding: 2rem;
  }

  .content {
    text-align: center;
    max-width: 500px;
  }

  .error-code {
    font-size: 8rem;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }

  .error-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary, #1e293b);
    margin-bottom: 0.75rem;
  }

  .error-desc {
    font-size: 1rem;
    color: var(--text-secondary, #64748b);
    margin-bottom: 2rem;
    line-height: 1.6;
  }
</style>
