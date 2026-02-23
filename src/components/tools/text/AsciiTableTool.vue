<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goBack">← 返回</button>
        <h1 class="brutal-title">ASCII<span>对照表()</span></h1>
        <div class="badge">🔤 ASCII Table</div>
      </header>

      <main class="brutal-main">
        <div class="layout-grid">
          <section class="brutal-pane table-pane">
            <div class="pane-header bg-yellow">
              <span class="panel-title">标准与扩展 ASCII</span>
              <div class="panel-actions">
                <input
                  v-model="searchQuery"
                  class="brutal-input search-input"
                  placeholder="搜索字符或编码..."
                />
              </div>
            </div>

            <div class="mode-tabs">
              <button
                class="tab-btn"
                :class="{ active: activeRange === 'standard' }"
                @click="activeRange = 'standard'"
              >
                标准 ASCII (0-127)
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeRange === 'extended' }"
                @click="activeRange = 'extended'"
              >
                扩展 ASCII (128-255)
              </button>
            </div>

            <div class="table-scroll-area">
              <table v-if="activeRange === 'standard'" class="brutal-table">
                <thead>
                  <tr>
                    <th>DEC</th>
                    <th>HEX</th>
                    <th>OCT</th>
                    <th>BIN</th>
                    <th>CHAR</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredStandard" :key="row.dec">
                    <td>{{ row.dec }}</td>
                    <td>{{ row.hex }}</td>
                    <td>{{ row.oct }}</td>
                    <td>
                      <span class="mono-code">{{ row.bin }}</span>
                    </td>
                    <td>
                      <div class="char-cell">
                        <span class="char-val" :class="{ special: row.isSpecial }">{{
                          row.charDisplay
                        }}</span>
                        <span v-if="row.desc" class="char-desc">{{ row.desc }}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        class="brutal-btn min-btn bg-pink text-white"
                        @click="copyVal(row.charDisplay)"
                      >
                        复制
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table v-else class="brutal-table">
                <thead>
                  <tr>
                    <th>DEC</th>
                    <th>HEX</th>
                    <th>OCT</th>
                    <th>BIN</th>
                    <th>CHAR</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in filteredExtended" :key="row.dec">
                    <td>{{ row.dec }}</td>
                    <td>{{ row.hex }}</td>
                    <td>{{ row.oct }}</td>
                    <td>
                      <span class="mono-code">{{ row.bin }}</span>
                    </td>
                    <td>
                      <div class="char-cell">
                        <span class="char-val">{{ row.char }}</span>
                        <span class="char-desc">{{ row.htmlEntity }}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        class="brutal-btn min-btn bg-pink text-white"
                        @click="copyVal(row.char)"
                      >
                        复制
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 侧边栏卡片 -->
          <div class="side-panel">
            <section class="brutal-pane">
              <div class="pane-header bg-blue text-white">
                <span class="panel-title">💡 知识卡片</span>
              </div>
              <div class="tips-content">
                <div class="k-item">
                  <b>什么是 ASCII？</b>
                  <p>基于拉丁字母的电脑编码系统。</p>
                </div>
                <div class="k-item mt-2">
                  <b>控制字符 (0-31)</b>
                  <p>主要用于控制外围设备。如：<code>LF</code>(10), <code>CR</code>(13)。</p>
                </div>
                <div class="k-item mt-2">
                  <b>可打印字符 (32-126)</b>
                  <p>包括数字、字母和符号。<code>32</code> 是空格。</p>
                </div>
                <div class="k-item mt-2">
                  <b>扩展 ASCII</b>
                  <p>由 8 位二进制表示，可表示 256 个字符，显示特殊符号。</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useCopy } from '@/composables/useCopy';

  const router = useRouter();
  const { copyToClipboard } = useCopy();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const searchQuery = ref('');
  const activeRange = ref('standard');
  const standardData = ref([]);
  const extendedData = ref([]);

  const controlChars = {
    0: 'NUL (空字符)',
    1: 'SOH (标题开始)',
    2: 'STX (正文开始)',
    3: 'ETX (正文结束)',
    4: 'EOT (传输结束)',
    5: 'ENQ (询问)',
    6: 'ACK (确认)',
    7: 'BEL (响铃)',
    8: 'BS (退格)',
    9: 'HT (水平制表符)',
    10: 'LF (换行)',
    11: 'VT (垂直制表符)',
    12: 'FF (换页)',
    13: 'CR (回车)',
    14: 'SO (移出)',
    15: 'SI (移入)',
    16: 'DLE (数据链路转义)',
    17: 'DC1 (设备控制1)',
    18: 'DC2 (设备控制2)',
    19: 'DC3 (设备控制3)',
    20: 'DC4 (设备控制4)',
    21: 'NAK (否定确认)',
    22: 'SYN (同步空闲)',
    23: 'ETB (块传输结束)',
    24: 'CAN (取消)',
    25: 'EM (媒体结束)',
    26: 'SUB (替换)',
    27: 'ESC (退出)',
    28: 'FS (文件分隔符)',
    29: 'GS (组分隔符)',
    30: 'RS (记录分隔符)',
    31: 'US (单元分隔符)',
    32: 'Space (空格)',
    127: 'DEL (删除)'
  };

  const initData = () => {
    const standard = [];
    const extended = [];

    for (let i = 0; i < 128; i++) {
      const isSpecial = i <= 32 || i === 127;
      standard.push({
        dec: i,
        hex: i.toString(16).toUpperCase().padStart(2, '0'),
        oct: i.toString(8).padStart(3, '0'),
        bin: i.toString(2).padStart(8, '0'),
        charDisplay: isSpecial ? controlChars[i].split(' ')[0] : String.fromCharCode(i),
        desc: isSpecial ? controlChars[i].substring(controlChars[i].indexOf('(')) : '',
        isSpecial
      });
    }

    const extendedChars128To159 = [
      '€',
      ' ',
      '‚',
      'ƒ',
      '„',
      '…',
      '†',
      '‡',
      'ˆ',
      '‰',
      'Š',
      '‹',
      'Œ',
      ' ',
      'Ž',
      ' ',
      ' ',
      '‘',
      '’',
      '“',
      '”',
      '•',
      '–',
      '—',
      '˜',
      '™',
      'š',
      '›',
      'œ',
      ' ',
      'ž',
      'Ÿ'
    ];

    for (let i = 128; i < 256; i++) {
      let charStr = String.fromCharCode(i);
      if (i >= 128 && i <= 159) {
        charStr = extendedChars128To159[i - 128] || ' ';
      }

      if (i === 129 || i === 141 || i === 143 || i === 144 || i === 157) {
        charStr = '[未定义]'; // Windows-1252 未定义的控制字符显示为占位符
      } else if (i === 160) {
        charStr = '[NBSP(空格)]';
      }

      extended.push({
        dec: i,
        hex: i.toString(16).toUpperCase(),
        oct: i.toString(8),
        bin: i.toString(2).padStart(8, '0'),
        char: charStr,
        htmlEntity: `&#${i};`
      });
    }

    standardData.value = standard;
    extendedData.value = extended;
  };

  const filterData = data => {
    if (!searchQuery.value) return data;
    const q = searchQuery.value.toLowerCase();
    return data.filter(
      item =>
        item.dec.toString().includes(q) ||
        item.hex.toLowerCase().includes(q) ||
        (item.charDisplay && item.charDisplay.toLowerCase().includes(q)) ||
        (item.char && item.char.toLowerCase().includes(q)) ||
        (item.desc && item.desc.toLowerCase().includes(q))
    );
  };

  const filteredStandard = computed(() => filterData(standardData.value));
  const filteredExtended = computed(() => filterData(extendedData.value));

  const copyVal = val => {
    copyToClipboard(val, { success: `已复制: ${val}` });
  };

  onMounted(initData);
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
  .brutal-btn.min-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-btn.min-btn:hover:not(:disabled) {
    box-shadow: 3px 3px 0px #111;
    transform: translate(-1px, -1px);
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
    grid-template-columns: 1fr 340px;
    gap: 2rem;
    align-items: stretch;
    height: calc(100vh - 180px);
    min-height: 600px;
  }

  @media (max-width: 1024px) {
    .layout-grid {
      grid-template-columns: 1fr;
      height: auto;
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
    color: #111;
  }
  .bg-pink {
    background: #ff7be5;
    color: #111;
  }
  .bg-blue {
    background: #0ea5e9;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }
  .text-white.brutal-btn {
    color: #fff;
    border-color: #111;
  }
  .panel-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brutal-input {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    padding: 0.4rem 0.6rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.9rem;
    font-weight: 700;
    outline: none;
    box-shadow: 3px 3px 0px #111;
  }
  .brutal-input:focus {
    box-shadow: 4px 4px 0px #ff4b4b;
  }

  .mode-tabs {
    display: flex;
    border-bottom: 3px solid #111;
    background: #fdfae5;
  }
  .tab-btn {
    flex: 1;
    padding: 0.6rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    background: transparent;
    border: none;
    border-right: 3px solid #111;
    color: #111;
    cursor: pointer;
    transition: all 0.1s;
  }
  .tab-btn:last-child {
    border-right: none;
  }
  .tab-btn.active {
    background: #111;
    color: #ff7be5;
  }

  .table-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding: 0;
    background: #fff;
  }

  .brutal-table {
    width: 100%;
    border-collapse: collapse;
  }
  .brutal-table th,
  .brutal-table td {
    border-bottom: 2px solid #111;
    padding: 0.8rem;
    text-align: left;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
  }
  .brutal-table th {
    background: #ffd900;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    position: sticky;
    top: 0;
    z-index: 10;
    border-bottom: 3px solid #111;
  }
  .brutal-table tbody tr:hover {
    background: #fdfae5;
  }
  .brutal-table td {
    font-weight: 600;
  }

  .mono-code {
    background: #111;
    color: #ffd900;
    padding: 2px 4px;
    font-size: 0.85rem;
  }

  .char-cell {
    display: flex;
    flex-direction: column;
  }
  .char-val {
    font-size: 1.2rem;
    font-weight: 800;
    color: #111;
  }
  .char-val.special {
    color: #ff4b4b;
    font-size: 1rem;
  }
  .char-desc {
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.2rem;
  }

  .side-panel {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .tips-content {
    padding: 1.5rem;
    background: #fff;
  }
  .k-item {
    padding: 1rem;
    border: 2px dashed #111;
    background: #fdfae5;
  }
  .k-item b {
    display: block;
    margin-bottom: 0.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1rem;
    font-weight: 900;
    color: #ff4b4b;
  }
  .k-item p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .k-item code {
    background: #111;
    color: #fff;
    padding: 2px 4px;
    font-family: 'IBM Plex Mono', monospace;
  }
  .mt-2 {
    margin-top: 1rem;
  }

  /* Dark theme */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
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
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
    background: #222;
  }
  [data-theme='dark'] .tab-btn {
    color: #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .table-scroll-area {
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-table th,
  [data-theme='dark'] .brutal-table td {
    border-color: #555;
  }
  [data-theme='dark'] .brutal-table th {
    background: #333;
    color: #eee;
  }
  [data-theme='dark'] .brutal-table tbody tr:hover {
    background: #222;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .char-val {
    color: #eee;
  }
  [data-theme='dark'] .char-val.special {
    color: #ff4b4b;
  }
  [data-theme='dark'] .char-desc {
    color: #aaa;
  }
  [data-theme='dark'] .tips-content {
    background: #1a1a1a;
  }
  [data-theme='dark'] .k-item {
    background: #222;
    border-color: #555;
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
</style>
