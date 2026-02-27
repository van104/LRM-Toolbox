<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="80%"
    class="building-modal"
    @closed="$emit('update:visible', false)"
  >
    <!-- Bank -->
    <div v-if="type === 'bank'" class="bank-ui">
      <div class="balance-card">
        <div>现金: ￥{{ wealth.toLocaleString() }}</div>
        <div>存款: ￥{{ savings.toLocaleString() }}</div>
      </div>
      <div class="bank-actions">
        <h4>存取款</h4>
        <el-input-number v-model="amount" :step="1000" />
        <div class="btn-group">
          <el-button type="primary" @click="$emit('bank-deposit', amount)">
            存入 (年利{{ (interestRate * 100).toFixed(1) }}%)
          </el-button>
          <el-button type="warning" @click="$emit('bank-withdraw', amount)">取出</el-button>
        </div>
      </div>
    </div>

    <!-- Housing -->
    <div v-if="type === 'housing'" class="shop-grid">
      <div v-for="house in housingData" :key="house.id" class="shop-item card">
        <img :src="house.image" class="shop-img" />
        <h4>{{ house.name }}</h4>
        <p class="desc">{{ house.desc }}</p>
        <div class="price">
          <span v-if="house.rent > 0">租金: ￥{{ house.rent }}/月</span>
          <span v-else>售价: ￥{{ (house.price / 10000).toFixed(0) }}万</span>
        </div>
        <el-button
          v-if="house.type === 'buy'"
          type="primary"
          :disabled="wealth < house.price || hasHouse(house.id)"
          @click="$emit('buy-house', house)"
        >
          {{ hasHouse(house.id) ? '已拥有' : '购买' }}
        </el-button>
        <el-button v-else type="success" @click="$emit('rent-house', house)"> 租住 </el-button>
      </div>
    </div>

    <!-- Vehicles -->
    <div v-if="type === 'vehicles'" class="shop-grid">
      <div v-for="car in vehicleData" :key="car.id" class="shop-item card">
        <img :src="car.image" class="shop-img" />
        <h4>{{ car.name }}</h4>
        <p class="desc">{{ car.desc }}</p>
        <div class="price">￥{{ (car.price / 10000).toFixed(1) }}万</div>
        <el-button
          type="primary"
          :disabled="wealth < car.price || hasCar(car.id)"
          @click="$emit('buy-car', car)"
        >
          {{ hasCar(car.id) ? '已拥有' : '购买' }}
        </el-button>
      </div>
    </div>

    <!-- School -->
    <div v-if="type === 'school'" class="school-list">
      <div
        v-for="edu in educationData.levels"
        :key="edu.id"
        class="edu-item card"
        :class="{ completed: hasDegree(edu.id) }"
      >
        <h4>{{ edu.name }}</h4>
        <p v-if="edu.cost">学费: ￥{{ edu.cost }}/年</p>
        <p v-else>义务教育 (免费)</p>
        <div class="reqs-list">
          <span v-if="edu.req">智力 > {{ edu.req.smarts }}</span>
        </div>
        <el-button v-if="!hasDegree(edu.id)" type="primary" @click="$emit('enroll', edu)">
          入学
        </el-button>
        <el-tag v-else type="success">已毕业</el-tag>
      </div>
    </div>

    <!-- Hospital -->
    <div v-if="type === 'hospital'" class="action-list">
      <div class="action-item">
        <span>普通门诊 (￥200)</span>
        <el-button @click="$emit('visit-doctor', 'normal')">挂号</el-button>
      </div>
      <div class="action-item">
        <span>专家会诊 (￥2000)</span>
        <el-button @click="$emit('visit-doctor', 'expert')">挂号</el-button>
      </div>
      <div class="action-item">
        <span>医疗美容 (￥20000)</span>
        <el-button @click="$emit('plastic-surgery')">整容</el-button>
      </div>
    </div>

    <!-- Company -->
    <div v-if="type === 'company'" class="company-panel">
      <div v-if="currentJob">
        <h3>当前职位: {{ currentJob.name }}</h3>
        <p>月薪: ￥{{ currentJob.salary }}</p>
        <el-button type="danger" @click="$emit('quit-job')">辞职</el-button>
      </div>
      <div v-else>
        <h3>人才市场</h3>
        <div class="job-list">
          <div v-for="job in availableJobs" :key="job.id" class="job-item">
            <div>
              <strong>{{ job.name }}</strong>
              <div class="salary">￥{{ job.salary }}/月</div>
            </div>
            <el-button size="small" type="primary" @click="$emit('apply-job', job)">
              应聘
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { House, Vehicle, Career, EducationLevel } from '@/data/life_simulator/types';

  const props = defineProps<{
    visible: boolean;
    type: string;
    wealth: number;
    savings: number;
    interestRate: number;
    housingData: House[];
    vehicleData: Vehicle[];
    educationData: { levels: EducationLevel[] };
    availableJobs: Career[];
    currentJob: Career | null;
    hasHouse: (id: string) => boolean;
    hasCar: (id: string) => boolean;
    hasDegree: (id: string) => boolean;
  }>();

  const emit = defineEmits([
    'update:visible',
    'bank-deposit',
    'bank-withdraw',
    'buy-house',
    'rent-house',
    'buy-car',
    'enroll',
    'visit-doctor',
    'plastic-surgery',
    'apply-job',
    'quit-job'
  ]);

  const amount = ref(1000);

  const title = computed(() => {
    const map: Record<string, string> = {
      bank: '中央银行',
      housing: '置业中心',
      vehicles: '豪车汇',
      school: '教育学院',
      hospital: '仁爱医院',
      company: 'CBD商务中心'
    };
    return map[props.type] || '建筑';
  });

  const visible = computed({
    get: () => props.visible,
    set: val => emit('update:visible', val)
  });
</script>

<style scoped>
  .balance-card {
    background: #fdf6ec;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-around;
    font-weight: bold;
    color: #e6a23c;
  }
  .bank-actions {
    text-align: center;
  }
  .btn-group {
    margin-top: 1.5rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  .shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  .shop-item {
    padding: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
    text-align: center;
  }
  .shop-img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  .edu-item {
    margin-bottom: 1rem;
    padding: 1.5rem;
    border: 1px solid #eee;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .action-item {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .job-item {
    padding: 1rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
