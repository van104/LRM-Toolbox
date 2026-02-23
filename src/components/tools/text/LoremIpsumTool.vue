<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">乱数假文<span>生成器()</span></h1>
        <div class="badge">📝 Lorem Ipsum</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <!-- Settings Pane -->
          <section class="brutal-pane side-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">1. 生成设置 (SETTINGS)</span>
            </div>
            <div class="settings-content">
              <div class="control-group">
                <label class="group-label">生成内容数量: {{ config.count }}</label>
                <div class="range-wrapper">
                  <input
                    v-model.number="config.count"
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    class="brutal-slider"
                    @input="generate"
                  />
                  <span class="range-val">{{ config.count }}</span>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="control-group">
                <label class="group-label">文本语言/风格</label>
                <div class="radio-buttons">
                  <label class="radio-label">
                    <input v-model="config.type" type="radio" value="latin" @change="generate" />
                    <span class="radio-box">
                      <b>经典拉丁语</b>
                      <small>最经典的占位文本</small>
                    </span>
                  </label>
                  <label class="radio-label">
                    <input v-model="config.type" type="radio" value="chinese" @change="generate" />
                    <span class="radio-box">
                      <b>中文互联网</b>
                      <small>充满互联网黑话和词语</small>
                    </span>
                  </label>
                  <label class="radio-label">
                    <input v-model="config.type" type="radio" value="geek" @change="generate" />
                    <span class="radio-box">
                      <b>程序员极客</b>
                      <small>技术术语和梗</small>
                    </span>
                  </label>
                </div>
              </div>

              <div class="divider-h"></div>

              <div class="control-group">
                <label class="group-label">生成单位</label>
                <div class="radio-buttons compact-radio-group">
                  <label class="radio-label">
                    <input v-model="config.unit" type="radio" value="para" @change="generate" />
                    <span class="radio-box"><b>段落</b></span>
                  </label>
                  <label class="radio-label">
                    <input v-model="config.unit" type="radio" value="sent" @change="generate" />
                    <span class="radio-box"><b>句子</b></span>
                  </label>
                  <label class="radio-label">
                    <input v-model="config.unit" type="radio" value="word" @change="generate" />
                    <span class="radio-box"><b>字词</b></span>
                  </label>
                </div>
              </div>

              <div v-if="config.type === 'latin'" class="control-group" style="margin-top: 1rem">
                <label class="checkbox-label">
                  <input v-model="config.startWithLorem" type="checkbox" @change="generate" /> 以
                  "Lorem ipsum" 开头
                </label>
              </div>
            </div>
          </section>

          <!-- Working Area -->
          <div class="work-area">
            <!-- Action bar -->
            <div class="action-top-bar">
              <button class="brutal-btn min-btn bg-pink text-white" @click="generate">
                🔄 重新生成
              </button>
            </div>

            <!-- Output pane -->
            <section class="brutal-pane output-pane">
              <div class="pane-header bg-blue text-white">
                <span class="panel-title">2. 生成结果 (OUTPUT)</span>
                <div class="panel-actions">
                  <span v-if="resultStats.words || resultStats.paras" class="count-badge">
                    约 {{ resultStats.words }} 字 | {{ resultStats.paras }} 段
                  </span>
                  <button class="brutal-btn icon-btn execute-btn text-dark" @click="copyResult">
                    📋 复制结果
                  </button>
                </div>
              </div>

              <div class="result-area">
                <div class="paragraphs-list">
                  <div v-for="(p, i) in paragraphs" :key="i" class="para-item">
                    {{ p }}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section class="tips-section brutal-border-box mt-4">
          <div class="tips-header">
            <span class="tips-icon">💡</span>
            <h3>关于 Lorem Ipsum</h3>
          </div>
          <div class="tips-content">
            <p><b>经典用法:</b> 拉丁语版本自 1500年代以来一直是印刷和排版行业的标准占位文本。</p>
            <p>
              <b>设计意义:</b>
              使用乱数假文可以让设计师在真实内容准备好之前，专注于页面布局和视觉效果测试，排除真实文字带来的视觉干扰。
            </p>
            <p>
              <b>中文黑话:</b>
              包含了互联网流行语和现代汉语常用词汇，更适合中国互联网产品的排版演示。
            </p>
            <p>
              <b>极客术语:</b>
              包含了编程领域的流行术语和计算机词汇，适合IT技术类网站或开发工具类UI演示。
            </p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const config = reactive({
    type: 'latin',
    unit: 'para',
    count: 3,
    startWithLorem: true
  });

  const paragraphs = ref([]);

  const latinWords = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'ut',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'ut',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'dolor',
    'in',
    'reprehenderit',
    'in',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'dolore',
    'eu',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'in',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum'
  ];

  const chineseWords = [
    '我们在',
    '互联网',
    '时代',
    '创新',
    '赋能',
    '生态',
    '闭环',
    '痛点',
    '打法',
    '差异化',
    '拉通',
    '对齐',
    '颗粒度',
    '复盘',
    '落地',
    '共建',
    '方案',
    '场景',
    '协同',
    '反哺',
    '沉淀',
    '方法论',
    '规模化',
    '底层逻辑',
    '抓手',
    '引爆点',
    '快速迭代',
    '资源整合',
    '流量红利',
    '组合拳',
    '顶层设计',
    '短板',
    '长板',
    '生命周期',
    '可持续发展',
    '降本增效',
    '高质量',
    '全方位',
    '纵深',
    '广度',
    '维度',
    '矩阵'
  ];

  const geekWords = [
    'Git',
    'GitHub',
    'Vim',
    'IDE',
    'API',
    'Frontend',
    'Backend',
    'Fullstack',
    'Stack Overflow',
    'Bug',
    'Feature',
    'Refactor',
    'Deploy',
    'Container',
    'Docker',
    'K8s',
    'Azure',
    'AWS',
    'Google Cloud',
    'DevOps',
    'AI',
    'Machine Learning',
    'Big Data',
    'Blockchain',
    'NFT',
    'Serverless',
    'React',
    'Vue',
    'Angular',
    'Python',
    'Rust',
    'Golang',
    'Java',
    'C++',
    'Script',
    'Runtime',
    'Compilation',
    'Database',
    'SQL',
    'NoSQL',
    'Redis',
    'ElasticSearch',
    'Microservices'
  ];

  const generateContent = () => {
    const words =
      config.type === 'latin' ? latinWords : config.type === 'chinese' ? chineseWords : geekWords;
    const result = [];

    if (config.unit === 'para') {
      for (let i = 0; i < config.count; i++) {
        let p = '';
        const sentenceCount = Math.floor(Math.random() * 5) + 3;
        for (let j = 0; j < sentenceCount; j++) {
          p += generateSentence(words) + ' ';
        }
        if (i === 0 && config.type === 'latin' && config.startWithLorem) {
          p = 'Lorem ipsum dolor sit amet. ' + p.substring(p.indexOf(' ') + 1);
        }
        result.push(p.trim());
      }
    } else if (config.unit === 'sent') {
      let s = '';
      for (let i = 0; i < config.count; i++) {
        s += generateSentence(words) + ' ';
      }
      result.push(s.trim());
    } else {
      let w = '';
      for (let i = 0; i < config.count; i++) {
        w += words[Math.floor(Math.random() * words.length)] + (config.type === 'latin' ? ' ' : '');
      }
      result.push(w.trim());
    }

    return result;
  };

  const generateSentence = words => {
    const wordCount = Math.floor(Math.random() * 10) + 5;
    let sentence = '';
    for (let i = 0; i < wordCount; i++) {
      sentence +=
        words[Math.floor(Math.random() * words.length)] + (config.type === 'latin' ? ' ' : '');
    }
    sentence = sentence.trim();
    if (config.type === 'latin') {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    } else {
      sentence += '。';
    }
    return sentence;
  };

  const generate = () => {
    paragraphs.value = generateContent();
  };

  const resultStats = computed(() => {
    const text = paragraphs.value.join('\n');
    return {
      words: text.replace(/\s/g, '').length,
      paras: paragraphs.value.length
    };
  });

  const copyResult = () => {
    const text = paragraphs.value.join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('复制成功');
    });
  };

  onMounted(() => {
    generate();
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }

  .brutal-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover:not(:disabled) {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }

  .brutal-btn:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .min-btn {
    padding: 0.8rem 1.6rem;
    font-size: 1.1rem;
    box-shadow: 6px 6px 0px #111;
  }

  .min-btn:hover:not(:disabled) {
    box-shadow: 6px 6px 0px #111;
    transform: none;
  }

  .badge {
    background: #111;
    color: #ff4b4b;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 3px solid #ff4b4b;
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .brutal-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 2rem;
    align-items: stretch;
    min-height: 600px;
  }

  @media (max-width: 900px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
  }

  .brutal-pane {
    border: 3px solid #111;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .side-pane {
    background: #fdfae5;
  }

  .pane-header {
    padding: 1rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .text-white {
    color: #fff;
  }

  .panel-actions {
    display: flex;
    gap: 0.8rem;
    align-items: center;
  }

  .icon-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-family: 'Noto Sans SC', sans-serif;
    box-shadow: 2px 2px 0px #111;
  }

  .icon-btn:hover {
    box-shadow: 3px 3px 0px #111;
  }

  .execute-btn,
  .text-dark.execute-btn {
    background: #fff;
    color: #111;
  }

  .execute-btn:hover:not(:disabled),
  .text-dark.execute-btn:hover:not(:disabled) {
    background: #ffd900;
    color: #111;
  }

  .count-badge {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    font-weight: bold;
    border: 2px solid #fff;
  }

  .work-area {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .action-top-bar {
    display: flex;
    align-items: center;
  }

  .output-pane {
    flex: 1;
  }

  .result-area {
    flex: 1;
    padding: 1.5rem;
    background: #fdfdfd;
    overflow-y: auto;
  }

  .paragraphs-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .para-item {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #111;
    font-family: 'Noto Sans SC', serif;
    padding: 1.5rem;
    background: #fff;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    word-wrap: break-word;
  }

  .para-item:nth-child(even) {
    background: #f8fafc;
  }

  /* Settings Panel Styles */
  .settings-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .group-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: #111;
    margin-bottom: 0.8rem;
    display: block;
  }

  .divider-h {
    height: 3px;
    background: #111;
    width: 100%;
  }

  .range-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .brutal-slider {
    flex: 1;
    -webkit-appearance: none;
    height: 10px;
    background: #111;
    outline: none;
  }

  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 30px;
    background: #ff4b4b;
    border: 3px solid #111;
    cursor: pointer;
  }

  .range-val {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    font-size: 1.2rem;
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.8rem;
  }

  .radio-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .compact-radio-group {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .radio-label {
    cursor: pointer;
    user-select: none;
  }

  .radio-label input {
    display: none;
  }

  .radio-box {
    display: flex;
    flex-direction: column;
    padding: 0.8rem;
    background: #fff;
    border: 3px solid #111;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    min-width: 80px;
  }

  .compact-radio-group .radio-box {
    padding: 0.6rem 1rem;
    text-align: center;
  }

  .radio-box b {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
  }

  .radio-box small {
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 0.8rem;
    color: #555;
    margin-top: 0.2rem;
  }

  .radio-label input:checked + .radio-box {
    background: #111;
    color: #fff;
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px #ff4b4b;
  }

  .radio-label input:checked + .radio-box small {
    color: #ccc;
  }

  .checkbox-label {
    font-size: 1rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-label input[type='checkbox'] {
    appearance: none;
    background-color: #fff;
    width: 24px;
    height: 24px;
    border: 3px solid #111;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .checkbox-label input[type='checkbox']:checked {
    background-color: #111;
  }

  .checkbox-label input[type='checkbox']:checked::after {
    content: '✖';
    color: #ffd900;
    font-size: 16px;
  }

  .brutal-border-box {
    border: 3px solid #111;
    background: #fff;
    padding: 2rem;
    box-shadow: 6px 6px 0px #111;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .tips-header h3 {
    margin: 0;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.5rem;
    font-weight: 900;
    color: #111;
    text-transform: uppercase;
  }

  .tips-icon {
    font-size: 2rem;
  }

  .tips-content p {
    margin-bottom: 1rem;
    color: #111;
    font-size: 1rem;
    line-height: 1.6;
    font-family: 'Noto Sans SC', sans-serif;
  }

  .tips-content p b {
    color: #ff4b4b;
    font-size: 1.05rem;
  }

  /* Dark theme */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-border-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .side-pane {
    background: #222;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .result-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .group-label {
    color: #eee;
  }
  [data-theme='dark'] .divider-h {
    background: #eee;
  }
  [data-theme='dark'] .brutal-slider {
    background: #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }
  [data-theme='dark'] .radio-box {
    background: #1a1a1a;
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .radio-box small {
    color: #aaa;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .radio-label input:checked + .radio-box small {
    color: #333;
  }
  [data-theme='dark'] .checkbox-label {
    color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox'] {
    border-color: #eee;
    background-color: #1a1a1a;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked {
    background-color: #eee;
  }
  [data-theme='dark'] .checkbox-label input[type='checkbox']:checked::after {
    color: #111;
  }
  [data-theme='dark'] .para-item {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .para-item:nth-child(even) {
    background: #111;
  }
  [data-theme='dark'] .tips-content p {
    color: #eee;
  }
  [data-theme='dark'] .tips-header h3 {
    color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .execute-btn,
  [data-theme='dark'] .text-dark.execute-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .execute-btn:hover:not(:disabled),
  [data-theme='dark'] .text-dark.execute-btn:hover:not(:disabled) {
    background: #ffd900;
  }
  [data-theme='dark'] .count-badge {
    border-color: #111;
  }
</style>
