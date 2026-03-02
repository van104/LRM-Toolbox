<script setup lang="ts">
  import { AccordionRoot } from 'radix-vue';

  defineProps<{
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    collapsible?: boolean;
  }>();
</script>

<template>
  <AccordionRoot
    :type="type || 'single'"
    :default-value="defaultValue"
    :collapsible="collapsible"
    class="flex flex-col gap-6"
  >
    <slot></slot>
  </AccordionRoot>
</template>
