<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Encoding<span>.查看()</span></h1>
        <div class="badge">🔢 Text Byte Analyzer</div>
      </header>

      <main class="brutal-grid">
        <!-- Input Section -->
        <section class="brutal-pane input-pane">
          <div class="pane-header bg-yellow">
            <span>📝 输入内容 (INPUT)</span>
          </div>
          <div class="pane-body">
            <textarea
              v-model="encodingText"
              class="brutal-textarea"
              placeholder="在此输入文字，实时分析 UTF-8、GBK、ASCII 编码长度..."
              rows="8"
            ></textarea>
            <div class="char-count">
              <span class="count-val">{{ encodingText.length }}</span>
              <span class="count-label">字符数</span>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <div class="stats-column">
          <!-- Byte Counts -->
          <div class="brutal-pane stats-pane">
            <div class="pane-header bg-pink">
              <span>📊 编码统计 (BYTE STATS)</span>
            </div>
            <div class="pane-body stats-grid">
              <div class="stat-card bg-white">
                <label>UTF-8 字节数</label>
                <div class="value">{{ getByteLen(encodingText, 'utf8') }}</div>
                <div class="visual-bytes">
                  <span
                    v-for="(b, i) in getBytes(encodingText).slice(0, 16)"
                    :key="i"
                    class="byte-pill"
                    >{{ b }}</span
                  >
                  <span v-if="getByteLen(encodingText, 'utf8') > 16" class="more-indicator"
                    >...</span
                  >
                </div>
              </div>

              <div class="stat-card bg-white">
                <label>GBK/GB2312 字节数</label>
                <div class="value">{{ getByteLen(encodingText, 'gbk') }}</div>
                <div class="hint">中文: 2字节 | 英文: 1字节</div>
              </div>

              <div class="stat-card bg-white">
                <label>ASCII 兼容性</label>
                <div :class="['status-box', isAscii ? 'status-ok' : 'status-warn']">
                  {{ isAscii ? '✓ 纯 ASCII' : '⚠ 包含非 ASCII' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Documentation / Tips -->
          <div class="brutal-pane info-pane">
            <div class="pane-header bg-blue">
              <span>💡 编码常识 (KNOWLEDGE)</span>
            </div>
            <div class="pane-body">
              <ul class="brutal-list">
                <li><strong>UTF-8</strong>: 变长编码，汉字通常占 3 字节，表情符号 4 字节。</li>
                <li><strong>GBK</strong>: 中文国标扩充，汉字固定占 2 字节（老系统常用）。</li>
                <li>
                  <strong>乱码提示</strong>: 当你看到 "锟斤拷" 或 "烫烫烫" 时，通常是编码转换错误。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const encodingText = ref('你好 LRM-Toolbox 🚀');

  // eslint-disable-next-line no-control-regex
  const isAscii = computed(() => /^[\u0000-\u007F]*$/.test(encodingText.value));

  const getByteLen = (str: string, charset: string) => {
    if (!str) return 0;
    if (charset === 'gbk') {
      let len = 0;
      for (let i = 0; i < str.length; i++) {
        len += str.charCodeAt(i) > 255 ? 2 : 1;
      }
      return len;
    }
    return new Blob([str]).size;
  };

  const getBytes = (str: string) => {
    if (!str) return [];
    try {
      const encoder = new TextEncoder();
      const arr = encoder.encode(str);
      return Array.from(arr).map(b => b.toString(16).toUpperCase().padStart(2, '0'));
    } catch {
      return [];
    }
  };
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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Header */
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
    text-shadow: 4px 4px 0px #d946ef;
  }

  .brutal-title span {
    color: #d946ef;
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

  .badge {
    background: #d946ef;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Layout */
  .brutal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .stats-column {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 0.8rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .bg-blue {
    background: #3b82f6;
    color: #fff;
  }

  .pane-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Input Area */
  .brutal-textarea {
    width: 100%;
    border: 4px solid #111;
    padding: 1.2rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.2rem;
    font-weight: 700;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    resize: vertical;
    box-sizing: border-box;
  }

  .char-count {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .count-val {
    font-size: 3rem;
    font-weight: 900;
    color: #111;
  }

  .count-label {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    color: #888;
  }

  /* Stats Grid */
  .stats-grid {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-card {
    border: 3px solid #111;
    padding: 1.25rem;
    box-shadow: 5px 5px 0px #111;
  }

  .stat-card label {
    display: block;
    font-size: 0.75rem;
    font-weight: 900;
    color: #888;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .stat-card .value {
    font-size: 2.2rem;
    font-weight: 900;
    color: #111;
    line-height: 1;
  }

  .stat-card .hint {
    font-size: 0.7rem;
    font-weight: 700;
    color: #aaa;
    margin-top: 0.4rem;
  }

  .visual-bytes {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 1rem;
  }

  .byte-pill {
    background: #111;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .more-indicator {
    color: #888;
    font-weight: 900;
    font-size: 1rem;
  }

  .status-box {
    display: inline-block;
    padding: 0.5rem 1rem;
    font-weight: 800;
    border: 3px solid #111;
  }

  .status-ok {
    background: #00e572;
    color: #111;
  }
  .status-warn {
    background: #ffd900;
    color: #111;
  }

  /* Info List */
  .brutal-list {
    margin: 0;
    padding-left: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .brutal-list li {
    font-size: 0.95rem;
    font-weight: 600;
    line-height: 1.6;
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
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
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9b2d87;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #1e3a8a;
  }

  [data-theme='dark'] .brutal-textarea {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .stat-card {
    border-color: #eee;
    background: #1a1a1a;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .stat-card .value {
    color: #eee;
  }
  [data-theme='dark'] .count-val {
    color: #eee;
  }
  [data-theme='dark'] .byte-pill {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .status-box {
    border-color: #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
</style>
