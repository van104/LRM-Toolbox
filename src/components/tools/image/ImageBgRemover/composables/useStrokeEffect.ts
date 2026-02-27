import { ref, watch, type Ref } from 'vue';

interface StrokeConfig {
  enabled: boolean;
  color: string;
  width: number;
}

export function useStrokeEffect(resultUrl: Ref<string>, strokeConfig: StrokeConfig) {
  const strokeUrl = ref('');
  const isStroking = ref(false);

  const debounce = <T extends (...args: unknown[]) => unknown>(fn: T, delay: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  const generateStrokedBlob = async (srcUrl: string, config: StrokeConfig): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = srcUrl;
      img.onload = () => {
        const padding = config.width * 2;
        const canvas = document.createElement('canvas');
        canvas.width = img.width + padding;
        canvas.height = img.height + padding;
        const localCtx = canvas.getContext('2d');
        if (!localCtx) return reject('No context');

        const centerX = padding / 2;
        const centerY = padding / 2;

        const dCanvas = document.createElement('canvas');
        dCanvas.width = canvas.width;
        dCanvas.height = canvas.height;
        const dCtx = dCanvas.getContext('2d');
        if (!dCtx) return reject('No dCtx');

        const r = config.width;
        const density = Math.max(1, Math.floor(r / 2));

        for (let rad = 1; rad <= r; rad += density) {
          const numAngles = Math.max(12, rad * 4);
          for (let i = 0; i < numAngles; i++) {
            const angle = (i / numAngles) * 2 * Math.PI;
            const dx = Math.cos(angle) * rad;
            const dy = Math.sin(angle) * rad;
            dCtx.drawImage(img, centerX + dx, centerY + dy);
          }
        }

        dCtx.globalCompositeOperation = 'source-in';
        dCtx.fillStyle = config.color;
        dCtx.fillRect(0, 0, dCanvas.width, dCanvas.height);

        localCtx.drawImage(dCanvas, 0, 0);

        localCtx.globalCompositeOperation = 'source-over';
        localCtx.drawImage(img, centerX, centerY);

        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject('Blob conversion failed');
        }, 'image/png');
      };
      img.onerror = reject;
    });
  };

  const updateStrokeImage = debounce(async () => {
    const url = resultUrl.value;
    if (!url) {
      strokeUrl.value = '';
      return;
    }
    if (!strokeConfig.enabled || strokeConfig.width <= 0) {
      strokeUrl.value = url;
      return;
    }

    isStroking.value = true;
    try {
      const blob = await generateStrokedBlob(url, strokeConfig);
      if (strokeUrl.value && strokeUrl.value !== url) URL.revokeObjectURL(strokeUrl.value);
      strokeUrl.value = URL.createObjectURL(blob);
    } catch (e) {
      console.error('Stroke generation failed', e);
      strokeUrl.value = url;
    } finally {
      isStroking.value = false;
    }
  }, 300);

  watch(
    [
      () => resultUrl.value,
      () => strokeConfig.enabled,
      () => strokeConfig.color,
      () => strokeConfig.width
    ],
    () => {
      updateStrokeImage();
    },
    { immediate: true }
  );

  return {
    strokeUrl,
    isStroking,
    updateStrokeImage
  };
}
