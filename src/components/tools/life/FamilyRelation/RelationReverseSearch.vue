<template>
  <div class="brutal-pane reverse-pane">
    <div class="pane-header bg-green">
      <span>🔍 反向查询 (SEARCH)</span>
    </div>
    <div class="pane-body reverse-body">
      <div class="reverse-input-wrap">
        <input
          v-model="reverseQuery"
          type="text"
          class="brutal-input reverse-input"
          placeholder="输入称呼，如：伯母、姑父、外甥..."
          @input="handleReverseSearch"
        />
        <button v-if="reverseQuery" class="clear-btn" @click="clearReverse">✖</button>
      </div>

      <div v-if="reverseResults.length > 0" class="reverse-results">
        <div
          v-for="(item, idx) in reverseResults"
          :key="idx"
          class="reverse-item"
          @click="handleApply(item)"
        >
          <div class="reverse-title">{{ item.title }}</div>
          <div class="reverse-chain">
            <span class="chain-start">我</span>
            <template v-for="(step, si) in item.chain" :key="si">
              <span class="chain-arrow-icon">→</span>
              <span class="chain-step">{{ getStepLabel(step) }}</span>
            </template>
            <span class="chain-arrow-icon">=</span>
            <span class="chain-result">{{ item.title }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="reverseQuery && reverseQuery.length >= 1" class="reverse-empty">
        未找到相关称呼 🧐
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { relationDict, labelMap } from './FamilyRelationData.ts';

  const emit = defineEmits(['apply']);

  const reverseQuery = ref('');
  const reverseResults = ref([]);
  let reverseIndex = {};

  const buildReverseIndex = () => {
    const index = {};
    for (const [key, val] of Object.entries(relationDict)) {
      if (['自己', '兄弟', '姐妹'].includes(val)) continue;
      const chainArr = key.split(',');
      if (!index[val]) index[val] = [];
      const exists = index[val].some(r => r.key === key);
      if (!exists) {
        index[val].push({ title: val, chain: chainArr, key });
      }
    }
    return index;
  };

  const getStepLabel = step => labelMap[step] || step;

  const handleReverseSearch = () => {
    const q = reverseQuery.value.trim();
    if (!q) {
      reverseResults.value = [];
      return;
    }
    const results = [];
    for (const [title, items] of Object.entries(reverseIndex)) {
      if (title.includes(q)) {
        results.push(...items);
      }
    }
    results.sort((a, b) => a.chain.length - b.chain.length);
    reverseResults.value = results.slice(0, 20);
  };

  const clearReverse = () => {
    reverseQuery.value = '';
    reverseResults.value = [];
  };

  function handleApply(item) {
    emit('apply', item);
  }

  onMounted(() => {
    reverseIndex = buildReverseIndex();
  });
</script>

<style scoped>
  .brutal-pane {
    border: 4px solid #111;
    background: #fff;
    box-shadow: 10px 10px 0px #111;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pane-header {
    padding: 1rem 1.2rem;
    border-bottom: 4px solid #111;
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    font-size: 1.1rem;
  }

  .bg-green {
    background: #00e572;
  }

  .pane-body {
    padding: 1.25rem;
  }

  .reverse-input-wrap {
    position: relative;
    width: 100%;
  }

  .reverse-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 1rem;
    border: 3px solid #111;
    font-size: 1rem;
    font-weight: 700;
    box-shadow: 4px 4px 0px #111;
    box-sizing: border-box;
  }

  .clear-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #888;
  }

  .reverse-results {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    max-height: 400px;
    overflow-y: auto;
    padding-bottom: 1rem;
  }

  .reverse-item {
    border: 3px solid #111;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.1s;
    background: #fdfae5;
  }

  .reverse-item:hover {
    background: #fff;
    border-color: #00e572;
    box-shadow: 4px 4px 0px #00e572;
  }

  .reverse-title {
    font-weight: 900;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #111;
  }

  .reverse-chain {
    font-size: 0.9rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    color: #555;
  }

  .chain-arrow-icon {
    color: #aaa;
  }

  .chain-step {
    background: #111;
    color: #fff;
    padding: 0.1rem 0.5rem;
    font-size: 0.8rem;
  }

  .chain-result {
    color: #ff4b4b;
    font-weight: 900;
  }

  .reverse-empty {
    margin-top: 1.5rem;
    text-align: center;
    font-weight: 800;
    color: #888;
  }
</style>
