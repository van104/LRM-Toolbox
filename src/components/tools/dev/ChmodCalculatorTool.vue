<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">Chmod 权限计算器</h1>
        <span class="tool-subtitle">Chmod Calculator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="reset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <section class="tool-main">
          <div class="panel glass-card">
            <h2 class="panel-title">权限选择</h2>

            <div class="permission-grid">
              <!-- Owner -->
              <div class="perm-group">
                <h3 class="group-label">所有者 (Owner)</h3>
                <div class="perm-options">
                  <div class="perm-item" :class="{ active: owner.r }" @click="owner.r = !owner.r">
                    <span class="perm-char">r</span>
                    <span class="perm-name">读取</span>
                  </div>
                  <div class="perm-item" :class="{ active: owner.w }" @click="owner.w = !owner.w">
                    <span class="perm-char">w</span>
                    <span class="perm-name">写入</span>
                  </div>
                  <div class="perm-item" :class="{ active: owner.x }" @click="owner.x = !owner.x">
                    <span class="perm-char">x</span>
                    <span class="perm-name">执行</span>
                  </div>
                </div>
              </div>

              <!-- Group -->
              <div class="perm-group">
                <h3 class="group-label">用户组 (Group)</h3>
                <div class="perm-options">
                  <div class="perm-item" :class="{ active: group.r }" @click="group.r = !group.r">
                    <span class="perm-char">r</span>
                    <span class="perm-name">读取</span>
                  </div>
                  <div class="perm-item" :class="{ active: group.w }" @click="group.w = !group.w">
                    <span class="perm-char">w</span>
                    <span class="perm-name">写入</span>
                  </div>
                  <div class="perm-item" :class="{ active: group.x }" @click="group.x = !group.x">
                    <span class="perm-char">x</span>
                    <span class="perm-name">执行</span>
                  </div>
                </div>
              </div>

              <!-- Others -->
              <div class="perm-group">
                <h3 class="group-label">其他 (Others)</h3>
                <div class="perm-options">
                  <div
                    class="perm-item"
                    :class="{ active: others.r }"
                    @click="others.r = !others.r"
                  >
                    <span class="perm-char">r</span>
                    <span class="perm-name">读取</span>
                  </div>
                  <div
                    class="perm-item"
                    :class="{ active: others.w }"
                    @click="others.w = !others.w"
                  >
                    <span class="perm-char">w</span>
                    <span class="perm-name">写入</span>
                  </div>
                  <div
                    class="perm-item"
                    :class="{ active: others.x }"
                    @click="others.x = !others.x"
                  >
                    <span class="perm-char">x</span>
                    <span class="perm-name">执行</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">常用权限速查</h2>
            <div class="preset-perms">
              <div
                v-for="p in presets"
                :key="p.code"
                class="preset-card"
                @click="applyPreset(p.code)"
              >
                <span class="preset-code">{{ p.code }}</span>
                <span class="preset-desc">{{ p.desc }}</span>
              </div>
            </div>
          </div>
        </section>

        <aside class="tool-sidebar">
          <div class="panel glass-card result-sidebar">
            <h2 class="panel-title">计算结果</h2>

            <div class="result-box">
              <label class="result-label">八进制标识</label>
              <div class="result-value-row">
                <span class="octal-value">{{ octalCode }}</span>
                <el-button :icon="CopyDocument" circle @click="copy(octalCode)" />
              </div>
            </div>

            <div class="result-box mt-6">
              <label class="result-label">符号标识</label>
              <div class="result-value-row">
                <span class="symbol-value">{{ symbolCode }}</span>
                <el-button :icon="CopyDocument" circle @click="copy(symbolCode)" />
              </div>
            </div>

            <div class="result-box mt-8 command-box">
              <label class="result-label">执行指令</label>
              <div class="command-display">
                <code>chmod {{ octalCode }} file</code>
                <button class="cmd-copy-btn" @click="copy(`chmod ${octalCode} file`)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">权限说明</h2>
            <table class="perm-table">
              <tr>
                <th>等效</th>
                <th>权值</th>
                <th>描述</th>
              </tr>
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
              <tr class="sum-row">
                <td>rwx</td>
                <td>7</td>
                <td>全部权限</td>
              </tr>
            </table>
          </div>
        </aside>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - Chmod 权限计算</footer>
  </div>
</template>

<script setup lang="ts">
  import { reactive, computed } from 'vue';
  import { ArrowLeft, Refresh, CopyDocument } from '@element-plus/icons-vue';
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
    { code: '755', desc: '常用程序/目录权限' },
    { code: '644', desc: '常用文件权限' },
    { code: '600', desc: '私有文件 (仅所有者)' },
    { code: '700', desc: '私有目录 (仅所有者)' },
    { code: '400', desc: '只读文件 (仅所有者)' }
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

  const copy = async (text: string) => {
    await copyToClipboard(text);
  };
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

  .header-left,
  .header-right {
    width: 140px;
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
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
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .permission-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .perm-group {
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
  }

  .group-label {
    font-size: 0.9rem;
    color: #64748b;
    margin: 0 0 16px 0;
    font-weight: 600;
  }

  .perm-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .perm-item {
    height: 80px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }

  .perm-item:hover {
    transform: translateY(-2px);
    border-color: #cbd5e1;
  }

  .perm-item.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .perm-char {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: 700;
  }
  .perm-name {
    font-size: 0.75rem;
    margin-top: 4px;
  }

  .preset-perms {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .preset-card {
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }

  .preset-card:hover {
    background: #f0f7ff;
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  .preset-code {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
    font-family: monospace;
  }
  .preset-desc {
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .result-box {
    background: #f8fafc;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #f1f5f9;
  }

  .result-label {
    font-size: 0.75rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 8px;
  }

  .result-value-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .octal-value {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    font-family: monospace;
  }
  .symbol-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #475569;
    font-family: monospace;
    letter-spacing: 2px;
  }

  .command-box {
    background: #1e293b;
    color: white;
  }
  .command-box .result-label {
    color: #64748b;
  }

  .command-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Fira Code', monospace;
    font-size: 1.1rem;
    color: #38bdf8;
  }

  .cmd-copy-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: white;
    padding: 6px;
    border-radius: 6px;
    cursor: pointer;
  }

  .perm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }
  .perm-table th {
    text-align: left;
    color: #94a3b8;
    font-weight: 500;
    padding: 8px;
    border-bottom: 1px solid #f1f5f9;
  }
  .perm-table td {
    padding: 10px 8px;
    color: #475569;
  }
  .perm-table tr:not(:last-child) td {
    border-bottom: 1px solid #f8fafc;
  }
  .sum-row {
    font-weight: 600;
    color: #1e293b !important;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
</style>
