<template>
  <div class="tool-page">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">药物过敏原速查</h1>
        <span class="tool-subtitle">Medical Allergen Database</span>
      </div>
      <div class="header-right">
        <el-button type="warning" link @click="personalVisible = true">
          <el-icon><List /></el-icon> 我的敏感史
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="search-section glass-card mb-8">
        <el-input
          v-model="searchQuery"
          placeholder="搜索药物名称、成分或分类 (如：青霉素, 阿司匹林, 抗生素...)"
          prefix-icon="Search"
          size="large"
          clearable
        />
      </div>

      <div class="tool-layout">
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Filter /></el-icon> 类别筛选
            </h2>
            <div class="filter-list">
              <div
                v-for="cat in categories"
                :key="cat"
                class="filter-tag"
                :class="{ active: activeCategory === cat }"
                @click="activeCategory = cat"
              >
                {{ cat }}
              </div>
            </div>

            <div class="disclaimer mt-8">
              <p>
                <strong
                  ><el-icon><Warning /></el-icon> 声明：</strong
                >
              </p>
              <p>
                本工具数据仅供科普参考，不能代替执业医师的诊断。用药前请务必确认个人过敏史，并遵循医嘱。
              </p>
            </div>
          </div>
        </aside>

        <div class="tool-main">
          <div v-if="filteredData.length === 0" class="empty-state glass-card">
            <el-empty description="未找到相关药物信息，请尝试其他关键词" />
          </div>

          <div v-else class="allergen-grid">
            <div
              v-for="item in filteredData"
              :key="item.name"
              class="allergen-card glass-card animate-fade-in"
            >
              <div class="card-header">
                <div class="name-box">
                  <h3 class="allergen-name">{{ item.name }}</h3>
                  <span class="allergen-en">{{ item.en }}</span>
                </div>
                <el-tag :type="getRiskColor(item.risk)" size="small" effect="dark">
                  {{ item.risk }} 风险
                </el-tag>
              </div>

              <div class="card-body">
                <div class="info-group">
                  <span class="info-label">所属分类</span>
                  <span class="info-val">{{ item.category }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">可能交叉过敏</span>
                  <div class="cross-list">
                    <el-tag
                      v-for="cross in item.crossAllergens"
                      :key="cross"
                      size="small"
                      type="info"
                      round
                    >
                      {{ cross }}
                    </el-tag>
                  </div>
                </div>
                <div class="info-group">
                  <span class="info-label">典型症状</span>
                  <p class="symptoms">{{ item.symptoms }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <el-drawer v-model="personalVisible" title="我的药物敏感记录" direction="rtl" size="400px">
      <div class="personal-records">
        <div class="add-section">
          <el-input v-model="newRecord" placeholder="记录您过敏的药物名称" @keyup.enter="addRecord">
            <template #append>
              <el-button @click="addRecord">添加</el-button>
            </template>
          </el-input>
        </div>
        <ul class="record-list mt-6">
          <li v-for="(record, index) in myRecords" :key="index" class="record-item">
            <span>{{ record }}</span>
            <el-button type="danger" link @click="removeRecord(index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </li>
          <li v-if="myRecords.length === 0" class="empty-tip">暂无记录</li>
        </ul>
      </div>
    </el-drawer>

    <footer class="footer">© 2026 LRM工具箱 - 药物过敏原速查</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { ArrowLeft, Filter, Warning, List, Delete } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const searchQuery = ref('');
  const activeCategory = ref('全部');
  const personalVisible = ref(false);
  const newRecord = ref('');
  const myRecords = ref<string[]>([]);

  const categories = ['全部', '抗生素', '解热镇痛药', '局部麻醉药', '磺胺类', '血清及生物制品'];

  const allergenData = [
    {
      name: '青霉素',
      en: 'Penicillin',
      category: '抗生素',
      risk: '高',
      crossAllergens: ['头孢菌素', '阿莫西林'],
      symptoms: '皮疹、荨麻疹、呼吸困难、过敏性休克。'
    },
    {
      name: '阿司匹林',
      en: 'Aspirin',
      category: '解热镇痛药',
      risk: '中',
      crossAllergens: ['布洛芬', '对乙酰氨基酚', '非甾体抗炎药'],
      symptoms: '阿司匹林哮喘、血管性水肿、胃肠道反应。'
    },
    {
      name: '普鲁卡因',
      en: 'Procaine',
      category: '局部麻醉药',
      risk: '中',
      crossAllergens: ['利多卡因', '丁卡因'],
      symptoms: '过敏性皮炎、眼部黏膜充血、罕见性休克。'
    },
    {
      name: '磺胺嘧啶',
      en: 'Sulfadiazine',
      category: '磺胺类',
      risk: '中高',
      crossAllergens: ['磺胺甲恶唑', '部分利尿药'],
      symptoms: '固定型药疹、剥脱性皮炎、光敏反应。'
    },
    {
      name: '破伤风抗毒素',
      en: 'TAT',
      category: '血清及生物制品',
      risk: '极高',
      crossAllergens: ['白喉抗毒素', '动物血清制品'],
      symptoms: '血清病（发热、淋巴结肿大）、急性休克。'
    },
    {
      name: '链霉素',
      en: 'Streptomycin',
      category: '抗生素',
      risk: '中',
      crossAllergens: ['庆大霉素', '卡那霉素'],
      symptoms: '眩晕、肢体麻木、轻度皮疹。'
    }
  ];

  const filteredData = computed(() => {
    return allergenData.filter(item => {
      const matchSearch =
        item.name.includes(searchQuery.value) ||
        item.en.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        item.category.includes(searchQuery.value);
      const matchCategory =
        activeCategory.value === '全部' || item.category === activeCategory.value;
      return matchSearch && matchCategory;
    });
  });

  const getRiskColor = (risk: string) => {
    if (risk === '极高') return 'danger';
    if (risk.includes('高')) return 'danger';
    if (risk.includes('中')) return 'warning';
    return 'info';
  };

  const addRecord = () => {
    const val = newRecord.value.trim();
    if (!val) return;
    if (myRecords.value.includes(val)) {
      ElMessage.info('该药物已在清单中');
      return;
    }
    myRecords.value.push(val);
    saveRecords();
    newRecord.value = '';
    ElMessage.success('已添加至个人记录');
  };

  const removeRecord = (index: number) => {
    myRecords.value.splice(index, 1);
    saveRecords();
  };

  const saveRecords = () => {
    localStorage.setItem('lrm_personal_allergens', JSON.stringify(myRecords.value));
  };

  onMounted(() => {
    const saved = localStorage.getItem('lrm_personal_allergens');
    if (saved) {
      myRecords.value = JSON.parse(saved);
    }
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }

  .tool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }

  .header-left,
  .header-right {
    width: 140px;
  }
  .header-center {
    text-align: center;
    flex: 1;
  }
  .tool-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
  .tool-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
  }

  .tool-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .search-section {
    padding: 16px;
    border-radius: 20px;
  }
  .search-section :deep(.el-input__wrapper) {
    background: #f8fafc;
    border-radius: 12px;
    box-shadow: none !important;
    border: 1px solid #e2e8f0;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 900px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .panel {
    padding: 20px;
  }

  .panel-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-tag {
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #475569;
    transition: all 0.2s;
  }

  .filter-tag:hover {
    background: #f1f5f9;
  }
  .filter-tag.active {
    background: #3b82f6;
    color: #fff;
    font-weight: 600;
  }

  .disclaimer {
    padding: 12px;
    background: #fff1f2;
    border-radius: 12px;
    font-size: 0.75rem;
    color: #9d174d;
    line-height: 1.6;
  }

  .allergen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 1.5rem;
  }

  .allergen-card {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .allergen-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .allergen-name {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  .allergen-en {
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .card-body {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .info-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .info-label {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 600;
    text-transform: uppercase;
  }
  .info-val {
    font-size: 0.95rem;
    color: #334155;
  }

  .cross-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .symptoms {
    font-size: 0.9rem;
    color: #475569;
    line-height: 1.5;
    margin: 0;
  }

  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .record-list .empty-tip {
    text-align: center;
    color: #94a3b8;
    font-size: 0.9rem;
    padding: 40px 0;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }
  .mb-8 {
    margin-bottom: 2rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .mt-8 {
    margin-top: 2rem;
  }
</style>
