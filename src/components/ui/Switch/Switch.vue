<script setup lang="ts">
  import { SwitchRoot, SwitchThumb } from 'radix-vue';

  defineProps<{
    modelValue?: boolean;
    disabled?: boolean;
    id?: string;
    label?: string;
  }>();

  const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="inline-flex items-center gap-4 cursor-pointer">
    <SwitchRoot
      :id="id"
      :checked="modelValue"
      :disabled="disabled"
      class="w-16 h-8 bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#EEE] relative focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7BE5] data-[state=checked]:bg-[#00E572] dark:data-[state=checked]:bg-[#00994C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[5px_5px_0_0_#000] dark:hover:shadow-[5px_5px_0_0_#EEE] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_#000] dark:active:shadow-[2px_2px_0_0_#EEE]"
      @update:checked="val => emit('update:modelValue', val)"
    >
      <SwitchThumb
        class="block w-5 h-5 bg-black dark:bg-[#EEE] border-2 border-black dark:border-[#EEE] transition-transform duration-200 translate-x-1 data-[state=checked]:translate-x-9 data-[state=checked]:bg-white dark:data-[state=checked]:bg-[#111]"
      />
    </SwitchRoot>
    <label
      v-if="label"
      :for="id"
      class="font-black text-black dark:text-[#EEE] uppercase tracking-widest select-none cursor-pointer"
    >
      {{ label }}
    </label>
  </div>
</template>
