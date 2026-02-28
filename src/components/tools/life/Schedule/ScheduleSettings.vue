<template>
  <div
    v-if="modelValue"
    class="brutal-modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="brutal-modal-content brutal-pane" style="max-width: 500px">
      <div class="pane-header bg-dark text-white">
        <span>⚙️ 学期设置</span>
        <button class="close-btn text-white" @click="$emit('update:modelValue', false)">✖</button>
      </div>
      <div class="pane-body">
        <div class="brutal-form">
          <div class="form-group">
            <label>开学日期 (第一周周一)</label>
            <input v-model="form.start_date" type="date" class="brutal-input full" />
          </div>
          <div class="form-group">
            <label>总周数</label>
            <input
              v-model.number="form.total_weeks"
              type="number"
              min="1"
              max="52"
              class="brutal-input full"
            />
          </div>

          <hr class="brutal-divider mt-2 mb-2" />

          <label>时间段设置 (节次规则)</label>
          <div class="slots-list mt-2">
            <div v-for="(slot, index) in form.time_slots" :key="index" class="slot-item">
              <input
                v-model="form.time_slots[index]"
                class="brutal-input full mr-1"
                placeholder="HH:mm-HH:mm"
              />
              <button
                class="del-slot-btn"
                :disabled="form.time_slots.length <= 1"
                @click="removeSlot(index)"
              >
                ✖
              </button>
            </div>
            <button
              class="brutal-action-btn mt-2 full"
              style="border-style: dashed"
              @click="addSlot"
            >
              + 追加时间段
            </button>
          </div>
        </div>

        <div class="flex-row mt-4" style="gap: 1rem">
          <button class="brutal-action-btn full" @click="$emit('update:modelValue', false)">
            取消
          </button>
          <button class="brutal-action-btn bg-green text-black full" @click="handleSave">
            保存配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';

  interface Props {
    modelValue?: boolean;
    settings?: {
      start_date: string;
      total_weeks: number;
      time_slots: string[];
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    settings: () => ({
      start_date: '',
      total_weeks: 18,
      time_slots: []
    })
  });

  const emit = defineEmits(['update:modelValue', 'save']);

  const form = reactive({
    start_date: '',
    total_weeks: 18,
    time_slots: [] as string[]
  });

  watch(
    () => props.settings,
    newVal => {
      if (newVal) {
        Object.assign(form, {
          start_date: newVal.start_date || '',
          total_weeks: newVal.total_weeks || 18,
          time_slots: newVal.time_slots ? [...newVal.time_slots] : []
        });
      }
    },
    { immediate: true }
  );

  const addSlot = () => form.time_slots.push('00:00-00:00');
  const removeSlot = (idx: number) => form.time_slots.splice(idx, 1);

  function handleSave() {
    emit('save', { ...form });
  }
</script>

<style scoped>
  .brutal-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .brutal-modal-content {
    width: 90%;
    background: #fff;
    border: 4px solid #111;
    box-shadow: 12px 12px 0px #111;
  }

  .pane-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 4px solid #111;
    font-weight: 800;
  }

  .bg-dark {
    background: #111;
  }
  .text-white {
    color: #fff;
  }
  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .pane-body {
    padding: 1.5rem;
  }

  .brutal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .form-group label {
    display: block;
    font-weight: 800;
    margin-bottom: 0.5rem;
  }
  .brutal-input {
    border: 3px solid #111;
    padding: 0.8rem;
    font-weight: 700;
    width: 100%;
  }

  .slot-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .del-slot-btn {
    background: #ff4b4b;
    color: #fff;
    border: 3px solid #111;
    padding: 0.5rem;
    font-weight: 800;
    cursor: pointer;
  }

  .brutal-action-btn {
    border: 3px solid #111;
    padding: 1rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 4px 4px 0px #111;
    transition: all 0.1s;
    background: #fff;
  }
  .bg-green {
    background: #00e572;
    color: #111;
  }
  .full {
    width: 100%;
  }
  .mt-4 {
    margin-top: 2rem;
  }
  .mr-1 {
    margin-right: 0.5rem;
  }
</style>
