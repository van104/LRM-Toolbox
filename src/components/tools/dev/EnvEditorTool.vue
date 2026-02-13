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
        <h1 class="tool-title">环境变量模版编辑</h1>
        <span class="tool-subtitle">Environment Variable Editor</span>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="exportExample">
          <el-icon><Download /></el-icon> 导出模版
        </el-button>
      </div>
    </header>

    <main class="tool-content">
      <div class="tool-layout">
        <!-- 左侧快速导入与配置 -->
        <div class="tool-sidebar">
          <div class="panel glass-card">
            <h2 class="panel-title">
              <el-icon><DocumentAdd /></el-icon> 快速导入
            </h2>
            <p class="sidebar-desc">粘贴现有的 .env 内容或上传文件进行解析。</p>
            <el-input
              v-model="rawContent"
              type="textarea"
              :rows="10"
              placeholder="DB_HOST=127.0.0.1
DB_PORT=3306"
              class="mb-4"
            />
            <el-button type="primary" class="w-full" @click="parseRaw"> 解析并加载 </el-button>
          </div>

          <div class="panel glass-card mt-6">
            <h2 class="panel-title">
              <el-icon><Lock /></el-icon> 安全选项
            </h2>
            <div class="option-item">
              <span>一键脱敏导出</span>
              <el-switch v-model="maskValues" />
            </div>
            <p class="option-desc">启用后，导出的文件会将所有 Value 替换为 your_value_here。</p>
          </div>
        </div>

        <!-- 右侧可视化编辑表格 -->
        <div class="tool-main">
          <div class="panel glass-card">
            <div class="table-header">
              <h2 class="panel-title">可视化编辑器</h2>
              <el-button type="success" size="small" @click="addRow">
                <el-icon><Plus /></el-icon> 新增变量
              </el-button>
            </div>

            <el-table :data="envVars" style="width: 100%" class="env-table">
              <el-table-column label="Key (变量名)" width="220">
                <template #default="{ row }">
                  <el-input v-model="row.key" placeholder="API_KEY" size="default" />
                </template>
              </el-table-column>
              <el-table-column label="Value (值)">
                <template #default="{ row }">
                  <el-input
                    v-model="row.value"
                    placeholder="your_secret_here"
                    :type="row.masked ? 'password' : 'text'"
                    size="default"
                  >
                    <template #suffix>
                      <el-icon class="cursor-pointer" @click="row.masked = !row.masked">
                        <View v-if="!row.masked" />
                        <Hide v-else />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
              </el-table-column>
              <el-table-column label="备注/说明" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.comment" placeholder="数据库端口" size="default" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" circle plain @click="removeRow($index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div v-if="envVars.length === 0" class="empty-state">
              <el-empty description="暂无环境变量，请尝试解析或新增项目" />
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 环境变量模版编辑</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {
    ArrowLeft,
    Download,
    DocumentAdd,
    Lock,
    Plus,
    Delete,
    View,
    Hide
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';

  interface EnvVar {
    key: string;
    value: string;
    comment: string;
    masked: boolean;
  }

  const envVars = ref<EnvVar[]>([
    { key: 'APP_NAME', value: 'MyAwesomeApp', comment: '应用项目名称', masked: false },
    { key: 'DB_PASSWORD', value: 'secret123', comment: '核心数据库密码', masked: true }
  ]);

  const rawContent = ref('');
  const maskValues = ref(true);

  const addRow = () => {
    envVars.value.push({ key: '', value: '', comment: '', masked: false });
  };

  const removeRow = (index: number) => {
    envVars.value.splice(index, 1);
  };

  const parseRaw = () => {
    if (!rawContent.value.trim()) {
      ElMessage.warning('请输入解析内容');
      return;
    }

    const lines = rawContent.value.split('\n');
    const newVars: EnvVar[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const parts = trimmed.split('=');
      const key = parts[0]?.trim() || '';
      let value = parts.slice(1).join('=')?.trim() || '';
      let comment = '';

      // 简单解析注释
      if (value.includes('#')) {
        const valParts = value.split('#');
        value = valParts[0].trim();
        comment = valParts.slice(1).join('#').trim();
      }

      if (key) {
        newVars.push({
          key,
          value,
          comment,
          masked:
            key.toLowerCase().includes('key') ||
            key.toLowerCase().includes('pass') ||
            key.toLowerCase().includes('secret')
        });
      }
    });

    if (newVars.length > 0) {
      envVars.value = newVars;
      ElMessage.success(`成功解析 ${newVars.length} 个变量`);
    } else {
      ElMessage.error('解析失败，请检查格式');
    }
  };

  const exportExample = () => {
    if (envVars.value.length === 0) {
      ElMessage.warning('没有可导出的数据');
      return;
    }

    let content = '# Generated by LRM Toolbox Environment Editor\n\n';
    envVars.value.forEach(v => {
      if (v.comment) content += `# ${v.comment}\n`;
      const exportValue = maskValues.value ? 'your_value_here' : v.value;
      content += `${v.key}=${exportValue}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = maskValues.value ? '.env.example' : '.env';
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
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
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sidebar-desc {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 20px;
  }

  .option-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .option-item span {
    font-size: 0.9rem;
    color: #1e293b;
    font-weight: 500;
  }

  .option-desc {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 8px;
  }

  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .env-table {
    border-radius: 8px;
    overflow: hidden;
  }

  .empty-state {
    padding: 40px 0;
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  .mb-4 {
    margin-bottom: 1rem;
  }
  .mt-6 {
    margin-top: 1.5rem;
  }
  .w-full {
    width: 100%;
  }
</style>
