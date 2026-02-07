export const subjects = [
    {
        id: 'git',
        name: 'Git 版本控制',
        sections: [
            {
                title: '基础配置',
                items: [
                    { cmd: 'git config --global user.name "Your Name"', desc: '设置全局用户名' },
                    { cmd: 'git config --global user.email "email@example.com"', desc: '设置全局邮箱' },
                    { cmd: 'git init', desc: '初始化本地仓库' }
                ]
            },
            {
                title: '日常操作',
                items: [
                    { cmd: 'git add .', desc: '暂存所有更改' },
                    { cmd: 'git commit -m "msg"', desc: '提交更改' },
                    { cmd: 'git status', desc: '查看工作区状态' },
                    { cmd: 'git log --oneline', desc: '查看精简日志' }
                ]
            },
            {
                title: '分支管理',
                items: [
                    { cmd: 'git branch', desc: '列出本地分支' },
                    { cmd: 'git checkout -b <name>', desc: '创建并切换分支' },
                    { cmd: 'git merge <name>', desc: '合并指定分支到当前分支' },
                    { cmd: 'git branch -d <name>', desc: '删除本地分支' }
                ]
            },
            {
                title: '远程协作',
                items: [
                    { cmd: 'git push origin main', desc: '推送到远程主分支' },
                    { cmd: 'git pull origin main', desc: '拉取远程更新并合并' },
                    { cmd: 'git fetch origin', desc: '获取远程更新不合并' },
                    { cmd: 'git remote -v', desc: '查看远程库信息' }
                ]
            }
        ]
    },
    {
        id: 'linux',
        name: 'Linux 常用命令',
        sections: [
            {
                title: '文件与目录',
                items: [
                    { cmd: 'ls -alh', desc: '查看文件列表及详情' },
                    { cmd: 'cd /path/to/dir', desc: '切换目录' },
                    { cmd: 'pwd', desc: '显示当前路径' },
                    { cmd: 'mkdir -p logs/2026', desc: '递归创建目录' },
                    { cmd: 'rm -rf tmp/', desc: '强制删除目录(慎用)' }
                ]
            },
            {
                title: '系统信息',
                items: [
                    { cmd: 'top', desc: '监控系统进程(实时)' },
                    { cmd: 'df -h', desc: '查看磁盘空间' },
                    { cmd: 'free -m', desc: '查看内存使用' },
                    { cmd: 'uname -a', desc: '查看内核/系统信息' }
                ]
            },
            {
                title: '网络工具',
                items: [
                    { cmd: 'ping <host>', desc: '测试网络连通性' },
                    { cmd: 'curl -I <url>', desc: '查看HTTP响应头' },
                    { cmd: 'netstat -tuln', desc: '查看监听端口' }
                ]
            }
        ]
    },
    {
        id: 'js',
        name: 'JS / ES6+ 语法',
        sections: [
            {
                title: '常用数组方法',
                items: [
                    { cmd: 'arr.map(x => x * 2)', desc: '映射新数组' },
                    { cmd: 'arr.filter(x => x > 0)', desc: '过滤元素' },
                    { cmd: 'arr.reduce((a, b) => a + b)', desc: '聚合计算' },
                    { cmd: 'arr.find(x => x.id === 1)', desc: '查找首个符合项' }
                ]
            },
            {
                title: '现代语法',
                items: [
                    { cmd: 'const { a, b } = obj', desc: '对象解构' },
                    { cmd: '[...arr1, ...arr2]', desc: '展开/合并数组' },
                    { cmd: '`Hello, ${name}`', desc: '模板字符串' },
                    { cmd: 'obj?.prop', desc: '可选链操作符' }
                ]
            },
            {
                title: '异步处理',
                items: [
                    { cmd: 'async function foo() {}', desc: '定义异步函数' },
                    { cmd: 'await promise', desc: '等待异步结果' },
                    { cmd: 'Promise.all([p1, p2])', desc: '并行处理Promise' }
                ]
            }
        ]
    },
    {
        id: 'npm',
        name: 'npm / Yarn 包管理',
        sections: [
            {
                title: '常用命令',
                items: [
                    { cmd: 'npm init -y', desc: '快速初始化项目' },
                    { cmd: 'npm install <pkg>', desc: '安装包' },
                    { cmd: 'npm i -D <pkg>', desc: '安装开发依赖' },
                    { cmd: 'npm uninstall <pkg>', desc: '卸载包' },
                    { cmd: 'npm update', desc: '更新所有包' }
                ]
            },
            {
                title: '运行与发布',
                items: [
                    { cmd: 'npm run <script>', desc: '执行自定义脚本' },
                    { cmd: 'npm login', desc: '登录 npm 账号' },
                    { cmd: 'npm publish', desc: '发布包到 npm' },
                    { cmd: 'npm version patch', desc: '更新小版本号' }
                ]
            },
            {
                title: 'Yarn 对应命令',
                items: [
                    { cmd: 'yarn add', desc: '对应 npm install' },
                    { cmd: 'yarn global add', desc: '对应 npm i -g' },
                    { cmd: 'yarn remove', desc: '对应 npm uninstall' }
                ]
            }
        ]
    },
    {
        id: 'node',
        name: 'Node.js 运行时',
        sections: [
            {
                title: '基础命令',
                items: [
                    { cmd: 'node -v', desc: '查看 node 版本' },
                    { cmd: 'node app.js', desc: '运行脚本' },
                    { cmd: 'node --inspect app.js', desc: '启动调试模式' },
                    { cmd: 'nvm install <ver>', desc: '使用 nvm 安装版本' }
                ]
            },
            {
                title: '环境变量',
                items: [
                    { cmd: 'process.env.NODE_ENV', desc: '获取环境标志' },
                    { cmd: 'PORT=3000 node index.js', desc: '临时指定端口运行' }
                ]
            }
        ]
    },
    {
        id: 'markdown',
        name: 'Markdown 语法',
        sections: [
            {
                title: '基础样式',
                items: [
                    { cmd: '# H1, ## H2, ### H3', desc: '各级标题' },
                    { cmd: '**Bold**, *Italic*', desc: '粗体与斜体' },
                    { cmd: '[Title](URL)', desc: '超链接' },
                    { cmd: '![Alt](ImageURL)', desc: '插入图片' }
                ]
            },
            {
                title: '列表与引用',
                items: [
                    { cmd: '- Item, 1. First', desc: '无序/有序列表' },
                    { cmd: '> Quote line', desc: '引用块' },
                    { cmd: '- [ ] Task, - [x] Done', desc: '任务列表' }
                ]
            },
            {
                title: '代码与表格',
                items: [
                    { cmd: '`code` / ```lang ... ```', desc: '行内/块状代码' },
                    { cmd: '| H1 | H2 |', desc: '表格结构' },
                    { cmd: '---', desc: '水平分割线' }
                ]
            }
        ]
    },
    {
        id: 'docker',
        name: 'Docker 容器化',
        sections: [
            {
                title: '镜像操作',
                items: [
                    { cmd: 'docker pull <image>', desc: '拉取镜像' },
                    { cmd: 'docker images', desc: '列出本地镜像' },
                    { cmd: 'docker build -t <tag> .', desc: '构建镜像' },
                    { cmd: 'docker rmi <id>', desc: '删除镜像' }
                ]
            },
            {
                title: '容器管理',
                items: [
                    { cmd: 'docker run -d -p 80:80 <img>', desc: '后台运行并映射端口' },
                    { cmd: 'docker ps -a', desc: '查看所有容器' },
                    { cmd: 'docker stop <id>', desc: '停止容器' },
                    { cmd: 'docker rm <id>', desc: '删除容器' },
                    { cmd: 'docker logs -f <id>', desc: '查看实时日志' }
                ]
            }
        ]
    },
    {
        id: 'vim',
        name: 'Vim 快捷键',
        sections: [
            {
                title: '模式切换',
                items: [
                    { cmd: 'i', desc: '进入插入模式' },
                    { cmd: 'Esc', desc: '返回普通模式' },
                    { cmd: ':', desc: '进入命令模式' },
                    { cmd: 'v', desc: '进入可视模式' }
                ]
            },
            {
                title: '基础命令',
                items: [
                    { cmd: ':w', desc: '保存' },
                    { cmd: ':q!', desc: '强制退出不保存' },
                    { cmd: ':wq', desc: '保存并退出' },
                    { cmd: 'dd', desc: '删除/剪切当前行' },
                    { cmd: 'yy', desc: '复制当前行' },
                    { cmd: 'p', desc: '粘贴到下一行' }
                ]
            }
        ]
    },
    {
        id: 'regex',
        name: 'RegEx 正则表达式',
        sections: [
            {
                title: '元字符',
                items: [
                    { cmd: '.', desc: '匹配除换行符外任意字符' },
                    { cmd: '\\d, \\w, \\s', desc: '数字, 字母, 空白符' },
                    { cmd: '^, $', desc: '匹配开头, 结尾' },
                    { cmd: '[a-z]', desc: '匹配字符集范围' }
                ]
            },
            {
                title: '量词',
                items: [
                    { cmd: '*', desc: '匹配 0 次或多次' },
                    { cmd: '+', desc: '匹配 1 次或多次' },
                    { cmd: '?', desc: '匹配 0 次 or 1 次' },
                    { cmd: '{n,m}', desc: '匹配 n 到 m 次' }
                ]
            }
        ]
    },
    {
        id: 'http',
        name: 'HTTP 状态码',
        sections: [
            {
                title: '常用代码',
                items: [
                    { cmd: '200 OK', desc: '请求成功' },
                    { cmd: '301 / 302', desc: '永久/临时重定向' },
                    { cmd: '400 Bad Request', desc: '参数错误' },
                    { cmd: '401 Unauthorized', desc: '未登录' },
                    { cmd: '403 Forbidden', desc: '权限不足' },
                    { cmd: '404 Not Found', desc: '资源丢失' },
                    { cmd: '500 Internal Error', desc: '服务器崩溃' },
                    { cmd: '503 Service Unavailable', desc: '过载/维护' }
                ]
            }
        ]
    },
    {
        id: 'sql',
        name: 'SQL 数据库操作',
        sections: [
            {
                title: '数据定义 (DDL)',
                items: [
                    { cmd: 'CREATE DATABASE db_name', desc: '创建数据库' },
                    { cmd: 'CREATE TABLE tb (id INT, name VARCHAR(255))', desc: '创建表' },
                    { cmd: 'ALTER TABLE tb ADD col_name TEXT', desc: '添加列' },
                    { cmd: 'DROP TABLE tb_name', desc: '删除表' }
                ]
            },
            {
                title: '数据操作 (DML)',
                items: [
                    { cmd: 'INSERT INTO tb (col1, col2) VALUES (v1, v2)', desc: '插入数据' },
                    { cmd: 'UPDATE tb SET col = val WHERE id = 1', desc: '修改数据' },
                    { cmd: 'DELETE FROM tb WHERE id = 1', desc: '删除单条数据' },
                    { cmd: 'TRUNCATE TABLE tb', desc: '清空表数据' }
                ]
            },
            {
                title: '数据检索 (DQL)',
                items: [
                    { cmd: 'SELECT * FROM tb WHERE col LIKE "%val%"', desc: '模糊匹配查询' },
                    { cmd: 'SELECT col1, col2 FROM tb ORDER BY col1 DESC', desc: '指定列排序查询' },
                    { cmd: 'SELECT * FROM tb LIMIT 10 OFFSET 20', desc: '分页查询' }
                ]
            },
            {
                title: '聚合与关联',
                items: [
                    { cmd: 'SELECT COUNT(*), category FROM tb GROUP BY category', desc: '分组统计' },
                    { cmd: 'SELECT * FROM a JOIN b ON a.id = b.a_id', desc: '内连接查询' },
                    { cmd: 'SELECT * FROM a LEFT JOIN b ON a.id = b.a_id', desc: '左连接查询' }
                ]
            }
        ]
    },
    {
        id: 'css',
        name: 'CSS 现代布局',
        sections: [
            {
                title: 'Flexbox (弹性)',
                items: [
                    { cmd: 'display: flex;', desc: '开启弹性布局' },
                    { cmd: 'justify-content: center;', desc: '主轴居中' }
                ]
            },
            {
                title: 'Grid (网格)',
                items: [
                    { cmd: 'display: grid;', desc: '开启网格布局' },
                    { cmd: 'grid-template-columns: 1fr 1fr;', desc: '两列等宽' },
                    { cmd: 'gap: 10px;', desc: '行列间距' },
                    { cmd: 'place-items: center;', desc: '全面居中' }
                ]
            },
            {
                title: '常用技巧',
                items: [
                    { cmd: 'text-overflow: ellipsis;', desc: '文本溢出省略' },
                    { cmd: 'box-sizing: border-box;', desc: '盒模型修正' },
                    { cmd: 'cursor: pointer;', desc: '鼠标手型' },
                    { cmd: 'z-index: 100;', desc: '层级控制' }
                ]
            }
        ]
    },
    {
        id: 'python',
        name: 'Python 常用语法',
        sections: [
            {
                title: '基础操作',
                items: [
                    { cmd: 'print(f"Hello {name}")', desc: 'f-string 格式化' },
                    { cmd: 'len(lst)', desc: '获取长度' },
                    { cmd: 'range(0, 10, 2)', desc: '生成序列' },
                    { cmd: 'input("Prompt: ")', desc: '获取输入' }
                ]
            },
            {
                title: '列表与字典',
                items: [
                    { cmd: 'lst.append(x)', desc: '列表追加' },
                    { cmd: 'lst[1:3]', desc: '列表切片' },
                    { cmd: 'dict.get(key, default)', desc: '安全获取字典值' },
                    { cmd: '[x**2 for x in range(5)]', desc: '列表推导式' }
                ]
            },
            {
                title: '文件操作',
                items: [
                    { cmd: 'with open("f.txt") as f:', desc: '上下文管理' },
                    { cmd: 'f.read()', desc: '读取全部' },
                    { cmd: 'f.readlines()', desc: '按行读取' },
                    { cmd: 'json.load(f)', desc: '加载JSON' }
                ]
            },
            {
                title: '常用库',
                items: [
                    { cmd: 'pip install requests', desc: '安装库' },
                    { cmd: 'import os', desc: '系统模块' },
                    { cmd: 'import sys', desc: '环境模块' },
                    { cmd: 'from datetime import datetime', desc: '时间模块' }
                ]
            }
        ]
    },
    {
        id: 'redis',
        name: 'Redis 缓存数据库',
        sections: [
            {
                title: '字符串 (String)',
                items: [
                    { cmd: 'SET key val EX 60', desc: '设置键值及过期(秒)' },
                    { cmd: 'GET key', desc: '获取值' },
                    { cmd: 'INCR key', desc: '自增1' },
                    { cmd: 'DEL key', desc: '删除键' }
                ]
            },
            {
                title: '哈希 (Hash)',
                items: [
                    { cmd: 'HSET key field val', desc: '设置字段值' },
                    { cmd: 'HGET key field', desc: '获取字段值' },
                    { cmd: 'HGETALL key', desc: '获取所有字段' },
                    { cmd: 'HDEL key field', desc: '删除字段' }
                ]
            },
            {
                title: '列表 (List)',
                items: [
                    { cmd: 'LPUSH key val', desc: '左侧推入' },
                    { cmd: 'RPOP key', desc: '右侧弹出' },
                    { cmd: 'LRANGE key 0 -1', desc: '查看列表所有元素' }
                ]
            },
            {
                title: '集合 (Set)',
                items: [
                    { cmd: 'SADD key val', desc: '添加元素' },
                    { cmd: 'SMEMBERS key', desc: '查看所有元素' },
                    { cmd: 'SISMEMBER key val', desc: '判断是否存在' }
                ]
            }
        ]
    },
    {
        id: 'vue',
        name: 'Vue 3 核心语法',
        sections: [
            {
                title: '响应式 API',
                items: [
                    { cmd: 'const count = ref(0)', desc: '基本类型响应式' },
                    { cmd: 'const state = reactive({})', desc: '对象响应式' },
                    { cmd: 'computed(() => count.value * 2)', desc: '计算属性' },
                    { cmd: 'watch(src, (n, o) => {})', desc: '监听器' }
                ]
            },
            {
                title: '生命周期',
                items: [
                    { cmd: 'onMounted(() => {})', desc: '挂载完成' },
                    { cmd: 'onUpdated(() => {})', desc: '更新完成' },
                    { cmd: 'onUnmounted(() => {})', desc: '卸载完成' }
                ]
            },
            {
                title: '指令',
                items: [
                    { cmd: 'v-if / v-else', desc: '条件渲染' },
                    { cmd: 'v-for="(item, i) in list"', desc: '列表渲染' },
                    { cmd: 'v-model="val"', desc: '双向绑定' },
                    { cmd: '@click="handler"', desc: '事件绑定' }
                ]
            }
        ]
    }
];
