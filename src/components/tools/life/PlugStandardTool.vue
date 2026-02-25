<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">插座<span>.查询()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <main class="main-content">
        <div class="brutal-pane search-pane">
          <div class="pane-header bg-yellow">
            <span>🔍 搜索插座标准</span>
          </div>
          <div class="pane-body">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索国家或地区 (如：日本、英国、USA)"
              class="brutal-input full"
            />
          </div>
        </div>

        <div class="results-container">
          <div v-if="filteredCountries.length > 0" class="country-grid">
            <div
              v-for="country in filteredCountries"
              :key="country.name"
              class="brutal-pane country-card"
            >
              <div class="card-header bg-blue">
                <span class="flag">{{ country.flag }}</span>
                <span class="country-name">{{ country.name }}</span>
              </div>

              <div class="info-row">
                <div class="info-item">
                  <span class="label">电压</span>
                  <span class="val highlight">{{ country.voltage }}</span>
                </div>
                <div class="info-item">
                  <span class="label">频率</span>
                  <span class="val highlight">{{ country.frequency }}</span>
                </div>
              </div>

              <div class="plug-types">
                <span class="label">插座类型:</span>
                <div class="types-list">
                  <div v-for="type in country.plugs" :key="type" class="plug-badge">
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

          <div v-else class="brutal-pane empty-state">
            <h2>未找到相关国家或地区</h2>
            <p>请尝试其他拼写或英文名称</p>
          </div>
        </div>

        <div class="brutal-pane reference-card">
          <div class="pane-header bg-dark text-white">
            <span>插座类型图鉴</span>
          </div>
          <div class="type-gallery">
            <div v-for="(desc, type) in plugDescriptions" :key="type" class="gallery-item">
              <div class="visual-socket small-socket" :class="'type-' + type.toLowerCase()">
                <div class="socket-face"></div>
              </div>
              <div class="gallery-info">
                <strong>{{ type }}型</strong>
                <p>{{ desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="brutal-pane info-card">
          <div class="pane-header bg-green pt-1 pb-1">
            <span>💡 提示</span>
          </div>
          <div class="pane-body">
            <p>
              以上数据基于IEC（国际电工委员会）通用标准整理。部分国家可能存在多标准并存的情况（如已有老式插座）。此工具仅供参考，出行前建议通过官方渠道或酒店方确认。
            </p>
          </div>
        </div>
      </main>

      <div class="brutal-status">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 各国插座标准查询器 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

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
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@600;800&family=Noto+Sans+SC:wght@400;700;900&display=swap');

  .brutal-wrapper {
    background-color: #fdfae5;
    background-image:
      linear-gradient(#e5e5e5 2px, transparent 2px),
      linear-gradient(90deg, #e5e5e5 2px, transparent 2px);
    background-size: 40px 40px;
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #4b7bff;
  }
  .brutal-title span {
    color: #4b7bff;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 6px 6px 0px #111;
    transition: all 0.1s;
    text-transform: uppercase;
    text-decoration: none;
    color: #111;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .brutal-pane:hover {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px 0px #111;
  }
  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
  }
  .pane-body {
    padding: 1.5rem;
  }

  .bg-yellow {
    background: #ffd900;
    color: #111;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }
  .text-white {
    color: #fff;
  }
  .pt-1 {
    padding-top: 0.5rem;
  }
  .pb-1 {
    padding-bottom: 0.5rem;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .brutal-input {
    border: 4px solid #111;
    padding: 1rem 1.25rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 700;
    font-size: 1.2rem;
    background: #fff;
    box-shadow: 6px 6px 0px #111;
    outline: none;
    transition: all 0.2s;
  }
  .brutal-input:focus {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px #111;
    background: #fdfae5;
  }
  .brutal-input.full {
    width: 100%;
    box-sizing: border-box;
  }

  .country-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .country-card {
    transition: all 0.2s;
    cursor: default;
  }
  .country-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }
  .country-card .card-header {
    padding: 0.75rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 4px solid #111;
  }
  .flag {
    font-size: 1.5rem;
  }
  .country-name {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    text-shadow: 1px 1px 0 #111;
    letter-spacing: 1px;
  }

  .info-row {
    display: flex;
    gap: 1.5rem;
    padding: 1rem 1.25rem;
    border-bottom: 4px solid #111;
    font-size: 0.95rem;
    background: #fdfae5;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .info-item .label {
    color: #555;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  .info-item .val {
    font-weight: 800;
    font-size: 1.1rem;
  }
  .highlight {
    color: #ff4b4b;
  }

  .plug-types {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-bottom: 4px solid #111;
  }
  .plug-types .label {
    font-weight: 700;
    font-size: 0.9rem;
  }
  .types-list {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .plug-badge {
    background: #00e572;
    border: 3px solid #111;
    padding: 0.25rem 0.5rem;
    font-weight: 800;
    font-family: 'Syne', sans-serif;
    font-size: 0.9rem;
    box-shadow: 2px 2px 0px #111;
  }

  .plug-visual {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: #fdfae5;
  }
  .visual-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: #333;
  }

  /* Visual Socket Design */
  .visual-socket {
    width: 48px;
    height: 48px;
    background: #fff;
    border: 3px solid #111;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      inset 3px 3px 0px rgba(0, 0, 0, 0.1),
      2px 2px 0px #111;
    flex-shrink: 0;
  }
  .visual-socket.small-socket {
    width: 36px;
    height: 36px;
    border-width: 2px;
    box-shadow: 2px 2px 0px #111;
  }

  .visual-socket.type-a .socket-face::before,
  .visual-socket.type-a .socket-face::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 14px;
    background: #111;
    top: 50%;
    transform: translateY(-50%);
  }
  .visual-socket.type-a .socket-face::before {
    left: 12px;
  }
  .visual-socket.type-a .socket-face::after {
    right: 12px;
  }
  .visual-socket.small-socket.type-a .socket-face::before,
  .visual-socket.small-socket.type-a .socket-face::after {
    height: 10px;
    width: 3px;
  }
  .visual-socket.small-socket.type-a .socket-face::before {
    left: 8px;
  }
  .visual-socket.small-socket.type-a .socket-face::after {
    right: 8px;
  }

  .visual-socket.type-b .socket-face {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .visual-socket.type-b .socket-face::before,
  .visual-socket.type-b .socket-face::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 12px;
    background: #111;
    top: 35%;
    transform: translateY(-50%);
  }
  .visual-socket.type-b .socket-face::before {
    left: 12px;
  }
  .visual-socket.type-b .socket-face::after {
    right: 12px;
  }
  .visual-socket.type-b::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #111;
    border-radius: 50%;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
  }
  .visual-socket.small-socket.type-b .socket-face::before,
  .visual-socket.small-socket.type-b .socket-face::after {
    height: 9px;
    width: 3px;
  }
  .visual-socket.small-socket.type-b .socket-face::before {
    left: 8px;
  }
  .visual-socket.small-socket.type-b .socket-face::after {
    right: 8px;
  }
  .visual-socket.small-socket.type-b::after {
    width: 6px;
    height: 6px;
    bottom: 6px;
  }

  .visual-socket.type-c .socket-face::before,
  .visual-socket.type-c .socket-face::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #111;
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
    border-radius: 25%;
  }
  .visual-socket.small-socket.type-c .socket-face::before,
  .visual-socket.small-socket.type-c .socket-face::after {
    width: 6px;
    height: 6px;
  }
  .visual-socket.small-socket.type-c .socket-face::before {
    left: 6px;
  }
  .visual-socket.small-socket.type-c .socket-face::after {
    right: 6px;
  }

  .visual-socket.type-g {
    border-radius: 10%;
  }
  .visual-socket.type-g .socket-face::before,
  .visual-socket.type-g .socket-face::after,
  .visual-socket.type-g::before {
    content: '';
    position: absolute;
    background: #111;
  }
  .visual-socket.type-g .socket-face::before {
    width: 6px;
    height: 12px;
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
  .visual-socket.small-socket.type-g .socket-face::before {
    width: 4px;
    height: 9px;
    top: 4px;
  }
  .visual-socket.small-socket.type-g .socket-face::after {
    width: 9px;
    height: 4px;
    bottom: 6px;
    left: 5px;
  }
  .visual-socket.small-socket.type-g::before {
    width: 9px;
    height: 4px;
    bottom: 6px;
    right: 5px;
  }

  .visual-socket.type-i .socket-face::before,
  .visual-socket.type-i .socket-face::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 12px;
    background: #111;
    bottom: 10px;
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
    background: #111;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
  }
  .visual-socket.small-socket.type-i .socket-face::before,
  .visual-socket.small-socket.type-i .socket-face::after,
  .visual-socket.small-socket.type-i::before {
    width: 3px;
    height: 9px;
  }
  .visual-socket.small-socket.type-i .socket-face::before {
    left: 8px;
    bottom: 8px;
  }
  .visual-socket.small-socket.type-i .socket-face::after {
    right: 8px;
    bottom: 8px;
  }
  .visual-socket.small-socket.type-i::before {
    top: 4px;
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
    background: #111;
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
    background: #111;
    left: 50%;
    transform: translateX(-50%);
  }
  .visual-socket.type-f::before {
    top: 0;
  }
  .visual-socket.type-f::after {
    bottom: 0;
  }
  .visual-socket.small-socket.type-f .socket-face::before,
  .visual-socket.small-socket.type-f .socket-face::after {
    width: 6px;
    height: 6px;
  }
  .visual-socket.small-socket.type-f .socket-face::before {
    left: 6px;
  }
  .visual-socket.small-socket.type-f .socket-face::after {
    right: 6px;
  }
  .visual-socket.small-socket.type-f::before,
  .visual-socket.small-socket.type-f::after {
    width: 8px;
    height: 3px;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
  }
  .empty-state h2 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    margin: 0 0 0.5rem;
  }
  .empty-state p {
    color: #555;
    font-weight: 600;
    margin: 0;
  }

  .type-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
  }
  .gallery-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    transition: transform 0.15s;
    background: #fff;
  }
  .gallery-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .gallery-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .gallery-info strong {
    font-size: 1.1rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
  }
  .gallery-info p {
    font-size: 0.85rem;
    color: #555;
    margin: 0;
    font-weight: 600;
    line-height: 1.4;
  }

  .info-card {
    border-color: #00e572;
    box-shadow: 8px 8px 0px #00e572;
  }
  .info-card.brutal-pane:hover {
    box-shadow: 10px 10px 0px #00e572;
  }
  .info-card p {
    font-weight: 700;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
  }

  .brutal-status {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 8px 8px 0px #111;
    padding: 1rem;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    overflow: hidden;
    text-transform: uppercase;
    margin-top: 1rem;
  }
  .marquee-wrapper {
    width: 100%;
    overflow: hidden;
  }
  .marquee-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 20s linear infinite;
  }
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .brutal-title {
      font-size: 2rem;
    }
    .type-gallery {
      grid-template-columns: 1fr;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn,
  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .gallery-item {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .info-card {
    border-color: #00994c;
    box-shadow: 8px 8px 0px #00994c;
  }
  [data-theme='dark'] .info-card.brutal-pane:hover {
    box-shadow: 10px 10px 0px #00994c;
  }
  [data-theme='dark'] .brutal-status,
  [data-theme='dark'] .gallery-item {
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .gallery-item:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .pane-header,
  [data-theme='dark'] .country-card .card-header,
  [data-theme='dark'] .info-row,
  [data-theme='dark'] .plug-types {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 6px 6px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #1a1a1a;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #111;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-dark {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .info-row,
  [data-theme='dark'] .plug-visual {
    background: #222;
  }
  [data-theme='dark'] .info-item .label,
  [data-theme='dark'] .visual-label,
  [data-theme='dark'] .gallery-info p {
    color: #aaa;
  }
  [data-theme='dark'] .highlight {
    color: #ff9fb2;
  }
  [data-theme='dark'] .plug-badge {
    background: #00994c;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .visual-socket {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow:
      inset 3px 3px 0px rgba(255, 255, 255, 0.1),
      2px 2px 0px #eee;
  }
  [data-theme='dark'] .visual-socket.small-socket {
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .visual-socket .socket-face::before,
  [data-theme='dark'] .visual-socket .socket-face::after,
  [data-theme='dark'] .visual-socket::before,
  [data-theme='dark'] .visual-socket::after {
    background: #eee !important;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .country-name {
    text-shadow: 1px 1px 0 #eee;
  }
</style>
