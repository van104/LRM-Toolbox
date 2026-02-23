<template>
  <!-- 外层容器：确保居中且具备最小高度，适应各种嵌套环境 -->
  <div
    class="flex items-center justify-center min-h-[600px] h-full w-full bg-slate-100/50 p-4 font-sans select-none"
  >
    <!-- 计算器主体：设定安全宽度，增加精致的阴影和圆角 -->
    <div
      class="w-full max-w-[360px] min-w-[320px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/80 overflow-hidden border border-slate-100 flex flex-col relative"
    >
      <!-- 顶部屏幕区域 -->
      <div
        class="bg-gradient-to-b from-slate-50 to-white px-6 pt-8 pb-4 flex flex-col gap-6 relative"
      >
        <!-- 视角切换控制栏 -->
        <div class="flex justify-between items-center w-full z-10">
          <span class="text-xs font-bold text-slate-400 tracking-wider">我的性别</span>
          <div class="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
            <button
              :class="
                myGender === 1
                  ? 'bg-white text-blue-500 shadow'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              "
              class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
              @click="setGender(1)"
            >
              男
            </button>
            <button
              :class="
                myGender === 0
                  ? 'bg-white text-rose-500 shadow'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              "
              class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300"
              @click="setGender(0)"
            >
              女
            </button>
          </div>
        </div>

        <!-- 结果展示区 -->
        <div class="flex flex-col items-end justify-end h-24 w-full">
          <div class="text-right text-slate-400 text-sm h-6 w-full truncate mb-1">
            {{ expressionText }}
          </div>
          <div
            class="text-right font-black tracking-tight w-full truncate transition-all duration-300 flex items-end justify-end"
            :class="
              resultText === '未知亲戚' ? 'text-3xl text-slate-300' : 'text-5xl text-slate-800'
            "
          >
            {{ resultText }}
          </div>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>

      <!-- 键盘区域 -->
      <div class="p-6 bg-white grid grid-cols-4 gap-3">
        <button
          v-for="btn in buttons"
          :key="btn.label"
          :disabled="btn.disabled"
          :class="[
            'h-16 flex items-center justify-center text-xl font-bold rounded-2xl transition-all duration-200',
            btn.disabled
              ? 'opacity-30 bg-slate-50 text-slate-400 cursor-not-allowed border border-transparent'
              : btn.colorClass ||
                'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95 border border-slate-100 shadow-sm hover:shadow active:shadow-none'
          ]"
          @click="btn.action"
        >
          {{ btn.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  // 初始状态：1 为男，0 为女
  const myGender = ref(1);
  const chain = ref([]);

  // 关系推导字典（覆盖主流场景）
  const relationDict = {
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

    // 2级 - 直系长辈
    '父,父': '爷爷',
    '父,母': '奶奶',
    '母,父': '外公',
    '母,母': '外婆',
    '夫,父': '公公',
    '夫,母': '婆婆',
    '妻,父': '岳父',
    '妻,母': '岳母',

    // 2级 - 旁系长辈
    '父,兄': '伯父',
    '父,弟': '叔叔',
    '父,姐': '姑妈',
    '父,妹': '姑姑',
    '母,兄': '舅舅',
    '母,弟': '舅舅',
    '母,姐': '大姨',
    '母,妹': '小姨',

    // 2级 - 平辈配偶与姻亲
    '兄,妻': '嫂子',
    '弟,妻': '弟妹',
    '姐,夫': '姐夫',
    '妹,夫': '妹夫',
    '夫,兄': '大伯子',
    '夫,弟': '小叔子',
    '夫,姐': '大姑子',
    '夫,妹': '小姑子',
    '妻,兄': '大舅子',
    '妻,弟': '小舅子',
    '妻,姐': '大姨子',
    '妻,妹': '小姨子',

    // 2级 - 晚辈
    '子,子': '孙子',
    '子,女': '孙女',
    '女,子': '外孙',
    '女,女': '外孙女',
    '兄,子': '侄子',
    '弟,子': '侄子',
    '兄,女': '侄女',
    '弟,女': '侄女',
    '姐,子': '外甥',
    '妹,子': '外甥',
    '姐,女': '外甥女',
    '妹,女': '外甥女',

    // 继子/继女 简化
    '夫,子': '儿子',
    '夫,女': '女儿',
    '妻,子': '儿子',
    '妻,女': '女儿',

    // 逻辑闭环（父母的配偶、兄弟姐妹的父母）
    '父,妻': '妈妈',
    '母,夫': '爸爸',
    '兄,父': '爸爸',
    '弟,父': '爸爸',
    '姐,父': '爸爸',
    '妹,父': '爸爸',
    '兄,母': '妈妈',
    '弟,母': '妈妈',
    '姐,母': '妈妈',
    '妹,母': '妈妈',

    // 3级 - 长辈的配偶
    '父,兄,妻': '伯母',
    '父,弟,妻': '婶婶',
    '父,姐,夫': '姑父',
    '父,妹,夫': '姑父',
    '母,兄,妻': '舅妈',
    '母,弟,妻': '舅妈',
    '母,姐,夫': '姨父',
    '母,妹,夫': '姨父',

    // 3级 - 曾祖辈
    '父,父,父': '太爷爷',
    '父,父,母': '太奶奶',
    '母,母,父': '太外公',
    '母,母,母': '太外婆',
    '父,母,父': '太外公',
    '父,母,母': '太外婆',
    '母,父,父': '太爷爷',
    '母,父,母': '太奶奶',

    // 3级 - 旁系长辈扩展 (伯祖父/舅公等)
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
    '母,父,妹': '姑婆'
  };

  // 动态推断当前节点的性别（决定是否能点击“夫”或“妻”）
  const currentGender = computed(() => {
    if (chain.value.length === 0) return myGender.value;
    const last = chain.value[chain.value.length - 1];
    if (['父', '兄', '弟', '子', '夫'].includes(last)) return 1; // 链条末端是男性
    if (['母', '姐', '妹', '女', '妻'].includes(last)) return 0; // 链条末端是女性
    return -1;
  });

  // 计算键盘按钮属性
  const buttons = computed(() => [
    { label: '父', action: () => append('父') },
    { label: '母', action: () => append('母') },
    // 如果当前是男性，无法点击“夫”
    { label: '夫', action: () => append('夫'), disabled: currentGender.value === 1 },
    // 如果当前是女性，无法点击“妻”
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
      colorClass:
        'bg-orange-50 text-orange-500 hover:bg-orange-100 active:scale-95 border border-orange-100 shadow-sm hover:shadow'
    },
    {
      label: 'C',
      action: clear,
      colorClass:
        'bg-rose-50 text-rose-500 hover:bg-rose-100 active:scale-95 border border-rose-100 shadow-sm hover:shadow'
    }
  ]);

  // 操作逻辑
  const setGender = gender => {
    myGender.value = gender;
    chain.value = [];
  };

  const append = relation => {
    chain.value.push(relation);
  };

  const backspace = () => {
    chain.value.pop();
  };

  const clear = () => {
    chain.value = [];
  };

  // 显示格式化
  const expressionText = computed(() => {
    if (chain.value.length === 0) return '我';
    return '我 的 ' + chain.value.join(' 的 ');
  });

  const resultText = computed(() => {
    if (chain.value.length === 0) return '我';
    const key = chain.value.join(',');
    return relationDict[key] || '未知亲戚';
  });
</script>
