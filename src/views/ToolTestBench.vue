<template>
  <div class="test-bench">
    <header class="bench-header">
      <div class="header-left">
        <el-button text @click="goHome">
          <el-icon><Back /></el-icon>
          <span>返回首页</span>
        </el-button>
      </div>
      <div class="header-center">
        <h1 class="bench-title">LRM 工具测试台</h1>
        <div class="status-badge" @click="refreshSandbox">
          <span class="dot"></span>
          测试开发环境
        </div>
      </div>
      <div class="header-right">
        <el-tooltip content="点击刷新沙盒组件" placement="bottom">
          <el-button circle :icon="Refresh" @click="refreshSandbox" />
        </el-tooltip>
      </div>
    </header>

    <main class="bench-content">
      <div class="sandbox-container">
        <component :is="sandboxComponent" v-if="sandboxVisible" />
        <div v-else class="loading-state">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </main>

    <aside class="bench-info">
      <div class="info-card glass-card">
        <h4>🛠️ 开发说明</h4>
        <ul>
          <li><b>源文件</b>: <code>src/components/tools/test/PendingTool.vue</code></li>
          <li><b>实时预览</b>: 修改上方文件后，保存即可在此看到实时更新后的效果。</li>
          <li><b>组件标准</b>: 尽量使用 Element Plus 组件，并保持 premium 的 UI 风格。</li>
          <li>
            <b>迁移流程</b>: 功能开发完毕后，将代码移至对应分类（如 <code>life/</code>），并在
            <code>data/tools/</code> 的 JSON 中注册。
          </li>
        </ul>
      </div>
    </aside>

    <footer class="bench-footer">© 2026 LRM-Toolbox Sandbox Environment</footer>
  </div>
</template>

<script setup>
  import { ref, defineAsyncComponent, shallowRef, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Back, Refresh } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const sandboxVisible = ref(true);
  const sandboxComponent = shallowRef(null);

  const loadSandbox = () => {
    // 异步加载待测试的组件
    sandboxComponent.value = defineAsyncComponent(
      () => import('@/components/tools/test/PendingTool.vue')
    );
  };

  const refreshSandbox = () => {
    sandboxVisible.value = false;
    setTimeout(() => {
      sandboxVisible.value = true;
      ElMessage.success('沙盒环境已重载');
    }, 300);
  };

  const goHome = () => {
    router.push('/');
  };

  onMounted(() => {
    // 生产环境安全拦截：如果不是开发模式，禁止访问测试台
    if (!import.meta.env.DEV) {
      router.replace('/');
      return;
    }
    loadSandbox();
  });
</script>

<style scoped>
  .test-bench {
    min-height: 100vh;
    background: #f8fafc;
    color: #1e293b;
    display: flex;
    flex-direction: column;
  }

  .bench-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 64px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .bench-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .status-badge {
    font-size: 0.7rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    cursor: pointer;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }

  .bench-content {
    flex: 1;
    padding: 2rem;
    background: radial-gradient(circle at top left, #f1f5f9 0%, #f8fafc 100%);
  }

  .sandbox-container {
    background: white;
    border-radius: 20px;
    min-height: calc(100vh - 200px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .loading-state {
    padding: 4rem;
  }

  .bench-info {
    max-width: 1000px;
    margin: 0 auto 2rem;
    width: calc(100% - 4rem);
  }

  .info-card {
    padding: 1.5rem;
    border-radius: 12px;
    background: #334155;
    color: #f1f5f9;
  }

  .info-card h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #38bdf8;
  }

  .info-card ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .info-card li {
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .info-card code {
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 4px;
    border-radius: 3px;
    color: #f472b6;
  }

  .glass-card {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .bench-footer {
    text-align: center;
    padding: 2rem;
    font-size: 0.8rem;
    color: #94a3b8;
    background: white;
    border-top: 1px solid #f1f5f9;
  }
</style>
