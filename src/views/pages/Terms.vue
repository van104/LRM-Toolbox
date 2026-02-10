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
      <h1 class="page-title">服务条款</h1>
      <p class="update-time">最后更新时间：2026年1月29日</p>

      <section class="content-section">
        <h2>1. 服务说明</h2>
        <p>LRM工具箱（以下简称"本站"）是一个免费的在线工具服务平台，为用户提供各类实用工具。</p>
        <p>本站保留随时修改、中断或终止部分或全部服务的权利，无需事先通知。</p>
      </section>

      <section class="content-section">
        <h2>2. 使用规范</h2>
        <p>在使用本站服务时，您同意：</p>
        <ul>
          <li>遵守中华人民共和国相关法律法规</li>
          <li>不得利用本站工具从事任何违法活动</li>
          <li>不得对本站进行恶意攻击或干扰</li>
          <li>不得滥用本站资源影响其他用户正常使用</li>
        </ul>
      </section>

      <section class="content-section">
        <h2>3. 知识产权</h2>
        <p>本站的所有内容，包括但不限于文字、图片、代码、界面设计等，均受知识产权法保护。</p>
        <p>未经许可，不得复制、修改、传播本站内容用于商业目的。</p>
      </section>

      <section class="content-section">
        <h2>4. 免责声明</h2>
        <ul>
          <li>本站工具按"现状"提供，不保证完全准确或适合特定用途</li>
          <li>对于使用本站工具产生的任何直接或间接损失，本站不承担责任</li>
          <li>本站不对第三方链接的内容负责</li>
        </ul>
      </section>

      <section class="content-section">
        <h2>5. 条款修改</h2>
        <p>
          本站保留随时修改本服务条款的权利。修改后的条款将在本页面公布，继续使用本站服务即表示您接受修改后的条款。
        </p>
      </section>

      <section class="content-section">
        <h2>6. 联系方式</h2>
        <p>如对本服务条款有任何疑问，请直接联系网站管理员。</p>
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
