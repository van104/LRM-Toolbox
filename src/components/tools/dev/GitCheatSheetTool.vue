<template>
  <div class="brutal-wrapper">
    <div class="brutal-container">
      <!-- Header -->
      <header class="brutal-header">
        <button class="brutal-btn back-btn" @click="$router.back()">← 返回</button>
        <h1 class="brutal-title">Git<span>.备忘录()</span></h1>
        <div class="git-badge">// CheatSheet</div>
      </header>

      <!-- 搜索栏 -->
      <div class="search-wrap">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            class="brutal-search"
            placeholder="搜索 Git 命令或关键词 (例如: merge, undo, config)..."
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">✕</button>
        </div>
        <div v-if="searchQuery" class="search-hint">找到 {{ totalResults }} 条匹配结果</div>
      </div>

      <!-- 命令分类列表 -->
      <div v-if="filteredData.length" class="categories">
        <div v-for="cat in filteredData" :key="cat.title" class="category-block">
          <div class="category-header" :style="{ background: cat.color }">
            <span class="cat-icon">{{ cat.icon }}</span>
            <h2 class="category-title">{{ cat.title }}</h2>
            <span class="cat-count">{{ cat.items.length }} 条</span>
          </div>
          <div class="commands-grid">
            <div
              v-for="cmd in cat.items"
              :key="cmd.code"
              class="command-card"
              @click="copyCode(cmd.code)"
            >
              <div class="cmd-desc">{{ cmd.desc }}</div>
              <div class="code-box">
                <code>{{ cmd.code }}</code>
                <span class="copy-hint">点击复制</span>
              </div>
              <div v-if="cmd.tips" class="cmd-tips">
                <span class="tips-icon">💡</span>
                {{ cmd.tips }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>
          没有找到匹配 "<strong>{{ searchQuery }}</strong
          >" 的命令
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useCopy } from '@/composables/useCopy';

  const { copyToClipboard } = useCopy();
  const searchQuery = ref('');

  const gitData = [
    {
      title: '基础配置 & 初始化 (Setup)',
      icon: '⚙️',
      color: '#ffd900',
      items: [
        { desc: '配置全局用户名', code: 'git config --global user.name "你的名字"' },
        { desc: '配置全局邮箱', code: 'git config --global user.email "you@example.com"' },
        { desc: '初始化本地仓库', code: 'git init' },
        { desc: '克隆远程仓库', code: 'git clone <url>' }
      ]
    },
    {
      title: '分支操作 (Branching)',
      icon: '🌿',
      color: '#00e572',
      items: [
        { desc: '列出所有本地分支', code: 'git branch' },
        { desc: '创建并切换到新分支', code: 'git checkout -b <name>' },
        { desc: '切换分支 (新语法)', code: 'git switch <name>' },
        { desc: '合并分支到当前分支', code: 'git merge <branch>' },
        { desc: '重命名当前分支', code: 'git branch -m <new-name>' },
        { desc: '删除本地分支 (已合并)', code: 'git branch -d <name>' },
        { desc: '强制删除本地分支', code: 'git branch -D <name>' }
      ]
    },
    {
      title: '暂存 & 提交 (Snapshotting)',
      icon: '📸',
      color: '#4b7bff',
      items: [
        { desc: '添加指定文件到暂存区', code: 'git add <file>' },
        { desc: '添加所有修改到暂存区', code: 'git add .' },
        { desc: '提交暂存区内容到仓库', code: 'git commit -m "commit message"' },
        { desc: '修改最后一次提交信息', code: 'git commit --amend' },
        { desc: '查看工作区状态', code: 'git status' },
        { desc: '查看提交历史 (简洁)', code: 'git log --oneline --graph' }
      ]
    },
    {
      title: '撤销 & 回滚 (Undo)',
      icon: '↩️',
      color: '#ff7be5',
      items: [
        {
          desc: '撤销暂存区文件 (保持工作区不变)',
          code: 'git restore --staged <file>',
          tips: '也可以用旧语法 git reset <file>'
        },
        {
          desc: '回退到指定版本 (保留修改)',
          code: 'git reset --soft <commit-id>',
          tips: '修改会处于已暂存状态'
        },
        {
          desc: '强制回退到指定版本 (丢失修改)',
          code: 'git reset --hard <commit-id>',
          tips: '⚠️ 慎用！工作区和暂存区都会被重置'
        },
        {
          desc: '撤销指定文件的修改',
          code: 'git restore <file>',
          tips: '新语法，等效于旧版 git checkout -- <file>'
        },
        { desc: '反转提交 (创建一个对冲提交)', code: 'git revert <commit-id>' }
      ]
    },
    {
      title: '远程同步 (Remote)',
      icon: '🌐',
      color: '#ff9f43',
      items: [
        { desc: '查看远程仓库信息', code: 'git remote -v' },
        { desc: '获取远程更新（不合并）', code: 'git fetch origin' },
        { desc: '拉取远程代码并合并', code: 'git pull origin <branch>' },
        { desc: '推送到远程仓库', code: 'git push origin <branch>' },
        {
          desc: '强制推送',
          code: 'git push -f origin <branch>',
          tips: '⚠️ 非必要不建议强制推送，会覆盖远程历史'
        },
        { desc: '推送并建立跟踪', code: 'git push -u origin <branch>' }
      ]
    },
    {
      title: '储藏 (Stashing)',
      icon: '📦',
      color: '#ff4b4b',
      items: [
        { desc: '储藏当前工作区修改', code: 'git stash' },
        { desc: '储藏并添加备注', code: 'git stash save "备注信息"' },
        { desc: '查看储藏列表', code: 'git stash list' },
        { desc: '应用最近的储藏并删除记录', code: 'git stash pop' },
        { desc: '应用指定储藏', code: 'git stash apply stash@{n}' },
        { desc: '删除所有储藏', code: 'git stash clear' }
      ]
    }
  ];

  const filteredData = computed(() => {
    if (!searchQuery.value) return gitData;
    const q = searchQuery.value.toLowerCase();
    return gitData
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          i =>
            i.desc.toLowerCase().includes(q) ||
            i.code.toLowerCase().includes(q) ||
            (i.tips && i.tips.toLowerCase().includes(q))
        )
      }))
      .filter(cat => cat.items.length > 0);
  });

  const totalResults = computed(() =>
    filteredData.value.reduce((sum, cat) => sum + cat.items.length, 0)
  );

  const copyCode = async code => {
    await copyToClipboard(code, { success: '✔ 已复制: ' + code });
  };
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
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .brutal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brutal-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: -2px;
    text-shadow: 4px 4px 0px #f05032;
  }

  .brutal-title span {
    color: #f05032;
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

  .git-badge {
    background: #f05032;
    color: #fff;
    padding: 0.5rem 1.2rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    border: 4px solid #111;
    box-shadow: 5px 5px 0px #111;
  }

  /* Search */
  .search-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0;
    width: 100%;
    max-width: 700px;
    border: 4px solid #111;
    background: #fff;
    box-shadow: 8px 8px 0px #111;
    transition: all 0.1s;
  }

  .search-box:focus-within {
    transform: translate(-2px, -2px);
    box-shadow: 10px 10px 0px #111;
  }

  .search-icon {
    padding: 0 1rem;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .brutal-search {
    flex: 1;
    border: none;
    outline: none;
    padding: 1.1rem 0;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1.1rem;
    font-weight: 600;
    background: transparent;
    color: #111;
  }

  .brutal-search::placeholder {
    color: #aaa;
  }

  .clear-search {
    border: none;
    border-left: 3px solid #111;
    background: #fff;
    padding: 0 1rem;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    height: 100%;
    color: #ff4b4b;
    transition: background 0.1s;
  }

  .clear-search:hover {
    background: #ffeded;
  }

  .search-hint {
    font-weight: 700;
    font-size: 0.95rem;
    color: #555;
  }

  /* Categories */
  .categories {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .category-block {
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
    background: #fff;
    transition: transform 0.2s;
  }

  .category-block:hover {
    transform: translate(-4px, -4px);
    box-shadow: 16px 16px 0px #111;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
  }

  .cat-icon {
    font-size: 1.5rem;
  }

  .category-title {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.3rem;
    font-weight: 800;
    margin: 0;
    flex: 1;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #111;
  }

  .cat-count {
    background: #111;
    color: #ffd900;
    padding: 0.2rem 0.6rem;
    font-family: 'Syne', sans-serif;
    font-weight: 900;
    font-size: 0.85rem;
  }

  .commands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    gap: 0;
  }

  .command-card {
    border-right: 3px solid #ddd;
    border-bottom: 3px solid #ddd;
    padding: 1.25rem 1.5rem;
    cursor: pointer;
    transition: background 0.1s;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
  }

  .command-card:hover {
    background: #fdfae5;
  }
  .command-card:hover .copy-hint {
    opacity: 1;
  }

  .cmd-desc {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 700;
    font-size: 1rem;
    color: #111;
  }

  .code-box {
    background: #111;
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .code-box code {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.95rem;
    font-weight: 600;
    color: #00e572;
    flex: 1;
    overflow-wrap: break-word;
    word-break: break-all;
  }

  .copy-hint {
    font-size: 0.75rem;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    color: #ffd900;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.15s;
  }

  .cmd-tips {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
    background: #f8f8f0;
    border-left: 4px solid #f59e0b;
    padding: 0.5rem 0.75rem;
  }

  .tips-icon {
    flex-shrink: 0;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 5rem 2rem;
    border: 4px dashed #aaa;
    font-weight: 700;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    .brutal-title {
      font-size: 2rem;
    }
    .commands-grid {
      grid-template-columns: 1fr;
    }
    .brutal-wrapper {
      padding: 1rem;
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
  [data-theme='dark'] .brutal-btn:hover {
    box-shadow: 9px 9px 0px #eee;
  }
  [data-theme='dark'] .brutal-btn:active {
    box-shadow: 0px 0px 0px #eee;
  }

  [data-theme='dark'] .search-box {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 8px 8px 0px #eee;
  }
  [data-theme='dark'] .search-box:focus-within {
    box-shadow: 10px 10px 0px #eee;
  }
  [data-theme='dark'] .brutal-search {
    color: #eee;
  }
  [data-theme='dark'] .clear-search {
    background: #1a1a1a;
    border-left-color: #eee;
  }
  [data-theme='dark'] .clear-search:hover {
    background: #2a0a0a;
  }

  [data-theme='dark'] .category-block {
    background: #1a1a1a;
    border-color: #eee;
    box-shadow: 12px 12px 0px #eee;
  }
  [data-theme='dark'] .category-block:hover {
    box-shadow: 16px 16px 0px #eee;
  }
  [data-theme='dark'] .category-header {
    border-bottom-color: #eee;
  }
  [data-theme='dark'] .category-title {
    color: #111;
  }

  [data-theme='dark'] .command-card {
    border-right-color: #333;
    border-bottom-color: #333;
  }
  [data-theme='dark'] .command-card:hover {
    background: #222;
  }
  [data-theme='dark'] .cmd-desc {
    color: #eee;
  }
  [data-theme='dark'] .cmd-tips {
    background: #1a1400;
    border-left-color: #b86c00;
    color: #ccc;
  }
  [data-theme='dark'] .empty-state {
    border-color: #555;
  }
  [data-theme='dark'] .brutal-title span {
    text-shadow: 4px 4px 0px #eee;
  }
  [data-theme='dark'] .search-hint {
    color: #aaa;
  }
</style>
