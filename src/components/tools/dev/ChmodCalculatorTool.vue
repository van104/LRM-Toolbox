<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Chmod<span>.权限()</span></h1>
        <div class="badge">🛡️ Linux Permission</div>
      </header>

      <div class="brutal-layout">
        <main class="perm-selection">
          <!-- Selection Grid -->
          <div class="brutal-pane selection-pane">
            <div class="pane-header bg-yellow">
              <span>🖱️ 交互选择 (PERMISSION MATRIX)</span>
              <button class="action-btn" @click="reset">🔄 重置</button>
            </div>
            <div class="perm-matrix">
              <!-- Owner Column -->
              <div class="user-col">
                <div class="col-head">
                  <span class="icon">👤</span>
                  <span class="name">所有者 (Owner)</span>
                </div>
                <div class="btn-group">
                  <button :class="['matrix-btn', { active: owner.r }]" @click="owner.r = !owner.r">
                    <span class="char">r</span><span class="label">读取 (4)</span>
                  </button>
                  <button :class="['matrix-btn', { active: owner.w }]" @click="owner.w = !owner.w">
                    <span class="char">w</span><span class="label">写入 (2)</span>
                  </button>
                  <button :class="['matrix-btn', { active: owner.x }]" @click="owner.x = !owner.x">
                    <span class="char">x</span><span class="label">执行 (1)</span>
                  </button>
                </div>
              </div>

              <!-- Group Column -->
              <div class="user-col">
                <div class="col-head">
                  <span class="icon">👥</span>
                  <span class="name">用户组 (Group)</span>
                </div>
                <div class="btn-group">
                  <button :class="['matrix-btn', { active: group.r }]" @click="group.r = !group.r">
                    <span class="char">r</span><span class="label">读取 (4)</span>
                  </button>
                  <button :class="['matrix-btn', { active: group.w }]" @click="group.w = !group.w">
                    <span class="char">w</span><span class="label">写入 (2)</span>
                  </button>
                  <button :class="['matrix-btn', { active: group.x }]" @click="group.x = !group.x">
                    <span class="char">x</span><span class="label">执行 (1)</span>
                  </button>
                </div>
              </div>

              <!-- Others Column -->
              <div class="user-col">
                <div class="col-head">
                  <span class="icon">🌍</span>
                  <span class="name">其他 (Others)</span>
                </div>
                <div class="btn-group">
                  <button
                    :class="['matrix-btn', { active: others.r }]"
                    @click="others.r = !others.r"
                  >
                    <span class="char">r</span><span class="label">读取 (4)</span>
                  </button>
                  <button
                    :class="['matrix-btn', { active: others.w }]"
                    @click="others.w = !others.w"
                  >
                    <span class="char">w</span><span class="label">写入 (2)</span>
                  </button>
                  <button
                    :class="['matrix-btn', { active: others.x }]"
                    @click="others.x = !others.x"
                  >
                    <span class="char">x</span><span class="label">执行 (1)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Presets Pane -->
          <div class="brutal-pane preset-pane">
            <div class="pane-header bg-green">
              <span>⭐ 常用预设 (PRESETS)</span>
            </div>
            <div class="preset-grid">
              <button
                v-for="p in presets"
                :key="p.code"
                class="preset-item"
                @click="applyPreset(p.code)"
              >
                <code class="p-code">{{ p.code }}</code>
                <span class="p-desc">{{ p.desc }}</span>
              </button>
            </div>
          </div>
        </main>

        <aside class="result-display">
          <!-- Results Area -->
          <div class="brutal-pane result-pane">
            <div class="pane-header bg-blue">
              <span>📊 计算结果</span>
            </div>
            <div class="result-content">
              <!-- Octal Card -->
              <div class="result-card octal-card">
                <label>八进制 (OCTAL)</label>
                <div class="val-wrap">
                  <span class="val">{{ octalCode }}</span>
                  <button class="small-copy" @click="copy(octalCode)">📋</button>
                </div>
              </div>
              <!-- Symbol Card -->
              <div class="result-card symbol-card">
                <label>符号标识 (SYMBOLIC)</label>
                <div class="val-wrap">
                  <span class="val">{{ symbolCode }}</span>
                  <button class="small-copy" @click="copy(symbolCode)">📋</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Command Card (Standalone Look) -->
          <div class="command-pane brutal-pane">
            <div class="pane-header bg-pink">
              <span>💻 指令 (SHELL)</span>
            </div>
            <div class="cmd-inner">
              <code class="bash-cmd"
                >chmod {{ octalCode }} <span class="placeholder">file_name</span></code
              >
              <button class="copy-cmd-btn" @click="copy(`chmod ${octalCode} file_name`)">
                复制指令
              </button>
            </div>
          </div>

          <!-- Info Table -->
          <div class="brutal-pane info-pane">
            <div class="pane-body">
              <table class="brutal-table">
                <thead>
                  <tr>
                    <th>等效</th>
                    <th>权值</th>
                    <th>描述</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>r</td>
                    <td>4</td>
                    <td>Read (读取)</td>
                  </tr>
                  <tr>
                    <td>w</td>
                    <td>2</td>
                    <td>Write (写入)</td>
                  </tr>
                  <tr>
                    <td>x</td>
                    <td>1</td>
                    <td>Execute (执行)</td>
                  </tr>
                  <tr class="faded">
                    <td>-</td>
                    <td>0</td>
                    <td>无权限</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const owner = reactive({ r: true, w: true, x: false });
  const group = reactive({ r: true, w: false, x: false });
  const others = reactive({ r: true, w: false, x: false });

  const calculateDigit = (p: { r: boolean; w: boolean; x: boolean }) => {
    return (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
  };

  const calculateSymbol = (p: { r: boolean; w: boolean; x: boolean }) => {
    return (p.r ? 'r' : '-') + (p.w ? 'w' : '-') + (p.x ? 'x' : '-');
  };

  const octalCode = computed(() => {
    return `${calculateDigit(owner)}${calculateDigit(group)}${calculateDigit(others)}`;
  });

  const symbolCode = computed(() => {
    return calculateSymbol(owner) + calculateSymbol(group) + calculateSymbol(others);
  });

  const presets = [
    { code: '777', desc: '全部公开 (不安全)' },
    { code: '755', desc: '常用程序/目录' },
    { code: '644', desc: '常用文件' },
    { code: '600', desc: '私有文件' },
    { code: '700', desc: '私有目录' },
    { code: '400', desc: '只读文件' }
  ];

  const applyPreset = (code: string) => {
    const digits = code.split('').map(Number);
    const set = (p: { r: boolean; w: boolean; x: boolean }, d: number) => {
      p.r = !!(d & 4);
      p.w = !!(d & 2);
      p.x = !!(d & 1);
    };
    set(owner, digits[0]);
    set(group, digits[1]);
    set(others, digits[2]);
  };

  const reset = () => applyPreset('644');
  const copy = (t: string) => copyToClipboard(t, { success: '✔ 已复制' });
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
    max-width: 1300px;
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
    text-shadow: 4px 4px 0px #ff7c2e;
  }

  .brutal-title span {
    color: #ff7c2e;
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
    background: #ff7c2e;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Layout */
  .brutal-layout {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
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
  .bg-green {
    background: #00e572;
  }
  .bg-blue {
    background: #3b82f6;
    color: #fff;
  }
  .bg-pink {
    background: #ff7be5;
  }

  .action-btn {
    border: 3px solid #111;
    background: #fff;
    padding: 0.2rem 0.6rem;
    font-family: 'IBM Plex Mono', sans-serif;
    font-weight: 800;
    cursor: pointer;
  }

  /* Matrix Section */
  .perm-matrix {
    display: flex;
    gap: 4px;
    background: #111;
    padding: 4px;
  }
  .user-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
  }
  .col-head {
    padding: 1rem;
    border-bottom: 3px solid #111;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  .col-head .icon {
    font-size: 1.5rem;
  }
  .col-head .name {
    font-size: 0.7rem;
    font-weight: 900;
    color: #666;
    text-transform: uppercase;
    text-align: center;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
  }
  .matrix-btn {
    border: none;
    border-bottom: 3px solid #111;
    padding: 1.5rem 0.5rem;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    transition: all 0.1s;
  }
  .matrix-btn:last-child {
    border-bottom: none;
  }
  .matrix-btn.active {
    background: #eee;
  }
  .matrix-btn .char {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.8rem;
    font-weight: 800;
    color: #888;
  }
  .matrix-btn.active .char {
    color: #10b981;
  }
  .matrix-btn .label {
    font-size: 0.75rem;
    font-weight: 800;
    color: #aaa;
    text-transform: uppercase;
  }
  .matrix-btn.active .label {
    color: #111;
  }

  /* Presets */
  .preset-pane {
    margin-top: 2rem;
  }
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem;
    background: #fafafa;
  }
  .preset-item {
    padding: 1rem;
    border: 3px solid #111;
    background: #fff;
    cursor: pointer;
    transition: all 0.1s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  .preset-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #111;
    border-color: #3b82f6;
  }
  .p-code {
    font-size: 1.5rem;
    font-weight: 900;
    color: #3b82f6;
  }
  .p-desc {
    font-size: 0.7rem;
    font-weight: 700;
    color: #999;
    text-align: center;
  }

  /* Result Area */
  .result-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: #fff;
  }
  .result-card {
    border: 4px solid #111;
    padding: 1.25rem;
    box-shadow: 6px 6px 0px #111;
  }
  .result-card label {
    display: block;
    font-size: 0.75rem;
    font-weight: 900;
    color: #888;
    margin-bottom: 0.5rem;
  }
  .val-wrap {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .val {
    font-size: 2.5rem;
    font-weight: 900;
    color: #111;
    line-height: 1;
  }
  .symbol-card .val {
    font-size: 2rem;
    letter-spacing: 4px;
    color: #3b82f6;
  }
  .small-copy {
    border: 3px solid #111;
    background: #ffd900;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .command-pane {
    margin-top: 2rem;
  }
  .cmd-inner {
    padding: 1.5rem;
    background: #111;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bash-cmd {
    color: #00e572;
    font-size: 1.2rem;
    font-weight: 700;
  }
  .placeholder {
    color: #888;
    font-style: italic;
  }
  .copy-cmd-btn {
    background: #ff7be5;
    border: 3px solid #fff;
    color: #fff;
    padding: 0.5rem 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    cursor: pointer;
  }

  .info-pane {
    margin-top: 2rem;
    border-top: 4px solid #111;
  }
  .pane-body {
    padding: 1rem;
  }
  .brutal-table {
    width: 100%;
    border-collapse: collapse;
  }
  .brutal-table th {
    text-align: left;
    font-size: 0.75rem;
    color: #aaa;
    padding: 0.5rem;
    border-bottom: 2px solid #eee;
  }
  .brutal-table td {
    padding: 0.75rem 0.5rem;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .faded td {
    color: #ccc;
  }

  @media (max-width: 1024px) {
    .brutal-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.2rem;
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
  [data-theme='dark'] .bg-green {
    background: #007a3d;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #1e3a8a;
  }
  [data-theme='dark'] .bg-pink {
    background: #9b2d87;
  }

  [data-theme='dark'] .user-col,
  [data-theme='dark'] .matrix-btn,
  [data-theme='dark'] .preset-item,
  [data-theme='dark'] .result-content {
    background: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .matrix-btn {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .user-col {
    border-right-color: #eee;
  }
  [data-theme='dark'] .matrix-btn.active {
    background: #333;
  }

  [data-theme='dark'] .result-card {
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .val {
    color: #eee;
  }
  [data-theme='dark'] .small-copy {
    border-color: #eee;
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .col-head {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .preset-grid {
    background: #222;
  }
  [data-theme='dark'] .preset-item {
    border-color: #eee;
  }

  [data-theme='dark'] .action-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
</style>
