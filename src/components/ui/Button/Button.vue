<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  }>();

  const baseClasses =
    'inline-flex items-center justify-center font-[800] transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#FF7BE5] disabled:opacity-50 disabled:cursor-not-allowed uppercase box-border overflow-visible align-middle';

  const variantClasses = computed(() => {
    switch (props.variant) {
      case 'secondary':
        return 'bg-white text-black shadow-[4px_4px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_0_#000] dark:bg-[#222] dark:text-[#eee] dark:shadow-[4px_4px_0_0_#eee] dark:hover:shadow-[6px_6px_0_0_#eee]';
      case 'danger':
        return 'bg-[#ff4b4b] text-black shadow-[4px_4px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_0_#000] dark:bg-[#cc0000] dark:text-white dark:shadow-[4px_4px_0_0_#eee] dark:hover:shadow-[6px_6px_0_0_#eee]';
      case 'ghost':
        return 'bg-transparent text-black shadow-none hover:bg-gray-200 dark:text-[#eee] dark:hover:bg-[#333] disabled:shadow-none';
      case 'primary':
      default:
        return 'bg-[#00e572] text-black shadow-[4px_4px_0_0_#000] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0_0_0_0_#000] dark:shadow-[4px_4px_0_0_#eee] dark:hover:shadow-[6px_6px_0_0_#eee] dark:bg-[#00994c] dark:text-white';
    }
  });

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-[1.1rem]';
      case 'md':
      default:
        return 'px-5 py-2.5 text-base';
    }
  });
  const variantStyle = computed(() => {
    const isDark =
      typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark';
    const borderColor = isDark ? '#eee' : '#111';

    if (props.variant === 'ghost') {
      return {
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: 'transparent'
      };
    }

    return {
      borderWidth: '4px',
      borderStyle: 'solid',
      borderColor: borderColor
    };
  });
</script>

<template>
  <button
    :class="[baseClasses, variantClasses, sizeClasses]"
    :style="variantStyle"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
