import PinyinMatch from 'pinyin-match';
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

/**
 * 搜索工具 (支持拼音)
 */
export async function searchToolsAsync(keyword: string): Promise<Tool[]> {
  if (!keyword) return [];
  const allTools = await loadAllTools();
  const lowerKeyword = keyword.toLowerCase();

  return allTools.filter(tool => {
    // 1. 拼音/首字母匹配
    const nameMatch = PinyinMatch.match(tool.name, keyword);

    // 2. 摘要常规包含匹配
    const summaryMatch = tool.summary.toLowerCase().includes(lowerKeyword);

    // 3. 标签匹配
    const tagMatch = tool.tags.some(
      tag => tag.toLowerCase().includes(lowerKeyword) || PinyinMatch.match(tag, keyword)
    );

    return nameMatch || summaryMatch || tagMatch;
  });
}

// 为了保持与旧版本的兼容性，提供一个简单的导出
// 注意：由于是异步加载，这里的导出在初始时可能为空，
// 建议 UI 组件改用异步加载方法。
export const categories: Category[] = categoriesBase;

// 预热缓存（可选）
// loadAllTools();
