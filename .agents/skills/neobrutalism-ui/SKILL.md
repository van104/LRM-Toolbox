---
name: Neobrutalism UI Tool Modernization
description: 将现有工具或新工具界面升级/改造为 LRM-toolbox 标准的新粗野主义 (Neobrutalism) 风格指南。
---

# Neobrutalism UI (新粗野主义) 设计与重构指南

该 Skill 文档是基于 `src/components/tools/dev/JsonFormatter.vue` 提取的 LRM 工具箱专属 Neobrutalism（新粗野主义）界面改造蓝图。在要求**优化其他工具 UI 界面**时，必须严格遵守以下设计、样式及交互规范。

## 1. 核心设计元素与变量定义

### 字体映射 (Font Stacks)

保证中文字体也呈现极其“硬朗、块状”的视觉感受，所有重要文本必须引入包含字重粗体 (900/800) 的原生黑体，并在重点标题添加文字描边 (`-webkit-text-stroke`)。

- **主要标题/重音文本 (`.brutal-title`, `.brutal-btn`)**:
  `font-family: 'Syne', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Heiti SC', sans-serif;`
- **正文/技术型数据展示 (`.brutal-editor`, `.brutal-select`)**:
  `font-family: 'IBM Plex Mono', 'Noto Sans SC', monospace;`

### 卡片边框与阴影核心逻辑

所有输入框、按钮、模块面板不能有平滑圆角，**禁用 `border-radius`** 或极小。
阴影禁止使用模糊范围 (Blur radius)，阴影总是**纯色实体偏移**。

- **默认形态**: `border: 3px solid #111;` 或 `4px solid #111;`
- **默认落影**: `box-shadow: 4px 4px 0px #111;` (小模块) / `8px 8px 0px #111;` (大面板)

---

## 2. 标准化交互动画 (CSS 运动状态)

工具界面中大量使用三态互动（Default, Hover, Active）：

### Hover (悬停响应)

- 工具块/按钮向左上方微微弹起，阴影增大约一倍：
  ```css
  .brutal-target:hover {
    transform: translate(-3px, -3px);
    box-shadow: 7px 7px 0px #111;
  }
  ```

### Active (点击响应)

- 按钮被按下时，向右下陷入，阴影消失，模拟机械按键触感：
  ```css
  .brutal-target:active {
    transform: translate(4px, 4px); /* 等同于原有位移+落影补偿 */
    box-shadow: 0px 0px 0px #111;
  }
  ```

---

## 3. 标准色盘 (Light / Dark Mode 适配)

为了解决高饱和度霓虹色滚动时引起的“光敏频闪”，LRM Neobrutalism 全站采取降调的“马卡龙/复古冷调”撞色策略。

### 背景基调

- **Light Mode**: 整个容器通常使用浅黄网格背景 (比如 `#fdfae5` 加 `linear-gradient` 的网格线)
- **Dark Mode**: 背景变黑 `#111` 加灰色网格，其余容器变为 `#1a1a1a`，字体变为 `#eee`. 边框和阴影从纯黑 `#111` 统一翻转为白灰 `#eee`。

### 辅色色系互换

当给 `bg-yellow`, `bg-blue`, `bg-pink`, `bg-green` 这类头部 Header / 按钮上色时遵守下列色值约束：

- **黄色系 (Warning / Highlights)**:
  - Light: `#ffd900` 或 `#ffeba0`
  - Dark: `#b28f00` 或 `#a98d36`
- **蓝色系 (Primary / Accent)**:
  - Light: `#4b7bff` 或 `#89b4f8`
  - Dark: `#2a4eb2` 或 `#405d9e`
- **绿色系 (Success / Execute Actions)**:
  - Light: `#00e572` 或 `#81e6b3`
  - Dark: `#00994c` 或 `#3c9165`
- **粉红色系 (Danger / Clear / Reset)**:
  - Light: `#ff4b4b` 或 `#ff9fb2`
  - Dark: `#cc0000` 或 `#b25465`

---

## 4. 结构化类名范式 (Class Naming Convention)

在重构 Vue 模板时，尽可能使用 `brutal-` 作为命名空间（避免与外部样式冲突）：

1. **容器级**:
   - `.brutal-wrapper` (最外层背景)
   - `.brutal-container` (居中内容约束)
   - `.brutal-grid` (双分栏或网格布局)
   - `.brutal-pane` (大面积卡片区块)

2. **操作与交互级**:
   - `.brutal-header` / `.brutal-title`
   - `.brutal-toolbar` (控制栏，内部可分 `tools-left` 和 `tools-right`)
   - `.brutal-btn` (大按钮)
   - `.brutal-action-btn` (次级功能按钮)
   - `.brutal-select`, `.brutal-input`, `.brutal-editor` (输入控件)

3. **黑暗模式覆盖模板**:

```css
/* 基础元素反转 */
[data-theme='dark'] .brutal-btn,
[data-theme='dark'] .brutal-pane,
[data-theme='dark'] .brutal-toolbar {
  background: #1a1a1a;
  border-color: #eee;
  color: #eee;
}

/* 阴影反转 */
[data-theme='dark'] .brutal-btn {
  box-shadow: 6px 6px 0px #eee;
}
[data-theme='dark'] .brutal-btn:hover {
  box-shadow: 9px 9px 0px #eee;
}
[data-theme='dark'] .brutal-btn:active {
  box-shadow: 0px 0px 0px #eee;
}
```

## 5. 重构执行步骤清单

当用户指派改造一个 `XXXTool.vue`：

1. **清理遗留**：删除所有的 `border-radius`, `el-*` (Element Plus 原生组件尽量替换为原生 HTML 元素+Brutal class，如遇复杂组件需用 `:deep` 将其复写)。
2. **结构包裹**：将最外围替换为 `<div class="brutal-wrapper">` 内包 `<div class="brutal-container">`。
3. **按钮与输入替换**：原生 `<button>`, `<input>`, `<textarea>` 增加相应 `.brutal-` 前缀并补充黑体描边和双态 `box-shadow`。
4. **验证 Dark Mode**：不要忘记在同文件的 `<style scoped>` 中追加所有使用的 `.brutal-*` 以及辅助类的 `[data-theme='dark']` 重写规则。
