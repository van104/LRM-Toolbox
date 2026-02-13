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
        <h1 class="tool-title">UUID/GUID 生成器</h1>
        <span class="tool-subtitle">UUID/GUID Generator</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="generateBatch">
          <el-icon><Refresh /></el-icon>
          重新生成
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
              <label class="section-label">生成数量</label>
              <el-input-number v-model="count" :min="1" :max="100" class="full-width" />
            </div>

            <div class="config-item">
              <label class="section-label">UUID 版本</label>
              <el-radio-group v-model="version" class="vertical-radio">
                <el-radio label="v4">Version 4 (随机)</el-radio>
                <el-radio label="v1">Version 1 (基于时间)</el-radio>
              </el-radio-group>
            </div>

            <div class="config-item">
              <label class="section-label">格式设置</label>
              <div class="checkbox-group">
                <el-checkbox v-model="uppercase">转换为大写</el-checkbox>
                <el-checkbox v-model="hyphens">包含连字符 (-)</el-checkbox>
                <el-checkbox v-model="braces">包含大括号 { }</el-checkbox>
              </div>
            </div>

            <div class="config-item">
              <label class="section-label">输出格式</label>
              <el-select v-model="outputFormat" class="full-width">
                <el-option label="纯文本" value="text" />
                <el-option label="JSON 数组" value="json" />
                <el-option label="CSV" value="csv" />
              </el-select>
            </div>
          </div>
        </aside>

        <section class="tool-main">
          <div class="panel glass-card result-panel">
            <div class="panel-header">
              <h2 class="panel-title">生成结果</h2>
              <div class="actions">
                <el-button type="success" size="small" @click="copyAll">一键复制</el-button>
                <el-button
                  v-if="outputFormat === 'text'"
                  type="info"
                  size="small"
                  plain
                  @click="downloadText"
                  >保存为 .txt</el-button
                >
              </div>
            </div>

            <div class="code-outer">
              <pre><code>{{ formattedResults }}</code></pre>
            </div>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">什么是 UUID？</h2>
            <div class="info-content">
              <p>
                <strong>UUID</strong> (Universally Unique Identifier)
                是一种软件建构的标准，亦为自由软件基金会组织在分散式计算环境领域的一部分。其目的，是让分散式系统中的所有元素，都能有唯一的辨识资讯，而不需要透过中央控制端来做辨识资讯的指定。
              </p>
              <ul class="info-list">
                <li>
                  <strong>v4 (随机)</strong>：完全基于随机数生成，碰撞概率极低，最常用的版本。
                </li>
                <li>
                  <strong>v1 (时间)</strong>：基于时间戳和 MAC
                  地址生成，保证了生成顺序（在一定程度上）。
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - UUID 生成器</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { ArrowLeft, Refresh, Setting } from '@element-plus/icons-vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();

  const count = ref(5);
  const version = ref('v4');
  const uppercase = ref(false);
  const hyphens = ref(true);
  const braces = ref(false);
  const outputFormat = ref('text');
  const results = ref<string[]>([]);

  // 模拟 UUID 生成逻辑 (v4)
  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // 模拟 UUID 生成逻辑 (v1)
  const generateUUIDv1 = () => {
    const now = Date.now();
    const random = Math.floor(Math.random() * 1000000000)
      .toString(16)
      .padStart(12, '0');
    const timeHex = now.toString(16).padStart(12, '0');
    return `${timeHex.slice(0, 8)}-${timeHex.slice(8)}-1000-8000-${random}`;
  };

  const generateBatch = () => {
    const newResults = [];
    for (let i = 0; i < count.value; i++) {
      let id = version.value === 'v4' ? generateUUIDv4() : generateUUIDv1();

      if (!hyphens.value) id = id.replace(/-/g, '');
      if (uppercase.value) id = id.toUpperCase();
      if (braces.value) id = `{${id}}`;

      newResults.push(id);
    }
    results.value = newResults;
  };

  const formattedResults = computed(() => {
    if (outputFormat.value === 'json') {
      return JSON.stringify(results.value, null, 2);
    }
    if (outputFormat.value === 'csv') {
      return results.value.join('\n');
    }
    return results.value.join('\n');
  });

  const copyAll = async () => {
    await copyToClipboard(formattedResults.value, {
      success: '已复制全部 UUID'
    });
  };

  const downloadText = () => {
    const blob = new Blob([formattedResults.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  onMounted(() => {
    generateBatch();
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

  .header-right {
    display: flex;
    justify-content: flex-end;
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
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .tool-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1.5rem;
      align-items: start;
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
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .config-item {
    margin-bottom: 24px;
  }

  .section-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .full-width {
    width: 100%;
  }

  .vertical-radio {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .panel-header .panel-title {
    margin: 0;
  }

  .code-outer {
    background: #1e293b;
    border-radius: 12px;
    padding: 20px;
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'Fira Code', 'Courier New', monospace;
    font-size: 1rem;
    color: #e2e8f0;
    line-height: 1.6;
  }

  .info-content {
    color: #475569;
    line-height: 1.7;
  }

  .info-list {
    margin: 16px 0 0;
    padding-left: 20px;
  }

  .info-list li {
    margin-bottom: 8px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-6 {
    margin-top: 1.5rem;
  }
</style>
