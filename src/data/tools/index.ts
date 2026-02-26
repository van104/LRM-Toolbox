import { type Tool, type Category, categoriesBase } from './types';

// 缓存加载的工具
const cache: Record<string, Tool[]> = {};

/**
 * 按分类加载工具
 */
export async function loadToolsByCategory(categoryId: string): Promise<Tool[]> {
  if (categoryId === 'all') {
    return loadAllTools();
  }

  if (cache[categoryId]) {
    return cache[categoryId];
  }

  try {
    let tools: Tool[] = [];
    switch (categoryId) {
      case 'dev':
        tools = (await import('./dev.json')).default;
        break;
      case 'text':
        tools = (await import('./text.json')).default;
        break;
      case 'image':
        tools = (await import('./image.json')).default;
        break;
      case 'pdf':
        tools = (await import('./pdf.json')).default;
        break;
      case 'design':
        tools = (await import('./design.json')).default;
        break;
      case 'finance':
        tools = (await import('./finance.json')).default;
        break;
      case 'health':
        tools = (await import('./health.json')).default;
        break;
      case 'life':
        tools = (await import('./life.json')).default;
        break;
      case 'edu':
        tools = (await import('./edu.json')).default;
        break;
      case 'fun':
        tools = (await import('./fun.json')).default;
        break;
    }
    cache[categoryId] = tools;
    return tools;
  } catch (error) {
    console.error(`Failed to load tools for category: ${categoryId}`, error);
    return [];
  }
}

/**
 * 加载所有工具
 */
export async function loadAllTools(): Promise<Tool[]> {
  const categories = [
    'dev',
    'text',
    'image',
    'pdf',
    'design',
    'finance',
    'health',
    'life',
    'edu',
    'fun'
  ];
  const allTools = await Promise.all(categories.map(cat => loadToolsByCategory(cat)));
  return allTools.flat();
}

let searchWorker: Worker | null = null;
const ongoingRequests = new Map<number, (res: Tool[]) => void>();
let lastRequestId = 0;

function getSearchWorker() {
  if (!searchWorker) {
    searchWorker = new Worker(new URL('../../utils/search.worker.ts', import.meta.url), {
      type: 'module'
    });
    searchWorker.onmessage = (e: MessageEvent) => {
      const { id, results } = e.data;
      const resolve = ongoingRequests.get(id);
      if (resolve) {
        resolve(results);
        ongoingRequests.delete(id);
      }
    };
  }
  return searchWorker;
}

/**
 * 搜索工具 (支持拼音 - 开启 Web Worker 优化)
 */
export async function searchToolsAsync(keyword: string): Promise<Tool[]> {
  if (!keyword) return [];
  const allTools = await loadAllTools();
  const worker = getSearchWorker();
  const id = ++lastRequestId;

  return new Promise(resolve => {
    ongoingRequests.set(id, resolve);
    worker.postMessage({ id, tools: JSON.parse(JSON.stringify(allTools)), keyword });
  });
}

// 为了保持与旧版本的兼容性，提供一个简单的导出
export const categories: Category[] = categoriesBase;
