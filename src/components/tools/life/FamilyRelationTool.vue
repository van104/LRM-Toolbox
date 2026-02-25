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

          <!-- 新功能: 反向查询 -->
          <div class="brutal-pane reverse-pane">
            <div class="pane-header bg-green">
              <span>🔍 反向查询 (输入称呼 → 知道关系)</span>
            </div>
            <div class="pane-body reverse-body">
              <div class="reverse-input-wrap">
                <input
                  v-model="reverseQuery"
                  type="text"
                  class="brutal-input reverse-input"
                  placeholder="输入称呼，如：伯母、姑父、外甥..."
                  @input="handleReverseSearch"
                />
                <button v-if="reverseQuery" class="clear-btn" @click="clearReverse">✖</button>
              </div>

              <div v-if="reverseResults.length > 0" class="reverse-results">
                <div
                  v-for="(item, idx) in reverseResults"
                  :key="idx"
                  class="reverse-item"
                  @click="applyReverseResult(item)"
                >
                  <div class="reverse-title">{{ item.title }}</div>
                  <div class="reverse-chain">
                    <span class="chain-start">我</span>
                    <template v-for="(step, si) in item.chain" :key="si">
                      <span class="chain-arrow-icon">→</span>
                      <span class="chain-step">{{ getStepLabel(step) }}</span>
                    </template>
                    <span class="chain-arrow-icon">=</span>
                    <span class="chain-result">{{ item.title }}</span>
                  </div>
                </div>
              </div>
              <div v-else-if="reverseQuery && reverseQuery.length >= 1" class="reverse-empty">
                未找到相关称呼 🧐
              </div>
            </div>
          </div>

          <!-- 新功能: 常用预设 -->
          <div class="brutal-pane preset-pane">
            <div class="pane-header bg-orange">
              <span>⚡ 常用称呼 (一键查询)</span>
            </div>
            <div class="pane-body">
              <div class="preset-grid">
                <button
                  v-for="preset in filteredPresets"
                  :key="preset.label + preset.chain.join()"
                  class="preset-btn"
                  :class="{ 'preset-active': isPresetActive(preset) }"
                  @click="applyPreset(preset)"
                >
                  <span class="preset-emoji">{{ preset.emoji }}</span>
                  <span class="preset-label">{{ preset.label }}</span>
                </button>
              </div>
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

              <div class="guide-new">
                <div class="example-title">🆕 新功能</div>
                <div class="example-content">
                  <p>🔍 <strong>反向查询</strong>：输入称呼查对应关系链</p>
                  <p>⚡ <strong>常用预设</strong>：过年常用称呼一键生成</p>
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
    '父,父': '爷爷',
    '父,母': '奶奶',
    '母,父': '外公',
    '母,母': '外婆',
    '父,妻': '妈妈',
    '母,夫': '爸爸',
    '父,兄': '伯父',
    '父,弟': '叔叔',
    '父,姐': '姑妈',
    '父,妹': '姑姑',
    '母,兄': '舅舅',
    '母,弟': '舅舅',
    '母,姐': '大姨',
    '母,妹': '小姨',
    '父,子': '兄弟',
    '父,女': '姐妹',
    '母,子': '兄弟',
    '母,女': '姐妹',

    // ========== 表2: 配偶的亲属（夫、妻） ==========
    '夫,父': '公公',
    '夫,母': '婆婆',
    '妻,父': '岳父',
    '妻,母': '岳母',
    '夫,妻': '自己',
    '妻,夫': '自己',
    '夫,兄': '大伯子',
    '夫,弟': '小叔子',
    '夫,姐': '大姑子',
    '夫,妹': '小姑子',
    '妻,兄': '大舅子',
    '妻,弟': '小舅子',
    '妻,姐': '大姨子',
    '妻,妹': '小姨子',
    '夫,子': '儿子',
    '夫,女': '女儿',
    '妻,子': '儿子',
    '妻,女': '女儿',

    // ========== 表3: 平辈的亲属（兄、弟、姐、妹） ==========
    '兄,妻': '嫂子',
    '弟,妻': '弟妹',
    '姐,夫': '姐夫',
    '妹,夫': '妹夫',
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
    '兄,父': '爸爸',
    '弟,父': '爸爸',
    '姐,父': '爸爸',
    '妹,父': '爸爸',
    '兄,母': '妈妈',
    '弟,母': '妈妈',
    '姐,母': '妈妈',
    '妹,母': '妈妈',
    '兄,子': '侄子',
    '弟,子': '侄子',
    '兄,女': '侄女',
    '弟,女': '侄女',
    '姐,子': '外甥',
    '妹,子': '外甥',
    '姐,女': '外甥女',
    '妹,女': '外甥女',

    // ========== 表4: 晚辈的亲属（子、女） ==========
    '子,妻': '儿媳妇',
    '女,夫': '女婿',
    '子,父': '自己',
    '子,母': '老婆',
    '女,父': '自己',
    '女,母': '老婆',
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
    '女,子,女': '曾孙女',

    // ========== 3级 - 堂表亲 ==========
    '父,兄,子': '堂哥/堂弟',
    '父,兄,女': '堂姐/堂妹',
    '父,弟,子': '堂哥/堂弟',
    '父,弟,女': '堂姐/堂妹',
    '父,姐,子': '表哥/表弟',
    '父,姐,女': '表姐/表妹',
    '父,妹,子': '表哥/表弟',
    '父,妹,女': '表姐/表妹',
    '母,兄,子': '表哥/表弟',
    '母,兄,女': '表姐/表妹',
    '母,弟,子': '表哥/表弟',
    '母,弟,女': '表姐/表妹',
    '母,姐,子': '表哥/表弟',
    '母,姐,女': '表姐/表妹',
    '母,妹,子': '表哥/表弟',
    '母,妹,女': '表姐/表妹'
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

  const getStepLabel = (step: string) => labelMap[step] || step;

  const expressionText = computed(() => {
    if (chain.value.length === 0) return '我';
    const labels = chain.value.map(k => labelMap[k] || k);
    return '我 的 ' + labels.join(' 的 ');
  });

  // 性别感知的结果
  const genderAwareResults: Record<string, { male: string; female: string }> = {
    '父,子': { male: '兄弟或自己', female: '哥哥或弟弟' },
    '父,女': { male: '姐姐或妹妹', female: '姐妹或自己' },
    '母,子': { male: '兄弟或自己', female: '哥哥或弟弟' },
    '母,女': { male: '姐姐或妹妹', female: '姐妹或自己' },
    '子,父': { male: '自己', female: '老公' },
    '子,母': { male: '老婆', female: '自己' },
    '女,父': { male: '自己', female: '老公' },
    '女,母': { male: '老婆', female: '自己' },
    '兄,弟': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '弟,兄': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '姐,弟': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '妹,兄': { male: '哥哥、弟弟或自己', female: '哥哥或弟弟' },
    '姐,妹': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' },
    '妹,姐': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' },
    '兄,妹': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' },
    '弟,姐': { male: '姐姐或妹妹', female: '姐姐、妹妹或自己' }
  };

  const resultText = computed(() => {
    if (chain.value.length === 0) return '我';
    const key = chain.value.join(',');
    const genderResult = genderAwareResults[key];
    if (genderResult) {
      return myGender.value === 1 ? genderResult.male : genderResult.female;
    }
    return relationDict[key] || '未知亲戚';
  });

  // ============ 反向查询功能 ============
  interface ReverseResult {
    title: string;
    chain: string[];
    key: string;
  }

  const reverseQuery = ref('');
  const reverseResults = ref<ReverseResult[]>([]);

  // 构建反向索引：称呼 → 关系链列表
  const buildReverseIndex = (): Record<string, ReverseResult[]> => {
    const index: Record<string, ReverseResult[]> = {};
    for (const [key, val] of Object.entries(relationDict)) {
      // 跳过一些不太有意义的映射
      if (['自己', '兄弟', '姐妹'].includes(val)) continue;
      const chainArr = key.split(',');
      if (!index[val]) index[val] = [];
      // 去重
      const exists = index[val].some(r => r.key === key);
      if (!exists) {
        index[val].push({ title: val, chain: chainArr, key });
      }
    }
    return index;
  };

  const reverseIndex = buildReverseIndex();

  const handleReverseSearch = () => {
    const q = reverseQuery.value.trim();
    if (!q) {
      reverseResults.value = [];
      return;
    }
    const results: ReverseResult[] = [];
    for (const [title, items] of Object.entries(reverseIndex)) {
      if (title.includes(q)) {
        results.push(...items);
      }
    }
    // 按关系链长度排序（短的在前）
    results.sort((a, b) => a.chain.length - b.chain.length);
    reverseResults.value = results.slice(0, 20);
  };

  const clearReverse = () => {
    reverseQuery.value = '';
    reverseResults.value = [];
  };

  const applyReverseResult = (item: ReverseResult) => {
    chain.value = [...item.chain];
    // 滚动到顶部计算器区域
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============ 常用预设功能 ============
  // gender: 'both' = 男女通用, 'male' = 仅男性, 'female' = 仅女性
  interface Preset {
    label: string;
    emoji: string;
    chain: string[];
    gender: 'both' | 'male' | 'female';
  }

  const presets: Preset[] = [
    // 通用长辈
    { label: '爷爷', emoji: '👴', chain: ['父', '父'], gender: 'both' },
    { label: '奶奶', emoji: '👵', chain: ['父', '母'], gender: 'both' },
    { label: '外公', emoji: '👴', chain: ['母', '父'], gender: 'both' },
    { label: '外婆', emoji: '👵', chain: ['母', '母'], gender: 'both' },
    { label: '伯父', emoji: '👨', chain: ['父', '兄'], gender: 'both' },
    { label: '伯母', emoji: '👩', chain: ['父', '兄', '妻'], gender: 'both' },
    { label: '叔叔', emoji: '👨', chain: ['父', '弟'], gender: 'both' },
    { label: '婶婶', emoji: '👩', chain: ['父', '弟', '妻'], gender: 'both' },
    { label: '舅舅', emoji: '👨', chain: ['母', '兄'], gender: 'both' },
    { label: '舅妈', emoji: '👩', chain: ['母', '兄', '妻'], gender: 'both' },
    { label: '姑姑', emoji: '👩', chain: ['父', '妹'], gender: 'both' },
    { label: '姑父', emoji: '👨', chain: ['父', '妹', '夫'], gender: 'both' },
    { label: '大姨', emoji: '👩', chain: ['母', '姐'], gender: 'both' },
    { label: '小姨', emoji: '👩', chain: ['母', '妹'], gender: 'both' },
    { label: '姨父', emoji: '👨', chain: ['母', '姐', '夫'], gender: 'both' },
    // 通用平辈/晚辈
    { label: '侄子', emoji: '👦', chain: ['兄', '子'], gender: 'both' },
    { label: '侄女', emoji: '👧', chain: ['兄', '女'], gender: 'both' },
    { label: '外甥', emoji: '👦', chain: ['姐', '子'], gender: 'both' },
    { label: '外甥女', emoji: '👧', chain: ['姐', '女'], gender: 'both' },
    { label: '嫂子', emoji: '👩', chain: ['兄', '妻'], gender: 'both' },
    { label: '姐夫', emoji: '👨', chain: ['姐', '夫'], gender: 'both' },
    { label: '孙子', emoji: '👶', chain: ['子', '子'], gender: 'both' },
    { label: '孙女', emoji: '👶', chain: ['子', '女'], gender: 'both' },
    { label: '外孙', emoji: '👶', chain: ['女', '子'], gender: 'both' },
    // 仅男性 (有"妻"链)
    { label: '岳父', emoji: '👴', chain: ['妻', '父'], gender: 'male' },
    { label: '岳母', emoji: '👵', chain: ['妻', '母'], gender: 'male' },
    { label: '大舅子', emoji: '👨', chain: ['妻', '兄'], gender: 'male' },
    { label: '小姨子', emoji: '👩', chain: ['妻', '妹'], gender: 'male' },
    { label: '儿媳', emoji: '👩', chain: ['子', '妻'], gender: 'male' },
    { label: '女婿', emoji: '👨', chain: ['女', '夫'], gender: 'male' },
    { label: '亲家公', emoji: '🤝', chain: ['子', '妻', '父'], gender: 'male' },
    { label: '亲家母', emoji: '🤝', chain: ['子', '妻', '母'], gender: 'male' },
    // 仅女性 (有"夫"链)
    { label: '公公', emoji: '👴', chain: ['夫', '父'], gender: 'female' },
    { label: '婆婆', emoji: '👵', chain: ['夫', '母'], gender: 'female' },
    { label: '大伯子', emoji: '👨', chain: ['夫', '兄'], gender: 'female' },
    { label: '小姑子', emoji: '👩', chain: ['夫', '妹'], gender: 'female' },
    { label: '儿媳', emoji: '👩', chain: ['子', '妻'], gender: 'female' },
    { label: '女婿', emoji: '👨', chain: ['女', '夫'], gender: 'female' },
    { label: '亲家公', emoji: '🤝', chain: ['女', '夫', '父'], gender: 'female' },
    { label: '亲家母', emoji: '🤝', chain: ['女', '夫', '母'], gender: 'female' }
  ];

  // 根据当前性别筛选可用的预设
  const filteredPresets = computed(() => {
    return presets.filter(
      p =>
        p.gender === 'both' ||
        (myGender.value === 1 && p.gender === 'male') ||
        (myGender.value === 0 && p.gender === 'female')
    );
  });

  const applyPreset = (preset: Preset) => {
    chain.value = [...preset.chain];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPresetActive = (preset: Preset) => {
    return chain.value.join(',') === preset.chain.join(',');
  };
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
  .bg-green {
    background: #00e572;
  }
  .bg-orange {
    background: #ff9900;
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

  /* ========== 反向查询 ========== */
  .reverse-body {
    gap: 1rem;
  }
  .reverse-input-wrap {
    position: relative;
    display: flex;
  }
  .brutal-input {
    width: 100%;
    border: 4px solid #111;
    padding: 1rem 3rem 1rem 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 1.2rem;
    box-shadow: 4px 4px 0px #111;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
    color: #111;
    background: #fff;
  }
  .brutal-input:focus {
    background: #fdfae5;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .clear-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: #111;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .clear-btn:hover {
    background: #ff4b4b;
  }

  .reverse-results {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 350px;
    overflow-y: auto;
  }
  .reverse-item {
    border: 3px solid #111;
    padding: 1rem;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    transition: all 0.15s;
    background: #fff;
  }
  .reverse-item:hover {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .reverse-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }
  .reverse-chain {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    font-weight: 700;
    font-size: 0.95rem;
  }
  .chain-start {
    background: #111;
    color: #ffd900;
    padding: 2px 8px;
    font-weight: 900;
  }
  .chain-arrow-icon {
    color: #999;
    font-size: 1.2rem;
  }
  .chain-step {
    background: #fdfae5;
    border: 2px solid #111;
    padding: 2px 8px;
    font-weight: 800;
  }
  .chain-result {
    background: #ff4b4b;
    color: #fff;
    padding: 2px 10px;
    font-weight: 900;
    font-size: 1.05rem;
  }
  .reverse-empty {
    text-align: center;
    padding: 2rem;
    font-weight: 800;
    color: #888;
    border: 3px dashed #ccc;
  }

  /* ========== 常用预设 ========== */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    padding: 0.75rem 0.5rem;
    border: 3px solid #111;
    background: #fff;
    box-shadow: 4px 4px 0px #111;
    cursor: pointer;
    transition: all 0.15s;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
  }
  .preset-btn:hover {
    background: #ffd900;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }
  .preset-btn:active {
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .preset-btn.preset-active {
    background: #111;
    color: #ffd900;
    transform: translate(4px, 4px);
    box-shadow: 0 0 0 #111;
  }
  .preset-emoji {
    font-size: 1.5rem;
  }
  .preset-label {
    font-weight: 900;
    font-size: 0.95rem;
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

  .guide-example,
  .guide-new {
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
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-orange {
    background: #cc6600;
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
  [data-theme='dark'] .guide-example,
  [data-theme='dark'] .guide-new {
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

  /* Dark mode - Reverse Search */
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .brutal-input:focus {
    background: #333;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .clear-btn {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .clear-btn:hover {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .reverse-item {
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    background: #222;
  }
  [data-theme='dark'] .reverse-item:hover {
    background: #b28f00;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .chain-start {
    background: #eee;
    color: #111;
  }
  [data-theme='dark'] .chain-step {
    background: #333;
    border-color: #eee;
    color: #eee;
  }
  [data-theme='dark'] .reverse-empty {
    color: #aaa;
    border-color: #555;
  }

  /* Dark mode - Presets */
  [data-theme='dark'] .preset-btn {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .preset-btn:hover {
    background: #b28f00;
    color: #111;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .preset-btn.preset-active {
    background: #eee;
    color: #111;
  }
</style>
