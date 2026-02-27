<template>
  <el-dialog
    v-model="visible"
    :title="t('footer.feedbackTitle')"
    width="500px"
    class="brutal-dialog brutal-dialog-yellow"
    append-to-body
    @close="$emit('update:modelValue', false)"
  >
    <el-form :model="feedbackForm" label-position="top" class="brutal-form">
      <el-form-item :label="t('footer.feedbackType')">
        <el-select
          v-model="feedbackForm.type"
          :placeholder="t('footer.feedbackTypePlaceholder')"
          style="width: 100%"
        >
          <el-option :label="t('footer.featureRequest')" value="feature" />
          <el-option :label="t('footer.bugReport')" value="bug" />
          <el-option :label="t('footer.otherIssue')" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('footer.feedbackContent')">
        <el-input
          v-model="feedbackForm.content"
          type="textarea"
          :rows="4"
          :placeholder="t('footer.feedbackPlaceholder')"
        />
      </el-form-item>
      <el-form-item :label="t('footer.contact')">
        <el-input v-model="feedbackForm.contact" :placeholder="t('footer.contactPlaceholder')" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="brutal-dialog-actions">
        <button class="brutal-btn-secondary" @click="visible = false">
          {{ t('footer.cancel') }}
        </button>
        <button class="brutal-btn-primary" :disabled="isSubmitting" @click="submitFeedback">
          {{ t('footer.submit') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { ElMessage } from 'element-plus';
  import { submitFeedbackToBackend } from '@/api/feedback';

  const props = defineProps({
    modelValue: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const { t } = useI18n();

  const isSubmitting = ref(false);
  const feedbackForm = ref({
    type: 'feature',
    content: '',
    contact: ''
  });

  const visible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  });

  const submitFeedback = async () => {
    if (!feedbackForm.value.content) {
      ElMessage.warning(t('footer.feedbackPlaceholder'));
      return;
    }

    isSubmitting.value = true;
    try {
      await submitFeedbackToBackend(feedbackForm.value);
      ElMessage.success(t('footer.feedbackSuccess'));
      visible.value = false;
      feedbackForm.value = {
        type: 'feature',
        content: '',
        contact: ''
      };
    } catch (error) {
      ElMessage.error(t('footer.feedbackError'));
      console.error(error);
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<style scoped>
  .brutal-dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;
  }
</style>
