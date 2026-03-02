<script setup lang="ts">
  import {
    TooltipRoot,
    TooltipTrigger,
    TooltipPortal,
    TooltipContent,
    TooltipProvider,
    TooltipArrow
  } from 'radix-vue';

  defineProps<{
    content?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
  }>();
</script>

<template>
  <TooltipProvider :delay-duration="200">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>

      <TooltipPortal>
        <TooltipContent
          :side="side || 'top'"
          :side-offset="8"
          :align="align || 'center'"
          class="z-[2000] px-3 py-1.5 font-bold bg-[#ffd900] dark:bg-[#333] text-black dark:text-[#eee] border-[3px] border-black dark:border-[#eee] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#eee] data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 text-sm select-none"
        >
          <slot name="content">{{ content }}</slot>
          <TooltipArrow class="fill-black dark:fill-[#eee]" :width="12" :height="6" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
