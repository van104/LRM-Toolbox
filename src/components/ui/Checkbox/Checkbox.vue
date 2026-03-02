<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
    error?: boolean;
  }>();

  const emit = defineEmits(['update:modelValue', 'change']);

  const toggle = () => {
    if (props.disabled) return;
    emit('update:modelValue', !props.modelValue);
    emit('change', !props.modelValue);
  };

  const boxClasses = computed(() => {
    return [
      'w-8 h-8 flex items-center justify-center transition-all duration-100',
      'border-4 border-black dark:border-[#eee] outline-none',
      props.modelValue
        ? 'bg-[#ff7be5] shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#eee]'
        : 'bg-white dark:bg-[#222] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#eee]',
      props.disabled
        ? 'opacity-50 grayscale'
        : 'hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#eee]',
      props.error ? 'border-red-500' : ''
    ];
  });
</script>

<template>
  <div
    class="inline-flex items-center gap-4 cursor-pointer select-none group focus:outline-none"
    tabindex="0"
    @click="toggle"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <div :class="boxClasses">
      <svg
        v-if="modelValue"
        class="w-6 h-6 text-black dark:text-white transition-opacity duration-100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="5"
        stroke-linecap="square"
        stroke-linejoin="miter"
      >
        <path d="M20 6L9 17L4 12" />
      </svg>
    </div>
    <span v-if="label" class="font-black text-lg text-black dark:text-[#eee] tracking-tight">
      {{ label }}
    </span>
  </div>
</template>
