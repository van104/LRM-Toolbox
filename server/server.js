import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dbAPI } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 手动解析 .env 文件 (零依赖方案) ---
function loadEnvManual() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        // 跳过空行和注释
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts
            .join('=')
            .trim()
            .replace(/^['"]|['"]$/g, '');
          process.env[key.trim()] = value;
        }
      });
      console.log('✅ 已成功手动解析 .env 文件');
    } catch (e) {
      console.error('读取 .env 文件失败:', e);
    }
  } else {
    console.warn('⚠️ 未找到 .env 文件，请确认文件是否存在于 server 目录');
  }
}
loadEnvManual();

const app = express();
const PORT = 3000;

// ========== 安全中间件 ==========

// 设置安全 HTTP 头
app.use(helmet());

// 收紧 CORS 配置 — 仅允许已知来源
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,https://www.lrm123.site,http://www.lrm123.site'
)
  .split(',')
  .map(s => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // 允许无 origin 的请求（如服务端直接调用）
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS 策略拒绝该来源'));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-admin-token']
  })
);

// 全局速率限制 — 每个 IP 每 15 分钟最多 100 次请求
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '请求过于频繁，请稍后再试' }
});
app.use(globalLimiter);

// 针对反馈提交的严格限流 — 每个 IP 每 15 分钟最多 10 次
const feedbackSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '反馈提交过于频繁，请稍后再试' }
});

// 针对 AI 代理的严格限流 — 每个 IP 每分钟最多 5 次
const aiProxyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI 请求过于频繁，请稍后再试' }
});

app.use(express.json({ limit: '1mb' }));

// 密码处理
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();

// ========== 输入验证工具 ==========

// HTML 实体转义 — 防止存储型 XSS
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 反馈数据验证
function validateFeedbackInput(body) {
  const { type, content, contact } = body;

  if (!type || typeof type !== 'string' || type.length > 50) {
    return '反馈类型无效';
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return '反馈内容不能为空';
  }

  if (content.length > 5000) {
    return '反馈内容过长（最多5000字）';
  }

  if (contact && (typeof contact !== 'string' || contact.length > 200)) {
    return '联系方式格式无效';
  }

  return null;
}

// ========== API 路由 ==========

// 提交反馈 API
app.post('/lrm-api/feedback', feedbackSubmitLimiter, async (req, res) => {
  try {
    // 输入验证
    const validationError = validateFeedbackInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // 只提取允许的字段，防止字段注入
    const { type, content, contact } = req.body;

    const newFeedback = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      type: escapeHtml(type.trim()),
      content: escapeHtml(content.trim()),
      contact: contact ? escapeHtml(contact.trim()) : '',
      status: 'pending',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    };

    await dbAPI.add(newFeedback);
    res.json({ success: true, message: '反馈提交成功' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取反馈列表 API
app.get('/lrm-api/feedback', async (req, res) => {
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
    const feedbacks = await dbAPI.getAll();
    res.json(feedbacks);
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 更新反馈状态 API
app.post('/lrm-api/feedback/update', async (req, res) => {
  const authHeader = (req.headers['x-admin-token'] || '').trim();
  const { id, status } = req.body;

  if (authHeader !== ADMIN_PASSWORD || !ADMIN_PASSWORD)
    return res.status(401).json({ error: '未授权' });

  // 验证 status 值只能是允许的枚举
  const allowedStatuses = ['pending', 'processing', 'resolved', 'rejected'];
  if (!id || typeof id !== 'string' || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: '参数无效' });
  }

  try {
    const changes = await dbAPI.updateStatus(id, status);
    if (changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '未找到' });
    }
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// 删除反馈 API
app.post('/lrm-api/feedback/delete', async (req, res) => {
  const authHeader = (req.headers['x-admin-token'] || '').trim();
  const { id } = req.body;

  if (authHeader !== ADMIN_PASSWORD || !ADMIN_PASSWORD)
    return res.status(401).json({ error: '未授权' });

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '参数无效' });
  }

  try {
    // 即使没找到 ID，只要不出错，通常认为删除成功，或者返回 404
    const changes = await dbAPI.delete(id);
    if (changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '未找到' });
    }
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

// AI 绘图代理 API — 修复 SSRF，硬编码 API 地址
const AI_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

app.post('/lrm-api/ai-proxy', aiProxyLimiter, async (req, res) => {
  const { model, messages, max_tokens, temperature } = req.body;
  const apiKey = process.env.SERVER_SILICONFLOW_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '后端未配置 SERVER_SILICONFLOW_API_KEY' });
  }

  // 验证必需字段
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: '消息内容不能为空' });
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'Qwen/Qwen3-VL-32B-Instruct',
        messages,
        max_tokens: Math.min(max_tokens || 50, 4096),
        temperature: Math.min(Math.max(temperature || 0.1, 0), 2)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (error) {
    console.error('AI 代理请求失败:', error);
    res.status(500).json({ error: '代理请求失败' });
  }
});

app.listen(PORT, () => {
  console.log(`反馈服务运行在 http://localhost:${PORT}`);
});
