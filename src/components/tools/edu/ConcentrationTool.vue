<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>浓度配比计算器</h1>
        <span class="nav-subtitle">Solution Dilution & Ratio Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="tabs">
          <button :class="{ active: mode === 'dilution' }" @click="mode = 'dilution'">
            溶液稀释 (C₁V₁=C₂V₂)
          </button>
          <button :class="{ active: mode === 'ratio' }" @click="mode = 'ratio'">
            按比例配液 (1:X)
          </button>
        </div>

        <!-- Dilution Mode -->
        <div v-if="mode === 'dilution'" class="tab-content animate-fade-in">
          <div class="input-grid">
            <div class="input-group">
              <label>起始浓度 (C₁)</label>
              <input v-model.number="c1" type="number" placeholder="例如: 95" />
              <span class="unit">%</span>
            </div>
            <div class="input-group">
              <label>起始体积 (V₁)</label>
              <div class="input-with-action">
                <input
                  v-model.number="v1"
                  type="number"
                  placeholder="待计算"
                  :class="{ highlight: targetField === 'v1' }"
                />
                <button class="calc-btn" @click="calcDilution('v1')">求此项</button>
              </div>
            </div>
            <div class="icon-row">
              <el-icon><ArrowDown /></el-icon>
              <span>稀释至</span>
            </div>
            <div class="input-group">
              <label>目标浓度 (C₂)</label>
              <input v-model.number="c2" type="number" placeholder="例如: 75" />
              <span class="unit">%</span>
            </div>
            <div class="input-group">
              <label>目标体积 (V₂)</label>
              <div class="input-with-action">
                <input
                  v-model.number="v2"
                  type="number"
                  placeholder="待计算"
                  :class="{ highlight: targetField === 'v2' }"
                />
                <button class="calc-btn" @click="calcDilution('v2')">求此项</button>
              </div>
            </div>
          </div>

          <div v-if="dilutionResult" class="result-message">
            <div class="main-res">{{ dilutionResult.text }}</div>
            <div class="sub-res">{{ dilutionResult.detail }}</div>
          </div>
        </div>

        <!-- Ratio Mode -->
        <div v-else class="tab-content animate-fade-in">
          <div class="ratio-inputs">
            <div class="input-group">
              <label>配比比例 (溶质 : 溶剂)</label>
              <div class="ratio-flex">
                <input v-model.number="ratioA" type="number" placeholder="1" />
                <span class="colon">:</span>
                <input v-model.number="ratioB" type="number" placeholder="例如: 50" />
              </div>
            </div>

            <div class="input-group">
              <label>目标总用量 (Total Vol)</label>
              <div class="input-wrapper">
                <input v-model.number="totalVol" type="number" placeholder="例如: 500" />
                <span class="unit">ml / L</span>
              </div>
            </div>

            <button class="primary-btn" @click="calcRatio">计算用量</button>
          </div>

          <div v-if="ratioResult" class="result-visualization">
            <div class="vis-container">
              <div class="vis-bar solute" :style="{ flex: ratioResult.partA }">
                <span>溶质</span>
                <strong>{{ format(ratioResult.amountA) }}</strong>
              </div>
              <div class="vis-bar solvent" :style="{ flex: ratioResult.partB }">
                <span>溶剂 (水)</span>
                <strong>{{ format(ratioResult.amountB) }}</strong>
              </div>
            </div>
            <div class="ratio-text">
              在 <strong>{{ format(ratioResult.amountB) }}</strong> 单位的水中加入
              <strong>{{ format(ratioResult.amountA) }}</strong> 单位的原液， 即可得到
              <strong>{{ totalVol }}</strong> 单位的 1:{{ ratioB / ratioA }} 稀释液。
            </div>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>🧪 使用贴士</h3>
        <p v-if="mode === 'dilution'">
          适用于实验室溶液配置或高浓度酒精稀释。默认单位一致即可（如都是 ml 或 L）。 公式：<b
            >C₁ × V₁ = C₂ × V₂</b
          >
        </p>
        <p v-else>
          适用于清洁剂、农药等日常配比。 例如 1:50 意味着 1份原液加入 50份水，总份数为 51。
        </p>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 化学/生活工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Back, ArrowDown } from '@element-plus/icons-vue';

  const mode = ref<'dilution' | 'ratio'>('dilution');

  // Dilution Data
  const c1 = ref<number | null>(null);
  const v1 = ref<number | null>(null);
  const c2 = ref<number | null>(null);
  const v2 = ref<number | null>(null);
  const targetField = ref<string>('');
  const dilutionResult = ref<{ text: string; detail: string } | null>(null);

  // Ratio Data
  const ratioA = ref(1);
  const ratioB = ref(50);
  const totalVol = ref(500);
  const ratioResult = ref<{
    amountA: number;
    amountB: number;
    partA: number;
    partB: number;
  } | null>(null);

  const format = (n: number) => parseFloat(n.toFixed(2));

  const calcDilution = (target: 'v1' | 'v2') => {
    targetField.value = target;
    dilutionResult.value = null;

    if (target === 'v1') {
      if (c1.value && c2.value && v2.value) {
        const res = (c2.value * v2.value) / c1.value;
        v1.value = format(res);
        dilutionResult.value = {
          text: `需要起始原液 V₁ = ${v1.value}`,
          detail: `取 ${v1.value} 单位的原液，加入 ${(v2.value - v1.value).toFixed(2)} 单位的溶剂。`
        };
      } else {
        alert('请填写 C₁, C₂, V₂ 三项');
      }
    } else {
      if (c1.value && v1.value && c2.value) {
        const res = (c1.value * v1.value) / c2.value;
        v2.value = format(res);
        dilutionResult.value = {
          text: `可配制目标溶液 V₂ = ${v2.value}`,
          detail: `将 ${v1.value} 单位的原液稀释到总提及 ${v2.value} (加入 ${(v2.value - v1.value).toFixed(2)} 溶剂)。`
        };
      } else {
        alert('请填写 C₁, V₁, C₂ 三项');
      }
    }
  };

  const calcRatio = () => {
    if (!ratioA.value || !ratioB.value || !totalVol.value) return;
    const totalParts = ratioA.value + ratioB.value;
    const unitVol = totalVol.value / totalParts;

    ratioResult.value = {
      amountA: unitVol * ratioA.value,
      amountB: unitVol * ratioB.value,
      partA: ratioA.value,
      partB: ratioB.value
    };
  };
</script>

<style scoped>
  .tool-container {
    --bg: #f0f9ff;
    --card: #ffffff;
    --text: #0c4a6e;
    --accent: #0ea5e9;
    --accent-light: #e0f2fe;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  .nav-bar {
    /* Standard */
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
    cursor: pointer;
    color: #64748b;
  }
  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .main-content {
    max-width: 700px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px -2px rgba(14, 165, 233, 0.1);
    border: 1px solid #bae6fd;
  }

  .tabs {
    display: flex;
    background: #e0f2fe;
    padding: 0.4rem;
    border-radius: 10px;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .tabs button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #0369a1;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tabs button.active {
    background: white;
    color: var(--accent);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .input-grid {
    display: grid;
    gap: 1.2rem;
  }

  .input-group label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.4rem;
    color: #0c4a6e;
  }

  .input-group input {
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #bae6fd;
    border-radius: 8px;
    font-size: 1.1rem;
    outline: none;
    color: var(--text);
    transition: border-color 0.2s;
  }

  .input-group input.highlight {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .input-with-action {
    display: flex;
    gap: 0.5rem;
  }

  .calc-btn {
    padding: 0 1rem;
    background: #f0f9ff;
    border: 2px solid #bae6fd;
    border-radius: 8px;
    color: #0284c7;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }

  .calc-btn:hover {
    background: #e0f2fe;
  }

  .icon-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
    font-size: 0.9rem;
  }

  .result-message {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: #f0f9ff;
    border-radius: 10px;
    border-left: 4px solid var(--accent);
  }

  .main-res {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0c4a6e;
    margin-bottom: 0.5rem;
  }

  .sub-res {
    font-size: 0.9rem;
    color: #0369a1;
  }

  .ratio-inputs {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ratio-flex {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .colon {
    font-weight: 800;
    font-size: 1.5rem;
    color: #0c4a6e;
  }

  .primary-btn {
    padding: 1rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    font-size: 1rem;
  }

  .result-visualization {
    margin-top: 2rem;
  }

  .vis-container {
    display: flex;
    height: 60px;
    border-radius: 30px;
    overflow: hidden;
    margin-bottom: 1rem;
  }

  .vis-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    transition: flex 0.5s;
  }

  .vis-bar strong {
    font-size: 1.1rem;
  }

  .vis-bar.solute {
    background: #0ea5e9;
  }
  .vis-bar.solvent {
    background: #94a3b8;
  }

  .ratio-text {
    text-align: center;
    font-size: 1rem;
    line-height: 1.6;
  }

  .info-card {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 12px;
    color: #64748b;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
