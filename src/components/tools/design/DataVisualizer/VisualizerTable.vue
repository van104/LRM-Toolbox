<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div class="table-card brutal-pane bg-white p-4" :class="{ 'fullscreen-editor': isFullscreen }">
      <div class="card-header flex justify-between items-center mb-4">
        <h3 class="section-label m-0 border-0">📝 数据编辑器</h3>
        <div class="table-actions flex gap-2">
          <button
            class="brutal-btn bg-cyan text-sm py-1 px-3"
            title="全屏编辑"
            @click="toggleFullscreen"
          >
            {{ isFullscreen ? '收起界面' : '🔍 全屏模式' }}
          </button>
          <button class="brutal-btn bg-yellow text-sm py-1 px-3" title="添加行" @click="addRow">
            + 行
          </button>
          <button
            class="brutal-btn bg-blue text-white text-sm py-1 px-3"
            title="添加列"
            @click="addColumn"
          >
            + 列
          </button>
        </div>
      </div>

      <div class="table-wrapper brutal-table-container">
        <table class="brutal-table w-full text-left">
          <thead>
            <tr>
              <th class="w-12 bg-yellow">#</th>
              <th v-for="(col, cIdx) in columns" :key="cIdx" class="relative group bg-yellow">
                <div class="flex items-center justify-between">
                  <input
                    :value="rawData[0][cIdx]"
                    class="th-input brutal-input flex-1"
                    @change="updateCell(0, cIdx, $event.target.value)"
                  />
                  <button
                    v-if="columns.length > 2"
                    class="del-col-btn brutal-btn ml-2 bg-pink text-white"
                    title="删除此列"
                    @click="removeColumn(cIdx)"
                  >
                    ✕
                  </button>
                </div>
              </th>
              <th class="w-16 bg-yellow text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rIdx) in editableRows" :key="rIdx">
              <td
                class="row-idx font-bold text-center bg-gray-100 border-b-2 border-r-2 border-black"
              >
                {{ rIdx + 1 }}
              </td>
              <td
                v-for="(cell, cIdx) in row"
                :key="cIdx"
                class="p-1 border-b-2 border-r-2 border-black"
              >
                <input
                  :value="rawData[rIdx + 1][cIdx]"
                  class="td-input brutal-input w-full"
                  style="border-width: 2px"
                  @change="updateCell(rIdx + 1, cIdx, $event.target.value)"
                />
              </td>
              <td class="text-center border-b-2 border-black p-1">
                <button
                  class="del-row-btn brutal-btn bg-pink text-white py-1 px-2"
                  title="删除当前行"
                  @click="removeRow(rIdx + 1)"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="rawData.length > 100"
        class="limit-hint mt-4 p-2 bg-yellow border-2 border-black font-bold text-center"
      >
        ⚠️ 为保证性能，仅显示前 100 行数据供编辑
      </div>
    </div>
  </Teleport>
</template>

<script setup>
  import { ref, computed, nextTick } from 'vue';
  import { ElMessage } from 'element-plus';

  const props = defineProps({
    rawData: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  });

  const emit = defineEmits(['update:rawData', 'change', 'config-update']);

  const isFullscreen = ref(false);

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value;
    if (isFullscreen.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  const editableRows = computed(() => {
    if (props.rawData.length <= 1) return [];
    return props.rawData.slice(1, 101);
  });

  function updateCell(rIdx, cIdx, value) {
    const newData = [...props.rawData];
    newData[rIdx] = [...newData[rIdx]];
    newData[rIdx][cIdx] = value;
    emit('update:rawData', newData);
    emit('change');
  }

  function addRow() {
    const colCount = props.rawData[0].length;
    const newRow = new Array(colCount).fill(0);
    const newData = [...props.rawData, newRow];
    emit('update:rawData', newData);
    emit('change');
    nextTick(() => {
      const tableDiv = document.querySelector('.brutal-table-container');
      if (tableDiv) tableDiv.scrollTop = tableDiv.scrollHeight;
    });
  }

  function removeRow(idx) {
    if (props.rawData.length <= 2) {
      ElMessage.error('至少保留一行数据');
      return;
    }
    const newData = [...props.rawData];
    newData.splice(idx, 1);
    emit('update:rawData', newData);
    emit('change');
  }

  function addColumn() {
    const newData = props.rawData.map((row, idx) => {
      if (idx === 0) {
        return [...row, `列 ${row.length + 1}`];
      }
      return [...row, 0];
    });
    emit('update:rawData', newData);
    emit('change');
  }

  function removeColumn(cIdx) {
    if (props.rawData[0].length <= 2) {
      ElMessage.error('至少保留两列数据');
      return;
    }

    // Update config if the removed column was used as axis
    let newX = props.config.xAxis;
    let newY = props.config.yAxis;

    if (cIdx === newX) newX = '';
    if (cIdx === newY) newY = '';

    if (typeof newX === 'number' && newX > cIdx) newX--;
    if (typeof newY === 'number' && newY > cIdx) newY--;

    emit('config-update', { xAxis: newX, yAxis: newY });

    const newData = props.rawData.map(row => {
      const newRow = [...row];
      newRow.splice(cIdx, 1);
      return newRow;
    });

    emit('update:rawData', newData);
    emit('change');
  }
</script>

<style scoped>
  .section-label {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #111;
  }

  .brutal-table-container {
    border: 4px solid #111;
    background: #fff;
    max-height: 600px;
    overflow: auto;
    width: 100%;
  }

  .brutal-table th {
    font-family: 'Syne', 'Noto Sans SC', sans-serif;
    font-weight: 900;
    padding: 12px;
    border-bottom: 4px solid #111;
    border-right: 2px solid #111;
    color: #111;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .brutal-table th:last-child {
    border-right: none;
  }

  .td-input {
    border: none;
    border-radius: 0;
    padding: 8px;
    font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;
    font-size: 1rem;
    background: transparent;
    transition: background 0.1s;
  }

  .td-input:focus {
    background: #fffbe6;
    outline: 2px solid #111;
    outline-offset: -2px;
  }

  /* Fullscreen Mode Styles */
  .fullscreen-editor {
    position: fixed;
    inset: 2rem;
    z-index: 2100;
    box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 4rem) !important;
  }

  .fullscreen-editor .brutal-table-container {
    max-height: none;
    flex: 1;
  }

  .fullscreen-editor .brutal-table {
    min-width: 100%;
  }

  /* Compact Cell Mode */
  .td-input {
    padding: 6px 8px;
    font-size: 0.95rem;
  }

  @media (max-width: 1400px) {
    .td-input {
      font-size: 0.85rem;
      padding: 4px;
    }
    .th-input {
      font-size: 0.85rem;
    }
  }

  .bg-yellow {
    background-color: #ffd900;
  }
  .bg-blue {
    background-color: #4b7bff;
  }
  .bg-pink {
    background-color: #ff66b2;
  }
  .bg-gray-100 {
    background-color: #f3f4f6;
  }
  .border-black {
    border-color: #000;
  }
</style>
