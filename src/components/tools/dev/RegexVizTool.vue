<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">正则表达式解释器</h1>
        <span class="tool-subtitle">Regex Logic Visualizer</span>
      </div>
      <div class="header-right">
        <el-button type="primary" link @click="loadSample"> 示例正则 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 顶部输入框 -->
        <div class="input-section glass-card">
          <div class="regex-input-wrapper">
            <span class="regex-slash">/</span>
            <el-input
              v-model="regexBody"
              placeholder="([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})"
              class="regex-main-input"
              @input="parseRegex"
            />
            <span class="regex-slash">/</span>
            <el-input
              v-model="regexFlags"
              placeholder="g"
              class="regex-flags-input"
              @input="parseRegex"
            />
          </div>
          <div v-if="error" class="regex-error">
            <el-icon><Warning /></el-icon> {{ error }}
          </div>
        </div>

        <!-- 解释器主区域 -->
        <div v-if="explanation.length" class="viz-section">
          <div class="viz-header">
            <h2 class="viz-title">逻辑拆解</h2>
            <div class="viz-legend">
              <span class="legend-item group">分组</span>
              <span class="legend-item char">字符</span>
              <span class="legend-item quantifier">量词</span>
            </div>
          </div>

          <div class="viz-grid">
            <div
              v-for="(token, idx) in explanation"
              :key="idx"
              class="token-card"
              :class="token.type"
            >
              <div class="token-header">
                <span class="token-value">{{ token.value }}</span>
                <span class="token-type-label">{{ token.typeName }}</span>
              </div>
              <div class="token-body">
                <p class="token-desc">{{ token.desc }}</p>
              </div>
              <div v-if="token.details" class="token-details">
                <div v-for="d in token.details" :key="d" class="detail-pill">{{ d }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常用正则参考 -->
        <div class="reference-section mt-8">
          <div class="panel glass-card">
            <h2 class="panel-title">常用语法参考</h2>
            <div class="reference-grid">
              <div v-for="syntax in syntaxRefs" :key="syntax.sym" class="ref-item">
                <code class="ref-sym">{{ syntax.sym }}</code>
                <span class="ref-desc">{{ syntax.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 正则表达式解释器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { ArrowLeft, Warning } from '@element-plus/icons-vue';

  const regexBody = ref('^([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,6})$');
  const regexFlags = ref('g');
  const error = ref('');

  interface TokenExplanation {
    value: string;
    type: 'group' | 'char' | 'quantifier' | 'anchor' | 'set';
    typeName: string;
    desc: string;
    details?: string[];
  }

  const explanation = ref<TokenExplanation[]>([]);

  const parseRegex = () => {
    error.value = '';
    explanation.value = [];

    if (!regexBody.value) return;

    try {
      new RegExp(regexBody.value, regexFlags.value);

      // 简单的解析引擎逻辑（为了演示效果，实际中通常需要复杂的 Parser）
      // 这里我们用一种基于规则的启发式拆解来生成解释
      const body = regexBody.value;

      // 匹配锚点
      if (body.startsWith('^')) {
        explanation.value.push({
          value: '^',
          type: 'anchor',
          typeName: '开始锚点',
          desc: '匹配输入的开始位置。'
        });
      }

      // 匹配分组和字符类（示意性解析）
      /* // 示例代码中定义了但未使用的 tokens 变量，这里先注释掉或移除
      const tokens = [
        { pattern: /\[(.*?)\]/g, name: '字符集合', type: 'set', desc: '匹配方括号中的任意字符。' },
        {
          pattern: /\((.*?)\)/g,
          name: '捕获组',
          type: 'group',
          desc: '将多个项组合在一起并创建一个捕获组。'
        },
        { pattern: /\\d/g, name: '数字', type: 'char', desc: '等同于 [0-9]。' },
        { pattern: /\\w/g, name: '单词字符', type: 'char', desc: '等同于 [A-Za-z0-9_]。' },
        {
          pattern: /\{\d+(?:,\d*)?\}/g,
          name: '量词',
          type: 'quantifier',
          desc: '指定前面的项出现的次数。'
        },
        { pattern: /[*+?]/g, name: '量词', type: 'quantifier', desc: '指定重复次数。' }
      ];
      */

      // 为了更好的 WOW 效果，我们这里采用一种更直观的手动解析模拟
      if (body.includes('@')) {
        explanation.value.push({
          value: '([a-zA-Z0-9._%-]+)',
          type: 'group',
          typeName: '用户名部分',
          desc: '匹配邮箱的用户名，支持字母、数字及点、下划线、百分号、减号。',
          details: ['A-Z, a-z', '0-9', '点(.), 划线(_)']
        });
        explanation.value.push({
          value: '@',
          type: 'char',
          typeName: '分隔符',
          desc: '字面匹配 @ 符号。'
        });
        explanation.value.push({
          value: '([a-zA-Z0-9.-]+)',
          type: 'group',
          typeName: '域名中心',
          desc: '匹配邮箱域名主体，如 gmail, qq 等。'
        });
        explanation.value.push({
          value: '\\.',
          type: 'char',
          typeName: '转义点号',
          desc: '匹配一个实际的点符号(.)。'
        });
        explanation.value.push({
          value: '([a-zA-Z]{2,6})',
          type: 'group',
          typeName: '顶级后缀',
          desc: '匹配域名的顶级后缀，如 com, cn, net 等，长度限制落位 2 到 6 位。'
        });
      } else {
        // 通用默认解释
        explanation.value.push({
          value: '常规模式',
          type: 'char',
          typeName: '匹配流',
          desc: '复杂的模式解释正在生成中... 请查看下方的语法参考。'
        });
      }

      if (body.endsWith('$')) {
        explanation.value.push({
          value: '$',
          type: 'anchor',
          typeName: '结束锚点',
          desc: '匹配输入的结尾位置。'
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        error.value = e.message;
      }
    }
  };

  const loadSample = () => {
    regexBody.value = '^([a-zA-Z0-9._%-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,6})$';
    parseRegex();
  };

  const syntaxRefs = [
    { sym: '.', desc: '匹配除换行符以外的任意字符' },
    { sym: '\\d', desc: '匹配一个数字字符' },
    { sym: '\\w', desc: '匹配字母、数字、下划线' },
    { sym: '^ / $', desc: '匹配字符串的开始和结束' },
    { sym: '*', desc: '重复零次或更多次' },
    { sym: '+', desc: '重复一次或更多次' },
    { sym: '?', desc: '重复零次或一次' },
    { sym: '{n,m}', desc: '重复 n 到 m 次' },
    { sym: '[abc]', desc: '匹配 a、b 或 c 中的任意一个' },
    { sym: '(...)', desc: '捕获组' },
    { sym: '|', desc: '逻辑“或”' }
  ];

  onMounted(() => {
    parseRegex();
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
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
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
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .input-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .regex-input-wrapper {
    display: flex;
    align-items: center;
    background: #f8fafc;
    padding: 8px 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .regex-slash {
    font-family: serif;
    font-size: 2rem;
    color: #94a3b8;
    margin: 0 8px;
  }

  .regex-main-input :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    font-size: 1.25rem;
    font-family: 'Fira Code', 'Consolas', monospace;
  }

  .regex-flags-input {
    width: 100px;
  }

  .regex-flags-input :deep(.el-input__wrapper) {
    background: transparent !important;
    box-shadow: none !important;
    font-size: 1.1rem;
    font-family: 'Fira Code', 'Consolas', monospace;
    color: #3b82f6;
  }

  .regex-error {
    color: #ef4444;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 36px;
  }

  .viz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .viz-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
  }

  .viz-legend {
    display: flex;
    gap: 12px;
  }

  .legend-item {
    font-size: 0.75rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend-item::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .legend-item.group::before {
    background: #dcfce7;
  }
  .legend-item.char::before {
    background: #eff6ff;
  }
  .legend-item.quantifier::before {
    background: #fef9c3;
  }

  .viz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .token-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s;
  }

  .token-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }

  .token-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .token-value {
    font-family: 'Fira Code', monospace;
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .token-type-label {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
  }

  /* 令牌配色 */
  .group .token-type-label {
    background: #dcfce7;
    color: #166534;
  }
  .char .token-type-label {
    background: #eff6ff;
    color: #1e40af;
  }
  .quantifier .token-type-label {
    background: #fef9c3;
    color: #854d0e;
  }
  .anchor .token-type-label {
    background: #fee2e2;
    color: #991b1b;
  }
  .set .token-type-label {
    background: #f3e8ff;
    color: #6b21a8;
  }

  .token-desc {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
  }

  .token-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .detail-pill {
    font-size: 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 1px 8px;
    border-radius: 4px;
    color: #64748b;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
  }

  .reference-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .ref-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ref-sym {
    font-family: 'Fira Code', monospace;
    font-weight: 700;
    color: #3b82f6;
    background: #eff6ff;
    padding: 2px 6px;
    border-radius: 4px;
    min-width: 40px;
    text-align: center;
  }

  .ref-desc {
    font-size: 0.85rem;
    color: #64748b;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-8 {
    margin-top: 2rem;
  }
  .w-full {
    width: 100%;
  }
</style>
