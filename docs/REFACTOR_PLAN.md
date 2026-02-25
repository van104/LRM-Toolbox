# LRM-TOolbox 项目重构与优化计划

## 1. 总览

本计划旨在提升 LRM-Toolbox 项目的代码维护性、扩展性及系统健壮性。当前项目作为一个集成大量工具的前端应用，虽结构清晰，但在测试覆盖、代码复用和类型管理方面存在不足。通过本计划分阶段实施改进，将显著降低后续开发成本和Bug率。

## 2. 详细执行计划

### 第一阶段：基础设施与测试引入 (Testing Infrastructure)

**目标**: 建立稳固的自动化测试防线，确保每次重构不破坏现有功能。

- [x] **安装测试框架**:
  - `npm install -D vitest @vue/test-utils jsdom c8` (c8用于覆盖率)
- [x] **配置 Vitest**:
  - 创建 `vitest.config.ts`，配置路径别名、环境及排除项。
- [x] **添加全测试脚本**:
  - 在 `package.json` 中添加 `test:unit`, `test:coverage` 脚本。
- [x] **编写基准测试**:
  - 为核心工具函数 `src/utils/pdf.ts`, `src/utils/welcomeLog.ts` 编写单元测试。
  - (实际执行: 为 `src/api/currency.ts` 编写了测试用例 `src/api/currency.test.ts`，因为该文件更适合作为测试基准)

**预计收益**:

- 防止“修改一处，坏掉十处”的回归Bug。
- 提升代码信心，敢于进行重构。

### 第二阶段：代码复用与逻辑抽象 (Composables & Logic Abstraction)

**目标**: 消除组件间的重复逻辑，提升开发效率。

- [x] **创建 Composables 目录**:
  - 在 `src/` 下创建 `composables` 目录。
- [x] **提取通用逻辑**:
  - [x] `useCopy`: 封装剪贴板逻辑，已在 `Md5Tool` 和 `PasswordGenerator` 中应用。
  - [x] `useFileHandler`: 封装文件上传、读取、校验逻辑。
  - [ ] `useFullscreen`: 封装全屏切换逻辑。
  - [ ] `useLocalStorage`: 封装本地存储读写逻辑（替代直接操作 localStorage）。
- [x] **重构现有组件**:
  - 挑选了 `Md5Tool` (refactored) 和 `PasswordGenerator` (refactored + standard UI feedback)。
  - 重构了文本系列工具（`TextSplitter`, `TextSecurity`, `TextCounter` 等）使用 `useCopy` 和标准 `ElMessage`。
  - 重构了设计系列工具（`DataVisualizer`, `FaviconGeneratorTool`）使用 `useFileHandler`。
  - 重构了开发系列工具（`Base64Tool`, `ApiTesterTool`, `UserAgentParserTool`, `Md5Tool`）使用 `useCopy`, `useFileHandler` 和标准 `ElMessage`。
  - 重构了趣味系列工具（`AsciiArtTool`, `SocialMediaMockupTool`, `JigsawPuzzleTool`, `BloodTypeCalculatorTool`）集成 `useFileHandler` 和 `useCopy`。

**预计收益**:

- 显著减少重复代码（DRY原则）。
- 逻辑集中管理，一处修改，全局生效。

### 第三阶段：类型系统与 API 层标准化 (Types & API Layer)

**目标**: 强化 TypeScript 类型约束，规范前后端交互。

- [x] **集中管理类型定义**:
  - 创建 `src/types` 目录。
  - 定义 `Tool.d.ts` (工具元数据接口), `User.d.ts` (用户数据接口), `API.d.ts` (通用响应结构)。
  - 从组件中剥离接口定义，统一引用。
- [x] **封装 HTTP 请求层**:
  - 创建 `src/utils/request.ts`。
  - 封装 `fetch` 或 `axios`，统一处理请求拦截、响应拦截、全局错误提示（ElMessage）。
  - 重构 `src/api/feedback.ts` 等文件使用新的请求工具。

**预计收益**:

- 增强代码提示（IntelliSense），减少拼写错误。
- 统一错误处理体验，提升用户感知。

### 第四阶段：后端服务与扩展性 (Backend & Scalability)

**目标**: 为未来可能的用户系统或复杂业务做准备（低优先级）。

- [ ] **优化 Server 结构**:
  - 将 `server.js` 拆分为 `routes/`, `controllers/`, `services/` 目录。
  - 引入 `express-validator` 进行参数校验。
- [ ] **数据库迁移 (可选)**:
  - 评估是否需要从 SQLite 迁移到更强大的数据库（如 PostgreSQL），或使用 Prisma ORM 提升开发体验。

**预计收益**:

- 后端逻辑更清晰，易于多人协作开发。
- 支持更加复杂的业务场景（如用户登录注册、多表关联）。

## 3. 下一步行动建议

建议优先启动 **第一阶段：基础设施与测试引入**。这部分工作对现有业务无侵入性，风险最低，且能立即带来收益。
