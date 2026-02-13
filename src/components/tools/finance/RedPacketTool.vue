<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>红包平分计算器</h1>
        <span class="nav-subtitle">Red Packet Splitter</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="mode-switch">
          <button :class="{ active: mode === 'random' }" @click="mode = 'random'">
            拼手气 (随机)
          </button>
          <button :class="{ active: mode === 'equal' }" @click="mode = 'equal'">普通 (等额)</button>
        </div>

        <div class="input-group">
          <label>总金额 (元)</label>
          <div class="amount-input">
            <span class="currency">¥</span>
            <input v-model.number="totalAmount" type="number" placeholder="0.00" step="0.01" />
          </div>
        </div>

        <div class="input-group">
          <label>红包个数 (人)</label>
          <input
            v-model.number="count"
            type="number"
            placeholder="填写个数"
            class="count-input"
            min="1"
          />
        </div>

        <button class="generate-btn" @click="generatePackets">
          {{ mode === 'random' ? '塞进红包' : '生成分配' }}
        </button>

        <div v-if="packets.length > 0" class="result-list">
          <div class="result-header">
            已生成 {{ packets.length }} 个红包，共 {{ totalChecked.toFixed(2) }} 元
          </div>

          <div
            v-for="(p, index) in packets"
            :key="index"
            class="packet-item"
            :class="{ 'lucky-king': p.isBest && mode === 'random' }"
          >
            <div class="left">
              <div class="avatar">{{ index + 1 }}</div>
              <div class="info">
                <span class="name">第 {{ index + 1 }} 个</span>
                <span class="time">{{ p.time }}</span>
              </div>
            </div>
            <div class="right">
              <span class="money">¥ {{ p.amount.toFixed(2) }}</span>
              <span v-if="p.isBest && mode === 'random'" class="best-tag">
                <el-icon><Trophy /></el-icon> 手气最佳
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 金融理财系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back, Trophy } from '@element-plus/icons-vue';
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
      // Handle remainder: add to waiting list? normally strict equal means verify total
      // Usually equal packets simply divide. Last one might get fix for precision?
      // Actually equal packet usually means EXACTLY equal.
      // If total can't be divided, inform user? Or just give equal.

      for (let i = 0; i < n; i++) {
        list.push({ amount: val, isBest: false, time: dayjs().format('HH:mm') });
      }
      // Fix total logic if needed, but for "Equal", usually input is Per Person or Fixed Total
      // If input is Total, then: 100 / 3 = 33.33. Total 99.99. 0.01 left.
      // Let's add remainder to last one? No, equal means EQUAL.
      // Let's assume input is correct or we allow minimal deviation.
      // Better: If equal mode, we just divide.
    } else {
      // Random Mode (Red Packet Algo)
      let remainMoney = total;
      let remainCount = n;

      for (let i = 0; i < n - 1; i++) {
        // Max for this one: 2 * (remain / remainCount)
        // Min: 0.01
        const max = (remainMoney / remainCount) * 2;
        let money = Math.random() * max;
        money = Math.floor(money * 100) / 100;
        if (money < 0.01) money = 0.01;

        // Ensure enough left for others
        if (remainMoney - money < (remainCount - 1) * 0.01) {
          money = remainMoney - (remainCount - 1) * 0.01;
          money = Math.floor(money * 100) / 100; // Recalc
        }

        list.push({ amount: money, isBest: false, time: dayjs().format('HH:mm') });
        remainMoney -= money;
        remainCount--;
      }
      // Last one
      list.push({
        amount: Math.round(remainMoney * 100) / 100,
        isBest: false,
        time: dayjs().format('HH:mm')
      });

      // Find lucky king
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
  .tool-container {
    min-height: 100vh;
    background: #fdf2f2; /* Light red/pink bg */
    font-family: 'Inter', system-ui, sans-serif;
    color: #7f1d1d;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #991b1b;
    width: 80px;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }

  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #991b1b;
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #ef4444;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 500px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .glass-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.1);
    border: 1px solid #fee2e2;
  }

  .mode-switch {
    display: flex;
    background: #fef2f2;
    padding: 4px;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .mode-switch button {
    flex: 1;
    padding: 0.8rem;
    border: none;
    background: transparent;
    color: #ef4444;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .mode-switch button.active {
    background: #ef4444;
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .input-group {
    margin-bottom: 1.5rem;
  }

  .input-group label {
    display: block;
    font-size: 0.9rem;
    color: #7f1d1d;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .amount-input {
    display: flex;
    align-items: center;
    border-bottom: 2px solid #fee2e2;
    padding-bottom: 0.5rem;
  }

  .amount-input .currency {
    font-size: 2rem;
    font-weight: 800;
    color: #1f2937;
    margin-right: 0.5rem;
  }

  .amount-input input {
    border: none;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    width: 100%;
    outline: none;
  }

  .count-input {
    width: 100%;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    font-size: 1.1rem;
    outline: none;
  }

  .generate-btn {
    width: 100%;
    background: #ef4444;
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: transform 0.1s;
  }

  .generate-btn:active {
    transform: scale(0.98);
  }

  .result-list {
    margin-top: 2rem;
  }

  .result-header {
    font-size: 0.85rem;
    color: #9ca3af;
    margin-bottom: 1rem;
    text-align: center;
  }

  .packet-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }

  .packet-item:last-child {
    border-bottom: none;
  }

  .packet-item .left {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background: #fee2e2;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
    font-weight: 700;
  }

  .info {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-size: 0.95rem;
    color: #374151;
  }

  .time {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .right {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .money {
    font-weight: 700;
    color: #1f2937;
  }

  .best-tag {
    font-size: 0.7rem;
    color: #fbbf24;
    display: flex;
    align-items: center;
    gap: 2px;
    margin-top: 2px;
    font-weight: 600;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #ef4444;
    font-size: 0.875rem;
    opacity: 0.8;
  }
</style>
