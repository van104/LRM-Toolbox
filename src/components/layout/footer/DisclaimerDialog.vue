<template>
  <el-dialog
    v-model="visible"
    :title="t('footer.disclaimerTitle')"
    width="500px"
    class="brutal-dialog brutal-dialog-pink"
    append-to-body
    @close="$emit('update:modelValue', false)"
  >
    <div class="disclaimer-content">
      <div
        v-for="(item, idx) in tm('footer.disclaimerPoints')"
        :key="idx"
        class="disclaimer-item mb-4"
      >
        <div class="disclaimer-point-title">
          <strong>{{ rt(item.title) }}</strong>
        </div>
        <div class="disclaimer-point-text">
          {{ rt(item.text, { email: 'powelabraham67@gmail.com' }) }}
        </div>
      </div>
    </div>
    <template #footer>
      <div class="brutal-dialog-actions" style="justify-content: center">
        <button class="brutal-btn-primary width-full" @click="visible = false">
          {{ t('footer.understood') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const props = defineProps({
    modelValue: Boolean
  });

  const emit = defineEmits(['update:modelValue']);

  const { t, tm, rt } = useI18n();

  const visible = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  });
</script>

<style scoped>
  .disclaimer-content {
    line-height: 1.6;
  }
  .mb-4 {
    margin-bottom: 1rem;
  }
  .brutal-btn-primary.width-full {
    width: 100%;
  }
</style>
