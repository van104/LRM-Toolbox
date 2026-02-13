<template>
  <div class="tool-container">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>物理单位量纲查询</h1>
        <span class="nav-subtitle">Physical Units & Dimensions Lookup</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索物理量、单位或符号..."
            class="search-input"
          />
        </div>

        <div class="table-container animate-fade-in">
          <table>
            <thead>
              <tr>
                <th>物理量</th>
                <th>符号</th>
                <th>国际单位 (SI)</th>
                <th>量纲 (Dimension)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredUnits" :key="item.name">
                <td class="col-name">{{ item.name }}</td>
                <td class="col-symbol">
                  <i>{{ item.symbol }}</i>
                </td>
                <td class="col-unit">{{ item.unitName }} ({{ item.unitSymbol }})</td>
                <td class="col-dim code-font">{{ item.dimension }}</td>
              </tr>
              <tr v-if="filteredUnits.length === 0">
                <td colspan="4" class="empty-state">未找到匹配的结果</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="legend-card">
        <h3>📐 量纲符号说明</h3>
        <div class="legend-grid">
          <div class="legend-item"><span class="badge">L</span> 长度 (Length)</div>
          <div class="legend-item"><span class="badge">M</span> 质量 (Mass)</div>
          <div class="legend-item"><span class="badge">T</span> 时间 (Time)</div>
          <div class="legend-item"><span class="badge">I</span> 电流 (Current)</div>
          <div class="legend-item"><span class="badge">Θ</span> 温度 (Temperature)</div>
          <div class="legend-item"><span class="badge">N</span> 物质的量 (Amount)</div>
          <div class="legend-item"><span class="badge">J</span> 发光强度 (Intensity)</div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 物理工具系列</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface UnitItem {
    name: string;
    symbol: string;
    unitName: string;
    unitSymbol: string;
    dimension: string;
    keywords: string;
  }

  const searchQuery = ref('');

  const units: UnitItem[] = [
    {
      name: '长度',
      symbol: 'l, x, r',
      unitName: '米',
      unitSymbol: 'm',
      dimension: 'L',
      keywords: 'length meter distance'
    },
    {
      name: '质量',
      symbol: 'm',
      unitName: '千克',
      unitSymbol: 'kg',
      dimension: 'M',
      keywords: 'mass kilogram weight'
    },
    {
      name: '时间',
      symbol: 't',
      unitName: '秒',
      unitSymbol: 's',
      dimension: 'T',
      keywords: 'time second'
    },
    {
      name: '电流',
      symbol: 'I',
      unitName: '安培',
      unitSymbol: 'A',
      dimension: 'I',
      keywords: 'electric current ampere'
    },
    {
      name: '热力学温度',
      symbol: 'T',
      unitName: '开尔文',
      unitSymbol: 'K',
      dimension: 'Θ',
      keywords: 'thermodynamic temperature kelvin'
    },
    {
      name: '物质的量',
      symbol: 'n',
      unitName: '摩尔',
      unitSymbol: 'mol',
      dimension: 'N',
      keywords: 'amount of substance mole'
    },
    {
      name: '发光强度',
      symbol: 'Iv',
      unitName: '坎德拉',
      unitSymbol: 'cd',
      dimension: 'J',
      keywords: 'luminous intensity candela'
    },
    {
      name: '面积',
      symbol: 'A',
      unitName: '平方米',
      unitSymbol: 'm²',
      dimension: 'L²',
      keywords: 'area square meter'
    },
    {
      name: '体积',
      symbol: 'V',
      unitName: '立方米',
      unitSymbol: 'm³',
      dimension: 'L³',
      keywords: 'volume cubic meter'
    },
    {
      name: '速度',
      symbol: 'v',
      unitName: '米每秒',
      unitSymbol: 'm/s',
      dimension: 'L T⁻¹',
      keywords: 'velocity speed'
    },
    {
      name: '加速度',
      symbol: 'a',
      unitName: '米每二次方秒',
      unitSymbol: 'm/s²',
      dimension: 'L T⁻²',
      keywords: 'acceleration'
    },
    {
      name: '密度',
      symbol: 'ρ',
      unitName: '千克每立方米',
      unitSymbol: 'kg/m³',
      dimension: 'M L⁻³',
      keywords: 'density'
    },
    {
      name: '力',
      symbol: 'F',
      unitName: '牛顿',
      unitSymbol: 'N',
      dimension: 'M L T⁻²',
      keywords: 'force newton'
    },
    {
      name: '能量/功',
      symbol: 'E, W',
      unitName: '焦耳',
      unitSymbol: 'J',
      dimension: 'M L² T⁻²',
      keywords: 'energy work joule'
    },
    {
      name: '功率',
      symbol: 'P',
      unitName: '瓦特',
      unitSymbol: 'W',
      dimension: 'M L² T⁻³',
      keywords: 'power watt'
    },
    {
      name: '压力/压强',
      symbol: 'p',
      unitName: '帕斯卡',
      unitSymbol: 'Pa',
      dimension: 'M L⁻¹ T⁻²',
      keywords: 'pressure pascal stress'
    },
    {
      name: '频率',
      symbol: 'f',
      unitName: '赫兹',
      unitSymbol: 'Hz',
      dimension: 'T⁻¹',
      keywords: 'frequency hertz'
    },
    {
      name: '电荷量',
      symbol: 'Q',
      unitName: '库仑',
      unitSymbol: 'C',
      dimension: 'I T',
      keywords: 'electric charge coulomb'
    },
    {
      name: '电压/电势',
      symbol: 'V, φ',
      unitName: '伏特',
      unitSymbol: 'V',
      dimension: 'M L² T⁻³ I⁻¹',
      keywords: 'voltage potential volt'
    },
    {
      name: '电阻',
      symbol: 'R',
      unitName: '欧姆',
      unitSymbol: 'Ω',
      dimension: 'M L² T⁻³ I⁻²',
      keywords: 'electric resistance ohm'
    },
    {
      name: '电容',
      symbol: 'C',
      unitName: '法拉',
      unitSymbol: 'F',
      dimension: 'M⁻¹ L⁻² T⁴ I²',
      keywords: 'capacitance farad'
    },
    {
      name: '磁感应强度',
      symbol: 'B',
      unitName: '特斯拉',
      unitSymbol: 'T',
      dimension: 'M T⁻² I⁻¹',
      keywords: 'magnetic flux density tesla'
    },
    {
      name: '磁通量',
      symbol: 'Φ',
      unitName: '韦伯',
      unitSymbol: 'Wb',
      dimension: 'M L² T⁻² I⁻¹',
      keywords: 'magnetic flux weber'
    },
    {
      name: '电感',
      symbol: 'L',
      unitName: '亨利',
      unitSymbol: 'H',
      dimension: 'M L² T⁻² I⁻²',
      keywords: 'inductance henry'
    },
    {
      name: '动量',
      symbol: 'p',
      unitName: '千克米每秒',
      unitSymbol: 'kg·m/s',
      dimension: 'M L T⁻¹',
      keywords: 'momentum'
    },
    {
      name: '角速度',
      symbol: 'ω',
      unitName: '弧度每秒',
      unitSymbol: 'rad/s',
      dimension: 'T⁻¹',
      keywords: 'angular velocity'
    }
  ];

  const filteredUnits = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return units;
    return units.filter(
      item =>
        item.name.includes(q) ||
        item.unitName.includes(q) ||
        item.unitSymbol.toLowerCase().includes(q) ||
        item.symbol.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    );
  });
</script>

<style scoped>
  .tool-container {
    --bg: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --accent: #6366f1;
    --accent-light: #e0e7ff;

    min-height: 100vh;
    background: var(--bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.8);
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
    font-size: 1rem;
    color: #64748b;
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
  }
  .nav-subtitle {
    font-size: 0.8rem;
    color: #64748b;
  }
  .nav-spacer {
    width: 60px;
  }

  .main-content {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .glass-card {
    background: var(--card);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  }

  .search-box {
    margin-bottom: 1.5rem;
  }

  .search-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1.1rem;
    outline: none;
    transition: all 0.2s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: 1rem center;
    background-size: 1.2rem;
    padding-left: 3rem;
  }

  .search-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .table-container {
    overflow-x: auto;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }

  thead {
    background: #f1f5f9;
  }

  th {
    padding: 1rem;
    font-weight: 600;
    color: #475569;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    color: #334155;
  }

  tr:hover td {
    background: #f8fafc;
  }

  .col-name {
    font-weight: 500;
    color: #0f172a;
  }
  .col-dim {
    color: var(--accent);
    font-weight: 600;
    background: var(--accent-light);
    border-radius: 4px;
    padding: 0.2rem 0.5rem;
    display: inline-block;
    font-size: 0.85rem;
  }
  .code-font {
    font-family: 'Space Mono', monospace;
  }
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
  }

  .legend-card {
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
  }

  .legend-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: #475569;
  }

  .legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #64748b;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #0f172a;
    color: white;
    border-radius: 4px;
    font-weight: 700;
    font-family: monospace;
    font-size: 0.8rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
