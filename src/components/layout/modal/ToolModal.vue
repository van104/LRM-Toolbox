<template>
  <DialogRoot
    :open="visible"
    @update:open="
      val => {
        if (!val) $emit('close');
      }
    "
  >
    <DialogPortal>
      <!-- Overlay -->
      <DialogOverlay
        class="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      />
      <!-- Content -->
      <DialogContent
        class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[580px] max-h-[85vh] sm:max-h-[90vh] bg-white dark:bg-[#1a1a1a] border-4 border-[#111] dark:border-[#eee] p-0 z-[1001] shadow-[12px_12px_0_0_#111] dark:shadow-[12px_12px_0_0_#eee] flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] duration-250 overflow-hidden"
      >
        <!-- 关闭按钮 -->
        <DialogClose
          class="absolute top-3 right-3 w-9 h-9 border-[3px] border-[#111] dark:border-[#eee] bg-white dark:bg-[#222] text-[#111] dark:text-[#eee] font-black text-[1.1rem] flex items-center justify-center cursor-pointer shadow-[3px_3px_0_0_#111] dark:shadow-[3px_3px_0_0_#eee] hover:bg-[#ff4b4b] dark:hover:bg-[#cc0000] hover:text-white dark:hover:text-white hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[5px_5px_0_0_#111] dark:hover:shadow-[5px_5px_0_0_#eee] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_0_#111] dark:active:shadow-[0_0_0_0_#eee] transition-all z-10 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#111]"
          aria-label="关闭"
        >
          ✕
        </DialogClose>

        <ToolModalHeader :tool="tool" />
        <div class="flex-1 overflow-y-auto">
          <ToolModalBody :tool="tool" />
        </div>
        <ToolModalFooter @close="$emit('close')" @use="handleUseTool" />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogClose } from 'radix-vue';

  import ToolModalHeader from './ToolModalHeader.vue';
  import ToolModalBody from './ToolModalBody.vue';
  import ToolModalFooter from './ToolModalFooter.vue';

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    tool: {
      type: Object,
      default: () => ({})
    }
  });

  const emit = defineEmits(['close']);
  const router = useRouter();
  const userStore = useUserStore();

  function handleUseTool() {
    if (props.tool.id) {
      userStore.addToHistory(props.tool);
    }

    emit('close');
    if (props.tool.route) {
      router.push(props.tool.route);
    }
  }
</script>
