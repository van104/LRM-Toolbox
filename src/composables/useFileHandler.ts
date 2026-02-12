import { ref } from 'vue';
import { ElMessage } from 'element-plus';

export interface FileHandlerResult {
  data: string | ArrayBuffer | null;
  file: File;
}

export interface FileHandlerOptions {
  accept?: string;
  maxSize?: number; // bytes
  readMode?: 'text' | 'dataURL' | 'binary' | 'arrayBuffer' | 'none';
  multiple?: boolean;
  onSuccess?: (result: FileHandlerResult) => void;
  onError?: (error: unknown) => void;
  onProgress?: (progress: number) => void;
}

export function useFileHandler(options: FileHandlerOptions = {}) {
  const { accept = '*/*', readMode = 'dataURL', onSuccess, onError, onProgress } = options;

  const fileInput = ref<HTMLInputElement | null>(null);
  const isDragOver = ref(false);
  const progress = ref(0);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    if (options.multiple) {
      await processFiles(Array.from(input.files));
    } else {
      await processFile(input.files[0]);
    }
    input.value = ''; // Reset input
  };

  const handleFileDrop = async (event: DragEvent) => {
    isDragOver.value = false;
    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) return;

    if (options.multiple) {
      await processFiles(Array.from(event.dataTransfer.files));
    } else {
      await processFile(event.dataTransfer.files[0]);
    }
  };

  const dragOver = () => {
    isDragOver.value = true;
  };

  const dragLeave = () => {
    isDragOver.value = false;
  };

  const validateFile = (file: File): boolean => {
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        }
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isAccepted) {
        ElMessage.error(`不支持的文件格式。仅支持: ${accept}`);
        return false;
      }
    }

    if (options.maxSize && file.size > options.maxSize) {
      ElMessage.error(`文件过大。最大限制: ${formatSize(options.maxSize)}`);
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    progress.value = 0;
    try {
      if (onProgress) {
        onProgress(0);
      }

      let data: string | ArrayBuffer | null = null;
      if (readMode === 'text') {
        data = await file.text();
      } else if (readMode === 'dataURL') {
        data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else if (readMode === 'arrayBuffer') {
        data = await file.arrayBuffer();
      } else if (readMode === 'none') {
        data = null;
      } else if (readMode === 'binary') {
        data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsBinaryString(file);
        });
      }

      if (onSuccess) {
        onSuccess({ data, file });
      }
      if (onProgress) {
        onProgress(100);
      }
    } catch (error) {
      console.error('File handling error:', error);
      if (onError) {
        onError(error);
      } else {
        ElMessage.error('文件处理失败');
      }
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      await processFile(file);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    fileInput,
    isDragOver,
    progress,
    triggerFileInput,
    triggerUpload: triggerFileInput,
    handleFileSelect,
    onFileSelect: handleFileSelect,
    handleFileDrop,
    onDrop: handleFileDrop,
    dragOver,
    dragLeave,
    formatSize,
    validateFile,
    processFile,
    processFiles
  };
}
