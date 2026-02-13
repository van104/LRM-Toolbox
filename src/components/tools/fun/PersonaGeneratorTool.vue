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
        <h1 class="tool-title">随机身份生成器</h1>
        <span class="tool-subtitle">Random Persona Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="generatePersona">
          <el-icon><RefreshRight /></el-icon> 刷新人设
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <aside class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><Setting /></el-icon> 生成配置
            </h2>

            <div class="config-item">
              <label class="section-label">世界观背景</label>
              <el-select v-model="config.background" class="w-full">
                <el-option label="现代都市" value="modern" />
                <el-option label="西方奇幻" value="fantasy" />
                <el-option label="赛博朋克" value="cyberpunk" />
                <el-option label="武侠江湖" value="wuxia" />
                <el-option label="科幻未来" value="scifi" />
              </el-select>
            </div>

            <div class="config-item">
              <label class="section-label">性别倾向</label>
              <el-radio-group v-model="config.gender" class="w-full">
                <el-radio-button label="random">随机</el-radio-button>
                <el-radio-button label="male">男</el-radio-button>
                <el-radio-button label="female">女</el-radio-button>
              </el-radio-group>
            </div>

            <p class="instruction-text mt-6">
              点击“刷新人设”生成新的详细背景，也可点击属性旁的“锁定”保持该项不变。
            </p>
          </div>
        </aside>

        <div class="tool-main">
          <div v-if="!persona" class="empty-state glass-card">
            <el-empty description="点击右上角按钮生成你的第一个角色人设" />
          </div>

          <div v-else class="persona-card glass-card animate-fade-in">
            <div class="persona-header">
              <div class="main-info">
                <h2 class="persona-name">{{ persona.name }}</h2>
                <div class="tags">
                  <el-tag size="small">{{ persona.age }}岁</el-tag>
                  <el-tag size="small" type="success">{{ persona.gender }}</el-tag>
                  <el-tag v-if="persona.mbti" size="small" type="warning">{{
                    persona.mbti
                  }}</el-tag>
                </div>
              </div>
              <div class="header-action">
                <el-button link @click="copyPersonaText">复制文字</el-button>
              </div>
            </div>

            <div class="persona-grid mt-6">
              <div class="info-section">
                <h3 class="info-title">核心特征</h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">背景身份</span>
                    <span class="val">{{ persona.identity }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">性格倾向</span>
                    <span class="val">{{ persona.personality }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">外貌特征</span>
                    <span class="val">{{ persona.appearance }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h3 class="info-title">深度设定</h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">核心动机</span>
                    <span class="val">{{ persona.motivation }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">致命缺点</span>
                    <span class="val">{{ persona.weakness }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">隐秘癖好</span>
                    <span class="val">{{ persona.hobby }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="persona-story mt-8">
              <h3 class="info-title">一句话概括</h3>
              <p class="summary-text">“{{ persona.summary }}”</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 随机身份生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { ArrowLeft, Setting, RefreshRight } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const config = reactive({
    background: 'modern',
    gender: 'random'
  });

  interface Persona {
    name: string;
    gender: string;
    age: number;
    mbti: string;
    identity: string;
    personality: string;
    appearance: string;
    motivation: string;
    weakness: string;
    hobby: string;
    summary: string;
  }

  const persona = ref<Persona | null>(null);

  const dataPool = {
    modern: {
      identities: [
        '互联网外包员工',
        '全职博主',
        '私人侦探',
        '三线小演员',
        '心理咨询师',
        '夜市摊主',
        '遗产继承人'
      ],
      personalities: [
        '外冷内热，极度社恐',
        '充满活力，但缺乏耐心',
        '逻辑严密，追求绝对公平',
        '优雅从容的利己主义者',
        '悲观的理想主义'
      ],
      motivations: [
        '寻找失散多年的猫',
        '证明自己不是家族的耻辱',
        '存够买房的钱就回老家',
        '揭开城市的阴暗面'
      ],
      weaknesses: ['离开手机会产生强烈焦虑', '对数字极度不敏感', '同情心泛滥', '严重的拖延症'],
      summaries: [
        '在繁华都市中寻找消失的安全感。',
        '即使生活一团糟，也要保持发型的完美。',
        '相信每一块拼图都有其位置。'
      ]
    },
    fantasy: {
      identities: [
        '落魄贵族次子',
        '被驱逐的吟游诗人',
        '边境药剂学徒',
        '神秘的高塔占星师',
        '逃亡的半精灵佣兵',
        '退休的屠龙英雄'
      ],
      personalities: [
        '沉默如石，忠诚不二',
        '狡黠敏捷，信奉平衡',
        '对知识近乎病态的渴望',
        '总是带着淡淡的忧伤'
      ],
      motivations: [
        '恢复家族的荣光',
        '寻找传说中的永恒之树',
        '向那个背叛者的复仇',
        '仅仅是为了吃顿饱饭'
      ],
      weaknesses: ['无法抵御酒精的诱惑', '对魔法充满恐惧', '过分相信古老的预言', '方向感极差'],
      summaries: [
        '长剑虽已生锈，但心中的荣耀从未熄灭。',
        '在星辰中窥见未来的影子，却无法改变自己的命运。'
      ]
    },
    cyberpunk: {
      identities: [
        '地下诊所义体医生',
        '自由黑客',
        '垄断企业弃卒',
        '霓虹街头信息贩子',
        '机械植入体发烧友'
      ],
      personalities: [
        '愤世嫉俗，冷酷无情',
        '相信数据胜过人类',
        '在机械和肉体间挣扎的伪君子',
        '极度的实用主义'
      ],
      motivations: ['筹集购买最新核心的经费', '向企业霸权发起最后的冲锋', '寻找自己真实记忆的碎片'],
      weaknesses: ['脑机接口不稳定导致幻觉', '对复古物品有收集癖', '无法长时间处于自然光下'],
      summaries: ['高度发达的科技伴随着荒芜的灵魂。', '在层层模拟中寻找最后一点真理。']
    }
  };

  const namesMap = {
    male: ['林克', '维克多', '陈星', '雷蒙德', '奥德', '索恩', '杰克'],
    female: ['苏暖', '艾莉丝', '娜塔莎', '林清', '薇拉', '露西', '克洛伊']
  };

  const mbtis = ['INTJ', 'ENFP', 'INTP', 'INFJ', 'ISTJ', 'ESTP', 'ENTJ', 'ISFP'];

  const generatePersona = () => {
    const bg = dataPool[config.background as keyof typeof dataPool] || dataPool.modern;
    const gender =
      config.gender === 'random' ? (Math.random() > 0.5 ? 'male' : 'female') : config.gender;

    const firstName = namesMap[gender as keyof typeof namesMap][Math.floor(Math.random() * 7)];

    persona.value = {
      name: firstName,
      gender: gender === 'male' ? '男' : '女',
      age: 18 + Math.floor(Math.random() * 40),
      mbti: mbtis[Math.floor(Math.random() * mbtis.length)],
      identity: bg.identities[Math.floor(Math.random() * bg.identities.length)],
      personality: bg.personalities[Math.floor(Math.random() * bg.personalities.length)],
      appearance: [
        '利落短发, 总是背着一个磨损的皮包',
        '深邃的双眼, 右手虎口处有块伤疤',
        '嘴角常带嘲讽的笑意, 衣着考究',
        '身形消瘦, 眼神闪烁不安'
      ][Math.floor(Math.random() * 4)],
      motivation: bg.motivations[Math.floor(Math.random() * bg.motivations.length)],
      weakness: bg.weaknesses[Math.floor(Math.random() * bg.weaknesses.length)],
      hobby: [
        '深夜研究古董怀表',
        '在废弃工厂收集废铁',
        '给所有熟识的人起难以启齿的外号',
        '收藏不同年份的雨水'
      ][Math.floor(Math.random() * 4)],
      summary: bg.summaries[Math.floor(Math.random() * bg.summaries.length)]
    };
  };

  const copyPersonaText = () => {
    const p = persona.value;
    if (!p) return;
    const text = `角色设定：\n姓名：${p.name} (${p.gender})\n年龄：${p.age}\nMBTI：${p.mbti}\n身份：${p.identity}\n性格：${p.personality}\n外貌：${p.appearance}\n动机：${p.motivation}\n缺点：${p.weakness}\n癖好：${p.hobby}\n一句话：${p.summary}`;

    navigator.clipboard.writeText(text);
    ElMessage.success('人设文字已复制到剪贴板');
  };

  onMounted(() => {
    generatePersona();
  });
</script>

<style scoped>
  .tool-page {
    min-height: 100vh;
    background: #f8f9fa;
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
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .tool-layout {
      grid-template-columns: 1fr;
    }
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    padding: 24px;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .config-item {
    margin-bottom: 20px;
  }
  .section-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .instruction-text {
    font-size: 0.8rem;
    color: #94a3b8;
    line-height: 1.5;
  }

  .persona-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  .persona-name {
    font-size: 2rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0 0 8px 0;
  }
  .tags {
    display: flex;
    gap: 8px;
  }

  .persona-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  @media (max-width: 640px) {
    .persona-grid {
      grid-template-columns: 1fr;
    }
  }

  .info-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .info-item .label {
    font-size: 0.75rem;
    color: #64748b;
  }
  .info-item .val {
    font-size: 0.95rem;
    font-weight: 600;
    color: #334155;
  }

  .summary-text {
    font-size: 1.1rem;
    font-style: italic;
    color: #475569;
    line-height: 1.6;
  }

  .animate-fade-in {
    animation: fadeIn 0.8s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #94a3b8;
    font-size: 0.85rem;
  }
  .w-full {
    width: 100%;
  }
</style>
