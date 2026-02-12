<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <h1 class="tool-title">SQL 生成助手</h1>
      <div class="header-right"></div>
    </header>

    <div class="tool-content">
      <aside class="sidebar">
        <div class="nav-menu">
          <button :class="['nav-item', { active: currentTab === 'in' }]" @click="currentTab = 'in'">
            <el-icon>
              <List />
            </el-icon>
            列表转 IN
          </button>
          <button
            :class="['nav-item', { active: currentTab === 'insert' }]"
            @click="currentTab = 'insert'"
          >
            <el-icon>
              <DocumentAdd />
            </el-icon>
            CSV转 INSERT
          </button>
          <button
            :class="['nav-item', { active: currentTab === 'create' }]"
            @click="currentTab = 'create'"
          >
            <el-icon>
              <Coin />
            </el-icon>
            JSON转 CREATE
          </button>
          <button
            :class="['nav-item', { active: currentTab === 'smart' }]"
            @click="currentTab = 'smart'"
          >
            <el-icon>
              <MagicStick />
            </el-icon>
            SQL 智能填充
          </button>
        </div>
      </aside>

      <main class="main-panel">
        <div v-if="currentTab === 'in'" class="tool-pane">
          <div class="pane-header">
            <h3>列表转 IN 子句</h3>
            <div class="opts">
              <el-checkbox v-model="inOpts.quote">包含引号 (' ')</el-checkbox>
              <el-checkbox v-model="inOpts.newline">换行分隔</el-checkbox>
            </div>
          </div>
          <div class="split-view">
            <textarea
              v-model="inInput"
              class="code-editor"
              placeholder="输入列表，每行一个..."
            ></textarea>
            <div class="arrow-divider">
              <el-icon>
                <Right />
              </el-icon>
            </div>
            <div class="result-box">
              <textarea v-model="inOutput" class="code-editor result-editor" readonly></textarea>
            </div>
          </div>
          <div class="actions-row">
            <el-button type="primary" @click="genIN">生成</el-button>
            <el-button @click="copy(inOutput)">复制结果</el-button>
          </div>
        </div>

        <div v-if="currentTab === 'insert'" class="tool-pane">
          <div class="pane-header">
            <h3>CSV 转 INSERT</h3>
            <div class="opts">
              <el-input
                v-model="insertOpts.table"
                size="small"
                placeholder="Table Name"
                style="width: 150px"
              />
              <el-checkbox v-model="insertOpts.batch">批量插入 (Single Statement)</el-checkbox>
            </div>
          </div>
          <div class="helper-text">第一行必须是CSV表头 (Column Names)</div>
          <div class="split-view">
            <textarea
              v-model="insertInput"
              class="code-editor"
              placeholder="id,name,age&#10;1,Alice,20&#10;2,Bob,22"
            ></textarea>
            <div class="arrow-divider">
              <el-icon>
                <Right />
              </el-icon>
            </div>
            <div class="result-box">
              <textarea
                v-model="insertOutput"
                class="code-editor result-editor"
                readonly
              ></textarea>
            </div>
          </div>
          <div class="actions-row">
            <el-button type="primary" @click="genINSERT">生成</el-button>
            <el-button @click="copy(insertOutput)">复制结果</el-button>
          </div>
        </div>

        <div v-if="currentTab === 'create'" class="tool-pane">
          <div class="pane-header">
            <h3>JSON 转 CREATE TABLE</h3>
            <el-input
              v-model="createOpts.table"
              size="small"
              placeholder="Table Name"
              style="width: 150px"
            />
          </div>
          <div class="split-view">
            <textarea
              v-model="createInput"
              class="code-editor"
              placeholder='[{"id": 1, "name": "Test", "active": true}]'
            ></textarea>
            <div class="arrow-divider">
              <el-icon>
                <Right />
              </el-icon>
            </div>
            <div class="result-box">
              <textarea
                v-model="createOutput"
                class="code-editor result-editor"
                readonly
              ></textarea>
            </div>
          </div>
          <div class="actions-row">
            <el-button type="primary" @click="genCREATE">生成</el-button>
            <el-button @click="copy(createOutput)">复制结果</el-button>
          </div>
        </div>

        <div v-if="currentTab === 'smart'" class="tool-pane smart-pane">
          <div class="pane-header">
            <h3>SQL 智能填充 (Mock Data)</h3>
          </div>

          <div class="smart-layout">
            <div class="smart-sidebar">
              <div class="upload-area" @click="$refs.sqlFile.click()">
                <el-icon class="upload-icon">
                  <UploadFilled />
                </el-icon>
                <span>点击上传 SQL 文件</span>
                <input
                  ref="sqlFile"
                  type="file"
                  accept=".sql,.txt"
                  style="display: none"
                  @change="handleSqlUpload"
                />
              </div>

              <div v-if="parsedTables.length" class="table-list-area">
                <div class="list-header">
                  <span>识别到 {{ parsedTables.length }} 张表</span>
                  <el-button size="small" link @click="checkAll">全选</el-button>
                </div>
                <div class="table-items">
                  <el-checkbox-group v-model="selectedTables">
                    <template v-for="t in parsedTables" :key="t.name">
                      <div class="table-item">
                        <el-checkbox :label="t.name">{{ t.name }}</el-checkbox>
                        <span class="col-count">{{ t.columns.length }} cols</span>
                      </div>
                    </template>
                  </el-checkbox-group>
                </div>
                <div class="gen-config">
                  <span class="label">生成数量:</span>
                  <el-input-number v-model="smartCount" :min="1" :max="1000" size="small" />
                </div>
                <el-button
                  type="primary"
                  class="full-btn"
                  :disabled="!selectedTables.length"
                  @click="genSmartData"
                >
                  开始生成
                </el-button>
              </div>
              <div v-else class="empty-tip">请上传包含 CREATE TABLE 语句的 SQL 文件</div>
            </div>

            <div class="smart-result">
              <div class="result-header">
                <span>生成结果</span>
                <el-button size="small" :disabled="!smartOutput" @click="copy(smartOutput)"
                  >复制</el-button
                >
              </div>
              <textarea
                v-model="smartOutput"
                class="code-editor result-editor"
                readonly
                placeholder="INSERT 语句将显示在这里..."
              ></textarea>
            </div>
          </div>
        </div>
      </main>
    </div>

    <footer class="footer">© 2026 LRM工具箱 - SQL 生成助手</footer>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import {
    ArrowLeft,
    List,
    DocumentAdd,
    Coin,
    Right,
    UploadFilled,
    MagicStick
  } from '@element-plus/icons-vue';
  import Mock from 'mockjs';

  const router = useRouter();
  const currentTab = ref('in');

  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  function copy(text) {
    copyToClipboard(text, { success: '已复制' });
  }

  const inInput = ref('');
  const inOutput = ref('');
  const inOpts = reactive({ quote: true, newline: false });

  function genIN() {
    if (!inInput.value.trim()) return;
    const lines = inInput.value
      .split('\n')
      .map(l => l.trim())
      .filter(l => l);
    if (lines.length === 0) return;

    const items = lines.map(item => (inOpts.quote ? `'${item}'` : item));
    const joiner = inOpts.newline ? ',\n  ' : ', ';

    inOutput.value = `IN (${inOpts.newline ? '\n  ' : ''}${items.join(joiner)}${inOpts.newline ? '\n' : ''})`;
  }

  const insertInput = ref('');
  const insertOutput = ref('');
  const insertOpts = reactive({ table: 'my_table', batch: false });

  function genINSERT() {
    if (!insertInput.value.trim()) return;
    const lines = insertInput.value.split('\n').filter(l => l.trim());
    if (lines.length < 2) return ElMessage.warning('CSV需要至少两行(表头+数据)');

    const headers = lines[0].split(',').map(h => h.trim());
    const valuesList = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());

      const vals = cols.map(v => (isNaN(v) ? `'${v}'` : v)).join(', ');
      valuesList.push(`(${vals})`);
    }

    const colsStr = headers.join(', ');
    const table = insertOpts.table || 'table';

    if (insertOpts.batch) {
      insertOutput.value = `INSERT INTO ${table} (${colsStr}) VALUES\n${valuesList.join(',\n')};`;
    } else {
      insertOutput.value = valuesList
        .map(v => `INSERT INTO ${table} (${colsStr}) VALUES ${v};`)
        .join('\n');
    }
  }

  const createInput = ref('');
  const createOutput = ref('');
  const createOpts = reactive({ table: 'my_table' });

  function genCREATE() {
    try {
      let data = JSON.parse(createInput.value);
      if (Array.isArray(data)) data = data[0];
      if (!data || typeof data !== 'object') throw new Error('Invalid JSON Object');

      const lines = [];
      lines.push(`CREATE TABLE ${createOpts.table || 'table'} (`);

      for (const k in data) {
        const v = data[k];
        let type = 'VARCHAR(255)';
        if (typeof v === 'number') {
          type = Number.isInteger(v) ? 'INT' : 'DECIMAL(10,2)';
        } else if (typeof v === 'boolean') {
          type = 'TINYINT(1)';
        } else if (v instanceof Date || (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}/))) {
          type = 'DATETIME';
        }
        lines.push(`  \`${k}\` ${type},`);
      }

      let body = lines.slice(1).join('\n');
      body = body.substring(0, body.length - 1);

      createOutput.value = `${lines[0]}\n${body}\n);`;
    } catch (e) {
      ElMessage.error('JSON 解析失败: ' + e.message);
    }
  }

  const parsedTables = ref([]);
  const selectedTables = ref([]);
  const smartCount = ref(10);
  const smartOutput = ref('');

  function handleSqlUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => parseSqlContent(ev.target.result);
    reader.readAsText(file);
  }

  function parseSqlContent(sql) {
    const tables = [];
    const parts = sql.split(/CREATE\s+TABLE\s+/i);

    for (let i = 1; i < parts.length; i++) {
      let chunk = parts[i];

      let tableNameMatch = chunk.match(/^[`"[]?([\w_-]+)[`"\]]?/);
      if (!tableNameMatch) continue;

      const tableName = tableNameMatch[1];

      // Extract content inside first parenthesis pair (...)
      // Find first ( and last );?
      // This is tricky if nested parenthesis exist.
      // Assuming standard SQL dump format.
      const openIdx = chunk.indexOf('(');
      const closeIdx = chunk.lastIndexOf(')');
      if (openIdx === -1) continue;

      const content = chunk.substring(openIdx + 1, closeIdx);

      // Parse columns
      // Split by comma BUT skip commas in parenthesis (e.g. DECIMAL(10,2))
      const colDefinitions = splitSqlColumns(content);
      const columns = [];

      colDefinitions.forEach(def => {
        def = def.trim();
        if (!def || /^(PRIMARY|KEY|UNIQUE|CONSTRAINT|INDEX)/i.test(def)) return;

        // Extract col name and type
        // `id` int(11) ...
        const parts = def.split(/\s+/);
        if (parts.length < 2) return;

        let name = parts[0].replace(/[`"[\]]/g, '');
        let type = parts[1].toUpperCase();

        columns.push({ name, type });
      });

      if (columns.length > 0) {
        tables.push({ name: tableName, columns });
      }
    }

    parsedTables.value = tables;
    if (tables.length) ElMessage.success(`成功识别 ${tables.length} 张表`);
    else ElMessage.warning('未识别到有效表结构');
  }

  function splitSqlColumns(str) {
    const res = [];
    let buffer = '';
    let parenLevel = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') parenLevel++;
      if (char === ')') parenLevel--;

      if (char === ',' && parenLevel === 0) {
        res.push(buffer);
        buffer = '';
      } else {
        buffer += char;
      }
    }
    if (buffer) res.push(buffer);
    return res;
  }

  function checkAll() {
    selectedTables.value = parsedTables.value.map(t => t.name);
  }

  function genSmartData() {
    let result = '';

    selectedTables.value.forEach(tName => {
      const table = parsedTables.value.find(t => t.name === tName);
      if (!table) return;

      const template = {};
      table.columns.forEach(col => {
        template[col.name] = mapTypeToMock(col.type);
      });

      const dataArr = [];
      for (let i = 0; i < smartCount.value; i++) {
        dataArr.push(Mock.mock(template));
      }

      const keys = table.columns
        .map(c => c.name)
        .map(k => `\`${k}\``)
        .join(', ');
      const values = dataArr
        .map(row => {
          return (
            '(' +
            table.columns
              .map(c => {
                const val = row[c.name];
                return typeof val === 'string' ? `'${val}'` : val;
              })
              .join(', ') +
            ')'
          );
        })
        .join(',\n');

      result += `INSERT INTO \`${tName}\` (${keys}) VALUES\n${values};\n\n`;
    });

    smartOutput.value = result;
  }

  function mapTypeToMock(type) {
    type = type.toUpperCase();
    if (type.includes('INT')) return '@integer(1, 100)';
    if (type.includes('CHAR') || type.includes('TEXT')) {
      if (type.includes('NAME')) return '@cname';
      if (type.includes('EMAIL')) return '@email';
      return '@word(5)';
    }
    if (type.includes('DATE') || type.includes('TIME')) return '@datetime("yyyy-MM-dd HH:mm:ss")';
    if (type.includes('DECIMAL') || type.includes('FLOAT') || type.includes('DOUBLE'))
      return '@float(0, 1000, 2, 2)';
    if (type.includes('BOOL')) return '@boolean';
    return '@string(5)';
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f0f4f8;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .tool-content {
    flex: 1;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    display: flex;
    gap: 1.5rem;
  }

  .sidebar {
    width: 200px;
    flex-shrink: 0;
  }

  .nav-menu {
    background: #fff;
    border-radius: 12px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .nav-item {
    padding: 0.8rem 1rem;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
    border-radius: 8px;
    color: #64748b;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    transition: all 0.2s;
  }

  .nav-item:hover {
    background: #f1f5f9;
    color: #334155;
  }

  .nav-item.active {
    background: #eff6ff;
    color: #3b82f6;
    font-weight: 600;
  }

  .main-panel {
    flex: 1;
  }

  .tool-pane {
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pane-header h3 {
    font-size: 1.1rem;
    color: #334155;
    font-weight: 600;
  }

  .opts {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .helper-text {
    padding: 0.5rem 1.5rem;
    font-size: 0.8rem;
    color: #94a3b8;
    background: #f8fafc;
  }

  .split-view {
    flex: 1;
    display: flex;
    padding: 1rem;
    gap: 1rem;
    align-items: stretch;
  }

  .arrow-divider {
    display: flex;
    align-items: center;
    color: #cbd5e1;
    font-size: 1.5rem;
  }

  .code-editor {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    resize: none;
    font-family: 'Consolas', monospace;
    font-size: 0.9rem;
    color: #334155;
    background: #fdfdfd;
  }

  .result-box {
    flex: 1;
    display: flex;
    position: relative;
  }

  .result-editor {
    background: #f8fafc;
    color: #0f172a;
  }

  .actions-row {
    padding: 1rem 1.5rem;
    border-top: 1px solid #f1f5f9;
    background: #f8fafc;
    display: flex;
    gap: 1rem;
  }

  .smart-pane {
    background: #fff;
  }

  .smart-layout {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .smart-sidebar {
    width: 300px;
    border-right: 1px solid #f1f5f9;
    display: flex;
    flex-direction: column;
    background: #fcfcfc;
  }

  .upload-area {
    padding: 2rem;
    text-align: center;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: bg 0.2s;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .upload-area:hover {
    background: #f1f5f9;
    color: #3b82f6;
  }

  .upload-icon {
    font-size: 2rem;
  }

  .table-list-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .list-header {
    padding: 0.8rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #475569;
    border-bottom: 1px solid #f1f5f9;
  }

  .table-items {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .table-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .col-count {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .gen-config {
    padding: 1rem;
    border-top: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
  }

  .full-btn {
    margin: 0 1rem 1rem 1rem;
  }

  .empty-tip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
    padding: 2rem;
    text-align: center;
  }

  .smart-result {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .result-header {
    padding: 0.8rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
  }

  @media (prefers-color-scheme: dark) {
    .tool-page {
      background: #111827;
    }

    .tool-header {
      background: #1f2937;
      border-color: #374151;
    }

    .tool-title {
      color: #f3f4f6;
    }

    .nav-menu {
      background: #1f2937;
      border-color: #374151;
    }

    .nav-item {
      color: #9ca3af;
    }

    .nav-item:hover {
      background: #374151;
    }

    .nav-item.active {
      background: #374151;
      color: #60a5fa;
    }

    .tool-pane {
      background: #1f2937;
      border-color: #374151;
    }

    .pane-header,
    .actions-row {
      background: #374151;
      border-color: #4b5563;
    }

    .pane-header h3 {
      color: #f3f4f6;
    }

    .code-editor,
    .result-editor {
      background: #111827;
      border-color: #4b5563;
      color: #e2e8f0;
    }

    .arrow-divider {
      color: #4b5563;
    }

    .smart-sidebar {
      background: #1f2937;
      border-color: #374151;
    }

    .upload-area:hover {
      background: #374151;
    }

    .list-header,
    .gen-config,
    .result-header {
      background: #374151;
      border-color: #4b5563;
      color: #cbd5e1;
    }

    .table-list-area {
      color: #cbd5e1;
    }
  }

  @media (max-width: 900px) {
    .tool-content {
      flex-direction: column;
    }

    .sidebar {
      width: 100%;
      display: flex;
      overflow-x: auto;
    }

    .nav-menu {
      flex-direction: row;
      width: 100%;
    }

    .nav-item {
      flex: 1;
      justify-content: center;
      padding: 1rem;
    }

    .tool-pane {
      height: auto;
      min-height: 500px;
    }

    .smart-layout {
      flex-direction: column;
    }

    .smart-sidebar {
      width: 100%;
      height: 300px;
    }
  }

  .footer {
    text-align: center;
    padding: 1rem 0;
    color: var(--text-secondary, #64748b);
    font-size: 0.85rem;
  }
</style>
