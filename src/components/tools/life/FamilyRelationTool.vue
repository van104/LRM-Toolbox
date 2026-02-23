<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">亲戚<span>称呼()</span></h1>
        <div class="badge">👨‍👩‍👧‍👦 Family Calc</div>
      </header>

      <main class="brutal-main">
        <!-- 计算器主体 -->
        <div class="calc-body">
          <!-- 顶部屏幕 -->
          <div class="brutal-pane screen-pane">
            <div class="pane-header bg-yellow">
              <span>🧮 计算器 (CALCULATOR)</span>
              <div class="gender-switch">
                <span class="gender-label">我的性别：</span>
                <button
                  class="gender-btn"
                  :class="{ active: myGender === 1 }"
                  @click="setGender(1)"
                >
                  ♂ 男
                </button>
                <button
                  class="gender-btn"
                  :class="{ active: myGender === 0 }"
                  @click="setGender(0)"
                >
                  ♀ 女
                </button>
              </div>
            </div>

            <div class="screen-body">
              <div class="expression-line">{{ expressionText }}</div>
              <div class="result-line" :class="{ unknown: resultText === '未知亲戚' }">
                {{ resultText }}
              </div>
            </div>
          </div>

          <!-- 键盘区 -->
          <div class="brutal-pane keyboard-pane">
            <div class="pane-header bg-blue">
              <span class="text-white">⌨️ 关系键盘 (KEYPAD)</span>
            </div>

            <div class="key-grid">
              <button
                v-for="btn in buttons"
                :key="btn.label"
                class="key-btn"
                :class="[btn.colorClass || '', { 'key-disabled': btn.disabled }]"
                :disabled="btn.disabled"
                @click="btn.action"
              >
                {{ btn.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- 右侧说明 -->
        <aside class="info-sidebar">
          <div class="brutal-pane sticky-pane">
            <div class="pane-header bg-pink">
              <span class="text-white">📖 使用指南 (GUIDE)</span>
            </div>
            <div class="pane-body">
              <div class="guide-block">
                <div class="guide-step">
                  <span class="step-num">01</span>
                  <span class="step-text">先选择「我的性别」</span>
                </div>
                <div class="guide-step">
                  <span class="step-num">02</span>
                  <span class="step-text">按关系链逐步点击对应按钮</span>
                </div>
                <div class="guide-step">
                  <span class="step-num">03</span>
                  <span class="step-text">结果自动显示在屏幕上</span>
                </div>
              </div>

              <div class="guide-example">
                <div class="example-title">💡 示例</div>
                <div class="example-content">
                  <p>我(男) → 父 → 兄 → 妻 = <strong>伯母</strong></p>
                  <p>我(女) → 母 → 姐 = <strong>大姨</strong></p>
                  <p>我(男) → 兄 → 子 = <strong>侄子</strong></p>
                </div>
              </div>

              <div class="guide-tip">
                <span class="tip-icon">⚡</span>
                <span>按「退」可撤销，按「C」清空全部</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const myGender = ref(1);
  const chain = ref<string[]>([]);

  const relationDict: Record<string, string> = {
    // 1级关系
    父: '爸爸',
    母: '妈妈',
    夫: '老公',
    妻: '老婆',
    兄: '哥哥',
    弟: '弟弟',
    姐: '姐姐',
    妹: '妹妹',
    子: '儿子',
    女: '女儿',

    // ========== 表1: 长辈的亲属（父、母） ==========
    // 直系长辈
    '父,父': '爷爷',
    '父,母': '奶奶',
    '母,父': '外公',
    '母,母': '外婆',
    // 父母的配偶（逻辑闭环）
    '父,妻': '妈妈',
    '母,夫': '爸爸',
    // 旁系长辈
    '父,兄': '伯父',
    '父,弟': '叔叔',
    '父,姐': '姑妈',
    '父,妹': '姑姑',
    '母,兄': '舅舅',
    '母,弟': '舅舅',
    '母,姐': '大姨',
    '母,妹': '小姨',
    // 父母的子女 → 兄弟姐妹（闭环）
    '父,子': '兄弟',
    '父,女': '姐妹',
    '母,子': '兄弟',
    '母,女': '姐妹',

    // ========== 表2: 配偶的亲属（夫、妻） ==========
    '夫,父': '公公',
    '夫,母': '婆婆',
    '妻,父': '岳父',
    '妻,母': '岳母',
    // 配偶的配偶 → 自己
    '夫,妻': '自己',
    '妻,夫': '自己',
    // 配偶的兄弟姐妹
    '夫,兄': '大伯子',
    '夫,弟': '小叔子',
    '夫,姐': '大姑子',
    '夫,妹': '小姑子',
    '妻,兄': '大舅子',
    '妻,弟': '小舅子',
    '妻,姐': '大姨子',
    '妻,妹': '小姨子',
    // 配偶的子女（继子/继女简化）
    '夫,子': '儿子',
    '夫,女': '女儿',
    '妻,子': '儿子',
    '妻,女': '女儿',

    // ========== 表3: 平辈的亲属（兄、弟、姐、妹） ==========
    // 兄弟姐妹的配偶
    '兄,妻': '嫂子',
    '弟,妻': '弟妹',
    '姐,夫': '姐夫',
    '妹,夫': '妹夫',
    // 兄弟姐妹之间互推（16种组合）
    '兄,兄': '哥哥',
    '兄,弟': '弟弟',
    '兄,姐': '姐姐',
    '兄,妹': '妹妹',
    '弟,兄': '哥哥',
    '弟,弟': '弟弟',
    '弟,姐': '姐姐',
    '弟,妹': '妹妹',
    '姐,兄': '哥哥',
    '姐,弟': '弟弟',
    '姐,姐': '姐姐',
    '姐,妹': '妹妹',
    '妹,兄': '哥哥',
    '妹,弟': '弟弟',
    '妹,姐': '姐姐',
    '妹,妹': '妹妹',
    // 兄弟姐妹的父母（指向自己的父母，闭环）
    '兄,父': '爸爸',
    '弟,父': '爸爸',
    '姐,父': '爸爸',
    '妹,父': '爸爸',
    '兄,母': '妈妈',
    '弟,母': '妈妈',
    '姐,母': '妈妈',
    '妹,母': '妈妈',
    // 兄弟姐妹的子女
    '兄,子': '侄子',
    '弟,子': '侄子',
    '兄,女': '侄女',
    '弟,女': '侄女',
    '姐,子': '外甥',
    '妹,子': '外甥',
    '姐,女': '外甥女',
    '妹,女': '外甥女',

    // ========== 表4: 晚辈的亲属（子、女） ==========
    // 子女的配偶
    '子,妻': '儿媳妇',
    '女,夫': '女婿',
    // 子女的父母（回指自己/配偶）
    '子,父': '自己',
    '子,母': '老婆',
    '女,父': '自己',
    '女,母': '老婆',
    // 孙辈
    '子,子': '孙子',
    '子,女': '孙女',
    '女,子': '外孙',
    '女,女': '外孙女',

    // ========== 3级 - 长辈的配偶 ==========
    '父,兄,妻': '伯母',
    '父,弟,妻': '婶婶',
    '父,姐,夫': '姑父',
    '父,妹,夫': '姑父',
    '母,兄,妻': '舅妈',
    '母,弟,妻': '舅妈',
    '母,姐,夫': '姨父',
    '母,妹,夫': '姨父',

    // ========== 3级 - 曾祖辈 ==========
    '父,父,父': '太爷爷',
    '父,父,母': '太奶奶',
    '母,母,父': '太外公',
    '母,母,母': '太外婆',
    '父,母,父': '太外公',
    '父,母,母': '太外婆',
    '母,父,父': '太爷爷',
    '母,父,母': '太奶奶',

    // ========== 3级 - 旁系长辈扩展 ==========
    '父,父,兄': '伯公',
    '父,父,弟': '叔公',
    '父,父,姐': '姑婆',
    '父,父,妹': '姑婆',
    '母,母,兄': '舅公',
    '母,母,弟': '舅公',
    '母,母,姐': '姨婆',
    '母,母,妹': '姨婆',
    '父,母,兄': '舅公',
    '父,母,弟': '舅公',
    '父,母,姐': '姨婆',
    '父,母,妹': '姨婆',
    '母,父,兄': '伯公',
    '母,父,弟': '叔公',
    '母,父,姐': '姑婆',
    '母,父,妹': '姑婆',

    // ========== 3级 - 晚辈配偶的父母 ==========
    '子,妻,父': '亲家公',
    '子,妻,母': '亲家母',
    '女,夫,父': '亲家公',
    '女,夫,母': '亲家母',

    // ========== 3级 - 孙辈扩展 ==========
    '子,子,子': '曾孙',
    '子,子,女': '曾孙女',
    '女,女,子': '外曾孙',
    '女,女,女': '外曾孙女',
    '子,女,子': '外曾孙',
    '子,女,女': '外曾孙女',
    '女,子,子': '曾孙',
    '女,子,女': '曾孙女'
  };

  const currentGender = computed(() => {
    if (chain.value.length === 0) return myGender.value;
    const last = chain.value[chain.value.length - 1];
    if (['父', '兄', '弟', '子', '夫'].includes(last)) return 1;
    if (['母', '姐', '妹', '女', '妻'].includes(last)) return 0;
    return -1;
  });

  const buttons = computed(() => [
    { label: '父', action: () => append('父') },
    { label: '母', action: () => append('母') },
    { label: '夫', action: () => append('夫'), disabled: currentGender.value === 1 },
    { label: '妻', action: () => append('妻'), disabled: currentGender.value === 0 },
    { label: '兄', action: () => append('兄') },
    { label: '弟', action: () => append('弟') },
    { label: '姐', action: () => append('姐') },
    { label: '妹', action: () => append('妹') },
    { label: '子', action: () => append('子') },
    { label: '女', action: () => append('女') },
    {
      label: '退',
      action: backspace,
      colorClass: 'key-warn'
    },
    {
      label: 'C',
      action: clear,
      colorClass: 'key-danger'
    }
  ]);

  const setGender = (gender: number) => {
    myGender.value = gender;
    chain.value = [];
  };

  const append = (relation: string) => {
    chain.value.push(relation);
  };

  const backspace = () => {
    chain.value.pop();
  };

  const clear = () => {
    chain.value = [];
  };

  // 每个单字按键对应的自然语言称呼
  const labelMap: Record<string, string> = {
    父: '爸爸',
    母: '妈妈',
    夫: '老公',
    妻: '老婆',
    兄: '哥哥',
    弟: '弟弟',
    姐: '姐姐',
    妹: '妹妹',
    子: '儿子',
    女: '女儿'
  };

  const expressionText = computed(() => {
    if (chain.value.length === 0) return '我';
    const labels = chain.value.map(k => labelMap[k] || k);
    return '我 的 ' + labels.join(' 的 ');
  });

  // 性别感知的结果（这些关系的称呼取决于"我"的性别）
  const genderAwareResults: Record<string, { male: string; female: string }> = {
    // ===== 父母的子女 → 取决于性别判断是否可能是自己 =====
    '父,子': { male: '兄弟或自己', female: '哥哥或弟弟' },
    '父,女': { male: '姐姐或妹妹', female: '姐妹或自己' },
    '母,子': { male: '兄弟或自己', female: '哥哥或弟弟' },
    '母,女': { male: '姐姐或妹妹', female: '姐妹或自己' },

    // ===== 子女的父母 → 取决于性别判断指自己还是配偶 =====
    '子,父': { male: '自己', female: '老公' },
    '子,母': { male: '老婆', female: '自己' },
    '女,父': { male: '自己', female: '老公' },
    '女,母': { male: '老婆', female: '自己' },

    // ===== 平辈互推（反方向 = 有歧义） =====
    // 规律：一个往"大"走一个往"小"走时，结果人物可能在我的两侧
    //
    // 结果为男性的反方向组合：
    // 哥哥的弟弟 / 弟弟的哥哥 / 姐姐的弟弟 / 妹妹的哥哥
    '兄,弟': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '弟,兄': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '姐,弟': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '妹,兄': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    //
    // 结果为女性的反方向组合：
    // 姐姐的妹妹 / 妹妹的姐姐 / 哥哥的妹妹 / 弟弟的姐姐
    '姐,妹': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' },
    '妹,姐': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' },
    '兄,妹': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' },
    '弟,姐': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' }
    //
    // 注：同方向组合（兄→兄、兄→姐、弟→弟、弟→妹、姐→姐、姐→兄、妹→妹、妹→弟）
    // 没有歧义，直接使用 relationDict 中的固定结果
  };

  const resultText = computed(() => {
    if (chain.value.length === 0) return '我';
    const key = chain.value.join(',');
    // 优先检查性别感知的结果
    const genderResult = genderAwareResults[key];
    if (genderResult) {
      return myGender.value === 1 ? genderResult.male : genderResult.female;
    }
    return relationDict[key] || '未知亲戚';
  });
</script>

<style scoped>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=Syne:wght@700;800;900&family=Noto+Sans+SC:wght@400;700;900&display=swap');

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
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* Header */
  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #ff4b4b;
  }
  .brutal-title span {
    color: #ff4b4b;
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
  }
  .brutal-btn:hover {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
  }
  .brutal-btn:active {
    transform: translate(6px, 6px);
    box-shadow: 0px 0px 0px #111;
  }

  .badge {
    background: #111;
    color: #ff4b4b;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    border: 4px solid #ff4b4b;
    box-shadow: 5px 5px 0px #ff4b4b;
  }

  /* Main Layout */
  .brutal-main {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 2.5rem;
    align-items: start;
  }

  .calc-body {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #0ea5e9;
  }
  .bg-pink {
    background: #ff7be5;
  }
  .text-white {
    color: #fff;
  }

  .pane-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Gender Switch */
  .gender-switch {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .gender-label {
    font-size: 0.85rem;
    font-weight: 800;
  }
  .gender-btn {
    background: #fff;
    border: 3px solid #111;
    padding: 0.3rem 0.8rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .gender-btn:hover:not(.active) {
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #111;
  }
  .gender-btn.active {
    background: #111;
    color: #ffd900;
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 transparent;
  }

  /* Screen */
  .screen-body {
    padding: 2rem 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
    min-height: 150px;
    justify-content: flex-end;
    background: #fdfae5;
  }

  .expression-line {
    font-weight: 700;
    color: #888;
    font-size: 1.2rem;
    text-align: right;
    width: 100%;
    word-break: break-all;
  }

  .result-line {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 4.5rem;
    font-weight: 900;
    color: #111;
    text-align: right;
    width: 100%;
    word-break: break-all;
    line-height: 1.1;
    text-shadow: 3px 3px 0px #ffd900;
    transition: all 0.3s;
  }

  .result-line.unknown {
    font-size: 2.5rem;
    color: #ccc;
    text-shadow: none;
  }

  /* Chain Detail Tags */
  .chain-detail {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
    justify-content: flex-end;
  }
  .chain-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    border: 2px solid #111;
    padding: 2px 8px;
    background: #fff;
    box-shadow: 2px 2px 0px #111;
    font-size: 0.85rem;
    font-weight: 800;
  }
  .chain-key {
    color: #ff4b4b;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1rem;
  }
  .chain-arrow {
    color: #aaa;
    font-weight: 400;
  }
  .chain-val {
    color: #111;
  }

  /* Keyboard */
  .key-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }

  .key-btn {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.8rem;
    font-weight: 900;
    background: #fff;
    border: 2px solid #111;
    cursor: pointer;
    transition: all 0.1s;
    color: #111;
  }
  .key-btn:hover:not(:disabled) {
    background: #ffd900;
    transform: scale(1.05);
    z-index: 2;
    box-shadow: 4px 4px 0px #111;
  }
  .key-btn:active:not(:disabled) {
    background: #111;
    color: #fff;
    transform: scale(0.95);
    box-shadow: 0 0 0 transparent;
  }

  .key-disabled {
    opacity: 0.2;
    cursor: not-allowed !important;
    background: #eee;
  }
  .key-disabled:hover {
    background: #eee !important;
    transform: none !important;
    box-shadow: none !important;
  }

  .key-warn {
    background: #ffedd5;
    color: #f59e0b;
  }
  .key-warn:hover:not(:disabled) {
    background: #f59e0b !important;
    color: #111 !important;
  }

  .key-danger {
    background: #fee2e2;
    color: #ff4b4b;
  }
  .key-danger:hover:not(:disabled) {
    background: #ff4b4b !important;
    color: #fff !important;
  }

  /* Sidebar */
  .info-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  .sticky-pane {
    position: sticky;
    top: 2rem;
  }

  .guide-block {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .guide-step {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fff;
  }
  .step-num {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: #fff;
    background: #111;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .step-text {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .guide-example {
    border: 2px dashed #111;
    padding: 1.2rem;
    background: #fdfae5;
  }
  .example-title {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }
  .example-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .example-content p {
    margin: 0;
    font-weight: 700;
    font-size: 0.9rem;
    color: #444;
  }
  .example-content strong {
    color: #ff4b4b;
    font-size: 1.1rem;
  }

  .guide-tip {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    background: #111;
    color: #ffd900;
    font-weight: 800;
    font-size: 0.9rem;
    border: 3px solid #111;
  }
  .tip-icon {
    font-size: 1.5rem;
  }

  @media (max-width: 1024px) {
    .brutal-main {
      grid-template-columns: 1fr;
    }
    .sticky-pane {
      position: static;
    }
    .result-line {
      font-size: 3rem;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .badge {
    border-color: #eee;
    box-shadow: 5px 5px 0px #eee;
  }

  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #075985;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #9d174d;
    color: #fff;
  }

  [data-theme='dark'] .gender-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .gender-btn.active {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .screen-body {
    background: #222;
  }
  [data-theme='dark'] .expression-line {
    color: #888;
  }
  [data-theme='dark'] .result-line {
    color: #eee;
    text-shadow: 3px 3px 0px #b28f00;
  }
  [data-theme='dark'] .result-line.unknown {
    color: #555;
    text-shadow: none;
  }

  [data-theme='dark'] .chain-tag {
    background: #111;
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .chain-key {
    color: #ff9fb2;
  }
  [data-theme='dark'] .chain-val {
    color: #eee;
  }
  [data-theme='dark'] .chain-arrow {
    color: #666;
  }

  [data-theme='dark'] .key-btn {
    background: #1a1a1a;
    border-color: #555;
    color: #eee;
  }
  [data-theme='dark'] .key-btn:hover:not(:disabled) {
    background: #b28f00;
    color: #111;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .key-btn:active:not(:disabled) {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .key-disabled {
    background: #222;
    opacity: 0.2;
  }
  [data-theme='dark'] .key-warn {
    background: #7c2d12;
    color: #f59e0b;
  }
  [data-theme='dark'] .key-danger {
    background: #991b1b;
    color: #ff9fb2;
  }

  [data-theme='dark'] .guide-step {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .step-num {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .step-text {
    color: #eee;
  }
  [data-theme='dark'] .guide-example {
    background: #222;
    border-color: #eee;
  }
  [data-theme='dark'] .example-content p {
    color: #ccc;
  }
  [data-theme='dark'] .guide-tip {
    background: #eee;
    color: #111;
    border-color: #eee;
  }
</style>
