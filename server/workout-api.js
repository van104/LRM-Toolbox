import express from 'express';
import crypto from 'crypto';
import { db } from './workout-db.js';

const router = express.Router();

// 调试中间件
router.use((req, res, next) => {
  console.log(`[WorkoutAPI] ${req.method} ${req.originalUrl}`);
  next();
});

// ========== 简易JWT工具 ==========

const JWT_SECRET = process.env.JWT_SECRET || 'workout_timer_secret_2024';

function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'workout_salt').digest('hex');
}

// 中间件：验证Token
function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: '未登录' });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Token无效' });

  req.userId = payload.userId;
  next();
}

// ========== 用户认证 ==========

// 注册
router.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: '请填写完整信息' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少6位' });
    }

    // 检查邮箱是否已注册
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: '邮箱已注册' });
    }

    const userId = crypto.randomUUID().replace(/-/g, '');
    const user = {
      id: userId,
      username,
      email,
      passwordHash: hashPassword(password),
      createdAt: Date.now()
    };

    await db.createUser(user);

    const token = generateToken({ userId });
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

// 登录
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '请填写邮箱和密码' });
    }

    const user = await db.getUserByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 更新最后登录时间
    await db.updateUserLogin(user.id);

    const token = generateToken({ userId: user.id });
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// 获取用户信息
router.get('/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

// ========== 训练计划 ==========

router.get('/plans', authMiddleware, async (req, res) => {
  try {
    const plans = await db.getPlans(req.userId);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

router.post('/plans', authMiddleware, async (req, res) => {
  try {
    const plan = {
      id: crypto.randomUUID().replace(/-/g, ''),
      userId: req.userId,
      ...req.body,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await db.createPlan(plan);
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
});

router.put('/plans/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await db.updatePlan(req.params.id, req.userId, {
      ...req.body,
      updatedAt: Date.now()
    });
    if (!updated) return res.status(404).json({ error: '计划不存在' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '更新失败' });
  }
});

router.delete('/plans/:id', authMiddleware, async (req, res) => {
  try {
    await db.deletePlan(req.params.id, req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除失败' });
  }
});

// ========== 训练记录 ==========

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await db.getHistory(req.userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

router.post('/history', authMiddleware, async (req, res) => {
  try {
    const record = {
      id: crypto.randomUUID().replace(/-/g, ''),
      userId: req.userId,
      ...req.body,
      completedAt: Date.now()
    };
    await db.addHistory(record);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '保存失败' });
  }
});

// ========== 身体数据 ==========

router.get('/body', authMiddleware, async (req, res) => {
  try {
    const records = await db.getBodyRecords(req.userId);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

router.post('/body', authMiddleware, async (req, res) => {
  try {
    const record = {
      id: crypto.randomUUID().replace(/-/g, ''),
      userId: req.userId,
      ...req.body,
      createdAt: Date.now()
    };
    await db.addBodyRecord(record);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: '保存失败' });
  }
});

// ========== AI助手 ==========

const AI_API_KEY = process.env.SILICONFLOW_API_KEY || '';
const AI_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const AI_MODEL = 'Qwen/Qwen2.5-7B-Instruct';

router.post('/ai/chat', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: '消息不能为空' });

    // 获取用户训练数据作为上下文
    const plans = await db.getPlans(req.userId);
    const history = await db.getHistory(req.userId);
    const bodyRecords = await db.getBodyRecords(req.userId);

    const systemPrompt = `你是一个专业的AI训练助手。用户正在使用健身训练APP。
用户训练计划: ${JSON.stringify(plans.slice(0, 5))}
最近训练记录: ${JSON.stringify(history.slice(0, 10))}
身体数据: ${JSON.stringify(bodyRecords.slice(0, 5))}
请根据用户数据提供个性化、专业的健身建议。回复简洁实用。`;

    // 保存用户消息
    await db.addAiMessage({
      id: crypto.randomUUID().replace(/-/g, ''),
      userId: req.userId,
      role: 'user',
      content,
      createdAt: Date.now()
    });

    // 调用AI API
    const aiResponse = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || '抱歉，暂时无法回复';

    // 保存AI回复
    await db.addAiMessage({
      id: crypto.randomUUID().replace(/-/g, ''),
      userId: req.userId,
      role: 'assistant',
      content: reply,
      createdAt: Date.now()
    });

    res.json({ reply });
  } catch (error) {
    console.error('AI请求失败:', error);
    res.status(500).json({ error: 'AI请求失败' });
  }
});

router.get('/ai/history', authMiddleware, async (req, res) => {
  try {
    const messages = await db.getAiMessages(req.userId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

router.delete('/ai/history', authMiddleware, async (req, res) => {
  try {
    await db.clearAiMessages(req.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '清空失败' });
  }
});

// ========== 设备配对 ==========

router.post('/device/pair', authMiddleware, async (req, res) => {
  try {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res.json({ code });
  } catch (error) {
    res.status(500).json({ error: '生成失败' });
  }
});

router.get('/device/list', authMiddleware, async (req, res) => {
  try {
    const devices = await db.getDevices(req.userId);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: '获取失败' });
  }
});

export default router;
