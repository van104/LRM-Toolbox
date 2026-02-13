<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon><span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">盲文转换器</h1>
        <span class="tool-subtitle">Braille Translator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Refresh" @click="reset">重置</el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="layout-container">
        <div class="converter-grid">
          <div class="input-panel glass-card">
            <div class="panel-header">
              <span>普通文本 (Text)</span>
              <el-button text size="small" :icon="DocumentCopy" @click="copyText(inputText)"
                >复制</el-button
              >
            </div>
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="8"
              placeholder="在此输入需要转换的文字..."
              @input="textToBraille"
            />
          </div>

          <div class="arrow-container">
            <el-icon size="24"><Switch /></el-icon>
            <span class="hint">实时互转</span>
          </div>

          <div class="input-panel glass-card">
            <div class="panel-header">
              <span>盲文符号 (Braille)</span>
              <el-button text size="small" :icon="DocumentCopy" @click="copyText(brailleText)"
                >复制</el-button
              >
            </div>
            <el-input
              v-model="brailleText"
              type="textarea"
              :rows="8"
              class="braille-input"
              placeholder="在此输入或录入盲文符号..."
              @input="brailleToText"
            />
          </div>
        </div>

        <div class="interactive-braille glass-card">
          <div class="section-title">交互式盲文录入 (6点式)</div>
          <div class="braille-editor">
            <div class="dots-grid">
              <div
                v-for="dot in 6"
                :key="dot"
                class="dot"
                :class="{ active: currentDots.includes(dot) }"
                @click="toggleDot(dot)"
              >
                {{ dot }}
              </div>
            </div>
            <div class="actions">
              <div class="preview-char">{{ currentBrailleChar }}</div>
              <el-button :disabled="currentDots.length === 0" type="primary" @click="addBrailleChar"
                >添加字符</el-button
              >
              <el-button @click="currentDots = []">清除重置</el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-section glass-card">
        <div class="tips-header">
          <el-icon><InfoFilled /></el-icon>
          <h4>关于盲文 (Braille)</h4>
        </div>
        <div class="tips-content">
          <ul class="premium-list">
            <li>
              <b>六点系统</b>：经典的路易·布莱叶盲文系统基于 2x3 的六点阵，可以组成 64
              种不同的编码方案。
            </li>
            <li><b>转换原则</b>：本工具使用 Unicode 标准盲文图案（U+2800 到 U+28FF）。</li>
            <li>
              <b>局限性</b
              >：自动转换主要基于英文字母及基础标点。中文盲文较为复杂（涉及声母、韵母、声调组合），本工具提供基础对照转换。
            </li>
            <li>
              <b>无障碍设计</b
              >：通过本工具可以快速生成用于无障碍设计、触觉图形或特殊装饰的盲文文本。
            </li>
          </ul>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 盲文转换器</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { ArrowLeft, Refresh, DocumentCopy, Switch, InfoFilled } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/');
  };

  const inputText = ref('');
  const brailleText = ref('');
  const currentDots = ref([]);

  // 基础映射 (A-Z, 0-9)
  const textToBrailleMap = {
    a: '⠁',
    b: '⠃',
    c: '⠉',
    d: '⠙',
    e: '⠑',
    f: '⠋',
    g: '⠛',
    h: '⠓',
    i: '⠊',
    j: '⠚',
    k: '⠇',
    l: '⠸',
    m: '⠭',
    n: '⠽',
    o: '⠕',
    p: '⠏',
    q: '⠿',
    r: '⠗',
    s: '⠎',
    t: '⠞',
    u: '⠥',
    v: '⠧',
    w: '⠺',
    x: '⠭',
    y: '⠽',
    z: '⠵',
    1: '⠂',
    2: '⠆',
    3: '⠒',
    4: '⠲',
    5: '⠢',
    6: '⠖',
    7: '⠶',
    8: '⠦',
    9: '⠔',
    0: '⠴',
    ' ': '⠀',
    '.': '⠲',
    ',': '⠂',
    '!': '⠖',
    '?': '⠦',
    '-': '⠤'
  };

  const brailleToTextMap = Object.fromEntries(
    Object.entries(textToBrailleMap).map(([k, v]) => [v, k])
  );

  const textToBraille = () => {
    const chars = inputText.value.split('');
    brailleText.value = chars
      .map(char => {
        const lowerChar = char.toLowerCase();
        if (textToBrailleMap[lowerChar]) return textToBrailleMap[lowerChar];

        // Handle Chinese or special chars: Use pattern U+2800 (Blank) + 4 hex Unicode chars
        const hex = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
        return (
          '⠀' +
          hex
            .split('')
            .map(c => textToBrailleMap[c.toLowerCase()])
            .join('')
        );
      })
      .join('');
  };

  const brailleToText = () => {
    const symbols = brailleText.value.split('');
    let result = '';
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i] === '⠀' && i + 4 < symbols.length) {
        // Try to decode hex sequence
        const hex = symbols
          .slice(i + 1, i + 5)
          .map(s => brailleToTextMap[s] || '')
          .join('');
        if (hex.length === 4) {
          try {
            result += String.fromCharCode(parseInt(hex, 16));
            i += 4;
            continue;
          } catch {
            // fallback
          }
        }
      }
      result += brailleToTextMap[symbols[i]] || symbols[i];
    }
    inputText.value = result;
  };

  const toggleDot = dot => {
    const idx = currentDots.value.indexOf(dot);
    if (idx > -1) {
      currentDots.value.splice(idx, 1);
    } else {
      currentDots.value.push(dot);
    }
  };

  const currentBrailleChar = computed(() => {
    if (currentDots.value.length === 0) return '⠀';

    // Unicode Braille pattern offset calculation
    // 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 7: 64, 8: 128
    let offset = 0;
    if (currentDots.value.includes(1)) offset += 1;
    if (currentDots.value.includes(2)) offset += 2;
    if (currentDots.value.includes(3)) offset += 4;
    if (currentDots.value.includes(4)) offset += 8;
    if (currentDots.value.includes(5)) offset += 16;
    if (currentDots.value.includes(6)) offset += 32;

    return String.fromCharCode(0x2800 + offset);
  });

  const addBrailleChar = () => {
    brailleText.value += currentBrailleChar.value;
    brailleToText();
    currentDots.value = [];
  };

  const copyText = t => {
    if (!t) return;
    navigator.clipboard.writeText(t).then(() => {
      ElMessage.success('已复制');
    });
  };

  const reset = () => {
    inputText.value = '';
    brailleText.value = '';
    currentDots.value = [];
  };

  const init = () => {
    inputText.value = 'hello braille';
    textToBraille();
  };

  onMounted(init);
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

  .converter-grid {
    display: grid;
    grid-template-columns: 1fr 60px 1fr;
    align-items: center;
    gap: 1rem;
  }

  .input-panel {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #475569;
    font-size: 0.9rem;
  }

  .braille-input :deep(textarea) {
    font-size: 1.5rem;
    letter-spacing: 2px;
  }

  .arrow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #94a3b8;
  }

  .hint {
    font-size: 0.65rem;
    margin-top: 4px;
  }

  .interactive-braille {
    padding: 1.5rem;
  }

  .section-title {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  .braille-editor {
    display: flex;
    align-items: center;
    gap: 3rem;
    justify-content: center;
  }

  .dots-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .dot {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: white;
    border: 2px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: 700;
    color: #cbd5e1;
    transition: all 0.2s;
    user-select: none;
  }

  .dot.active {
    background: #3b82f6;
    border-color: #2563eb;
    color: white;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .preview-char {
    font-size: 4rem;
    color: #3b82f6;
    height: 100px;
    display: flex;
    align-items: center;
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

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 800px) {
    .converter-grid {
      grid-template-columns: 1fr;
    }
    .arrow-container {
      transform: rotate(90deg);
      margin: 1rem 0;
    }
    .braille-editor {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
</style>
