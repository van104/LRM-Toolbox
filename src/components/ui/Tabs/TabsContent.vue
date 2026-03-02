<script setup lang="ts">
  import { TabsContent } from 'radix-vue';

  defineProps<{
    value: string;
  }>();
</script>

<template>
  <TabsContent
    :value="value"
    class="bg-white dark:bg-[#1A1A1A] border-4 border-black dark:border-[#EEE] shadow-[12px_12px_0_0_#0EA5E9] p-10 focus:outline-none"
  >
    <slot></slot>
  </TabsContent>
</template>
