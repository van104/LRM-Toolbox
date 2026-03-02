<script setup lang="ts">
  import { AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent } from 'radix-vue';
  import { ChevronDown } from 'lucide-vue-next';

  defineProps<{
    value: string;
    title: string;
  }>();
</script>

<template>
  <AccordionItem
    :value="value"
    class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#EEE] group transition-all"
  >
    <AccordionHeader class="flex">
      <AccordionTrigger
        class="flex flex-1 items-center justify-between p-6 font-black uppercase tracking-widest text-lg text-[#111] dark:text-[#EEE] hover:bg-[#FF7BE5] dark:hover:bg-[#CC42B0] hover:text-white transition-colors outline-none focus-visible:bg-[#FF7BE5] dark:focus-visible:bg-[#CC42B0] focus-visible:text-white data-[state=open]:bg-[#FF7BE5] dark:data-[state=open]:bg-[#CC42B0] data-[state=open]:text-white data-[state=open]:border-b-4 data-[state=open]:border-black dark:data-[state=open]:border-[#EEE]"
      >
        {{ title }}
        <ChevronDown
          class="w-6 h-6 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-data-[state=open]:rotate-180"
          stroke-width="3"
        />
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent
      class="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
    >
      <div class="p-6 bg-[#FDFAE5] dark:bg-[#222]">
        <slot></slot>
      </div>
    </AccordionContent>
  </AccordionItem>
</template>

<style scoped>
  @keyframes slideDown {
    from {
      height: 0;
    }
    to {
      height: var(--radix-accordion-content-height);
    }
  }

  @keyframes slideUp {
    from {
      height: var(--radix-accordion-content-height);
    }
    to {
      height: 0;
    }
  }

  .animate-slideDown {
    animation: slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards;
  }

  .animate-slideUp {
    animation: slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards;
  }
</style>
