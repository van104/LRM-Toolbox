<template>
  <div class="tone-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>语气句式转换</h1>
        <span class="nav-subtitle">Tone Converter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="input-section">
          <label>输入句子</label>
          <textarea v-model="inputText" placeholder="例如：我想请假一天。"></textarea>
        </div>

        <div class="modes-section">
          <div class="mode-headers">
            <button :class="{ active: mode === 'question' }" @click="mode = 'question'">
              疑问/探询
            </button>
            <button :class="{ active: mode === 'polite' }" @click="mode = 'polite'">
              温和/委婉
            </button>
            <button :class="{ active: mode === 'formal' }" @click="mode = 'formal'">
              正式/书面
            </button>
            <button :class="{ active: mode === 'customer' }" @click="mode = 'customer'">
              客服/礼貌
            </button>
          </div>
        </div>

        <div class="output-section">
          <label>转换结果</label>
          <div class="result-box">
            {{ resultText }}
          </div>
          <button class="copy-btn" @click="copy">复制结果</button>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 语气句式转换工具</footer>

    <Transition name="toast">
      <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const inputText = ref('');
  const mode = ref('polite');
  const toastMsg = ref('');

  const resultText = computed(() => {
    let text = inputText.value.trim();
    if (!text) return '...';

    const lastChar = text.slice(-1);
    const hasPunctuation = ['。', '！', '.', '!'].includes(lastChar);
    let cleanText = hasPunctuation ? text.slice(0, -1) : text;

    if (mode.value === 'question') {
      return cleanText + '吗？';
    }

    if (mode.value === 'polite') {
      cleanText = cleanText.replace(/我要/g, '我想').replace(/不行/g, '可能不太方便');
      return cleanText + '行吗？';
    }

    if (mode.value === 'formal') {
      const map = {
        说: '表示',
        觉得: '认为',
        看看: '查阅',
        大约: '约',
        需要: '需',
        买: '采购',
        卖: '销售',
        钱: '资金',
        能不能: '是否可以',
        对不对: '是否正确',
        哪里: '何处',
        时候: '时',
        因为: '由于'
      };
      Object.keys(map).forEach(key => {
        cleanText = cleanText.replace(new RegExp(key, 'g'), map[key]);
      });
      return cleanText + '。';
    }

    if (mode.value === 'customer') {
      return '亲，' + cleanText + '呢~ 感谢您的理解与支持！';
    }

    return text;
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resultText.value);
      toastMsg.value = '已复制';
      setTimeout(() => (toastMsg.value = ''), 1500);
    } catch {
      // Ignore copy errors
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .tone-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #ec4899;

    font-family: 'Noto Sans SC', sans-serif;
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
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .input-section textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1.1rem;
    outline: none;
    margin-top: 0.5rem;
    resize: vertical;
    min-height: 100px;
  }

  .input-section textarea:focus {
    border-color: var(--accent);
  }

  .modes-section {
    margin: 1.5rem 0;
  }

  .mode-headers {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .mode-headers button {
    padding: 0.5rem 1.2rem;
    background: #f3f4f6;
    border: 1px solid transparent;
    border-radius: 100px;
    cursor: pointer;
    color: var(--text-2);
    transition: all 0.2s;
  }

  .mode-headers button.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3);
  }

  .output-section .result-box {
    margin-top: 0.5rem;
    padding: 1.5rem;
    background: #fdf2f8;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 500;
    color: #831843;
    min-height: 80px;
    display: flex;
    align-items: center;
  }

  .copy-btn {
    margin-top: 1rem;
    width: 100%;
    padding: 0.8rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
  }

  .copy-btn:hover {
    opacity: 0.9;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
  }

  .toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    font-size: 0.9rem;
    z-index: 200;
  }

  .toast-enter-active,
  .toast-leave-active {
    transition: opacity 0.3s;
  }

  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
  }
</style>
