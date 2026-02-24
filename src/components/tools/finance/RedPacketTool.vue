<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">红包<span>.平分()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main
        class="flex justify-center"
        style="max-width: 600px; width: 100%; margin: 0 auto; padding-bottom: 2rem"
      >
        <div class="center-card w-full">
          <section class="brutal-pane mb-6 bg-yellow border-4 border-black p-6">
            <h2 class="pane-title mb-4">设定条件.RULES</h2>
            <div class="mode-tabs brutal-shadow mb-6">
              <button
                class="tab-btn"
                :class="{ active: mode === 'random' }"
                @click="mode = 'random'"
              >
                🎲 拼手气红包
              </button>
              <button class="tab-btn" :class="{ active: mode === 'equal' }" @click="mode = 'equal'">
                ⚖️ 普通等额红包
              </button>
            </div>

            <div class="form-grid mb-4">
              <div class="form-group flex-1">
                <label class="form-label">总金额</label>
                <div class="input-with-currency relative">
                  <span class="currency-symbol absolute">¥</span>
                  <input
                    v-model.number="totalAmount"
                    type="number"
                    step="0.01"
                    class="brutal-input large-input w-full"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group flex-1">
                <label class="form-label">红包个数</label>
                <div class="input-with-currency relative">
                  <input
                    v-model.number="count"
                    type="number"
                    min="1"
                    class="brutal-input large-input w-full pr-12"
                    placeholder="发几个 (人)"
                  />
                  <span class="unit-symbol absolute right-4">个</span>
                </div>
              </div>
            </div>

            <button
              class="calc-btn brutal-btn w-full mt-6 bg-pink text-white font-black text-2xl py-4 border-4"
              @click="generatePackets"
            >
              {{ mode === 'random' ? '🏮 塞钱进随机红包' : '🏮 生成等额分配' }}
            </button>
          </section>

          <section
            v-if="packets.length > 0"
            class="brutal-pane bg-white border-3 border-black p-4 brutal-shadow mt-6"
          >
            <div class="flex justify-between items-end border-b-3 border-black pb-2 mb-4">
              <h3 class="font-black text-lg">开启结果.RESULT</h3>
              <span class="text-sm font-bold opacity-80"
                >共 {{ packets.length }} 个 / 累计 ¥ {{ totalChecked.toFixed(2) }}</span
              >
            </div>

            <div class="packet-list font-mono font-bold custom-scrollbar">
              <div
                v-for="(p, index) in packets"
                :key="index"
                class="packet-item flex items-center justify-between p-3 border-b-2 border-black border-dashed"
                :class="{ 'bg-pink text-white border-solid': p.isBest && mode === 'random' }"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="avatar bg-black text-white w-8 h-8 flex items-center justify-center font-black"
                  >
                    {{ index + 1 }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm">第 {{ index + 1 }} 号领取者</span>
                    <span class="text-xs opacity-70">领于 {{ p.time }}</span>
                  </div>
                </div>

                <div class="flex flex-col items-end">
                  <span class="text-xl">¥ {{ p.amount.toFixed(2) }}</span>
                  <span
                    v-if="p.isBest && mode === 'random'"
                    class="text-xs bg-yellow text-black px-1 border-2 border-black mt-1 font-black"
                  >
                    👑 运气全场最佳
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import dayjs from 'dayjs';

  const mode = ref<'random' | 'equal'>('random');
  const totalAmount = ref<number | ''>('');
  const count = ref<number | ''>('');

  interface Packet {
    amount: number;
    isBest: boolean;
    time: string;
  }

  const packets = ref<Packet[]>([]);

  const totalChecked = computed(() => packets.value.reduce((sum, p) => sum + p.amount, 0));

  const generatePackets = () => {
    if (!totalAmount.value || !count.value || count.value < 1) return;

    const total = Number(totalAmount.value);
    const n = Math.floor(count.value);
    const list: Packet[] = [];

    if (mode.value === 'equal') {
      const val = Math.floor((total / n) * 100) / 100;

      for (let i = 0; i < n; i++) {
        list.push({ amount: val, isBest: false, time: dayjs().format('HH:mm:ss') });
      }
    } else {
      let remainMoney = total;
      let remainCount = n;

      for (let i = 0; i < n - 1; i++) {
        const max = (remainMoney / remainCount) * 2;
        let money = Math.random() * max;
        money = Math.floor(money * 100) / 100;
        if (money < 0.01) money = 0.01;

        if (remainMoney - money < (remainCount - 1) * 0.01) {
          money = remainMoney - (remainCount - 1) * 0.01;
          money = Math.floor(money * 100) / 100;
        }

        list.push({ amount: money, isBest: false, time: dayjs().format('HH:mm:ss') });
        remainMoney -= money;
        remainCount--;
      }
      list.push({
        amount: Math.round(remainMoney * 100) / 100,
        isBest: false,
        time: dayjs().format('HH:mm:ss')
      });

      let maxVal = 0;
      list.forEach(p => {
        if (p.amount > maxVal) maxVal = p.amount;
      });
      list.forEach(p => {
        if (p.amount === maxVal) p.isBest = true;
      });
    }

    packets.value = list;
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
    border-bottom: 3px solid #111;
    padding-bottom: 8px;
  }

  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    background: #fff;
    color: #111;
  }
  .tab-btn:hover:not(.active) {
    background: #333;
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
  .items-center {
    align-items: center;
  }
  .items-end {
    align-items: flex-end;
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }
  .w-full {
    width: 100%;
    min-width: 0;
  }
  .w-8 {
    width: 2rem;
  }
  .h-8 {
    height: 2rem;
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
  .mt-1 {
    margin-top: 0.25rem;
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
  .p-3 {
    padding: 0.75rem;
  }
  .p-4 {
    padding: 1rem;
  }
  .p-6 {
    padding: 1.5rem;
  }
  .px-1 {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  .gap-3 {
    gap: 0.75rem;
  }

  .relative {
    position: relative;
  }
  .absolute {
    position: absolute;
  }
  .right-4 {
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 800;
    font-size: 1.5rem;
    color: #111;
  }

  .large-input {
    font-size: 2.2rem;
    padding: 1rem;
    padding-left: 3rem;
    font-weight: 900;
  }
  .pr-12 {
    padding-right: 3rem;
    padding-left: 1rem;
  }
  .currency-symbol {
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2rem;
    font-weight: 900;
    color: #111;
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
  .text-2xl {
    font-size: 1.5rem;
  }

  .border-b-2 {
    border-bottom: 2px solid #111;
  }
  .border-b-3 {
    border-bottom: 3px solid #111;
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
  .border-dashed {
    border-style: dashed;
  }
  .border-solid {
    border-style: solid !important;
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
  .opacity-70 {
    opacity: 0.7;
  }

  .bg-yellow {
    background-color: #ffd900;
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

  .packet-list {
    max-height: 420px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
    transition: transform 0.1s;
  }

  /* Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 12px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #fff;
    border-left: 2px solid #111;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #111;
    border-left: 2px solid #fff;
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
  [data-theme='dark'] .text-black {
    color: #eee;
  }
  [data-theme='dark'] .mode-tabs {
    border-color: #eee;
  }
  [data-theme='dark'] .currency-symbol,
  [data-theme='dark'] .unit-symbol {
    color: #eee;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-2,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-4,
  [data-theme='dark'] .border-b-2,
  [data-theme='dark'] .border-b-3 {
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-shadow {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .custom-scrollbar::-webkit-scrollbar-track {
    border-color: #eee;
    background: #1a1a1a;
  }
  [data-theme='dark'] .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #eee;
    border-left: 2px solid #1a1a1a;
  }
</style>
