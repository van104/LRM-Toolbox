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
        <h1 class="tool-title">旅行打包清单</h1>
        <span class="tool-subtitle">Travel Checklist</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <el-button>
            操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="reset">重置当前清单</el-dropdown-item>
              <el-dropdown-item command="clear">清空所有勾选</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <main class="tool-content">
      <div class="checklist-tool">
        <div class="scenario-selector">
          <el-radio-group v-model="currentScenario" size="large">
            <el-radio-button v-for="s in scenarios" :key="s.id" :label="s.id">{{
              s.name
            }}</el-radio-button>
          </el-radio-group>
        </div>

        <div class="progress-bar">
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="progress"
            status="success"
          />
        </div>

        <div class="checklist-container glass">
          <div v-for="(group, gIndex) in currentList" :key="gIndex" class="check-group">
            <h3 class="group-title">{{ group.category }}</h3>
            <div class="items-grid">
              <div
                v-for="(item, iIndex) in group.items"
                :key="iIndex"
                class="check-item"
                :class="{ checked: item.checked }"
                @click="toggleItem(gIndex, iIndex)"
              >
                <el-checkbox v-model="item.checked" @click.stop />
                <span class="item-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <footer class="footer">© 2026 LRM工具箱 - 旅行打包清单</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { ArrowLeft, ArrowDown } from '@element-plus/icons-vue';
  import { ElMessageBox, ElMessage } from 'element-plus';

  interface CheckItem {
    name: string;
    checked: boolean;
  }

  interface CheckGroup {
    category: string;
    items: CheckItem[];
  }

  interface Scenario {
    id: string;
    name: string;
    data: CheckGroup[];
  }

  const scenarios: Scenario[] = [
    {
      id: 'general',
      name: '通用/短途',
      data: [
        {
          category: '证件/财务',
          items: [
            { name: '身份证', checked: false },
            { name: '手机', checked: false },
            { name: '充电器/充电宝', checked: false },
            { name: '耳机', checked: false },
            { name: '钥匙', checked: false },
            { name: '现金/银行卡', checked: false },
            { name: '纸巾/湿巾', checked: false }
          ]
        },
        {
          category: '衣物',
          items: [
            { name: '换洗衣物', checked: false },
            { name: '睡衣', checked: false },
            { name: '内衣裤', checked: false },
            { name: '袜子', checked: false },
            { name: '舒适的鞋子', checked: false }
          ]
        },
        {
          category: '洗漱用品',
          items: [
            { name: '牙刷牙膏', checked: false },
            { name: '毛巾', checked: false },
            { name: '洗发水/沐浴露', checked: false },
            { name: '护肤品', checked: false },
            { name: '梳子', checked: false }
          ]
        }
      ]
    },
    {
      id: 'beach',
      name: '海边度假',
      data: [
        {
          category: '海边必备',
          items: [
            { name: '泳衣/泳裤', checked: false },
            { name: '泳镜', checked: false },
            { name: '防晒霜', checked: false },
            { name: '太阳镜', checked: false },
            { name: '遮阳帽', checked: false },
            { name: '沙滩鞋/拖鞋', checked: false },
            { name: '防水袋', checked: false }
          ]
        },
        {
          category: '常规',
          items: [
            { name: '身份证', checked: false },
            { name: '手机', checked: false },
            { name: '充电器', checked: false },
            { name: '换洗衣物', checked: false }
          ]
        }
      ]
    },
    {
      id: 'business',
      name: '商务出差',
      data: [
        {
          category: '办公',
          items: [
            { name: '笔记本电脑', checked: false },
            { name: '电源适配器', checked: false },
            { name: '名片', checked: false },
            { name: '笔记本/笔', checked: false },
            { name: 'U盘/硬盘', checked: false },
            { name: '合同/文件', checked: false }
          ]
        },
        {
          category: '衣物',
          items: [
            { name: '正装/衬衫', checked: false },
            { name: '皮鞋', checked: false },
            { name: '领带', checked: false },
            { name: '便装', checked: false }
          ]
        }
      ]
    },
    {
      id: 'abroad',
      name: '出国旅行',
      data: [
        {
          category: '证件',
          items: [
            { name: '护照', checked: false },
            { name: '签证', checked: false },
            { name: '身份证', checked: false },
            { name: '行程单/酒店预订', checked: false },
            { name: '国际驾照', checked: false },
            { name: '证件复印件', checked: false }
          ]
        },
        {
          category: '工具',
          items: [
            { name: '转换插头', checked: false },
            { name: '随身WiFi/SIM卡', checked: false },
            { name: '谷歌地图离线包', checked: false },
            { name: '翻译软件', checked: false },
            { name: '信用卡(Visa/Master)', checked: false },
            { name: '当地货币', checked: false }
          ]
        }
      ]
    }
  ];

  const currentScenario = ref('general');
  const lists = ref<Record<string, CheckGroup[]>>({});

  // Initialize or load from storage
  const initLists = () => {
    const saved = localStorage.getItem('lrm-travel-checklists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved data with structure (in case structure changed)
        const newLists: Record<string, CheckGroup[]> = {};
        scenarios.forEach(s => {
          if (parsed[s.id]) {
            newLists[s.id] = parsed[s.id];
          } else {
            newLists[s.id] = JSON.parse(JSON.stringify(s.data));
          }
        });
        lists.value = newLists;
      } catch (e) {
        console.error('Failed to load checklists', e);
        resetAll();
      }
    } else {
      resetAll();
    }
  };

  const resetAll = () => {
    const newLists: Record<string, CheckGroup[]> = {};
    scenarios.forEach(s => {
      newLists[s.id] = JSON.parse(JSON.stringify(s.data));
    });
    lists.value = newLists;
  };

  const currentList = computed(() => {
    return lists.value[currentScenario.value] || [];
  });

  const progress = computed(() => {
    let total = 0;
    let checked = 0;
    currentList.value.forEach(group => {
      group.items.forEach(item => {
        total++;
        if (item.checked) checked++;
      });
    });
    return total === 0 ? 0 : Math.round((checked / total) * 100);
  });

  const toggleItem = (gIndex: number, iIndex: number) => {
    currentList.value[gIndex].items[iIndex].checked =
      !currentList.value[gIndex].items[iIndex].checked;
  };

  const handleCommand = (command: string) => {
    if (command === 'reset') {
      ElMessageBox.confirm('确定要重置当前清单吗？所有勾选将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const original = scenarios.find(s => s.id === currentScenario.value);
        if (original) {
          lists.value[currentScenario.value] = JSON.parse(JSON.stringify(original.data));
          ElMessage.success('已重置');
        }
      });
    } else if (command === 'clear') {
      currentList.value.forEach(group => {
        group.items.forEach(item => (item.checked = false));
      });
      ElMessage.success('已清空勾选');
    }
  };

  watch(
    lists,
    newVal => {
      localStorage.setItem('lrm-travel-checklists', JSON.stringify(newVal));
    },
    { deep: true }
  );

  onMounted(() => {
    initLists();
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

  .checklist-tool {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .scenario-selector {
    display: flex;
    justify-content: center;
  }

  .checklist-container {
    padding: 20px;
    border-radius: 12px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .group-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 20px 0 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
  }

  .group-title:first-child {
    margin-top: 0;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .check-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .check-item:hover {
    background: #f1f5f9;
  }

  .check-item.checked {
    background: #f0f9eb;
    border-color: #67c23a;
  }

  .check-item.checked .item-name {
    text-decoration: line-through;
    color: #999;
  }

  .item-name {
    font-size: 0.95rem;
    color: #333;
    user-select: none;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    font-size: 0.85rem;
  }

  @media (max-width: 600px) {
    .items-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
