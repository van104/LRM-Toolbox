<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">利率<span>.查询()</span></h1>
        <div style="width: 100px"></div>
      </header>

      <main class="brutal-grid">
        <div class="left-column">
          <section class="brutal-pane bg-white mb-6">
            <h2 class="pane-title mb-4">参数设置.PARAMS</h2>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">预计存款本金 (¥)</label>
                <input
                  v-model.number="principal"
                  type="number"
                  min="0"
                  step="10000"
                  class="brutal-input w-full"
                />
              </div>
              <div class="form-group">
                <label class="form-label">存款期限</label>
                <select v-model="duration" class="brutal-input w-full">
                  <option value="3m">3个月</option>
                  <option value="6m">6个月</option>
                  <option value="1y">1年</option>
                  <option value="2y">2年</option>
                  <option value="3y">3年</option>
                  <option value="5y">5年</option>
                </select>
              </div>
            </div>

            <div class="divider border-b-3 border-black my-6"></div>

            <div class="lpr-display bg-yellow border-3 border-black p-4 brutal-shadow font-bold">
              <div class="lpr-item flex justify-between mb-2">
                <span class="lpr-label">1年期 LPR</span>
                <span class="lpr-val font-mono font-black text-xl text-pink">3.10%</span>
              </div>
              <div class="lpr-item flex justify-between mb-4">
                <span class="lpr-label">5年期以上 LPR</span>
                <span class="lpr-val font-mono font-black text-xl text-pink">3.60%</span>
              </div>
              <p class="lpr-date text-xs text-right italic m-0 opacity-75">
                更新日期: {{ currentDate }}
              </p>
            </div>
          </section>

          <section class="brutal-pane bg-cyan hidden-xs">
            <h4 class="font-bold mb-2">⚠️ 安全保障</h4>
            <p class="text-sm font-bold bg-white p-2 border-3 border-black brutal-shadow-sm">
              根据《存款保险条例》，存款人在此类持牌金融机构的本外币存款，<strong>50万元以内由存款保险基金管理机构全额偿付</strong>。
            </p>
          </section>
        </div>

        <div class="right-column">
          <section class="brutal-pane h-full flex-col p-0">
            <div class="pane-header bg-black p-2 flex gap-2 overflow-x-auto">
              <button
                class="tab-btn flex-1 min-w-[120px]"
                :class="{ active: activeType === 'regular' }"
                @click="activeType = 'regular'"
              >
                定期存款
              </button>
              <button
                class="tab-btn flex-1 min-w-[120px]"
                :class="{ active: activeType === 'cd' }"
                @click="activeType = 'cd'"
              >
                大额存单
              </button>
            </div>

            <div v-if="activeType === 'regular'" class="panel-body p-6">
              <div class="bank-grid">
                <div
                  v-for="bank in banks"
                  :key="bank.name"
                  class="bank-card bg-white border-3 border-black brutal-shadow p-4 flex-col justify-between"
                >
                  <div class="bank-header flex justify-between items-start mb-4">
                    <span class="bank-name font-black text-lg">{{ bank.name }}</span>
                    <span
                      class="bank-tag px-2 py-1 text-xs font-bold border-2 border-black"
                      :class="bank.type === '国有' ? 'bg-gray-200' : 'bg-green'"
                      >{{ bank.type }}</span
                    >
                  </div>
                  <div class="rate-main text-center flex-1 flex-col justify-center my-4">
                    <div class="rate-box text-pink font-mono mb-2">
                      <span class="digit text-4xl font-black leading-none">{{
                        bank.rates[duration]
                      }}</span>
                      <span class="percent text-lg font-bold">%</span>
                    </div>
                    <div class="interest-preview text-sm font-bold mt-2 pb-2">
                      预计总息:
                      <span class="val font-mono text-lg bg-yellow px-1 border-2 border-black ml-1"
                        >¥ {{ formatMoney(calcInterest(bank.rates[duration])) }}</span
                      >
                    </div>
                  </div>
                  <div
                    class="rate-footer text-xs font-bold text-center border-t-3 border-dashed border-black pt-2"
                  >
                    当前挂牌利率: {{ bank.rates[duration] }}%
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="panel-body p-6">
              <div
                class="cd-alert bg-yellow border-3 border-black p-4 brutal-shadow mb-6 flex gap-4 font-bold"
              >
                <span class="text-2xl">💡</span>
                <div>
                  <div class="text-lg font-black mb-1">大额存单申购提示</div>
                  <div class="text-sm">
                    大额存单通常有起存金额要求（如20万、30万、50万起），且额度有限，建议通过网上银行或线下网点确认实时额度。
                  </div>
                </div>
              </div>

              <div class="table-container border-3 border-black bg-white overflow-x-auto">
                <table class="brutal-table w-full text-center whitespace-nowrap">
                  <thead>
                    <tr class="bg-black text-white">
                      <th class="p-3 border-r-2 border-b-2 border-white">银行名称</th>
                      <th class="p-3 border-r-2 border-b-2 border-white">起存金额</th>
                      <th class="p-3 border-r-2 border-b-2 border-white">1年期</th>
                      <th class="p-3 border-r-2 border-b-2 border-white">2年期</th>
                      <th class="p-3 border-b-2 border-white">3年期</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, idx) in cdData"
                      :key="idx"
                      :class="{ 'bg-gray-100': idx % 2 !== 0 }"
                    >
                      <td class="p-3 border-r-2 border-b-2 border-black font-bold">
                        {{ row.bank }}
                      </td>
                      <td class="p-3 border-r-2 border-b-2 border-black font-mono font-bold">
                        {{ row.limit }}
                      </td>
                      <td
                        class="p-3 border-r-2 border-b-2 border-black font-mono font-black text-pink"
                      >
                        {{ row.y1 }}%
                      </td>
                      <td
                        class="p-3 border-r-2 border-b-2 border-black font-mono font-black text-pink"
                      >
                        {{ row.y2 }}%
                      </td>
                      <td class="p-3 border-b-2 border-black font-mono font-black text-pink">
                        {{ row.y3 }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      <section class="brutal-pane bg-pink text-white mt-8 mb-4">
        <h4 class="font-bold mb-4 text-xl">⚠️ 数据服务说明</h4>
        <div class="disclosure-body font-bold text-sm leading-relaxed" style="opacity: 0.95">
          <p>
            1.
            <strong>数据来源</strong
            >：本工具所示利率为市场参考利率，基于近期各大银行公开挂牌利率及平均上浮高度聚合。
          </p>
          <p>
            2.
            <strong>实时性说明</strong
            >：当地柜面价格可能存在差异（部分网点有专项加点），本数据<strong>不保证</strong>与您所在地完全一致。<strong
              >最终成交利率请以银行 App 或柜面正式协议为准。</strong
            >
          </p>
          <p class="mb-0">
            3. <strong>LPR 说明</strong>：贷款市场报价利率（LPR）由中国人民银行计算发布，每月 20
            日更新。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const principal = ref(100000);
  const duration = ref('1y');
  const activeType = ref('regular');

  const currentDate = computed(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const banks = [
    {
      name: '工商银行',
      type: '国有',
      rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.8 }
    },
    {
      name: '建设银行',
      type: '国有',
      rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.8 }
    },
    {
      name: '中国银行',
      type: '国有',
      rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.8 }
    },
    {
      name: '邮储银行',
      type: '国有',
      rates: { '3m': 1.05, '6m': 1.25, '1y': 1.36, '2y': 1.45, '3y': 1.75, '5y': 1.8 }
    },
    {
      name: '招商银行',
      type: '股份制',
      rates: { '3m': 1.05, '6m': 1.25, '1y': 1.35, '2y': 1.45, '3y': 1.75, '5y': 1.8 }
    },
    {
      name: '中信银行',
      type: '股份制',
      rates: { '3m': 1.2, '6m': 1.4, '1y': 1.6, '2y': 1.75, '3y': 1.95, '5y': 2.05 }
    },
    {
      name: '民生银行',
      type: '股份制',
      rates: { '3m': 1.2, '6m': 1.4, '1y': 1.6, '2y': 1.75, '3y': 1.95, '5y': 2.05 }
    },
    {
      name: '泰隆银行',
      type: '城商行',
      rates: { '3m': 1.4, '6m': 1.65, '1y': 1.85, '2y': 2.15, '3y': 2.55, '5y': 2.55 }
    }
  ];

  const cdData = [
    { bank: '工商银行', limit: '20万', y1: 1.8, y2: 1.95, y3: 2.35 },
    { bank: '核心银行', limit: '20万', y1: 1.8, y2: 1.95, y3: 2.35 },
    { bank: '招商银行', limit: '20万', y1: 1.85, y2: 2.05, y3: 2.45 },
    { bank: '浙商银行', limit: '20万', y1: 1.95, y2: 2.25, y3: 2.65 },
    { bank: '江苏银行', limit: '20万', y1: 2.0, y2: 2.35, y3: 2.75 }
  ];

  const formatMoney = val =>
    val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const calcInterest = rate => {
    const yearsMap = { '3m': 0.25, '6m': 0.5, '1y': 1, '2y': 2, '3y': 3, '5y': 5 };
    const years = yearsMap[duration.value];
    return principal.value * (rate / 100) * years;
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

  .flex {
    display: flex;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-center {
    justify-content: center;
  }
  .items-start {
    align-items: flex-start;
  }
  .gap-2 {
    gap: 0.5rem;
  }
  .gap-4 {
    gap: 1rem;
  }
  .flex-col {
    display: flex;
    flex-direction: column;
  }
  .flex-1 {
    flex: 1;
    min-width: 0;
  }
  .h-full {
    height: 100%;
  }
  .w-full {
    width: 100%;
  }
  .min-w-\[120px\] {
    min-width: 120px;
  }
  .overflow-x-auto {
    overflow-x: auto;
  }

  .m-0 {
    margin: 0;
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
  .mt-2 {
    margin-top: 0.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
  .my-4 {
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  .my-6 {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .p-0 {
    padding: 0;
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
  .px-1 {
    padding-left: 0.25rem;
    padding-right: 0.25rem;
  }
  .px-2 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
  .pb-2 {
    padding-bottom: 0.5rem;
  }
  .pt-2 {
    padding-top: 0.5rem;
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
  .text-4xl {
    font-size: 2.25rem;
  }
  .leading-none {
    line-height: 1;
  }
  .leading-relaxed {
    line-height: 1.625;
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
  .italic {
    font-style: italic;
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

  .border-3 {
    border: 3px solid #111;
  }
  .border-2 {
    border: 2px solid #111;
  }
  .border-black {
    border-color: #111;
  }
  .border-white {
    border-color: #fff;
  }
  .border-b-3 {
    border-bottom: 3px solid #111;
  }
  .border-b-2 {
    border-bottom: 2px solid #111;
  }
  .border-r-2 {
    border-right: 2px solid #111;
  }
  .border-t-3 {
    border-top: 3px solid #111;
  }
  .border-dashed {
    border-style: dashed;
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
  .bg-gray-100 {
    background-color: #f3f4f6;
  }
  .bg-gray-200 {
    background-color: #e5e7eb;
  }

  .text-white {
    color: #fff;
  }
  .text-pink {
    color: #ff4b4b;
  }
  .opacity-75 {
    opacity: 0.75;
  }

  .brutal-shadow-sm {
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .brutal-shadow {
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }

  .tab-btn {
    background: transparent;
    border: 3px solid transparent;
    color: #999;
    font-size: 1.1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    cursor: pointer;
    padding: 10px;
    transition: all 0.2s;
  }
  .tab-btn:hover:not(.active) {
    color: #ccc;
  }
  .tab-btn.active {
    background: #ffd900;
    border-color: #111;
    color: #111;
    box-shadow: 2px 2px 0px #fff;
  }

  .bank-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.5rem;
  }

  .bank-card {
    transition: transform 0.1s;
  }
  .bank-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  @media (max-width: 768px) {
    .brutal-grid {
      grid-template-columns: 1fr;
    }
    .hidden-xs {
      display: none;
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
  [data-theme='dark'] .bg-gray-100 {
    background-color: #2a2a2a;
  }
  [data-theme='dark'] .bg-gray-200 {
    background-color: #444;
    color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background-color: #111;
    border-color: #444;
  }
  [data-theme='dark'] .text-pink {
    color: #ff6b6b;
  }
  [data-theme='dark'] .border-black,
  [data-theme='dark'] .border-2,
  [data-theme='dark'] .border-3,
  [data-theme='dark'] .border-b-2,
  [data-theme='dark'] .border-b-3,
  [data-theme='dark'] .border-r-2,
  [data-theme='dark'] .border-t-3 {
    border-color: #eee;
  }
  [data-theme='dark'] .border-white {
    border-color: #444;
  }
  [data-theme='dark'] .brutal-shadow,
  [data-theme='dark'] .brutal-shadow-sm {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .tab-btn.active {
    box-shadow: 2px 2px 0px #444;
  }
  [data-theme='dark'] .bank-card:hover {
    box-shadow: 6px 6px 0px #eee;
  }
</style>
