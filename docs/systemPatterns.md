# System Patterns

## 工具组件规范 (Tool Component Standard)
所有的工具组件 (位于 `src/components/tools/**`) 必须遵守以下模式：
1. **独立性**：必须自包含，不依赖外部全局变量，所需依赖尽量通过 props 传入或内部 import。
2. **样式隔离**：必须使用 `<style scoped>`。
3. **布局**：
   - 顶部：输入区域 (Input)
   - 中部：操作按钮 (Action Buttons)
   - 底部：结果展示 (Output)
4. **命名**：文件名必须以 `Tool.vue` 结尾，例如 `QrCodeTool.vue`。

## 路由注册模式
新工具添加流程：
1. 在 `src/components/tools/{category}/` 下创建组件。
2. 在 `src/data/tools.js` 中添加元数据对象。
3. 路由由 `tools.js` 的 ID 自动映射，或在 `router/index.js` 中动态导入。

## 状态管理
- `theme.js`: 管理深色/浅色模式。
- `user.js`: 管理 `favorites` (收藏列表) 和 `history` (使用记录)。