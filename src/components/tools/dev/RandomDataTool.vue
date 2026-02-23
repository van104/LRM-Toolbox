<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">Random<span>.数据()</span></h1>
        <div v-if="resultText" class="count-badge">{{ resultText.length }} chars</div>
        <div v-else class="count-badge">// MockJS</div>
      </header>

      <!-- Tab 选择 -->
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <span>{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- 主布局 -->
      <div class="brutal-grid">
        <!-- 左侧：配置面板 -->
        <div class="brutal-pane config-pane">
          <div class="pane-header bg-yellow">
            <span>// 配置参数</span>
          </div>
          <div class="config-body">
            <!-- 基础数据 -->
            <template v-if="currentTab === 'basic'">
              <!-- UUID -->
              <div class="config-section">
                <div class="section-title">🆔 UUID / GUID</div>
                <div class="field-row">
                  <label class="field-label">数量</label>
                  <input
                    v-model.number="basic.uuidCount"
                    type="number"
                    min="1"
                    max="100"
                    class="brutal-input num"
                  />
                </div>
                <button class="gen-btn" @click="genUUID">生成 UUID →</button>
              </div>
              <div class="divider"></div>

              <!-- 随机字符串 -->
              <div class="config-section">
                <div class="section-title">🔤 随机字符串</div>
                <div class="check-group">
                  <button
                    :class="['check-btn', { on: basic.strLower }]"
                    @click="basic.strLower = !basic.strLower"
                  >
                    a-z
                  </button>
                  <button
                    :class="['check-btn', { on: basic.strUpper }]"
                    @click="basic.strUpper = !basic.strUpper"
                  >
                    A-Z
                  </button>
                  <button
                    :class="['check-btn', { on: basic.strNum }]"
                    @click="basic.strNum = !basic.strNum"
                  >
                    0-9
                  </button>
                  <button
                    :class="['check-btn', { on: basic.strSymbol }]"
                    @click="basic.strSymbol = !basic.strSymbol"
                  >
                    !@#
                  </button>
                </div>
                <div class="field-row">
                  <label class="field-label">长度</label>
                  <input
                    v-model.number="basic.strLen"
                    type="number"
                    min="1"
                    max="128"
                    class="brutal-input num"
                  />
                </div>
                <button class="gen-btn" @click="genString">生成字符串 →</button>
              </div>
              <div class="divider"></div>

              <!-- 随机数字 -->
              <div class="config-section">
                <div class="section-title">🔢 随机数字 (×10)</div>
                <div class="field-row">
                  <label class="field-label">Min</label>
                  <input v-model.number="basic.numMin" type="number" class="brutal-input num" />
                  <label class="field-label">Max</label>
                  <input v-model.number="basic.numMax" type="number" class="brutal-input num" />
                </div>
                <button class="gen-btn" @click="genNumber">生成数字 →</button>
              </div>
              <div class="divider"></div>

              <!-- 随机颜色 -->
              <div class="config-section">
                <div class="section-title">🎨 随机颜色 (×5)</div>
                <div class="field-row">
                  <button class="color-btn hex-btn" @click="genColor('hex')">HEX</button>
                  <button class="color-btn rgb-btn" @click="genColor('rgb')">RGB</button>
                  <button class="color-btn hsl-btn" @click="genColor('hsl')">HSL</button>
                </div>
              </div>
            </template>

            <!-- 文本文章 -->
            <template v-else-if="currentTab === 'text'">
              <div class="config-section">
                <div class="section-title">🌐 语言</div>
                <div class="seg-group">
                  <button
                    :class="['seg-btn', { active: textOpt.lang === 'zh' }]"
                    @click="textOpt.lang = 'zh'"
                  >
                    中文
                  </button>
                  <button
                    :class="['seg-btn', { active: textOpt.lang === 'en' }]"
                    @click="textOpt.lang = 'en'"
                  >
                    English
                  </button>
                </div>
              </div>
              <div class="divider"></div>
              <div class="config-section">
                <div class="section-title">📐 生成单位</div>
                <div class="seg-group">
                  <button
                    :class="['seg-btn', { active: textOpt.unit === 'word' }]"
                    @click="textOpt.unit = 'word'"
                  >
                    词/字
                  </button>
                  <button
                    :class="['seg-btn', { active: textOpt.unit === 'sentence' }]"
                    @click="textOpt.unit = 'sentence'"
                  >
                    句子
                  </button>
                  <button
                    :class="['seg-btn', { active: textOpt.unit === 'paragraph' }]"
                    @click="textOpt.unit = 'paragraph'"
                  >
                    段落
                  </button>
                </div>
              </div>
              <div class="divider"></div>
              <div class="config-section">
                <div class="section-title">🔢 数量: {{ textOpt.count }}</div>
                <input
                  v-model.number="textOpt.count"
                  type="range"
                  min="1"
                  max="50"
                  class="brutal-range"
                />
              </div>
              <button class="gen-btn full" @click="genText">生成文本 →</button>
            </template>

            <!-- 个人信息 -->
            <template v-else-if="currentTab === 'persona'">
              <div class="config-section">
                <div class="section-title">🔢 生成数量</div>
                <input
                  v-model.number="persona.count"
                  type="number"
                  min="1"
                  max="100"
                  class="brutal-input num"
                />
              </div>
              <div class="divider"></div>
              <div class="config-section">
                <div class="section-title">📋 包含字段</div>
                <div class="field-check-grid">
                  <button
                    v-for="(label, key) in personaFieldLabels"
                    :key="key"
                    :class="['field-check-btn', { on: persona.fields[key] }]"
                    @click="persona.fields[key] = !persona.fields[key]"
                  >
                    {{ label }}
                  </button>
                </div>
              </div>
              <button class="gen-btn full" @click="genPersona">生成列表 →</button>
            </template>

            <!-- JSON Mock -->
            <template v-else-if="currentTab === 'mock'">
              <div class="config-section">
                <div class="section-title">📝 Mock.js 模板</div>
                <textarea
                  v-model="mockTemplate"
                  class="brutal-editor mock-editor"
                  spellcheck="false"
                  placeholder="{'list|5': [{'id|+1': 1, 'name': '@cname'}]}"
                ></textarea>
              </div>
              <div class="btn-row">
                <button class="gen-btn" @click="genMock">执行 Mock →</button>
                <button class="gen-btn secondary" @click="fillMockDemo">加载示例</button>
              </div>
            </template>
          </div>
        </div>

        <!-- 右侧：结果面板 -->
        <div class="brutal-pane result-pane">
          <div class="pane-header bg-blue">
            <span class="text-white">// 生成结果</span>
            <div class="result-actions">
              <button class="action-btn" :disabled="!resultText" @click="copyResult">
                📋 复制
              </button>
              <button class="action-btn danger" :disabled="!resultText" @click="resultText = ''">
                ✕ 清空
              </button>
            </div>
          </div>
          <textarea
            v-model="resultText"
            readonly
            class="result-textarea"
            placeholder="结果将显示在这里..."
          ></textarea>
        </div>
      </div>

      <!-- 使用指南卡片 -->
      <div class="help-grid">
        <div class="help-card">
          <div class="help-icon">🧱</div>
          <h4>基础数据</h4>
          <p>生成 UUID、随机字符串、数字或颜色值，秒速获取测试数据。</p>
          <code>a1b2-c3d4... | #ff0055</code>
        </div>
        <div class="help-card">
          <div class="help-icon">👤</div>
          <h4>个人信息</h4>
          <p>生成包含姓名、身份证、手机号等的虚拟画像，支持 JSON 导出。</p>
          <code>由 Mock.js 驱动</code>
        </div>
        <div class="help-card">
          <div class="help-icon">🔧</div>
          <h4>JSON 模拟</h4>
          <p>使用 Mock 模板语法自定义复杂数据结构。</p>
          <code>"list|5": [{"id|+1": 1}]</code>
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
  const currentTab = ref('basic');
  const resultText = ref('');

  const tabs = [
    { id: 'basic', icon: '🧱', label: '基础数据' },
    { id: 'text', icon: '📄', label: '文本文章' },
    { id: 'persona', icon: '👤', label: '个人信息' },
    { id: 'mock', icon: '🔧', label: 'JSON 模拟' }
  ];

  // --- 基础数据 ---
  const basic = reactive({
    uuidCount: 5,
    strLower: true,
    strUpper: true,
    strNum: true,
    strSymbol: false,
    strLen: 16,
    numMin: 0,
    numMax: 100
  });

  function genUUID() {
    const arr = [];
    for (let i = 0; i < basic.uuidCount; i++) arr.push(Mock.Random.guid());
    resultText.value = arr.join('\n');
  }

  function genString() {
    let pool = '';
    if (basic.strLower) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (basic.strUpper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (basic.strNum) pool += '0123456789';
    if (basic.strSymbol) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!pool) return ElMessage.warning('请选择至少一种字符类型');
    let res = '';
    for (let i = 0; i < basic.strLen; i++)
      res += pool.charAt(Math.floor(Math.random() * pool.length));
    resultText.value = res;
  }

  function genNumber() {
    const arr = [];
    for (let i = 0; i < 10; i++) arr.push(Mock.Random.integer(basic.numMin, basic.numMax));
    resultText.value = arr.join('\n');
  }

  function genColor(type) {
    const arr = [];
    for (let i = 0; i < 5; i++) {
      if (type === 'hex') arr.push(Mock.Random.hex());
      else if (type === 'rgb') arr.push(Mock.Random.rgb());
      else arr.push(Mock.Random.hsl());
    }
    resultText.value = arr.join('\n');
  }

  // --- 文本文章 ---
  const textOpt = reactive({ lang: 'zh', unit: 'paragraph', count: 3 });

  function genText() {
    const arr = [];
    const { lang, unit, count } = textOpt;
    for (let i = 0; i < count; i++) {
      if (lang === 'zh') {
        if (unit === 'word') arr.push(Mock.Random.cword(2, 5));
        else if (unit === 'sentence') arr.push(Mock.Random.csentence(5, 15));
        else arr.push(Mock.Random.cparagraph(3, 7));
      } else {
        if (unit === 'word') arr.push(Mock.Random.word(3, 10));
        else if (unit === 'sentence') arr.push(Mock.Random.sentence(5, 10));
        else arr.push(Mock.Random.paragraph(3, 5));
      }
    }
    resultText.value = arr.join('\n\n');
  }

  // --- 个人信息 ---
  const personaFieldLabels = {
    name: '姓名',
    id: '身份证',
    mobile: '手机号',
    email: '邮箱',
    address: '地址',
    ip: 'IP 地址',
    date: '日期'
  };

  const persona = reactive({
    count: 10,
    fields: {
      name: true,
      id: true,
      mobile: true,
      email: false,
      address: false,
      ip: false,
      date: false
    }
  });

  function genPersona() {
    const tpl = {};
    if (persona.fields.name) tpl['name'] = '@cname';
    if (persona.fields.id) tpl['id'] = '@id';
    if (persona.fields.mobile) tpl['mobile'] = /1\d{10}/;
    if (persona.fields.email) tpl['email'] = '@email';
    if (persona.fields.address) tpl['address'] = '@county(true) @ctitle(3,5)号';
    if (persona.fields.ip) tpl['ip'] = '@ip';
    if (persona.fields.date) tpl['date'] = '@date("yyyy-MM-dd")';
    if (!Object.keys(tpl).length) return ElMessage.warning('请选择至少一个字段');
    const data = Mock.mock({ [`list|${persona.count}`]: [tpl] });
    resultText.value = JSON.stringify(data.list, null, 2);
  }

  // --- JSON Mock ---
  const mockTemplate = ref(`{
  "list|5": [{
    "id|+1": 1,
    "name": "@cname",
    "age|18-60": 1,
    "city": "@city",
    "email": "@email"
  }]
}`);

  function genMock() {
    try {
      const func = new Function(`return ${mockTemplate.value}`);
      resultText.value = JSON.stringify(Mock.mock(func()), null, 2);
    } catch (e) {
      ElMessage.error('模板格式错误: ' + e.message);
    }
  }

  function fillMockDemo() {
    mockTemplate.value = `{
  "status": 0,
  "msg": "success",
  "data": {
    "list|5-10": [{
      "id|+1": 1001,
      "title": "@ctitle(5, 10)",
      "author": "@cname",
      "views|100-5000": 1,
      "public": "@boolean"
    }]
  }
}`;
  }

  function copyResult() {
    copyToClipboard(resultText.value, { success: '✔ 已复制到剪贴板' });
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
    gap: 1rem;
    flex-wrap: wrap;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
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

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .count-badge {
    background: #111;
    color: #ffd900;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #ffd900;
    box-shadow: 5px 5px 0px #ffd900;
  }

  /* Tab Bar */
  .tab-bar {
    display: flex;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    background: #fff;
  }

  .tab-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.85rem 0.5rem;
    border: none;
    border-right: 3px solid #111;
    background: transparent;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    color: #555;
    transition: all 0.1s;
    text-transform: uppercase;
  }

  .tab-btn:last-child {
    border-right: none;
  }
  .tab-btn:hover {
    background: #f0f0f0;
    color: #111;
  }
  .tab-btn.active {
    background: #111;
    color: #ffd900;
  }

  /* Grid */
  .brutal-grid {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 2.5rem;
    align-items: start;
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
    padding: 0.8rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
  }
  .text-white {
    color: #fff;
  }

  .config-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .config-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    letter-spacing: 0.5px;
  }

  .divider {
    height: 3px;
    background: #111;
    opacity: 0.12;
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .field-label {
    font-weight: 700;
    font-size: 0.9rem;
    color: #555;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.5rem 0.75rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: bold;
    font-size: 1rem;
    background: #fdfae5;
    color: #111;
    outline: none;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .brutal-input.num {
    width: 80px;
    text-align: center;
  }
  .brutal-input:focus {
    background: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }

  /* Check buttons */
  .check-group {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .check-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.35rem 0.7rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
  }

  .check-btn.on {
    background: #111;
    color: #ffd900;
    box-shadow: 0 0 0 #111;
  }

  /* Segment group */
  .seg-group {
    display: flex;
    border: 3px solid #111;
    box-shadow: 3px 3px 0px #111;
  }

  .seg-btn {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-right: 2px solid #111;
    background: #fff;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.1s;
  }

  .seg-btn:last-child {
    border-right: none;
  }
  .seg-btn:hover {
    background: #f0f0f0;
  }
  .seg-btn.active {
    background: #111;
    color: #ffd900;
  }

  /* Range */
  .brutal-range {
    width: 100%;
    height: 8px;
    -webkit-appearance: none;
    appearance: none;
    background: #e0e0e0;
    border: 2px solid #111;
    outline: none;
    cursor: pointer;
  }

  .brutal-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }

  /* Gen buttons */
  .gen-btn {
    background: #00e572;
    border: 3px solid #111;
    padding: 0.7rem 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    align-self: flex-start;
  }

  .gen-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .gen-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }
  .gen-btn.full {
    align-self: stretch;
  }
  .gen-btn.secondary {
    background: #fff;
  }

  .btn-row {
    display: flex;
    gap: 0.75rem;
  }

  /* Color buttons */
  .color-btn {
    border: 3px solid #111;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }

  .color-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .hex-btn {
    background: #ff4b4b;
    color: #fff;
  }
  .rgb-btn {
    background: #4b7bff;
    color: #fff;
  }
  .hsl-btn {
    background: #00e572;
    color: #111;
  }

  /* Field check grid */
  .field-check-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 0.5rem;
  }

  .field-check-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.5rem 0.25rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
    transition: all 0.1s;
    text-align: center;
  }

  .field-check-btn.on {
    background: #00e572;
    box-shadow: 0 0 0 #111;
  }
  .field-check-btn:hover {
    background: #f0f0f0;
  }
  .field-check-btn.on:hover {
    background: #00cc64;
  }

  /* Mock editor */
  .brutal-editor {
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', monospace;
    background: #fdfae5;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    font-weight: 600;
    resize: vertical;
    padding: 0.75rem;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .mock-editor {
    min-height: 200px;
  }

  /* Result Panel */
  .result-pane {
    min-height: 500px;
  }

  .result-actions {
    display: flex;
    gap: 0.5rem;
  }

  .action-btn {
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    color: #fff;
    transition: all 0.1s;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  .action-btn.danger {
    border-color: #ff9999;
    color: #ffcccc;
  }
  .action-btn.danger:hover {
    background: rgba(255, 75, 75, 0.3);
  }
  .action-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .result-textarea {
    flex: 1;
    width: 100%;
    min-height: 60vh;
    border: none;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    font-weight: 600;
    color: #111;
    line-height: 1.7;
    background: #fdfae5;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }

  /* Help Cards */
  .help-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
  }

  .help-card {
    border: 4px solid #111;
    background: #fff;
    padding: 1.5rem;
    box-shadow: 6px 6px 0px #111;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .help-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
  }

  .help-icon {
    font-size: 2rem;
  }

  .help-card h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    margin: 0;
    text-transform: uppercase;
  }

  .help-card p {
    color: #555;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }

  .help-card code {
    font-family: 'IBM Plex Mono', monospace;
    background: #111;
    color: #00e572;
    padding: 0.3rem 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;
    display: block;
    margin-top: 0.25rem;
    word-break: break-all;
  }

  @media (max-width: 900px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .tab-btn {
      font-size: 0.75rem;
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
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .tab-bar {
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .tab-btn {
    background: #1a1a1a;
    border-right-color: #eee;
    color: #aaa;
  }
  [data-theme='dark'] .tab-btn:hover {
    background: #333;
    color: #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }

  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #2a2a2a;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .check-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .check-btn.on {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .seg-group {
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .seg-btn {
    background: #1a1a1a;
    border-right-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .seg-btn:hover {
    background: #333;
  }
  [data-theme='dark'] .seg-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .gen-btn {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .gen-btn:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .gen-btn.secondary {
    background: #1a1a1a;
    color: #eee;
  }

  [data-theme='dark'] .field-check-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .field-check-btn.on {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .field-check-btn:hover {
    background: #333;
  }

  [data-theme='dark'] .brutal-editor {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .result-textarea {
    background: #111;
    color: #eee;
  }

  [data-theme='dark'] .help-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .help-card:hover {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .help-card h4 {
    color: #eee;
  }
  [data-theme='dark'] .help-card p {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .divider {
    opacity: 0.25;
  }
</style>
