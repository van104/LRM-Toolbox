import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.sqlite');
const OLD_JSON_PATH = path.join(__dirname, 'data', 'feedback.json');

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      type TEXT,
      content TEXT,
      contact TEXT,
      status TEXT,
      timestamp TEXT,
      userAgent TEXT
    )`,
      err => {
        if (!err) {
          migrateFromJson();
        } else {
          console.error('Error creating feedbacks table:', err);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS maintenance (
      toolId TEXT PRIMARY KEY,
      toolName TEXT,
      enabled INTEGER DEFAULT 0,
      notice TEXT DEFAULT '',
      updatedAt TEXT
    )`,
      err => {
        if (err) {
          console.error('Error creating maintenance table:', err);
        }
      }
    );
  });
}

function migrateFromJson() {
  if (fs.existsSync(OLD_JSON_PATH)) {
    try {
      const data = fs.readFileSync(OLD_JSON_PATH, 'utf8');
      const feedbacks = JSON.parse(data);
      if (Array.isArray(feedbacks) && feedbacks.length > 0) {
        db.serialize(() => {
          const stmt = db.prepare(
            `INSERT OR IGNORE INTO feedbacks (id, type, content, contact, status, timestamp, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?)`
          );
          feedbacks.forEach(fb => {
            stmt.run(
              fb.id || Date.now().toString(),
              fb.type || 'unknown',
              fb.content || '',
              fb.contact || '',
              fb.status || 'pending',
              fb.timestamp || new Date().toISOString(),
              fb.userAgent || ''
            );
          });
          stmt.finalize();
        });
        console.log(`Migrated ${feedbacks.length} feedbacks from JSON onto DB.`);
        fs.renameSync(OLD_JSON_PATH, OLD_JSON_PATH + '.bak');
      }
    } catch (e) {
      console.error('Migration failed:', e);
    }
  }
}

export const dbAPI = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM feedbacks ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  add: fb => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO feedbacks (id, type, content, contact, status, timestamp, userAgent) VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      stmt.run(
        fb.id,
        fb.type,
        fb.content,
        fb.contact,
        fb.status,
        fb.timestamp,
        fb.userAgent,
        function (err) {
          if (err) reject(err);
          else resolve({ changes: this.changes, lastID: this.lastID });
        }
      );
      stmt.finalize();
    });
  },

  updateStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE feedbacks SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM feedbacks WHERE id = ?', id, function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteBatch: ids => {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(ids) || ids.length === 0) return resolve(0);
      const placeholders = ids.map(() => '?').join(',');
      db.run(`DELETE FROM feedbacks WHERE id IN (${placeholders})`, ids, function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  deleteAll: () => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM feedbacks', [], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  },

  updateStatusBatch: (ids, status) => {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(ids) || ids.length === 0) return resolve(0);
      const placeholders = ids.map(() => '?').join(',');
      db.run(
        `UPDATE feedbacks SET status = ? WHERE id IN (${placeholders})`,
        [status, ...ids],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  },

  // ========== 维护模式 ==========
  maintenanceGetAll: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM maintenance ORDER BY updatedAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(r => ({ ...r, enabled: !!r.enabled })));
      });
    });
  },

  maintenanceUpsert: (toolId, toolName, enabled, notice) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO maintenance (toolId, toolName, enabled, notice, updatedAt)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(toolId) DO UPDATE SET
           toolName = excluded.toolName,
           enabled = excluded.enabled,
           notice = excluded.notice,
           updatedAt = excluded.updatedAt`,
        [toolId, toolName, enabled ? 1 : 0, notice, new Date().toISOString()],
        function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  },

  maintenanceDelete: toolId => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM maintenance WHERE toolId = ?', [toolId], function (err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
};
