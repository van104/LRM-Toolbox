<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">健康<span>.药物过敏原速查()</span></h1>
        <button class="brutal-action-btn primary" @click="personalVisible = true">
          📝 我的敏感史
        </button>
      </header>

      <div class="search-section">
        <input
          v-model="searchQuery"
          class="brutal-input large-input"
          placeholder="🔍 搜索药物名称、成分或分类 (如：青霉素, 阿司匹林...)"
        />
      </div>

      <div class="brutal-grid-layout">
        <!-- Sidebar Filter -->
        <aside class="sidebar-pane">
          <div class="brutal-pane">
            <div class="pane-header bg-black"><span class="text-white">类别筛选</span></div>
            <div class="pane-body padding-small">
              <div class="filter-list">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  class="brutal-action-btn filter-btn"
                  :class="{ active: activeCategory === cat }"
                  @click="activeCategory = cat"
                >
                  {{ cat }}
                </button>
              </div>

              <div class="disclaimer-brutal mt-8">
                <strong>// ⚠️ 免责声明</strong>
                <p>
                  本工具数据仅供科普参考，不能代替执业医师的诊断。用药前请务必确认个人过敏史，并遵循医嘱。
                </p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content-pane">
          <!-- Empty State -->
          <div v-if="filteredData.length === 0" class="brutal-pane empty-pane">
            <div class="empty-content">
              <h3>[ 未找到相关药物信息 ]</h3>
              <p>请尝试其他关键词或拼写</p>
            </div>
          </div>

          <!-- Allergen Grid -->
          <div v-else class="allergen-grid">
            <div v-for="item in filteredData" :key="item.name" class="brutal-card">
              <div class="card-header" :class="getRiskClass(item.risk)">
                <div class="name-box">
                  <h3>{{ item.name }}</h3>
                  <span class="en-name">{{ item.en }}</span>
                </div>
                <div class="risk-badge">{{ item.risk }}风险</div>
              </div>
              <div class="card-body">
                <div class="info-group">
                  <span class="info-label">所属分类</span>
                  <span class="info-val">{{ item.category }}</span>
                </div>
                <div class="info-group">
                  <span class="info-label">可能交叉过敏</span>
                  <div class="cross-list">
                    <span v-for="cross in item.crossAllergens" :key="cross" class="cross-tag">
                      {{ cross }}
                    </span>
                  </div>
                </div>
                <div class="info-group">
                  <span class="info-label">典型症状</span>
                  <p class="symptoms">{{ item.symptoms }}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Personal Records Modal -->
    <div v-if="personalVisible" class="brutal-modal-overlay" @click.self="personalVisible = false">
      <div class="brutal-pane modal-pane">
        <div class="pane-header bg-yellow modal-header">
          <span>📝 我的药物敏感记录</span>
          <button class="close-btn" @click="personalVisible = false">✖</button>
        </div>
        <div class="pane-body">
          <div class="add-section">
            <input
              v-model="newRecord"
              class="brutal-input"
              placeholder="记录您过敏的药物名称"
              @keyup.enter="addRecord"
            />
            <button class="brutal-action-btn primary" @click="addRecord">添加</button>
          </div>

          <ul class="record-list">
            <li v-if="myRecords.length === 0" class="empty-record">暂无记录</li>
            <li v-for="(record, index) in myRecords" :key="index" class="record-item">
              <span>{{ record }}</span>
              <button class="brutal-action-btn del-btn danger" @click="removeRecord(index)">
                ✖
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
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

  const getRiskClass = (risk: string) => {
    if (risk.includes('高') || risk === '极高') return 'risk-high';
    if (risk.includes('中')) return 'risk-medium';
    return 'risk-low';
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
  const saveRecords = () =>
    localStorage.setItem('lrm_personal_allergens', JSON.stringify(myRecords.value));

  onMounted(() => {
    const saved = localStorage.getItem('lrm_personal_allergens');
    if (saved) myRecords.value = JSON.parse(saved);
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0 #4b7bff;
    flex: 1;
    text-align: center;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0 #111;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0 #111;
    transition: all 0.1s;
    text-transform: uppercase;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0 0 0 #111;
  }

  .brutal-action-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.6rem 1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 4px 4px 0 #111;
    transition:
      transform 0.1s,
      box-shadow 0.1s;
  }
  .brutal-action-btn:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-action-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .brutal-action-btn.primary {
    background: #ffd900;
  }
  .brutal-action-btn.danger {
    background: #ff4b4b;
    color: white;
  }

  .search-section {
    margin-bottom: 2rem;
  }
  .brutal-input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 3px solid #111;
    background: #fff;
    font-weight: bold;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', monospace;
  }
  .brutal-input.large-input {
    padding: 1rem 1.25rem;
    font-size: 1.1rem;
    border-width: 4px;
    box-shadow: 6px 6px 0 #111;
  }
  .brutal-input:focus {
    outline: none;
    box-shadow: 6px 6px 0 #4b7bff;
    border-color: #4b7bff;
  }

  .brutal-grid-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2.5rem;
  }

  .brutal-pane {
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0 #111;
    min-width: 0;
  }
  .pane-header {
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
  }
  .bg-black {
    background: #111;
    color: white;
  }
  .pane-body {
    padding: 1.5rem;
    flex: 1;
    overflow: hidden;
    box-sizing: border-box;
  }
  .padding-small {
    padding: 1rem;
  }

  .filter-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .filter-btn {
    text-align: left;
    padding: 0.75rem 1rem;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 3px 3px 0 #111;
    font-family: 'Noto Sans SC', sans-serif;
    font-weight: 700;
  }
  .filter-btn.active {
    background: #4b7bff;
    color: white;
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0 #111;
  }

  .disclaimer-brutal {
    border: 3px dashed #111;
    padding: 1rem;
    margin-top: 2rem;
    background: #fff8e0;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  .disclaimer-brutal strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #ff4b4b;
  }

  .allergen-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  .brutal-card {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
  }
  .brutal-card:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0 #111;
  }

  .card-header {
    padding: 1.25rem;
    border-bottom: 4px solid #111;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .card-header h3 {
    margin: 0;
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
  }
  .card-header .en-name {
    display: block;
    font-size: 0.85rem;
    color: #555;
    margin-top: 0.25rem;
  }

  .risk-badge {
    border: 3px solid #111;
    padding: 0.3rem 0.6rem;
    font-weight: 800;
    font-size: 0.85rem;
    background: #fff;
  }
  .risk-high {
    background: #ffe4e4;
  }
  .risk-high .risk-badge {
    background: #ff4b4b;
    color: white;
  }
  .risk-medium {
    background: #fffbe4;
  }
  .risk-medium .risk-badge {
    background: #ffd900;
  }
  .risk-low .risk-badge {
    background: #eee;
  }

  .card-body {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }
  .info-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .info-label {
    font-size: 0.8rem;
    font-weight: 800;
    color: #555;
    text-transform: uppercase;
  }
  .info-val {
    font-size: 1rem;
    font-weight: bold;
  }

  .cross-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .cross-tag {
    border: 2px solid #111;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    background: #fdfae5;
  }

  .symptoms {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .empty-pane {
    background: #fafafa;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .empty-content h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  /* Modal styling */
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  .modal-pane {
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 16px 16px 0 #111;
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffd900;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    color: #111;
  }
  .add-section {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }
  .record-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 3px solid #111;
    background: #fdfae5;
    font-weight: bold;
  }
  .del-btn {
    padding: 0.4rem 0.6rem;
  }
  .empty-record {
    text-align: center;
    padding: 2rem;
    font-weight: bold;
    border: 3px dashed #111;
    color: #666;
  }

  @media (max-width: 900px) {
    .brutal-grid-layout {
      grid-template-columns: 1fr;
    }
    .brutal-title {
      font-size: 2.5rem;
    }
  }

  /* Dark Mode Placeholder / Setup */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-card,
  [data-theme='dark'] .cross-tag,
  [data-theme='dark'] .risk-badge,
  [data-theme='dark'] .record-item {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .modal-pane {
    box-shadow: 12px 12px 0 #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .brutal-input.large-input {
    box-shadow: 4px 4px 0 #eee;
  }
  [data-theme='dark'] .brutal-action-btn:hover {
    box-shadow: 6px 6px 0 #eee;
  }
  [data-theme='dark'] .filter-btn {
    box-shadow: 3px 3px 0 #eee;
  }
  [data-theme='dark'] .filter-btn.active {
    box-shadow: 5px 5px 0 #eee;
    background: #2a4eb2;
    border-color: #eee;
  }
  [data-theme='dark'] .bg-black {
    background: #222;
  }
  [data-theme='dark'] .bg-yellow,
  [data-theme='dark'] .brutal-action-btn.primary,
  [data-theme='dark'] .modal-header {
    background: #b28f00;
    color: #fff;
    border-color: #eee;
  }
  [data-theme='dark'] .brutal-action-btn.danger {
    background: #8b0000;
    border-color: #eee;
  }
  [data-theme='dark'] .pane-body {
    background: #1a1a1a;
  }
  [data-theme='dark'] .brutal-card:hover {
    box-shadow: 9px 9px 0 #eee;
  }
  [data-theme='dark'] .card-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .risk-high {
    background: #3a1a1a;
  }
  [data-theme='dark'] .risk-high .risk-badge {
    background: #8b0000;
  }
  [data-theme='dark'] .risk-medium {
    background: #3a301a;
  }
  [data-theme='dark'] .risk-medium .risk-badge {
    background: #b28f00;
  }
  [data-theme='dark'] .risk-low .risk-badge {
    background: #333;
  }
  [data-theme='dark'] .disclaimer-brutal {
    background: #3a2a00;
    border-color: #eee;
  }
  [data-theme='dark'] .empty-pane {
    background: #222;
  }
  [data-theme='dark'] .close-btn {
    color: #fff;
  }
  [data-theme='dark'] .empty-record {
    border-color: #eee;
    color: #aaa;
  }
</style>
