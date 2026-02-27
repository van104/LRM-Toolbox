# 🛠️ LRM工具箱 (Online Utilities)

**LRM工具箱** 是一个功能强大的在线开源工具箱，基于 **Vue 3** + **Vite** + **TailwindCSS v4** + **Element Plus** + **TypeScript** 构建。提供了包括开发运维、图像处理、文本清洗、生活常用、金融理财、教育学习、健康运动、趣味游戏和 PDF 处理等在内的 100+ 种实用工具。

**🌐 演示地址：[https://www.lrm123.site/](https://www.lrm123.site/)**

## ✨ 特性

本项目包含丰富的在线工具集，主要分为以下几大类：

### 👨‍💻 开发者工具 (Developer Tools)

- JSON 格式化、Base64 编解码、时间戳转换、MD5 加密
- 正则表达式测试、URL 编解码、CSS 格式化、SQL 构建器
- API 测试、JWT 解码、Crontab 表达式生成、Git 命令速查表
- 端口扫描、编码转换、随机数据生成、子网掩码计算等

### 🖼️ 图像处理 (Image Processing)

- 图片压缩、格式转换、尺寸调整、图片水印
- 二维码生成/识别、条形码生成、图片拼接、背景移除
- 照片书制作、批量重命名等

### 📝 文本工具 (Text Tools)

- 文本差异对比、Markdown 编辑器、字数统计、文本清洗
- 文本提取、简繁转换、文本分割、文本加密
- 关键词提取、押韵查询、句子统计、HTML 实体转换等

### 📄 PDF 工具 (PDF Tools)

- PDF 转图片、图片转 PDF、PDF 拆分/合并
- PDF 水印、压缩、旋转、加密/解密
- PDF 页码添加、页面排序、灰度化、元数据编辑
- PDF 签名、裁剪、叠加、Markdown 转 PDF 等

### 🏠 生活助手 (Life Helper)

- 单位换算、衣服尺码指南、日期计算器、生日提醒
- 工作日计算、公农历转换、房贷计算器、个税计算
- 垃圾分类查询、节假日查询、公共服务电话等

### 💰 金融计算 (Financial Utilities)

- 汇率转换、房贷计算、个税计算、折扣计算
- 甚至包括养老金估算、复利计算、盈亏计算等

### 🎓 教育学习 (Education & Learning)

- 拼音查询、公式编辑器、元素周期表、成语词典
- 汉字笔画、田字格生成、古诗词鉴赏、单词拆解等

### 🎮 趣味游戏 (Fun & Games)

- 2048、五子棋、井字棋、扫雷、数独
- 反应力测试、记忆卡片、汉诺塔、Flappy Bird
- 像素画绘制、ASCII 艺术生成、幸运抽奖、表白网页生成等

### 🎨 设计工具 (Design Resources)

- 数据可视化编辑器、配色方案生成、图标库搜索
- 字体展示、原型设计工具、屏幕尺子、思维导图等

### 🏥 健康工具 (Health & Fitness)

- BMI 计算、卡路里计算、饮水提醒、视力测试
- 预产期计算、健康饮食推荐、基础代谢率计算等

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/van104/LRM-Toolbox.git
# 进入项目目录
cd toolbox

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动本地开发服务器
npm run dev
```

访问 `http://localhost:5173` (也就是 Vite 默认端口) 查看效果。

# 构建生产版本

```bash
# 构建用于生产环境的文件
npm run build

# 预览构建产物
npm run preview
```

## 🌐 部署指南 (以宝塔面板为例)

### 1. 前端部署 (HTML/Vue)

1. 在本地执行 `npm run build` 生成 `dist` 文件夹。
2. 在宝塔面板新建一个“静态网站”，将 `dist` 文件夹内的所有文件上传到网站根目录。
3. **设置伪静态** (单页面应用路由适配)：
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

### 2. 后端部署 (反馈系统 API)

1. 将项目中的 `server` 文件夹上传到服务器（例如：`/www/wwwroot/api.example.com/` 或直接在前端项目下）。
2. 在该目录下新建 `.env` 文件，配置管理员密码和跨域白名单：

   ```ini
   # 管理员密码 (用于访问 /admin 页面)
   ADMIN_PASSWORD=自定义你的管理员密码

   # 允许跨域访问的域名 (CORS 白名单)
   # 如果前端和后端域名不同，必须配置此项。多个域名用逗号分隔。
   # 务必包含 http 和 https 协议头，且不要有尾部斜杠。
   ALLOWED_ORIGINS=http://localhost:5173,https://www.lrm123.site,http://www.lrm123.site
   ```

3. **安装依赖与启动**：
   - 进入 `server` 目录，执行 `npm install` 安装依赖 (包含 sqlite3)。
   - 启动服务后，系统会自动在目录下生成 `database.sqlite` 数据库文件。
   - **注意**：请勿将本地为空的 `database.sqlite` 覆盖到生产环境，以免丢失数据。建议在 `.gitignore` 中忽略此文件。

### 3. Nginx 反向代理 (解决跨域与 HTTPS 混合内容问题)

为了让前端能安全地访问后端，请在“前端网站”的配置文件中添加以下配置（或在宝塔反向代理界面手动配置）：

```nginx
# LRM工具箱反馈接口反代 (本项目)
# 请将 YOUR_API_PATH 替换为您在 .env.production 中设置的路径
location ^~ /YOUR_API_PATH/ {
    proxy_pass http://127.0.0.1:3000; # 请确保端口与后端 server.js 一致
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

> **注意**：如果您在 `server.js` 中使用了不同的端口，请将 `3000` 修改为实际端口。

### 4. 管理后台

部署完成后，可以通过以下隐藏链接管理用户反馈：

- 地址：`https://你的域名/admin/feedback`
- 登录：使用你在 `.env` 中设置的 `ADMIN_PASSWORD`。

## 📂 项目结构

```
toolbox/
├── public/                 # 公共静态资源
├── server/                 # 反馈系统后端 (Node.js)
│   ├── data/               # 反馈数据存储 (JSON)
│   ├── .env                # 配置文件 (环境变量/密码)
│   ├── server.js           # 后端服务入口
│   └── package.json        # 后端依赖配置
├── src/
│   ├── api/                # API 接口封装 (反馈、汇率等)
│   ├── components/         # 组件库
│   │   ├── common/         # 通用组件
│   │   ├── icons/          # 图标组件
│   │   ├── layout/         # 布局组件
│   │   └── tools/          # 工具组件 (100+ 实用工具)
│   ├── data/               # 本地静态数据
│   ├── router/             # 路由配置 (含管理后台路由)
│   ├── stores/             # Pinia 状态管理
│   ├── styles/             # 全局样式与变量
│   ├── utils/              # 通用工具函数
│   ├── views/              # 页面视图
│   │   ├── pages/          # 独立页面 (About, FeedbackAdmin)
│   │   └── Home.vue        # 首页
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── index.html              # 入口 HTML
├── package.json            # 前端项目配置
└── vite.config.ts          # Vite 配置
```

## 🤝 贡献指南 (Contributing)

欢迎提交 Pull Request 或 Issue 来改进这个项目！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证 (License)

本项目基于 **GNU Affero General Public License v3.0 (AGPL-3.0)** 许可证开源。

### ⚠️ 严正声明 (Legal Warning)

1.  **禁止套壳商用**：严禁任何个人或机构在未经原作者书面授权的情况下，将本项目代码进行简单的“换皮/套壳”后作为商业产品出售或提供付费服务。
2.  **强制开源**：如果您对本项目代码进行了二次开发并提供了网络服务，根据 AGPL-3.0 协议要求，您**必须**向您的用户公开您修改后的完整源代码。
3.  **保留版权**：任何基于本项目的衍生版本，必须在显著位置保留原作者的版权声明和本项目链接。

> **版权所有 (c) 2026 LRM (van104)**。保留所有法律追究权利。
