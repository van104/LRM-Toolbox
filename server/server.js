const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// --- 手动解析 .env 文件 (零依赖方案) ---
function loadEnvManual() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split(/\r?\n/).forEach(line => {
                const [key, ...valueParts] = line.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
                    process.env[key.trim()] = value;
                }
            });
            console.log('✅ 已成功手动解析 .env 文件');
        } catch (e) {
            console.error('读取 .env 文件失败:', e);
        }
    } else {
        console.warn('⚠️ 未找到 .env 文件，请确认文件是否存在于 feedback-api 目录');
    }
}
loadEnvManual();

const app = express();
const PORT = 3000;

// 启用跨域支持
app.use(cors());
app.use(express.json());

// 数据存储路径
const DATA_FILE = path.join(__dirname, 'data', 'feedback.json');
if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

// 密码处理
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();

// 提交反馈 API
app.post('/lrm-api/feedback', (req, res) => {
    try {
        const newFeedback = {
            id: Date.now().toString() + Math.floor(Math.random() * 1000),
            ...req.body,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        const feedbackList = JSON.parse(fileContent || '[]');
        feedbackList.unshift(newFeedback);
        if (feedbackList.length > 1000) feedbackList.length = 1000;
        fs.writeFileSync(DATA_FILE, JSON.stringify(feedbackList, null, 2), 'utf8');

        res.json({ success: true, message: '反馈提交成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 获取反馈列表 API
app.get('/lrm-api/feedback', (req, res) => {
    const authHeader = (req.headers['x-admin-token'] || '').trim();

    if (!ADMIN_PASSWORD) {
        return res.status(500).json({
            error: '密码配置缺失',
            detail: '后端未能从 .env 读取到 ADMIN_PASSWORD，请检查文件内容'
        });
    }

    if (authHeader !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: '未授权：密码错误' });
    }

    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(fileContent || '[]'));
    } catch (error) {
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 更新反馈状态 API
app.post('/lrm-api/feedback/update', (req, res) => {
    const authHeader = (req.headers['x-admin-token'] || '').trim();
    const { id, status } = req.body;

    if (authHeader !== ADMIN_PASSWORD || !ADMIN_PASSWORD) return res.status(401).json({ error: '未授权' });

    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        let feedbackList = JSON.parse(fileContent || '[]');
        const index = feedbackList.findIndex(f => f.id === id);
        if (index !== -1) {
            feedbackList[index].status = status;
            fs.writeFileSync(DATA_FILE, JSON.stringify(feedbackList, null, 2), 'utf8');
            res.json({ success: true });
        } else {
            res.status(404).json({ error: '未找到' });
        }
    } catch (error) {
        res.status(500).json({ error: '操作失败' });
    }
});

// 删除反馈 API
app.post('/lrm-api/feedback/delete', (req, res) => {
    const authHeader = (req.headers['x-admin-token'] || '').trim();
    const { id } = req.body;

    if (authHeader !== ADMIN_PASSWORD || !ADMIN_PASSWORD) return res.status(401).json({ error: '未授权' });

    try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf8');
        let feedbackList = JSON.parse(fileContent || '[]');
        const newList = feedbackList.filter(f => f.id !== id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(newList, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: '操作失败' });
    }
});

app.listen(PORT, () => {
    console.log(`反馈服务运行在 http://localhost:${PORT}`);
});
