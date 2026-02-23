<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">SQL<span>.生成助手()</span></h1>
        <div class="tab-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['brutal-btn tab-btn', { active: currentTab === tab.id }]"
            @click="currentTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </header>

      <!-- Tab: 列表转 IN -->
      <div v-if="currentTab === 'in'" class="brutal-pane">
        <div class="pane-header bg-blue">
          <span class="text-white">01. 列表 → IN 子句</span>
          <div class="header-opts">
            <label class="brutal-toggle">
              <input v-model="inOpts.quote" type="checkbox" />
              <span class="t-box"></span>
              包含引号 (' ')
            </label>
            <label class="brutal-toggle">
              <input v-model="inOpts.newline" type="checkbox" />
              <span class="t-box"></span>
              换行分隔
            </label>
          </div>
        </div>
        <div class="pane-body split-layout">
          <textarea
            v-model="inInput"
            class="brutal-editor flex-1"
            placeholder="输入列表，每行一个&#10;100&#10;200&#10;300"
          ></textarea>
          <div class="arrow-mid">→</div>
          <textarea
            v-model="inOutput"
            class="brutal-editor flex-1 result-tinted"
            readonly
            placeholder="[生成结果]"
          ></textarea>
        </div>
        <div class="pane-footer">
          <button class="brutal-action-btn primary large-btn" @click="genIN">生成</button>
          <button class="brutal-action-btn large-btn" @click="copy(inOutput)">📋 复制结果</button>
        </div>
      </div>

      <!-- Tab: CSV 转 INSERT -->
      <div v-else-if="currentTab === 'insert'" class="brutal-pane">
        <div class="pane-header bg-yellow">
          <span>02. CSV → INSERT</span>
          <div class="header-opts">
            <input
              v-model="insertOpts.table"
              class="brutal-input-inline"
              placeholder="Table 名称"
            />
            <label class="brutal-toggle">
              <input v-model="insertOpts.batch" type="checkbox" />
              <span class="t-box"></span>
              批量插入
            </label>
          </div>
        </div>
        <div class="hint-bar">第一行必须是 CSV 表头 (Column Names)</div>
        <div class="pane-body split-layout">
          <textarea
            v-model="insertInput"
            class="brutal-editor flex-1"
            placeholder="id,name,age&#10;1,Alice,20&#10;2,Bob,22"
          ></textarea>
          <div class="arrow-mid">→</div>
          <textarea
            v-model="insertOutput"
            class="brutal-editor flex-1 result-tinted"
            readonly
            placeholder="[生成结果]"
          ></textarea>
        </div>
        <div class="pane-footer">
          <button class="brutal-action-btn primary large-btn" @click="genINSERT">生成</button>
          <button class="brutal-action-btn large-btn" @click="copy(insertOutput)">
            📋 复制结果
          </button>
        </div>
      </div>

      <!-- Tab: JSON 转 CREATE TABLE -->
      <div v-else-if="currentTab === 'create'" class="brutal-pane">
        <div class="pane-header bg-green">
          <span>03. JSON → CREATE TABLE</span>
          <input v-model="createOpts.table" class="brutal-input-inline" placeholder="Table 名称" />
        </div>
        <div class="pane-body split-layout">
          <textarea
            v-model="createInput"
            class="brutal-editor flex-1"
            placeholder='[{"id": 1, "name": "Test", "active": true}]'
          ></textarea>
          <div class="arrow-mid">→</div>
          <textarea
            v-model="createOutput"
            class="brutal-editor flex-1 result-tinted"
            readonly
            placeholder="[生成结果]"
          ></textarea>
        </div>
        <div class="pane-footer">
          <button class="brutal-action-btn primary large-btn" @click="genCREATE">生成</button>
          <button class="brutal-action-btn large-btn" @click="copy(createOutput)">
            📋 复制结果
          </button>
        </div>
      </div>

      <!-- Tab: SQL 智能填充 -->
      <div v-else-if="currentTab === 'smart'" class="brutal-pane smart-pane">
        <div class="pane-header bg-pink">
          <span>04. SQL 智能填充 (Mock Data)</span>
        </div>
        <div class="smart-layout">
          <!-- 左侧控制区 -->
          <div class="smart-ctrl">
            <div class="upload-zone" @click="$refs.sqlFile.click()">
              <span class="upload-icon">📂</span>
              <span>点击上传 SQL 文件</span>
              <input
                ref="sqlFile"
                type="file"
                accept=".sql,.txt"
                style="display: none"
                @change="handleSqlUpload"
              />
            </div>

            <template v-if="parsedTables.length">
              <div class="tables-list-header">
                识别到 <strong>{{ parsedTables.length }}</strong> 张表
                <button class="brutal-action-btn small" @click="checkAll">全选</button>
              </div>
              <div class="tables-scroll">
                <div
                  v-for="t in parsedTables"
                  :key="t.name"
                  :class="['table-row', { selected: selectedTables.includes(t.name) }]"
                  @click="toggleTable(t.name)"
                >
                  <span class="table-name">{{ t.name }}</span>
                  <span class="col-badge">{{ t.columns.length }} cols</span>
                </div>
              </div>
              <div class="gen-count-row">
                <label><strong>生成数量</strong></label>
                <input
                  v-model.number="smartCount"
                  type="number"
                  min="1"
                  max="1000"
                  class="brutal-input-inline number-input"
                />
              </div>
              <button
                class="brutal-action-btn primary large-btn w-full"
                :disabled="!selectedTables.length"
                @click="genSmartData"
              >
                开始生成
              </button>
            </template>
            <div v-else class="empty-tip">请上传包含 CREATE TABLE 语句的 SQL 文件</div>
          </div>

          <!-- 右侧结果区 -->
          <div class="smart-result">
            <div class="result-label">
              <span>// 生成结果</span>
              <button
                class="brutal-action-btn small"
                :disabled="!smartOutput"
                @click="copy(smartOutput)"
              >
                📋 复制
              </button>
            </div>
            <textarea
              v-model="smartOutput"
              class="brutal-editor result-tinted smart-textarea"
              readonly
              placeholder="[INSERT 语句将显示在这里]"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import Mock from 'mockjs';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const { copyToClipboard } = useCopy();
  const currentTab = ref('in');

  const tabs = [
    { id: 'in', label: '列表→IN' },
    { id: 'insert', label: 'CSV→INSERT' },
    { id: 'create', label: 'JSON→CREATE' },
    { id: 'smart', label: '智能填充' }
  ];

  function copy(text) {
    if (!text) return;
    copyToClipboard(text, { success: '已复制' });
  }

  // --- IN ---
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
    ElMessage.success('生成完成');
  }

  // --- INSERT ---
  const insertInput = ref('');
  const insertOutput = ref('');
  const insertOpts = reactive({ table: 'my_table', batch: false });

  function genINSERT() {
    if (!insertInput.value.trim()) return;
    const lines = insertInput.value.split('\n').filter(l => l.trim());
    if (lines.length < 2) return ElMessage.warning('CSV 需要至少两行(表头+数据)');
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
    ElMessage.success('生成完成');
  }

  // --- CREATE ---
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
      ElMessage.success('生成完成');
    } catch (e) {
      ElMessage.error('JSON 解析失败: ' + e.message);
    }
  }

  // --- SMART ---
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
      const chunk = parts[i];
      const tableNameMatch = chunk.match(/^[`"[]?([\w_-]+)[`"\]]?/);
      if (!tableNameMatch) continue;
      const tableName = tableNameMatch[1];
      const openIdx = chunk.indexOf('(');
      const closeIdx = chunk.lastIndexOf(')');
      if (openIdx === -1) continue;
      const content = chunk.substring(openIdx + 1, closeIdx);
      const colDefinitions = splitSqlColumns(content);
      const columns = [];
      colDefinitions.forEach(def => {
        def = def.trim();
        if (!def || /^(PRIMARY|KEY|UNIQUE|CONSTRAINT|INDEX)/i.test(def)) return;
        const parts = def.split(/\s+/);
        if (parts.length < 2) return;
        const name = parts[0].replace(/[`"[\]]/g, '');
        const type = parts[1].toUpperCase();
        columns.push({ name, type });
      });
      if (columns.length > 0) tables.push({ name: tableName, columns });
    }
    parsedTables.value = tables;
    selectedTables.value = [];
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

  function toggleTable(name) {
    const idx = selectedTables.value.indexOf(name);
    if (idx === -1) selectedTables.value.push(name);
    else selectedTables.value.splice(idx, 1);
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
      for (let i = 0; i < smartCount.value; i++) dataArr.push(Mock.mock(template));
      const keys = table.columns.map(c => `\`${c.name}\``).join(', ');
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
    ElMessage.success('生成完成');
  }

  function mapTypeToMock(type) {
    type = type.toUpperCase();
    if (type.includes('INT')) return '@integer(1, 100)';
    if (type.includes('CHAR') || type.includes('TEXT')) return '@word(5)';
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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1600px;
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
    font-size: 3rem;
    font-weight: 800;
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

  .tab-nav {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.6rem 1.2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 5px 5px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 8px 8px 0px #111;
  }

  .brutal-btn:active {
    transform: translate(5px, 5px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-btn.back-btn {
    font-size: 1.1rem;
  }

  .brutal-btn.tab-btn {
    background: #fff;
  }
  .brutal-btn.tab-btn.active {
    background: #111;
    color: #ffd900;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 1px;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-yellow {
    background: #ffd900;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .text-white {
    color: #fff;
  }

  .header-opts {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .hint-bar {
    background: #fdfae5;
    border-bottom: 3px solid #111;
    padding: 0.5rem 1.5rem;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .pane-body {
    flex: 1;
    padding: 2rem;
  }

  .split-layout {
    display: flex;
    gap: 1.5rem;
    align-items: stretch;
    min-height: 55vh;
  }

  .arrow-mid {
    display: flex;
    align-items: center;
    font-size: 2.5rem;
    font-weight: 900;
    color: #111;
    flex-shrink: 0;
    padding: 0 0.5rem;
  }

  .brutal-editor {
    border: 4px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: 600;
    resize: none;
    padding: 1.2rem;
    font-size: 1rem;
    line-height: 1.5;
    box-sizing: border-box;
  }

  .brutal-editor:focus {
    background: #fff;
  }

  .result-tinted {
    background: #eaffed;
  }

  .flex-1 {
    flex: 1;
  }
  .w-full {
    width: 100%;
  }

  .pane-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 4px solid #111;
    background: #f8fafc;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.5rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
    text-transform: uppercase;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: 4px 4px 0px #111 !important;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn.small {
    padding: 0.25rem 0.6rem;
    font-size: 0.85rem;
    border-width: 2px;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-action-btn.small:hover {
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-action-btn.large-btn {
    padding: 1rem;
    font-size: 1.1rem;
  }

  .brutal-input-inline {
    border: 3px solid #111;
    padding: 0.4rem 0.8rem;
    font-family: 'IBM Plex Mono', inherit;
    font-weight: bold;
    font-size: 1rem;
    color: #111;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
    transition: all 0.1s;
  }

  .brutal-input-inline:focus {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px #111;
  }

  .number-input {
    width: 80px;
    text-align: center;
  }

  /* Toggle */
  .brutal-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 700;
    user-select: none;
    font-size: 0.95rem;
  }

  .brutal-toggle input {
    display: none;
  }

  .t-box {
    width: 20px;
    height: 20px;
    background: #fff;
    border: 3px solid #111;
    position: relative;
    flex-shrink: 0;
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-toggle input:checked + .t-box {
    background: #00e572;
  }
  .brutal-toggle input:checked + .t-box::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid #111;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  /* Smart Tab */
  .smart-pane {
    min-height: 75vh;
  }

  .smart-layout {
    display: flex;
    flex: 1;
  }

  .smart-ctrl {
    width: 280px;
    border-right: 4px solid #111;
    display: flex;
    flex-direction: column;
    background: #fdfae5;
  }

  .upload-zone {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    border-bottom: 3px solid #111;
    cursor: pointer;
    transition: background 0.1s;
    font-weight: 700;
  }

  .upload-zone:hover {
    background: #ffd900;
  }

  .upload-icon {
    font-size: 2.5rem;
  }

  .tables-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 3px solid #111;
    font-weight: 700;
    background: #fff;
  }

  .tables-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 3px solid #111;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .table-row:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  .table-row.selected {
    background: #00e572;
    border-color: #111;
  }

  .table-name {
    font-weight: bold;
  }
  .col-badge {
    font-size: 0.8rem;
    background: #111;
    color: #ffd900;
    padding: 1px 5px;
    font-weight: bold;
  }

  .gen-count-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-top: 3px solid #111;
    border-bottom: 3px solid #111;
    gap: 0.5rem;
    background: #fff;
  }

  .w-full {
    margin: 1rem;
    width: calc(100% - 2rem);
    box-sizing: border-box;
  }

  .empty-tip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    font-weight: 600;
    color: #555;
  }

  .smart-result {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .result-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-bottom: 3px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    background: #fdfae5;
  }

  .smart-textarea {
    flex: 1;
    min-height: auto;
    border: none;
    box-shadow: none;
    background: #eaffed;
    resize: none;
    padding: 1.5rem;
    font-size: 1rem;
    height: 100%;
  }

  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2rem;
    }
    .split-layout {
      flex-direction: column;
    }
    .arrow-mid {
      transform: rotate(90deg);
      align-self: center;
    }
    .smart-layout {
      flex-direction: column;
    }
    .smart-ctrl {
      width: 100%;
      border-right: none;
      border-bottom: 4px solid #111;
    }
    .tab-nav {
      gap: 0.3rem;
    }
    .brutal-btn {
      padding: 0.5rem 0.8rem;
      font-size: 0.85rem;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn.tab-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-footer {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc62b6;
    color: #fff;
  }

  [data-theme='dark'] .brutal-action-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }

  [data-theme='dark'] .brutal-editor {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-editor:focus {
    background: #2a2a2a;
  }
  [data-theme='dark'] .result-tinted {
    background: #0a2a14;
  }

  [data-theme='dark'] .brutal-input-inline {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input-inline:focus {
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .t-box {
    background: #222;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-toggle input:checked + .t-box {
    background: #007a3d;
  }
  [data-theme='dark'] .brutal-toggle input:checked + .t-box::after {
    border-color: #fff;
  }

  [data-theme='dark'] .smart-ctrl {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .upload-zone {
    border-color: #eee;
  }
  [data-theme='dark'] .upload-zone:hover {
    background: #b28f00;
  }
  [data-theme='dark'] .tables-list-header {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .table-row {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .table-row.selected {
    background: #007a3d;
  }
  [data-theme='dark'] .gen-count-row {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .result-label {
    background: #111;
    border-color: #eee;
  }
  [data-theme='dark'] .hint-bar {
    border-color: #eee;
    background: #222;
    color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
