<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">ASCII 码对照表</h1>
        <span class="tool-subtitle">ASCII Character Table</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索字符或编码..."
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="table-section glass-card">
          <el-tabs v-model="activeRange" class="premium-tabs">
            <el-tab-pane label="标准 ASCII (0-127)" name="standard">
              <div class="table-wrapper">
                <el-table :data="filteredStandard" stripe border style="width: 100%" height="600">
                  <el-table-column prop="dec" label="DEC (十进制)" width="100" sortable fixed />
                  <el-table-column prop="hex" label="HEX (十六进制)" width="120" sortable />
                  <el-table-column prop="oct" label="OCT (八进制)" width="100" />
                  <el-table-column prop="bin" label="BIN (二进制)" width="150" />
                  <el-table-column prop="char" label="CHAR (字符)" min-width="120">
                    <template #default="{ row }">
                      <div class="char-cell">
                        <span class="char-val" :class="{ special: row.isSpecial }">{{
                          row.charDisplay
                        }}</span>
                        <span v-if="row.desc" class="char-desc">{{ row.desc }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="copyVal(row.charDisplay)"
                        >复制</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>

            <el-tab-pane label="扩展 ASCII (128-255)" name="extended">
              <div class="table-wrapper">
                <el-table :data="filteredExtended" stripe border style="width: 100%" height="600">
                  <el-table-column prop="dec" label="DEC" width="100" sortable fixed />
                  <el-table-column prop="hex" label="HEX" width="120" sortable />
                  <el-table-column prop="oct" label="OCT" width="100" />
                  <el-table-column prop="bin" label="BIN" width="150" />
                  <el-table-column prop="char" label="CHAR" min-width="120">
                    <template #default="{ row }">
                      <div class="char-cell">
                        <span class="char-val">{{ row.char }}</span>
                        <span class="char-desc">{{ row.htmlEntity }}</span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="copyVal(row.char)">复制</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>ASCII 知识卡片</h4>
        </div>
        <div class="tips-content">
          <div class="knowledge-grid">
            <div class="k-item">
              <b>什么是 ASCII？</b>
              <p>
                美国信息交换标准代码 (American Standard Code for Information
                Interchange)，是基于拉丁字母的一套电脑编码系统。
              </p>
            </div>
            <div class="k-item">
              <b>控制字符 (0-31)</b>
              <p>
                这些字符主要用于控制外围设备（如打印机）。例如：`LF` (10, 换行), `CR` (13, 回车)。
              </p>
            </div>
            <div class="k-item">
              <b>可打印字符 (32-126)</b>
              <p>包括数字、大小写字母和常用标点符号。`32` 是空格。</p>
            </div>
            <div class="k-item">
              <b>扩展 ASCII</b>
              <p>由 8 位二级制数表示，可表示 256 个字符，常用于显示特殊符号和非英语字母。</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - ASCII 码对照表</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Search, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
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

    for (let i = 128; i < 256; i++) {
      extended.push({
        dec: i,
        hex: i.toString(16).toUpperCase(),
        oct: i.toString(8),
        bin: i.toString(2).padStart(8, '0'),
        char: String.fromCharCode(i),
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
    navigator.clipboard.writeText(val).then(() => {
      ElMessage.success(`已复制: ${val}`);
    });
  };

  onMounted(initData);
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

  .search-input {
    width: 250px;
  }

  .tool-content {
    flex: 1;
    padding: 1.5rem;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
  }

  .layout-container {
    margin-bottom: 2rem;
  }

  .table-section {
    padding: 1rem;
  }

  .char-cell {
    display: flex;
    flex-direction: column;
  }

  .char-val {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1e293b;
    font-family: 'JetBrains Mono', monospace;
  }

  .char-val.special {
    color: #3b82f6;
    font-size: 0.9rem;
  }

  .char-desc {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
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

  .knowledge-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .k-item b {
    font-size: 0.9rem;
    color: #1e293b;
    display: block;
    margin-bottom: 0.4rem;
  }
  .k-item p {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: #f8fafc;
    border-radius: 8px;
    overflow: hidden;
  }

  @media (max-width: 800px) {
    .knowledge-grid {
      grid-template-columns: 1fr;
    }
    .search-input {
      width: 150px;
    }
  }
</style>
