<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    modelValue: string | number;
    type?: string;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    prefixIcon?: string | object;
    suffixIcon?: string | object;
  }>();

  const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

  const handleInput = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLInputElement).value);
  };

  const containerClasses = computed(() => {
    return [
      'relative flex flex-col gap-2 w-full group',
      props.disabled ? 'opacity-60 cursor-not-allowed' : ''
    ];
  });

  const inputClasses = computed(() => {
    return [
      'w-full bg-white dark:bg-[#1a1a1a] text-black dark:text-[#eee]',
      'border-4 border-black dark:border-[#eee] outline-none',
      'font-bold px-4 py-3 text-lg leading-tight',
      'shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#eee]',
      'focus:translate-x-[-2px] focus:translate-y-[-2px] focus:shadow-[6px_6px_0_0_#ff7be5] dark:focus:shadow-[6px_6px_0_0_#ff7be5]',
      'transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600',
      props.error
        ? 'border-red-500 shadow-[4px_4px_0_0_#ff4b4b] focus:shadow-[6px_6px_0_0_#ff4b4b]'
        : '',
      props.disabled ? 'pointer-events-none' : ''
    ];
  });
</script>

<template>
  <div :class="containerClasses">
    <label
      v-if="label"
      class="text-sm font-black uppercase tracking-widest text-black dark:text-[#ccc] ml-1"
    >
      {{ label }}
    </label>

    <div class="relative">
      <div
        v-if="prefixIcon"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-black dark:text-[#eee]"
      >
        <component :is="prefixIcon" class="w-5 h-5" stroke-width="3" />
      </div>

      <input
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[inputClasses, prefixIcon ? 'pl-12' : '', suffixIcon ? 'pr-12' : '']"
        @input="handleInput"
        @focus="$emit('focus')"
        @blur="$emit('blur')"
      />

      <div
        v-if="suffixIcon"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-black dark:text-[#eee]"
      >
        <component :is="suffixIcon" class="w-5 h-5" stroke-width="3" />
      </div>
    </div>

    <transition name="brutal-slide">
      <span v-if="error" class="text-red-500 font-black text-xs ml-1 uppercase tracking-tight">
        Error: {{ error }}
      </span>
    </transition>
  </div>
</template>

<style scoped>
  .brutal-slide-enter-active,
  .brutal-slide-leave-active {
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .brutal-slide-enter-from,
  .brutal-slide-leave-to {
    transform: translateY(-5px);
    opacity: 0;
  }
</style>
