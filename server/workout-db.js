import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'workout.db');

let sqlite3;
let dbConn;

try {
  const mod = await import('sqlite3');
  sqlite3 = mod.default.verbose();
  dbConn = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('训练数据库连接失败:', err);
    } else {
      console.log('✅ 训练数据库已连接');
      initTables();
    }
  });
} catch (e) {
  console.error('⚠️ sqlite3 加载失败，训练API不可用:', e.message);
}

// 初始化表结构
function initTables() {
  dbConn.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      avatarUrl TEXT,
      createdAt INTEGER,
      lastLoginAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      days TEXT,
      exercises TEXT,
      isTemplate INTEGER DEFAULT 0,
      createdAt INTEGER,
      updatedAt INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workout_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      planId TEXT,
      planTitle TEXT,
      totalDurationSec INTEGER,
      totalSets INTEGER,
      avgRestSec INTEGER,
      completedAt INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS body_records (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT,
      weight REAL,
      bodyFat REAL,
      height REAL,
      createdAt INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS device_bindings (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      deviceName TEXT,
      deviceType TEXT DEFAULT 'pc',
      pairCode TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt INTEGER,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `, (err) => {
    if (err) console.error('建表失败:', err);
    else console.log('✅ 训练数据表已就绪');
  });
}

// Promise封装
function run(sql, params = []) {
  if (!dbConn) return Promise.reject(new Error('数据库未连接'));
  return new Promise((resolve, reject) => {
    dbConn.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  if (!dbConn) return Promise.reject(new Error('数据库未连接'));
  return new Promise((resolve, reject) => {
    dbConn.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  if (!dbConn) return Promise.reject(new Error('数据库未连接'));
  return new Promise((resolve, reject) => {
    dbConn.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// ========== 数据库操作 ==========

export const db = {
  // 用户
  async createUser(user) {
    await run(
      'INSERT INTO users (id, username, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.username, user.email, user.passwordHash, user.createdAt]
    );
  },

  async getUserById(id) {
    return get('SELECT * FROM users WHERE id = ?', [id]);
  },

  async getUserByEmail(email) {
    return get('SELECT * FROM users WHERE email = ?', [email]);
  },

  async updateUserLogin(id) {
    await run('UPDATE users SET lastLoginAt = ? WHERE id = ?', [Date.now(), id]);
  },

  // 训练计划
  async getPlans(userId) {
    return all('SELECT * FROM workout_plans WHERE userId = ? ORDER BY updatedAt DESC', [userId]);
  },

  async createPlan(plan) {
    await run(
      'INSERT INTO workout_plans (id, userId, title, days, exercises, isTemplate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [plan.id, plan.userId, plan.title, plan.days, plan.exercises, plan.isTemplate || 0, plan.createdAt, plan.updatedAt]
    );
  },

  async updatePlan(id, userId, data) {
    const result = await run(
      'UPDATE workout_plans SET title = ?, days = ?, exercises = ?, updatedAt = ? WHERE id = ? AND userId = ?',
      [data.title, data.days, data.exercises, data.updatedAt, id, userId]
    );
    return result.changes > 0;
  },

  async deletePlan(id, userId) {
    await run('DELETE FROM workout_plans WHERE id = ? AND userId = ?', [id, userId]);
  },

  // 训练记录
  async getHistory(userId) {
    return all('SELECT * FROM workout_history WHERE userId = ? ORDER BY completedAt DESC', [userId]);
  },

  async addHistory(record) {
    await run(
      'INSERT INTO workout_history (id, userId, planId, planTitle, totalDurationSec, totalSets, avgRestSec, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [record.id, record.userId, record.planId, record.planTitle, record.totalDurationSec, record.totalSets, record.avgRestSec, record.completedAt]
    );
  },

  // 身体数据
  async getBodyRecords(userId) {
    return all('SELECT * FROM body_records WHERE userId = ? ORDER BY date DESC', [userId]);
  },

  async addBodyRecord(record) {
    await run(
      'INSERT INTO body_records (id, userId, date, weight, bodyFat, height, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [record.id, record.userId, record.date, record.weight, record.bodyFat, record.height, record.createdAt]
    );
  },

  // AI对话
  async getAiMessages(userId) {
    return all('SELECT * FROM ai_conversations WHERE userId = ? ORDER BY createdAt ASC', [userId]);
  },

  async addAiMessage(msg) {
    await run(
      'INSERT INTO ai_conversations (id, userId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)',
      [msg.id, msg.userId, msg.role, msg.content, msg.createdAt]
    );
  },

  async clearAiMessages(userId) {
    await run('DELETE FROM ai_conversations WHERE userId = ?', [userId]);
  },

  // 设备
  async getDevices(userId) {
    return all('SELECT * FROM device_bindings WHERE userId = ? AND isActive = 1', [userId]);
  }
};
