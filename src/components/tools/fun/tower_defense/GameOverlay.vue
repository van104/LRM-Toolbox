<template>
  <div v-if="gameState !== 'playing' && gameState !== 'paused'" class="overlay">
    <div class="overlay-content">
      <h2 v-if="gameState === 'gameover'">GAME OVER</h2>
      <h2 v-else-if="gameState === 'level_complete'">关卡完成!</h2>
      <h2 v-else-if="gameState === 'victory'">恭喜通关!</h2>
      <h2 v-else>TOWER DEFENSE</h2>

      <p v-if="gameState === 'gameover'">
        最终止步: {{ gameMode === 'endless' ? '无尽模式' : '第' + gameLevel + '关' }} - 第{{
          wave
        }}波
      </p>
      <p v-else-if="gameState === 'level_complete'">准备好进入下一关了吗？</p>
      <p v-else-if="gameState === 'victory'">你击败了最终BOSS，守护了家园！</p>
      <p v-else>抵御敌人的进攻，保护你的基地！</p>

      <div class="overlay-btns">
        <template v-if="gameState === 'start'">
          <button class="start-btn" @click="$emit('start-game', 'story')">闯关模式</button>
          <button class="start-btn" @click="$emit('mode-select')">自由模式</button>
          <button class="start-btn" @click="$emit('start-game', 'endless')">无尽模式</button>
        </template>

        <template v-else-if="gameState === 'mode_select'">
          <div class="level-grid">
            <button
              v-for="(map, idx) in levelMaps"
              :key="idx"
              class="level-btn"
              @click="$emit('start-freedom', idx + 1)"
            >
              第 {{ idx + 1 }} 关
            </button>
          </div>
          <button class="cancel-btn" @click="$emit('back-to-start')">返回</button>
        </template>

        <button
          v-else-if="gameState === 'level_complete'"
          class="start-btn"
          @click="$emit('next-level')"
        >
          进入第 {{ gameLevel + 1 }} 关
        </button>

        <button v-else class="start-btn" @click="$emit('back-to-start')">返回主菜单</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { LEVEL_MAPS } from './constants';

  defineProps<{
    gameState: string;
    gameLevel: number;
    gameMode: string;
    wave: number;
  }>();

  defineEmits([
    'start-game', // (mode)
    'mode-select',
    'start-freedom', // (level)
    'back-to-start',
    'next-level'
  ]);

  const levelMaps = LEVEL_MAPS;
</script>

<style scoped>
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(5px);
  }

  .overlay-content {
    background: var(--bg-card);
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
    max-width: 500px;
    width: 90%;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes popIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .overlay-content h2 {
    font-size: 2.5rem;
    color: var(--accent-light, #ecf5ff);
    background: linear-gradient(135deg, #409eff, #3a8ee6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 2px 10px rgba(64, 158, 255, 0.3);
  }

  .overlay-content p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
  }

  .overlay-btns {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .start-btn {
    padding: 1rem 3rem;
    font-size: 1.2rem;
    border-radius: 50px;
    border: none;
    background: linear-gradient(135deg, #409eff, #3a8ee6);
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
    width: 100%;
    max-width: 300px;
  }

  .start-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(64, 158, 255, 0.5);
  }

  .level-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .level-btn {
    padding: 0.8rem;
    border-radius: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .level-btn:hover {
    border-color: var(--accent-color, #409eff);
    background: var(--bg-hover);
  }

  .cancel-btn {
    background: transparent;
    color: var(--text-secondary);
    border: none;
    cursor: pointer;
    padding: 0.5rem;
  }
</style>
