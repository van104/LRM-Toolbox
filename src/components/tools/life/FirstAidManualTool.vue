<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">急救<span>.手册()</span></h1>
        <div style="width: 120px"></div>
      </header>

      <!-- Search -->
      <div class="brutal-toolbar">
        <div class="tools-left" style="flex: 1">
          <input
            v-model="keyword"
            class="brutal-input full"
            placeholder="搜索急救主题（如：烫伤、CPR...）"
          />
        </div>
      </div>

      <!-- Topic Grid -->
      <div v-if="!selectedTopic" class="topics-grid">
        <div
          v-for="topic in filteredTopics"
          :key="topic.id"
          class="brutal-pane topic-card"
          @click="selectedTopic = topic"
        >
          <div class="pane-header" :class="topic.headerColor">
            <span>{{ topic.emoji }} {{ topic.title }}</span>
          </div>
          <div class="topic-body">
            <p>{{ topic.desc }}</p>
            <span class="step-count">{{ topic.steps.length }} 步骤 →</span>
          </div>
        </div>
      </div>

      <!-- Detail View -->
      <div v-else class="brutal-pane detail-pane">
        <div class="pane-header bg-pink">
          <span class="text-white">{{ selectedTopic.emoji }} {{ selectedTopic.title }}</span>
          <div class="pane-actions">
            <button @click="selectedTopic = null">← 返回列表</button>
          </div>
        </div>

        <div class="detail-body">
          <div class="warning-box">
            <span class="warn-icon">⚠</span>
            <span>注意：本指南仅供参考，紧急情况请立即拨打 <b>120</b> 急救电话。</span>
          </div>

          <div class="steps-list">
            <div v-for="(step, index) in selectedTopic.steps" :key="index" class="step-item">
              <div class="step-num">{{ index + 1 }}</div>
              <div class="step-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="brutal-status info">
        <div class="marquee-wrapper">
          <div class="marquee-content">
            <span v-for="i in 10" :key="i">© 2026 LRM工具箱 - 家庭急救手册 // &nbsp;</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const keyword = ref('');
  const selectedTopic = ref(null);

  const topics = [
    {
      id: 'cpr',
      emoji: '🫀',
      title: '心肺复苏 (CPR)',
      headerColor: 'bg-pink',
      desc: '当发现有人心脏骤停（无反应、无呼吸）时使用',
      steps: [
        {
          title: '判断反应',
          desc: '轻拍双肩，大声呼喊。如果无反应且无呼吸（或仅有濒死喘息），立即行动。'
        },
        { title: '呼救求助', desc: '指定旁人拨打120，并寻找附近的AED（自动体外除颤器）。' },
        {
          title: '胸外按压',
          desc: '双手交叠，掌根置于胸骨下半部（两乳头连线中点）。垂直向下按压，深度5-6厘米，频率100-120次/分。'
        },
        {
          title: '人工呼吸',
          desc: '按压30次后，清理口腔异物，捏住鼻孔，口对口吹气2次（每次吹气持续1秒，见胸廓起伏）。'
        },
        {
          title: '持续循环',
          desc: '持续进行30次按压+2次人工呼吸，直到急救人员到达或患者恢复自主呼吸。'
        }
      ]
    },
    {
      id: 'choking',
      emoji: '🍉',
      title: '海姆立克急救法',
      headerColor: 'bg-yellow',
      desc: '用于气管异物梗阻（噎食）',
      steps: [
        { title: '判断征兆', desc: '患者双手掐脖子，无法说话、咳嗽或呼吸，面色发紫。' },
        { title: '站位姿势', desc: '站在患者身后，双脚成弓步，前腿置于患者双腿之间以稳固重心。' },
        { title: '手部定位', desc: '一手握拳，拇指侧顶住患者腹部（肚脐上方两指处）。' },
        { title: '冲击腹部', desc: '另一手包住拳头，快速向内、向上冲击腹部。重复直至异物排出。' },
        { title: '婴儿处理', desc: '对于婴儿，应交替进行5次背部拍击和5次胸部按压，切勿挤压腹部。' }
      ]
    },
    {
      id: 'burn',
      emoji: '🔥',
      title: '烧烫伤',
      headerColor: 'bg-orange',
      desc: '热液、火焰或高温物体引起的皮肤损伤',
      steps: [
        {
          title: '冲',
          desc: '立即用流动冷水冲洗伤口15-30分钟，直到疼痛缓解。切勿使用冰块直接冰敷。'
        },
        {
          title: '脱',
          desc: '在冷水中小心除去伤口周围衣物。如衣物粘连在皮肤上，切勿强行撕扯，应剪开衣物。'
        },
        { title: '泡', desc: '继续在冷水中浸泡15-30分钟。' },
        { title: '盖', desc: '用干净的纱布或棉布覆盖伤口，保护创面。切勿涂抹牙膏、酱油等土方。' },
        { title: '送', desc: '如伤势严重（大面积、深层烧伤或发生在面部、关节等），立即送医。' }
      ]
    },
    {
      id: 'nosebleed',
      emoji: '🩸',
      title: '流鼻血',
      headerColor: 'bg-green',
      desc: '鼻腔毛细血管破裂出血',
      steps: [
        {
          title: '前倾坐姿',
          desc: '坐下，身体稍向前倾。切勿仰头，以免血液倒流引起呛咳或吞入胃部。'
        },
        { title: '压迫止血', desc: '用手指捏住鼻翼两侧（鼻骨下方软骨部位）10-15分钟。' },
        { title: '冷敷', desc: '用冰袋或冷毛巾敷在前额或后颈部，帮助血管收缩。' },
        { title: '就医', desc: '如按压15分钟仍未止血，或出血量大、频繁发作，应及时就医。' }
      ]
    },
    {
      id: 'emergency-call',
      emoji: '📞',
      title: '拨打120须知',
      headerColor: 'bg-blue',
      desc: '如何高效拨打急救电话',
      steps: [
        { title: '保持镇定', desc: '尽量控制情绪，清晰回答调度员的问题。' },
        { title: '说清地址', desc: '准确告知所在街道、小区、楼号、门牌号，或明显的标志性建筑。' },
        {
          title: '描述病情',
          desc: '简要说明患者主要症状（如昏迷、胸痛、外伤出血等）、人数及大致年龄。'
        },
        { title: '保持畅通', desc: '留下联系电话，并保持通话畅通，以便急救人员联系。' },
        { title: '派人接车', desc: '最好派人在路口或小区门口等待救护车引导。' }
      ]
    }
  ];

  const filteredTopics = computed(() => {
    if (!keyword.value) return topics;
    const k = keyword.value.toLowerCase();
    return topics.filter(
      t => t.title.toLowerCase().includes(k) || t.desc.toLowerCase().includes(k)
    );
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
    background-position: -2px -2px;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    color: #111;
  }
  .brutal-container {
    max-width: 900px;
    margin: 0 auto;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3rem;
    font-weight: 800;
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
    font-size: 1.25rem;
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

  .brutal-toolbar {
    display: flex;
    background: #fff;
    border: 4px solid #111;
    padding: 1rem;
    margin-bottom: 2rem;
    box-shadow: 8px 8px 0px #111;
  }
  .tools-left {
    display: flex;
    gap: 1rem;
    width: 100%;
  }

  .brutal-input {
    border: 3px solid #111;
    padding: 0.7rem 1rem;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 1rem;
    background: #fff;
    box-shadow: 3px 3px 0px #111;
    outline: none;
  }
  .brutal-input.full {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
  }

  /* Topics Grid */
  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2.5rem;
  }

  .brutal-pane {
    background: #fff;
    border: 4px solid #111;
    box-shadow: 10px 10px 0px #111;
    transition: all 0.15s;
    display: flex;
    flex-direction: column;
    cursor: pointer;
  }
  .brutal-pane:hover {
    transform: translate(-4px, -4px);
    box-shadow: 14px 14px 0px #111;
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
  .pane-actions {
    display: flex;
    gap: 0.5rem;
  }
  .pane-actions button {
    background: #fff;
    color: #111;
    border: 3px solid #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-weight: 600;
    font-size: 0.9rem;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    box-shadow: 3px 3px 0px #111;
    transition: all 0.1s;
  }
  .pane-actions button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 5px 5px 0px #111;
  }
  .pane-actions button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .bg-yellow {
    background: #ffd900;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .bg-green {
    background: #00e572;
  }
  .bg-pink {
    background: #ff4b4b;
    color: #fff;
  }
  .bg-orange {
    background: #ffba6b;
  }
  .text-white {
    color: #fff;
  }

  .topic-body {
    padding: 1.25rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .topic-body p {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: #555;
    font-weight: 600;
    line-height: 1.5;
  }
  .step-count {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    color: #4b7bff;
  }

  /* Detail */
  .detail-pane {
    cursor: default;
    margin-bottom: 2.5rem;
  }
  .detail-body {
    padding: 1.5rem;
  }

  .warning-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #ffd900;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    padding: 1rem;
    margin-bottom: 2rem;
    font-weight: 700;
    font-size: 0.9rem;
  }
  .warn-icon {
    font-size: 1.5rem;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .step-item {
    display: flex;
    gap: 1.25rem;
    padding: 1.25rem;
    border: 3px solid #111;
    box-shadow: 4px 4px 0px #111;
    background: #fdfae5;
    transition: all 0.1s;
  }
  .step-item:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .step-num {
    width: 40px;
    height: 40px;
    background: #ff4b4b;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 3px solid #111;
  }
  .step-content h4 {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    margin: 0 0 0.5rem;
    color: #111;
  }
  .step-content p {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    line-height: 1.6;
    font-weight: 500;
  }

  /* Status */
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

  @media (max-width: 700px) {
    .brutal-title {
      font-size: 2rem;
    }
    .topics-grid {
      grid-template-columns: 1fr;
    }
    .brutal-header {
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
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
  [data-theme='dark'] .brutal-toolbar,
  [data-theme='dark'] .brutal-status {
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
  [data-theme='dark'] .brutal-toolbar {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane:hover {
    box-shadow: 14px 14px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
    color: #111;
  }
  [data-theme='dark'] .pane-actions button {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 3px 3px 0px #eee;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    box-shadow: 3px 3px 0px #eee;
    color: #eee;
  }
  [data-theme='dark'] .topic-body p {
    color: #aaa;
  }
  [data-theme='dark'] .step-count {
    color: #89b4f8;
  }
  [data-theme='dark'] .warning-box {
    background: #b28f00;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
    color: #fff;
  }
  [data-theme='dark'] .step-item {
    background: #222;
    border-color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .step-item:hover {
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .step-num {
    background: #cc0000;
    border-color: #eee;
  }
  [data-theme='dark'] .step-content h4 {
    color: #eee;
  }
  [data-theme='dark'] .step-content p {
    color: #aaa;
  }
  [data-theme='dark'] .brutal-status {
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .bg-yellow {
    background: #b28f00;
    color: #fff;
  }
  [data-theme='dark'] .bg-blue {
    background: #2a4eb2;
    color: #fff;
  }
  [data-theme='dark'] .bg-green {
    background: #00994c;
    color: #fff;
  }
  [data-theme='dark'] .bg-pink {
    background: #cc0000;
    color: #fff;
  }
  [data-theme='dark'] .bg-orange {
    background: #a07040;
    color: #fff;
  }
</style>
