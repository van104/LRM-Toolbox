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
        <h1 class="tool-title">HTTP 状态码速查</h1>
        <span class="tool-subtitle">HTTP Status Codes</span>
      </div>
      <div class="header-right">
        <el-input
          v-model="search"
          placeholder="搜索代码或含义..."
          prefix-icon="Search"
          clearable
          style="width: 200px"
        />
      </div>
    </header>

    <main class="tool-content">
      <div class="filter-tabs">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="cat-tab"
          :class="{ active: activeCat === cat.value, [cat.color]: true }"
          @click="activeCat = cat.value"
        >
          <span class="cat-prefix">{{ cat.value }}xx</span>
          <span class="cat-label">{{ cat.label }}</span>
        </button>
      </div>

      <div class="status-grid">
        <div
          v-for="item in filteredCodes"
          :key="item.code"
          class="status-card"
          :class="getCatColor(item.code)"
          @click="showDetail(item)"
        >
          <div class="status-code">{{ item.code }}</div>
          <div class="status-phrase">{{ item.phrase }}</div>
          <div class="status-summary">{{ item.summary }}</div>
        </div>
      </div>

      <div v-if="filteredCodes.length === 0" class="empty-state">
        <el-icon><Search /></el-icon>
        <p>找不到相关的状态码</p>
      </div>
    </main>

    <el-dialog
      v-model="detailVisible"
      :title="`HTTP ${selectedItem?.code} - ${selectedItem?.phrase}`"
      width="600px"
      destroy-on-close
      class="status-dialog"
    >
      <div v-if="selectedItem" class="detail-content">
        <div class="detail-section">
          <h3 class="detail-label">详细解释</h3>
          <p class="detail-text">{{ selectedItem.description }}</p>
        </div>
        <div class="detail-section mt-4">
          <h3 class="detail-label">常见场景</h3>
          <p class="detail-text">{{ selectedItem.usage }}</p>
        </div>
        <div v-if="selectedItem.rfc" class="detail-section mt-4">
          <h3 class="detail-label">RFC 标准</h3>
          <el-link
            type="primary"
            :href="`https://tools.ietf.org/html/rfc${selectedItem.rfc}`"
            target="_blank"
          >
            RFC {{ selectedItem.rfc }}
          </el-link>
        </div>
      </div>
    </el-dialog>

    <footer class="footer">© 2026 LRM工具箱 - HTTP 状态码速查</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { ArrowLeft, Search } from '@element-plus/icons-vue';

  const search = ref('');
  const activeCat = ref('all');
  const detailVisible = ref(false);
  const selectedItem = ref<{
    code: number;
    phrase: string;
    summary: string;
    description: string;
    usage: string;
    rfc?: number;
  } | null>(null);

  const categories = [
    { value: 'all', label: '全部', color: 'gray' },
    { value: '1', label: '信息响应', color: 'blue' },
    { value: '2', label: '成功响应', color: 'green' },
    { value: '3', label: '重定向', color: 'yellow' },
    { value: '4', label: '客户端错误', color: 'red' },
    { value: '5', label: '服务器错误', color: 'purple' }
  ];

  const statusCodes = [
    {
      code: 100,
      phrase: 'Continue',
      summary: '继续',
      description:
        '客户端应当继续发送请求。这个临时响应是用来通知客户端它的部分请求已经被服务器接收，且仍未被拒绝。',
      usage: '在使用 Expect: 100-continue 头部发送较大的 POST 请求时常见。',
      rfc: 7231
    },
    {
      code: 101,
      phrase: 'Switching Protocols',
      summary: '切换协议',
      description:
        '服务器已经理解了客户端的请求，并将通过 Upgrade 消息头通知客户端采用不同的协议来完成这个请求。',
      usage: '常见的场景是 WebSocket 连接握手过程。',
      rfc: 7231
    },
    {
      code: 200,
      phrase: 'OK',
      summary: '成功',
      description: '请求已成功，请求所希望的响应头或数据体将随此响应返回。',
      usage:
        '最常见的 HTTP 响应。对于 GET 请求，响应通常包含请求的资源；对于 POST 请求，响应通常包含描述操作结果的实体。',
      rfc: 7231
    },
    {
      code: 201,
      phrase: 'Created',
      summary: '已创建',
      description: '请求已经成功，并因此创建了一个新的资源。产生的 URI 会在 Location 头部中返回。',
      usage: '通常用于 POST 或 PUT 请求成功创建资源后。',
      rfc: 7231
    },
    {
      code: 204,
      phrase: 'No Content',
      summary: '无内容',
      description: '服务器成功处理了请求，但不需要返回任何实体内容。',
      usage: '常见于执行了删除操作（DELETE）或保存操作且无需更新界面的情况。',
      rfc: 7231
    },
    {
      code: 301,
      phrase: 'Moved Permanently',
      summary: '永久重定向',
      description: '请求的资源已被永久移动到新位置。未来所有的请求都应该使用响应中返回的新 URI。',
      usage: '常用的场景是网址更换域名或 HTTP 跳转 HTTPS。',
      rfc: 7231
    },
    {
      code: 302,
      phrase: 'Found',
      summary: '临时重定向',
      description:
        '请求的资源现在临时从不同的 URI 响应请求。由于重定向是临时的，客户端应当继续向原有地址发送以后的请求。',
      usage: '早期的临时跳转方案。',
      rfc: 7231
    },
    {
      code: 304,
      phrase: 'Not Modified',
      summary: '未修改',
      description:
        '如果客户端发送了一个带条件的 GET 请求且该请求已被允许，而文档的内容自上次访问以来并没有改变，则服务器应当返回这个状态码。',
      usage: '浏览器缓存机制的核心。返回此状态码时不包含响应体。',
      rfc: 7232
    },
    {
      code: 400,
      phrase: 'Bad Request',
      summary: '错误请求',
      description: '由于包含语法错误，当前请求无法被服务器理解。',
      usage: '前端提交的数据格式（如 JSON 语法错误）不符合 API 要求时常见。',
      rfc: 7231
    },
    {
      code: 401,
      phrase: 'Unauthorized',
      summary: '未授权',
      description:
        '当前请求需要用户验证。响应必须包含一个适用于被请求资源的 WWW-Authenticate 信息头用以询问用户信息。',
      usage: '用户未登录或 Token 失效。',
      rfc: 7235
    },
    {
      code: 403,
      phrase: 'Forbidden',
      summary: '禁止访问',
      description:
        '服务器已经理解请求，但是拒绝执行它。与 401 响应不同的是，身份验证并不能提供任何帮助。',
      usage: '权限不足（如非管理员访问后台）。',
      rfc: 7231
    },
    {
      code: 404,
      phrase: 'Not Found',
      summary: '未找到',
      description: '服务器无法找到对应于请求 URI 的资源。',
      usage: '请求的资源路径不存在。',
      rfc: 7231
    },
    {
      code: 405,
      phrase: 'Method Not Allowed',
      summary: '方法禁用',
      description: '请求行中指定的请求方法不能用于请求相应的资源。',
      usage: '尝试用 POST 访问一个只支持 GET 的接口。',
      rfc: 7231
    },
    {
      code: 408,
      phrase: 'Request Timeout',
      summary: '请求超时',
      description: '请求超过了服务器等待接收完整请求的时间。',
      usage: '网络状况极差或客户端发送数据过慢。',
      rfc: 7231
    },
    {
      code: 429,
      phrase: 'Too Many Requests',
      summary: '请求过多',
      description: '用户在给定的时间内发送了太多的请求。',
      usage: 'API 速率限制（Rate Limiting）。',
      rfc: 6585
    },
    {
      code: 500,
      phrase: 'Internal Server Error',
      summary: '服务器内部错误',
      description: '服务器遇到了一个未曾预料的状况，导致它无法完成对请求的处理。',
      usage: '后端代码抛出异常且未被捕获。',
      rfc: 7231
    },
    {
      code: 502,
      phrase: 'Bad Gateway',
      summary: '错误网关',
      description: '作为网关或者代理工作的服务器尝试执行请求时，从上游服务器接收到无效的响应。',
      usage: 'Nginx 与 PHP-FPM/Node 服务器通信失败常见。',
      rfc: 7231
    },
    {
      code: 503,
      phrase: 'Service Unavailable',
      summary: '服务不可用',
      description: '由于临时的服务器维护或者过载，服务器当前无法处理请求。',
      usage: '服务器正在维护或由于高并发导致暂时不可用。',
      rfc: 7231
    },
    {
      code: 504,
      phrase: 'Gateway Timeout',
      summary: '网关超时',
      description:
        '作为网关或者代理工作的服务器尝试执行请求时，未能及时从上游服务器（URI 标识出的服务器）接收到响应。',
      usage: '后端接口执行时间过长，超过了 Nginx 的等待时间。',
      rfc: 7231
    }
  ];

  const getCatColor = (code: number) => {
    const firstDigit = Math.floor(code / 100);
    const map: Record<number, string> = {
      1: 'blue',
      2: 'green',
      3: 'yellow',
      4: 'red',
      5: 'purple'
    };
    return map[firstDigit];
  };

  const filteredCodes = computed(() => {
    return statusCodes.filter(item => {
      const matchesSearch =
        item.code.toString().includes(search.value) ||
        item.phrase.toLowerCase().includes(search.value.toLowerCase()) ||
        item.summary.includes(search.value);
      const matchesCat =
        activeCat.value === 'all' || Math.floor(item.code / 100).toString() === activeCat.value;
      return matchesSearch && matchesCat;
    });
  });

  const showDetail = (item: {
    code: number;
    phrase: string;
    summary: string;
    description: string;
    usage: string;
    rfc?: number;
  }) => {
    selectedItem.value = item;
    detailVisible.value = true;
  };
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
    width: 250px;
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

  .filter-tabs {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .cat-tab {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    transition: all 0.2s;
  }

  .cat-tab.active {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .cat-prefix {
    font-weight: 700;
    opacity: 0.7;
    font-family: monospace;
  }
  .cat-label {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .cat-tab.blue.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  .cat-tab.green.active {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }
  .cat-tab.yellow.active {
    background: #f59e0b;
    color: white;
    border-color: #f59e0b;
  }
  .cat-tab.red.active {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
  }
  .cat-tab.purple.active {
    background: #8b5cf6;
    color: white;
    border-color: #8b5cf6;
  }
  .cat-tab.gray.active {
    background: #475569;
    color: white;
    border-color: #475569;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .status-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    overflow: hidden;
  }

  .status-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .status-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
  }

  .status-card.blue::before {
    background: #3b82f6;
  }
  .status-card.green::before {
    background: #10b981;
  }
  .status-card.yellow::before {
    background: #f59e0b;
  }
  .status-card.red::before {
    background: #ef4444;
  }
  .status-card.purple::before {
    background: #8b5cf6;
  }

  .status-code {
    font-size: 2.5rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 8px;
    font-family: 'Inter', sans-serif;
  }
  .status-card.blue .status-code {
    color: #3b82f6;
  }
  .status-card.green .status-code {
    color: #10b981;
  }
  .status-card.yellow .status-code {
    color: #f59e0b;
  }
  .status-card.red .status-code {
    color: #ef4444;
  }
  .status-card.purple .status-code {
    color: #8b5cf6;
  }

  .status-phrase {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }
  .status-summary {
    font-size: 0.9rem;
    color: #64748b;
  }

  .empty-state {
    text-align: center;
    padding: 60px;
    color: #94a3b8;
  }
  .empty-state .el-icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  .detail-label {
    font-size: 0.875rem;
    color: #94a3b8;
    text-transform: uppercase;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .detail-text {
    color: #334155;
    line-height: 1.6;
    font-size: 1rem;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }
</style>
