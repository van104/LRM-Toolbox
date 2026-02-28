<template>
  <div
    v-if="modelValue"
    class="brutal-modal-overlay"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="brutal-modal-content brutal-pane" style="max-width: 500px">
      <div class="pane-header bg-yellow text-black">
        <span>{{ isEdit ? '编辑课程' : '添加课程' }}</span>
        <button class="close-btn text-black" @click="$emit('update:modelValue', false)">✖</button>
      </div>
      <div class="pane-body">
        <div v-if="!isEdit" class="paste-parser mb-3">
          <textarea
            v-model="pasteData"
            class="brutal-input full"
            rows="3"
            placeholder="粘贴课程信息识别，格式如：\n计算机网络\n(3-4节)3-12周/6号楼301/张老师"
          ></textarea>
          <button class="brutal-action-btn bg-dark text-white full mt-2" @click="parsePaste">
            自动识别并填充
          </button>
        </div>

        <div class="brutal-form">
          <div class="form-group">
            <label>课程名称 *</label>
            <input
              v-model="form.course_name"
              class="brutal-input full"
              placeholder="请输入课程名称"
            />
          </div>
          <div class="form-group">
            <label>教师姓名 *</label>
            <input v-model="form.teacher" class="brutal-input full" placeholder="请输入教师姓名" />
          </div>
          <div class="form-group">
            <label>上课教室 *</label>
            <input v-model="form.classroom" class="brutal-input full" placeholder="请输入教室" />
          </div>
          <div class="form-group">
            <label>周次范围 *</label>
            <input
              v-model="form.week_range"
              class="brutal-input full"
              placeholder="如：1-18周, 1,3,5周, 1-15周(单)"
            />
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>星期 *</label>
              <select v-model.number="form.week_day" class="brutal-select full">
                <option v-for="(day, idx) in weekDays" :key="idx" :value="idx">
                  {{ day }}
                </option>
              </select>
            </div>
            <div class="form-group half">
              <label>节次 *</label>
              <select v-model.number="form.time_slot" class="brutal-select full">
                <option v-for="(slot, idx) in timeSlots" :key="idx" :value="idx">
                  第 {{ idx + 1 }} 节 ({{ slot }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex-row mt-4" style="gap: 1rem">
          <button class="brutal-action-btn full" @click="$emit('update:modelValue', false)">
            取消
          </button>
          <button class="brutal-action-btn bg-blue text-white full" @click="handleSave">
            保存课程
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import type { Course } from './useSchedule';

  interface Props {
    modelValue?: boolean;
    isEdit?: boolean;
    courseData?: Course | null;
    weekDays?: string[];
    timeSlots?: string[];
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isEdit: false,
    courseData: null,
    weekDays: () => [],
    timeSlots: () => []
  });

  const emit = defineEmits(['update:modelValue', 'save']);

  const pasteData = ref('');
  const form = reactive({
    id: null as number | null,
    course_name: '',
    teacher: '',
    classroom: '',
    week_range: '',
    week_day: 0,
    time_slot: 0
  });

  watch(
    () => props.courseData,
    newVal => {
      if (newVal) {
        Object.assign(form, newVal);
      } else {
        Object.assign(form, {
          id: null,
          course_name: '',
          teacher: '',
          classroom: '',
          week_range: '',
          week_day: 0,
          time_slot: 0
        });
      }
    },
    { immediate: true }
  );

  watch(
    () => props.modelValue,
    newVal => {
      if (newVal && !props.isEdit) {
        pasteData.value = '';
      }
    }
  );

  function parsePaste() {
    if (!pasteData.value) return;
    try {
      const allText = pasteData.value.trim().replace(/\n/g, ' ');

      const timeMatch = allText.match(/\((\d+-\d+节)\)/);
      if (timeMatch) {
        const slotText = timeMatch[1];
        const idx = props.timeSlots.findIndex(s => s.includes(slotText));
        if (idx !== -1) form.time_slot = idx;
      }
      const weekMatch = allText.match(/(\d+-\d+周\(单\)|\d+-\d+周\(双\)|\d+-\d+周)/);
      if (weekMatch) form.week_range = weekMatch[1];

      const parts = allText.split('/');
      if (parts.length >= 2) {
        form.classroom = parts[1].trim();
        if (parts.length >= 3) form.teacher = parts[2].trim();
      }
      let courseName = allText;
      if (timeMatch) courseName = courseName.replace(timeMatch[0], '');
      if (weekMatch) courseName = courseName.replace(weekMatch[0], '');
      const slashIdx = courseName.indexOf('/');
      if (slashIdx !== -1) courseName = courseName.substring(0, slashIdx);
      form.course_name = courseName.trim();
    } catch {
      alert('解析失败');
    }
  }

  function handleSave() {
    if (!form.course_name || !form.teacher || !form.classroom) {
      alert('请填写必填字段');
      return;
    }
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

  .close-btn {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }

  .pane-body {
    padding: 1.5rem;
  }

  .paste-parser textarea {
    width: 100%;
    border: 3px solid #111;
    padding: 0.8rem;
    font-weight: 700;
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
  .brutal-input,
  .brutal-select {
    border: 3px solid #111;
    padding: 0.8rem;
    font-weight: 700;
    width: 100%;
  }

  .form-row {
    display: flex;
    gap: 1rem;
  }
  .half {
    flex: 1;
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
  .bg-dark {
    background: #111;
    color: #fff;
  }
  .bg-blue {
    background: #4b7bff;
    color: #fff;
  }
  .full {
    width: 100%;
  }
</style>
