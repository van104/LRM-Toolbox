<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Status<span>.速查()</span></h1>
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="search"
            class="brutal-input search-input"
            placeholder="输入代码或描述..."
          />
        </div>
      </header>

      <!-- Category Filter -->
      <div class="filter-bar">
        <button
          v-for="cat in categories"
          :key="cat.value"
          :class="['filter-tab', cat.color, { active: activeCat === cat.value }]"
          @click="activeCat = cat.value"
        >
          <span class="cat-num">{{ cat.value === 'all' ? '*' : cat.value }}xx</span>
          <span class="cat-text">{{ cat.label }}</span>
        </button>
      </div>

      <!-- Main Grid -->
      <main class="status-grid">
        <div
          v-for="item in filteredCodes"
          :key="item.code"
          :class="['status-card', getCatColor(item.code)]"
          @click="showDetail(item)"
        >
          <div class="card-top">
            <span class="code-num">{{ item.code }}</span>
            <span class="phrase-text">{{ item.phrase }}</span>
          </div>
          <div class="card-body">
            <p class="summary-text">{{ item.summary }}</p>
          </div>
          <div class="card-footer">
            <span class="detail-hint">点击查看详情 →</span>
          </div>
        </div>
      </main>

      <!-- Empty State -->
      <div v-if="filteredCodes.length === 0" class="empty-box brutal-pane">
        <span class="empty-icon">📭</span>
        <p>找不到相关的状态码，请换个词搜搜看</p>
      </div>

      <!-- Detail Modal Overlay -->
      <Transition name="fade">
        <div v-if="detailVisible" class="modal-overlay" @click.self="detailVisible = false">
          <div class="brutal-modal brutal-pane">
            <div class="pane-header bg-yellow">
              <span class="modal-title"
                >HTTP {{ selectedItem?.code }} - {{ selectedItem?.phrase }}</span
              >
              <button class="close-btn" @click="detailVisible = false">✕</button>
            </div>
            <div class="pane-body">
              <div class="detail-item">
                <label>🔹 详细解释 (DESCRIPTION)</label>
                <p>{{ selectedItem?.description }}</p>
              </div>
              <div class="detail-item">
                <label>🔹 常见场景 (USAGE SCENARIOS)</label>
                <p>{{ selectedItem?.usage }}</p>
              </div>
              <div v-if="selectedItem?.rfc" class="detail-item">
                <label>📑 RFC 标准 (REFERENCE)</label>
                <a
                  :href="`https://tools.ietf.org/html/rfc${selectedItem.rfc}`"
                  target="_blank"
                  class="rfc-link"
                >
                  RFC {{ selectedItem.rfc }} <span class="external-icon">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

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
      summary: '继续发送请求主体',
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
      summary: '请求成功',
      description: '请求已成功，请求所希望的响应头或数据体将随此响应返回。',
      usage:
        '最常见的 HTTP 响应。对于 GET 请求，响应通常包含请求的资源；对于 POST 请求，通常包含操作结果。',
      rfc: 7231
    },
    {
      code: 201,
      phrase: 'Created',
      summary: '资源已创建',
      description: '请求已经成功，并因此创建了一个新的资源。URI 会在 Location 头部中返回。',
      usage: '通常用于 POST 或 PUT 请求成功创建资源后。',
      rfc: 7231
    },
    {
      code: 204,
      phrase: 'No Content',
      summary: '无内容返回',
      description: '服务器成功处理了请求，但不需要返回任何实体内容。',
      usage: '常见于 DELETE 或保存操作且无需更新界面的情况。',
      rfc: 7231
    },
    {
      code: 301,
      phrase: 'Moved Permanently',
      summary: '永久重定向',
      description: '请求的资源已被永久移动到新位置。未来所有的请求都应该使用响应中返回的新 URI。',
      usage: '域名更换或从 HTTP 跳转到 HTTPS。',
      rfc: 7231
    },
    {
      code: 302,
      phrase: 'Found',
      summary: '临时重定向',
      description:
        '请求的资源现在临时从不同的 URI 响应请求。由于重定向是临时的，以后应继续向原有地址请求。',
      usage: '早期的临时跳转方案。',
      rfc: 7231
    },
    {
      code: 304,
      phrase: 'Not Modified',
      summary: '未修改（使用缓存）',
      description: '资源内容自前回访问以来并没有改变。响应不包含响应体。',
      usage: '浏览器缓存机制的核心。资源已过有效期但经过服务器校验后发现仍可使用。',
      rfc: 7232
    },
    {
      code: 400,
      phrase: 'Bad Request',
      summary: '错误请求',
      description: '由于包含语法错误，当前请求无法被服务器理解。',
      usage: '前端提交的数据格式（如 JSON 语法错误）不符合 API 要求。',
      rfc: 7231
    },
    {
      code: 401,
      phrase: 'Unauthorized',
      summary: '未授权',
      description: '当前请求需要用户身份验证。',
      usage: '用户未登录、Token 缺失或已失效。',
      rfc: 7235
    },
    {
      code: 403,
      phrase: 'Forbidden',
      summary: '禁止访问',
      description: '服务器理解请求，但是拒绝执行它。身份验证并不能提供任何帮助。',
      usage: '权限不足（例如普通用户尝试访问管理后台接口）。',
      rfc: 7231
    },
    {
      code: 404,
      phrase: 'Not Found',
      summary: '资源未找到',
      description: '服务器无法找到对应于请求 URI 的资源。',
      usage: '请求的资源路径写错或已被物理删除且未做重定向。',
      rfc: 7231
    },
    {
      code: 405,
      phrase: 'Method Not Allowed',
      summary: '方法禁用',
      description: '请求行中指定的请求方法不能用于请求相应的资源。',
      usage: '例如尝试用 POST 访问一个只支持 GET 的接口。',
      rfc: 7231
    },
    {
      code: 408,
      phrase: 'Request Timeout',
      summary: '请求超时',
      description: '请求超过了服务器等待接收完整请求的时间。',
      usage: '网络状况极差或客户端发送数据过慢导致连接被服务器强制切断。',
      rfc: 7231
    },
    {
      code: 429,
      phrase: 'Too Many Requests',
      summary: '请求过多',
      description: '用户在给定的时间内发送了太多的请求（限流）。',
      usage: '触发了服务器或网关的 API 速率限制。',
      rfc: 6585
    },
    {
      code: 500,
      phrase: 'Internal Server Error',
      summary: '服务器内部错误',
      description: '服务器遇到了一个未曾预料的状况，导致它无法完成对请求的处理。',
      usage: '后端业务代码抛出未捕获的运行时异常。',
      rfc: 7231
    },
    {
      code: 502,
      phrase: 'Bad Gateway',
      summary: '错误网关',
      description: '作为网关或代理的服务器从上游服务器接收到无效响应。',
      usage: 'Nginx 与后端 Node/PHP 服务器通信中断。',
      rfc: 7231
    },
    {
      code: 503,
      phrase: 'Service Unavailable',
      summary: '服务当前不可用',
      description: '由于临时的服务器维护或过载，服务器当前无法处理请求。',
      usage: '服务器停机维护中或并发量瞬间激增导致拒绝服务。',
      rfc: 7231
    },
    {
      code: 504,
      phrase: 'Gateway Timeout',
      summary: '网关超时',
      description: '作为网关或代理工作的服务器未能及时从上游服务器接收到响应。',
      usage: '后端接口逻辑执行时间超过了代理层的超时限制时间。',
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
    return map[firstDigit] || 'gray';
  };

  const filteredCodes = computed(() => {
    return statusCodes.filter(item => {
      const q = search.value.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.code.toString().includes(q) ||
        item.phrase.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);
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
    gap: 1.5rem;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #7c3aed;
  }

  .brutal-title span {
    color: #7c3aed;
    text-shadow: 4px 4px 0px #111;
    letter-spacing: 0;
  }

  .brutal-btn {
    background: #fff;
    border: 4px solid #111;
    padding: 0.75rem 1.5rem;
    font-family: 'Syne', sans-serif;
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

  /* Search Bar */
  .search-wrap {
    flex: 1;
    max-width: 400px;
    display: flex;
    align-items: center;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    padding: 0 1rem;
    transition: all 0.2s;
  }
  .search-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-right: 0.75rem;
  }
  .search-input {
    flex: 1;
    height: 3.5rem;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    outline: none;
  }
  .brutal-input {
    /* Base style for inputs when used outside search-wrap */
    width: 100%;
    padding: 1rem;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 1.1rem;
    font-weight: 700;
    background: #fff;
    outline: none;
    border: 4px solid #111;
    box-shadow: 6px 6px 0px #111;
    border-radius: 0;
  }
  .search-wrap:focus-within {
    transform: translate(-3px, -3px);
    box-shadow: 9px 9px 0px #111;
    background: #fdfae5;
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .filter-tab {
    border: 4px solid #111;
    background: #fff;
    padding: 0.6rem 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .filter-tab.active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #111;
  }

  .cat-num {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .cat-text {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  /* Colors */
  .blue.active {
    background: #3b82f6;
    color: #fff;
  }
  .green.active {
    background: #10b981;
    color: #fff;
  }
  .yellow.active {
    background: #ffd900;
    color: #111;
  }
  .red.active {
    background: #ff4b4b;
    color: #fff;
  }
  .purple.active {
    background: #8b5cf6;
    color: #fff;
  }
  .gray.active {
    background: #111;
    color: #fff;
  }

  /* Grid & Panes */
  .brutal-pane {
    border: 6px solid #111; /* 加粗边框 */
    background: #ffffff !important; /* 强制纯白背景 */
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    z-index: 10;
    opacity: 1 !important; /* 确保不透明 */
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .status-card {
    border: 4px solid #111;
    background: #fff;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 8px 8px 0px #111;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .status-card:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px #111;
  }

  .card-top {
    padding: 1.25rem;
    border-bottom: 4px solid #111;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    transition: background 0.2s;
  }
  .code-num {
    font-size: 2.2rem;
    font-weight: 900;
    line-height: 1;
  }
  .phrase-text {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: -0.5px;
    color: inherit;
  }

  /* Card Color Overrides */
  .status-card.blue .card-top {
    background: #dbeafe;
    color: #1e40af;
  }
  .status-card.green .card-top {
    background: #dcfce7;
    color: #166534;
  }
  .status-card.yellow .card-top {
    background: #fef9c3;
    color: #854d0e;
  }
  .status-card.red .card-top {
    background: #fee2e2;
    color: #991b1b;
  }
  .status-card.purple .card-top {
    background: #f3e8ff;
    color: #6b21a8;
  }

  .status-card:hover.blue .card-top {
    background: #3b82f6;
    color: #fff;
  }
  .status-card:hover.green .card-top {
    background: #10b981;
    color: #fff;
  }
  .status-card:hover.yellow .card-top {
    background: #ffd900;
    color: #000;
  }
  .status-card:hover.red .card-top {
    background: #ff4b4b;
    color: #fff;
  }
  .status-card:hover.purple .card-top {
    background: #8b5cf6;
    color: #fff;
  }

  .card-body {
    padding: 1.25rem;
    flex-grow: 1;
  }
  .summary-text {
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.5;
    margin: 0;
  }

  .card-footer {
    padding: 0.75rem 1.25rem;
    border-top: 2px dashed #111;
    background: #fafafa;
  }
  .detail-hint {
    font-size: 0.8rem;
    font-weight: 900;
    color: #888;
    text-transform: uppercase;
  }

  /* Empty State */
  .empty-box {
    padding: 4rem;
    text-align: center;
  }
  .empty-icon {
    font-size: 4rem;
    display: block;
    margin-bottom: 1rem;
  }
  .empty-box p {
    font-size: 1.2rem;
    font-weight: 800;
    color: #888;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9); /* 更深，几乎不透明 */
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  .detail-content {
    background: #fff; /* 二重确保背景不透明 */
  }
  .brutal-modal {
    width: 100%;
    max-width: 600px;
    box-shadow: 20px 20px 0px #000;
    animation: brutal-pop 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  }
  @keyframes brutal-pop {
    from {
      transform: scale(0.8) translate(10px, 10px);
      opacity: 0;
    }
    to {
      transform: scale(1) translate(0, 0);
      opacity: 1;
    }
  }

  .pane-header {
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 6px solid #111;
    background: inherit;
    gap: 1rem;
  }
  .modal-title {
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 1.5rem; /* 更大的标题 */
    text-transform: uppercase;
    line-height: 1.2;
    flex: 1;
  }
  .close-btn {
    border: 3px solid #111;
    background: #fff;
    color: #111;
    padding: 0.4rem 0.6rem;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 2px 2px 0px #111;
  }
  .close-btn:hover {
    background: #ff4b4b;
    color: #fff;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #111;
  }

  .detail-item {
    margin-bottom: 1.5rem;
  }
  .detail-item:last-child {
    margin-bottom: 0;
  }
  .detail-item label {
    display: block;
    font-size: 0.85rem;
    font-weight: 900;
    color: #444;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-left: 4px solid #7c3aed;
    padding-left: 0.5rem;
  }
  .detail-item p {
    margin: 0;
    line-height: 1.6;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .rfc-link {
    display: inline-block;
    background: #eee;
    border: 3px solid #111;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: #111;
    font-weight: 900;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
  }
  .rfc-link:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px #111;
    background: #fff;
    color: #3b82f6;
  }

  /* Transitions */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 900px) {
    .brutal-title {
      font-size: 2.2rem;
    }
    .status-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Dark Mode */
  [data-theme='dark'] .brutal-wrapper {
    background-color: #111;
    background-image:
      linear-gradient(#222 2px, transparent 2px), linear-gradient(90deg, #222 2px, transparent 2px);
    color: #eee;
  }

  [data-theme='dark'] .brutal-btn {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .brutal-pane {
    background: #1a1a1a !important;
    border-color: #eee;
    box-shadow: 10px 10px 0px #eee;
    opacity: 1 !important;
  }
  [data-theme='dark'] .brutal-input {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 6px 6px 0px #eee;
  }
  [data-theme='dark'] .filter-tab {
    background: #1a1a1a;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .status-card {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .card-top {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .card-footer {
    border-top-color: #333;
    background: #222;
  }
  [data-theme='dark'] .modal-overlay {
    background: rgba(0, 0, 0, 0.8);
  }
  [data-theme='dark'] .brutal-modal {
    border-color: #eee;
    box-shadow: 20px 20px 0px #eee;
  }
  [data-theme='dark'] .pane-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .close-btn {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 2px 2px 0px #eee;
  }
  [data-theme='dark'] .rfc-link {
    background: #222;
    border-color: #eee;
    color: #eee;
    box-shadow: 4px 4px 0px #eee;
  }

  /* Status Color Tweaks in Dark */
  [data-theme='dark'] .status-card.blue .card-top {
    background: #1e3a8a;
    color: #bfdbfe;
  }
  [data-theme='dark'] .status-card.green .card-top {
    background: #064e3b;
    color: #6ee7b7;
  }
  [data-theme='dark'] .status-card.yellow .card-top {
    background: #78350f;
    color: #fef08a;
  }
  [data-theme='dark'] .status-card.red .card-top {
    background: #7f1d1d;
    color: #fecaca;
  }
  [data-theme='dark'] .status-card.purple .card-top {
    background: #4c1d95;
    color: #ddd6fe;
  }
</style>
