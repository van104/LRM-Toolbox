# 工具组件开发约定

## 目录结构

### 简单工具（单个 .vue 文件）

```
src/components/tools/{category}/
  {PascalName}Tool.vue          # 主组件
```

### 复杂工具（多个子组件/模块）

```
src/components/tools/{category}/
  {PascalName}Tool.vue          # 主组件（入口）
  {kebab-name}/                 # 子组件目录
    types.ts                    # 类型定义（可选）
    constants.ts                # 常量（可选）
    SubComponent.vue            # 子组件
    ...
```

### 示例：TowerDefenseTool

```
src/components/tools/fun/
  TowerDefenseTool.vue          # 入口组件，路由指向此文件
  tower_defense/                # 子目录，kebab-case 命名
    GameHeader.vue
    ControlPanel.vue
    BuildMenu.vue
    GameOverlay.vue
    types.ts
    constants.ts
```

## 命名规范

| 项目 | 规范 | 示例 |
|------|------|------|
| 工具 ID (kebab-case) | `{name}-{modifier}` | `bmi-calculator`, `workout-timer` |
| 组件文件 (PascalCase) | `{PascalId}Tool.vue` | `BmiCalculatorTool.vue` |
| 子目录 (kebab-case) | 与工具 ID 一致 | `bmi-calculator/` |
| 子组件 (PascalCase) | 描述性名称 | `ResultChart.vue` |
| 图标 (PascalCase) | `{PascalId}Icon.vue` | `BmiCalculatorIcon.vue` |
| SVG 图标导出 | barrel export | `export { default as BmiCalculatorIcon } from './health/BmiCalculatorIcon.vue'` |

## 添加新工具流程

```bash
# 交互式创建（推荐）
npm run scaffold

# 或指定参数创建
npm run scaffold -- --id my-tool --category health --name "我的工具" --summary "一句话描述"
```

脚手架脚本自动完成：
1. 创建 `src/components/tools/{category}/{PascalName}Tool.vue`
2. 创建 `src/components/icons/tools/{category}/{PascalName}Icon.vue`
3. 注册图标到 barrel export
4. 添加 JSON 元数据到 `src/data/tools/{category}.json`
5. 路由自动注册（无需手动操作）

之后只需编辑组件文件即可实现功能。

## 使用 ToolShell 基座组件

所有工具应使用 `ToolShell` 作为外层容器，统一提供：
- 返回按钮 + 标题栏
- 加载骨架屏（`loading` prop）
- 错误状态（`error` prop）
- 暗色模式基础样式
- 通用 CSS 类（`.brutal-btn`, `.brutal-pane`, `.brutal-input` 等）

```vue
<template>
  <ToolShell title="分类" title-highlight="工具名()">
    <!-- 工具内容 -->
    <div class="brutal-pane">
      <div class="pane-header">标题</div>
      <div class="pane-body">内容</div>
    </div>
  </ToolShell>
</template>

<script setup lang="ts">
import ToolShell from '@/components/common/ToolShell.vue'
</script>
```

## 注意事项

- 路由自动从 `src/data/tools/*.json` 注册，无需编辑 router modules
- 工具特定的暗色模式样式在组件自己的 `<style scoped>` 中定义
- 复杂工具的子组件放在 `{kebab-name}/` 子目录下，避免主目录混乱
- 单个 .vue 文件不超过 800 行，超长则拆分子组件
