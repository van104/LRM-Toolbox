<template>
  <div class="adventure-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">
        <el-icon><Back /></el-icon> 返回
      </button>
      <div class="nav-center">
        <h1>文字冒险</h1>
        <span class="nav-subtitle">Text Adventure</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      
      <div v-if="!currentStory" class="story-selection fade-in">
        <h2 class="section-title">选择剧本</h2>
        <div class="stories-grid">
          <div v-for="story in stories" :key="story.id" class="story-card" @click="selectStory(story)">
            <div class="story-header">
              <h3>{{ story.title }}</h3>
              <el-tag :type="getCategoryType(story.category)">{{ story.category }}</el-tag>
            </div>
            <p class="story-desc">{{ story.summary }}</p>
            <div class="story-footer">
               <span class="difficulty">难度: {{ story.difficulty }}</span>
               <el-button type="primary" round class="start-btn">开始旅程</el-button>
            </div>
          </div>
        </div>
      </div>

      
      <div v-else class="game-container fade-in">
        <div class="game-layout">
          
          <div class="text-panel glass-panel">
            <div class="story-header-small">
               <h3>{{ currentStory.title }}</h3>
               <el-button link @click="quitGame">退出</el-button>
            </div>
            <div ref="logRef" class="log-scroll">
              <div v-for="(log, idx) in gameLogs" :key="idx" class="log-item fade-in-up">
                 <div v-if="log.type === 'text'" class="narrative">{{ log.content }}</div>
                 <div v-if="log.type === 'choice'" class="choice-record">> {{ log.content }}</div>
                 <div v-if="log.type === 'sys'" class="sys-msg">{{ log.content }}</div>
              </div>
              <div v-if="isTyping" class="typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>

          
          <div class="interaction-panel">
             
             <div class="status-bar glass-panel">
                 <div class="status-item">
                    <span class="label">HP</span>
                    <el-progress :percentage="(stats.hp / stats.maxHp) * 100" :format="() => `${stats.hp}/${stats.maxHp}`" color="#f56c6c" />
                 </div>
                 <div class="status-item">
                    <el-icon><Coin /></el-icon> <span>{{ stats.gold }}</span>
                 </div>
                 <div class="status-item inventory-popover">
                    <el-popover placement="top" :width="200" trigger="hover">
                      <template #reference>
                        <div class="bag-icon">
                           <el-icon><Goods /></el-icon> <span>包裹 ({{ stats.inventory.length }})</span>
                        </div>
                      </template>
                      <ul class="inventory-list">
                         <li v-for="(item, i) in stats.inventory" :key="i">{{ item }}</li>
                         <li v-if="stats.inventory.length === 0" class="empty">空空如也</li>
                      </ul>
                    </el-popover>
                 </div>
             </div>

             
             <div class="choices-container">
                <button 
                  v-for="(choice, idx) in currentChoices" 
                  :key="idx"
                  class="choice-btn glass-btn fade-in-up"
                  :style="{ animationDelay: idx * 0.1 + 's' }"
                  :disabled="!canChoose(choice)"
                  @click="makeChoice(choice)"
                >
                  <span class="choice-text">{{ choice.text }}</span>
                  <span v-if="choice.cost" class="cost-tag">💰 -{{ choice.cost.gold }}</span>
                  <span v-if="!canChoose(choice)" class="lock-tag"><Lock /> 条件不足</span>
                </button>
             </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
    Back, Coin, Goods, Lock
} from '@element-plus/icons-vue';
import { textAdventureStories } from '@/data/textAdventureStories';

const router = useRouter();
const stories = ref(textAdventureStories);
const currentStory = ref(null);
const currentNodeId = ref('');
const gameLogs = ref([]);
const stats = ref({});
const isTyping = ref(false);
const logRef = ref(null);

const currentChoices = computed(() => {
    if (!currentStory.value || !currentNodeId.value) return [];
    const node = currentStory.value.nodes[currentNodeId.value];
    return node ? node.choices : [];
});

function getCategoryType(cat) {
    if (cat === '武侠') return 'danger';
    if (cat === '奇幻') return 'primary';
    return 'info';
}

function goBack() {
    if (currentStory.value) {
        
        currentStory.value = null;
    } else {
        router.back();
    }
}

function selectStory(story) {
    currentStory.value = story;
    stats.value = JSON.parse(JSON.stringify(story.initialState)); 
    gameLogs.value = [];
    loadNode(story.startNode);
}

function quitGame() {
    currentStory.value = null;
}

function loadNode(nodeId) {
    if (nodeId === '__RESTART__') {
        selectStory(currentStory.value);
        return;
    }

    currentNodeId.value = nodeId;
    const node = currentStory.value.nodes[nodeId];
    
    if (node) {
        addLog(node.text, 'text');
    } else {
        addLog(`Error: Node ${nodeId} not found.`, 'sys');
    }
}

function addLog(content, type) {
    isTyping.value = true;
    
    
    setTimeout(() => {
        gameLogs.value.push({ content, type });
        isTyping.value = false;
        nextTick(scrollToBottom);
    }, 300);
}

function scrollToBottom() {
    if (logRef.value) {
        logRef.value.scrollTop = logRef.value.scrollHeight;
    }
}

function canChoose(choice) {
    if (choice.cost) {
        if (choice.cost.gold && stats.value.gold < choice.cost.gold) return false;
    }
    if (choice.req) {
        if (choice.req.minStrength && stats.value.strength < choice.req.minStrength) return false;
    }
    return true;
}

function makeChoice(choice) {
    if (isTyping.value) return;
    
    
    if (choice.cost) {
         if (choice.cost.gold) stats.value.gold -= choice.cost.gold;
    }

    
    if (choice.effect) {
        const ef = choice.effect;
        if (ef.hp) {
             stats.value.hp = Math.min(stats.value.maxHp, Math.max(0, stats.value.hp + ef.hp));
             if (ef.hp < 0) addLog(`你失去了 ${-ef.hp} 点生命值`, 'sys');
             else addLog(`你恢复了 ${ef.hp} 点生命值`, 'sys');
        }
        if (ef.gold) {
             stats.value.gold += ef.gold;
             if (ef.gold > 0) addLog(`获得金币 ${ef.gold}`, 'sys');
             else addLog(`失去金币 ${-ef.gold}`, 'sys');
        }
        if (ef.addItems) {
            stats.value.inventory.push(...ef.addItems);
            addLog(`获得物品: ${ef.addItems.join(', ')}`, 'sys');
        }
    }

    
    if (choice.text) {
        
        
        
    }

    
    if (choice.history) {
        
        
    }
    
    loadNode(choice.next);
}

onMounted(() => {
    
});
</script>

<style scoped>
.adventure-tool {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eef2f7;
}

.nav-back, .nav-spacer { width: 100px; }
.nav-back { border: none; background: none; cursor: pointer; display: flex; align-items: center; gap: 5px; color: #606266; }

.main-content {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
}


.story-selection {
    width: 100%;
    max-width: 1000px;
}
.section-title { text-align: center; color: #303133; margin-bottom: 30px; }
.stories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.story-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid #ebeef5;
    display: flex;
    flex-direction: column;
}
.story-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); border-color: #409eff; }

.story-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.story-header h3 { margin: 0; font-size: 1.2rem; color: #303133; }
.story-desc { color: #606266; font-size: 0.9rem; line-height: 1.6; margin-bottom: 20px; flex: 1; }
.story-footer { display: flex; justify-content: space-between; align-items: center; color: #909399; font-size: 0.85rem; }


.game-container {
    width: 100%; height: 100%;
    max-width: 800px;
}

.game-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
}

.glass-panel {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border: 1px solid #fff;
}

.text-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow: hidden;
}

.story-header-small {
    display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;
}
.story-header-small h3 { margin: 0; font-size: 1rem; color: #606266; }

.log-scroll {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.narrative {
    font-size: 1.05rem;
    line-height: 1.8;
    color: #303133;
    white-space: pre-wrap;
}

.sys-msg {
    font-size: 0.85rem;
    color: #909399;
    font-style: italic;
    background: #f4f4f5;
    padding: 5px 10px;
    border-radius: 4px;
    align-self: flex-start;
}

.interaction-panel {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.status-bar {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 15px;
}

.status-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    color: #606266;
}

.choices-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.choice-btn {
    padding: 15px 20px;
    border: none;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    color: #303133;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    transition: all 0.2s;
    text-align: left;
}
.choice-btn:hover:not(:disabled) {
    background: #ecf5ff;
    color: #409eff;
    transform: translateX(5px);
}
.choice-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #f5f7fa;
}

.inventory-list {
    list-style: none; padding: 0; margin: 0;
}
.inventory-list li { padding: 5px 0; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.inventory-list li.empty { color: #999; font-style: italic; text-align: center; }


.fade-in { animation: fadeIn 0.5s ease; }
.fade-in-up { animation: fadeInUp 0.4s ease forwards; opacity: 0; transform: translateY(10px); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.typing-indicator span {
    animation: blink 1.4s infinite both;
    margin: 0 1px;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
</style>
