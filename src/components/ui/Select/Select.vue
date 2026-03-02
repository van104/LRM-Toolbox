<script setup lang="ts">
  import {
    SelectRoot,
    SelectTrigger,
    SelectValue,
    SelectIcon,
    SelectPortal,
    SelectContent,
    SelectScrollUpButton,
    SelectViewport,
    SelectItem,
    SelectItemText,
    SelectItemIndicator,
    SelectScrollDownButton
  } from 'radix-vue';
  import { ChevronDown, ChevronUp, Check } from 'lucide-vue-next';

  defineProps<{
    modelValue?: string;
    placeholder?: string;
    options: { label: string; value: string }[];
  }>();

  const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <SelectTrigger
      class="inline-flex items-center justify-between w-full px-4 py-2 font-bold bg-white dark:bg-[#111] text-black dark:text-[#eee] border-4 border-black dark:border-[#eee] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#eee] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#eee] focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_0_#000] dark:active:shadow-[0_0_0_0_#eee] cursor-pointer data-[placeholder]:text-gray-500 dark:data-[placeholder]:text-gray-400 group"
    >
      <SelectValue :placeholder="placeholder || '请选择...'" />
      <SelectIcon class="ml-2 transition-transform group-data-[state=open]:rotate-180">
        <ChevronDown class="w-5 h-5" stroke-width="3" />
      </SelectIcon>
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        :side-offset="4"
        class="z-[2000] bg-white dark:bg-[#222] border-4 border-black dark:border-[#eee] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#eee] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
      >
        <SelectScrollUpButton
          class="flex items-center justify-center p-1 cursor-default bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] border-b-[3px] border-black dark:border-[#eee]"
        >
          <ChevronUp class="w-4 h-4" stroke-width="3" />
        </SelectScrollUpButton>

        <SelectViewport class="p-1">
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            class="relative flex items-center px-8 py-2 font-bold text-black dark:text-[#eee] cursor-pointer select-none rounded-none focus:bg-[#00e572] dark:focus:bg-[#00994c] focus:text-black dark:focus:text-white outline-none border-[3px] border-transparent focus:border-black dark:focus:border-[#eee] transition-colors"
          >
            <SelectItemIndicator
              class="absolute left-2 w-4 h-4 inline-flex items-center justify-center"
            >
              <Check class="w-4 h-4" stroke-width="4" />
            </SelectItemIndicator>
            <SelectItemText>{{ option.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>

        <SelectScrollDownButton
          class="flex items-center justify-center p-1 cursor-default bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] border-t-[3px] border-black dark:border-[#eee]"
        >
          <ChevronDown class="w-4 h-4" stroke-width="3" />
        </SelectScrollDownButton>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
