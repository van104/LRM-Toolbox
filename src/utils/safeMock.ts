/**
 * 安全的Mock模板解析器
 * 用于解析Mock.js模板字符串，防止代码注入
 */

const DANGEROUS_PATTERNS = [
  /function\s*\(/i,
  /=>\s*{/i,
  /\brequire\s*\(/i,
  /\bimport\s+/i,
  /\beval\s*\(/i,
  /\bFunction\s*\(/i,
  /__proto__/i,
  /constructor/i,
  /prototype/i,
  /<script/i,
  /javascript:/i,
  /\bwindow\b/i,
  /\bdocument\b/i,
  /\bprocess\b/i,
  /\bglobal\b/i
];

/**
 * 安全解析Mock.js模板JSON字符串
 * 不执行任何代码，只解析数据结构
 */
export function safeParseMockTemplate(templateStr: string): Record<string, unknown> {
  const trimmed = templateStr.trim();

  // 安全验证
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error('模板包含不允许的代码');
    }
  }

  // 预处理为合法JSON
  let jsonStr = trimmed
    .replace(/'/g, '"')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/(\w+)\s*:/g, '"$1":');

  // 处理正则表达式字面量
  jsonStr = jsonStr.replace(/\/([^/]+)\/([gimsuvy]*)/g, (_, pattern) => {
    return `"@@REGEX@@${pattern}@@"`;
  });

  try {
    return JSON.parse(jsonStr);
  } catch {
    throw new Error('模板格式错误');
  }
}

/**
 * 验证模板是否安全
 */
export function isMockTemplateSafe(template: string): boolean {
  try {
    safeParseMockTemplate(template);
    return true;
  } catch {
    return false;
  }
}
