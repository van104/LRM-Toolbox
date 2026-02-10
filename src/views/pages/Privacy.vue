<template>
  <div class="page-container">
    <header class="page-header">
      <el-button text @click="$router.push('/')">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回首页
      </el-button>
    </header>

    <main class="page-content">
      <h1 class="page-title">隐私政策</h1>
      <p class="update-time">最后更新时间：2026年1月29日</p>

      <section class="content-section">
        <h2>1. 信息收集</h2>
        <p>
          本网站是一个纯前端工具网站，绝大多数工具都在您的浏览器本地运行，我们不会收集、存储或传输您的任何个人数据。
        </p>
        <p>
          对于需要服务器处理的少数工具，我们仅在处理过程中临时使用您的数据，处理完成后立即删除，不会保留任何副本。
        </p>
      </section>

      <section class="content-section">
        <h2>2. Cookie 使用</h2>
        <p>
          我们使用本地存储（localStorage）来保存您的偏好设置，如主题模式等。这些数据仅存储在您的浏览器中。
        </p>
      </section>

      <section class="content-section">
        <h2>3. 第三方服务</h2>
        <p>本网站可能使用以下第三方服务：</p>
        <ul>
          <li>Google Fonts - 用于加载网页字体</li>
          <li>CDN 服务 - 用于加速静态资源加载</li>
        </ul>
        <p>这些服务可能会收集匿名的使用统计信息，详情请参阅相关服务的隐私政策。</p>
      </section>

      <section class="content-section">
        <h2>4. 数据收集与安全</h2>
        <p>大多数工具都在您的浏览器本地运行，不会上传数据。</p>
        <p>对于部分需要云端服务的工具（如在线音频库）：</p>
        <ul>
          <li>我们会收集您上传的文件及相关元数据。</li>
          <li>我们会通过 HTTPS 加密传输并在服务器端采取安全措施保护您的数据。</li>
          <li>除非法律要求，我们不会向第三方分享您的个人数据。</li>
        </ul>
      </section>

      <section class="content-section">
        <h2>5. 政策更新</h2>
        <p>我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，建议您定期查阅。</p>
      </section>

      <section class="content-section">
        <h2>6. 联系我们</h2>
        <p>如有任何隐私相关问题，请直接联系网站管理员。</p>
      </section>
    </main>
  </div>
</template>

<script setup>
  import { ArrowLeft } from '@element-plus/icons-vue';
</script>

<style scoped>
  .page-container {
    min-height: 100vh;
    background: #f0f4f8;
  }

  .page-header {
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .page-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .update-time {
    text-align: center;
    color: #94a3b8;
    font-size: 0.875rem;
    margin-bottom: 2rem;
  }

  .content-section {
    background: #ffffff;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .content-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .content-section p {
    color: #64748b;
    line-height: 1.8;
    margin-bottom: 0.75rem;
  }

  .content-section ul {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0;
  }

  .content-section li {
    color: #64748b;
    line-height: 2;
    padding-left: 1.5rem;
    position: relative;
  }

  .content-section li::before {
    content: '•';
    color: #06b6d4;
    font-weight: bold;
    position: absolute;
    left: 0;
  }

  [data-theme='dark'] .page-container {
    background: var(--bg-primary);
  }

  [data-theme='dark'] .page-header {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .el-button {
    color: var(--text-primary);
  }

  [data-theme='dark'] .el-button:hover {
    color: var(--accent-cyan);
  }

  [data-theme='dark'] .page-title {
    color: var(--text-primary);
  }

  [data-theme='dark'] .update-time {
    color: var(--text-secondary);
  }

  [data-theme='dark'] .content-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
  }

  [data-theme='dark'] .content-section h2 {
    color: var(--text-primary);
  }

  [data-theme='dark'] .content-section p,
  [data-theme='dark'] .content-section li {
    color: var(--text-secondary);
  }
</style>
