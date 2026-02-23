<template>
  <div class="brutal-page-container">
    <header class="brutal-page-header">
      <button class="brutal-btn-secondary" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回首页
      </button>
    </header>

    <main class="brutal-page-content">
      <h1 class="brutal-page-title">隐私政策</h1>
      <div class="update-stamp">最后更新时间：2026年1月29日</div>

      <section class="brutal-content-section bg-blue text-white">
        <h2 class="section-title variant-light">1. 信息收集</h2>
        <p>
          本网站是一个纯前端工具网站，绝大多数工具都在您的浏览器本地运行，我们不会收集、存储或传输您的任何个人数据。
        </p>
        <p>
          对于需要服务器处理的少数工具，我们仅在处理过程中临时使用您的数据，处理完成后立即删除，不会保留任何副本。
        </p>
      </section>

      <section class="brutal-content-section bg-yellow">
        <h2 class="section-title">2. Cookie 使用</h2>
        <p>
          我们使用本地存储（localStorage）来保存您的偏好设置，如主题模式等。这些数据仅存储在您的浏览器中。
        </p>
      </section>

      <section class="brutal-content-section bg-pink text-white">
        <h2 class="section-title variant-light">3. 第三方服务</h2>
        <p>本网站可能使用以下第三方服务：</p>
        <ul>
          <li>Google Fonts - 用于加载网页字体</li>
          <li>CDN 服务 - 用于加速静态资源加载</li>
        </ul>
        <p>这些服务可能会收集匿名的使用统计信息，详情请参阅相关服务的隐私政策。</p>
      </section>

      <section class="brutal-content-section bg-green">
        <h2 class="section-title">4. 数据收集与安全</h2>
        <p>大多数工具都在您的浏览器本地运行，不会上传数据。</p>
        <p>对于部分需要云端服务的工具（如在线音频库）：</p>
        <ul>
          <li>我们会收集您上传的文件及相关元数据。</li>
          <li>我们会通过 HTTPS 加密传输并在服务器端采取安全措施保护您的数据。</li>
          <li>除非法律要求，我们不会向第三方分享您的个人数据。</li>
        </ul>
      </section>

      <section class="brutal-content-section">
        <h2 class="section-title">5. 政策更新</h2>
        <p>我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，建议您定期查阅。</p>
      </section>

      <section class="brutal-content-section bg-yellow">
        <h2 class="section-title">6. 联系我们</h2>
        <p>如有任何隐私相关问题，请直接联系网站管理员。</p>
      </section>
    </main>
  </div>
</template>

<script setup>
  import { ArrowLeft } from '@element-plus/icons-vue';
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-page-container {
    min-height: 100vh;
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
    padding-bottom: 4rem;
  }

  .brutal-page-header {
    background: #fff;
    padding: 1.5rem 2rem;
    border-bottom: 4px solid #111;
    box-shadow: 0px 8px 0px #111;
    position: relative;
    z-index: 10;
  }

  .brutal-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #fff;
    border: 4px solid #111;
    padding: 0.5rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
    color: #111;
  }

  .brutal-btn-secondary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #4b7bff;
    color: #fff;
  }
  .brutal-btn-secondary:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-page-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 4rem 2rem;
  }

  .brutal-page-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 900;
    color: #111;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: -1px;
    text-shadow: 5px 5px 0px #4b7bff;
  }

  .update-stamp {
    text-align: center;
    background: #111;
    color: #fff;
    display: table;
    margin: 0 auto 3rem;
    padding: 4px 12px;
    font-weight: bold;
    border: 2px dashed #fff;
    box-shadow: 4px 4px 0px #4b7bff;
  }

  .brutal-content-section {
    border: 4px solid #111;
    padding: 2.5rem;
    margin-bottom: 3rem;
    box-shadow: 8px 8px 0px #111;
    position: relative;
    transition: transform 0.2s;
  }

  .brutal-content-section:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #111;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #111;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }

  .text-white {
    color: #fff;
  }

  .section-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    display: inline-block;
    background: #111;
    color: #fff;
    padding: 0.5rem 1rem;
    border: 3px solid #111;
  }

  .section-title.variant-light {
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
  }

  .brutal-content-section p {
    font-size: 1.1rem;
    line-height: 1.8;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .brutal-content-section ul {
    list-style: none;
    padding: 0;
  }

  .brutal-content-section li {
    font-size: 1.1rem;
    line-height: 2;
    padding-left: 2rem;
    position: relative;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .brutal-content-section li::before {
    content: '[!]';
    font-weight: 900;
    position: absolute;
    left: 0;
  }

  .brutal-footer-stamp {
    text-align: center;
    font-weight: bold;
    padding: 2rem;
    border-top: 4px dashed #111;
    margin-top: 3rem;
  }

  /* --- Dark Mode Overrides --- */
  [data-theme='dark'] .brutal-page-container {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-page-header {
    background: #1a1a1a;
    border-bottom-color: #eee;
    box-shadow: 0px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-page-title {
    color: #eee;
    text-shadow: 5px 5px 0px #2a4eb2;
  }
  [data-theme='dark'] .update-stamp {
    background: #eee;
    color: #111;
    border-color: #111;
    box-shadow: 4px 4px 0px #2a4eb2;
  }

  [data-theme='dark'] .brutal-btn-secondary {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary:hover {
    background: #b28f00;
    color: #fff;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn-secondary:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-content-section {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-content-section:hover {
    box-shadow: 12px 12px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .section-title {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .section-title.variant-light {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-footer-stamp {
    border-top-color: #eee;
  }
</style>
