<script setup lang="ts">
  import {
    DialogRoot,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose
  } from 'radix-vue';
  import { X } from 'lucide-vue-next';

  defineProps<{
    title?: string;
    description?: string;
  }>();
</script>

<template>
  <DialogRoot>
    <slot name="trigger">
      <DialogTrigger
        as="button"
        class="px-4 py-2 bg-yellow-400 border-4 border-black font-bold shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 cursor-pointer"
      >
        打开弹窗
      </DialogTrigger>
    </slot>

    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <DialogContent
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-black p-6 z-50 shadow-[8px_8px_0_0_#000] w-[90vw] max-w-md focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-200"
      >
        <DialogTitle class="text-2xl font-black mb-2 border-b-4 border-black pb-2">
          <slot name="title">{{ title || '新粗野主义弹窗' }}</slot>
        </DialogTitle>
        <DialogDescription
          v-if="description || $slots.default"
          class="text-gray-700 font-bold mb-4 mt-4"
        >
          <slot>
            {{ description }}
          </slot>
        </DialogDescription>

        <DialogClose
          class="absolute top-2 right-2 border-2 border-black bg-red-400 hover:bg-red-500 hover:translate-x-[2px] hover:translate-y-[2px] w-8 h-8 font-bold flex items-center justify-center shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] focus:outline-none focus:ring-4 focus:ring-blue-500 cursor-pointer group transition-all"
        >
          <X class="w-5 h-5 group-hover:scale-110 transition-transform" stroke-width="3" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
