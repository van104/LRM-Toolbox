<template>
  <div class="controls-panel">
    <div class="control-main-grid">
      <!-- 左侧：状态与技能 -->
      <div class="panel-section-left">
        <div class="panel-card stats-card">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="label">生命</span>
              <span class="value heart">❤️ {{ lives }}</span>
            </div>
            <div class="stat-item">
              <span class="label">金钱</span>
              <span class="value money">💰 {{ money }}</span>
            </div>
            <div class="stat-item">
              <span class="label">波次</span>
              <span class="value">
                🌊 {{ wave }}/{{ gameMode === 'endless' ? '∞' : levelConfig?.waves || 10 }}
              </span>
            </div>
            <div class="stat-item">
              <span class="label">能量</span>
              <span class="value mana">⚡ {{ Math.floor(mana) }}</span>
            </div>
          </div>
        </div>

        <div class="panel-card actions-card">
          <div class="skills-panel">
            <h3>主动技能</h3>
            <div class="skill-btns">
              <button
                class="skill-btn"
                :class="{
                  active: selectedSkill === 'meteor',
                  disabled: mana < 40 || !isWaveActive
                }"
                title="陨石冲击 (40能量)"
                @click="$emit('select-skill', 'meteor')"
              >
                <span class="icon">☄️</span>
                <span class="cost">40</span>
              </button>
              <button
                class="skill-btn"
                :class="{
                  active: selectedSkill === 'freeze',
                  disabled: mana < 60 || !isWaveActive
                }"
                title="全场冻结 (60能量)"
                @click="$emit('select-skill', 'freeze')"
              >
                <span class="icon">🧊</span>
                <span class="cost">60</span>
              </button>
            </div>
          </div>

          <div class="game-actions">
            <button
              class="wave-btn"
              :disabled="isWaveActive || gameState !== 'playing'"
              @click="$emit('spawn-wave')"
            >
              {{ isWaveActive ? '波次进行中...' : '下一波敌人' }}
            </button>
            <div class="sub-actions">
              <button class="restart-btn" @click="$emit('restart')">
                <el-icon><Refresh /></el-icon>
                重新开始
              </button>
              <button class="menu-btn" @click="$emit('menu')">
                <el-icon><HomeFilled /></el-icon>
                返回菜单
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：防御塔操作 -->
      <div class="panel-section-right">
        <div class="panel-card towers-card">
          <div v-if="!selectedTowerInstance && !selectedObstacle" class="towers-selection">
            <h3>建造防御塔</h3>
            <div class="tower-options">
              <div
                v-for="(type, key) in TOWER_TYPES"
                :key="key"
                class="tower-card"
                :class="{ active: selectedTowerType === key, disabled: money < type.cost }"
                @click="$emit('select-tower-type', key)"
              >
                <div class="tower-icon-wrapper" :class="key">
                  <span class="tower-emoji">{{ type.emoji }}</span>
                </div>
                <div class="tower-info">
                  <span class="name">{{ type.name }}</span>
                  <span class="cost">💰{{ type.cost }}</span>
                </div>
              </div>
            </div>
            <div v-if="selectedTowerType" class="selected-type-info">
              <p class="type-desc">{{ TOWER_TYPES[selectedTowerType].desc }}</p>
            </div>
          </div>

          <div v-else-if="selectedObstacle" class="upgrade-panel">
            <h3>清理障碍物</h3>
            <div class="selected-tower-preview">
              <span class="preview-emoji">{{ selectedObstacle.type === 4 ? '🪨' : '🌳' }}</span>
              <div class="preview-info">
                <span class="name">{{
                  selectedObstacle.type === 4 ? '坚硬的岩石' : '茂密的树木'
                }}</span>
                <span class="stats"
                  >位置: ({{ selectedObstacle.c }}, {{ selectedObstacle.r }})</span
                >
              </div>
            </div>
            <div class="upgrade-actions">
              <button class="upgrade-btn" :disabled="money < 200" @click="$emit('clear-obstacle')">
                <div class="btn-content">
                  <el-icon><Delete /></el-icon>
                  确认清理 (💰200)
                </div>
              </button>
              <button class="cancel-btn" @click="$emit('deselect')">
                <el-icon><Close /></el-icon>
                取消
              </button>
            </div>
          </div>

          <div v-else-if="selectedTowerInstance" class="upgrade-panel">
            <h3>防御塔升级</h3>
            <div class="selected-tower-preview">
              <span class="preview-emoji">{{ selectedTowerInstance.type.emoji }}</span>
              <div class="preview-info">
                <span class="name">
                  {{ selectedTowerInstance.type.name }} (Lv.{{ selectedTowerInstance.level }})
                </span>
                <span class="stats">
                  攻击: {{ getTowerDamage(selectedTowerInstance) }} | 射速:
                  {{ (((60 / getTowerRate(selectedTowerInstance)) * 60) / 60).toFixed(1) }}/s
                </span>
              </div>
            </div>

            <div class="upgrade-actions">
              <button
                v-if="selectedTowerInstance.level < 3"
                class="upgrade-btn"
                :disabled="money < getUpgradeCost(selectedTowerInstance)"
                @click="$emit('upgrade-tower')"
              >
                <div class="btn-content">
                  <el-icon><Top /></el-icon>
                  升级 (💰{{ getUpgradeCost(selectedTowerInstance) }})
                </div>
                <span class="upgrade-desc">
                  Lv.{{ selectedTowerInstance.level + 1 }}: 伤害+50% 攻速+10%
                </span>
              </button>
              <button v-else class="upgrade-btn max-level" disabled>
                <el-icon><Trophy /></el-icon>
                已升至顶级
              </button>

              <button class="sell-btn" @click="$emit('sell-tower')">
                <el-icon><Delete /></el-icon>
                出售 (💰{{ Math.floor(selectedTowerInstance.totalCost * 0.6) }})
              </button>

              <button class="cancel-btn" @click="$emit('deselect')">
                <el-icon><Close /></el-icon>
                取消选择
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Refresh, Top, Delete, Close, Trophy, HomeFilled } from '@element-plus/icons-vue';
  import { TOWER_TYPES } from './constants';
  import type { TowerInstance, LevelConfig } from './types';

  defineProps<{
    money: number;
    lives: number;
    wave: number;
    mana: number;
    selectedSkill: string | null;
    isWaveActive: boolean;
    gameState: string;
    selectedTowerType: string | null;
    selectedTowerInstance: TowerInstance | null;
    selectedObstacle: { r: number; c: number; type: number } | null;
    gameLevel: number;
    gameMode: string;
    levelConfig: LevelConfig;
  }>();

  defineEmits([
    'select-skill',
    'spawn-wave',
    'restart',
    'menu',
    'select-tower-type',
    'clear-obstacle',
    'deselect',
    'upgrade-tower',
    'sell-tower'
  ]);

  function getTowerDamage(tower: TowerInstance) {
    const base = tower.type.baseDamage; // 使用 type.baseDamage 而不是 tower.baseDamage
    // 增加判断以防 tower.type 为空
    if (!base) return 0;
    return Math.floor(base * Math.pow(1.5, tower.level - 1));
  }

  function getTowerRate(tower: TowerInstance) {
    const base = tower.type.baseRate;
    if (!base) return 1;
    return Math.max(5, Math.floor(base * Math.pow(0.9, tower.level - 1)));
  }

  function getUpgradeCost(tower: TowerInstance) {
    return Math.floor(tower.type.cost * Math.pow(1.8, tower.level));
  }
</script>

<style scoped>
  /* 这里放置从主组件提取的 CSS */
  .controls-panel {
    flex: 1;
    background: var(--bg-card);
    border-top: 1px solid var(--border-color);
    padding: 1rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .control-main-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1rem;
    height: 100%;
  }

  .panel-section-left,
  .panel-section-right {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }

  .panel-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1rem;
    border: 1px solid var(--border-color);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  .stats-card {
    flex-shrink: 0;
  }

  .actions-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .stat-item .label {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-item .value {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: monospace;
  }

  .value.heart {
    color: #f56c6c;
  }
  .value.money {
    color: #e6a23c;
  }
  .value.mana {
    color: #409eff;
  }

  .skills-panel h3,
  .towers-selection h3,
  .upgrade-panel h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .skill-btns {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .skill-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.75rem;
    border-radius: 8px;
    background: var(--bg-card);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .skill-btn:hover:not(.disabled) {
    border-color: var(--accent-color, #409eff);
    transform: translateY(-2px);
  }

  .skill-btn.active {
    background: var(--accent-light, #ecf5ff);
    border-color: var(--accent-color, #409eff);
  }

  .skill-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(100%);
  }

  .skill-btn .icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }

  .skill-btn .cost {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .game-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .wave-btn {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 700;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #f56c6c, #e64242);
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(245, 108, 108, 0.3);
    transition: all 0.2s;
  }

  .wave-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(245, 108, 108, 0.4);
  }

  .wave-btn:disabled {
    background: var(--text-disabled);
    cursor: not-allowed;
    box-shadow: none;
  }

  .sub-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .restart-btn,
  .menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.6rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .restart-btn:hover,
  .menu-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
    border-color: var(--text-tertiary);
  }

  /* Tower & Upgrade Styles */
  .towers-card {
    height: 100%;
    overflow-y: auto;
  }

  .tower-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .tower-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem;
    background: var(--bg-card);
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .tower-card:hover:not(.disabled) {
    border-color: var(--accent-color, #409eff);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tower-card.active {
    background: var(--accent-light, #ecf5ff);
    border-color: var(--accent-color, #409eff);
  }

  .tower-card.disabled {
    opacity: 0.5;
    filter: grayscale(100%);
    cursor: not-allowed;
  }

  .tower-icon-wrapper {
    font-size: 1.8rem;
    margin-bottom: 0.25rem;
  }

  .tower-info {
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .tower-info .name {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .tower-info .cost {
    font-size: 0.7rem;
    color: #e6a23c;
    font-weight: 700;
  }

  .selected-type-info {
    padding: 0.75rem;
    background: var(--bg-status-info);
    border-radius: 6px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .upgrade-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .selected-tower-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-card);
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .preview-emoji {
    font-size: 2.5rem;
  }

  .preview-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .preview-info .name {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .preview-info .stats {
    font-size: 0.8rem;
    color: var(--text-secondary);
    font-family: monospace;
  }

  .upgrade-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .upgrade-btn,
  .sell-btn,
  .cancel-btn {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    border: none;
    transition: all 0.2s;
  }

  .btn-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .upgrade-btn {
    background: linear-gradient(135deg, #67c23a, #529b2e);
    color: white;
    box-shadow: 0 4px 10px rgba(103, 194, 58, 0.3);
  }

  .upgrade-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(103, 194, 58, 0.4);
  }

  .upgrade-btn:disabled {
    background: var(--text-disabled);
    box-shadow: none;
    cursor: not-allowed;
  }

  .upgrade-btn.max-level {
    background: linear-gradient(135deg, #e6a23c, #d48806);
    cursor: default;
  }

  .upgrade-desc {
    font-size: 0.7rem;
    opacity: 0.9;
    font-weight: normal;
  }

  .sell-btn {
    background: var(--bg-card);
    border: 1px solid #f56c6c;
    color: #f56c6c;
    flex-direction: row;
  }

  .sell-btn:hover {
    background: #fef0f0;
  }

  .cancel-btn {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    flex-direction: row;
  }

  .cancel-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    .control-main-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
