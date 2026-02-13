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
        <h1 class="tool-title">逻辑真值表生成器</h1>
        <span class="tool-subtitle">Logic Truth Table Generator</span>
      </div>
      <div class="header-right">
        <el-button @click="clearAll"> 清空 </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 输入区 -->
        <div class="input-section glass-card">
          <div class="section-header">
            <h2 class="viz-title">表达式输入</h2>
            <div class="operator-guide">
              <span class="guide-item" title="与 (AND)">P ∧ Q</span>
              <span class="guide-item" title="或 (OR)">P ∨ Q</span>
              <span class="guide-item" title="非 (NOT)">¬P</span>
              <span class="guide-item" title="蕴含 (Implication)">P → Q</span>
            </div>
          </div>

          <div class="input-wrapper">
            <el-input
              v-model="expression"
              placeholder="例如: (P && Q) || !R"
              class="expression-input"
              @input="generateTable"
            >
              <template #prepend>表达式</template>
            </el-input>
          </div>

          <div class="operator-buttons mt-4">
            <el-button-group>
              <el-button v-for="op in operators" :key="op.symbol" @click="insertSymbol(op.code)">
                {{ op.symbol }}
              </el-button>
            </el-button-group>
          </div>

          <div v-if="error" class="error-msg">
            <el-icon><Warning /></el-icon> {{ error }}
          </div>
        </div>

        <!-- 结果展示 -->
        <div v-if="variables.length && tableData.length" class="result-section glass-card mt-6">
          <div class="result-header">
            <h2 class="viz-title">真值表 ({{ variables.length }} 变量)</h2>
            <div class="result-actions">
              <el-button size="small" @click="copyMarkdown">复制为 Markdown</el-button>
            </div>
          </div>

          <div class="table-container">
            <table class="truth-table">
              <thead>
                <tr>
                  <th v-for="v in variables" :key="v">{{ v }}</th>
                  <th class="result-col">{{ expression }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in tableData" :key="idx">
                  <td v-for="v in variables" :key="v" :class="row.values[v] ? 'true' : 'false'">
                    {{ row.values[v] ? 'T' : 'F' }}
                  </td>
                  <td class="result-cell" :class="row.result ? 'true' : 'false'">
                    {{ row.result ? 'T' : 'F' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 帮助面板 -->
        <div class="help-section mt-6">
          <div class="panel glass-card">
            <h2 class="panel-title">符号对照表</h2>
            <div class="reference-grid">
              <div class="ref-item">
                <code class="ref-sym">&&, &</code>
                <span class="ref-desc">AND (与)</span>
              </div>
              <div class="ref-item">
                <code class="ref-sym">||, |</code>
                <span class="ref-desc">OR (或)</span>
              </div>
              <div class="ref-item">
                <code class="ref-sym">!, ~</code>
                <span class="ref-desc">NOT (非)</span>
              </div>
              <div class="ref-item">
                <code class="ref-sym">-></code>
                <span class="ref-desc">IMPLY (蕴含)</span>
              </div>
              <div class="ref-item">
                <code class="ref-sym">&lt;-&gt;</code>
                <span class="ref-desc">IFF (当且仅当)</span>
              </div>
              <div class="ref-item">
                <code class="ref-sym">^</code>
                <span class="ref-desc">XOR (异或)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 逻辑真值表生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { ArrowLeft, Warning } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const expression = ref('P && (Q || R)');
  const error = ref('');
  const variables = ref<string[]>([]);
  interface TableData {
    values: Record<string, boolean>;
    result: boolean;
  }

  const tableData = ref<TableData[]>([]);

  const operators = [
    { symbol: '∧ (AND)', code: ' && ' },
    { symbol: '∨ (OR)', code: ' || ' },
    { symbol: '¬ (NOT)', code: '!' },
    { symbol: '→ (IMPLY)', code: ' -> ' },
    { symbol: '↔ (IFF)', code: ' <-> ' },
    { symbol: '⊕ (XOR)', code: ' ^ ' }
  ];

  const insertSymbol = (code: string) => {
    expression.value += code;
    generateTable();
  };

  const clearAll = () => {
    expression.value = '';
    variables.value = [];
    tableData.value = [];
    error.value = '';
  };

  const generateTable = () => {
    error.value = '';
    if (!expression.value.trim()) {
      variables.value = [];
      tableData.value = [];
      return;
    }

    try {
      // 1. 提取变量 (A-Z, 不包含逻辑运算符关键字)
      const varsFound = Array.from(new Set(expression.value.match(/[A-Z]/g) || []));
      if (varsFound.length > 5) {
        error.value = '变量过多 (建议不超过 5 个)';
        return;
      }
      variables.value = varsFound.sort();

      // 2. 生成所有真值组合 (2^n)
      const rows = 1 << variables.value.length;
      const data: TableData[] = [];

      for (let i = 0; i < rows; i++) {
        const rowVars: Record<string, boolean> = {};
        variables.value.forEach((v, idx) => {
          rowVars[v] = ((i >> (variables.value.length - 1 - idx)) & 1) === 1;
        });

        const result = evaluate(expression.value, rowVars);
        data.push({ values: rowVars, result });
      }
      tableData.value = data;
    } catch {
      error.value = '表达式语法错误';
      tableData.value = [];
    }
  };

  const evaluate = (expr: string, context: Record<string, boolean>): boolean => {
    // 构建执行环境
    const varNames = Object.keys(context);
    const varValues = Object.values(context);

    // 使用 Function 执行动态逻辑
    // 注意：真实生产环境应使用更安全的 Parser (如 jsep)，此处为了教育演示
    let evalStr = expr;

    // 处理 IFF (双向蕴含)
    evalStr = evalStr.replace(/([A-Z! ()]+)\s*<->\s*([A-Z! ()]+)/g, '(($1 && $2) || (!$1 && !$2))');

    // 处理蕴含
    evalStr = evalStr.replace(/([A-Z! ()]+)\s*->\s*([A-Z! ()]+)/g, '(!$1 || $2)');

    const fn = new Function(...varNames, `return !!(${evalStr});`);
    return fn(...varValues);
  };

  const copyMarkdown = () => {
    let md = `| ${variables.value.join(' | ')} | Result |\n`;
    md += `| ${variables.value.map(() => '---').join(' | ')} | --- |\n`;
    tableData.value.forEach(row => {
      md += `| ${variables.value.map(v => (row.values[v] ? 'T' : 'F')).join(' | ')} | ${row.result ? 'T' : 'F'} |\n`;
    });

    navigator.clipboard.writeText(md);
    ElMessage.success('已复制 Markdown 表格');
  };

  onMounted(() => {
    generateTable();
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

  .header-left,
  .header-right {
    width: 140px;
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
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .viz-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .operator-guide {
    display: flex;
    gap: 12px;
  }
  .guide-item {
    font-size: 0.75rem;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    color: #64748b;
    cursor: help;
  }

  .expression-input :deep(.el-input__wrapper) {
    font-family: 'Fira Code', monospace;
    font-size: 1.1rem;
  }

  .error-msg {
    color: #ef4444;
    font-size: 0.85rem;
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .truth-table {
    width: 100%;
    border-collapse: collapse;
    text-align: center;
    font-family: 'Fira Code', monospace;
  }

  .truth-table th {
    background: #f8fafc;
    padding: 12px;
    border-bottom: 2px solid #e2e8f0;
    font-weight: 700;
    color: #475569;
  }

  .truth-table td {
    padding: 10px;
    border-bottom: 1px solid #f1f5f9;
  }

  .truth-table tr:hover {
    background: #f8fafc;
  }

  .result-col {
    background: #eff6ff !important;
    color: #1e40af !important;
  }
  .result-cell {
    background: #eff6ff;
    font-weight: 700;
  }

  .true {
    color: #10b981;
  }
  .false {
    color: #ef4444;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
  }

  .reference-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .ref-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ref-sym {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    color: #3b82f6;
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
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
