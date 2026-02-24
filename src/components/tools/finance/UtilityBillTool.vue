<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">水电费<span>.账单()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane bg-white mb-6 p-6">
            <h2 class="pane-title mb-4">用量设定.USAGE</h2>

            <div class="mode-tabs brutal-shadow mb-6">
              <button
                class="tab-btn"
                :class="{ active: type === 'electric' }"
                @click="type = 'electric'"
              >
                ⚡ 用电
              </button>
              <button class="tab-btn" :class="{ active: type === 'water' }" @click="type = 'water'">
                💧 用水
              </button>
            </div>

            <div class="form-grid mb-6">
              <div class="form-group w-full">
                <label class="form-label">{{
                  type === 'electric' ? '月度用电量 (度 | kWh)' : '月度用水量 (方 | m³)'
                }}</label>
                <div
                  class="relative flex items-center border-4 border-black bg-cyan input-wrap brutal-shadow overflow-hidden"
                >
                  <input
                    v-model.number="usage"
                    type="number"
                    min="0"
                    class="brutal-input flex-1 hg-input text-right pr-4 bg-transparent border-none outline-none font-mono min-w-0"
                    placeholder="0"
                  />
                  <span
                    class="unit bg-black text-white font-black h-full flex items-center px-4 shrink-0"
                    >{{ type === 'electric' ? '度' : '方' }}</span
                  >
                </div>
              </div>
            </div>

            <h2 class="pane-title mt-8 mb-4">计费规则.RULES</h2>
            <div class="config-tabs brutal-shadow mb-4 w-full flex border-3 border-black">
              <button
                class="cfg-btn"
                :class="{ active: calcMode === 'flat' }"
                @click="calcMode = 'flat'"
              >
                单一单价
              </button>
              <button
                class="cfg-btn"
                :class="{ active: calcMode === 'ladder' }"
                @click="calcMode = 'ladder'"
              >
                阶梯计价
              </button>
            </div>

            <div
              v-if="calcMode === 'flat'"
              class="flat-config p-4 bg-yellow border-3 border-black brutal-shadow-sm mt-4"
            >
              <div class="flex items-center gap-4">
                <label class="font-bold whitespace-nowrap">统一单价</label>
                <div class="input-with-currency relative flex-1 min-w-16">
                  <span
                    class="currency-symbol absolute left-2 top-1/2 -translate-y-1/2 font-bold text-lg"
                    >¥</span
                  >
                  <input
                    v-model.number="flatPrice"
                    type="number"
                    step="0.01"
                    class="brutal-input pl-6 pr-2 py-2 w-full font-mono text-lg min-w-0"
                  />
                </div>
                <span class="font-bold opacity-80 whitespace-nowrap"
                  >元/{{ type === 'electric' ? '度' : '方' }}</span
                >
              </div>
            </div>

            <div v-else class="ladder-config mt-4 border-3 border-black bg-white brutal-shadow-sm">
              <div
                v-for="(level, idx) in ladders"
                :key="idx"
                class="ladder-row flex items-center border-b-2 border-dashed border-black p-3 hover-bg-gray transition-all"
              >
                <div
                  class="level-badge bg-black text-white font-black px-2 py-1 text-sm border-2 border-black mr-4 shadow-sm min-w-16 text-center"
                >
                  档 {{ idx + 1 }}
                </div>

                <div class="flex-1 flex items-center gap-2 flex-wrap">
                  <div class="range flex items-center mr-2">
                    <span class="font-mono font-bold">{{
                      idx === 0 ? '0' : ladders[idx - 1].limit
                    }}</span>
                    <span class="mx-2">~</span>
                    <input
                      v-if="idx < ladders.length - 1"
                      v-model.number="level.limit"
                      type="number"
                      class="brutal-input text-center font-mono py-1 px-2 w-20"
                    />
                    <span v-else class="font-black text-lg">∞</span>
                  </div>
                  <div class="price-box flex items-center gap-2">
                    <div class="relative w-24">
                      <span
                        class="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-pink text-xs"
                        >¥</span
                      >
                      <input
                        v-model.number="level.price"
                        type="number"
                        step="0.01"
                        class="brutal-input pl-6 pr-2 py-1 w-full font-mono font-black border-2 border-black"
                        placeholder="单价"
                      />
                    </div>
                  </div>
                </div>

                <div v-if="idx === ladders.length - 1" class="actions flex gap-2 ml-auto pl-4">
                  <button
                    v-if="ladders.length > 1"
                    title="删除档位"
                    class="action-btn text-white bg-pink"
                    @click="removeLadder"
                  >
                    -
                  </button>
                  <button
                    v-if="ladders.length < 5"
                    title="新增档位"
                    class="action-btn text-black bg-yellow"
                    @click="addLadder"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section
            class="brutal-pane bg-pink text-white h-full flex-col border-4 border-black"
            :class="
              calcMode === 'ladder' && result.details.length > 0
                ? 'justify-start'
                : 'justify-center'
            "
          >
            <h2
              class="pane-title mb-4 bg-white text-black p-2 border-b-4 border-black inline-block px-4 font-black w-max-content self-start"
            >
              预计账单费用.ESTIMATE
            </h2>

            <div class="text-center w-full mb-6 mt-4">
              <div class="value huge font-mono font-black my-4 drop-shadow-black transition-all">
                <span class="text-3xl mr-2">¥</span>{{ formatMoney(result.total) }}
              </div>
            </div>

            <div
              v-if="calcMode === 'ladder' && result.details.length > 0"
              class="mt-8 border-t-4 border-dashed border-white pt-6 w-full"
            >
              <h3
                class="font-black text-lg mb-4 text-center pb-2 bg-black text-white inline-block px-4 py-1 mx-auto shadow-solid-inverse"
              >
                阶梯分档明细表
              </h3>

              <div class="ladder-details flex flex-col gap-3 mt-4">
                <div
                  v-for="(d, i) in result.details"
                  :key="i"
                  class="flex justify-between items-center bg-white text-black p-3 border-3 border-black font-bold shadow-solid-inverse-sm transform hover:-translate-y-1 transition-transform"
                >
                  <div class="flex items-center gap-3">
                    <span class="bg-black text-white px-2 py-1 text-xs">第{{ i + 1 }}档</span>
                    <span class="opacity-80"
                      >用了 <strong class="font-mono text-pink">{{ d.amount }}</strong>
                      {{ type === 'electric' ? '度' : '方' }}</span
                    >
                  </div>
                  <span class="font-mono text-xl">¥ {{ formatMoney(d.cost) }}</span>
                </div>
              </div>
            </div>
          </section>

          <div
            class="mt-6 border-l-4 border-black pl-4 pr-2 text-sm font-bold opacity-80 leading-relaxed bg-yellow py-2 shadow-solid-sm"
          >
            💡
            <strong>提示：</strong
            >阶梯电价通常按年或月累计且有峰谷期之分，此处按月统一估算。<br />不同城市基础价不同：通常租房用电常为单一价
            1.0~1.5 元/度，水费 5~8 元/方（多为商用基准）。
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';

  const type = ref('electric');
  const calcMode = ref('flat');
  const usage = ref<number | ''>('');
  const flatPrice = ref(0.6);

  const ladders = ref([
    { limit: 200, price: 0.5 },
    { limit: 400, price: 0.6 },
    { limit: null as number | null, price: 0.8 }
  ]);

  watch(type, v => {
    if (v === 'electric') {
      flatPrice.value = 0.6;
      ladders.value = [
        { limit: 240, price: 0.52 },
        { limit: 400, price: 0.57 },
        { limit: null, price: 0.82 }
      ];
    } else {
      flatPrice.value = 4.5;
      ladders.value = [
        { limit: 15, price: 3.5 },
        { limit: 25, price: 4.8 },
        { limit: null, price: 6.5 }
      ];
    }
  });

  const addLadder = () => {
    const last = ladders.value[ladders.value.length - 1];
    const prev = ladders.value[ladders.value.length - 2] || { limit: 0, price: 0 };
    const newLimit = (prev.limit || 0) + 100;
    ladders.value.splice(ladders.value.length - 1, 0, { limit: newLimit, price: last.price });
  };

  const removeLadder = () => {
    if (ladders.value.length > 1) {
      ladders.value.splice(ladders.value.length - 2, 1);
    }
  };

  const result = computed(() => {
    const u = Number(usage.value) || 0;
    if (calcMode.value === 'flat') {
      const p = Number(flatPrice.value) || 0;
      return { total: u * p, details: [] };
    } else {
      let remaining = u;
      let totalCost = 0;
      const details = [];
      let prevLimit = 0;

      for (let i = 0; i < ladders.value.length; i++) {
        if (remaining <= 0) break;
        const level = ladders.value[i];
        const limit = level.limit;
        const price = Number(level.price) || 0;
        const span = limit === null ? Infinity : limit - prevLimit;
        const amount = Math.min(remaining, span);

        const cost = amount * price;
        totalCost += cost;
        details.push({ amount: amount.toFixed(1), cost, price });

        remaining -= amount;
        if (limit !== null) prevLimit = limit;
      }

      return { total: totalCost, details };
    }
  });

  const formatMoney = (val: number) => {
    if (val === undefined || isNaN(val)) return '0.00';
    return val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
</script>

<style scoped>
  @import '@/assets/styles/brutalism.css';

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
  }

  .brutal-title span {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0;
    padding-bottom: 8px;
  }

  .form-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .form-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .mode-tabs {
    display: flex;
    background: #111;
    border: 3px solid #111;
    gap: 4px;
    padding: 4px;
  }

  .tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    color: #fff;
    padding: 12px;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    box-shadow: none;
  }
  .tab-btn.active {
    background: #ffd900;
    color: #111;
  }
  .tab-btn:hover:not(.active) {
    background: #333;
  }

  .config-tabs {
    background: #fff;
  }
  .cfg-btn {
    flex: 1;
    border: none;
    border-right: 2px solid #111;
    background: transparent;
    color: #111;
    padding: 10px;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
  }
  .cfg-btn:last-child {
    border-right: none;
  }
  .cfg-btn.active {
    background: #00ffff;
  }
  .cfg-btn:hover:not(.active) {
    background: #eee;
  }

  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-start {
    justify-content: flex-start;
  }
  .items-center {
    align-items: center;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .flex-1 {
    flex: 1;
  }
  .w-full {
    width: 100%;
  }
  .w-20 {
    width: 5rem;
  }
  .w-24 {
    width: 6rem;
  }
  .min-w-16 {
    min-width: 4rem;
  }
  .h-full {
    height: 100%;
  }

  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
  }
  .mb-3 {
    margin-bottom: 0.75rem;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  .mt-4 {
    margin-top: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .mx-2 {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .mr-2 {
    margin-right: 0.5rem;
  }
  .mr-4 {
    margin-right: 1rem;
  }
  .ml-auto {
    margin-left: auto;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pt-6 {
    padding-top: 1.5rem;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .p-6 {
    padding: 1.5rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .pl-4 {
    padding-left: 1rem;
  }
  .pl-6 {
    padding-left: 1.5rem;
  }
  .pl-8 {
    padding-left: 2rem;
  }
  .pr-2 {
    padding-right: 0.5rem;
  }
  .pr-4 {
    padding-right: 1rem;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .gap-3 {
    gap: 0.75rem;
  }
  .gap-4 {
    gap: 1rem;
  }

  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .left-2 {
    left: 0.5rem;
  }
  .top-1\/2 {
    top: 50%;
  }
  .-translate-y-1\/2 {
    transform: translateY(-50%);
  }

  .text-center {
    text-align: center;
  }
  .text-right {
    text-align: right;
  }
  .whitespace-nowrap {
    white-space: nowrap;
  }
  .inline-block {
    display: inline-block;
  }
  .w-max-content {
    width: max-content;
  }
  .self-start {
    align-self: flex-start;
  }

  .hg-input {
    font-size: 2.2rem;
    font-weight: 900;
    line-height: 1.2;
    padding: 1rem 0.5rem;
  }
  .bg-transparent {
    background: transparent;
  }
  .border-none {
    border: none;
  }
  .outline-none {
    outline: none;
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .shrink-0 {
    flex-shrink: 0;
  }
  .min-w-0 {
    min-width: 0;
  }

  .font-bold {
    font-weight: bold;
  }
  .font-black {
    font-weight: 900;
  }
  .font-mono {
    font-family: 'IBM Plex Mono', monospace;
  }
  .text-xs {
    font-size: 0.75rem;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .text-3xl {
    font-size: 1.875rem;
  }
  .text-6xl {
    font-size: 3.75rem;
  }

  .border-t-4 {
    border-top: 4px solid #111;
  }
  .border-b-2 {
    border-bottom: 2px solid #111;
  }
  .border-b-4 {
    border-bottom: 4px solid #111;
  }
  .border-l-4 {
    border-left: 4px solid #111;
  }
  .border-2 {
    border: 2px solid #111;
  }
  .border-3 {
    border: 3px solid #111;
  }
  .border-4 {
    border: 4px solid #111;
  }
  .border-black {
    border-color: #111;
  }
  .border-white {
    border-color: #fff;
  }
  .border-dashed {
    border-style: dashed;
  }

  .huge {
    font-size: 4rem;
    font-weight: 900;
  }
  .transition-all {
    transition: all 0.2s;
  }
  .transition-transform {
    transition: transform 0.2s;
  }
  .transform {
    transform: translateY(0);
  }
  .hover\:-translate-y-1:hover {
    transform: translateY(-4px);
  }

  .drop-shadow-black {
    text-shadow: 4px 4px 0px #111;
  }
  .text-pink {
    color: #ff4b4b;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }
  .opacity-80 {
    opacity: 0.8;
  }
  .leading-relaxed {
    line-height: 1.625;
  }

  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-cyan {
    background-color: #00ffff;
  }
  .bg-pink {
    background-color: #ff4b4b;
  }
  .bg-white {
    background-color: #fff;
  }
  .bg-black {
    background-color: #111;
  }
  .hover-bg-gray:hover {
    background-color: #fafafa;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
  }
  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
  }
  .shadow-solid-sm {
    box-shadow: 2px 2px 0px #111;
  }
  .shadow-solid-inverse {
    box-shadow: 4px 4px 0px #fff;
  }
  .shadow-solid-inverse-sm {
    box-shadow: 2px 2px 0px #fff;
  }
  .input-wrap {
    align-items: stretch;
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-weight: 900;
    font-size: 1.2rem;
    line-height: 1;
    border: 2px solid #111;
    cursor: pointer;
    transition: transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .action-btn:hover {
    transform: scale(1.1);
    box-shadow: 2px 2px 0px #111;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .flex-wrap {
      gap: 0.5rem;
    }
  }

  /* Dark mode */
  [data-theme='dark'] .brutal-wrapper {
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
  }
  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-cyan {
    background-color: #008080;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000;
  }
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background-color: #333;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .text-black {
    color: #eee;
  }
  [data-theme='dark'] .text-white {
    color: #fff;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-2,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-4,
  [data-theme='dark'] .border-t-4,
  [data-theme='dark'] .border-b-2,
  [data-theme='dark'] .border-b-4,
  [data-theme='dark'] .border-l-4 {
    border-color: #eee;
  }
  [data-theme='dark'] .border-white {
    border-color: #333;
  }
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
  }
  [data-theme='dark'] .cfg-btn {
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .cfg-btn:hover:not(.active) {
    background: #333;
  }
  [data-theme='dark'] .hover-bg-gray:hover {
    background-color: #2a2a2a;
  }
  [data-theme='dark'] .brutal-shadow,
  [data-theme='dark'] .brutal-shadow-sm,
  [data-theme='dark'] .shadow-solid-sm {
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .shadow-solid-inverse,
  [data-theme='dark'] .shadow-solid-inverse-sm {
    box-shadow: 3px 3px 0px #333;
  }
  [data-theme='dark'] .drop-shadow-black {
    text-shadow: 4px 4px 0px #111;
  }
</style>
