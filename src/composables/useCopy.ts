import { ElMessage } from 'element-plus';

interface CopyOptions {
  success?: string;
  error?: string;
}

/**
 * A composable for handling clipboard copy operations with Element Plus feedback.
 */
export function useCopy() {
  /**
   * Copies the given text to the clipboard.
   * @param text The text to copy.
   * @param options Optional custom success and error messages.
   * @returns Promise<boolean> indicating success or failure.
   */
  const copyToClipboard = async (text: string, options: CopyOptions = {}): Promise<boolean> => {
    if (!text) return false;

    const { success = '复制成功', error = '复制失败' } = options;

    try {
      await navigator.clipboard.writeText(text);
      ElMessage.success(success);
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      ElMessage.error(error);
      return false;
    }
  };

  return {
    copyToClipboard
  };
}
