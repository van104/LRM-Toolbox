<template>
  <div class="git-cheatsheet">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon> 返回
      </button>
      <div class="nav-center">
        <h1>Git 常用命令备忘录</h1>
        <span class="nav-subtitle">Git Command CheatSheet</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      
      <div class="search-section">
        <el-input
v-model="searchQuery" placeholder="搜索 Git 命令或关键词 (例如: merge, undo, config)..." prefix-icon="Search"
          class="search-bar" clearable />
      </div>

      
      <div class="content-grid">
        <div v-for="cat in filteredData" :key="cat.title" class="category-block">
          <h2 class="category-title">
            <el-icon>
              <Collection />
            </el-icon> {{ cat.title }}
          </h2>
          <div class="commands-list">
            <div v-for="cmd in cat.items" :key="cmd.code" class="command-card glass-card">
              <div class="card-top">
                <span class="cmd-desc">{{ cmd.desc }}</span>
                <el-button :icon="CopyDocument" link @click="copyCode(cmd.code)" />
              </div>
              <div class="code-box">
                <code>{{ cmd.code }}</code>
              </div>
              <div v-if="cmd.tips" class="cmd-tips">
                <el-icon>
                  <InfoFilled />
                </el-icon> {{ cmd.tips }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">
      © 2026 LRM工具箱 - Git 常用命令备忘录
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Back, Search, CopyDocument, Collection, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()
const searchQuery = ref('')

const gitData = [
  {
    title: '基础配置 & 初始化 (Setup)',
    items: [
      { desc: '配置全局用户名', code: 'git config --global user.name "你的名字"' },
      { desc: '配置全局邮箱', code: 'git config --global user.email "you@example.com"' },
      { desc: '初始化本地仓库', code: 'git init' },
      { desc: '克隆远程仓库', code: 'git clone <url>' },
    ]
  },
  {
    title: '分支操作 (Branching)',
    items: [
      { desc: '列出所有本地分支', code: 'git branch' },
      { desc: '创建并切换到新分支', code: 'git checkout -b <name>' },
      { desc: '切换分支', code: 'git checkout <name>' },
      { desc: '合并分支到当前分支', code: 'git merge <branch>' },
      { desc: '重命名当前分支', code: 'git branch -m <new-name>' },
      { desc: '删除本地分支 (已合并)', code: 'git branch -d <name>' },
      { desc: '强制删除本地分支', code: 'git branch -D <name>' },
    ]
  },
  {
    title: '暂存 & 提交 (Snapshotting)',
    items: [
      { desc: '添加指定文件到暂存区', code: 'git add <file>' },
      { desc: '添加所有修改到暂存区', code: 'git add .' },
      { desc: '提交暂存区内容到仓库', code: 'git commit -m "commit message"' },
      { desc: '修改最后一次提交信息', code: 'git commit --amend' },
      { desc: '查看工作区状态', code: 'git status' },
    ]
  },
  {
    title: '撤销 & 回滚 (Undo)',
    items: [
      { desc: '撤销暂存区文件 (保持工作区不变)', code: 'git reset <file>', tips: '相当于 git restore --staged <file>' },
      { desc: '回退到指定版本 (保留修改)', code: 'git reset --soft <commit-id>', tips: '修改会处于已暂存状态' },
      { desc: '强制回退到指定版本 (丢失修改)', code: 'git reset --hard <commit-id>', tips: '慎用！工作区和暂存区都会被重置' },
      { desc: '撤销指定文件的修改', code: 'git checkout -- <file>', tips: '新版本建议用 git restore <file>' },
      { desc: '反转提交 (创建一个对冲提交)', code: 'git revert <commit-id>' },
    ]
  },
  {
    title: '远程同步 (Remote)',
    items: [
      { desc: '查看远程仓库信息', code: 'git remote -v' },
      { desc: '拉取远程代码并合并', code: 'git pull origin <branch>' },
      { desc: '推送到远程仓库', code: 'git push origin <branch>' },
      { desc: '强制推送', code: 'git push -f origin <branch>', tips: '非必要不建议强制推送' },
    ]
  },
  {
    title: '储藏 (Stashing)',
    items: [
      { desc: '储藏当前工作区修改', code: 'git stash' },
      { desc: '查看储藏列表', code: 'git stash list' },
      { desc: '应用最近的储藏并删除记录', code: 'git stash pop' },
      { desc: '删除所有储藏', code: 'git stash clear' },
    ]
  }
]

const filteredData = computed(() => {
  if (!searchQuery.value) return gitData
  const q = searchQuery.value.toLowerCase()
  return gitData
    .map(cat => ({
      ...cat,
      items: cat.items.filter(i =>
        i.desc.toLowerCase().includes(q) || i.code.toLowerCase().includes(q)
      )
    }))
    .filter(cat => cat.items.length > 0)
})

const copyCode = async (code) => {
  try {
    await toClipboard(code)
    ElMessage.success({ message: '已复制: ' + code, duration: 2000 })
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.git-cheatsheet {
  --primary: #f05032;
  
  --bg: #f8fafc;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
}

.nav-center {
  text-align: center;
}

.nav-center h1 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.nav-subtitle {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.search-section {
  margin-bottom: 3rem;
  display: flex;
  justify-content: center;
}

.search-bar {
  max-width: 600px;
}

.search-bar :deep(.el-input__wrapper) {
  border-radius: 50px;
  padding: 0 20px;
  height: 50px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.category-block {
  margin-bottom: 4rem;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 1.5rem;
  padding-bottom: 10px;
  border-bottom: 3px solid #f1f5f9;
}

.category-title .el-icon {
  color: var(--primary);
}

.commands-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.command-card {
  padding: 1.25rem;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  background: white;
  border: 1px solid var(--border);
}

.command-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.cmd-desc {
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
}

.code-box {
  background: #1e293b;
  color: #38bdf8;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  overflow-x: auto;
}

.cmd-tips {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .category-title {
    font-size: 1.25rem;
  }
}
</style>
