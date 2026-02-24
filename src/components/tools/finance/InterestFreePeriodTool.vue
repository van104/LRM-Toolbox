<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">免息期<span>.计算()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main
        class="flex justify-center"
        style="max-width: 1200px; width: 100%; margin: 0 auto; padding-bottom: 2rem"
      >
        <div class="center-card">
          <section class="brutal-pane mb-6">
            <h2 class="pane-title mb-4">日期设定.DATES</h2>
            <div class="form-grid">
              <div class="flex-row gap-4">
                <div class="form-group flex-1">
                  <label class="form-label">账单日</label>
                  <select v-model.number="billingDay" class="brutal-input w-full">
                    <option v-for="d in 31" :key="d" :value="d">{{ d }} 号</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">还款日规则</label>
                  <select v-model="repaymentType" class="brutal-input w-full">
                    <option value="fixed">固定日期</option>
                    <option value="interval">账单后 N 天</option>
                  </select>
                </div>
              </div>

              <div class="flex-row gap-4">
                <div class="form-group flex-1">
                  <label class="form-label">
                    <template v-if="repaymentType === 'fixed'">还款日</template>
                    <template v-else>还款间隔 (天)</template>
                  </label>
                  <select
                    v-if="repaymentType === 'fixed'"
                    v-model.number="repaymentDay"
                    class="brutal-input w-full"
                  >
                    <option v-for="d in 31" :key="d" :value="d">{{ d }} 号</option>
                  </select>
                  <input
                    v-else
                    v-model.number="repaymentInterval"
                    type="number"
                    min="1"
                    max="60"
                    class="brutal-input w-full"
                  />
                </div>

                <div class="form-group flex-1">
                  <label class="form-label">消费刷卡日期</label>
                  <input v-model="transactionDate" type="date" class="brutal-input w-full" />
                </div>
              </div>
            </div>
          </section>

          <section class="brutal-pane bg-yellow mb-6 pb-2">
            <div class="main-result text-center mb-4">
              <h3 class="pane-title mb-4" style="border: none">最长免息期</h3>
              <div class="value huge highlight font-mono font-black">
                {{ result.days }} <span class="text-xl">天</span>
              </div>
              <div class="mt-4 badge tracking-wide border-black p-2 bg-white inline-block">
                <template v-if="result.days > 50">🎉 超长免息期！十分划算！</template>
                <template v-else-if="result.days < 20">⚠️ 免息期较短，请注意还款！</template>
                <template v-else>✅ 正常免息期范围</template>
              </div>
            </div>

            <div class="details-grid mt-6 border-t-4 border-black pt-4">
              <div class="detail-item text-center">
                <span class="block text-sm font-bold mb-1">本期出账日</span>
                <span
                  class="block font-mono font-bold text-lg bg-white border-2 border-black inline-block px-3 py-1 brutal-shadow-sm"
                  >{{ result.billingDate }}</span
                >
              </div>
              <div class="detail-item text-center">
                <span class="block text-sm font-bold mb-1 text-pink">最后还款日</span>
                <span
                  class="block font-mono font-bold text-lg bg-pink text-white border-2 border-black inline-block px-3 py-1 brutal-shadow-sm"
                  >{{ result.repaymentDate }}</span
                >
              </div>
            </div>
          </section>

          <section class="brutal-pane bg-cyan p-4">
            <h4 class="font-bold mb-2">💡 使用技巧</h4>
            <p class="text-sm border-l-4 border-black pl-3 font-bold bg-white p-2 border-r-4">
              👉 在<strong>账单日次日</strong>消费，通常能获得最长的免息期（可达 50-56 天）。<br />
              👉 在<strong>账单日前一天</strong>消费，免息期最短（只有 20 天左右）。
            </p>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';

  const billingDay = ref(1);
  const repaymentType = ref('interval');
  const repaymentDay = ref(20);
  const repaymentInterval = ref(20);
  const transactionDate = ref(dayjs().format('YYYY-MM-DD'));

  const result = computed(() => {
    if (!transactionDate.value) return { days: 0, billingDate: '-', repaymentDate: '-' };

    const trans = dayjs(transactionDate.value);
    const bDay = billingDay.value;

    let billDate = trans.date(bDay);

    if (trans.date() > bDay) {
      billDate = billDate.add(1, 'month');
    }

    let repayDate;
    if (repaymentType.value === 'interval') {
      repayDate = billDate.add(repaymentInterval.value, 'day');
    } else {
      const rDay = repaymentDay.value;
      repayDate = billDate.date(rDay);
      if (rDay <= bDay) repayDate = repayDate.add(1, 'month');
      if (repayDate.isBefore(billDate)) repayDate = repayDate.add(1, 'month');
    }

    const days = repayDate.diff(trans, 'day');

    return {
      days,
      billingDate: billDate.format('YYYY-MM-DD'),
      repaymentDate: repayDate.format('YYYY-MM-DD')
    };
  });
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

  .pane-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    margin: 0;
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-label {
    display: block;
    font-size: 0.95rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }

  .justify-center {
    justify-content: center;
  }
  .flex-row {
    display: flex;
    flex-wrap: wrap;
  }
  .gap-4 {
    gap: 1rem;
  }
  .flex-1 {
    flex: 1;
    min-width: 150px;
  }
  .w-full {
    width: 100%;
  }

  .mb-1 {
    margin-bottom: 0.25rem;
  }
  .mb-2 {
    margin-bottom: 0.5rem;
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
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pt-4 {
    padding-top: 1rem;
  }
  .p-2 {
    padding: 0.5rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .px-3 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  .pl-3 {
    padding-left: 0.75rem;
  }

  .block {
    display: block;
  }
  .inline-block {
    display: inline-block;
  }
  .text-center {
    text-align: center;
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
  .text-sm {
    font-size: 0.875rem;
  }
  .text-lg {
    font-size: 1.125rem;
  }
  .text-xl {
    font-size: 1.25rem;
  }
  .tracking-wide {
    letter-spacing: 0.05em;
  }

  .border-t-4 {
    border-top: 4px solid #111;
  }
  .border-l-4 {
    border-left: 4px solid #111;
  }
  .border-r-4 {
    border-right: 4px solid #111;
  }
  .border-2 {
    border: 2px solid #111;
  }
  .border-black {
    border-color: #111;
  }

  .huge {
    font-size: 4.5rem;
    font-weight: 900;
    line-height: 1;
  }
  .highlight {
    color: #ff4b4b;
    text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.1);
  }
  .text-pink {
    color: #ff4b4b;
  }
  .text-white {
    color: #fff;
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

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .badge {
    border: 2px solid #111;
    font-weight: 800;
    font-size: 0.95rem;
    box-shadow: 2px 2px 0px #111;
  }
  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
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
  [data-theme='dark'] .bg-white {
    background-color: #1a1a1a;
    color: #eee;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .highlight {
    color: #ff6b6b;
    text-shadow: 4px 4px 0px #111;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-2,
  [data-theme='dark'] .border-l-4,
  [data-theme='dark'] .border-r-4,
  [data-theme='dark'] .border-t-4 {
    border-color: #eee;
  }
  [data-theme='dark'] .bg-pink {
    background-color: #cc0000;
  }
  [data-theme='dark'] .brutal-shadow-sm,
  [data-theme='dark'] .badge {
    box-shadow: 3px 3px 0px #eee;
  }
</style>
