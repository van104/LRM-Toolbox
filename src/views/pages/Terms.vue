<template>
  <div class="brutal-page-container">
    <header class="brutal-page-header">
      <button class="brutal-btn-secondary" @click="$router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回首页
      </button>
    </header>

    <main class="brutal-page-content">
      <h1 class="brutal-page-title">服务条款</h1>
      <div class="update-stamp">最后更新时间：2026年2月25日</div>

      <section class="brutal-content-section bg-yellow">
        <h2 class="section-title">1. 服务说明</h2>
        <p>
          LRM工具箱（以下简称"本站"）是一个免费、开源的在线工具集合平台，为用户提供涵盖开发运维、文本处理、图片视频、PDF
          处理、设计辅助、金融理财、健康运动、生活常用、教育学习、趣味玩法等10大类别共 255+
          种实用工具。
        </p>
        <p>本站保留随时修改、中断或终止部分或全部服务的权利，无需事先通知。</p>
      </section>

      <section class="brutal-content-section bg-blue text-white">
        <h2 class="section-title variant-light">2. 使用规范</h2>
        <p>在使用本站服务时，您同意：</p>
        <ul>
          <li>遵守中华人民共和国相关法律法规</li>
          <li>不得利用本站工具从事任何违法活动</li>
          <li>不得对本站进行恶意攻击或干扰</li>
          <li>不得滥用本站资源影响其他用户正常使用</li>
          <li>不得利用本站工具生成或传播违规内容</li>
        </ul>
      </section>

      <section class="brutal-content-section bg-pink text-white">
        <h2 class="section-title variant-light">3. 知识产权</h2>
        <p>本站的所有内容，包括但不限于文字、图片、代码、界面设计等，均受知识产权法保护。</p>
        <p>
          本站项目代码基于开源协议在 GitHub 发布，您可以依据相关开源协议的条款使用、修改和分发代码。
        </p>
        <p>未经许可，不得将本站品牌标识、界面设计等用于商业目的或误导性用途。</p>
      </section>

      <section class="brutal-content-section bg-green">
        <h2 class="section-title">4. 免责声明</h2>
        <ul>
          <li>本站工具按"现状"提供，不保证完全准确或适合特定用途</li>
          <li>涉及健康、财务类工具的计算结果仅供参考，不构成任何专业医疗或财务建议</li>
          <li>对于使用本站工具产生的任何直接或间接损失，本站不承担责任</li>
          <li>本站不对第三方链接或外部资源的内容负责</li>
          <li>因网络传输、系统故障等不可抗力导致的数据丢失，本站不承担责任</li>
        </ul>
      </section>

      <section class="brutal-content-section">
        <h2 class="section-title">5. 用户数据</h2>
        <p>本站大部分工具完全在浏览器端运行，您处理的数据不会上传至服务器。</p>
        <p>您在本站产生的收藏、历史记录等偏好数据仅存储在您的浏览器本地，本站无法访问。</p>
        <p>
          详细的数据处理方式请参阅我们的<router-link to="/privacy" class="brutal-inline-link"
            >隐私政策</router-link
          >。
        </p>
      </section>

      <section class="brutal-content-section bg-yellow">
        <h2 class="section-title">6. 条款修改与联系</h2>
        <p>
          本站保留随时修改本服务条款的权利。修改后的条款将在本页面公布，继续使用本站服务即表示您接受修改后的条款。
        </p>
        <p>如对本服务条款有任何疑问，请通过以下方式联系：</p>
        <ul>
          <li>邮箱：powelabraham67@gmail.com</li>
          <li>GitHub Issues：github.com/van104/LRM-Toolbox/issues</li>
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
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: -1px;
    text-shadow: 5px 5px 0px #00e572;
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
    box-shadow: 4px 4px 0px #00e572;
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

  .brutal-inline-link {
    color: inherit;
    background: #111;
    color: #fff;
    padding: 2px 8px;
    font-weight: bold;
    border: 2px solid #111;
    text-decoration: none;
    transition: all 0.2s;
  }

  .brutal-inline-link:hover {
    background: #4b7bff;
    box-shadow: 3px 3px 0px #111;
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
    text-shadow: 5px 5px 0px #00994c;
  }
  [data-theme='dark'] .update-stamp {
    background: #eee;
    color: #111;
    border-color: #111;
    box-shadow: 4px 4px 0px #00994c;
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
