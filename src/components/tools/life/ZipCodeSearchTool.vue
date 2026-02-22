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
        <h1 class="tool-title">邮编区号查询</h1>
        <span class="tool-subtitle">Zip Code Search</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="zip-tool">
        <div class="search-section glass">
          <div class="search-box">
            <el-input
              v-model="keyword"
              placeholder="输入城市名、区号或邮编..."
              size="large"
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>
          <div class="search-tip">支持模糊搜索，例如输入 "北京"、"010" 或 "100000"</div>
        </div>

        <div v-if="results.length > 0" class="results-section glass">
          <el-table :data="results" style="width: 100%" stripe>
            <el-table-column prop="province" label="省份" width="120" />
            <el-table-column prop="city" label="城市" width="120" />
            <el-table-column prop="district" label="区县" />
            <el-table-column prop="zip" label="邮政编码" width="120">
              <template #default="{ row }">
                <span class="code-text">{{ row.zip }}</span>
                <el-button link size="small" @click="copy(row.zip)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </template>
            </el-table-column>
            <el-table-column prop="areaCode" label="电话区号" width="120">
              <template #default="{ row }">
                <span class="code-text">{{ row.areaCode }}</span>
                <el-button link size="small" @click="copy(row.areaCode)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else-if="keyword" class="empty-state">
          <el-empty description="未找到相关信息" />
        </div>

        <div v-else class="hot-cities glass">
          <h3>热门城市</h3>
          <div class="city-tags">
            <el-tag
              v-for="city in hotCities"
              :key="city"
              effect="plain"
              round
              class="city-tag"
              @click="
                keyword = city;
                handleSearch();
              "
            >
              {{ city }}
            </el-tag>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 邮编区号查询</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { ArrowLeft, Search, CopyDocument } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  interface RegionData {
    province: string;
    city: string;
    district: string;
    zip: string;
    areaCode: string;
  }

  const keyword = ref('');
  const results = ref<RegionData[]>([]);

  const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安'];

  // Mock Data (Real data would be huge, so we use a small subset for demo)
  const mockData: RegionData[] = [
    { province: '北京市', city: '北京市', district: '东城区', zip: '100010', areaCode: '010' },
    { province: '北京市', city: '北京市', district: '西城区', zip: '100032', areaCode: '010' },
    { province: '北京市', city: '北京市', district: '朝阳区', zip: '100020', areaCode: '010' },
    { province: '北京市', city: '北京市', district: '海淀区', zip: '100080', areaCode: '010' },
    { province: '上海市', city: '上海市', district: '黄浦区', zip: '200001', areaCode: '021' },
    { province: '上海市', city: '上海市', district: '徐汇区', zip: '200030', areaCode: '021' },
    { province: '广东省', city: '广州市', district: '越秀区', zip: '510030', areaCode: '020' },
    { province: '广东省', city: '深圳市', district: '福田区', zip: '518000', areaCode: '0755' },
    { province: '广东省', city: '深圳市', district: '南山区', zip: '518000', areaCode: '0755' },
    { province: '浙江省', city: '杭州市', district: '西湖区', zip: '310000', areaCode: '0571' },
    { province: '四川省', city: '成都市', district: '锦江区', zip: '610000', areaCode: '028' },
    { province: '湖北省', city: '武汉市', district: '江汉区', zip: '430000', areaCode: '027' },
    { province: '江苏省', city: '南京市', district: '玄武区', zip: '210000', areaCode: '025' },
    { province: '陕西省', city: '西安市', district: '雁塔区', zip: '710000', areaCode: '029' }
  ];

  const handleSearch = () => {
    if (!keyword.value) {
      results.value = [];
      return;
    }
    const k = keyword.value.trim();
    results.value = mockData.filter(
      item =>
        item.city.includes(k) ||
        item.province.includes(k) ||
        item.district.includes(k) ||
        item.zip.includes(k) ||
        item.areaCode.includes(k)
    );
  };

  const copy = (text: string) => {
    copyToClipboard(text);
  };
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f1f5f9;
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
    position: sticky;
    top: 0;
    z-index: 100;
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
    padding: 1.5rem;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .zip-tool {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .search-section {
    padding: 30px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    text-align: center;
  }

  .search-box {
    max-width: 500px;
    margin: 0 auto;
  }

  .search-tip {
    margin-top: 10px;
    font-size: 0.85rem;
    color: #909399;
  }

  .results-section {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .code-text {
    font-family: monospace;
    font-weight: 600;
    color: #2c3e50;
    margin-right: 5px;
  }

  .hot-cities {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .hot-cities h3 {
    margin: 0 0 15px;
    font-size: 1rem;
    color: #606266;
  }

  .city-tags {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .city-tag {
    cursor: pointer;
    transition: all 0.2s;
  }

  .city-tag:hover {
    transform: scale(1.05);
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
