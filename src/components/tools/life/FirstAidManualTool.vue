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
        <h1 class="tool-title">家庭急救手册</h1>
        <span class="tool-subtitle">First Aid Manual</span>
      </div>
      <div class="header-right">
        <!-- 占位 -->
      </div>
    </header>

    <main class="tool-content">
      <div class="first-aid-tool">
        <div class="search-bar">
          <el-input
            v-model="keyword"
            placeholder="搜索急救主题（如：烫伤、CPR...）"
            size="large"
            :prefix-icon="Search"
            clearable
          />
        </div>

        <div v-if="!selectedTopic" class="topics-grid">
          <div
            v-for="topic in filteredTopics"
            :key="topic.id"
            class="topic-card glass"
            @click="selectedTopic = topic"
          >
            <div class="topic-icon" :style="{ backgroundColor: topic.color }">
              <el-icon color="#fff" :size="24"><component :is="topic.icon" /></el-icon>
            </div>
            <div class="topic-info">
              <h3>{{ topic.title }}</h3>
              <p>{{ topic.desc }}</p>
            </div>
          </div>
        </div>

        <div v-else class="topic-detail glass">
          <div class="detail-header">
            <el-button link @click="selectedTopic = null">
              <el-icon><Back /></el-icon> 返回列表
            </el-button>
            <h2>{{ selectedTopic.title }}</h2>
          </div>

          <div class="detail-content">
            <div class="warning-box">
              <el-icon><Warning /></el-icon>
              <span>注意：本指南仅供参考，紧急情况请立即拨打 120 急救电话。</span>
            </div>

            <div class="steps-container">
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
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 家庭急救手册</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { Component } from 'vue';
  import {
    ArrowLeft,
    Search,
    FirstAidKit,
    Warning,
    Back,
    Watermelon,
    Phone,
    Sunny,
    Star
  } from '@element-plus/icons-vue';

  interface Step {
    title: string;
    desc: string;
  }

  interface Topic {
    id: string;
    title: string;
    desc: string;
    icon: Component;
    color: string;
    steps: Step[];
  }

  const keyword = ref('');
  const selectedTopic = ref<Topic | null>(null);

  const topics: Topic[] = [
    {
      id: 'cpr',
      title: '心肺复苏 (CPR)',
      desc: '当发现有人心脏骤停（无反应、无呼吸）时使用',
      icon: FirstAidKit,
      color: '#ff5f56',
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
      title: '海姆立克急救法',
      desc: '用于气管异物梗阻（噎食）',
      icon: Watermelon,
      color: '#ffbd2e',
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
      title: '烧烫伤',
      desc: '热液、火焰或高温物体引起的皮肤损伤',
      icon: Sunny,
      color: '#ff7675',
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
      title: '流鼻血',
      desc: '鼻腔毛细血管破裂出血',
      icon: Star,
      color: '#fd79a8',
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
      title: '拨打120须知',
      desc: '如何高效拨打急救电话',
      icon: Phone,
      color: '#0984e3',
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

  .first-aid-tool {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .topic-card {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s;
  }

  .topic-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  }

  .topic-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    flex-shrink: 0;
  }

  .topic-info h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 5px;
    color: #2c3e50;
  }

  .topic-info p {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
  }

  .topic-detail {
    padding: 30px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }

  .detail-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #2c3e50;
  }

  .warning-box {
    background: #fff5f5;
    color: #e17055;
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    margin-bottom: 30px;
    border: 1px solid #fab1a0;
  }

  .steps-container {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .step-item {
    display: flex;
    gap: 20px;
  }

  .step-num {
    width: 32px;
    height: 32px;
    background: #e17055;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .step-content h4 {
    font-size: 1.1rem;
    margin: 0 0 8px;
    color: #2d3436;
  }

  .step-content p {
    margin: 0;
    color: #636e72;
    line-height: 1.6;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }
</style>
