<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">变量命名转换</h1>
        <span class="tool-subtitle">Variable Name Converter</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="DocumentCopy" @click="copyAll">全部复制</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="input-section glass-card">
          <div class="section-title">
            <el-icon><EditPen /></el-icon>
            <span>输入变量名</span>
          </div>
          <el-input
            v-model="inputText"
            placeholder="输入任意格式的变量名，如: my_variable_name, myVariableName..."
            size="large"
            @input="convert"
          >
            <template #append>
              <el-button
                @click="
                  inputText = '';
                  convert();
                "
                >清空</el-button
              >
            </template>
          </el-input>
        </div>

        <div class="result-grid">
          <div
            v-for="res in results"
            :key="res.label"
            class="result-card glass-card"
            :class="{ 'has-val': res.value }"
          >
            <div class="card-header">
              <span class="type-label">{{ res.label }}</span>
              <el-button
                v-if="res.value"
                text
                size="small"
                :icon="DocumentCopy"
                @click="copyText(res.value)"
                >复制</el-button
              >
            </div>
            <div class="card-body">
              <div v-if="res.value" class="converted-val">{{ res.value }}</div>
              <div v-else class="placeholder">-</div>
            </div>
            <div class="card-footer">
              <code>{{ res.example }}</code>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>格式说明</h4>
        </div>
        <div class="tips-content">
          <div class="format-grid">
            <div class="format-item">
              <b>Camel Case (小驼峰)</b>
              <span>通常用于 JavaScript/TypeScript 中的变量和函数命名。</span>
            </div>
            <div class="format-item">
              <b>Pascal Case (大驼峰)</b>
              <span>通常用于 类名、Vue 组件名 或 React 组件名。</span>
            </div>
            <div class="format-item">
              <b>Snake Case (蛇形)</b>
              <span>通常用于 Python 变量、数据库字段名。</span>
            </div>
            <div class="format-item">
              <b>Kebab Case (短横线)</b>
              <span>通常用于 CSS 类名、URL 路径、Vue 模板中的组件标签。</span>
            </div>
            <div class="format-item">
              <b>Constant Case (常量)</b>
              <span>通常用于 全局常量、配置项命名。</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 变量命名转换</footer>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, DocumentCopy, EditPen, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputText = ref('');
  const results = ref([
    { label: 'Camel Case', value: '', example: 'myVariableName', type: 'camel' },
    { label: 'Pascal Case', value: '', example: 'MyVariableName', type: 'pascal' },
    { label: 'Snake Case', value: '', example: 'my_variable_name', type: 'snake' },
    { label: 'Kebab Case', value: '', example: 'my-variable-name', type: 'kebab' },
    { label: 'Constant Case', value: '', example: 'MY_VARIABLE_NAME', type: 'constant' },
    { label: 'Dot Case', value: '', example: 'my.variable.name', type: 'dot' }
  ]);

  const convert = () => {
    if (!inputText.value.trim()) {
      results.value.forEach(r => (r.value = ''));
      return;
    }

    // 1. 将输入解析为单词数组
    let words = [];
    const text = inputText.value.trim();

    if (text.includes('_')) {
      words = text.split('_');
    } else if (text.includes('-')) {
      words = text.split('-');
    } else if (text.includes('.')) {
      words = text.split('.');
    } else {
      // 处理驼峰
      words = text
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(/\s+/);
    }

    words = words.map(w => w.toLowerCase()).filter(w => w.length > 0);

    if (words.length === 0) return;

    // 2. 转换格式
    results.value.forEach(res => {
      switch (res.type) {
        case 'camel':
          res.value =
            words[0] +
            words
              .slice(1)
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join('');
          break;
        case 'pascal':
          res.value = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
          break;
        case 'snake':
          res.value = words.join('_');
          break;
        case 'kebab':
          res.value = words.join('-');
          break;
        case 'constant':
          res.value = words.join('_').toUpperCase();
          break;
        case 'dot':
          res.value = words.join('.');
          break;
      }
    });
  };

  const copyText = text => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制');
    });
  };

  const copyAll = () => {
    const all = results.value
      .filter(r => r.value)
      .map(r => `${r.label}: ${r.value}`)
      .join('\n');
    if (!all) return;
    navigator.clipboard.writeText(all).then(() => {
      ElMessage.success('全部结果已复制');
    });
  };

  onMounted(() => {
    inputText.value = 'user_login_count';
    convert();
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

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 1rem;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .result-card {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .result-card.has-val {
    border-color: #3b82f6;
    background: #f0f7ff;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .type-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
  }

  .card-body {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
  }

  .converted-val {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    font-family: 'JetBrains Mono', monospace;
    word-break: break-all;
  }

  .placeholder {
    color: #cbd5e1;
  }

  .card-footer {
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
  }

  .card-footer code {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .tips-section {
    padding: 1.5rem 2rem;
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

  .format-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .format-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .format-item b {
    font-size: 0.9rem;
    color: #1e293b;
  }

  .format-item span {
    font-size: 0.85rem;
    color: #64748b;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 900px) {
    .result-grid {
      grid-template-columns: 1fr 1fr;
    }
    .format-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .result-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
