<template>
  <div class="password-generator">
    
    <nav class="nav-bar">
      <button class="nav-back" @click="goHome">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回
      </button>
      <div class="nav-center">
        <h1>密码生成器</h1>
        <span class="nav-subtitle">Password Generator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    
    <main class="main-content">
      <div class="content-grid">

        
        <div class="generator-panel">
          
          <div class="password-display-wrap">
            <input v-model="generatedPassword" type="text" class="password-display" readonly placeholder="生成密码...">
            <button class="copy-main-btn" title="复制密码" @click="copyPassword(generatedPassword)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>

          
          <div class="strength-meter">
            <div class="strength-header">
              <span class="label">安全强度</span>
              <span class="value" :class="strengthClass">{{ strengthText }}</span>
            </div>
            <div class="meter-bar">
              <div class="fill" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
            </div>
          </div>

          
          <div class="options-container">
            <div class="option-group length-group">
              <div class="group-header">
                <label>密码长度</label>
                <span class="length-val">{{ passwordLength }}</span>
              </div>
              <input
v-model.number="passwordLength" type="range" min="6" max="64" class="length-slider"
                @input="generatePassword">
            </div>

            <div class="option-group toggles-group">
              <label class="toggle-item">
                <input v-model="options.uppercase" type="checkbox" @change="generatePassword">
                <span class="checkbox-box"></span>
                <span>大写字母 (A-Z)</span>
              </label>
              <label class="toggle-item">
                <input v-model="options.lowercase" type="checkbox" @change="generatePassword">
                <span class="checkbox-box"></span>
                <span>小写字母 (a-z)</span>
              </label>
              <label class="toggle-item">
                <input v-model="options.numbers" type="checkbox" @change="generatePassword">
                <span class="checkbox-box"></span>
                <span>数字 (0-9)</span>
              </label>
              <label class="toggle-item">
                <input v-model="options.special" type="checkbox" @change="generatePassword">
                <span class="checkbox-box"></span>
                <span>特殊字符 (!@#$)</span>
              </label>
              <label class="toggle-item">
                <input v-model="options.excludeSimilar" type="checkbox" @change="generatePassword">
                <span class="checkbox-box"></span>
                <span>排除相似 (i,l,1,0,o)</span>
              </label>
              <label class="toggle-item">
                <input v-model="options.includeAmbiguous" type="checkbox" @change="generatePassword">
                <span class="checkbox-box"></span>
                <span>包含模糊 ({}[])</span>
              </label>
            </div>
          </div>

          <div class="action-buttons">
            <button class="generate-btn primary" @click="generatePassword">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"></path>
                <path d="M1 20v-6h6"></path>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              生成新密码
            </button>
            <button class="generate-btn secondary" @click="saveToHistory">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              保存
            </button>
          </div>
        </div>

        
        <div class="tools-panel">
          
          <section class="history-card">
            <div class="card-header">
              <h3>最近生成</h3>
              <div class="actions">
                <button v-if="history.length > 0" class="clear-btn" @click="clearHistory">清空</button>
              </div>
            </div>
            <div class="history-list">
              <div v-if="history.length === 0" class="no-data">暂无记录</div>
              <div v-for="item in history" :key="item" class="history-item">
                <span class="code">{{ item }}</span>
                <button class="copy-sm-btn" @click="copyPassword(item)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          </section>

          
          <button class="batch-btn" @click="showBatchModal = true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            批量生成密码
          </button>
        </div>
      </div>

      
      <section class="tips-section">
        <h2>安全建议</h2>
        <div class="tips-grid">
          <div class="tip-card">
            <div class="icon-circle">🔑</div>
            <div>
              <h4>长密码</h4>
              <p>建议使用 12 位以上的密码。</p>
            </div>
          </div>
          <div class="tip-card">
            <div class="icon-circle">🛡️</div>
            <div>
              <h4>混合字符</h4>
              <p>组合大小写字母、数字和符号。</p>
            </div>
          </div>
          <div class="tip-card">
            <div class="icon-circle">🔄</div>
            <div>
              <h4>定期更换</h4>
              <p>每 3-6 个月更换一次重要密码。</p>
            </div>
          </div>
        </div>
      </section>

      <footer class="footer">
        © 2026 LRM工具箱 - 密码生成器
      </footer>
    </main>

    
    <Transition name="modal">
      <div v-if="showBatchModal" class="modal-overlay" @click.self="showBatchModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>批量生成密码</h3>
            <button class="close-btn" @click="showBatchModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label>生成数量 (1-50)</label>
              <input v-model.number="batchCount" type="number" min="1" max="50" class="input-num">
            </div>

            <div v-if="batchResults.length > 0" class="batch-results">
              <div v-for="(pwd, idx) in batchResults" :key="idx" class="batch-item">
                <span class="idx">{{ idx + 1 }}.</span>
                <span class="pwd">{{ pwd }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="batchResults.length > 0" class="action-btn secondary" @click="copyAllBatch">复制全部</button>
            <button class="action-btn primary" @click="generateBatch">开始生成</button>
          </div>
        </div>
      </div>
    </Transition>

    
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";


const generatedPassword = ref("");
const passwordLength = ref(16);
const history = ref([]);
const showBatchModal = ref(false);
const batchCount = ref(5);
const batchResults = ref([]);
const toast = reactive({ show: false, message: "", type: "info" });

const options = reactive({
  uppercase: true,
  lowercase: true,
  numbers: true,
  special: true,
  excludeSimilar: false,
  includeAmbiguous: false,
});


const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '{}[]()/\'"`~',
  similar: 'il1Lo0O',
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
  if (strengthLevel.value <= 2) return "弱";
  if (strengthLevel.value <= 4) return "中";
  return "强";
});

const strengthClass = computed(() => {
  if (strengthLevel.value <= 2) return "weak";
  if (strengthLevel.value <= 4) return "medium";
  return "strong";
});

const strengthPercent = computed(() => {
  const p = (strengthLevel.value / 7) * 100;
  return Math.max(10, Math.min(100, p));
});


function getPool() {
  let pool = "";
  if (options.uppercase) pool += charSets.uppercase;
  if (options.lowercase) pool += charSets.lowercase;
  if (options.numbers) pool += charSets.numbers;
  if (options.special) pool += charSets.special;
  if (options.includeAmbiguous) pool += charSets.ambiguous;

  if (options.excludeSimilar) {
    for (const char of charSets.similar) {
      pool = pool.split(char).join("");
    }
  }
  return pool;
}

function generatePassword() {
  const pool = getPool();
  if (!pool) {
    showToast("请至少选择一种字符类型", "error");
    return;
  }

  let pwd = "";
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
    showToast("配置错误", "error");
    return;
  }
  const results = [];
  const crypto = window.crypto || window.msCrypto;

  for (let k = 0; k < batchCount.value; k++) {
    let pwd = "";
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
  if (history.value.includes(generatedPassword.value)) {
    showToast("已存在于历史记录", "info");
    return;
  }
  history.value.unshift(generatedPassword.value);
  if (history.value.length > 10) history.value.pop();
  localStorage.setItem("pwdHistory", JSON.stringify(history.value));
  showToast("已保存", "success");
}

function copyPassword(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    showToast("已复制到剪贴板", "success");
  });
}

function copyAllBatch() {
  const text = batchResults.value.join("\n");
  navigator.clipboard.writeText(text).then(() => {
    showToast("已全部复制", "success");
  });
}

function clearHistory() {
  history.value = [];
  localStorage.removeItem("pwdHistory");
  showToast("历史记录已清空");
}

function showToast(msg, type = "info") {
  toast.message = msg;
  toast.type = type;
  toast.show = true;
  setTimeout(() => toast.show = false, 2000);
}

function goHome() {
  if (window.history.length > 1) window.history.back();
}

onMounted(() => {
  const saved = localStorage.getItem("pwdHistory");
  if (saved) history.value = JSON.parse(saved);
  generatePassword();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.password-generator {
  --bg: #f5f7fa;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-secondary: #64748b;
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Noto Sans SC', sans-serif;
}


.nav-bar {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.nav-back {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-back:hover {
  background: #f1f5f9;
  color: var(--primary);
}

.nav-center h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.nav-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}


.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}


.generator-panel {
  background: var(--card);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.password-display-wrap {
  position: relative;
  margin-bottom: 2rem;
}

.password-display {
  width: 100%;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.5rem;
  padding: 1.25rem;
  padding-right: 3.5rem;
  background: #f8fafc;
  border: 2px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  text-align: center;
  transition: all 0.2s;
}

.password-display:focus {
  outline: none;
  border-color: var(--primary);
  background: #fff;
}

.copy-main-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.copy-main-btn:hover {
  background: #e2e8f0;
  color: var(--primary);
}

.strength-meter {
  margin-bottom: 2rem;
}

.strength-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.meter-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.meter-bar .fill {
  height: 100%;
  transition: all 0.3s;
}

.value.weak {
  color: var(--danger);
}

.fill.weak {
  background-color: var(--danger);
}

.value.medium {
  color: var(--warning);
}

.fill.medium {
  background-color: var(--warning);
}

.value.strong {
  color: var(--success);
}

.fill.strong {
  background-color: var(--success);
}

.options-container {
  margin-bottom: 2rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.length-slider {
  width: 100%;
  accent-color: var(--primary);
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.toggles-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
}

.toggle-item input {
  display: none;
}

.checkbox-box {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border);
  border-radius: 6px;
  position: relative;
  transition: all 0.2s;
}

.toggle-item input:checked+.checkbox-box {
  background: var(--primary);
  border-color: var(--primary);
}

.toggle-item input:checked+.checkbox-box::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 14px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.generate-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
}

.generate-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.generate-btn:active {
  transform: translateY(0);
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.generate-btn.primary {
  flex: 2;
}

.generate-btn.secondary {
  flex: 1;
  background: var(--card);
  color: var(--text);
  border: 2px solid var(--border);
}

.generate-btn.secondary:hover {
  background: #f8fafc;
  border-color: var(--primary);
  color: var(--primary);
}


.tools-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  background: var(--card);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  flex: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.save-icon-btn,
.clear-btn {
  border: none;
  background: none;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.save-icon-btn:hover {
  color: var(--primary);
}

.clear-btn:hover {
  color: var(--danger);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid transparent;
}

.history-item:hover {
  border-color: var(--border);
  background: #fff;
}

.history-item .code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.copy-sm-btn {
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-item:hover .copy-sm-btn {
  opacity: 1;
}

.batch-btn {
  width: 100%;
  padding: 1rem;
  background: white;
  border: 2px dashed var(--border);
  border-radius: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.batch-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #f8fafc;
}


.tips-section {
  margin-top: 2rem;
}

.tips-section h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--text-secondary);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.tip-card {
  background: var(--card);
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.tip-card h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
}

.tip-card p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.footer {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 0;
  font-size: 0.9rem;
}


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-box {
  background: var(--card);
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.form-item label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.input-num {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
}

.batch-results {
  margin-top: 1.5rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.batch-item {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  display: flex;
  gap: 0.5rem;
}

.batch-item:last-child {
  border-bottom: none;
}

.batch-item .idx {
  color: var(--text-secondary);
  user-select: none;
}

.modal-footer {
  padding: 1.25rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: var(--text);
}


.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  color: white;
  font-size: 0.9rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  background: var(--text);
  z-index: 200;
}

.toast.success {
  background: var(--success);
}

.toast.error {
  background: var(--danger);
}

.toast.info {
  background: var(--text);
}

.modal-enter-active,
.modal-leave-active,
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to,
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(-50%);
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(20px) translateX(-50%);
}
</style>
