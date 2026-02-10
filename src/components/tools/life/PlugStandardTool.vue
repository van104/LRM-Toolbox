<template>
  <div class="plug-standard-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>各国插座查询</h1>
        <span class="nav-subtitle">Plug & Socket Standard</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="tool-card glass-card">
        <div class="search-section">
          <div class="input-wrapper">
            <el-icon class="search-icon">
              <Search />
            </el-icon>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索国家或地区 (如：日本、英国、USA)"
              class="search-input"
            />
          </div>
        </div>

        <div class="results-container">
          <div v-if="filteredCountries.length > 0" class="country-grid">
            <div v-for="country in filteredCountries" :key="country.name" class="country-card">
              <div class="card-header">
                <span class="flag">{{ country.flag }}</span>
                <span class="country-name">{{ country.name }}</span>
              </div>

              <div class="info-row">
                <div class="info-item">
                  <span class="label">电压</span>
                  <span class="val">{{ country.voltage }}</span>
                </div>
                <div class="info-item">
                  <span class="label">频率</span>
                  <span class="val">{{ country.frequency }}</span>
                </div>
              </div>

              <div class="plug-types">
                <span class="label">插座类型:</span>
                <div class="types-list">
                  <div
                    v-for="type in country.plugs"
                    :key="type"
                    class="plug-badge"
                    @mouseenter="hoverType = type"
                    @mouseleave="hoverType = null"
                  >
                    {{ type }}型
                  </div>
                </div>
              </div>

              <div class="plug-visual">
                <div class="visual-socket" :class="'type-' + country.plugs[0].toLowerCase()">
                  <div class="socket-face"></div>
                </div>
                <span class="visual-label">主要接口示意</span>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <p>未找到相关国家或地区</p>
          </div>
        </div>
      </div>

      <div class="reference-card glass-card">
        <h3>常见插座类型图鉴</h3>
        <div class="type-gallery">
          <div v-for="(desc, type) in plugDescriptions" :key="type" class="gallery-item">
            <div class="visual-socket small" :class="'type-' + type.toLowerCase()">
              <div class="socket-face"></div>
            </div>
            <div class="gallery-info">
              <strong>{{ type }}型</strong>
              <p>{{ desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="tips-card">
        <el-icon>
          <InfoFilled />
        </el-icon>
        <div class="tip-content">
          <p>
            以上数据基于IEC（国际电工委员会）通用标准整理。部分国家可能存在多标准并存的情况（如已有老式插座）。此工具仅供参考，出行前建议通过官方渠道或酒店方确认。
          </p>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 各国插座标准查询器</footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { Back, Search, InfoFilled } from '@element-plus/icons-vue';

  const searchQuery = ref('');

  const plugDescriptions = {
    A: '双扁头 (无接地)，中美日常用',
    B: '双扁一圆 (有接地)，美加常用',
    C: '双圆头 (欧标)，欧洲常用',
    G: '三方头 (英标)，英港新马常用',
    I: '三扁头 (澳标/国标)，中澳新常用',
    F: '德标 (双圆+侧面接地)，德韩常用'
  };

  const countries = [
    { name: '中国', flag: '🇨🇳', voltage: '220V', frequency: '50Hz', plugs: ['I', 'A'] },
    { name: '中国香港', flag: '🇭🇰', voltage: '220V', frequency: '50Hz', plugs: ['G'] },
    { name: '中国台湾', flag: '🇹🇼', voltage: '110V', frequency: '60Hz', plugs: ['A', 'B'] },
    { name: '美国', flag: '🇺🇸', voltage: '120V', frequency: '60Hz', plugs: ['A', 'B'] },
    { name: '日本', flag: '🇯🇵', voltage: '100V', frequency: '50/60Hz', plugs: ['A', 'B'] },
    { name: '韩国', flag: '🇰🇷', voltage: '220V', frequency: '60Hz', plugs: ['C', 'F'] },
    { name: '英国', flag: '🇬🇧', voltage: '230V', frequency: '50Hz', plugs: ['G'] },
    { name: '法国', flag: '🇫🇷', voltage: '230V', frequency: '50Hz', plugs: ['C', 'E'] },
    { name: '德国', flag: '🇩🇪', voltage: '230V', frequency: '50Hz', plugs: ['C', 'F'] },
    { name: '澳大利亚', flag: '🇦🇺', voltage: '230V', frequency: '50Hz', plugs: ['I'] },
    { name: '泰国', flag: '🇹🇭', voltage: '220V', frequency: '50Hz', plugs: ['A', 'B', 'C'] },
    { name: '新加坡', flag: '🇸🇬', voltage: '230V', frequency: '50Hz', plugs: ['G'] },
    { name: '马来西亚', flag: '🇲🇾', voltage: '240V', frequency: '50Hz', plugs: ['G'] },
    { name: '加拿大', flag: '🇨🇦', voltage: '120V', frequency: '60Hz', plugs: ['A', 'B'] },
    { name: '意大利', flag: '🇮🇹', voltage: '230V', frequency: '50Hz', plugs: ['C', 'F', 'L'] },
    { name: '俄罗斯', flag: '🇷🇺', voltage: '220V', frequency: '50Hz', plugs: ['C', 'F'] },
    { name: '印度', flag: '🇮🇳', voltage: '230V', frequency: '50Hz', plugs: ['C', 'D', 'M'] },
    { name: '新西兰', flag: '🇳🇿', voltage: '230V', frequency: '50Hz', plugs: ['I'] }
  ];

  const filteredCountries = computed(() => {
    if (!searchQuery.value) return countries;
    const q = searchQuery.value.toLowerCase();
    return countries.filter(
      c => c.name.toLowerCase().includes(q) || c.plugs.some(p => p.toLowerCase() === q)
    );
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600&display=swap');

  .plug-standard-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --accent: #2563eb;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
    text-align: center;
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    color: var(--text-2);
    font-size: 1.2rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 1rem;
    outline: none;
    background: #fdfdfd;
    transition: all 0.2s;
  }

  .search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }

  .country-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .country-card {
    background: #f9fafb;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    transition: transform 0.2s;
    position: relative;
    overflow: hidden;
  }

  .country-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .flag {
    font-size: 1.8rem;
  }

  .country-name {
    font-size: 1.1rem;
    font-weight: 600;
    font-family: 'Noto Serif SC', serif;
  }

  .info-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
  }

  .info-item .label {
    color: var(--text-2);
    font-size: 0.8rem;
  }

  .info-item .val {
    font-weight: 600;
  }

  .plug-types {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .types-list {
    display: flex;
    gap: 0.25rem;
  }

  .plug-badge {
    background: white;
    border: 1px solid var(--border);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    cursor: default;
  }

  .plug-visual {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-top: 0.5rem;
    border-top: 1px dashed var(--border);
  }

  .visual-label {
    font-size: 0.75rem;
    color: var(--text-2);
  }

  .visual-socket {
    width: 48px;
    height: 48px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 50%;

    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .visual-socket.type-a .socket-face::before,
  .visual-socket.type-a .socket-face::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 14px;
    background: #374151;
    top: 50%;
    transform: translateY(-50%);
  }

  .visual-socket.type-a .socket-face::before {
    left: 14px;
  }

  .visual-socket.type-a .socket-face::after {
    right: 14px;
  }

  .visual-socket.type-b .socket-face::before,
  .visual-socket.type-b .socket-face::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 14px;
    background: #374151;
    top: 40%;
    transform: translateY(-50%);
  }

  .visual-socket.type-b .socket-face::before {
    left: 14px;
  }

  .visual-socket.type-b .socket-face::after {
    right: 14px;
  }

  .visual-socket.type-b .socket-face {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .visual-socket.type-b .socket-face::after {
    content: '';
    display: none;
  }

  .visual-socket.type-b::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #374151;
    border-radius: 50%;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }

  .visual-socket.type-c .socket-face::before,
  .visual-socket.type-c .socket-face::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #374151;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
  }

  .visual-socket.type-c .socket-face::before {
    left: 10px;
  }

  .visual-socket.type-c .socket-face::after {
    right: 10px;
  }

  .visual-socket.type-c {
    border-radius: 40%;
  }

  .visual-socket.type-g {
    border-radius: 6px;
  }

  .visual-socket.type-g .socket-face::before,
  .visual-socket.type-g .socket-face::after,
  .visual-socket.type-g::before {
    content: '';
    position: absolute;
    background: #374151;
  }

  .visual-socket.type-g .socket-face::before {
    width: 6px;
    height: 14px;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
  }

  .visual-socket.type-g .socket-face::after {
    width: 12px;
    height: 6px;
    bottom: 10px;
    left: 6px;
  }

  .visual-socket.type-g::before {
    width: 12px;
    height: 6px;
    bottom: 10px;
    right: 6px;
  }

  .visual-socket.type-i .socket-face::before,
  .visual-socket.type-i .socket-face::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 12px;
    background: #374151;
    bottom: 12px;
  }

  .visual-socket.type-i .socket-face::before {
    left: 12px;
    transform: rotate(30deg);
  }

  .visual-socket.type-i .socket-face::after {
    right: 12px;
    transform: rotate(-30deg);
  }

  .visual-socket.type-i::before {
    content: '';
    position: absolute;
    width: 4px;
    height: 12px;
    background: #374151;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    display: block;
  }

  .visual-socket.type-f {
    border-radius: 50%;
  }

  .visual-socket.type-f .socket-face::before,
  .visual-socket.type-f .socket-face::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #374151;
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
  }

  .visual-socket.type-f .socket-face::before {
    left: 10px;
  }

  .visual-socket.type-f .socket-face::after {
    right: 10px;
  }

  .visual-socket.type-f::before,
  .visual-socket.type-f::after {
    content: '';
    position: absolute;
    width: 12px;
    height: 4px;
    background: #9ca3af;
    left: 50%;
    transform: translateX(-50%);
  }

  .visual-socket.type-f::before {
    top: 0;
  }

  .visual-socket.type-f::after {
    bottom: 0;
  }

  .reference-card h3 {
    margin-bottom: 1.5rem;
  }

  .type-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .gallery-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    border: 1px solid transparent;
    border-radius: 8px;
  }

  .gallery-item:hover {
    border-color: var(--border);
    background: #f9f9f9;
  }

  .visual-socket.small {
    width: 32px;
    height: 32px;
    transform: scale(0.8);
  }

  .gallery-info p {
    font-size: 0.75rem;
    color: var(--text-2);
    margin-top: 2px;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
  }

  .tips-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f0f9ff;
    color: #0369a1;
    border-radius: 8px;
    font-size: 0.85rem;
    line-height: 1.5;
    margin-top: 1rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    font-size: 0.85rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
  }
</style>
