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
      <h1 class="page-title">关于本站</h1>

      <section class="content-section">
        <h2>网站介绍</h2>
        <p>LRM工具箱是一个免费、开源的实用工具集合网站，旨在为开发者和日常用户提供便捷高效的在线工具服务。</p>
        <p>我们的目标是让每个人都能快速找到并使用所需的工具，无需下载安装，打开浏览器即可使用。</p>
      </section>

      <section class="content-section">
        <h2>主要功能</h2>
        <ul>
          <li><strong>开发工具</strong> - JSON 格式化、正则测试、颜色选择器等</li>
          <li><strong>编码转换</strong> - Base64、URL 编解码、MD5 哈希等</li>
          <li><strong>图片处理</strong> - 图片压缩、二维码生成等</li>
          <li><strong>文本工具</strong> - 文本对比、Markdown 预览等</li>
          <li><strong>计算工具</strong> - 时间戳转换等</li>
        </ul>
      </section>

      <section class="content-section">
        <h2>技术栈</h2>
        <div class="tech-tags">
          <span class="tech-tag">Vue 3</span>
          <span class="tech-tag">Vite</span>
          <span class="tech-tag">Element Plus</span>
          <span class="tech-tag">Pinia</span>
        </div>
      </section>

      <section id="contact" class="content-section">
        <h2>联系我们</h2>
        <p>如有任何问题或建议，欢迎通过以下方式联系我们：</p>
        <ul>
          <li>网站：<a href="https://www.lrm123.site" target="_blank">www.lrm123.site</a></li>
          <li>邮箱：<a href="mailto:powelabraham67@gmail.com">powelabraham67@gmail.com</a></li>
          <li>GitHub：<a href="https://github.com/van104/LRM-Toolbox" target="_blank">github.com/van104/LRM-Toolbox</a>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ArrowLeft } from '@element-plus/icons-vue'
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
  margin-bottom: 2rem;
  text-align: center;
}

.content-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.content-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #06b6d4;
  display: inline-block;
}

.content-section p {
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 0.75rem;
}

.content-section ul {
  list-style: none;
  padding: 0;
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

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tech-tag {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #06b6d4, #8b5cf6);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}


[data-theme="dark"] .page-container {
  background: var(--bg-primary);
}

[data-theme="dark"] .page-header {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

[data-theme="dark"] .el-button {
  color: var(--text-primary);
}

[data-theme="dark"] .el-button:hover {
  color: var(--accent-cyan);
}

[data-theme="dark"] .page-title {
  color: var(--text-primary);
}

[data-theme="dark"] .content-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

[data-theme="dark"] .content-section h2 {
  color: var(--text-primary);
}

[data-theme="dark"] .content-section p,
[data-theme="dark"] .content-section li {
  color: var(--text-secondary);
}
</style>
