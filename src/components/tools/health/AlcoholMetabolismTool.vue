<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>酒精代谢时间估算</h1>
        <span class="nav-subtitle">Alcohol Metabolism Calculator</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <el-form label-position="top">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="体重 (kg)">
                <el-input-number v-model="weight" :min="40" :max="150" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别">
                <el-select v-model="gender" style="width: 100%">
                  <el-option label="男" value="male" />
                  <el-option label="女" value="female" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider border-style="dashed">饮酒详情</el-divider>

          <el-row v-for="(drink, index) in drinks" :key="index" :gutter="20" class="drink-row">
            <el-col :span="10">
              <el-form-item label="酒类/度数">
                <el-select v-model="drink.abv" placeholder="选择或输入">
                  <el-option label="啤酒 (3-5%)" :value="4" />
                  <el-option label="红酒 (12-15%)" :value="13" />
                  <el-option label="黄酒 (15-20%)" :value="18" />
                  <el-option label="清酒 (15%)" :value="15" />
                  <el-option label="白酒 (38%)" :value="38" />
                  <el-option label="白酒 (52%)" :value="52" />
                  <el-option label="威士忌/伏特加 (40%)" :value="40" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="饮用量 (ml)">
                <el-input-number v-model="drink.amount" :min="0" :step="50" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="4" class="del-col">
              <el-button
                v-if="drinks.length > 1"
                type="danger"
                :icon="Delete"
                circle
                @click="removeDrink(index)"
              />
            </el-col>
          </el-row>

          <div class="add-btn-row">
            <el-button type="primary" link :icon="Plus" @click="addDrink">添加一种酒</el-button>
          </div>

          <div class="result-section">
            <div class="result-box">
              <span class="label">预计代谢时长</span>
              <span class="value">{{ result.hours }} <small>小时</small></span>
              <span class="sub-value">{{ result.minutes }} <small>分</small></span>
            </div>

            <div class="bac-info">
              <p>
                估算体内酒精含量 (BAC): <strong>{{ result.bac.toFixed(2) }} mg/100ml</strong>
              </p>
              <p v-if="result.bac > 20" class="warning">
                <el-icon><Warning /></el-icon>
                超过酒驾标准 (20mg/100ml)
              </p>
              <p v-if="result.bac > 80" class="danger">
                <el-icon><WarnTriangleFilled /></el-icon>
                超过醉驾标准 (80mg/100ml)
              </p>
            </div>
          </div>
        </el-form>

        <div class="disclaimer">
          <el-icon class="icon"><InfoFilled /></el-icon>
          <div class="text">
            <h4>免责声明</h4>
            <p>
              计算结果仅供参考！酒精代谢受个人体质（如乙醛脱氢酶活性）、进食情况、睡眠、药物等多种因素影响，实际值可能有较大偏差。
            </p>
            <p>
              <strong
                >严禁酒后驾车，无论计算结果如何，请确保神志清醒并符合法律法规。建议饮酒后 24
                小时内不要驾驶。</strong
              >
            </p>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 安全出行</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import {
    Back,
    Delete,
    Plus,
    Warning,
    InfoFilled,
    WarnTriangleFilled
  } from '@element-plus/icons-vue';

  const weight = ref(70);
  const gender = ref('male');

  interface Drink {
    abv: number;
    amount: number;
  }

  const drinks = reactive<Drink[]>([{ abv: 4, amount: 330 }]);

  const addDrink = () => {
    drinks.push({ abv: 4, amount: 330 });
  };

  const removeDrink = (index: number) => {
    drinks.splice(index, 1);
  };

  const result = computed(() => {
    // Widmark formula approximation
    // Alcohol mass (g) = Volume (ml) * ABV% * 0.8 (density)
    let totalAlcoholMass = 0;
    drinks.forEach(d => {
      totalAlcoholMass += d.amount * (d.abv / 100) * 0.8;
    });

    // Body water constant (r): Male 0.68, Female 0.55
    const r = gender.value === 'male' ? 0.68 : 0.55;

    // BAC (g/L) = Alcohol (g) / (Weight (kg) * r)
    // Convert g/L (permille) to mg/100ml: 1 g/L = 100 mg/100ml (approx blood density ~ water)
    // Actually standard formula: BAC = [Alcohol(g) / (Body Weight(g) * r)] * 100
    // Simplified for mg/100ml (China standard):
    // BAC (mg/100ml) = (Alcohol g / (Weight kg * r)) * 100

    let bac = (totalAlcoholMass / (weight.value * r)) * 100;

    if (bac < 0) bac = 0;

    // Metabolism rate: Average 10-15 mg/100ml per hour
    // Let's use conservative 10 mg/100ml/h to be safe, or 15.
    // Using 15 is standard average, but for safety maybe 10?
    // Let's use 15 for calculation but show warning.
    const clearanceRate = 15;

    const hoursTotal = bac / clearanceRate;
    const hours = Math.floor(hoursTotal);
    const minutes = Math.round((hoursTotal - hours) * 60);

    return {
      hours,
      minutes,
      bac
    };
  });
</script>

<style scoped>
  .tool-container {
    min-height: 100vh;
    background: #f1f5f9;
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
  }

  .drink-row {
    margin-bottom: 1rem;
    align-items: flex-end;
  }

  .del-col {
    padding-bottom: 5px;
    display: flex;
    justify-content: center;
  }

  .add-btn-row {
    text-align: center;
    margin: 1rem 0 2rem;
  }

  .result-section {
    text-align: center;
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .result-box {
    margin-bottom: 1.5rem;
  }

  .result-box .label {
    display: block;
    font-size: 0.9rem;
    color: #64748b;
    margin-bottom: 0.5rem;
  }

  .result-box .value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #3b82f6;
  }

  .result-box .sub-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #64748b;
    margin-left: 0.5rem;
  }

  .bac-info {
    font-size: 0.9rem;
    color: #475569;
  }

  .warning {
    color: #f59e0b;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .danger {
    color: #ef4444;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .disclaimer {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    color: #9f1239;
    margin-top: 2rem;
  }

  .disclaimer .icon {
    font-size: 1.5rem;
    margin-top: 2px;
  }

  .disclaimer h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.95rem;
  }

  .disclaimer p {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .disclaimer p + p {
    margin-top: 0.5rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>
