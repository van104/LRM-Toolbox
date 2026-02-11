import { type Tool, categoriesBase } from './tools/types';
import { loadAllTools, searchToolsAsync, loadToolsByCategory } from './tools/index';

export * from './tools/types';
export { loadAllTools, searchToolsAsync, loadToolsByCategory };
export const categories = categoriesBase;

// 兼容旧版本的同步 tools 引用 (尽量避免使用)
export let tools: Tool[] = [];

// 初始化加载一次
loadAllTools().then(res => {
  tools = res;
});

/**
 * 兼容旧版本的同步获取分类工具
 */
export function getToolsByCategory(categoryId: string): Tool[] {
  if (categoryId === 'all') return tools;
  return tools.filter(t => t.category === categoryId);
}

/**
 * 兼容旧版本的同步搜索
 */
import PinyinMatch from 'pinyin-match';
export function searchTools(keyword: string): Tool[] {
  if (!keyword) return [];
  const lowerKeyword = keyword.toLowerCase();

  return tools.filter(tool => {
    const nameMatch = PinyinMatch.match(tool.name, keyword);
    const summaryMatch = tool.summary.toLowerCase().includes(lowerKeyword);
    const tagMatch = tool.tags.some(
      (tag: string) => tag.toLowerCase().includes(lowerKeyword) || PinyinMatch.match(tag, keyword)
    );
    return nameMatch || summaryMatch || tagMatch;
  });
}
