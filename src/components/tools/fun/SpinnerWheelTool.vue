<template>
  <div class="spinner-tool">
    <header class="tool-header">
      <div class="header-left">
        <el-button text @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="tool-title">决策大转盘</h1>
        <span class="tool-subtitle">Decision Spinner Wheel</span>
      </div>
      <div class="header-right">
        <el-button v-if="result && !isSpinning" type="primary" link @click="result = ''">
          清除结果
        </el-button>
      </div>
    </header>

    <main class="main-content">
      <div class="glass-card tool-layout">
        <div class="wheel-section">
          <div class="wheel-container">
            <div class="wheel-outer">
              <div class="wheel-pointer"></div>
              <div class="wheel-inner" :style="wheelStyle">
                <div
                  v-for="(item, idx) in options"
                  :key="idx"
                  class="wheel-item"
                  :style="getItemStyle(idx)"
                >
                  <div class="item-content" :style="getItemContentStyle()">
                    <span class="item-text">{{ item }}</span>
                  </div>
                </div>
              </div>
              <!-- 中心轴锚点 -->
              <div class="wheel-center-cap"></div>
            </div>
          </div>

          <div class="action-section">
            <button class="spin-btn" :disabled="isSpinning || options.length < 2" @click="spin">
              <div class="btn-inner">
                <span v-if="!isSpinning">开始</span>
                <span v-else class="spin-loading">决策中</span>
              </div>
            </button>
            <transition name="fade">
              <div v-if="result && !isSpinning" class="result-display">
                <span class="res-label">结果是：</span>
                <span class="res-text">{{ result }}</span>
              </div>
            </transition>
            <div v-if="options.length < 2" class="warning-msg">至少需要2个选项</div>
          </div>
        </div>

        <div class="settings-section">
          <section class="config-panel">
            <h3 class="config-title">常用模版</h3>
            <div class="preset-grid">
              <button v-for="p in presets" :key="p.name" class="preset-btn" @click="loadPreset(p)">
                {{ p.name }}
              </button>
            </div>
          </section>

          <section class="config-panel mt-8">
            <div class="edit-header">
              <h3 class="config-title">自定义选项</h3>
              <button class="clear-btn" @click="rawOptions = ''">重置</button>
            </div>
            <textarea
              v-model="rawOptions"
              placeholder="输入选项，按回车分隔..."
              class="edit-area"
              @input="handleInput"
            ></textarea>
            <p class="edit-tip">提示：每行一个选项，建议 4-8 个效果最佳</p>
          </section>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 决策大转盘</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft } from '@element-plus/icons-vue';

  const isSpinning = ref(false);
  const rotation = ref(0);
  const result = ref('');
  const rawOptions = ref('中午吃啥\n外卖\n食堂\n泡面\n下馆子\n减肥不吃');

  const options = computed(() => {
    return rawOptions.value.split('\n').filter(s => s.trim() !== '');
  });

  const wheelStyle = computed(() => ({
    transform: `rotate(${rotation.value}deg)`,
    transition: isSpinning.value
      ? 'transform 4s cubic-bezier(0.2, 0, 0.2, 1)'
      : 'transform 0.5s ease-out'
  }));

  const getItemStyle = (idx: number) => {
    const n = options.value.length;
    const angle = 360 / n;
    // 旋转起始位置，让第一个选项从 12 点钟方向开始
    const rotate = angle * idx;
    const skewY = angle - 90;
    const colors = [
      '#FF6B6B',
      '#4D96FF',
      '#6BCB77',
      '#FFD93D',
      '#9D65C9',
      '#FF9F43',
      '#1DD1A1',
      '#54A0FF'
    ];

    return {
      transform: `rotate(${rotate}deg) skewY(${skewY}deg)`,
      backgroundColor: colors[idx % colors.length]
    };
  };

  const getItemContentStyle = () => {
    const n = options.value.length;
    const angle = 360 / n;
    const skewY = 90 - angle;
    // 计算文字旋转：文字应该在扇区的中心轴线上
    const rotate = -(angle / 2 + (90 - angle));

    return {
      transform: `skewY(${skewY}deg) rotate(${rotate}deg)`,
      width: '180px',
      height: '100%',
      // 这里使用 flex 配合 padding 让文字出现在扇区中后段
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '35px' // 增加间距防止文字贴合轴心
    };
  };

  const spin = () => {
    if (isSpinning.value || options.value.length < 2) return;
    isSpinning.value = true;
    result.value = '';

    // 随机旋转多圈 (8-12圈)
    const extraRounds = 8 + Math.floor(Math.random() * 5);
    const n = options.value.length;
    const anglePerItem = 360 / n;
    const targetIdx = Math.floor(Math.random() * n);

    // 纠正坐标系逻辑：
    // 指针固定在顶部 0deg。
    // 转盘 index 0 占据 [0, 360/n] 角度。
    // 其中心点在 360/(2n)。
    // 为了让指针指向这个中心，转盘由于是顺时针旋转，需要旋转的角度为:
    // targetRotation = -(targetIdx * anglePerItem + anglePerItem / 2)
    const randomOffset = (Math.random() - 0.5) * (anglePerItem * 0.5); // 加一点点随机偏移避免正中
    const targetRotation = -(targetIdx * anglePerItem + anglePerItem / 2 + randomOffset);

    // 我们需要一个持续增加的累计旋转值，以确保每次点击都是顺时针转动
    // 假设当前已经在 rotation.value，目标是比它大的某个值（或者相对当前的位移）
    // 找到一个 final，使得 final % 360 == targetRotation % 360 且差距足够大
    const currentBase = Math.floor(rotation.value / 360) * 360;
    const finalRotation = currentBase - extraRounds * 360 + targetRotation;

    rotation.value = finalRotation;

    setTimeout(() => {
      isSpinning.value = false;
      result.value = options.value[targetIdx];
      // 不做 rotation 的规约，保持在该位置，防止下次抽奖时回闪
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
    --accent: #334155;
    --accent-hover: #1e293b;
    --gold: #f59e0b;

    font-family: 'Outfit', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  /* Nav styles remain largely same but refined */
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
  .footer {
    width: 100%;
    text-align: center;
    padding: 2.5rem 0;
    color: var(--text-2);
    font-size: 0.85rem;
    background: transparent;
    z-index: 10;
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

  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    padding: 2.5rem;
    align-items: center;
  }

  .wheel-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
  }

  .wheel-container {
    position: relative;
    padding: 20px;
  }

  .wheel-outer {
    width: 380px;
    height: 380px;
    position: relative;
    border-radius: 50%;
    border: 12px solid #334155;
    background: #334155;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  .wheel-pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 48px;
    background: #334155;
    clip-path: polygon(50% 100%, 0 0, 100% 0);
    z-index: 20;
    filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
  }

  .wheel-inner {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    background: #fff;
    border: 4px solid #fff;
  }

  .wheel-item {
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 50%;
    transform-origin: 0% 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .item-content {
    position: absolute;
    bottom: 0;
    left: 0;
    transform-origin: 0% 100%;
    pointer-events: none;
  }

  .item-text {
    color: white;
    font-weight: 800;
    font-size: 1rem;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    white-space: nowrap;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;
  }

  .wheel-center-cap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
    z-index: 10;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    border: 6px solid #334155;
  }

  .action-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    min-height: 140px;
  }

  .spin-btn {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: none;
    background: var(--accent);
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
  }

  .spin-btn:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4);
  }

  .spin-btn:active {
    transform: scale(0.95);
  }

  .btn-inner {
    font-size: 1.1rem;
    font-weight: 800;
    letter-spacing: 1px;
  }

  .result-display {
    text-align: center;
    padding: 0.75rem 1.5rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 50px;
    color: #166534;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .res-text {
    font-weight: 800;
    font-size: 1.25rem;
  }

  .settings-section {
    background: #f8fafc;
    border-left: 1px solid var(--border);
    padding-left: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .config-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .config-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-2);
    margin: 0;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .preset-btn {
    padding: 0.6rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    border-color: #334155;
    background: #f1f5f9;
  }

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .clear-btn {
    font-size: 0.75rem;
    color: var(--text-2);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
  }

  .edit-area {
    width: 100%;
    height: 150px;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 16px;
    resize: none;
    font-size: 0.95rem;
    line-height: 1.6;
    outline: none;
  }

  .edit-area:focus {
    border-color: #334155;
    box-shadow: 0 0 0 4px rgba(51, 65, 85, 0.05);
  }

  .edit-tip {
    font-size: 0.7rem;
    color: #94a3b8;
    margin-top: 0.5rem;
  }

  .mt-8 {
    margin-top: 2rem;
  }

  @media (max-width: 1100px) {
    .tool-layout {
      grid-template-columns: 1fr;
      padding: 1.5rem;
    }
    .settings-section {
      border-left: none;
      border-top: 1px solid var(--border);
      padding-left: 0;
      padding-top: 2rem;
    }
    .wheel-outer {
      width: 320px;
      height: 320px;
    }
  }

  /* Result text scaling for long words */
  .res-text {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
