<template>
  <div class="spinner-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>决策大转盘</h1>
        <span class="nav-subtitle">Decision Spinner Wheel</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <div class="wheel-section">
          <div class="wheel-outer">
            <div class="wheel-pointer"></div>
            <div class="wheel-inner" :style="wheelStyle">
              <div
                v-for="(item, idx) in options"
                :key="idx"
                class="wheel-item"
                :style="getItemStyle(idx)"
              >
                <div class="item-content" :style="getTextStyle()">
                  <span class="item-text">{{ item }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="spin-btn" :disabled="isSpinning || options.length < 2" @click="spin">
            <span v-if="!isSpinning">开始</span>
            <span v-else>决策中...</span>
          </button>
          <div v-if="options.length < 2" class="warning-msg">至少需要2个选项才能开始决策</div>
        </div>

        <div class="settings-section">
          <section class="presets">
            <label>常用模版</label>
            <div class="preset-grid">
              <button v-for="p in presets" :key="p.name" class="preset-btn" @click="loadPreset(p)">
                {{ p.name }}
              </button>
            </div>
          </section>

          <section class="custom-edit">
            <div class="edit-header">
              <label>修改选项 (每行一个)</label>
              <button class="clear-btn" @click="rawOptions = ''">重置</button>
            </div>
            <textarea
              v-model="rawOptions"
              placeholder="输入选项，按回车分隔..."
              class="edit-area"
              @input="handleInput"
            ></textarea>
          </section>

          <!-- Result Card -->
          <transition name="fade">
            <div v-if="result && !isSpinning" class="result-card">
              <span class="res-meta">决策结果：</span>
              <h2 class="res-val">{{ result }}</h2>
            </div>
          </transition>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 决策大转盘</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const isSpinning = ref(false);
  const rotation = ref(0);
  const result = ref('');
  const rawOptions = ref('中午吃啥\n外卖\n食堂\n泡面\n下馆子\n减肥不吃');

  const options = computed(() => {
    return rawOptions.value.split('\n').filter(s => s.trim() !== '');
  });

  const wheelStyle = computed(() => ({
    transform: `rotate(${rotation.value}deg)`,
    transition: isSpinning.value ? 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
  }));

  const getItemStyle = (idx: number) => {
    const angle = 360 / options.value.length;
    const rotate = angle * idx;
    const colors = [
      '#f87171',
      '#fb923c',
      '#facc15',
      '#4ade80',
      '#22d3ee',
      '#818cf8',
      '#c084fc',
      '#f472b6'
    ];
    return {
      transform: `rotate(${rotate}deg) skewY(${angle / 2}deg)`,
      background: colors[idx % colors.length]
    };
  };

  const getTextStyle = () => {
    const angle = 360 / options.value.length;
    // 倾斜角度为angle/2，文本需要反向旋转以保持水平
    const textRotate = -angle / 2;
    return {
      transform: `rotate(${textRotate}deg)`
    };
  };

  const spin = () => {
    if (isSpinning.value || options.value.length < 2) return;
    isSpinning.value = true;
    result.value = '';

    const extraRounds = 5 + Math.floor(Math.random() * 5);
    const targetIdx = Math.floor(Math.random() * options.value.length);
    const anglePerItem = 360 / options.value.length;

    // We want the target item to be at the top (under the pointer)
    // Pointer is at 0 deg, so we want the center of the item (targetIdx * anglePerItem + anglePerItem/2) to be at 0 (or 360 - ...)
    const targetRotation = 360 - (targetIdx * anglePerItem + anglePerItem / 2);
    const finalRotation = extraRounds * 360 + targetRotation;

    rotation.value = finalRotation;

    setTimeout(() => {
      isSpinning.value = false;
      result.value = options.value[targetIdx];
      // Reset rotation to within 0-360 range for next spin start
      rotation.value = targetRotation;
    }, 4000);
  };

  const presets = [
    { name: '中午吃啥', list: '外卖\n食堂\n泡面\n下馆子\n减肥不吃' },
    { name: '今天去哪', list: '图书馆\n健身房\n电影院\n公园\n宅在家' },
    { name: '谁做家务', list: '我去\n你去\n石头剪刀布\n留着等会做' },
    { name: '买不买它', list: '买买买\n不准买\n再考虑一下' }
  ];

  const loadPreset = (p: { name: string; list: string }) => {
    rawOptions.value = p.list;
    result.value = '';
    rotation.value = 0;
    if (isSpinning.value) {
      isSpinning.value = false;
    }
  };

  const handleInput = () => {
    result.value = '';
    rotation.value = 0;
    if (isSpinning.value) {
      isSpinning.value = false;
    }
  };
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;700&family=Outfit:wght@400;500;600&display=swap');

  .spinner-tool {
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #1e293b;
    --text-2: #64748b;
    --accent: #f43f5e;
    --accent-bg: #fff1f2;

    font-family: 'Outfit', sans-serif;
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
    padding: 1rem 2rem;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0.5rem 1rem;
    border-radius: 50px;
  }
  .nav-back:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-bg);
  }

  .nav-center {
    flex: 1;
    text-align: center;
  }
  .nav-center h1 {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
  }
  .nav-subtitle {
    font-size: 0.75rem;
    color: var(--text-2);
    text-transform: uppercase;
    text-align: center;
    display: block;
    letter-spacing: 1.5px;
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 3rem 1.5rem;
  }
  .glass-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 32px;
    padding: 3rem;
    display: grid;
    grid-template-columns: 450px 1fr;
    gap: 4rem;
    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
  }

  .wheel-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .wheel-outer {
    width: 400px;
    height: 400px;
    position: relative;
    border-radius: 50%;
    border: 8px solid #334155;
    padding: 4px;
    box-shadow: 0 10px 40px -5px rgba(0, 0, 0, 0.15);
  }
  .wheel-pointer {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 45px;
    background: #334155;
    clip-path: polygon(50% 100%, 0 0, 100% 0);
    z-index: 10;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  }

  .wheel-inner {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    background: #f8fafc;
  }
  .wheel-item {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 50%;
    transform-origin: 0% 100%;
  }
  .item-content {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 100px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .item-text {
    display: block;
    width: 100px;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-bottom: 20px;
  }

  .spin-btn {
    margin-top: 3rem;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 6px solid #fff;
    background: #334155;
    color: white;
    font-size: 1.25rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.2s;
    display: block;
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
  }
  .spin-btn:hover:not(:disabled) {
    transform: scale(1.05);
    background: #1e293b;
  }
  .spin-btn:active {
    transform: scale(0.95);
  }
  .spin-btn:disabled {
    opacity: 0.8;
    cursor: wait;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .presets label {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-2);
    display: block;
    margin-bottom: 1rem;
  }
  .preset-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .preset-btn {
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text);
  }
  .preset-btn:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
    color: var(--accent);
  }

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  .edit-header label {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--text-2);
  }
  .clear-btn {
    font-size: 0.75rem;
    color: var(--text-2);
    background: none;
    border: none;
    cursor: pointer;
  }

  .edit-area {
    width: 100%;
    height: 180px;
    padding: 1.25rem;
    border: 2px solid var(--border);
    border-radius: 16px;
    background: #f8fafc;
    font-size: 1rem;
    line-height: 1.6;
    outline: none;
    transition: all 0.3s;
    resize: none;
    overflow-y: auto;
  }
  .edit-area:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 4px var(--accent-bg);
  }

  .result-card {
    margin-top: 1rem;
    padding: 2rem;
    background: var(--accent);
    border-radius: 20px;
    color: white;
    text-align: center;
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .res-meta {
    font-size: 0.85rem;
    opacity: 0.8;
  }
  .res-val {
    font-size: 2.2rem;
    margin-top: 0.5rem;
    font-family: 'Noto Serif SC', serif;
    font-weight: 900;
  }

  @keyframes popIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .warning-msg {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef3c7;
    border: 1px solid #f59e0b;
    color: #92400e;
    border-radius: 8px;
    font-size: 0.9rem;
    text-align: center;
  }

  .footer {
    text-align: center;
    padding: 3rem;
    color: var(--text-2);
    font-size: 0.85rem;
  }

  @media (max-width: 900px) {
    .glass-card {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .wheel-outer {
      width: 300px;
      height: 300px;
    }
  }
</style>
