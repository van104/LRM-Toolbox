import type { ObfuscatorOptions } from 'javascript-obfuscator';

export interface ObfuscationMode {
  name: string;
  desc: string;
  options: ObfuscatorOptions;
}

export interface JSFileItem {
  id: string;
  file: File;
  path?: string; // 相对路径记录
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  originalSize: number;
  obfuscatedSize?: number;
  obfuscatedCode?: string;
  downloadUrl?: string;
  originalEntropy?: number;
  obfuscatedEntropy?: number;
}

export const MODES: Record<string, ObfuscationMode> = {
  low: {
    name: '低混淆 (高性能)',
    desc: '仅进行基本的压缩、移除注释和简单的变量名缩短。对运行性能几乎没有影响。',
    options: {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      numbersToExpressions: false,
      simplify: true,
      stringArray: false,
      identifierNamesGenerator: 'mangled'
    }
  },
  medium: {
    name: '中等混淆 (最优性能)',
    desc: '启用变量混淆、字符串加密和适度的脚本流改变。在保护代码和保持运行效率之间取得最佳平衡。',
    options: {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.5,
      deadCodeInjection: false,
      numbersToExpressions: true,
      simplify: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      identifierNamesGenerator: 'hexadecimal'
    }
  },
  high: {
    name: '高混淆 (低性能)',
    desc: '启用死代码注入、深度控制流扁平化和重度字符串加密。代码体积会显著增加，且运行效率会明显下降，但提供最高的逆向保护。',
    options: {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      numbersToExpressions: true,
      simplify: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 1,
      splitStrings: true,
      splitStringsChunkLength: 10,
      identifierNamesGenerator: 'hexadecimal'
    }
  },
  custom: {
    name: '自定义',
    desc: '根据您的需求手动配置混淆参数。',
    options: {}
  }
};
