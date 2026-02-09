




export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  icon?: string;
  customIcon?: string;
  summary: string;
  description: string;
  usage: string;
  route: string;
  isLocal: boolean;
  isAi?: boolean;
  tags: string[];
}

export const categories: Category[] = [
  { id: 'all', name: '全部工具', icon: 'Grid' },
  { id: 'dev', name: '开发运维', icon: 'Monitor' },
  { id: 'text', name: '文本处理', icon: 'Document' },
  { id: 'image', name: '图片视频', icon: 'Picture' },
  { id: 'pdf', name: 'PDF 处理', icon: 'Document' },
  { id: 'design', name: '设计辅助', icon: 'Brush' },
  { id: 'finance', name: '金融理财', icon: 'Wallet' },
  { id: 'health', name: '健康运动', icon: 'Service' },
  { id: 'life', name: '生活常用', icon: 'Coffee' },
  { id: 'edu', name: '教育学习', icon: 'Notebook' },
  { id: 'fun', name: '趣味玩法', icon: 'IceTea' },
]


export const tools: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON 格式化',
    category: 'dev',

    customIcon: '/icons/json.svg',
    summary: '在线 JSON 格式化、压缩、校验工具',
    description: '支持 JSON 格式化美化、压缩混淆、语法校验、树形视图展示等功能。可自动检测和修复常见 JSON 语法错误。',
    usage: '1. 将 JSON 数据粘贴到左侧编辑器\n2. 点击格式化按钮美化代码\n3. 可选择不同缩进风格和排序方式',
    route: '/tools/json-formatter',
    isLocal: true,
    tags: ['JSON', '格式化', '开发']
  },
  {
    id: 'base64-encode',
    name: 'Base64 编解码',
    category: 'dev',
    icon: 'Lock',
    summary: '文本和文件的 Base64 编码解码工具',
    description: '支持文本字符串和文件的 Base64 编码与解码，可处理图片转 Base64 数据 URI。',
    usage: '1. 输入需要编码的文本或上传文件\n2. 选择编码或解码模式\n3. 点击转换获取结果',
    route: '/tools/base64',
    isLocal: true,
    tags: ['Base64', '编码', '解码']
  },
  {
    id: 'md5-hash',
    name: 'MD5 哈希生成',
    category: 'dev',
    icon: 'Finished',
    summary: '计算文本或文件的 MD5 哈希值',
    description: '快速生成 MD5 哈希值，支持文本输入和文件上传两种模式。',
    usage: '1. 输入文本或上传文件\n2. 自动计算并显示 MD5 值\n3. 一键复制结果',
    route: '/tools/md5',
    isLocal: true,
    tags: ['MD5', '哈希', '加密']
  },
  {
    id: 'regex-tester',
    name: '正则测试',
    category: 'dev',
    icon: 'Search',
    summary: '在线正则表达式测试与匹配工具',
    description: '实时测试正则表达式，高亮显示匹配结果，支持常用正则模板。',
    usage: '1. 输入正则表达式\n2. 输入测试文本\n3. 实时查看匹配结果',
    route: '/tools/regex',
    isLocal: true,
    tags: ['正则', '匹配', '测试']
  },
  {
    id: 'url-encode',
    name: 'URL 编解码',
    category: 'dev',
    icon: 'Link',
    summary: 'URL 编码与解码，支持参数解析',
    description: '对 URL 进行编码或解码，并将 URL 参数解析为表格形式，方便查看和编辑。',
    usage: '1. 输入 URL 字符串\n2. 选择编码或解码\n3. 查看参数列表',
    route: '/tools/url',
    isLocal: true,
    tags: ['URL', '编码', '解码', '参数']
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    category: 'dev',
    icon: 'Timer',
    summary: '时间戳与日期时间互相转换',
    description: '支持 Unix 时间戳（秒/毫秒）与可读日期时间格式的双向转换。',
    usage: '1. 输入时间戳或选择日期时间\n2. 自动显示转换结果\n3. 支持多种时区',
    route: '/tools/timestamp',
    isLocal: true,
    tags: ['时间戳', '日期', '转换']
  },
  {
    id: 'password-generator',
    name: '密码生成器',
    category: 'dev',
    icon: 'Key',
    summary: '安全强度的随机密码生成工具',
    description: '支持自定义长度、字符类型（大小写/数字/符号），提供强度检测、历史记录和批量生成功能。优先使用加密级随机数生成器。',
    usage: '1. 设置密码长度和字符选项\n2. 点击生成按钮\n3. 复制密码或保存到历史',
    route: '/tools/password-generator',
    isLocal: true,
    tags: ['密码', '生成', '安全', '随机']
  },
  {
    id: 'css-formatter',
    name: 'CSS 格式化',
    category: 'dev',
    icon: 'Notification',
    summary: 'CSS 代码格式化与压缩工具',
    description: '美化或压缩 CSS 代码，支持多种格式化风格。',
    usage: '1. 粘贴 CSS 代码\n2. 选择格式化或压缩\n3. 复制处理结果',
    route: '/tools/css-formatter',
    isLocal: true,
    tags: ['CSS', '格式化', '压缩']
  },
  {
    id: 'string-escaper',
    name: '字符串转义',
    category: 'dev',
    icon: 'Connection',
    summary: '代码/HTML/SQL 转义与反转义',
    description: '支持 Java/JavaScript/C# 字符串转义，HTML/XML 实体编码，以及 SQL、URL、CSV 等多种格式的互相转换。',
    usage: '1. 输入或粘贴原始文本\n2. 选择目标语言\n3. 点击转义或反转义',
    route: '/tools/string-escaper',
    isLocal: true,
    tags: ['转义', 'Escape', '编码', 'HTML', 'Java']
  },
  {
    id: 'sql-builder',
    name: 'SQL 生成助手',
    category: 'dev',
    icon: 'Coin',
    summary: '多行文本/CSV/JSON 转 SQL 语句',
    description: '专业的 SQL 构建工具：支持列表转 IN 查询、CSV 转 INSERT 插入、JSON 转 CREATE 建表，以及智能解析 SQL 文件生成 Mock 测试数据。',
    usage: '1. 选择模式 (IN/INSERT/CREATE/Smart)\n2. 输入或上传数据\n3. 点击生成',
    route: '/tools/sql-builder',
    isLocal: true,
    tags: ['SQL', '数据库', 'Mock', 'INSERT', 'CREATE']
  },
  {
    id: 'api-tester',
    name: 'API 接口调试器',
    category: 'dev',
    icon: 'Monitor',
    summary: '在线接口测试与 JSON 响应预览',
    description: '轻量级在线版本的 Postman。支持 GET, POST, PUT, DELETE 等常用请求方法，可配置 Header、Query 参数及 JSON/Form Body，提供语法高亮显示和结果耗时统计。',
    usage: '1. 输入 API 地址并选择请求方法\n2. 在下方页签配置 Headers 或 Body 内容\n3. 点击发送并查看结果预览',
    route: '/tools/api-tester',
    isLocal: true,
    tags: ['API', 'Postman', '接口测试', 'JSON', 'HTTP']
  },
  {
    id: 'jwt-decoder',
    name: 'JWT 解码工具',
    category: 'dev',
    icon: 'Key',
    summary: 'JWT 令牌解析与载荷查看',
    description: '在线解析 JSON Web Token (JWT)。支持 Base64Url 编码的 Header 和 Payload 实时解析显示，自动识别过期时间 (exp)，界面红绿分明，语义清晰。',
    usage: '1. 将 JWT 粘贴到输入框中\n2. 自动在右侧显示 Header 和 Payload 的 JSON 结构\n3. 查看 exp 字段对应的具体过期时间',
    route: '/tools/jwt-decoder',
    isLocal: true,
    tags: ['JWT', 'JSON', 'Token', '解码', '安全', '认证']
  },
  {
    id: 'crontab-tool',
    name: 'Crontab 工具',
    category: 'dev',
    icon: 'AlarmClock',
    summary: 'Cron 表达式生成与反向解析',
    description: '可视化生成 Crontab 表达式。支持分、时、日、月、周的精细化配置，提供实时语义化中文解读及常用定时任务模板，解决记不住 Cron 语法的烦恼。',
    usage: '1. 在各个标签页（分、时、日等）选择执行频率\n2. 左侧实时预览生成的表达式及中文描述\n3. 点击复制以便在服务器上使用',
    route: '/tools/crontab',
    isLocal: true,
    tags: ['Cron', 'Crontab', '定时任务', 'Linux', '解析', '生成']
  },
  {
    id: 'git-cheatsheet',
    name: 'Git 命令备忘录',
    category: 'dev',
    icon: 'Connection',
    summary: '常用 Git 工作流命令汇总',
    description: '涵盖 Git 基础配置、分支操作、暂存提交、撤销回滚、远程同步及 Stash 等核心命令。提供语义化的详细说明和一键复制功能，支持实时快速模糊搜索。',
    usage: '1. 通过分类或顶部搜索栏查找需要的场景\n2. 点击命令右侧的复制图标即可使用\n3. 查看底部的 Tips 获取更多使用建议',
    route: '/tools/git-cheatsheet',
    isLocal: true,
    tags: ['Git', '版本控制', '命令', '备忘录', '工作流', '代码']
  },
  {
    id: 'ssl-checker',
    name: 'SSL 证书解析',
    category: 'dev',
    icon: 'Lock',
    summary: 'SSL/TLS 证书内容格式化查看',
    description: '在线解析 PEM 格式的 SSL 证书。支持提取 Common Name (CN)、颁发机构 (Issuer)、有效期 (Not Before/After) 及序列号等核心属性。本地解析，保障数据隐私。',
    usage: '1. 将证书文件 (.crt/.pem) 的内容粘贴到输入框\n2. 右侧自动显示该证书的详细注册信息及过期状态提醒',
    route: '/tools/ssl-checker',
    isLocal: true,
    tags: ['SSL', 'TLS', '证书', 'HTTPS', '域名', '安全']
  },
  {
    id: 'config-templates',
    name: '配置模版生成器',
    category: 'dev',
    icon: 'Files',
    summary: 'Docker 与 Nginx 常用配置模版',
    description: '快速生成常见的开发运维配置文件。包含 Nginx 反向代理、静态资源托管、Docker Compose 常用服务（Node/MySQL）等，支持参数化自定义字段并一键复制。',
    usage: '1. 选择左侧需要的模版类型（如 Nginx 反向代理）\n2. 在输入框中修改域名、端口等自定义参数\n3. 右侧实时预览生成的配置文件内容，点击复制即可',
    route: '/tools/config-templates',
    isLocal: true,
    tags: ['Nginx', 'Docker', 'Compose', '配置', '模版', '运维']
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    category: 'design',
    icon: 'Brush',
    summary: '自由取色与 HEX/RGB/HSL 转换',
    description: '支持透明度的颜色选择器，实时预览并自动转换为 HEX, HEX8, RGB, HSL 等常用格式，一键复制。',
    usage: '点击取色盘选择颜色，或输入颜色代码，右侧自动生成各格式代码。',
    route: '/tools/color-picker',
    isLocal: true,
    tags: ['Color', 'Design', 'HEX', 'RGB', 'Converter']
  },
  {
    id: 'icon-library',
    name: '图标库大全',
    category: 'design',
    icon: 'Picture',
    summary: '矢量图标一站式搜索下载',
    description: '聚合全球主流矢量图标库（Iconfont, Font Awesome, Remix Icon等），提供官网直达与便捷的聚合搜索功能，设计开发必备。',
    usage: '1. 在上方搜索框输入关键词（如 "home"）。\n2. 点击对应卡片下方的"搜索"按钮，直接跳转至该平台的搜索结果页。\n3. 或点击"访问官网"浏览全部资源。',
    route: '/tools/icon-library',
    isLocal: true,
    tags: ['图标', 'Icon', 'SVG', 'Design', 'Resource']
  },
  {
    id: 'font-resource',
    name: '字体资源大全',
    category: 'design',
    icon: 'Edit',
    summary: '免费商用字体与 WebFont 聚合',
    description: '精选 Google Fonts, 字由, 100font 等优质字体资源站，提供免费商用字体下载指引和 WebFont 在线引用服务。',
    usage: '1. 输入字体名称关键词（如 "Roboto"）。\n2. 使用一键跳转功能在各平台搜索。\n3. 或直接访问平台浏览最新字体。',
    route: '/tools/font-resource',
    isLocal: true,
    tags: ['字体', 'Font', '免费商用', 'Design', 'WebFont']
  },
  {
    id: 'prototype-design',
    name: '原型与UI设计',
    category: 'design',
    icon: 'Monitor',
    summary: '专业的界面设计、交互原型制作及团队协作工具',
    description: '聚合 Figma, Sketch, Adobe XD, Pixso, 即时设计等主流 UI/UX 设计工具，提供官方网站入口。',
    usage: '1. 浏览工具列表\n2. 点击“访问官网”跳转至对应平台\n3. 开始您的设计工作',
    route: '/tools/prototype-design',
    isLocal: true,
    tags: ['UI', 'UX', '设计', '原型', 'Figma', 'Sketch']
  },
  {
    id: 'design-assets',
    name: '素材与图库',
    category: 'design',
    icon: 'PictureFilled',
    summary: '提供高清无版权图片、设计素材模版及设计灵感社区',
    description: '聚合 Unsplash, Pexels, Pixabay, Freepik, Dribbble, Behance 等优质设计资源站，一站式获取灵感与素材。',
    usage: '1. 选择需要的素材类型（图片/矢量/灵感）\n2. 点击卡片上的按钮跳转至对应网站\n3. 搜索或下载所需资源',
    route: '/tools/design-assets',
    isLocal: true,
    tags: ['素材', '图片', '图库', '灵感', '设计']
  },
  {
    id: 'random-data',
    name: '随机数据生成',
    category: 'dev',
    icon: 'Files',
    summary: 'Mock数据/UUID/个人信息生成',
    description: '支持 UUID/GUID、随机字符串、数字、颜色生成；提供中英文假文（Lorem Ipsum）、姓名/地址/身份证等个人信息模拟，以及基于 Mock.js 模板的复杂 JSON 数据生成。',
    usage: '1. 选择数据类型标签\n2. 设置生成参数（数量/规则）\n3. 点击生成并复制结果',
    route: '/tools/random-data',
    isLocal: true,
    tags: ['随机', 'Mock', '测试数据', '生成', 'UUID']
  },
  {
    id: 'ascii-art',
    name: 'ASCII 艺术生成',
    category: 'fun',
    icon: 'MagicStick',
    summary: '文字转字符画 Banner / 图片转 ASCII',
    description: '集成 Figlet 库将文字转换为 3D/手写体字符画，支持多种字体；同时提供图片转 ASCII 字符画功能，支持自定义字符集和分辨率。',
    usage: '1. 文字模式：输入文本 -> 选择字体\n2. 图片模式：上传图片 -> 调整宽度与字符集',
    route: '/tools/ascii-art',
    isLocal: true,
    tags: ['ASCII', '字符画', 'Figlet', 'Banner', '图片转字符']
  },
  {
    id: 'gomoku',
    name: '五子棋',
    category: 'fun',
    icon: 'Grid',
    summary: '经典五子棋对弈游戏',
    description: '支持人机对战与双人对弈两种模式。可自由选择棋盘大小（9×9 至 19×19）、先后手以及 AI 难度。简洁优雅的棋盘界面，后续将支持对接 AI 模型 API。',
    usage: '1. 选择游戏模式（人机/双人）\n2. 设置棋盘大小与先后手\n3. 点击棋盘落子',
    route: '/tools/gomoku',
    isLocal: true,
    tags: ['游戏', '五子棋', '棋类', 'AI', '对弈']
  },
  {
    id: 'tictactoe',
    name: '井字棋',
    category: 'fun',
    icon: 'Grid',
    summary: '经典 3×3 井字棋游戏',
    description: '经典的井字棋游戏，支持人机对战与双人对弈。AI 采用 Minimax 算法，困难模式下几乎不可战胜！',
    usage: '1. 选择游戏模式（人机/双人）\n2. 设置先后手和 AI 难度\n3. 点击格子落子',
    route: '/tools/tictactoe',
    isLocal: true,
    tags: ['游戏', '井字棋', '棋类', 'AI', '对弈']
  },
  {
    id: 'minesweeper',
    name: '扫雷',
    category: 'fun',
    icon: 'Grid',
    summary: '经典逻辑排雷游戏',
    description: '经典的扫雷游戏，支持初级（9×9）、中级（16×16）、高级（30×16）三种难度，还可自定义棋盘大小和地雷数量。支持右键插旗、双键快揭等经典操作。',
    usage: '1. 选择难度\n2. 左键揭开格子，右键插旗\n3. 根据数字推理找出所有地雷',
    route: '/tools/minesweeper',
    isLocal: true,
    tags: ['游戏', '扫雷', '逻辑', '益智', '经典']
  },
  {
    id: 'jigsaw-puzzle',
    name: '拼图游戏',
    category: 'fun',
    icon: 'Picture',
    summary: '自定义图片拼图游戏',
    description: '支持自定义上传图片生成拼图，提供多种难度选择（3x3 到 10x10）。经典的拼图玩法，自动吸附对齐，记录通关时间。',
    usage: '1. 选择预设图片或上传自己的图片\n2. 设置难度（切片数量）\n3. 拖动拼图块完成复原',
    route: '/tools/jigsaw-puzzle',
    isLocal: true,
    tags: ['游戏', '拼图', '益智', '图片', 'Jigsaw']
  },
  {
    id: 'word-guess',
    name: '猜词游戏',
    category: 'fun',
    icon: 'Edit',
    summary: 'Wordle 风格猜词游戏',
    description: '经典的 Wordle 风格猜词游戏，支持英文单词（5字母）和中文成语（4字）两种模式。包含每日挑战逻辑统计和无限练习模式。',
    usage: '1. 选择语言模式（英文/中文）\n2. 输入猜测词汇并回车\n3. 根据绿色（位置正确）、黄色（字符存在）提示完成解谜',
    route: '/tools/word-guess',
    isLocal: true,
    tags: ['游戏', 'Wordle', '成语', '单词', '益智']
  },
  {
    id: 'reaction-test',
    name: '反应力测试',
    category: 'fun',
    icon: 'Timer',
    summary: '测试视觉与点击反应速度',
    description: '专业的视觉反应速度测试工具。等待红色变为绿色时立即点击，系统将精确记录您的毫秒级反应时间，并提供全球排名模拟对比。',
    usage: '1. 点击蓝色区域开始测试\n2. 等待背景由红变绿\n3. 变绿瞬间立即点击\n4. 查看成绩和排名',
    route: '/tools/reaction-test',
    isLocal: true,
    tags: ['游戏', '测试', '反应力', '速度']
  },
  {
    id: 'sudoku',
    name: '数独',
    category: 'fun',
    icon: 'Grid',
    summary: '经典数独益智游戏',
    description: '经典的9x9数独益智游戏。支持简单/中等/困难三种难度，包含笔记功能、自动校验、提示系统和计时器。',
    usage: '1. 选择难度开始新游戏\n2. 点击格子选中，再点击数字填入\n3. 使用笔记功能记录可能的数字\n4. 利用提示和检查功能辅助解题',
    route: '/tools/sudoku',
    isLocal: true,
    tags: ['游戏', '数独', '益智', '逻辑']
  },
  {
    id: 'memory-card',
    name: '记忆翻牌',
    category: 'fun',
    icon: 'Files',
    summary: '考验记忆力的翻牌配对游戏',
    description: '经典的记忆翻牌游戏。在有限的步数和时间内，通过记忆卡片位置，找出所有相同的配对。支持 4x4 和 6x6 两种难度模式。',
    usage: '1. 点击卡片将其翻转\n2. 连续翻出两张相同的卡片即可消除\n3. 消除所有卡片即可通关',
    route: '/tools/memory-card',
    isLocal: true,
    tags: ['游戏', '记忆', '翻牌', '益智']
  },
  {
    id: 'hanoi',
    name: '汉诺塔',
    category: 'fun',
    icon: 'Operation',
    summary: '经典的数学逻辑益智游戏',
    description: '汉诺塔（Tower of Hanoi）是一个著名的数学谜题。目标是将所有圆盘从起始柱移动到目标柱，每次只能移动一个圆盘，且大圆盘不能放在小圆盘上。',
    usage: '1. 点击柱子选择最上方的圆盘\n2. 点击另一个柱子将其放入\n3. 将所有圆盘移至最右侧柱子即可胜利',
    route: '/tools/hanoi',
    isLocal: true,
    tags: ['游戏', '汉诺塔', '益智', '逻辑', '数学']
  },
  {
    id: 'flappy-bird',
    name: '管道小鸟',
    category: 'fun',
    icon: 'Promotion',
    summary: '极简风格的飞行闯关游戏',
    description: '控制小鸟飞行，穿过随机生成的管道障碍。看似简单，实则极具挑战性！考验你的反应速度和节奏感。',
    usage: '1. 点击屏幕或按下空格键控制小鸟向上飞\n2. 不操作时小鸟会受重力下坠\n3. 穿过管道缝隙得分，撞到管道或地面则游戏结束',
    route: '/tools/flappy-bird',
    isLocal: true,
    tags: ['游戏', '动作', '反应', '经典']
  },
  {
    id: 'match-3',
    name: '消消乐',
    category: 'fun',
    icon: 'Grid',
    summary: '经典的消除类益智游戏',
    description: '休闲解压的消消乐游戏。交换相邻的图标，凑齐3个或以上相同图标即可消除得分。支持连击奖励。',
    usage: '1. 点击选中一个图标\n2. 点击相邻的图标进行交换\n3. 若交换后形成3个及以上连线，则消除并得分',
    route: '/tools/match-3',
    isLocal: true,
    tags: ['游戏', '消除', '益智', '连击']
  },
  {
    id: 'simple-shooter',
    name: '2D射击',
    category: 'fun',
    icon: 'Aim',
    summary: '俯视角射击生存游戏',
    description: '控制角色在封闭空间内移动，使用鼠标瞄准并射击不断涌来的敌人。',
    usage: '1. WASD 控制移动\n2. 鼠标控制瞄准方向\n3. 点击左键射击',
    route: '/tools/simple-shooter',
    isLocal: true,
    tags: ['游戏', '射击', '动作', '生存']
  },
  {
    id: 'chemistry-lab',
    name: '化学模拟',
    category: 'fun',
    icon: 'MagicStick',
    summary: '即使不懂化学也能玩的实验模拟',
    description: '一个安全的虚拟化学实验室。拖拽元素到烧杯中，观察混合后的颜色变化和特殊反应（如气泡、变色、爆炸等）。支持拖拽操作。',
    usage: '1. 从左侧拖拽元素到中间的烧杯\n2. 点击“搅拌混合”观察反应\n3. 查看右侧的实验记录',
    route: '/tools/chemistry-lab',
    isLocal: true,
    tags: ['模拟', '科普', '趣味', '实验']
  },
  {
    id: 'tower-defense',
    name: '塔防小游戏',
    category: 'fun',
    icon: 'VideoPlay',
    summary: '策略塔防游戏',
    description: '经典的塔防小游戏。建造防御塔，阻止敌人到达终点。拥有不同类型的防御塔和无限的敌人波次。',
    usage: '1. 点击右侧面板选择防御塔\n2. 点击地图空白区域建造\n3. 点击“下一波敌人”开始战斗',
    route: '/tools/tower-defense',
    isLocal: true,
    tags: ['游戏', '策略', '塔防', '益智']
  },
  {
    id: 'snake',
    name: '贪吃蛇',
    category: 'fun',
    icon: 'Promotion',
    summary: '经典复古贪吃蛇',
    description: '控制贪吃蛇吃掉食物不断变长，小心不要撞到墙壁或自己。支持多种皮肤主题和加速模式。',
    usage: '1. 方向键控制移动\n2. 空格键加速\n3. P键暂停',
    route: '/tools/snake',
    isLocal: true,
    tags: ['游戏', '贪吃蛇', '经典', '反应']
  },
  {
    id: 'tetris',
    name: '俄罗斯方块',
    category: 'fun',
    icon: 'Grid',
    summary: '经典方块消除游戏',
    description: '重温经典的俄罗斯方块游戏！支持方块旋转、快速/直接下落、暂存功能（Hold）。包含等级系统，随着分数增加游戏速度逐渐加快。',
    usage: '1. 方向键左右移动，上键旋转\n2. 下键加速下落，空格键直接掉落\n3. C键暂存或交换当前方块',
    route: '/tools/tetris',
    isLocal: true,
    tags: ['游戏', '俄罗斯方块', 'Tetris', '经典', '益智']
  },
  {
    id: 'maze-3d',
    name: '3D 迷宫',
    category: 'fun',
    icon: 'Location',
    summary: '3D 迷宫探索游戏',
    description: '使用 Three.js 构建的 3D 迷宫探索游戏。在错综复杂的迷宫中寻找出口，挑战不同难度和关卡。',
    usage: '1. WASD 或方向键控制移动\n2. 寻找绿色光柱出口\n3. 随着关卡提升迷宫会变大',
    route: '/tools/maze-3d',
    isLocal: true,
    tags: ['游戏', '3D', 'Three.js', '迷宫']
  },
  {
    id: 'virtual-pet',
    name: '虚拟宠物',
    category: 'fun',
    icon: 'Avatar',
    summary: '桌面像素电子宠物',
    description: '重温童年回忆的电子宠物。你需要喂食、陪玩、清理，精心照顾它从一颗蛋进化成成体。包含丰富的表情交互和状态系统。',
    usage: '1. 点击蛋孵化\n2. 定时喂食和玩耍保持状态\n3. 及时清理便便以免生病\n4. 长期照顾可以进化',
    route: '/tools/virtual-pet',
    isLocal: true,
    tags: ['游戏', '养成', '宠物', '像素']
  },
  {
    id: 'text-adventure',
    name: '文字冒险',
    category: 'fun',
    icon: 'Reading',
    summary: '沉浸式互动小说',
    description: '基于选择的互动小说游戏。可以在武侠、奇幻等多种背景中展开冒险，你的每一个选择都会影响剧情走向和最终结局。',
    usage: '1. 选择一个剧本开始游戏\n2. 阅读剧情并做出选择\n3. 管理你的生命值和金币\n4. 达成不同结局',
    route: '/tools/text-adventure',
    isLocal: true,
    tags: ['游戏', '小说', '剧情', 'RPG']
  },
  {
    id: 'life-simulator',
    name: '模拟人生 (文字版)',
    category: 'fun',
    icon: 'User',
    summary: '文字版人生模拟器',
    description: '从出生到老去的完整人生模拟。每一次点击都是一年，包含随机事件、职业选择、资产管理等元素。你的天赋决定起点，但选择决定终点。',
    usage: '1. 随机生成初始天赋\n2. 每年点击"下一年"推进时间\n3. 处理发生的随机事件\n4. 努力工作赚钱，保持健康快乐',
    route: '/tools/life-simulator',
    isLocal: true,
    tags: ['游戏', '模拟', '文字', '养成']
  },
  {
    id: 'pinball',
    name: '弹球消消乐',
    category: 'fun',
    icon: 'Aim',
    summary: '经典弹球/打砖块游戏',
    description: '一款物理特效精美的经典弹球游戏。通过移动挡板反弹小球，消除所有关卡中的砖块。包含多种砖块类型和关卡设计。',
    usage: '1. 鼠标左右移动控制下方挡板\n2. 消除所有砖块即可通关\n3. 保护小球不要掉落到底部',
    route: '/tools/pinball',
    isLocal: true,
    tags: ['游戏', '物理', '休闲', '经典']
  },
  {
    id: 'game-2048',
    name: '2048',
    category: 'fun',
    icon: 'Grid',
    summary: '数字合并益智游戏',
    description: '经典的 2048 数字游戏。滑动方向键合并相同的数字块，挑战合成 2048！支持 4×4、5×5、6×6 多种规格棋盘。',
    usage: '1. 使用方向键或滑动屏幕移动方块\n2. 相同数字碰撞会合并\n3. 努力合成更大的数字',
    route: '/tools/2048',
    isLocal: true,
    tags: ['游戏', '2048', '益智', '数学', '合并']
  },
  {
    id: 'text-template',
    name: '文本模板引擎',
    category: 'text',
    icon: 'DocumentCopy',
    summary: '简易邮件合并/批量生成工具',
    description: '通过 Mustache 风格占位符 ({{var}}) 和 JSON/CSV 数据源，批量生成结构化文本。支持实时变量提取与自定义分隔符拼接。',
    usage: '1. 编写模板 ({{var}})\n2. 粘贴 JSON/CSV 数据\n3. 生成并复制结果',
    route: '/tools/text-template',
    isLocal: true,
    tags: ['模板', '批量', '生成', 'MailMerge', 'CSV']
  },


  {
    id: 'text-cleaner',
    name: '文本清洗',
    category: 'text',
    icon: 'MagicStick',
    summary: '一站式文本格式化与清洗工具',
    description: '提供去重、去空行、去空格、排序、大小写转换、全半角转换、标点规整等多种文本处理功能，支持批量操作。',
    usage: '1. 输入或粘贴文本\n2. 点击中间的功能按钮进行处理\n3. 实时预览结果并一键复制',
    route: '/tools/text-cleaner',
    isLocal: true,
    tags: ['文本', '清洗', '格式化', '去重', '排序']
  },
  {
    id: 'text-extractor',
    name: '文本提取器',
    category: 'text',
    icon: 'Filter',
    summary: '快速提取邮箱、网址、手机号等信息',
    description: '专业的文本信息提取工具，支持一键提取邮箱、URL、手机号、身份证、IP地址等常用信息，同时支持自定义正则表达式提取和关键词行过滤。',
    usage: '1. 输入或粘贴源文本\n2. 点击中间的提取按钮或输入正则\n3. 查看并复制提取结果',
    route: '/tools/text-extractor',
    isLocal: true,
    tags: ['文本', '提取', '正则', '筛选', '邮箱']
  },
  {
    id: 'text-converter',
    name: '文本转换器',
    category: 'text',
    icon: 'Switch',
    summary: '简繁/拼音/金额/进制/编码全能转换',
    description: '集简繁转换、拼音标注、数字金额大写、进制转换、URL/Unicode 编码转换于一体的多功能文本处理工具。',
    usage: '1. 输入文本\n2. 点击中间的转换按钮\n3. 结果显示在右侧',
    route: '/tools/text-converter',
    isLocal: true,
    tags: ['转换', '繁简', '拼音', '编码', '工具']
  },
  {
    id: 'text-splitter',
    name: '文本拆分与拼接',
    category: 'text',
    icon: 'Scissor',
    summary: '文本分割/合并/列表格式化',
    description: '强大的文本结构化工具，支持按分隔符或长度拆分文本、自定义拼接、CSV 列提取及列表格式转换。',
    usage: '1. 选择拆分/拼接/表格模式\n2. 设置分隔符或参数\n3. 点击执行按钮',
    route: '/tools/text-splitter',
    isLocal: true,
    tags: ['拆分', '拼接', 'CSV', '列表', '工具']
  },
  {
    id: 'text-security',
    name: '文本加密与脱敏',
    category: 'text',
    icon: 'Lock',
    summary: '敏感脱敏/简单加密/防复制',
    description: '提供敏感信息（手机/身份证）脱敏、凯撒/XOR/摩尔斯加密以及零宽字符文本混淆功能。',
    usage: '1. 选择脱敏/加密/混淆模式\n2. 点击预设按钮或输入参数\n3. 获取安全文本',
    route: '/tools/text-security',
    isLocal: true,
    tags: ['加密', '脱敏', '混淆', '摩尔斯', '安全']
  },
  {
    id: 'batch-replacer',
    name: '批量替换工具',
    category: 'text',
    icon: 'Refresh',
    summary: '多规则替换/文本清洗',
    description: '支持正则查找替换、批量执行多组替换规则（CSV格式）、以及行级的前后缀添加与过滤。',
    usage: '1. 普通替换：查找/替换\n2. 批量：输入 old,new 每行一条\n3. 行处理：添加前后缀或过滤',
    route: '/tools/batch-replacer',
    isLocal: true,
    tags: ['替换', '正则', '批量', '清洗', '修饰']
  },


  {
    id: 'text-diff',
    name: '文本对比',
    category: 'text',
    icon: 'Switch',
    summary: '对比两段文本的差异，高亮显示变化',
    description: '逐行对比两段文本，以高亮形式展示新增、删除和修改的内容。',
    usage: '1. 在左右两侧分别输入文本\n2. 点击对比按钮\n3. 查看差异高亮结果',
    route: '/tools/text-diff',
    isLocal: true,
    tags: ['文本', '对比', '差异']
  },
  {
    id: 'diff-comparer',
    name: '文本差异比较',
    category: 'text',
    icon: 'Switch',
    summary: '高效的文本差异对比工具',
    description: '支持按行/词/字符三种模式比较，提供合并/并排双视图，实时统计差异，支持文件导入导出及差异点自动跳转。',
    usage: '1. 输入或上传原始/修改文本\n2. 选择比较模式并点击比较\n3. 查看差异结果（支持自动跳转）',
    route: '/tools/diff-comparer',
    isLocal: true,
    tags: ['文本', '比较', '差异', 'Diff']
  },
  {
    id: 'text-counter',
    name: '文本计数器',
    category: 'text',
    icon: 'DocumentCopy',
    summary: '多功能文本字数统计与分析工具',
    description: '支持中英文字数分别统计、行数/段落计算、字符频率分析、常用词统计及阅读时间估算。',
    usage: '1. 输入或粘贴文本\n2. 实时查看各项统计指标\n3. 支持导出统计报告',
    route: '/tools/text-counter',
    isLocal: true,
    tags: ['统计', '字数', '分析', '字符']
  },
  {
    id: 'markdown-preview',
    name: 'Markdown 预览',
    category: 'text',
    icon: 'Reading',
    summary: '实时预览 Markdown 文档渲染效果',
    description: '支持 GFM 语法的 Markdown 编辑器，实时预览渲染效果。',
    usage: '1. 在左侧编写 Markdown\n2. 右侧实时预览效果\n3. 可导出为 HTML',
    route: '/tools/markdown',
    isLocal: true,
    tags: ['Markdown', '预览', '编辑']
  },


  {
    id: 'image-compress',
    name: '图片压缩',
    category: 'image',
    icon: 'PictureFilled',
    summary: '在线无损压缩图片，支持批量处理',
    description: '智能压缩 JPG、PNG、WebP 等格式图片，在保持画质的同时大幅减小文件体积。',
    usage: '1. 拖拽或选择图片上传\n2. 调整压缩质量参数\n3. 下载压缩后的图片',
    route: '/tools/image-compress',
    isLocal: true,
    tags: ['图片', '压缩', '优化']
  },
  {
    id: 'batch-renamer',
    name: '图片重命名',
    category: 'image',
    icon: 'Picture',
    summary: '批量图片文件重命名工具',
    description: '支持批量导入图片，自定义前缀、添加序号/时间戳、格式转换（WebP等），支持单个文件独立命名及实时预览。',
    usage: '1. 拖拽或点击上传图片\n2. 设置重命名规则（前缀、后缀、格式）\n3. 可手动修改个别文件名\n4. 点击批量下载',
    route: '/tools/batch-renamer',
    isLocal: true,
    tags: ['图片', '重命名', '批量', '格式转换']
  },
  {
    id: 'audio-library',
    name: '在线音频库',
    category: 'image',
    icon: 'Headset',
    summary: '在线音频素材库，支持上传、管理和分享音频文件',
    description: '开启您的云端音频库。支持 MP3, WAV, OGG, M4A, FLAC, AAC 等常见音频格式。提供永久存储、历史记录管理、公开/私有权限设置等完整功能。',
    usage: '1. 拖拽或点击上传音频文件\n2. 管理我的音频列表\n3. 生成分享链接或下载\n4. 支持公开/私有权限控制',
    isLocal: false,
    route: 'https://www.lrm123.site/tools/audio/',
    tags: ['音频', '素材', '云存储', '分享', 'MP3']
  },
  {
    id: 'qr-code',
    name: '二维码生成/解析',
    category: 'image',
    icon: 'FullScreen',
    summary: '二维码生成与图片识别解析',
    description: '支持自定义颜色、Logo、边距生成二维码，同时支持上传或粘贴二维码图片进行内容解析。',
    usage: '1. 生成：输入文本 -> 设置样式 -> 下载\n2. 解析：上传/拖拽/粘贴图片 -> 查看结果',
    route: '/tools/qr-code',
    isLocal: true,
    tags: ['二维码', '生成', '解析', '扫码']
  },
  {
    id: 'barcode-generator',
    name: '条形码生成器',
    category: 'image',
    icon: 'Operation',
    summary: '生成各种格式的条形码（EAN, UPC, Code128等）',
    description: '支持生成 EAN, UPC, Code128, ITF, MSI, Pharmacode 等多种格式条形码，支持自定义尺寸、颜色和显示文本。',
    usage: '1. 输入条码内容\n2. 选择条码格式\n3. 调整尺寸和颜色\n4. 下载图片',
    route: '/tools/barcode-generator',
    isLocal: true,
    tags: ['条形码', 'Barcode', '生成', 'EAN', 'UPC']
  },
  {
    id: 'image-converter',
    name: '图片格式转换',
    category: 'image',
    icon: 'Picture',
    summary: '支持 PNG, JPG, WEBP, BMP 等常见格式互转',
    description: '专业的图片格式转换工具，支持批量将图片转换为 PNG, JPG, WEBP 格式，支持自定义压缩质量。',
    usage: '1. 上传或拖拽图片文件\n2. 选择目标格式和质量\n3. 点击转换并下载',
    route: '/tools/image-converter',
    isLocal: true,
    tags: ['图片', '格式转换', 'PNG', 'JPG', 'WEBP']
  },
  {
    id: 'image-resizer',
    name: '图片尺寸调整',
    category: 'image',
    icon: 'ScaleToOriginal',
    summary: '按比例或固定尺寸批量调整图片大小',
    description: '支持按百分比缩放或指定像素宽高调整图片尺寸，支持锁定纵横比与批量处理，提供即时质量预览。',
    usage: '1. 上传图片\n2. 设置缩放模式（百分比/固定尺寸）\n3. 调整参数预览效果\n4. 开始处理并下载',
    route: '/tools/image-resizer',
    isLocal: true,
    tags: ['图片', '尺寸', '缩放', 'Resizer', '优化']
  },
  {
    id: 'image-watermark',
    name: '图片水印添加',
    category: 'image',
    icon: 'MagicStick',
    summary: '批量添加文字或图片水印',
    description: '支持批量添加文字水印或图片水印。可自定义位置、透明度、旋转角度、缩放比例。支持全屏平铺模式，所有处理均在本地完成。',
    usage: '1. 上传一张或多张图片\n2. 选择“文字”或“图片”水印模式\n3. 调整位置、透明度、旋转等参数\n4. 预览无误后点击批量下载',
    route: '/tools/image-watermark',
    isLocal: true,
    tags: ['图片', '水印', '批量', '版权保护']
  },
  {
    id: 'image-joiner',
    name: '图片拼接工具',
    category: 'image',
    icon: 'Grid',
    summary: '横向、纵向或网格拼图',
    description: '支持将多张图片拼接为一张长图或拼图。提供纵向拼接、横向拼接以及智能网格模式，支持自定义外边距、图片间距、圆角以及背景颜色。',
    usage: '1. 上传多张图片\n2. 选择拼接模式（纵向/横向/网格）\n3. 调整间距、圆角与背景色\n4. 点击导出生成的拼图',
    route: '/tools/image-joiner',
    isLocal: true,
    tags: ['图片', '拼接', '拼图', '长图', 'Collage']
  },
  {
    id: 'image-bg-remover',
    name: '图片去背景',
    category: 'image',
    isAi: true,
    icon: 'MagicStick',
    summary: 'AI 自动去除图片背景',
    description: '集成主流 AI 抠图引擎。支持一键去除人物、动物、商品等主体背景，生成透明 PNG 图片。支持 Remove.bg 及自定义 API 服务商配置。',
    usage: '1. 上传图片\n2. 在右侧设置面板配置 API Key\n3. 点击“开始抠图”并下载结果',
    route: '/tools/image-bg-remover',
    isLocal: true,
    tags: ['抠图', '去背景', 'AI', '透明图片', 'Remove.bg']
  },
  {
    id: 'photo-book',
    name: '照片书制作',
    category: 'image',
    icon: 'Notebook',
    summary: '照片排版与创意拼贴制作',
    description: '专业的照片书页排版工具。支持多种网格布局、自由拼贴模式，可添加背景纹理、贴纸素材和文字标题。导出高清图像，适合打印画册或社交分享。',
    usage: '1. 选择布局模版或自由模式\n2. 上传并拖拽照片到指定区域\n3. 调整位置、旋转及素材装饰\n4. 生成并下载高分辨率图片',
    route: '/tools/photo-book',
    isLocal: true,
    tags: ['排版', '拼贴', '画册', '打印', '设计']
  },




  {
    id: 'data-visualizer',
    name: '数据可视化',
    category: 'design',
    icon: 'DataLine',
    summary: 'Excel/CSV 数据一键生成图表',
    description: '支持导入 Excel/CSV 数据，生成柱状图、折线图、饼图等多种图表。支持数据在线编辑、即时预览，并可导出高清图片。',
    usage: '1. 上传数据文件或生成演示数据\n2. 选择图表类型和坐标轴\n3. 调整样式并导出图片',
    route: '/tools/data-visualizer',
    isLocal: true,
    tags: ['图表', '可视化', 'Excel', '数据分析']
  },


  {
    id: 'unit-converter',
    name: '单位转换器',
    category: 'life',
    icon: 'DataAnalysis',
    summary: '支持12种单位类型的在线换算工具',
    description: '支持长度、重量、温度、面积、体积、时间、速度、数据、压强、能量、功率、角度等单位互转，包含中国传统单位。',
    usage: '1. 选择单位类别\n2. 输入数值和源单位\n3. 选择目标单位查看结果',
    route: '/tools/unit-converter',
    isLocal: true,
    tags: ['单位', '转换', '换算', '长度', '重量']
  },
  {
    id: 'workout-timer',
    name: '训练助手',
    category: 'health',
    icon: 'Timer',
    summary: '训练倒计时与计划管理工具',
    description: '提供专业训练倒计时（支持组间休息）、训练计划管理（自定义动作/组数）以及自由通用计时器功能。',
    usage: '1. 创建或选择训练计划\n2. 开始训练并跟随倒计时\n3. 也可使用自由计时模式进行通用计时',
    route: '/tools/workout-timer',
    isLocal: true,
    tags: ['健身', '倒计时', '计划', '运动']
  },
  {
    id: 'currency-converter',
    name: '汇率换算',
    category: 'life',
    icon: 'Money',
    summary: '多国货币实时汇率换算与趋势查询',
    description: '支持全球主流货币的实时汇率换算，提供最近30天汇率走势图，支持快捷货币对切换和结果分享，适合海淘、旅行和跨境结算场景。',
    usage: '1. 选择源货币和目标货币\n2. 输入金额，自动计算结果\n3. 点击互换按钮可反向计算\n4. 查看下方趋势图了解近期走势',
    route: '/tools/currency-converter',
    isLocal: true,
    tags: ['汇率', '货币', '换算', '金融', '旅行']
  },
  {
    id: 'base-converter',
    name: '进制转换器',
    category: 'dev',
    icon: 'Cpu',
    summary: '二进制/八进制/十进制/十六进制互转',
    description: '支持二、八、十、十六进制实时互转，内置 ASCII 码对照表，适合程序员、电子爱好者和计算机学生使用。',
    usage: '1. 在任意进制输入框中输入数值\n2. 其他进制将自动计算并更新\n3. 点击复制按钮可复制结果\n4. 下方可查找 ASCII 码',
    route: '/tools/base-converter',
    isLocal: true,
    tags: ['进制', '转换', '二进制', '十六进制', 'ASCII', '编程']
  },
  {
    id: 'process-scheduling',
    name: 'CPU 调度算法',
    category: 'edu',
    icon: 'Cpu',
    summary: '操作系统进程调度算法可视化',
    description: '支持 FCFS、SJF、SRTF、RR、Priority 等多种调度算法的可视化演示。动态生成甘特图，计算周转时间与带权周转时间，支持自定义进程与动画播放。',
    usage: '1. 选择调度算法（如 FCFS, RR）\n2. 设置进程数量与参数（到达/服务时间）\n3. 点击运行查看甘特图与结果\n4. 可播放执行动画',
    route: '/tools/process-scheduling',
    isLocal: true,
    tags: ['OS', '调度', '算法', '可视化', 'CPU']
  },
  {
    id: 'clothing-size',
    name: '服装尺码助手',
    category: 'life',
    icon: 'Trophy',



    summary: '国标/欧美/日韩服装鞋码对照',
    description: '专业的服装鞋帽尺码转换工具，涵盖男装、女装、童装及鞋码。支持中国国标、欧美、日韩等国际标准互转，助您海淘购物无忧。',
    usage: '1. 选择类别（男/女/童/鞋）\n2. 选择您当前的标准和已知尺码\n3. 即时查看对应国家/地区的标准尺码\n4. 下方提供完整对照表供参考',
    route: '/tools/clothing-size',
    isLocal: true,
    tags: ['尺码', '服装', '鞋码', '海淘', '购物', '换算']
  },
  {
    id: 'date-calculator',
    name: '日期差计算器',
    category: 'life',
    icon: 'Calendar',
    summary: '日期间隔计算与推算',
    description: '专业的日期时间计算工具。支持计算两个日期之间的天数、月数、周数；也支持根据基准日期向前或向后推算新的日期。适用倒计时、工龄计算、纪念日查询。',
    usage: '1. 间隔计算：选择开始与结束日期，查看详细时间差\n2. 日期推算：选择基准日期，输入增减天数，获取新日期',
    route: '/tools/date-calculator',
    isLocal: true,
    tags: ['日期', '计算器', '时间', '间隔', '倒计时']
  },
  {
    id: 'birthday-reminder',
    name: '纪念日提醒',
    category: 'life',
    icon: 'Present',
    summary: '生日节日倒计时与年龄计算',
    description: '重要的日子不再错过。记录亲友生日、结婚纪念日或重要节日，自动计算倒计时天数、虚岁/周岁，并按时间自动排序，直观展示剩余天数。',
    usage: '1. 点击添加按钮，输入事件名称和日期\n2. 自动计算下次发生时间的倒计时\n3. 生日类型还会显示当前周岁和虚岁\n4. 临近30天内的日期会高亮显示',
    route: '/tools/birthday-reminder',
    isLocal: true,
    tags: ['生日', '纪念日', '提醒', '年龄', '倒计时', '节日']
  },
  {
    id: 'workday-calculator',
    name: '工作日计算器',
    category: 'life',
    icon: 'Suitcase',
    summary: '精准计算工期与考勤天数',
    description: '自动剔除周末，支持自定义节假日和补班日期。输入起止时间，即可快速计算实际工作天数。适用于项目管理、HR考勤统计及工程排期。',
    usage: '1. 设置起止日期\n2. 默认勾选“剔除周末”\n3. 在右侧管理特殊的节假日（如春节）和补班日\n4. 即时获取精确工作日天数',
    route: '/tools/workday-calculator',
    isLocal: true,
    tags: ['工作日', '考勤', '工期', '排期', '节假日']
  },
  {
    id: 'lunar-converter',
    name: '农历阳历转换',
    category: 'life',
    icon: 'Moon',
    summary: '公农历互转与黄历查询',
    description: '全面的中国传统历法工具。支持公历与农历日期的相互转换，提供每日宜忌、干支纪年、节气、生肖及星座信息，是您查看黄道吉日的好帮手。',
    usage: '1. 选择“公历转农历”或“农历转公历”模式\n2. 设定日期\n3. 查看对应的日期信息、宜忌、节气等详情',
    route: '/tools/lunar-converter',
    isLocal: true,
    tags: ['农历', '阴历', '阳历', '公历', '黄历', '宜忌']
  },
  {
    id: 'calculator',
    name: '日常计算器',
    category: 'life',
    icon: 'Cpu',
    summary: '增强型科学计算器',
    description: '集成基础算术与科学计算功能。支持记忆存储（M+）、括号运算、三角函数及对数运算，界面简洁美观，完美适配日常与学习场景。',
    usage: '1. 可使用键盘或屏幕按钮输入\n2. 点击 "Sci" 展开科学计算面板\n3. 支持 M+/MR 等记忆功能\n4. 底部自动记录计算历史',
    route: '/tools/calculator',
    isLocal: true,
    tags: ['计算器', '科学', '数学', '算术', '工具']
  },
  {
    id: 'decision-maker',
    name: '随机决策/吃什么',
    category: 'life',
    icon: 'Refresh',
    summary: '自定义转盘，解决你的纠结症',
    description: '支持自定义选项转盘，点击随机抽取。适配“中午吃什么”、“真心话大冒险”等多种生活纠结场景。',
    usage: '1. 在右侧编辑或选择预设选项\n2. 点击转盘中心的“开始”按钮\n3. 等待转盘停止获取结果',
    route: '/tools/decision-maker',
    isLocal: true,
    tags: ['决策', '随机', '转盘', '吃什么', '纠结']
  },
  {
    id: 'waste-classifier',
    name: '垃圾分类助手',
    category: 'life',
    icon: 'Delete',
    summary: '聚合全国垃圾分类查询库',
    description: '专业的垃圾分类指南。涵盖可回收物、厨余垃圾、有害垃圾和其他垃圾的详细分类要求，支持快速搜索查询。',
    usage: '1. 输入垃圾名称检索分类\n2. 查看不同类别的投放要求与示例',
    route: '/tools/waste-classifier',
    isLocal: true,
    tags: ['垃圾分类', '环保', '搜索', '指南']
  },
  {
    id: 'holiday-schedule',
    name: '调休放假安排表',
    category: 'life',
    icon: 'Calendar',
    summary: '可视化展示当年调休补班表',
    description: '直观查看“哪天休、哪天补”。基于国务院发布的官方放假安排，提供倒计时与详细的调休建议。',
    usage: '1. 切换年份查看放假表\n2. 查看红色标记的放假时间与黑色标记的补班时间',
    route: '/tools/holiday-schedule',
    isLocal: true,
    tags: ['放假', '调休', '日历', '假期', '补班']
  },
  {
    id: 'public-services',
    name: '常用公共服务合集',
    category: 'life',
    icon: 'Service',
    summary: '政务、交通、物流一站式链接',
    description: '精选高频使用的公共服务入口。包括违章查询、社保查询、公积金、快递单号聚合等，一键跳转官方平台。',
    usage: '1. 通过分类或搜索找到所需服务\n2. 点击卡片直接跳转至官方相关网站',
    route: '/tools/public-services',
    isLocal: true,
    tags: ['政务', '社保', '违章', '快递', '快捷导航']
  },
  {
    id: 'mortgage-calculator',
    name: '房贷计算器',
    category: 'finance',
    icon: 'House',
    summary: '房贷月供与利息计算',
    description: '支持等额本息与等额本金两种方式。输入贷款金额、期限和利率，自动计算每月还款额、利息总额，并提供详细的最后还款明细表。',
    usage: '1. 选择还款方式（等额本息/等额本金）\n2. 输入贷款总额、年限和年利率\n3. 点击计算，查看月供分析图表和明细',
    route: '/tools/mortgage-calculator',
    isLocal: true,
    tags: ['房贷', '贷款', '利息', '月供', '金融', '买房']
  },
  {
    id: 'tax-calculator',
    name: '个税计算器',
    category: 'finance',
    icon: 'Wallet',
    summary: '工资税后收入计算',
    description: '2024 最新个税计算规则。支持计算实发工资、个人所得税及五险一金明细。支持自定义社保公积金缴纳比例和专项附加扣除。',
    usage: '1. 输入税前月薪\n2. 填写专项附加扣除总额（可选）\n3. 调整五险一金缴纳基数与比例（可选）\n4. 点击计算查看实发工资分布',
    route: '/tools/tax-calculator',
    isLocal: true,
    tags: ['个税', '工资', '社保', '公积金', '税后', '五险一金']
  },
  {
    id: 'discount-calculator',
    name: '折扣计算器',
    category: 'finance',
    icon: 'ShoppingBag',
    summary: '购物打折与凑单助手',
    description: '商场购物、电商大促必备工具。支持单品折扣计算（X折/百分比）和跨店满减凑单计算（满X减Y），帮你快速算清到手价和节省金额。',
    usage: '1. 单品模式：输入原价与折扣，即得折后价\n2. 凑单模式：设置满减规则，添加商品列表，自动计算是否达标及凑单建议',
    route: '/tools/discount-calculator',
    isLocal: true,
    tags: ['折扣', '购物', '打折', '满减', '凑单', '促销']
  },
  {
    id: 'bmi-calculator',
    name: 'BMI 体脂计算',
    category: 'health',
    icon: 'User',
    summary: '身体质量指数(BMI)计算与健康评估',
    description: '输入身高体重，快速计算 BMI 指数，对照中国成人标准判断偏瘦、正常、超重或肥胖，并提供健康体重范围建议。',
    usage: '1. 输入身高(cm)和体重(kg)\n2. 自动计算 BMI 值并显示健康等级\n3. 查看对应的健康体重范围建议',
    route: '/tools/bmi-calculator',
    isLocal: true,
    tags: ['BMI', '健康', '体重', '体脂', '计算']
  },
  {
    id: 'calorie-calculator',
    name: '卡路里计算器',
    category: 'health',
    icon: 'Bowl',
    summary: '热量查询与每日消耗测算',
    description: '健身减肥必备。提供常见食物热量查询，支持计算每日热量消耗（TDEE），并给出减脂、维持或增肌的热量摄入建议。',
    usage: '1. 计算 TDEE：输入身体数据与活动量，获取每日消耗\n2. 查询热量：输入食物名称，添加至今日清单，统计总摄入',
    route: '/tools/calorie-calculator',
    isLocal: true,
    tags: ['卡路里', '热量', '减肥', '健身', 'TDEE', '食物']
  },
  {
    id: 'random-number-generator',
    name: '随机数生成器',
    category: 'fun',
    icon: 'More',
    summary: '自定义范围生成随机数字',
    description: '支持自定义数值范围（最小值/最大值）和生成数量。可选择是否去重、是否自动排序。适用于抽奖、分组、数学练习等场景。',
    usage: '1. 设置数值范围（如 1-100）\n2. 输入生成数量\n3. 勾选"不重复"或"排序"（可选）\n4. 点击生成并复制结果',
    route: '/tools/random-number-generator',
    isLocal: true,
    tags: ['随机数', '抽奖', '生成', '工具', '数学']
  },
  {
    id: 'ai-draw-guess',
    name: 'AI 你画我猜',
    category: 'fun',
    isAi: true,
    icon: 'EditPen',
    summary: '基于多模态大模型的绘画识别系统',
    description: '在画布上尽情创作，通过硅基流动 API 调用最新的多模态大模型（如 Qwen-VL）实时猜测您的艺术作品内容。支持自定义 API 配置，纯前端运行。',
    usage: '1. 在“设置”中配置您的 API Key\n2. 在左侧画布进行绘画\n3. 点击“让 AI 猜一猜”\n4. 查看 AI 的奇妙猜测结果',
    route: '/tools/ai-draw-guess',
    isLocal: true,
    tags: ['AI', '绘图', '视觉识别', '趣味', '多模态']
  },
  {
    id: 'pinyin-tool',
    name: '拼音查询器',
    category: 'edu',
    icon: 'EditPen',
    summary: '汉字转拼音与语音标注助手',
    description: '支持将汉字转换为完整拼音。提供多种声调标注模式（符号/数字/无声调）以及“对照模式”，可为朗诵文案进行逐字注音。',
    usage: '1. 输入或粘贴汉字文本\n2. 选择声调格式和展示模式\n3. 复制结果或查看拼音对照',
    route: '/tools/pinyin',
    isLocal: true,
    tags: ['拼音', '汉字', '注音', '转拼音', '语文', '朗诵']
  },
  {
    id: 'mind-map',
    name: '思维导图生成',
    category: 'design',
    icon: 'Connection',
    summary: '文本大纲一键转思维导图',
    description: '通过 Markdown 大纲语法（# 标题，- 列表）快速自动生成精美的思维导图。支持实时预览、缩放查看及 SVG 图片导出，助您快速梳理思路。',
    usage: '1. 在左侧输入或粘贴 Markdown 文本\n2. 右侧实时预览思维导图\n3. 可拖拽、缩放画布\n4. 点击导出按钮保存为 SVG',
    route: '/tools/mind-map',
    isLocal: true,
    tags: ['思维导图', 'MindMap', '大纲', '结构', 'Markdown', '可视化']
  },
  {
    id: 'formula-editor',
    name: '公式编辑器',
    category: 'edu',


    icon: 'Edit',
    summary: '可视化数学公式编辑与导出',
    description: '所见即所得的数学公式编辑器。支持数学、物理、化学公式的可视化输入，自动生成标准 LaTeX 代码，支持导出高清公式图片，适配文档与课件制作。',
    usage: '1. 在编辑器中点击输入或使用下方快捷符号\n2. 实时生成 LaTeX 代码与预览图\n3. 点击“复制”获取代码，或“导出图片”保存结果',
    route: '/tools/formula-editor',
    isLocal: true,
    tags: ['公式', '数学', 'LaTeX', '物理', '化学', '编辑器']
  },
  {
    id: 'utility-bill',
    name: '电费/水费计算',
    category: 'finance',
    icon: 'Lightning',
    summary: '水电费用估算与阶梯计价计算',
    description: '支持单一电价与阶梯电价两种模式。输入用量可快速计算月度费用。支持自定义阶梯档位和价格，适合租房核算与家庭记账。',
    usage: '1. 选择电费或水费模式\n2. 输入月度用量\n3. 选择计价模式（单一/阶梯）并设置价格\n4. 查看预估费用及明细',
    route: '/tools/utility-bill',
    isLocal: true,
    tags: ['电费', '水费', '阶梯电价', '生活', '计算器']
  },
  {
    id: 'compound-interest',
    name: '投资复利计算器',
    category: 'finance',
    icon: 'TrendCharts',
    summary: '财富增长复利估算',
    description: '专业的财富增值计算工具。支持初始本金、定期加仓（月/年）、预期收益率的多维度复利模拟，直观展示资产随时间增长的曲线与明细。',
    usage: '1. 输入初始本金与预期年收益率\n2. 设置定投频率与金额\n3. 设定投资年限并查看资产增长表',
    route: '/tools/compound-interest',
    isLocal: true,
    tags: ['复利', '投资', '理财', '理财计算', '财富增长']
  },
  {
    id: 'pension-estimator',
    name: '养老金估算器',
    category: 'finance',
    icon: 'UserFilled',
    summary: '退休养老金收入预测',
    description: '基于中国现行社保计算模型（基础养老金+个人账户养老金）。结合个人工资、缴费年限、社会平均工资等因素，科学预测退休后的月领金额。',
    usage: '1. 输入当前年龄、薪资及已缴费年限\n2. 设置预想退休年龄与当地社平工资\n3. 查看每月的预估领取金额与替代率分析',
    route: '/tools/pension-estimator',
    isLocal: true,
    tags: ['养老金', '退休', '社保', '五险一金', '财务规划']
  },
  {
    id: 'interest-rates',
    name: '利率查询与对比',
    category: 'finance',
    icon: 'DataLine',
    summary: '银行存款与 LPR 利率聚合查询',
    description: '聚合国内外主流银行定期存款利率、大额存单利率及 LPR 实时基准。支持多行利率横向对比，快速测算不同期限、不同银行的利息差异。',
    usage: '1. 输入预存本金并选择期限\n2. 切换“定期存款”或“大额存单”查看列表\n3. 系统自动算出各行预计利息总额',
    route: '/tools/interest-rates',
    isLocal: true,
    tags: ['利率', '存款', 'LPR', '大额存单', '银行', '比较']
  },
  {
    id: 'profit-loss-calculator',
    name: '盈亏分摊计算器',
    category: 'finance',
    icon: 'TrendCharts',
    summary: '持仓成本平摊与损益分析',
    description: '专门为股票、基金、虚拟货币投资者设计的成本测算工具。支持补仓/减仓后的平均成本重算，自动扣除交易手续费，并提供盈亏平衡点（保本价）及目标涨幅价格预演。',
    usage: '1. 输入当前持仓数量与成本\n2. 录入拟操作的数量、价格及费率\n3. 查看实时平摊后的成本变化及目标价预警',
    route: '/tools/profit-loss-calculator',
    isLocal: true,
    tags: ['成本计算', '补仓', '盈亏', '股票', '基金', '理财', '补仓计算']
  },
  {
    id: 'volume-weight',
    name: '快递体积重计算',
    category: 'life',
    icon: 'Box',
    summary: '体积重量与计费重量计算',
    description: '快速就算快递包裹的体积重量。支持自定义抛比系数（6000/5000/8000），自动对比实际重量，判断计费重量与是否为抛货，寄件发货必备。',
    usage: '1. 输入包裹长、宽、高 (cm)\n2. 输入实际重量 (kg)\n3. 选择抛比系数（默认 6000）\n4. 查看体积重与计费重量',
    route: '/tools/volume-weight',
    isLocal: true,
    tags: ['快递', '体积重', '抛货', '物流', '计费']
  },
  {
    id: 'screen-ruler',
    name: '屏幕尺寸测量',
    category: 'design',
    icon: 'FullScreen',
    summary: '屏幕像素标尺与测量工具',
    description: '提供可视化的水平和垂直像素标尺。支持拖拽测量，实时显示坐标像素值。适合前端工程师和 UI 设计师快速校对页面元素位置与尺寸。',
    usage: '1. 点击添加水平或垂直标尺\n2. 拖动标尺线至目标位置\n3. 查看实时像素坐标\n4. 双击标尺可旋转方向',
    route: '/tools/screen-ruler',
    isLocal: true,
    tags: ['标尺', '像素', '测量', '前端', '设计', 'UI']
  },
  {
    id: 'name-stroke',
    name: '名字笔画计算',
    category: 'edu',
    icon: 'Edit',
    summary: '姓名笔画数查询与计算',
    description: '输入姓名自动拆解并计算每个汉字的笔画数及总笔画。支持简体和繁体字输入，适用于学生作业自查、姓名民俗研究等场景。',
    usage: '1. 输入中文姓名\n2. 自动显示每个字的笔画\n3. 查看总笔画数统计',
    route: '/tools/name-stroke',
    isLocal: true,
    tags: ['笔画', '姓名', '汉字', '计算器', '语文']
  },
  {
    id: 'blood-type',
    name: '血型遗传计算',
    category: 'fun',
    icon: 'FirstAidKit',
    summary: '父母血型推算子女可能血型',
    description: '输入父亲和母亲的血型（ABO系统），基于遗传学规律推算子女可能出现的血型以及不可能出现的血型。科普向趣味工具。',
    usage: '1. 选择父亲的血型\n2. 选择母亲的血型\n3. 查看推算结果',
    route: '/tools/blood-type',
    isLocal: true,
    tags: ['血型', '遗传', '生物', '科普', '父母']
  },
  {
    id: 'weather-guide',
    name: '天气生活指南',
    category: 'life',
    icon: 'Sunny',
    summary: '天气查询与生活指数建议',
    description: '查询全球城市天气，并生成穿衣、出行、运动等生活指南关键词。数据支持由 Open-Meteo 提供。',
    usage: '1. 输入城市名称（支持中文城市名，如"Beijing"或"北京"）\n2. 点击查询\n3. 查看实时天气及生活建议',
    route: '/tools/weather-guide',
    isLocal: false,
    tags: ['天气', '生活', '穿衣', '运动', '查询', 'API']
  },
  {
    id: 'text-line-break',
    name: '文案分行整理',
    category: 'text',
    icon: 'Memo',
    summary: '长文本自动分行排版',
    description: '适配朋友圈、小红书、短视频文案排版。支持智能语义分行、自定义字数截断，一键生成居中诗意排版。',
    usage: '1. 粘贴长文本\n2. 调节每行字数与分行模式\n3. 预览并复制结果',
    route: '/tools/text-line-break',
    isLocal: true,
    tags: ['排版', '文案', '换行', '歌词', '编辑']
  },
  {
    id: 'plug-standard',
    name: '各国插座查询',
    category: 'life',
    icon: 'Place',
    summary: '出国旅行插座与电压查询',
    description: '查询全球主要国家和地区的电源插座类型、电压标准及频率。提供可视化插座图鉴，帮助您准备旅行转换插头。',
    usage: '1. 搜索国家名称（如"日本"、"英国"）\n2. 查看该国的电压、频率及插座类型\n3. 对照图鉴确认转换头',
    route: '/tools/plug-standard',
    isLocal: true,
    tags: ['旅行', '插座', '电压', '出国', '转换头']
  },
  {
    id: 'ip-location',
    name: 'IP 属地查询',
    category: 'dev',
    icon: 'LocationInformation',
    summary: 'IP 地址归属地与运营商查询',
    description: '查询 IP 地址的地理位置（国家、城市）、运营商 (ISP)、经纬度及时区信息。支持查询本机 IP。纯前端实现，无需服务器中转。',
    usage: '1. 输入 IP 地址（或直接点击查询本机）\n2. 查看解析结果\n3. 点击坐标可跳转地图',
    route: '/tools/ip-location',
    isLocal: false,
    tags: ['IP', '定位', '网络', '查询', 'ISP']
  },
  {
    id: 'encoding-tool',
    name: '编码格式查看',
    category: 'dev',
    icon: 'DocumentCopy',
    summary: 'UTF-8/GBK 字节分析',
    description: '实时分析文本在 UTF-8 和 GBK 编码下的字节长度，并展示 16 进制字节码，帮助排查乱码问题。',
    usage: '输入文本即可查看编码分析结果。',
    route: '/tools/encoding',
    isLocal: true,
    tags: ['编码', '乱码', 'UTF-8', 'GBK', '开发']
  },
  {
    id: 'port-tool',
    name: '端口号查询',
    category: 'dev',
    icon: 'Connection',
    summary: '常用端口默认服务查询',
    description: '查询端口号对应的默认服务（HTTP, MySQL, SSH 等），提供常见端口列表参考。',
    usage: '输入端口号查询，或点击分类标签。',
    route: '/tools/port',
    isLocal: true,
    tags: ['端口', '网络', '运维', '开发']
  },
  {
    id: 'url-encoder',
    name: 'URL 编解码',
    category: 'dev',
    icon: 'Link',
    summary: 'URL Encode / Decode',
    description: '对 URL 进行编码和解码处理 (encodeURIComponent)，处理链接参数中的特殊字符。',
    usage: '输入文本点击编码或解码。',
    route: '/tools/url-encoder',
    isLocal: true,
    tags: ['URL', '编码', '解码', '网络', '开发']
  },
  {
    id: 'html-entity',
    name: 'HTML 转义',
    category: 'dev',
    icon: 'Reading',
    summary: 'HTML 实体字符转换',
    description: '特殊字符与 HTML 实体互转 (如 < 转 &lt;)，包含常用实体对照表。',
    usage: '输入 HTML 代码进行转义或与还原。',
    route: '/tools/html-entity',
    isLocal: true,
    tags: ['HTML', '转义', '前端', 'Web', '开发']
  },
  {
    id: 'screen-size',
    name: '屏幕分辨率',
    category: 'design',
    icon: 'Monitor',
    summary: '常见设备分辨率与倍率',
    description: '收录常见手机、平板、电脑的逻辑分辨率、物理分辨率和 PPI 数据，辅助 UI 设计与适配。',
    usage: '搜索设备名称或切换分类查看。',
    route: '/tools/screen-size',
    isLocal: true,
    tags: ['屏幕', '分辨率', 'UI', '适配', '前端']
  },
  {
    id: 'list-to-table',
    name: '列表转表格',
    category: 'text',
    icon: 'Grid',
    summary: '文本转 HTML/Markdown 表格',
    description: '将分行粘贴的文本一键转换为 Markdown 表格或 HTML 表格代码，支持自动识别分隔符。',
    usage: '粘贴文本，选择分隔符，转换预览或复制。',
    route: '/tools/list-to-table',
    isLocal: true,
    tags: ['表格', 'Markdown', 'HTML', '转换', '文档']
  },
  {
    id: 'emoji-picker',
    name: 'Emoji 表情检索',
    category: 'fun',
    icon: 'Sugar',
    summary: '分类 Emoji 复制',
    description: '提供按心情、节日、食物、动物等分类的 Emoji 表情面板，点击即可复制。',
    usage: '选择分类，点击表情。',
    route: '/tools/emoji-picker',
    isLocal: true,
    tags: ['Emoji', '表情', '复制', '社交']
  },
  {
    id: 'special-text',
    name: '特殊文字生成',
    category: 'fun',
    icon: 'MagicStick',
    summary: '花体/空心/下划线生成',
    description: '生成花体英文 (Script)、空心字 (Hollow)、删除线、下划线等特殊样式文本，用于社交平台昵称或文案。',
    usage: '输入文本，选择样式，点击复制。',
    route: '/tools/special-text',
    isLocal: true,
    tags: ['花体字', '特殊字体', '昵称', '生成器']
  },
  {
    id: 'tone-converter',
    name: '语气句式转换',
    category: 'text',
    icon: 'ChatDotRound',
    summary: '疑问/委婉/正式语气转换',
    description: '将句子转换为疑问句、委婉语气、正式书面语或客服体，辅助文案修改。',
    usage: '输入句子，选择目标语气。',
    route: '/tools/tone-converter',
    isLocal: true,
    tags: ['语气', '文案', '沟通', '转换']
  },
  {
    id: 'keyword-extractor',
    name: '标题关键词提取',
    category: 'text',
    icon: 'Crop',
    summary: '高频核心词提取',
    description: '分析长文本，自动提取出现频率最高的核心关键词 (Top 20)，辅助标题拟定或标签生成。',
    usage: '粘贴文章，点击提取。',
    route: '/tools/keyword-extractor',
    isLocal: true,
    tags: ['关键词', '提取', 'SEO', '摘要']
  },





























  {
    id: 'rhyme-finder',
    name: '押韵词查询器',
    category: 'text',
    icon: 'Microphone',
    summary: '汉字同韵脚词语查询',
    description: '输入汉字，查询同韵脚字词，写段子、口号、短句、小诗辅助。支持识别音调与韵母。',
    usage: '输入汉字，点击查询即可看到按声调分类的同韵字。',
    route: '/tools/rhyme',
    isLocal: true,
    tags: ['押韵', '文案', '创作', '诗词']
  },
  {
    id: 'word-decomposition',
    name: '拆字组词工具',
    category: 'edu',
    icon: 'Memo',
    summary: '偏旁、结构与常用组词查询',
    description: '输入汉字，展示偏旁、结构、常用组词，学生识字、文案创作。',
    usage: '输入汉字即可实时查看该字的详细解析。',
    route: '/tools/word-decomp',
    isLocal: true,
    tags: ['汉字', '拆字', '组词', '语文', '教育']
  },
  {
    id: 'sentence-stats',
    name: '句子长度统计器',
    category: 'text',
    icon: 'DataAnalysis',
    summary: '段落句长分布统计',
    description: '统计每句字数、平均句长，优化文案可读性，作文、自媒体文案调整。',
    usage: '粘贴段落，系统自动识别标点并生成句长统计报告。',
    route: '/tools/sentence-stats',
    isLocal: true,
    tags: ['文案', '排版', '写作', '统计', '分析']
  },
  {
    id: 'fraction-solver',
    name: '分数约分通分器',
    category: 'edu',
    icon: 'Opportunity',
    summary: '分数简化与加减乘除计算',
    description: '输入分子分母，自动约分、最简分数、带分数转换，支持分数加减乘除。',
    usage: '1. 切换模式 2. 输入分数值 3. 执行计算/转换。',
    route: '/tools/fraction-calculator',
    isLocal: true,
    tags: ['分数', '数学', '约分', '计算', '教育']
  },
  {
    id: 'proportion-solver',
    name: '比例求解计算器',
    category: 'edu',
    icon: 'Coordinate',
    summary: '已知三项求第四项',
    description: '已知三项求第四项，解决应用题、配比、比例尺计算。',
    usage: '在 A:B=C:D 中填入任意三个已知项，第四项填 x 或留空，点击求解。',
    route: '/tools/proportion-solver',
    isLocal: true,
    tags: ['比例', '数学', '计算', '教育', '比例尺']
  },
  {
    id: 'schedule',
    name: '课程表管理',
    category: 'life',
    icon: 'Calendar',
    summary: '支持自动识别的个人课程表',
    description: '一款专为大学生设计的个人课程表工具。支持手动添加、文本识别导入、JSON数据迁移以及自动周次计算功能，跨端体验友好。',
    usage: '1. 设置开学日期 2. 手动添加或粘贴文案解析课程 3. 自动同步当前周次课程显示',
    route: '/tools/schedule',
    isLocal: true,
    tags: ['课程表', '学习', '计划', '大学生', '日程']
  },
  {
    id: 'timer-tool',
    name: '高级计时系统',
    category: 'life',
    icon: 'Timer',
    summary: '多功能倒计时与正计时工具',
    description: '集成了倒计时、正计时（秒表）、目标时间倒计时功能。支持快速预设、自定义时间、计次记录、声音提醒及浏览器通知。',
    usage: '1. 选择倒计时或正计时模式\n2. 点击预设或自定义时间开始\n3. 正计时支持计次功能',
    route: '/tools/timer',
    isLocal: true,
    tags: ['计时器', '倒计时', '秒表', '时间管理', '提醒']
  },
  {
    id: 'water-intake',
    name: '饮水记录系统',
    category: 'health',
    icon: 'Coffee',
    summary: '每日补水计划与实时进度管理',
    description: '根据您的体重与活动水平计算建议饮水量，支持实时点击记录喝水进度，提供每日水量阶梯视图，并支持桌面提醒，助您养成健康饮水习惯。',
    usage: '1. 点击设置输入基础身体数据\n2. 点击"饮水"按钮快速记录\n3. 查看今日进度百分比及喝水历史',
    route: '/tools/water-intake',
    isLocal: true,
    tags: ['饮水', '习惯', '健康', '提醒']
  },
  {
    id: 'vision-test',
    name: '视力自我监测',
    category: 'health',
    icon: 'View',
    summary: '色盲测试与护眼专注工具',
    description: '提供标准的色敏度测试图、散光自测图以及基于 20-20-20 法则的护眼专注计时器（工作20分钟，远眺20秒，看20英尺外），科学保护您的视力。',
    usage: '1. 选择测试类型（色盲/散光等）\n2. 按照屏幕提示保持距离进行测试\n3. 开启护眼计时器开始专注工作',
    route: '/tools/vision-test',
    isLocal: true,
    tags: ['视力', '色盲', '护眼', '测试', '健康']
  },
  {
    id: 'pregnancy-due',
    name: '预产期计算器',
    category: 'health',
    icon: 'User',
    summary: '预产期推算与孕期发育参考',
    description: '根据末次月经日期计算预产期；按周提供胎儿发育百科知识、妈妈身体变化参考及重要产检时间提醒。',
    usage: '1. 输入末次月经日期\n2. 点击计算获取预产期及当前孕周\n3. 浏览每周发育详情和产检计划',
    route: '/tools/pregnancy-due',
    isLocal: true,
    tags: ['孕期', '预产期', '母婴', '健康', '计算器']
  },
  {
    id: 'healthy-diet',
    name: '健康饮食建议',
    category: 'health',
    icon: 'Bowl',
    summary: '目标导向的营养配餐建议',
    description: '根据您的减脂、增肌或维持体重目标，自动生成每日碳水、蛋白质、脂肪的建议摄入比例及三餐热量分配模型。',
    usage: '1. 输入基本身体信息和活动强度\n2. 选择您的目标（减脂/增肌等）\n3. 获取结构化的营养建议和食谱模型',
    route: '/tools/healthy-diet',
    isLocal: true,
    tags: ['饮食', '营养', '减肥', '健身', '食谱', '计算器']
  },
  {
    id: 'bmr-advanced',
    name: 'BMR 高阶版计算',
    category: 'health',
    icon: 'Histogram',
    summary: '多公式多维度的能量代谢评估',
    description: '对比 Mifflin-St Jeor 与 Katch-McArdle 等国际权威公式，更精确地评估您的基础代谢率（BMR）与总消耗（TDEE），并分析体脂率对代谢的影响。',
    usage: '1. 输入身高、体重、年龄、体脂率（可选）\n2. 查看不同算法得出的多组 BMR 结果\n3. 获取详细的能量缺口建议',
    route: '/tools/bmr-advanced',
    isLocal: true,
    tags: ['BMR', '代谢', 'TDEE', '健身', '热量', '计算器']
  },
  {
    id: 'chinese-poetry',
    name: '诗词检索与赏析',
    category: 'edu',
    icon: 'Notebook',
    summary: '聚合名篇与名句赏析卡片',
    description: '聚合唐诗、宋词、元曲经典数据库；支持按主题、作者关键词搜索，并提供古风样式的名句分享卡片生成。',
    usage: '1. 输入关键词搜索诗词\n2. 点击某首诗进入详情赏析\n3. 切换纵向排版或生成名句分享图',
    route: '/tools/chinese-poetry',
    isLocal: true,
    tags: ['诗词', '文学', '文化', '教育', '古诗', '诗']
  },
  {
    id: 'chinese-dictionary',
    name: '成语助手',
    category: 'edu',
    icon: 'Reading',
    summary: '词义查询与趣味成语挑战',
    description: '提供成语释义、近反义词查询，并内置互动式成语接龙游戏，寓教于乐。',
    usage: '1. 进入"成语接龙"输入词语开始挑战\n2. 切换到"词义查询"搜索特定成语',
    route: '/tools/chinese-dictionary',
    isLocal: true,
    tags: ['词典', '成语', '汉语', '文化']
  },
  {
    id: 'copybook-generator',
    name: '电子字帖生成器',
    category: 'edu',
    icon: 'EditPen',
    summary: '自定义田字格/米字格字帖',
    description: '自定义练习文字，一键生成标准田字格、米字格或方格电子字帖，支持设置临摹透明度并导出为高清图片或直接打印。',
    usage: '1. 输入想要练习的内容\n2. 面板设置格线类型与颜色\n3. 导出 PNG 或进行打印预览',
    route: '/tools/copybook-generator',
    isLocal: true,
    tags: ['字帖', '书法', '临摹', '练字']
  },
  {
    id: 'periodic-table',
    name: '化学元素周期表',
    category: 'edu',
    icon: 'Grid',
    summary: '交互式响应式周期表',
    description: '专业的交互式元素周期表，提供元素分类高亮、详细原子属性（如电子排布、原子量、发现史）等科普知识。',
    usage: '1. 悬停上方图例高亮同类元素\n2. 点击元素单元格查看详细背景知识',
    route: '/tools/periodic-table',
    isLocal: true,
    tags: ['化学', '元素', '科学', '百科']
  },
  {
    id: 'cheat-sheet',
    name: '学科知识速查表',
    category: 'dev',
    icon: 'Collection',
    summary: '开发与学科知识快捷指南',
    description: '集合 Git 命令、Linux 指令、CSS 布局及常用数学常数等速查指南，支持一键点击复制。',
    usage: '1. 在左侧选择对应学科\n2. 搜索或浏览需要的知识点\n3. 点击指令区块自动复制到剪贴板',
    route: '/tools/cheat-sheet',
    isLocal: true,
    tags: ['速查', '学习', 'Git', 'CSS', 'Linux']
  },
  {
    id: 'lucky-draw',
    name: '抽奖大转盘',
    category: 'fun',
    icon: 'MagicStick',
    summary: '自定义抽奖项与概率模拟',
    description: '专业的抽奖工具，支持自定义奖项名称、权重配置、概率实时预览及抽奖记录功能。',
    usage: '1. 点击"添加奖项"设置选项内容\n2. 调整各奖项的权重（概率）\n3. 点击转盘中央"开始"按钮即可抽奖',
    route: '/tools/lucky-draw',
    isLocal: true,
    tags: ['抽奖', '大转盘', '概率', '游戏', '活动']
  },
  {
    id: 'social-mockup',
    name: '社交媒体模拟',
    category: 'fun',
    icon: 'Monitor',
    summary: '模拟朋友圈等社交媒体截图',
    description: '创意排版工具，模拟微信朋友圈、微博等社交平台的发布内容，支持头像上传、图片网格预览。',
    usage: '1. 上传头像并填写用户名\n2. 输入文字内容并选择配图\n3. 调整点赞列表及时间位置\n4. 生成截图并导出分享',
    route: '/tools/social-mockup',
    isLocal: true,
    tags: ['模拟', '截图', '朋友圈', '微信', '设计', '模版']
  },
  {
    id: 'pixel-art',
    name: '像素画编辑器',
    category: 'fun',
    icon: 'Brush',
    summary: '8bit 风格网格绘图工具',
    description: '支持多种网格规格的像素风格绘画工具，内置经典调色盘，支持透明背景导出。',
    usage: '1. 选择画布大小（8x8 到 64x64）\n2. 在调色盘选择颜色并绘画\n3. 开启/关闭网格辅助线\n4. 导出高清 PNG 图片',
    route: '/tools/pixel-art',
    isLocal: true,
    tags: ['像素画', '设计', '绘图', '8-bit', '图标']
  },
  {
    id: 'quote-generator',
    name: '语录生成器',
    category: 'fun',
    icon: 'EditPen',
    summary: '聚合电影、诗词、程序员经典语录',
    description: '精选各领域名言警句，支持多种语体切换，提供优雅的背景样式和排版预览。',
    usage: '1. 选择语录分类切换内容\n2. 点击"换一句"随机刷新\n3. 调整字号与背景色\n4. 一键复制或保存语录文字',
    route: '/tools/quote-generator',
    isLocal: true,
    tags: ['语录', '文案', '句子', '励志', '名人名言']
  },
  {
    id: 'world-timeline',
    name: '世界时间线',
    category: 'fun',
    icon: 'Watch',
    summary: '全球城市实时时间与活动预览',
    description: '可视化展示全球主要时区的时间差，并提供"人类活动建议"图标，直观了解世界各地的生活节奏。',
    usage: '1. 快速查看不同城市的当前本地时间\n2. 通过状态图标查看当地处于什么活动阶段\n3. 支持 12/24 小时制同步更新',
    route: '/tools/world-timeline',
    isLocal: true,
    tags: ['时间', '时区', '世界钟', '工具']
  },


  {
    id: 'pdf-to-image',
    name: 'PDF 转图片',
    category: 'pdf',
    icon: 'Picture',
    summary: '将 PDF 每页转换为 JPG/PNG 图片',
    description: '支持将 PDF 文件的每一页转换为高清图片。可选择 PNG、JPG、WebP 格式，支持自定义缩放比例和质量，方便分享和预览。',
    usage: '1. 上传 PDF 文件\n2. 选择输出格式和质量\n3. 勾选需要导出的页面\n4. 点击下载',
    route: '/tools/pdf-to-image',
    isLocal: true,
    tags: ['PDF', '图片', '转换', 'PNG', 'JPG']
  },
  {
    id: 'image-to-pdf',
    name: '图片转 PDF',
    category: 'pdf',
    icon: 'Document',
    summary: '将多张图片合并为一个 PDF 文档',
    description: '支持将多张图片批量合并为 PDF 文件。可选择页面尺寸（A4/A3/Letter/自适应）、页面方向，支持拖拽排序。',
    usage: '1. 上传多张图片\n2. 拖拽调整顺序\n3. 设置页面参数\n4. 生成并下载 PDF',
    route: '/tools/image-to-pdf',
    isLocal: true,
    tags: ['图片', 'PDF', '合并', '转换', '文档']
  },
  {
    id: 'pdf-split-merge',
    name: 'PDF 拆分与合并',
    category: 'pdf',
    icon: 'Scissor',
    summary: '提取 PDF 指定页面或合并多个 PDF',
    description: '功能强大的 PDF 操作工具。支持按页面范围提取、逐页拆分，以及将多个 PDF 文件合并为一个文档。',
    usage: '拆分：上传 PDF → 选择页面范围 → 提取\n合并：上传多个 PDF → 调整顺序 → 合并下载',
    route: '/tools/pdf-split-merge',
    isLocal: true,
    tags: ['PDF', '拆分', '合并', '提取', '页面']
  },
  {
    id: 'pdf-watermark',
    name: 'PDF 水印',
    category: 'pdf',
    icon: 'MagicStick',
    summary: '在 PDF 上添加文字或图片水印',
    description: '为 PDF 文件添加自定义水印。支持文字水印和图片水印，可设置透明度、旋转角度、位置（单点/平铺），保护文档版权。',
    usage: '1. 上传 PDF 文件\n2. 选择文字或图片水印\n3. 调整水印参数\n4. 下载带水印的 PDF',
    route: '/tools/pdf-watermark',
    isLocal: true,
    tags: ['PDF', '水印', '版权', '保护', '文字']
  },
  {
    id: 'subnet-calculator',
    name: 'IP 子网计算器',
    category: 'dev',
    icon: 'Connection',
    summary: '计算 CIDR、子网掩码、可用 IP 范围',
    description: '专业的 IP 子网掩码计算工具。支持计算网络地址、广播地址、可用主机范围、子网掩码转换、CIDR 表示法，帮助网络规划和故障排查。',
    usage: '1. 输入 IP 地址\n2. 选择 CIDR 前缀长度\n3. 自动计算子网信息',
    route: '/tools/subnet-calculator',
    isLocal: true,
    tags: ['IP', '子网', 'CIDR', '网络', '掩码']
  },
  {
    id: 'ua-parser',
    name: 'UA 分析器',
    category: 'dev',
    icon: 'Search',
    summary: '解析浏览器 User Agent 字符串',
    description: '解析 User Agent 字符串，识别浏览器类型、版本、操作系统、设备类型、渲染引擎等信息。支持常见浏览器和移动设备识别。',
    usage: '1. 粘贴 UA 字符串或获取当前浏览器 UA\n2. 自动解析并展示详细信息',
    route: '/tools/ua-parser',
    isLocal: true,
    tags: ['UA', 'User Agent', '浏览器', '设备', '解析']
  },
  {
    id: 'my-network',
    name: '本地网络信息',
    category: 'dev',
    icon: 'Monitor',
    summary: '查看公网 IP、屏幕分辨率、浏览器信息',
    description: '一站式查看本机网络和设备信息。包括公网 IP 及地理位置、屏幕分辨率、浏览器信息、网络连接状态、电池状态等。',
    usage: '打开工具即可自动获取并显示所有信息',
    route: '/tools/my-network',
    isLocal: true,
    tags: ['IP', '网络', '屏幕', '设备', '信息']
  },
  {
    id: 'xml-formatter',
    name: 'XML 格式化',
    category: 'dev',
    icon: 'Document',
    summary: 'XML 美化、压缩，XML 与 JSON 互转',
    description: '强大的 XML 处理工具。支持 XML 格式化美化、压缩混淆、语法校验，以及 XML 与 JSON 格式互相转换。',
    usage: '1. 粘贴 XML 内容\n2. 点击格式化或压缩\n3. 或使用互转功能',
    route: '/tools/xml-formatter',
    isLocal: true,
    tags: ['XML', '格式化', 'JSON', '转换', '压缩']
  },
  {
    id: 'yaml-converter',
    name: 'YAML 转换器',
    category: 'dev',
    icon: 'Switch',
    summary: 'YAML 与 JSON/Properties 互转',
    description: '配置文件格式转换工具。支持 YAML、JSON、Properties 三种格式互相转换，方便不同项目配置文件的迁移。',
    usage: '1. 选择输入格式并粘贴内容\n2. 选择输出格式\n3. 点击转换',
    route: '/tools/yaml-converter',
    isLocal: true,
    tags: ['YAML', 'JSON', 'Properties', '转换', '配置']
  },
  {
    id: 'favicon-generator',
    name: 'Favicon 生成器',
    category: 'design',
    icon: 'Picture',
    summary: '一键生成网站图标多种尺寸',
    description: '网站图标生成工具。上传一张图片，自动生成 favicon.ico、apple-touch-icon、android-chrome 等多种尺寸的网站图标。',
    usage: '1. 上传正方形图片\n2. 选择需要的尺寸\n3. 点击生成并下载',
    route: '/tools/favicon-generator',
    isLocal: true,
    tags: ['Favicon', '图标', '网站', 'ICO', 'PNG']
  },
  {
    id: 'floating-note',
    name: '悬浮记事本',
    category: 'text',
    icon: 'EditPen',
    summary: '悬浮窗置顶速记，自动保存',
    description: '便捷的快速记事工具。支持打开悬浮窗置顶显示，内容自动保存到本地，随时记录灵感和临时信息。',
    usage: '1. 在主界面直接输入内容\n2. 或点击"打开悬浮窗"获得置顶小窗口',
    route: '/tools/floating-note',
    isLocal: true,
    tags: ['记事本', '便签', '悬浮窗', '速记', '笔记']
  },
  {
    id: 'image-palette',
    name: '图片色卡提取',
    category: 'image',
    icon: 'Brush',
    summary: '自动提取图片主色调生成色卡',
    description: '图片配色分析工具。上传图片即可智能提取能够代表图片风格的 8 种主要颜色，生成色卡并支持一键复制颜色代码。',
    usage: '1. 上传图片\n2. 自动提取颜色展示\n3. 点击色块复制色值',
    route: '/tools/image-palette',
    isLocal: true,
    tags: ['图片', '颜色', '配色', '色卡', '提取']
  },
  {
    id: 'gif-maker',
    name: 'GIF 制作器',
    category: 'image',
    icon: 'VideoPlay',
    summary: '多图合成 GIF 动图，调节帧率',
    description: '在线 GIF 制作工具。支持将多张静态图片合成为 GIF 动图，可自定义图片顺序、帧间隔时间和画面尺寸。',
    usage: '1. 上传多张图片\n2. 调整顺序和参数\n3. 点击生成并下载',
    route: '/tools/gif-maker',
    isLocal: true,
    tags: ['GIF', '动图', '合成', '制作', '动画']
  },
  {
    id: 'pomodoro',
    name: '番茄钟',
    category: 'health',
    icon: 'Timer',
    summary: '极简番茄工作法计时器',
    description: '助你保持专注的番茄钟工具。默认支持 25 分钟专注 + 5 分钟休息的工作流，提供清新的 UI 和自动统计功能。',
    usage: '1. 选择专注模式\n2. 点击开始\n3. 完成后休息',
    route: '/tools/pomodoro',
    isLocal: true,
    tags: ['番茄钟', '专注', '计时', '效率', '工作法']
  },
  {
    id: 'typing-test',
    name: '打字速度测试',
    category: 'edu',
    icon: 'Edit',
    summary: '测试打字速度(WPM)和准确率',
    description: '在线打字练习工具。支持英文单词和代码片段两种模式，实时统计 WPM (每分钟单词数) 和准确率，助你提升键盘输入效率。',
    usage: '1. 选择模式和时间\n2. 将光标聚焦输入框\n3. 开始盲打练习',
    route: '/tools/typing-test',
    isLocal: true,
    tags: ['打字', 'WPM', '练习', '测试', '键盘', '代码']
  },
  {
    id: 'metronome',
    name: '节拍器',
    category: 'health',
    icon: 'Headset',
    summary: '精准稳定的在线节拍器',
    description: '音乐练习必备的节拍器工具。提供精准的 BPM 设置、多种拍号选择和可视化节拍显示，支持重音提示。',
    usage: '1. 设定 BPM 和拍号\n2. 点击播放\n3. 跟随节拍练习',
    route: '/tools/metronome',
    isLocal: true,
    tags: ['节拍器', '音乐', 'BPM', '节奏', '乐器']
  },
  {
    id: 'pdf-compression',
    name: 'PDF 压缩',
    category: 'pdf',
    icon: 'Files',
    summary: 'PDF 文件压缩与优化',
    description: '专业的 PDF 压缩工具。支持无损结构优化（清理冗余数据）和强力图片压缩（适合扫描件）两种模式，有效减小文件体积。',
    usage: '1. 上传 PDF 文件\n2. 选择"无损优化"或"强力压缩"\n3. 点击开始并下载结果',
    route: '/tools/pdf-compression',
    isLocal: true,
    tags: ['PDF', '压缩', '瘦身', '优化', '减小体积']
  },
  {
    id: 'pdf-rotation',
    name: 'PDF 页面旋转',
    category: 'pdf',
    icon: 'RefreshRight',
    summary: '旋转 PDF 页面方向',
    description: 'PDF 页面方向调整工具。支持预览所有页面，一键旋转全部页面或单独调整特定页面的方向（90°/180°）。',
    usage: '1. 上传 PDF 文件\n2. 点击工具栏批量旋转或单独旋转指定页\n3. 保存并下载',
    route: '/tools/pdf-rotation',
    isLocal: true,
    tags: ['PDF', '旋转', '方向', '调整', '页面']
  },
  {
    id: 'pdf-protection',
    name: 'PDF 密码保护',
    category: 'pdf',
    icon: 'Lock',
    summary: '加密 PDF 或移除密码',
    description: 'PDF 安全管理工具。支持为 PDF 设置打开密码和编辑/打印权限密码；也支持移除已知的 PDF 密码以便编辑。',
    usage: '1. 选择"加密保护"或"移除密码"\n2. 上传文件并输入密码\n3. 处理完成后下载',
    route: '/tools/pdf-protection',
    isLocal: true,
    tags: ['PDF', '密码', '加密', '解密', '安全', '保护']
  },
  {
    id: 'pdf-page-number',
    name: 'PDF 添加页码',
    category: 'pdf',
    icon: 'Notebook',
    summary: '给 PDF 添加自定义页码',
    description: 'PDF 页码添加工具。支持在页面的 6 个不同位置添加页码，自定义页码格式（如 "Page 1 of N"）、字体大小和起始页码。',
    usage: '1. 上传 PDF 文件\n2. 设置页码位置和格式\n3. 预览并下载',
    route: '/tools/pdf-page-number',
    isLocal: true,
    tags: ['PDF', '页码', '页脚', '页眉', '标记']
  },
  {
    id: 'pdf-page-organizer',
    name: 'PDF 页面组织',
    category: 'pdf',
    icon: 'Grid',
    summary: '拖拽重排、删除或插入空白页',
    description: 'PDF 页面管理工具。可视化界面拖拽 PDF 页面实现重新排序，支持删除不需要的页面或在任意位置插入空白页。',
    usage: '1. 上传 PDF 文件\n2. 拖拽页面卡片重排顺序\n3. 选中页面可删除，点击按钮可插入空白页\n4. 保存并下载',
    route: '/tools/pdf-page-organizer',
    isLocal: true,
    tags: ['PDF', '页面', '排序', '组织', '删除', '空白页']
  },
  {
    id: 'pdf-grayscale',
    name: 'PDF 灰度化',
    category: 'pdf',
    icon: 'Moon',
    summary: '彩色 PDF 转灰度或黑白',
    description: 'PDF 灰度转换工具。将彩色 PDF 转为灰度模式或纯黑白，适合打印节省耗材或满足档案存储要求。',
    usage: '1. 上传 PDF 文件\n2. 选择灰度或纯黑白模式\n3. 预览效果并下载',
    route: '/tools/pdf-grayscale',
    isLocal: true,
    tags: ['PDF', '灰度', '黑白', '打印', '转换']
  },
  {
    id: 'pdf-text-extractor',
    name: 'PDF 文本提取',
    category: 'pdf',
    icon: 'DocumentCopy',
    summary: '快速提取 PDF 纯文本内容',
    description: 'PDF 文本提取工具。快速提取 PDF 文档中的纯文本内容，支持复制到剪贴板或导出为 TXT 文件。',
    usage: '1. 上传 PDF 文件\n2. 点击提取文本\n3. 复制或下载文本内容',
    route: '/tools/pdf-text-extractor',
    isLocal: true,
    tags: ['PDF', '文本', '提取', 'OCR', '复制', 'TXT']
  },
  {
    id: 'pdf-signature',
    name: 'PDF 电子签名',
    category: 'pdf',
    icon: 'EditPen',
    summary: '手写或上传签名添加到 PDF',
    description: 'PDF 电子签名工具。支持手写绘制签名或上传签名图片，可拖放到 PDF 的任意位置，生成带签名的文档。',
    usage: '1. 上传 PDF 文件\n2. 手写或上传签名\n3. 点击 PDF 预览放置签名位置\n4. 保存并下载',
    route: '/tools/pdf-signature',
    isLocal: true,
    tags: ['PDF', '签名', '电子签名', '手写', '盖章']
  },
  {
    id: 'pdf-metadata',
    name: 'PDF 元数据编辑',
    category: 'pdf',
    icon: 'InfoFilled',
    summary: '修改 PDF 标题、作者等属性',
    description: 'PDF 元数据编辑工具。查看和修改 PDF 的标题、作者、主题、关键词、创建日期等属性信息。',
    usage: '1. 上传 PDF 文件\n2. 编辑需要修改的属性\n3. 保存并下载',
    route: '/tools/pdf-metadata',
    isLocal: true,
    tags: ['PDF', '元数据', '属性', '标题', '作者']
  },
  {
    id: 'pdf-crop',
    name: 'PDF 页面裁剪',
    category: 'pdf',
    icon: 'Crop',
    summary: '裁剪 PDF 页面多余白边',
    description: 'PDF 页面裁剪工具。通过设置边距参数裁剪 PDF 页面的多余白边，调整文档页边距。',
    usage: '1. 上传 PDF 文件\n2. 设置四边裁剪边距\n3. 选择应用范围\n4. 裁剪并下载',
    route: '/tools/pdf-crop',
    isLocal: true,
    tags: ['PDF', '裁剪', '白边', '页边距', '调整']
  },
  {
    id: 'pdf-overlay',
    name: 'PDF 叠加覆盖',
    category: 'pdf',
    icon: 'CopyDocument',
    summary: '叠加水印或印章图层',
    description: 'PDF 叠加覆盖工具。将一个 PDF 作为水印或印章叠加到另一个 PDF 之上，支持透明度和范围设置。',
    usage: '1. 选择基础 PDF\n2. 选择叠加 PDF（水印/印章）\n3. 设置叠加模式和范围\n4. 合并并下载',
    route: '/tools/pdf-overlay',
    isLocal: true,
    tags: ['PDF', '叠加', '水印', '印章', '覆盖']
  },
  {
    id: 'markdown-to-pdf',
    name: 'Markdown 转 PDF',
    category: 'pdf',
    icon: 'Document',
    summary: '将 Markdown 转为 PDF',
    description: 'Markdown/HTML 转 PDF 工具。将 Markdown 或 HTML 代码转换为排版精美的 PDF 文档。',
    usage: '1. 输入 Markdown 或 HTML 内容\n2. 实时预览效果\n3. 设置页面大小\n4. 生成 PDF',
    route: '/tools/markdown-to-pdf',
    isLocal: true,
    tags: ['Markdown', 'HTML', 'PDF', '转换', '文档']
  },
  {
    id: 'pdf-repair',
    name: 'PDF 损坏修复',
    category: 'pdf',
    icon: 'FirstAidKit',
    summary: '修复无法打开的 PDF',
    description: 'PDF 损坏修复工具。尝试修复无法正常打开的受损 PDF 文件，重建文档结构。',
    usage: '1. 上传损坏的 PDF\n2. 点击开始修复\n3. 查看修复日志\n4. 下载修复后的文件',
    route: '/tools/pdf-repair',
    isLocal: true,
    tags: ['PDF', '修复', '损坏', '恢复', '救援']
  },
  {
    id: 'pdf-scale',
    name: 'PDF 页面调整',
    category: 'pdf',
    icon: 'FullScreen',
    summary: '调整 PDF 页面尺寸',
    description: 'PDF 页面比例调整工具。在不改变内容的情况下，统一调整 PDF 的页面尺寸（如从 A3 调整到 A4）。',
    usage: '1. 上传 PDF 文件\n2. 选择目标尺寸（A4, A3等）\n3. 选择缩放模式（适应或填充）\n4. 调整并下载',
    route: '/tools/pdf-scale',
    isLocal: true,
    tags: ['PDF', '缩放', '尺寸', '调整', 'A4']
  },
  {
    id: 'pdf-attachment-extractor',
    name: 'PDF 附件提取',
    category: 'pdf',
    icon: 'Paperclip',
    summary: '提取 PDF 内嵌附件',
    description: 'PDF 附件提取工具。检测并提取嵌套在 PDF 内部的各种文件附件（如 Excel 表格、XML 等数据文件）。',
    usage: '1. 上传包含附件的 PDF 文件\n2. 扫描并预览附件列表\n3. 点击下载单个附件或全部',
    route: '/tools/pdf-attachment-extractor',
    isLocal: true,
    tags: ['PDF', '附件', '提取', '内嵌', '文件']
  }
]


export function getToolsByCategory(categoryId: string): Tool[] {
  if (categoryId === 'all') {
    return tools;
  }
  return tools.filter(tool => tool.category === categoryId);
}


export function searchTools(keyword: string): Tool[] {
  const lowerKeyword = keyword.toLowerCase();
  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowerKeyword) ||
    tool.summary.toLowerCase().includes(lowerKeyword) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}
