import { ref, computed, watch } from 'vue';
import JavaScriptObfuscator from 'javascript-obfuscator';
import type { ObfuscatorOptions } from 'javascript-obfuscator';
import { ElMessage } from 'element-plus';
import { type JSFileItem, MODES } from './types';

export function useJSObfuscator() {
  // 状态
  const inputCode = ref('');
  const outputCode = ref('');
  const isObfuscating = ref(false);
  const selectedMode = ref<string>('medium');
  const fileList = ref<JSFileItem[]>([]);
  const isBatchProcessing = ref(false);

  const customOptions = ref<ObfuscatorOptions>({
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    numbersToExpressions: false,
    unicodeEscapeSequence: false,
    selfDefending: false,
    debugProtection: false,
    splitStrings: false,
    stringArray: true,
    stringArrayEncoding: [],
    identifierNamesGenerator: 'mangled'
  });

  const currentMode = computed(() => MODES[selectedMode.value]);

  const activeOptions = computed(() => {
    if (selectedMode.value === 'custom') return customOptions.value;
    return MODES[selectedMode.value].options;
  });

  // 监听配置变化，如果用户更改了模式或选项，将已完成的文件重置为 pending，以便重新混淆
  watch(
    activeOptions,
    () => {
      fileList.value.forEach(item => {
        if (item.status === 'done' || item.status === 'error') {
          item.status = 'pending';
          // 不清除旧的下载链接，直到下次真正开始处理，避免频繁刷新 UI
        }
      });
    },
    { deep: true }
  );

  // 计算香农熵 (Shannon Entropy) 用于评估代码复杂度/随机性
  const calculateEntropy = (str: string): number => {
    if (!str) return 0;
    const len = str.length;
    const frequencies: Record<string, number> = {};
    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in frequencies) {
      const p = frequencies[char] / len;
      entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(3));
  };

  // 单段代码混淆
  const obfuscateText = async () => {
    if (!inputCode.value.trim()) {
      ElMessage.warning('请输入代码内容');
      return;
    }

    isObfuscating.value = true;

    return new Promise<void>(resolve => {
      setTimeout(() => {
        try {
          const result = JavaScriptObfuscator.obfuscate(inputCode.value, activeOptions.value);
          outputCode.value = result.getObfuscatedCode();
          ElMessage.success('混淆成功');
        } catch (e: unknown) {
          console.error(e);
          const msg = e instanceof Error ? e.message : '未知错误';
          ElMessage.error('混淆错误: ' + msg);
        } finally {
          isObfuscating.value = false;
          resolve();
        }
      }, 50);
    });
  };

  // 批量文件处理
  const addFiles = (files: File[]) => {
    files.forEach(file => {
      const isJS =
        file.name.endsWith('.js') ||
        file.type === 'text/javascript' ||
        file.type === 'application/javascript';

      if (isJS) {
        fileList.value.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
          status: 'pending',
          originalSize: file.size
        });
      } else if (file.name !== '.DS_Store' && !file.type.includes('directory')) {
        // 文件夹上传时会有文件夹对象或无关文件，静默过滤
      }
    });
  };

  const removeFile = (id: string) => {
    const index = fileList.value.findIndex(item => item.id === id);
    if (index > -1) {
      if (fileList.value[index].downloadUrl) {
        URL.revokeObjectURL(fileList.value[index].downloadUrl!);
      }
      fileList.value.splice(index, 1);
    }
  };

  const clearFiles = () => {
    fileList.value.forEach(item => {
      if (item.downloadUrl) URL.revokeObjectURL(item.downloadUrl);
    });
    fileList.value = [];
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const obfuscateFile = async (item: JSFileItem) => {
    item.status = 'processing';
    try {
      const code = await readFile(item.file);
      item.originalEntropy = calculateEntropy(code);

      const result = JavaScriptObfuscator.obfuscate(code, activeOptions.value);
      const obfuscatedCode = result.getObfuscatedCode();

      const blob = new Blob([obfuscatedCode], { type: 'application/javascript' });
      item.obfuscatedCode = obfuscatedCode;
      item.obfuscatedSize = blob.size;
      item.obfuscatedEntropy = calculateEntropy(obfuscatedCode);
      item.downloadUrl = URL.createObjectURL(blob);
      item.status = 'done';
    } catch (e: unknown) {
      console.error(e);
      item.status = 'error';
      item.errorMessage = e instanceof Error ? e.message : '混淆过程出错';
    }
  };

  const startBatchObfuscate = async () => {
    if (fileList.value.length === 0) return;
    isBatchProcessing.value = true;

    for (const item of fileList.value) {
      // 这里的 pending 逻辑配合 watch 实现重新混淆
      if (item.status === 'done' || item.status === 'processing') continue;
      await obfuscateFile(item);
    }

    isBatchProcessing.value = false;
    ElMessage.success('批量处理完成');
  };

  const downloadAllAsZip = async () => {
    const doneFiles = fileList.value.filter(f => f.status === 'done' && f.obfuscatedCode);
    if (doneFiles.length === 0) {
      ElMessage.warning('没有可下载的混淆文件');
      return;
    }

    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();
    doneFiles.forEach(item => {
      // 使用保留目录结构的路径，如果没有则用带前缀的文件名
      const savePath = item.path
        ? item.path
            .split('/')
            .map(p => (p === item.file.name ? `obfuscated_${p}` : p))
            .join('/')
        : `obfuscated_${item.file.name}`;

      zip.file(savePath, item.obfuscatedCode!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `obfuscated_project_${Date.now()}.zip`);
    ElMessage.success('项目级打包下载已启动');
  };

  return {
    inputCode,
    outputCode,
    isObfuscating,
    selectedMode,
    fileList,
    isBatchProcessing,
    customOptions,
    currentMode,
    activeOptions,
    obfuscateText,
    addFiles,
    removeFile,
    clearFiles,
    startBatchObfuscate,
    downloadAllAsZip
  };
}
