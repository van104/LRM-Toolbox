<template>
  <div class="brutal-page-container">
    <header class="brutal-page-header">
      <button class="brutal-btn-secondary" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回主板
      </button>
    </header>

    <main class="brutal-page-content">
      <h1 class="brutal-page-title">关于本站.INFO()</h1>

      <section class="brutal-content-section bg-yellow">
        <h2 class="section-title">01 // 网站介绍</h2>
        <p>
          LRM工具箱是一个免费、开源的实用工具集合网站，旨在为开发者和日常用户提供便捷高效的在线执行工具终端。
        </p>
        <p>
          目前已上线 <strong>255+</strong> 款工具，覆盖
          <strong>10 大分类</strong>，无需下载安装，唤醒浏览器即可进入工作状态。
        </p>
      </section>

      <!-- Banner -->
      <div class="brutal-banner-wrapper">
        <div class="brutal-banner-box">
          <img
            src="/banner.png"
            alt="LRM 工具箱 - 高效实用的在线工具集合"
            class="brutal-banner-img"
          />
        </div>
      </div>

      <section class="brutal-content-section bg-blue text-white">
        <h2 class="section-title variant-light">02 // 核心总线</h2>
        <ul>
          <li>
            <strong>[DEV] 开发运维</strong> — JSON 格式化、正则测试、JWT 解析、代码美化、哈希校验
          </li>
          <li><strong>[TXT] 文本处理</strong> — 文本对比、Markdown 渲染、批量替换、字数统计</li>
          <li><strong>[IMG] 图片视频</strong> — 图片压缩、二维码生成、GIF 处理、视频格式转换</li>
          <li><strong>[PDF] PDF 处理</strong> — PDF 拆分合并、文本提取、页面操作</li>
          <li><strong>[DSG] 设计辅助</strong> — 颜色选择器、对比度检查、屏幕标尺、SVG 优化</li>
          <li><strong>[FIN] 金融理财</strong> — 房贷计算、汇率转换、养老估算、折扣计算</li>
          <li><strong>[HP] 健康运动</strong> — BMI 计算、番茄钟、脊柱锻炼、运动计时器</li>
          <li><strong>[LIFE] 生活常用</strong> — 单位换算、日期计算、节假日查询、亲戚称呼</li>
          <li><strong>[EDU] 教育学习</strong> — 打字练习、背诵辅助、知识测验</li>
          <li><strong>[FUN] 趣味玩法</strong> — 随机数生成、摩尔斯电码、白噪音、决策转盘</li>
        </ul>
      </section>

      <section class="brutal-content-section bg-green">
        <h2 class="section-title">03 // 项目特色</h2>
        <ul>
          <li><strong>[SAFE] 隐私安全</strong> — 绝大部分工具纯前端运行，数据不离开您的浏览器</li>
          <li><strong>[PWA] 离线可用</strong> — 支持渐进式 Web 应用，安装后可离线使用</li>
          <li><strong>[FAST] 极速启动</strong> — 按需异步加载，首屏秒开</li>
          <li><strong>[DARK] 深色模式</strong> — 全站支持深色/浅色模式自由切换</li>
          <li><strong>[I18N] 多语言</strong> — 支持中文与英文界面</li>
          <li><strong>[OPEN] 完全开源</strong> — 项目代码在 GitHub 开源，欢迎贡献</li>
        </ul>
      </section>

      <section class="brutal-content-section bg-pink text-white">
        <h2 class="section-title variant-light">04 // 动力栈配置</h2>
        <div class="tech-tags">
          <span class="brutal-tag">V U E 3</span>
          <span class="brutal-tag">V I T E</span>
          <span class="brutal-tag">E. L. P.</span>
          <span class="brutal-tag">P I N I A</span>
        </div>
      </section>

      <section id="contact" class="brutal-content-section bg-yellow">
        <h2 class="section-title">05 // 建立连接</h2>
        <p>如在终端调用时遇到阻碍或需要新增特性请求，请通过以下协议端口与我们通讯：</p>
        <ul>
          <li>
            [主站中继]：<a href="https://www.lrm123.site" target="_blank" class="brutal-link"
              >www.lrm123.site</a
            >
          </li>
          <li>
            [直连信箱]：<a href="mailto:powelabraham67@gmail.com" class="brutal-link"
              >powelabraham67@gmail.com</a
            >
          </li>
          <li>
            [开源仓库]：<a
              href="https://github.com/van104/LRM-Toolbox"
              target="_blank"
              class="brutal-link"
              >GITHUB/LRM-TOOLBOX</a
            >
          </li>
        </ul>
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
    margin-bottom: 3rem;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: -1px;
    text-shadow: 5px 5px 0px #ff4b4b;
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
    padding-left: 1.5rem;
    position: relative;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .brutal-content-section li::before {
    content: '>>';
    font-weight: 900;
    position: absolute;
    left: 0;
  }

  .tech-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .brutal-tag {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    padding: 1rem 1.5rem;
    background: #fff;
    color: #111;
    border: 4px solid #111;
    font-size: 1.25rem;
    font-weight: 900;
    box-shadow: 6px 6px 0px #111;
    letter-spacing: 2px;
  }

  .brutal-link {
    color: inherit;
    text-decoration: none;
    background: #111;
    color: #fff;
    padding: 2px 8px;
    font-weight: bold;
    border: 2px solid #111;
    transition: all 0.2s;
  }

  .bg-green .brutal-link:hover {
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
  }

  /* === Banner === */
  .brutal-banner-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
  }

  .brutal-banner-box {
    max-width: 600px;
    width: 100%;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    overflow: hidden;
    transition: all 0.2s;
    background: #fff;
  }

  .brutal-banner-box:hover {
    transform: translate(-3px, -3px);
    box-shadow: 11px 11px 0px #111;
  }

  .brutal-banner-img {
    width: 100%;
    height: auto;
    display: block;
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
    text-shadow: 5px 5px 0px #cc0000;
  }

  [data-theme='dark'] .brutal-banner-box {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-banner-box:hover {
    box-shadow: 11px 11px 0px #eee;
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

  [data-theme='dark'] .brutal-tag {
    background: #222;
    color: #eee;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-link {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-link:hover {
    background: #222;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
</style>
