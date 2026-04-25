#!/usr/bin/env node

/**
 * 工具脚手架脚本
 * 自动生成新工具所需的全部文件：组件、元数据、图标、图标注册
 *
 * 用法：
 *   node scripts/scaffold-tool.mjs
 *   node scripts/scaffold-tool.mjs --id my-tool --category health --name "我的工具" --summary "描述"
 *
 * 参数：
 *   --id        工具 ID（kebab-case），例如 "my-tool"
 *   --category  分类：dev|text|image|pdf|design|finance|health|life|edu|fun
 *   --name      中文名称
 *   --summary   简短描述（一句话）
 *   --tags      标签（逗号分隔）
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CATEGORIES = ['dev', 'text', 'image', 'pdf', 'design', 'finance', 'health', 'life', 'edu', 'fun'];

// ========== 解析参数 ==========
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[++i];
      if (val !== undefined && !val.startsWith('--')) {
        params[key] = val;
      }
    }
  }

  return {
    id: params.id || '',
    category: params.category || '',
    name: params.name || '',
    summary: params.summary || '',
    tags: params.tags || ''
  };
}

// ========== 交互式输入 ==========
function ask(query) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(query, answer => { rl.close(); resolve(answer.trim()); }));
}

async function promptInput(params) {
  if (!params.category) {
    console.log('\n可选分类:');
    CATEGORIES.forEach(c => console.log(`  ${c}`));
    params.category = (await ask('\n分类: ')).toLowerCase();
  }
  while (!CATEGORIES.includes(params.category)) {
    console.error(`❌ 无效分类，请输入: ${CATEGORIES.join(', ')}`);
    params.category = (await ask('分类: ')).toLowerCase();
  }

  if (!params.id) {
    params.id = (await ask('工具 ID (kebab-case, 例如: my-tool): ')).toLowerCase();
  }
  while (!/^[a-z][a-z0-9-]*$/.test(params.id)) {
    console.error('❌ ID 必须是小写字母、数字和连字符，以小写字母开头');
    params.id = (await ask('工具 ID: ')).toLowerCase();
  }

  if (!params.name) {
    params.name = await ask('中文名称 (例如: 我的工具): ');
  }
  while (!params.name) {
    params.name = await ask('中文名称: ');
  }

  if (!params.summary) {
    params.summary = await ask('简短描述 (一句话): ');
  }
  while (!params.summary) {
    params.summary = await ask('简短描述: ');
  }

  if (!params.tags) {
    params.tags = await ask('标签 (逗号分隔): ');
  }

  return params;
}

// ========== 工具函数 ==========
function kebabToPascal(str) {
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========== 生成文件 ==========

/** 工具组件模板 */
function generateComponent(params) {
  const { id, category, name } = params;
  const pascal = kebabToPascal(id) + 'Tool';
  const title = capitalize(category);
  const route = `/tools/${id}`;

  return `<template>
  <ToolShell title="${title}" title-highlight="${name}()">
    <div class="tool-container">
      <div class="brutal-pane">
        <div class="pane-header">📝 ${name}</div>
        <div class="pane-body">
          <p class="placeholder-text">内容开发中...</p>
        </div>
      </div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import ToolShell from '@/components/common/ToolShell.vue'
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.placeholder-text {
  text-align: center;
  color: #999;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 4rem 0;
}
</style>
`;
}

/** SVG 图标组件模板 */
function generateIcon(params) {
  const pascal = kebabToPascal(params.id) + 'Icon';

  return `<template>
  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <path
      d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384z m0 704c-176.7 0-320-143.3-320-320s143.3-320 320-320 320 143.3 320 320-143.3 320-320 320z m-32-480h64v192h-64z m0 256h64v64h-64z"
      fill="currentColor"
    ></path>
  </svg>
</template>
`;
}

// ========== 主流程 ==========
async function main() {
  console.log('=== LRM 工具箱 — 工具脚手架 ===\n');

  let params = parseArgs();
  params = await promptInput(params);

  const { id, category, name, summary, tags } = params;
  const pascal = kebabToPascal(id) + 'Tool';
  const iconPascal = kebabToPascal(id) + 'Icon';
  const route = `/tools/${id}`;

  // 路径
  const componentPath = resolve(ROOT, `src/components/tools/${category}/${pascal}.vue`);
  const iconPath = resolve(ROOT, `src/components/icons/tools/${category}/${iconPascal}.vue`);
  const jsonPath = resolve(ROOT, `src/data/tools/${category}.json`);
  const iconIndexPath = resolve(ROOT, 'src/components/icons/tools/index.ts');

  // 检查冲突
  if (existsSync(componentPath)) {
    console.error(`❌ 组件已存在: ${componentPath}`);
    process.exit(1);
  }

  // 1. 创建组件
  writeFileSync(componentPath, generateComponent(params), 'utf-8');
  console.log(`✅ 组件: src/components/tools/${category}/${pascal}.vue`);

  // 2. 创建图标
  writeFileSync(iconPath, generateIcon(params), 'utf-8');
  console.log(`✅ 图标: src/components/icons/tools/${category}/${iconPascal}.vue`);

  // 3. 注册图标
  let iconIndex = readFileSync(iconIndexPath, 'utf-8');
  const iconExport = `export { default as ${iconPascal} } from './${category}/${iconPascal}.vue';`;
  if (!iconIndex.includes(iconExport)) {
    // 在同类导出的后面插入
    const catRegex = new RegExp(`(from '\\./${category}/.*'\n)`);
    const lastCatExport = iconIndex.match(catRegex);
    if (lastCatExport) {
      const insertPos = iconIndex.lastIndexOf(lastCatExport[0]) + lastCatExport[0].length;
      iconIndex = iconIndex.slice(0, insertPos) + iconExport + '\n' + iconIndex.slice(insertPos);
    } else {
      iconIndex += iconExport + '\n';
    }
    writeFileSync(iconIndexPath, iconIndex, 'utf-8');
    console.log(`✅ 图标导出: ${iconIndexPath}`);
  }

  // 4. 添加 JSON 元数据
  const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  const newEntry = {
    id,
    name,
    category,
    icon: 'Tools',
    svgIcon: iconPascal,
    summary: summary || `[待完善] ${name}`,
    description: '[待完善]',
    usage: '1. 使用此工具\n2. 查看结果',
    route,
    isLocal: true,
    tags: tags ? tags.split(',').map(t => t.trim()) : [name, '工具']
  };

  jsonData.push(newEntry);
  writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2) + '\n', 'utf-8');
  console.log(`✅ 元数据: ${jsonPath}`);

  // 5. 路由自动注册
  console.log('\n📌 路由已由 router/index.ts 自动注册，无需手动添加');

  console.log(`\n🎉 工具「${name}」创建成功！`);
  console.log(`   访问地址: http://localhost:5173${route}`);
  console.log(`   接下来: 编辑 ${pascal}.vue 实现功能\n`);
}

main().catch(err => {
  console.error('❌ 出错:', err.message);
  process.exit(1);
});
