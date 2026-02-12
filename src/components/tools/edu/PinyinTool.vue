<template>
  <div class="pinyin-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>拼音查询器</h1>
        <span class="nav-subtitle">Pinyin Converter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-layout glass-card">
        <section class="input-section">
          <div class="section-header">
            <label
              ><el-icon>
                <EditPen />
              </el-icon>
              输入内容</label
            >
            <button class="clear-btn" @click="inputText = ''">清空</button>
          </div>
          <textarea
            v-model="inputText"
            placeholder="请输入需要转换的汉字内容..."
            class="text-input"
          ></textarea>
        </section>

        <section class="options-bar">
          <div class="option-group">
            <span class="opt-label">声调格式</span>
            <div class="custom-radio-group">
              <label :class="{ active: toneType === 'symbol' }">
                <input v-model="toneType" type="radio" value="symbol" /> 符号 (ā)
              </label>
              <label :class="{ active: toneType === 'num' }">
                <input v-model="toneType" type="radio" value="num" /> 数字 (a1)
              </label>
              <label :class="{ active: toneType === 'none' }">
                <input v-model="toneType" type="radio" value="none" /> 无声
              </label>
            </div>
          </div>

          <div class="option-group">
            <span class="opt-label">展示模式</span>
            <div class="custom-radio-group">
              <label :class="{ active: viewMode === 'text' }">
                <input v-model="viewMode" type="radio" value="text" /> 纯拼音
              </label>
              <label :class="{ active: viewMode === 'ruby' }">
                <input v-model="viewMode" type="radio" value="ruby" /> 拼音对照
              </label>
            </div>
          </div>
        </section>

        <section class="result-section">
          <div class="section-header">
            <label
              ><el-icon>
                <Finished />
              </el-icon>
              转换结果</label
            >
            <button class="copy-btn" @click="copyResult">一键复制</button>
          </div>

          <div v-if="viewMode === 'text'" class="result-box text-mode">
            <div v-if="pinyinResult" class="result-text">{{ pinyinResult }}</div>
            <div v-else class="empty-hint">暂无结果</div>
          </div>

          <div v-else class="result-box ruby-mode">
            <div v-if="pinyinResultArray.length" class="ruby-grid">
              <div
                v-for="(item, idx) in pinyinResultArray"
                :key="idx"
                class="pinyin-card"
                :class="{ 'non-zh': !item.isChinese }"
              >
                <template v-if="item.isChinese">
                  <span class="py-val">{{ item.py }}</span>
                  <span class="char-val">{{ item.char }}</span>
                </template>
                <template v-else>
                  <span class="char-val single">{{ item.char }}</span>
                </template>
              </div>
            </div>
            <div v-else class="empty-hint">等待输入汉字内容...</div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, EditPen, Finished } from '@element-plus/icons-vue';
  import { pinyin } from 'pinyin-pro';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const inputText = ref('');
  const toneType = ref('symbol');
  const viewMode = ref('ruby');

  const pinyinResult = computed(() => {
    if (!inputText.value) return '';
    return pinyin(inputText.value, {
      toneType: toneType.value,
      type: 'string',
      nonZh: 'consecutive'
    });
  });

  const pinyinResultArray = computed(() => {
    if (!inputText.value) return [];

    const chars = Array.from(inputText.value);
    return chars.map(char => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        const py = pinyin(char, {
          toneType: toneType.value
        });
        return { char, py, isChinese: true };
      } else {
        return { char, isChinese: false };
      }
    });
  });

  const copyResult = () => {
    if (!pinyinResult.value) {
      ElMessage.warning('没有可复制的内容');
      return;
    }
    copyToClipboard(pinyinResult.value, { success: '已复制拼音结果' });
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .pinyin-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #10b981;
    --accent-bg: #ecfdf5;

    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--bg);
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
    transition: all 0.2s;
  }

  .nav-back:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
    letter-spacing: 1px;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header label {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .clear-btn,
  .copy-btn {
    font-size: 0.85rem;
    padding: 6px 16px;
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 12px;
    cursor: pointer;
    color: var(--text-2);
    transition: all 0.2s;
    font-weight: 500;
  }

  .clear-btn:hover {
    color: #ef4444;
    border-color: #fecaca;
    background: #fef2f2;
  }

  .copy-btn {
    background: var(--accent);
    color: white;
    border: none;
  }

  .copy-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .text-input {
    width: 100%;
    min-height: 140px;
    padding: 1.25rem;
    border: 2px solid var(--border);
    border-radius: 16px;
    font-size: 1.1rem;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    background: #fcfcfc;
    transition: all 0.2s;
    font-family: inherit;
  }

  .text-input:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 4px var(--accent-bg);
  }

  .options-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    padding: 1.5rem;
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 16px;
  }

  .option-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .opt-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .custom-radio-group {
    display: flex;
    gap: 0.5rem;
    background: #fff;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid var(--border);
  }

  .custom-radio-group label {
    padding: 6px 14px;
    font-size: 0.85rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
    color: var(--text-2);
    font-weight: 500;
  }

  .custom-radio-group input {
    display: none;
  }

  .custom-radio-group label.active {
    background: var(--accent);
    color: #fff;
  }

  .result-box {
    min-height: 160px;
    padding: 1.5rem;
    border: 2px dashed var(--border);
    border-radius: 16px;
    background: #fcfcfc;
    transition: all 0.3s;
  }

  .result-box.text-mode {
    font-size: 1.2rem;
    color: var(--accent);
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .ruby-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .pinyin-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid var(--border);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    min-width: 48px;
  }

  .pinyin-card.non-zh {
    justify-content: center;
    background: #f1f5f9;
    border-style: dashed;
  }

  .py-val {
    font-size: 0.9rem;
    color: var(--accent);
    font-weight: 600;
    margin-bottom: 2px;
  }

  .char-val {
    font-size: 1.4rem;
    font-family: 'Noto Serif SC', serif;
    color: var(--text);
  }

  .char-val.single {
    font-size: 1.1rem;
    color: var(--text-2);
  }

  .empty-hint {
    color: var(--text-2);
    text-align: center;
    display: flex;
    height: 100px;
    align-items: center;
    justify-content: center;
    font-style: italic;
    width: 100%;
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .options-bar {
      flex-direction: column;
      gap: 1.5rem;
    }
  }
</style>
