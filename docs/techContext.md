# Tech Context

## 核心技术栈
- **框架**: Vue 3 (Composition API)
- **构建**: Vite
- **状态管理**: Pinia (`user.js`, `theme.js`)
- **路由**: Vue Router
- **样式**: CSS Variables (主题切换) + Scoped CSS / Tailwind (需确认)

## 目录结构规范
- `src/components/tools/{category}/{ToolName}.vue`: 具体工具组件。
- `src/data/tools.js`: 工具元数据注册表 (ID, Name, Icon, Category)。
- `src/views/`: 页面级组件 (Home, Favorites)。

## 关键库 (Glue Libraries)
- PDF处理: pdf.js
- GIF处理: gif.js
- (在此列出你项目用到的其他关键 npm 包，如 chart.js, crypto-js 等)