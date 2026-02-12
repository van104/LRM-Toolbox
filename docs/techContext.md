```markdown
# Tech Context

## 核心技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **构建**: Vite (包含插件: `@vitejs/plugin-vue`)
- **状态管理**: Pinia
  - `user.js`: 处理用户收藏工具、使用历史、个性化偏好。
  - `theme.js`: 控制响应式主题切换 (Light/Dark) 及 CSS 变量注入。
- **路由**: Vue Router (基于工具 ID 的动态路由加载)
- **样式**:
  - **全局**: CSS Variables (定义于 `src/assets/main.css`)
  - **框架**: Tailwind CSS (用于原子化布局与响应式设计)
  - **组件**: Scoped CSS (遵循 BEM 命名规范)

## 目录结构规范

- `src/assets/`: 字体、全局样式与静态图标。
- `src/components/ui/`: 高复用基础组件 (Button, Modal, Card, Toast)。
- `src/components/tools/{category}/{ToolName}.vue`: 独立工具的业务逻辑。
- `src/data/tools.js`: 核心注册表，定义工具元数据 (ID, 名称, 图标, 分类, 搜索关键词)。
- `src/hooks/`: 抽象工具通用逻辑 (如 `useFileReader`, `useClipboard`, `useWorker`)。
- `src/views/`: 顶层页面 (Home, CategoryView, Favorites, Settings)。
- `src/utils/`: 纯函数工具库 (文件转换、字符串处理、格式化)。

## 关键库 (Glue Libraries)

- **PDF 处理**: `pdfjs-dist` (渲染与解析)
- **GIF 处理**: `gif.js` (合成)、`omggif` (解析)
- **通用工具**: `VueUse` (浏览器 API 封装、本地存储持久化)
- **图像处理**: `browser-image-compression` (压缩)、`canvas` API
- **文件操作**: `file-saver` (导出)、`jszip` (多文件打包)
- **数据解析**: `xlsx` (Excel)、`papaparse` (CSV)
- **加密算法**: `crypto-js` (MD5, SHA等)
```
