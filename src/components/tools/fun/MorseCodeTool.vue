<template>
  <div class="morse-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>摩斯密码翻译器</h1>
        <span class="nav-subtitle">Morse Code Translator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <div class="translator-grid">
          <!-- Text Input -->
          <section class="io-section">
            <div class="section-header">
              <label
                ><el-icon><EditPen /></el-icon> 普通文本 / Text</label
              >
              <div class="ctrl-btns">
                <button class="icon-btn" title="清除" @click="textInput = ''">
                  <el-icon><Delete /></el-icon>
                </button>
                <button class="icon-btn" title="复制" @click="copy(textInput)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <textarea
              v-model="textInput"
              placeholder="输入文字进行转换 (支持中英文)..."
              class="custom-textarea"
              @input="handleTextInput"
            ></textarea>
          </section>

          <!-- Swap Button -->
          <div class="swap-divider">
            <el-icon class="swap-icon"><Sort /></el-icon>
          </div>

          <!-- Morse Input -->
          <section class="io-section">
            <div class="section-header">
              <label
                ><el-icon><ChatDotRound /></el-icon> 摩斯电码 / Morse Code</label
              >
              <div class="ctrl-btns">
                <button class="icon-btn" title="播放" :disabled="isPlaying" @click="playMorse">
                  <el-icon><VideoPlay v-if="!isPlaying" /><Loading v-else /></el-icon>
                </button>
                <button class="icon-btn" title="清除" @click="morseInput = ''">
                  <el-icon><Delete /></el-icon>
                </button>
                <button class="icon-btn" title="复制" @click="copy(morseInput)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <textarea
              v-model="morseInput"
              placeholder="输入摩斯电码 ( . 和 - )..."
              class="custom-textarea morse-font"
              @input="handleMorseInput"
            ></textarea>
          </section>
        </div>

        <!-- Settings Bar -->
        <section class="settings-bar">
          <div class="setting-item">
            <span>音调 (Hz):</span>
            <el-slider v-model="audioSettings.frequency" :min="400" :max="1200" :step="10" />
          </div>
          <div class="setting-item">
            <span>语速 (WPM):</span>
            <el-slider v-model="audioSettings.wpm" :min="5" :max="40" />
          </div>
        </section>

        <!-- Dictionary Table (Collapsible) -->
        <section class="dict-section">
          <div class="section-header clickable" @click="showDict = !showDict">
            <label
              ><el-icon><List /></el-icon> 电码对照表</label
            >
            <el-icon :class="{ rotated: showDict }"><ArrowRight /></el-icon>
          </div>
          <div v-show="showDict" class="dict-grid">
            <div v-for="(code, char) in morseDict" :key="char" class="dict-item">
              <span class="char">{{ char }}</span>
              <span class="code">{{ code }}</span>
            </div>
          </div>
        </section>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 摩斯密码翻译器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import {
    Back,
    EditPen,
    ChatDotRound,
    Sort,
    Delete,
    CopyDocument,
    VideoPlay,
    Loading,
    List,
    ArrowRight
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  import { useClipboard } from '@vueuse/core';

  const { copy: copyText } = useClipboard();
  const textInput = ref('');
  const morseInput = ref('');
  const isPlaying = ref(false);
  const showDict = ref(false);

  const audioSettings = reactive({
    frequency: 600,
    wpm: 20
  });

  const morseDict: Record<string, string> = {
    A: '.-',
    B: '-...',
    C: '-.-.',
    D: '-..',
    E: '.',
    F: '..-.',
    G: '--.',
    H: '....',
    I: '..',
    J: '.---',
    K: '-.-',
    L: '.-..',
    M: '--',
    N: '-.',
    O: '---',
    P: '.--.',
    Q: '--.-',
    R: '.-.',
    S: '...',
    T: '-',
    U: '..-',
    V: '...-',
    W: '.--',
    X: '-..-',
    Y: '-.--',
    Z: '--..',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '0': '-----',
    ' ': '/',
    '.': '.-.-.-',
    ',': '--..--',
    '?': '..--..',
    "'": '.----.',
    '!': '-.-.--',
    '/': '-..-.',
    '(': '-.--.',
    ')': '-.--.-',
    '&': '.-...',
    ':': '---...',
    ';': '-.-.-.',
    '=': '-...-',
    '+': '.-.-.',
    '-': '-....-',
    _: '..--.-',
    '"': '.-..-.',
    $: '...-..-',
    '@': '.--.-.'
  };

  const reverseDict = Object.fromEntries(Object.entries(morseDict).map(([k, v]) => [v, k]));

  const encode = (text: string) => {
    return [...text]
      .map(char => {
        const upperChar = char.toUpperCase();
        if (morseDict[upperChar]) return morseDict[upperChar];
        // 中文或特殊字符转换: 使用 _ + 4位16进制Unicode
        const hex = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
        return [morseDict['_'], ...hex.split('').map(c => morseDict[c])].join(' ');
      })
      .join('   '); // 字符之间用三个空格隔开，更易识别
  };

  const decode = (morse: string) => {
    const parts = morse.split('   ').filter(p => p.trim());
    return parts
      .map(part => {
        const units = part.split(' ');
        if (units[0] === morseDict['_']) {
          // 处理 Unicode 序列
          const hex = units
            .slice(1)
            .map(u => reverseDict[u] || '')
            .join('');
          try {
            return String.fromCharCode(parseInt(hex, 16));
          } catch {
            return '?';
          }
        }
        // 处理普通字符
        return units.map(u => reverseDict[u] || '?').join('');
      })
      .join('');
  };

  const handleTextInput = () => {
    morseInput.value = encode(textInput.value);
  };

  const handleMorseInput = () => {
    textInput.value = decode(morseInput.value);
  };

  const copy = (text: string) => {
    if (!text) return;
    copyText(text);
    ElMessage.success('已复制到剪贴板');
  };

  const playMorse = async () => {
    if (isPlaying.value || !morseInput.value) return;
    isPlaying.value = true;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const dotDuration = 1.2 / audioSettings.wpm;

      const playPart = async (duration: number) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(audioSettings.frequency, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration - 0.01);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
        await new Promise(r => setTimeout(r, duration * 1000));
      };

      for (const char of morseInput.value) {
        if (!isPlaying.value) break;
        if (char === '.') await playPart(dotDuration);
        else if (char === '-') await playPart(dotDuration * 3);
        else if (char === ' ') await new Promise(r => setTimeout(r, dotDuration * 3000));
        else if (char === '/') await new Promise(r => setTimeout(r, dotDuration * 7000));
        await new Promise(r => setTimeout(r, dotDuration * 1000));
      }

      await audioCtx.close();
    } catch (err) {
      console.error(err);
    } finally {
      isPlaying.value = false;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

  .morse-tool {
    --bg: #fdfcfb;
    --card: #ffffff;
    --border: #f0ebe4;
    --text: #4a4540;
    --text-2: #9b948d;
    --accent: #d4a373;
    --accent-bg: #fefae0;

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
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
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
    background: transparent;
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

  .nav-center {
    flex: 1;
    text-align: center;
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
    text-align: center;
    display: block;
    letter-spacing: 1.5px;
  }

  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 28px;
    padding: 2.5rem;
    box-shadow: 0 15px 40px -10px rgba(0, 0, 0, 0.05);
  }

  .translator-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .io-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .section-header label {
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
  }

  .ctrl-btns {
    display: flex;
    gap: 0.5rem;
  }
  .icon-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: #faf9f7;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--text-2);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon-btn:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }
  .icon-btn:disabled {
    opacity: 0.5;
    cursor: wait;
  }

  .custom-textarea {
    width: 100%;
    min-height: 150px;
    padding: 1.25rem;
    border: 2px solid var(--border);
    border-radius: 18px;
    font-size: 1.1rem;
    line-height: 1.6;
    outline: none;
    transition: all 0.3s;
    background: #fafaf9;
    resize: vertical;
  }
  .custom-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-bg);
    background: #fff;
  }

  .morse-font {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    letter-spacing: 2px;
  }

  .swap-divider {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }
  .swap-icon {
    font-size: 1.5rem;
    color: var(--text-2);
    opacity: 0.4;
  }

  .settings-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2.5rem;
    padding: 1.5rem;
    background: #faf9f7;
    border-radius: 20px;
    margin-top: 2.5rem;
  }
  .setting-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .setting-item span {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-2);
    text-transform: uppercase;
  }

  .dict-section {
    margin-top: 2.5rem;
    border-top: 1px dashed var(--border);
    padding-top: 1.5rem;
  }
  .clickable {
    cursor: pointer;
    user-select: none;
  }
  .rotated {
    transform: rotate(90deg);
  }
  .dict-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
    margin-top: 1.5rem;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dict-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 0.75rem;
    background: #faf9f7;
    border-radius: 12px;
    border: 1px solid var(--border);
  }
  .dict-item .char {
    font-weight: 900;
    font-size: 1.1rem;
    color: var(--text);
  }
  .dict-item .code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: var(--accent);
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    .settings-bar {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
