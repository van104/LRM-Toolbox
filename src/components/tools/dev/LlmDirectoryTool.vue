<template>
  <ToolShell title="Dev" title-highlight="模型大全()">
    <div class="brutal-wrapper">
      <div class="brutal-container">
        <section class="brutal-pane hero-pane">
          <div class="pane-header bg-yellow">
            <span>AI MODEL DIRECTORY</span>
            <span class="header-tag">2026-04</span>
          </div>
          <div class="pane-body hero-body">
            <div class="hero-copy">
              <h2 class="hero-title">国内外主流模型服务商与最新模型速查</h2>
              <p class="hero-desc">
                按服务商汇总当前主流大模型，覆盖国际与国内厂商，重点展示官方仍在主推或可公开调用的最新模型系列。
              </p>
            </div>

            <div class="hero-note">
              <div class="note-label">说明</div>
              <p>
                数据口径以各家官方模型页、开放平台或产品首页为准；由于预览版型号更新频繁，页面优先保留主系列名，并在必要处标记
                <code>preview</code>。
              </p>
            </div>
          </div>
        </section>

        <section class="stats-grid">
          <article class="stat-card brutal-pane">
            <div class="stat-label">服务商</div>
            <div class="stat-value">{{ providers.length }}</div>
            <div class="stat-desc">主流平台 / Provider</div>
          </article>
          <article class="stat-card brutal-pane">
            <div class="stat-label">已收录模型</div>
            <div class="stat-value">{{ totalModelCount }}</div>
            <div class="stat-desc">主推型号 / 系列</div>
          </article>
          <article class="stat-card brutal-pane">
            <div class="stat-label">国内</div>
            <div class="stat-value">{{ domesticCount }}</div>
            <div class="stat-desc">中国厂商</div>
          </article>
          <article class="stat-card brutal-pane">
            <div class="stat-label">国际</div>
            <div class="stat-value">{{ globalCount }}</div>
            <div class="stat-desc">海外厂商</div>
          </article>
        </section>

        <section class="brutal-pane">
          <div class="pane-header bg-blue">
            <span>筛选器 (FILTERS)</span>
            <button class="brutal-action-btn" @click="resetFilters">重置</button>
          </div>
          <div class="pane-body">
            <div class="filter-grid">
              <div class="field">
                <label class="brutal-label">关键词搜索</label>
                <input
                  v-model="keyword"
                  class="brutal-input"
                  placeholder="搜索服务商、模型名、模态或场景"
                />
              </div>

              <div class="field">
                <label class="brutal-label">服务商</label>
                <select v-model="providerFilter" class="brutal-select">
                  <option v-for="option in providerOptions" :key="option" :value="option">
                    {{ option }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label class="brutal-label">地区</label>
                <div class="pill-row">
                  <button
                    v-for="option in regionOptions"
                    :key="option"
                    class="pill-btn"
                    :class="{ active: regionFilter === option }"
                    @click="regionFilter = option"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>

              <div class="field">
                <label class="brutal-label">生态属性</label>
                <div class="pill-row">
                  <button
                    v-for="option in opennessOptions"
                    :key="option"
                    class="pill-btn"
                    :class="{ active: opennessFilter === option }"
                    @click="opennessFilter = option"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>

              <div class="field field-span">
                <label class="brutal-label">模态能力</label>
                <div class="pill-row">
                  <button
                    v-for="option in modalityOptions"
                    :key="option"
                    class="pill-btn"
                    :class="{ active: modalityFilter === option }"
                    @click="modalityFilter = option"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="brutal-pane">
          <div class="pane-header bg-green">
            <span>结果概览 (RESULTS)</span>
            <span class="header-tag">{{ filteredProviders.length }} / {{ providers.length }}</span>
          </div>
          <div class="pane-body">
            <div class="summary-strip">
              <div class="summary-item">
                <span class="summary-key">当前结果</span>
                <span class="summary-val">{{ filteredProviders.length }} 家服务商</span>
              </div>
              <div class="summary-item">
                <span class="summary-key">可见模型</span>
                <span class="summary-val">{{ filteredModelCount }} 个</span>
              </div>
              <div class="summary-item">
                <span class="summary-key">最新更新</span>
                <span class="summary-val">截至 2026-04</span>
              </div>
            </div>

            <div class="provider-chip-row">
              <button
                v-for="provider in filteredProviders"
                :key="provider.id"
                class="provider-chip"
                @click="providerFilter = provider.name"
              >
                {{ provider.name }}
              </button>
            </div>
          </div>
        </section>

        <section v-if="filteredProviders.length" class="cards-grid">
          <article
            v-for="provider in filteredProviders"
            :key="provider.id"
            class="brutal-pane provider-card"
          >
            <div class="pane-header" :class="provider.headerClass">
              <div class="provider-topline">
                <span>{{ provider.name }}</span>
                <span class="provider-short">{{ provider.short }}</span>
              </div>
              <span class="header-tag">{{ provider.region }}</span>
            </div>

            <div class="pane-body card-body">
              <div class="meta-row">
                <span class="meta-badge">{{ provider.country }}</span>
                <span class="meta-badge neutral">{{ provider.openness }}</span>
                <span class="meta-badge neutral">{{ provider.apiType }}</span>
              </div>

              <div class="card-section">
                <div class="section-label">平台定位</div>
                <p class="section-text">{{ provider.description }}</p>
              </div>

              <div class="card-section">
                <div class="section-label">最新主推模型</div>
                <div class="chip-wrap">
                  <span v-for="model in provider.latestModels" :key="model" class="data-chip">
                    {{ model }}
                  </span>
                </div>
              </div>

              <div class="card-section">
                <div class="section-label">模态覆盖</div>
                <div class="chip-wrap">
                  <span
                    v-for="modality in provider.modalities"
                    :key="modality"
                    class="data-chip light"
                  >
                    {{ modality }}
                  </span>
                </div>
              </div>

              <div class="card-section">
                <div class="section-label">推荐场景</div>
                <div class="chip-wrap">
                  <span v-for="item in provider.strengths" :key="item" class="data-chip soft">
                    {{ item }}
                  </span>
                </div>
              </div>

              <div class="card-section info-grid">
                <div class="info-item">
                  <span class="info-key">代表型号</span>
                  <span class="info-val">{{ provider.flagship }}</span>
                </div>
                <div class="info-item">
                  <span class="info-key">上下文 / 特点</span>
                  <span class="info-val">{{ provider.contextInfo }}</span>
                </div>
              </div>

              <div class="card-section">
                <div class="section-label">补充说明</div>
                <p class="section-text">{{ provider.notes }}</p>
              </div>

              <div class="card-footer">
                <a :href="provider.source" class="source-link" target="_blank" rel="noreferrer">
                  查看官方模型页
                </a>
                <span class="source-note">核验时间：{{ provider.checkedAt }}</span>
              </div>
            </div>
          </article>
        </section>

        <section v-else class="brutal-pane empty-pane">
          <div class="pane-header bg-pink">
            <span>没有匹配结果</span>
          </div>
          <div class="pane-body">
            <p class="empty-text">尝试清空关键词或切换筛选项，查看全部服务商与模型系列。</p>
          </div>
        </section>
      </div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import ToolShell from '@/components/common/ToolShell.vue';
  import { llmProviders } from '@/data/llm_directory';

  const providers = llmProviders;

  const regionOptions = ['全部', '国内', '国际'];
  const opennessOptions = ['全部', '闭源 API', '开源权重', '混合生态'];
  const modalityOptions = ['全部', '文本', '多模态', '图像', '音频', '语音', '视频', '代码', '3D'];

  const keyword = ref('');
  const providerFilter = ref('全部');
  const regionFilter = ref('全部');
  const opennessFilter = ref('全部');
  const modalityFilter = ref('全部');

  const providerOptions = computed(() => ['全部', ...providers.map(item => item.name)]);

  const totalModelCount = computed(() =>
    providers.reduce((sum, item) => sum + item.latestModels.length, 0)
  );

  const domesticCount = computed(() => providers.filter(item => item.region === '国内').length);
  const globalCount = computed(() => providers.filter(item => item.region === '国际').length);

  const filteredProviders = computed(() => {
    const search = keyword.value.trim().toLowerCase();

    return providers.filter(item => {
      const matchesProvider = providerFilter.value === '全部' || item.name === providerFilter.value;
      const matchesRegion = regionFilter.value === '全部' || item.region === regionFilter.value;
      const matchesOpenness =
        opennessFilter.value === '全部' || item.openness === opennessFilter.value;
      const matchesModality =
        modalityFilter.value === '全部' || item.modalities.includes(modalityFilter.value);

      const haystack = [
        item.name,
        item.short,
        item.country,
        item.flagship,
        item.description,
        item.notes,
        ...item.modalities,
        ...item.strengths,
        ...item.latestModels
      ]
        .join(' ')
        .toLowerCase();

      const matchesKeyword = !search || haystack.includes(search);

      return (
        matchesProvider && matchesRegion && matchesOpenness && matchesModality && matchesKeyword
      );
    });
  });

  const filteredModelCount = computed(() =>
    filteredProviders.value.reduce((sum, item) => sum + item.latestModels.length, 0)
  );

  function resetFilters() {
    keyword.value = '';
    providerFilter.value = '全部';
    regionFilter.value = '全部';
    opennessFilter.value = '全部';
    modalityFilter.value = '全部';
  }
</script>

<style scoped>
  .brutal-wrapper {
    width: 100%;
    background:
      linear-gradient(#11111110 1px, transparent 1px),
      linear-gradient(90deg, #11111110 1px, transparent 1px), #fdfae5;
    background-size: 24px 24px;
    padding: 1rem 0 2rem;
    color: #111;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .brutal-container {
    max-width: 1380px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    overflow: hidden;
  }

  .pane-header {
    padding: 0.95rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .pane-body {
    padding: 1.25rem;
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
    background: #ff9fb2;
  }

  .header-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem 0.65rem;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    font-size: 0.8rem;
    font-weight: 800;
    box-shadow: 3px 3px 0px #111;
  }

  .hero-body {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 1rem;
    align-items: stretch;
  }

  .hero-copy,
  .hero-note {
    border: 3px solid #111;
    padding: 1rem;
    background: #fffceb;
    box-shadow: 4px 4px 0px #111;
  }

  .hero-title {
    margin: 0 0 0.8rem;
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 2rem;
    line-height: 1.1;
    font-weight: 900;
    letter-spacing: 0.5px;
  }

  .hero-desc,
  .section-text,
  .empty-text,
  .hero-note p {
    margin: 0;
    line-height: 1.7;
    font-size: 0.98rem;
  }

  .note-label,
  .section-label,
  .brutal-label,
  .stat-label,
  .summary-key,
  .info-key {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .hero-note code {
    background: #111;
    color: #fff;
    padding: 0.1rem 0.35rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem 1.15rem;
  }

  .stat-value {
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1;
    margin: 0.55rem 0 0.35rem;
  }

  .stat-desc {
    color: #555;
    font-size: 0.9rem;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .field-span {
    grid-column: 1 / -1;
  }

  .brutal-input,
  .brutal-select {
    width: 100%;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    box-shadow: 4px 4px 0px #111;
    padding: 0.85rem 0.9rem;
    font-size: 1rem;
    outline: none;
    transition: all 0.1s ease;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
  }

  .brutal-input:focus,
  .brutal-select:focus {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .pill-row,
  .provider-chip-row,
  .chip-wrap,
  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .pill-btn,
  .provider-chip,
  .brutal-action-btn {
    border: 3px solid #111;
    background: #fff;
    color: #111;
    padding: 0.55rem 0.8rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s ease;
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  .pill-btn:hover,
  .provider-chip:hover,
  .brutal-action-btn:hover,
  .source-link:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
  }

  .pill-btn:active,
  .provider-chip:active,
  .brutal-action-btn:active,
  .source-link:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px #111;
  }

  .pill-btn.active {
    background: #ffd900;
  }

  .summary-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .summary-item {
    border: 3px solid #111;
    background: #f8f5dc;
    box-shadow: 4px 4px 0px #111;
    padding: 0.8rem 0.9rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
  }

  .summary-val,
  .info-val {
    font-weight: 800;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.2rem;
  }

  .provider-card {
    display: flex;
    flex-direction: column;
  }

  .provider-topline {
    display: flex;
    align-items: center;
    gap: 0.7rem;
  }

  .provider-short {
    font-size: 0.85rem;
    opacity: 0.9;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .meta-badge,
  .data-chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.55rem;
    border: 2px solid #111;
    background: #ffd900;
    font-size: 0.82rem;
    font-weight: 800;
    box-shadow: 2px 2px 0px #111;
  }

  .meta-badge.neutral,
  .data-chip.light {
    background: #dbe7ff;
  }

  .data-chip.soft {
    background: #d7ffe9;
  }

  .card-section {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem;
    border: 3px solid #111;
    background: #fffceb;
    box-shadow: 4px 4px 0px #111;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
    padding-top: 0.25rem;
  }

  .source-link {
    text-decoration: none;
    color: #111;
    border: 3px solid #111;
    background: #fff;
    padding: 0.55rem 0.8rem;
    font-weight: 900;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s ease;
    font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  .source-note {
    color: #555;
    font-size: 0.9rem;
  }

  .empty-pane {
    max-width: 760px;
  }

  .empty-text {
    text-align: center;
    padding: 2rem 0;
    font-weight: 800;
  }

  @media (max-width: 1100px) {
    .hero-body,
    .stats-grid,
    .cards-grid,
    .summary-strip {
      grid-template-columns: 1fr;
    }

    .filter-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .brutal-wrapper {
      padding: 0.5rem 0 1.5rem;
    }

    .pane-header,
    .card-footer,
    .info-item,
    .summary-item {
      flex-direction: column;
      align-items: flex-start;
    }

    .hero-title {
      font-size: 1.5rem;
    }
  }

  [data-theme='dark'] .brutal-wrapper {
    background:
      linear-gradient(#2b2b2b 1px, transparent 1px),
      linear-gradient(90deg, #2b2b2b 1px, transparent 1px), #111;
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .hero-copy,
  [data-theme='dark'] .hero-note,
  [data-theme='dark'] .summary-item,
  [data-theme='dark'] .info-item,
  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .pill-btn,
  [data-theme='dark'] .provider-chip,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .source-link,
  [data-theme='dark'] .header-tag {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
  }

  [data-theme='dark'] .brutal-pane,
  [data-theme='dark'] .hero-copy,
  [data-theme='dark'] .hero-note,
  [data-theme='dark'] .summary-item,
  [data-theme='dark'] .info-item {
    box-shadow: 8px 8px 0px #eee;
  }

  [data-theme='dark'] .brutal-input,
  [data-theme='dark'] .brutal-select,
  [data-theme='dark'] .pill-btn,
  [data-theme='dark'] .provider-chip,
  [data-theme='dark'] .brutal-action-btn,
  [data-theme='dark'] .source-link,
  [data-theme='dark'] .header-tag {
    box-shadow: 4px 4px 0px #eee;
  }

  [data-theme='dark'] .brutal-input:focus,
  [data-theme='dark'] .brutal-select:focus {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .pill-btn:hover,
  [data-theme='dark'] .provider-chip:hover,
  [data-theme='dark'] .brutal-action-btn:hover,
  [data-theme='dark'] .source-link:hover {
    box-shadow: 6px 6px 0px #eee;
  }

  [data-theme='dark'] .pill-btn:active,
  [data-theme='dark'] .provider-chip:active,
  [data-theme='dark'] .brutal-action-btn:active,
  [data-theme='dark'] .source-link:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
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
    background: #b25465;
    color: #fff;
  }

  [data-theme='dark'] .hero-note code {
    background: #eee;
    color: #111;
  }

  [data-theme='dark'] .stat-desc,
  [data-theme='dark'] .source-note {
    color: #bdbdbd;
  }

  [data-theme='dark'] .meta-badge,
  [data-theme='dark'] .data-chip {
    border-color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }

  [data-theme='dark'] .meta-badge,
  [data-theme='dark'] .pill-btn.active {
    background: #b28f00;
    color: #fff;
  }

  [data-theme='dark'] .meta-badge.neutral,
  [data-theme='dark'] .data-chip.light {
    background: #405d9e;
    color: #fff;
  }

  [data-theme='dark'] .data-chip.soft {
    background: #3c9165;
    color: #fff;
  }
</style>
