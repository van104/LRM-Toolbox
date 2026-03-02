<script setup lang="ts">
  import { TabsRoot, TabsList, TabsTrigger } from 'radix-vue';

  defineProps<{
    defaultValue?: string;
    tabs: { value: string; label: string }[];
  }>();
</script>

<template>
  <TabsRoot :default-value="defaultValue" class="flex flex-col w-full">
    <TabsList
      class="flex flex-wrap border-4 border-black dark:border-[#EEE] bg-white dark:bg-[#222] shadow-[10px_10px_0_0_#000] dark:shadow-[10px_10px_0_0_#EEE] mb-12 relative z-10"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="flex-1 py-5 px-6 font-black uppercase tracking-widest text-[#111] dark:text-[#EEE] border-r-4 border-black dark:border-[#EEE] last:border-r-0 hover:bg-[#FFED00] dark:hover:bg-[#C27500] hover:text-black data-[state=active]:bg-[#0EA5E9] dark:data-[state=active]:bg-[#0369A1] data-[state=active]:text-white dark:data-[state=active]:text-white transition-colors outline-none focus-visible:bg-[#FF7BE5] focus-visible:text-white"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>

    <slot></slot>
  </TabsRoot>
</template>
