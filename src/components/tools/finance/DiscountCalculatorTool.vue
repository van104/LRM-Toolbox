<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">折扣<span>.计算()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main
        class="flex justify-center"
        style="max-width: 1200px; width: 100%; margin: 0 auto; padding-bottom: 2rem"
      >
        <div class="center-card">
          <div class="mode-tabs brutal-shadow mb-6">
            <button
              class="tab-btn brutal-input"
              :class="{ active: mode === 'single' }"
              @click="mode = 'single'"
            >
              🛒 单品折扣
            </button>
            <button
              class="tab-btn brutal-input"
              :class="{ active: mode === 'pool' }"
              @click="mode = 'pool'"
            >
              📦 满减凑单
            </button>
          </div>

          <!-- 单品模式 -->
          <section v-if="mode === 'single'" class="brutal-pane bg-white">
            <div class="form-group mb-6">
              <label class="form-label">原价 (¥)</label>
              <input
                v-model.number="originalPrice"
                type="number"
                placeholder="0.00"
                class="brutal-input w-full text-2xl h-14"
              />
            </div>

            <div class="form-group">
              <label class="form-label">折扣力度</label>
              <div class="discount-input-group brutal-shadow mb-4">
                <input
                  v-model.number="discountValue"
                  type="number"
                  placeholder="如 8.5"
                  class="brutal-input border-0 flex-1 text-xl"
                  style="box-shadow: none"
                />
                <div class="toggle-type flex border-l-3 border-black">
                  <span
                    class="toggle-btn"
                    :class="{ active: discountType === 'zhe' }"
                    @click="discountType = 'zhe'"
                    >折</span
                  >
                  <span
                    class="toggle-btn"
                    :class="{ active: discountType === 'percent' }"
                    @click="discountType = 'percent'"
                    >% off</span
                  >
                </div>
              </div>

              <div class="quick-select">
                <button class="brutal-btn py-1 px-3 text-sm" @click="setDiscount(9)">9折</button>
                <button class="brutal-btn py-1 px-3 text-sm" @click="setDiscount(8.5)">85折</button>
                <button class="brutal-btn py-1 px-3 text-sm" @click="setDiscount(8)">8折</button>
                <button class="brutal-btn py-1 px-3 text-sm" @click="setDiscount(7)">7折</button>
                <button class="brutal-btn py-1 px-3 text-sm" @click="setDiscount(5)">半价</button>
              </div>
            </div>

            <div v-if="originalPrice > 0" class="result-display mt-8 border-t-4 border-black pt-6">
              <div class="final-price-box">
                <span class="label font-bold text-gray-600">折后价 RESULT</span>
                <div class="price highlight">
                  <span class="symbol font-mono">¥</span>
                  {{ formatMoney(singleResult.final) }}
                </div>
              </div>

              <div class="saved-info flex justify-center gap-4 mt-6">
                <div class="badge bg-pink text-white">
                  🔥 已省 ¥{{ formatMoney(singleResult.saved) }}
                </div>
                <div class="badge bg-yellow">💡 实付 {{ singleResult.realRate }}折</div>
              </div>
            </div>
          </section>

          <!-- 满减模式 -->
          <section v-else class="brutal-pane bg-cyan">
            <div class="pool-header mb-6 p-4 bg-white border-3 border-black brutal-shadow">
              <label class="form-label font-bold">活动规则.RULES</label>
              <div class="rule-inputs flex items-center gap-2 mt-2">
                <span class="font-bold">满</span>
                <input
                  v-model.number="poolRule.threshold"
                  type="number"
                  placeholder="300"
                  class="brutal-input w-24 text-center"
                />
                <span class="font-bold">减</span>
                <input
                  v-model.number="poolRule.reduce"
                  type="number"
                  placeholder="50"
                  class="brutal-input w-24 text-center"
                />
              </div>
              <label class="brutal-checkbox mt-4">
                <input v-model="poolRule.isLoop" type="checkbox" />
                <span class="check-box"></span>
                <strong>每满 {{ poolRule.threshold }} 减 {{ poolRule.reduce }} (循环计算)</strong>
              </label>
            </div>

            <div class="items-list bg-white p-4 border-3 border-black brutal-shadow">
              <label class="form-label font-bold border-b-3 border-black pb-2 mb-4 block"
                >商品列表.ITEMS</label
              >
              <div v-for="(item, idx) in poolItems" :key="idx" class="item-row flex gap-2 mb-3">
                <input
                  v-model="item.name"
                  type="text"
                  :placeholder="`商品 ${idx + 1}`"
                  class="brutal-input flex-2"
                />
                <div
                  class="item-price flex items-center bg-white border-3 border-black px-2 flex-1"
                >
                  <span class="font-bold mr-1">¥</span>
                  <input
                    v-model.number="item.price"
                    type="number"
                    placeholder="0"
                    class="border-0 outline-none w-full font-mono font-bold"
                  />
                </div>
                <button
                  v-if="poolItems.length > 1"
                  class="brutal-btn bg-pink text-white px-3"
                  @click="delItem(idx)"
                >
                  ✕
                </button>
              </div>
              <button class="brutal-btn w-full mt-2 bg-yellow" @click="addItem">
                + 添加新商品
              </button>
            </div>

            <div class="pool-result mt-6 bg-white p-4 border-3 border-black brutal-shadow">
              <div class="flex justify-between mb-2">
                <span class="font-bold">商品总额</span>
                <span class="font-mono font-bold">¥{{ formatMoney(poolResult.total) }}</span>
              </div>
              <div class="flex justify-between mb-2 text-red">
                <span class="font-bold text-pink">优惠金额</span>
                <span class="font-mono font-bold text-pink"
                  >- ¥{{ formatMoney(poolResult.discount) }}</span
                >
              </div>
              <div class="flex justify-between pt-3 border-t-3 border-black text-xl">
                <span class="font-black">实付总额</span>
                <span class="font-mono font-black highlight"
                  >¥{{ formatMoney(poolResult.final) }}</span
                >
              </div>

              <div class="mt-6 pt-4 border-t-3 border-dashed border-black">
                <div v-if="poolResult.nextThreshold > 0" class="tips-box bg-yellow">
                  <div>
                    ⚠️ 再凑
                    <strong class="font-mono text-lg">¥{{ formatMoney(poolResult.diff) }}</strong>
                  </div>
                  <div>
                    👉 可减
                    <strong class="font-mono text-lg"
                      >¥{{ formatMoney(poolResult.nextReduce) }}</strong
                    >
                  </div>
                </div>
                <div v-else-if="poolResult.total > 0" class="tips-box bg-green text-black">
                  ✅ 已达成满减优惠！相当于 {{ poolResult.rate }} 折
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const mode = ref('single');
  const originalPrice = ref('');
  const discountValue = ref(8);
  const discountType = ref('zhe');

  const setDiscount = val => {
    discountValue.value = val;
    discountType.value = 'zhe';
  };

  const singleResult = computed(() => {
    const p = parseFloat(originalPrice.value) || 0;
    const d = parseFloat(discountValue.value) || 0;

    let final = 0;
    if (discountType.value === 'zhe') final = p * (d / 10);
    else final = p * ((100 - d) / 100);

    const saved = p - final;
    const realRate = p > 0 ? ((final / p) * 10).toFixed(1) : '0';
    return { final, saved, realRate };
  });

  const poolRule = ref({ threshold: 300, reduce: 50, isLoop: true });
  const poolItems = ref([{ name: '', price: '' }]);

  const addItem = () => poolItems.value.push({ name: '', price: '' });
  const delItem = idx => poolItems.value.splice(idx, 1);

  const poolResult = computed(() => {
    const total = poolItems.value.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    const T = parseFloat(poolRule.value.threshold) || 0;
    const R = parseFloat(poolRule.value.reduce) || 0;

    let discount = 0;
    let nextThreshold = 0;
    let diff = 0;
    let nextReduce = 0;

    if (T > 0 && R > 0) {
      if (poolRule.value.isLoop) {
        const count = Math.floor(total / T);
        discount = count * R;
        nextThreshold = (count + 1) * T;
        diff = nextThreshold - total;
        nextReduce = R;
      } else {
        if (total >= T) {
          discount = R;
          nextThreshold = 0;
        } else {
          nextThreshold = T;
          diff = T - total;
          nextReduce = R;
        }
      }
    }

    const final = total - discount;
    const rate = total > 0 ? ((final / total) * 10).toFixed(1) : 0;
    return { total, discount, final, nextThreshold, diff, nextReduce, rate };
  });

  const formatMoney = val => {
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
  .center-card {
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
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

  .form-label {
    display: block;
    font-size: 1.1rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .discount-input-group {
    display: flex;
    border: 3px solid #111;
    background: #fff;
  }

  .toggle-type {
    display: flex;
  }
  .toggle-btn {
    padding: 0 1rem;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 800;
    background: #fff;
    color: #111;
    border-left: 3px solid #111;
    transition: all 0.1s;
  }
  .toggle-btn:first-child {
    border-left: none;
  }
  .toggle-btn.active {
    background: #ff4b4b;
    color: #fff;
  }

  .quick-select {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
  }

  .final-price-box {
    text-align: center;
  }
  .highlight {
    font-size: 4rem;
    font-weight: 900;
    color: #ff4b4b;
    text-shadow: 4px 4px 0px #111;
  }
  .text-pink {
    color: #ff4b4b;
  }

  .badge {
    padding: 6px 12px;
    border: 3px solid #111;
    font-weight: 800;
    font-size: 0.95rem;
    box-shadow: 3px 3px 0px #111;
  }

  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .text-center {
    text-align: center;
  }
  .w-full {
    width: 100%;
  }
  .w-24 {
    width: 6rem;
  }
  .h-14 {
    height: 3.5rem;
  }
  .flex-1 {
    flex: 1;
  }
  .flex-2 {
    flex: 2;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .text-2xl {
    font-size: 1.5rem;
    font-family: 'IBM Plex Mono', monospace;
  }
  .text-sm {
    font-size: 0.875rem;
  }
  .text-lg {
    font-size: 1.125rem;
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
  .block {
    display: block;
  }
  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .gap-4 {
    gap: 1rem;
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
  .mt-2 {
    margin-top: 0.5rem;
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
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pt-3 {
    padding-top: 0.75rem;
  }
  .pt-4 {
    padding-top: 1rem;
  }
  .pt-6 {
    padding-top: 1.5rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  .mr-1 {
    margin-right: 0.25rem;
  }

  .border-0 {
    border: none !important;
  }
  .border-3 {
    border: 3px solid #111;
  }
  .border-black {
    border-color: #111;
  }
  .border-b-3 {
    border-bottom: 3px solid #111;
  }
  .border-t-3 {
    border-top: 3px solid #111;
  }
  .border-t-4 {
    border-top: 4px solid #111;
  }
  .border-dashed {
    border-style: dashed;
  }
  .outline-none {
    outline: none;
  }

  .bg-white {
    background-color: #fff;
  }
  .bg-black {
    background-color: #111;
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
  .bg-green {
    background-color: #00e572;
  }
  .text-white {
    color: #fff;
  }
  .text-black {
    color: #111;
  }

  .tips-box {
    padding: 12px;
    border: 3px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 4px 4px 0px #111;
    text-align: center;
  }

  .brutal-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .brutal-checkbox input {
    display: none;
  }
  .check-box {
    width: 20px;
    height: 20px;
    border: 3px solid #111;
    display: inline-block;
    background: #fff;
    transition: all 0.1s;
    position: relative;
  }
  .brutal-checkbox input:checked + .check-box {
    background: #111;
  }
  .brutal-checkbox input:checked + .check-box::after {
    content: '✔';
    color: #fff;
    position: absolute;
    left: 2px;
    top: -2px;
    font-size: 14px;
  }

  /* Dark mode */
  [data-theme='dark'] .brutal-wrapper {
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
  }
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .bg-cyan {
    background-color: #008080;
  }
  [data-theme='dark'] .bg-yellow {
    background-color: #b28f00;
    color: #ebecf0;
  }
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
  }
  [data-theme='dark'] .border-black {
    border-color: #eee;
  }
  [data-theme='dark'] .border-t-4 {
    border-top-color: #eee;
  }
  [data-theme='dark'] .badge,
  [data-theme='dark'] .tips-box {
    box-shadow: 3px 3px 0px #eee;
    border-color: #eee;
  }
  [data-theme='dark'] .form-label {
    color: #eee;
  }
  [data-theme='dark'] .highlight {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
</style>
