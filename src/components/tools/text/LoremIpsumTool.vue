<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">乱数假文生成器</h1>
        <span class="tool-subtitle">Lorem Ipsum Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="DocumentCopy" @click="copyResult">一键复制</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="config-section glass-card">
          <div class="config-grid">
            <div class="config-item">
              <label>文本语言/风格</label>
              <el-radio-group v-model="config.type" @change="generate">
                <el-radio-button label="latin">经典拉丁语</el-radio-button>
                <el-radio-button label="chinese">中文流行</el-radio-button>
                <el-radio-button label="geek">程序员极客</el-radio-button>
              </el-radio-group>
            </div>

            <div class="config-item">
              <label>生成单位</label>
              <el-radio-group v-model="config.unit" @change="generate">
                <el-radio-button label="para">段落</el-radio-button>
                <el-radio-button label="sent">句子</el-radio-button>
                <el-radio-button label="word">单词/字</el-radio-button>
              </el-radio-group>
            </div>

            <div class="config-item">
              <label>生成内容数量: {{ config.count }}</label>
              <el-slider v-model="config.count" :min="1" :max="50" @input="generate" />
            </div>

            <div v-if="config.type === 'latin'" class="config-item-inline">
              <el-checkbox v-model="config.startWithLorem" @change="generate"
                >以 "Lorem ipsum" 开头</el-checkbox
              >
            </div>
          </div>

          <div class="action-bar">
            <el-button size="large" type="primary" :icon="Refresh" @click="generate"
              >重新生成</el-button
            >
          </div>
        </div>

        <div class="result-section glass-card">
          <div class="result-header">
            <span>生成结果预览</span>
            <div class="stats">
              <span>约 {{ resultStats.words }} 字</span>
              <span>{{ resultStats.paras }} 段</span>
            </div>
          </div>
          <div ref="resultRef" class="result-body">
            <div v-for="(p, i) in paragraphs" :key="i" class="para">
              {{ p }}
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>关于 Lorem Ipsum</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li><b>经典用法</b>：拉丁语版本自 1500s 以来一直是行业的标准占位文本。</li>
            <li>
              <b>设计意义</b>：使用 Lorem Ipsum
              可以让设计师在内容准备好之前，专注于页面布局和视觉效果。
            </li>
            <li>
              <b>中文风格</b>：包含了互联网流行语和现代汉语常用词汇，更适合中文产品的排版演示。
            </li>
            <li><b>极客风格</b>：包含了编程领域的术语和极客文化词汇，适合IT技术类网站演示。</li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 乱数假文生成器</footer>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, DocumentCopy, Refresh, InfoFilled } from '@element-plus/icons-vue';
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
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    padding: 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .config-section {
    padding: 1.5rem;
  }

  .config-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    align-items: flex-end;
  }

  .config-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 200px;
  }

  .config-item label {
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 600;
  }

  .config-item-inline {
    padding-bottom: 5px;
  }

  .action-bar {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f1f5f9;
  }

  .result-section {
    padding: 1.5rem;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f1f5f9;
    font-weight: 600;
    color: #475569;
  }

  .stats {
    font-size: 0.8rem;
    color: #94a3b8;
    display: flex;
    gap: 1rem;
  }

  .result-body {
    font-size: 1rem;
    line-height: 1.8;
    color: #1e293b;
    height: 400px;
    overflow-y: auto;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .para {
    margin-bottom: 1.5rem;
  }

  .para:last-child {
    margin-bottom: 0;
  }

  .tips-section {
    padding: 1.5rem 2rem;
    background: linear-gradient(to bottom right, #ffffff, #f8fafc);
  }

  .tips-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #3b82f6;
  }

  .tips-header h4 {
    margin: 0;
    font-size: 1.1rem;
  }

  .premium-list {
    padding-left: 1.25rem;
    margin: 0;
  }

  .premium-list li {
    margin-bottom: 0.75rem;
    color: #475569;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
