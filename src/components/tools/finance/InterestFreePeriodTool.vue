<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>信用卡免息期计算器</h1>
        <span class="nav-subtitle">Interest-Free Period Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <el-form label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="账单日 (Billing Day)">
                <el-select v-model="billingDay" placeholder="选择日期">
                  <el-option v-for="d in 31" :key="d" :label="d + '号'" :value="d" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="还款日 (Repayment Day)">
                <el-row :gutter="10">
                  <el-col :span="10">
                    <el-select v-model="repaymentType" @change="recalculate">
                      <el-option label="固定日期" value="fixed" />
                      <el-option label="账单后N天" value="interval" />
                    </el-select>
                  </el-col>
                  <el-col :span="14">
                    <el-select
                      v-if="repaymentType === 'fixed'"
                      v-model="repaymentDay"
                      placeholder="还款日"
                    >
                      <el-option v-for="d in 31" :key="d" :label="d + '号'" :value="d" />
                    </el-select>
                    <el-input-number
                      v-else
                      v-model="repaymentInterval"
                      :min="1"
                      :max="60"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="消费/刷卡日期">
            <el-date-picker
              v-model="transactionDate"
              type="date"
              placeholder="选择消费日期"
              style="width: 100%"
              :clearable="false"
            />
          </el-form-item>

          <div class="result-section">
            <div class="result-card main-result">
              <h3>免息期</h3>
              <div class="value">{{ result.days }} <small>天</small></div>
              <p v-if="result.days > 50" class="desc">超长免息期！划算！</p>
              <p v-else-if="result.days < 20" class="desc">免息期较短，注意还款！</p>
            </div>

            <div class="result-details">
              <div class="detail-item">
                <span class="label">本期账单日</span>
                <span class="val">{{ result.billingDate }}</span>
              </div>
              <div class="detail-item">
                <span class="label">最后还款日</span>
                <span class="val highlight">{{ result.repaymentDate }}</span>
              </div>
            </div>
          </div>
        </el-form>

        <div class="tips-card">
          <h4>💡 使用技巧</h4>
          <p>
            在<strong>账单日次日</strong>消费，通常能获得最长的免息期（最长可达 50-56 天）。
            <br />
            在<strong>账单日前一天</strong>消费，免息期最短（可能只有 20 天左右）。
          </p>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 金融理财系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';
  import dayjs from 'dayjs';

  const billingDay = ref(1);
  const repaymentType = ref<'fixed' | 'interval'>('interval');
  const repaymentDay = ref(20);
  const repaymentInterval = ref(20);
  const transactionDate = ref(new Date());

  const recalculate = () => {
    // Triggered by type change, logic handled in computed
  };

  const result = computed(() => {
    if (!transactionDate.value) return { days: 0, billingDate: '-', repaymentDate: '-' };

    const trans = dayjs(transactionDate.value);
    const bDay = billingDay.value;

    // Calculate Billing Date for this transaction
    // If transaction day <= billing day, it belongs to the current month's bill (if bill hasn't passed?)
    // Actually banks logic:
    // Cycle runs from (Previous Billing Day + 1) to (Current Billing Day).
    // E.g. Billing Day 5th.
    // Cycle: Jan 6 to Feb 5. Bill date Feb 5.
    // If I buy on Feb 4, bill date is Feb 5.
    // If I buy on Feb 5, bill date is Feb 5.
    // If I buy on Feb 6, bill date is Mar 5.

    let billDate = trans.date(bDay);

    // If transaction date is after billing day, it goes to NEXT month's bill
    if (trans.date() > bDay) {
      billDate = billDate.add(1, 'month');
    }

    // Handle edge cases for dates (e.g. billing day 31st in Feb)
    // Dayjs handles this by auto-correcting to end of month usually.

    let repayDate;
    if (repaymentType.value === 'interval') {
      repayDate = billDate.add(repaymentInterval.value, 'day');
    } else {
      // Fixed day
      const rDay = repaymentDay.value;
      repayDate = billDate.date(rDay);
      // If repayment day is smaller than billing day, it usually means next month
      // E.g. Bill 25th, Repay 15th. Bill Jan 25 -> Repay Feb 15.
      if (rDay <= bDay) {
        // or generally if repay date comes up as before bill date
        repayDate = repayDate.add(1, 'month');
      }
      // Also check if repay date ends up before bill date even after adjustment logic?
      if (repayDate.isBefore(billDate)) {
        repayDate = repayDate.add(1, 'month');
      }
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
  .tool-container {
    min-height: 100vh;
    background: #f8fafc;
    font-family: 'Inter', system-ui, sans-serif;
    color: #334155;
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
    color: #64748b;
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
  }

  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }

  .nav-spacer {
    width: 80px;
  }

  .main-content {
    max-width: 600px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .glass-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
  }

  .result-section {
    background: #f0f9ff;
    border-radius: 12px;
    padding: 1.5rem;
    margin-top: 2rem;
    border: 1px solid #bae6fd;
  }

  .main-result {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .main-result h3 {
    margin: 0;
    color: #0369a1;
    font-size: 1rem;
  }

  .main-result .value {
    font-size: 3.5rem;
    font-weight: 800;
    color: #0284c7;
    line-height: 1.2;
  }

  .main-result .value small {
    font-size: 1.2rem;
    font-weight: 600;
  }

  .main-result .desc {
    margin: 0;
    color: #0ea5e9;
    font-weight: 500;
  }

  .result-details {
    display: flex;
    justify-content: space-between;
    border-top: 1px dashed #bae6fd;
    padding-top: 1rem;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-item .label {
    font-size: 0.85rem;
    color: #64748b;
  }

  .detail-item .val {
    font-weight: 600;
    color: #334155;
    font-size: 1.1rem;
  }

  .detail-item .val.highlight {
    color: #ea580c;
  }

  .tips-card {
    margin-top: 2rem;
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.6;
    background: #f8fafc;
    padding: 1rem;
    border-radius: 8px;
  }

  .tips-card h4 {
    margin: 0 0 0.5rem 0;
    color: #475569;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
