import { ref } from 'vue';

export interface FileItem {
  file: File;
  status: 'pending' | 'processing' | 'done' | 'error';
  width: number;
  height: number;
  thumbUrl: string | null;
  resultUrl: string | null;
  resultBlob: Blob | null;
}

export interface ResizeConfig {
  resizeMode: 'percentage' | 'fixed';
  percentage: number;
  fixedWidth: number;
  fixedHeight: number;
  lockAspectRatio: boolean;
  quality: number;
}

export function useImageResizer() {
  const fileList = ref<FileItem[]>([]);
  const isProcessing = ref(false);

  const addFiles = (files: File[], onMetadataLoaded?: (item: FileItem) => void) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        const file = files[i];
        const item: FileItem = {
          file: file,
          status: 'pending',
          width: 0,
          height: 0,
          thumbUrl: null,
          resultUrl: null,
          resultBlob: null
        };

        const reader = new FileReader();
        reader.onload = e => {
          item.thumbUrl = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            item.width = img.width;
            item.height = img.height;
            if (onMetadataLoaded) onMetadataLoaded(item);
          };
          img.src = item.thumbUrl;
        };
        reader.readAsDataURL(file);

        fileList.value.push(item);
      }
    }
  };

  const clearAll = () => {
    fileList.value.forEach(f => {
      if (f.resultUrl) URL.revokeObjectURL(f.resultUrl);
    });
    fileList.value = [];
  };

  const processFile = (item: FileItem, config: ResizeConfig) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const dims = calculateTargetDims(item, config);
        const canvas = document.createElement('canvas');
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          item.status = 'error';
          reject();
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, dims.width, dims.height);

        canvas.toBlob(
          blob => {
            if (blob) {
              if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
              item.resultBlob = blob;
              item.resultUrl = URL.createObjectURL(blob);
              item.status = 'done';
              resolve();
            } else {
              item.status = 'error';
              reject();
            }
          },
          item.file.type,
          config.quality
        );
      };
      img.onerror = () => {
        item.status = 'error';
        reject();
      };
      if (item.thumbUrl) img.src = item.thumbUrl;
    });
  };

  const calculateTargetDims = (file: FileItem, config: ResizeConfig) => {
    if (!file.width) return { width: 0, height: 0 };

    if (config.resizeMode === 'percentage') {
      const scale = config.percentage / 100;
      return {
        width: Math.round(file.width * scale),
        height: Math.round(file.height * scale)
      };
    } else {
      if (config.lockAspectRatio && config.fixedWidth) {
        const ratio = file.height / file.width;
        return {
          width: config.fixedWidth,
          height: Math.round(config.fixedWidth * ratio)
        };
      }
      return {
        width: config.fixedWidth || file.width,
        height: config.fixedHeight || file.height
      };
    }
  };

  const startBatchProcessing = async (config: ResizeConfig) => {
    if (isProcessing.value) return;
    isProcessing.value = true;

    for (const item of fileList.value) {
      item.status = 'processing';
      try {
        await processFile(item, config);
      } catch (e) {
        console.error(e);
      }
    }

    isProcessing.value = false;
  };

  return {
    fileList,
    isProcessing,
    addFiles,
    clearAll,
    startBatchProcessing,
    calculateTargetDims
  };
}
