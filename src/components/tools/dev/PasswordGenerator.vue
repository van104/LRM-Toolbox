<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="goHome">← 返回</button>
        <h1 class="brutal-title">密码<span>.生成器()</span></h1>
        <button class="brutal-btn clear-btn" @click="showBatchModal = true">批量生成</button>
      </header>

      <div class="brutal-grid">
        <!-- Generator Panel -->
        <div class="brutal-pane generator-pane">
          <div class="pane-header bg-yellow">
            <span>核心.装配中心</span>
          </div>
          <div class="generator-content">
            <div class="password-display-wrap">
              <input
                v-model="generatedPassword"
                type="text"
                class="brutal-editor text-center main-pwd-input"
                readonly
                placeholder="密码将在这里生成..."
              />
              <button
                class="brutal-action-btn copy-btn"
                title="复制密码"
                @click="copyPassword(generatedPassword)"
              >
                复制
              </button>
            </div>

            <div class="strength-meter-wrap">
              <div class="strength-header">
                <strong>安全强度:</strong>
                <span class="strength-val" :class="strengthClass">{{ strengthText }}</span>
              </div>
              <div class="brutal-meter-bg">
                <div
                  class="brutal-meter-fill"
                  :class="strengthClass"
                  :style="{ width: strengthPercent + '%' }"
                ></div>
              </div>
            </div>

            <div class="options-container">
              <div class="option-row">
                <div class="opt-label">
                  <strong>密码长度.()</strong>
                  <span class="length-badge">{{ passwordLength }}</span>
                </div>
                <input
                  v-model.number="passwordLength"
                  type="range"
                  min="6"
                  max="64"
                  class="brutal-slider"
                  @input="generatePassword"
                />
              </div>

              <div class="toggles-grid mt-4">
                <label class="brutal-toggle">
                  <input v-model="options.uppercase" type="checkbox" @change="generatePassword" />
                  <span class="t-box"></span>
                  大写字母 (A-Z)
                </label>
                <label class="brutal-toggle">
                  <input v-model="options.lowercase" type="checkbox" @change="generatePassword" />
                  <span class="t-box"></span>
                  小写字母 (a-z)
                </label>
                <label class="brutal-toggle">
                  <input v-model="options.numbers" type="checkbox" @change="generatePassword" />
                  <span class="t-box"></span>
                  数字 (0-9)
                </label>
                <label class="brutal-toggle">
                  <input v-model="options.special" type="checkbox" @change="generatePassword" />
                  <span class="t-box"></span>
                  特殊字符 (!@#$)
                </label>
                <label class="brutal-toggle">
                  <input
                    v-model="options.excludeSimilar"
                    type="checkbox"
                    @change="generatePassword"
                  />
                  <span class="t-box"></span>
                  排除易混淆 (1,l,O,0)
                </label>
                <label class="brutal-toggle">
                  <input
                    v-model="options.includeAmbiguous"
                    type="checkbox"
                    @change="generatePassword"
                  />
                  <span class="t-box"></span>
                  包含括号 ({}[])
                </label>
              </div>
            </div>

            <div class="action-buttons mt-4">
              <button class="brutal-action-btn primary large-btn flex-2" @click="generatePassword">
                生成密码
              </button>
              <button class="brutal-action-btn large-btn flex-1" @click="saveToHistory">
                保存
              </button>
            </div>
          </div>
        </div>

        <!-- Right Tools Panel -->
        <div class="tools-panel">
          <div class="brutal-pane history-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">最近生成.历史</span>
              <button
                v-if="history.length > 0"
                class="brutal-action-btn small remove-border clear-btn-override"
                @click="clearHistory"
              >
                清空
              </button>
            </div>
            <div class="history-list">
              <div v-if="history.length === 0" class="no-data">历史记录为空。</div>
              <div v-for="item in history" :key="item" class="history-item">
                <span class="code">{{ item }}</span>
                <button class="brutal-action-btn small copy-sm-btn" @click="copyPassword(item)">
                  复制
                </button>
              </div>
            </div>
          </div>

          <div class="brutal-status tips-box">
            <h3>安全建议 //</h3>
            <ul>
              <li>建议使用 12 位以上的密码。</li>
              <li>组合大小写字母、数字和符号。</li>
              <li>每 3-6 个月更换一次核心密码。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Batch Modal -->
    <Transition name="modal">
      <div v-if="showBatchModal" class="modal-overlay" @click.self="showBatchModal = false">
        <div class="brutal-pane modal-box">
          <div class="pane-header bg-yellow">
            <span>批量生成密码</span>
            <button class="close-btn" @click="showBatchModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label><strong>生成数量.COUNT</strong> (1-50)</label>
              <input
                v-model.number="batchCount"
                type="number"
                min="1"
                max="50"
                class="brutal-input"
              />
            </div>

            <div v-if="batchResults.length > 0" class="batch-results brutal-editor">
              <div v-for="(pwd, idx) in batchResults" :key="idx" class="batch-item">
                <span class="idx">{{ idx + 1 }}.</span>
                <span class="pwd">{{ pwd }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="batchResults.length > 0" class="brutal-action-btn" @click="copyAllBatch">
              复制全部
            </button>
            <button class="brutal-action-btn primary action-right" @click="generateBatch">
              开始生成
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const generatedPassword = ref('');
  const passwordLength = ref(16);
  const history = ref([]);
  const showBatchModal = ref(false);
  const batchCount = ref(5);
  const batchResults = ref([]);

  const options = reactive({
    uppercase: true,
    lowercase: true,
    numbers: true,
    special: true,
    excludeSimilar: false,
    includeAmbiguous: false
  });

  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    ambiguous: '{}[]()/\'"`~',
    similar: 'il1Lo0O'
  };

  const strengthLevel = computed(() => {
    let score = 0;
    if (!generatedPassword.value) return 0;
    const len = generatedPassword.value.length;
    if (len >= 8) score++;
    if (len >= 12) score++;
    if (len >= 16) score++;
    if (/[A-Z]/.test(generatedPassword.value)) score++;
    if (/[a-z]/.test(generatedPassword.value)) score++;
    if (/[0-9]/.test(generatedPassword.value)) score++;
    if (/[^A-Za-z0-9]/.test(generatedPassword.value)) score++;
    return score;
  });

  const strengthText = computed(() => {
    if (strengthLevel.value <= 2) return '弱点';
    if (strengthLevel.value <= 4) return '中规中矩';
    return '坚不可摧';
  });

  const strengthClass = computed(() => {
    if (strengthLevel.value <= 2) return 'weak';
    if (strengthLevel.value <= 4) return 'medium';
    return 'strong';
  });

  const strengthPercent = computed(() => {
    const p = (strengthLevel.value / 7) * 100;
    return Math.max(5, Math.min(100, p));
  });

  function getPool() {
    let pool = '';
    if (options.uppercase) pool += charSets.uppercase;
    if (options.lowercase) pool += charSets.lowercase;
    if (options.numbers) pool += charSets.numbers;
    if (options.special) pool += charSets.special;
    if (options.includeAmbiguous) pool += charSets.ambiguous;

    if (options.excludeSimilar) {
      for (const char of charSets.similar) {
        pool = pool.split(char).join('');
      }
    }
    return pool;
  }

  function generatePassword() {
    const pool = getPool();
    if (!pool) {
      ElMessage.error('系统警告: 请至少选择一种字符类型');
      return;
    }

    let pwd = '';
    const crypto = window.crypto || window.msCrypto;

    if (crypto && crypto.getRandomValues) {
      const arr = new Uint32Array(passwordLength.value);
      crypto.getRandomValues(arr);
      for (let i = 0; i < passwordLength.value; i++) {
        pwd += pool[arr[i] % pool.length];
      }
    } else {
      for (let i = 0; i < passwordLength.value; i++) {
        pwd += pool.charAt(Math.floor(Math.random() * pool.length));
      }
    }
    generatedPassword.value = pwd;
  }

  function generateBatch() {
    const pool = getPool();
    if (!pool) {
      ElMessage.error('配置错误: 字符池为空');
      return;
    }
    const results = [];
    const crypto = window.crypto || window.msCrypto;

    for (let k = 0; k < batchCount.value; k++) {
      let pwd = '';
      if (crypto && crypto.getRandomValues) {
        const arr = new Uint32Array(passwordLength.value);
        crypto.getRandomValues(arr);
        for (let i = 0; i < passwordLength.value; i++) {
          pwd += pool[arr[i] % pool.length];
        }
      } else {
        for (let i = 0; i < passwordLength.value; i++) {
          pwd += pool.charAt(Math.floor(Math.random() * pool.length));
        }
      }
      results.push(pwd);
    }
    batchResults.value = results;
  }

  function saveToHistory() {
    if (!generatedPassword.value) return;
    if (history.value.includes(generatedPassword.value)) {
      ElMessage.info('已存在于历史记录中');
      return;
    }
    history.value.unshift(generatedPassword.value);
    if (history.value.length > 20) history.value.pop();
    localStorage.setItem('pwdHistory', JSON.stringify(history.value));
    ElMessage.success('已存入库');
  }

  function copyPassword(text) {
    if (!text) return;
    copyToClipboard(text, { success: '已安全复制到剪贴板' });
  }

  function copyAllBatch() {
    const text = batchResults.value.join('\n');
    copyToClipboard(text, { success: '所有数据已复制' });
  }

  function clearHistory() {
    history.value = [];
    localStorage.removeItem('pwdHistory');
    ElMessage.success('历史数据已全部归零');
  }

  function goHome() {
    if (window.history.length > 1) window.history.back();
  }

  onMounted(() => {
    const saved = localStorage.getItem('pwdHistory');
    if (saved) history.value = JSON.parse(saved);
    generatePassword();
  });
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
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
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
    font-size: 1.25rem;
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

  .brutal-btn.clear-btn {
    background: #00e572;
    color: #111;
  }

  .brutal-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    transition: transform 0.2s;
  }

  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    letter-spacing: 1px;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .text-white {
    color: #fff;
  }

  .generator-content {
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .password-display-wrap {
    display: flex;
    gap: 1rem;
    align-items: stretch;
  }

  .brutal-editor {
    flex: 1;
    width: 100%;
    border: 4px solid #111;
    padding: 1.5rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.8rem;
    line-height: normal;
    background: #fdfae5;
    color: #111;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    font-weight: bold;
    letter-spacing: 2px;
  }

  .text-center {
    text-align: center;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 2rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }

  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-action-btn.copy-btn {
    padding: 0 2rem;
    font-size: 1.2rem;
  }

  .brutal-action-btn.small {
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
    border-width: 2px;
    box-shadow: 3px 3px 0px #111;
  }

  .brutal-action-btn.primary {
    background: #00e572;
  }
  .brutal-action-btn.remove-border {
    border-color: transparent;
    box-shadow: none;
  }
  .brutal-action-btn.remove-border:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: none;
  }

  /* 使得由于蓝底导致的纯黑字显得突兀的清空按钮变为正常 */
  .clear-btn-override {
    background: transparent;
    border: 2px solid #fff;
    color: #fff;
    box-shadow: 2px 2px 0px #fff;
  }
  .clear-btn-override:hover {
    background: #fff;
    color: #111;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }
  .clear-btn-override:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #111;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }
  .action-buttons {
    display: flex;
    gap: 1rem;
  }
  .large-btn {
    padding: 1.2rem;
    font-size: 1.3rem;
  }
  .flex-2 {
    flex: 2;
  }
  .flex-1 {
    flex: 1;
  }

  .strength-meter-wrap {
    background: #fff;
    border: 3px solid #111;
    padding: 1.5rem;
    box-shadow: 6px 6px 0px #111;
  }

  .strength-header {
    display: flex;
    justify-content: space-between;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .strength-val.weak {
    color: #ff4b4b;
  }
  .strength-val.medium {
    color: #f59e0b;
  }
  .strength-val.strong {
    color: #00e572;
  }

  .brutal-meter-bg {
    height: 12px;
    background: #e5e5e5;
    border: 2px solid #111;
    width: 100%;
  }

  .brutal-meter-fill {
    height: 100%;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .brutal-meter-fill.weak {
    background-color: #ff4b4b;
  }
  .brutal-meter-fill.medium {
    background-color: #f59e0b;
  }
  .brutal-meter-fill.strong {
    background-color: #00e572;
  }

  .options-container {
    background: #fdfae5;
    border: 3px solid #111;
    padding: 1.5rem;
    box-shadow: 6px 6px 0px #111;
  }

  .option-row {
    margin-bottom: 1rem;
  }

  .opt-label {
    display: flex;
    justify-content: space-between;
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .length-badge {
    background: #111;
    color: #fff;
    padding: 0.2rem 0.6rem;
    font-weight: 800;
  }

  .brutal-slider {
    width: 100%;
    -webkit-appearance: none;
    appearance: none;
    height: 12px;
    background: #fff;
    border: 2px solid #111;
    outline: none;
  }

  .brutal-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: #ffd900;
    border: 3px solid #111;
    cursor: pointer;
  }

  .toggles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.2rem;
  }

  .brutal-toggle {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    font-weight: 600;
    user-select: none;
  }

  .brutal-toggle input {
    display: none;
  }

  .t-box {
    width: 24px;
    height: 24px;
    background: #fff;
    border: 3px solid #111;
    position: relative;
    transition: all 0.1s;
    box-shadow: 2px 2px 0px #111;
  }

  .brutal-toggle input:checked + .t-box {
    background: #00e572;
  }

  .brutal-toggle input:checked + .t-box::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 6px;
    height: 12px;
    border: solid #111;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  .tools-panel {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .history-list {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 480px;
    overflow-y: auto;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 3px solid #111;
    padding: 0.8rem 1rem;
    background: #fdfae5;
    box-shadow: 4px 4px 0px #111;
    transition: transform 0.1s;
  }

  .history-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .history-item .code {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 1px;
    word-break: break-all;
  }

  .copy-sm-btn {
    opacity: 0;
    transition: opacity 0.2s;
  }

  .history-item:hover .copy-sm-btn {
    opacity: 1;
  }

  .no-data {
    text-align: center;
    font-weight: bold;
    color: #555;
    padding: 2rem 0;
  }

  .brutal-status {
    padding: 2rem;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
  }

  .tips-box h3 {
    margin-top: 0;
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    text-transform: uppercase;
    margin-bottom: 1rem;
    border-bottom: 3px solid #111;
    padding-bottom: 0.5rem;
  }

  .tips-box ul {
    margin: 0;
    padding-left: 1.5rem;
    font-weight: 600;
    line-height: 1.8;
  }

  .tips-box li::marker {
    content: '» ';
    color: #ff4b4b;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .modal-box {
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: 900;
    cursor: pointer;
    color: #111;
  }

  .modal-body {
    padding: 2rem;
    overflow-y: auto;
    background: #fff;
  }

  .brutal-input {
    width: 100%;
    border: 3px solid #111;
    padding: 0.8rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.2rem;
    font-weight: bold;
    background: #fdfae5;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    margin-top: 0.5rem;
    transition: all 0.15s;
  }

  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .batch-results {
    margin-top: 2rem;
    padding: 1.5rem;
    max-height: 400px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #fdfae5;
  }

  .batch-item {
    font-size: 1.1rem;
    border-bottom: 2px dashed #aaa;
    padding-bottom: 0.5rem;
  }

  .batch-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .idx {
    font-weight: bold;
    margin-right: 0.5rem;
    color: #ff4b4b;
  }

  .modal-footer {
    padding: 1.5rem 2rem;
    border-top: 4px solid #111;
    display: flex;
    justify-content: space-between;
    background: #f8fafc;
  }

  .action-right {
    margin-left: auto;
  }

  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.2s ease;
  }
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

  @media (max-width: 1024px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
    .action-buttons {
      flex-direction: column;
    }
    .password-display-wrap {
      flex-direction: column;
    }
  }

  /* Dark Mode Overrides */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .history-item,
  [data-theme='dark'] .tips-box,
  [data-theme='dark'] .modal-body,
  [data-theme='dark'] .strength-meter-wrap,
  [data-theme='dark'] .brutal-editor,
  [data-theme='dark'] .batch-results,
  [data-theme='dark'] .options-container {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .history-item {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover,
  [data-theme='dark'] .history-item:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .strength-meter-wrap,
  [data-theme='dark'] .options-container,
  [data-theme='dark'] .brutal-editor {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover,
  [data-theme='dark'] .brutal-input:focus {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .brutal-action-btn.small {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-action-btn.remove-border {
    border-color: transparent;
    box-shadow: none;
    color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.remove-border:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .tips-box h3,
  [data-theme='dark'] .modal-footer {
    border-color: #eee;
  }
  [data-theme='dark'] .modal-footer {
    background: #111;
  }
  [data-theme='dark'] .close-btn {
    color: #eee;
  }

  [data-theme='dark'] .brutal-action-btn.primary {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .brutal-btn.clear-btn {
    background: #00994c;
  }

  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .brutal-slider {
    background: #1a1a1a;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-slider::-webkit-slider-thumb {
    border-color: #eee;
  }

  [data-theme='dark'] .t-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .brutal-toggle input:checked + .t-box {
    background: #00994c;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-toggle input:checked + .t-box::after {
    border-color: #fff;
  }

  [data-theme='dark'] .brutal-meter-bg {
    background: #333;
    border-color: #eee;
  }
  [data-theme='dark'] .length-badge {
    background: #eee;
    color: #111;
  }
</style>
