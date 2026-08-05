// 数据管理：导入/导出/CSV解析/数据规范化
const DataManager = {
  getBackupSchemaVersion() {
    return '1.0.0';
  },

  getStatsBackupSchemaVersion() {
    return '1.0.0';
  },

  normalizePlan(plan, fallbackId = '') {
    const idSeed = plan?.id ? String(plan.id) : `${Date.now()}_${fallbackId}`;
    const days = Array.isArray(plan?.days) ? plan.days.filter(Boolean).map(String) : [];
    const scheduleType = plan?.scheduleType === 'cycle' ? 'cycle' : 'weekly';
    const fallbackTotal = (parseInt(plan?.workDays) || 3) + (parseInt(plan?.restDays) || 1);
    const cycleTotalDays = Math.max(1, parseInt(plan?.cycleTotalDays) || fallbackTotal || 4);
    const cycleDayOffset = Math.max(1, parseInt(plan?.cycleDayOffset) || 1);
    const todayStr = new Date().toISOString().slice(0, 10);
    const startDate = plan?.startDate ? String(plan.startDate).slice(0, 10) : todayStr;
    const groupId = plan?.groupId ? String(plan.groupId) : null;
    const groupTitle = plan?.groupTitle ? String(plan.groupTitle) : '';
    const enabled = plan?.enabled !== false;

    const exercises = Array.isArray(plan?.exercises)
      ? plan.exercises
          .filter(ex => ex && ex.name)
          .map(ex => ({
            name: String(ex.name).trim(),
            sets: Math.max(1, parseInt(ex.sets) || 1),
            reps: ex.reps ? String(ex.reps) : '10',
            restBetweenSets: Math.max(0, parseInt(ex.restBetweenSets ?? ex.rest) || 60),
            restAfterExercise: Math.max(0, parseInt(ex.restAfterExercise ?? ex.rest) || 90)
          }))
      : [];
    return {
      id: idSeed,
      title: plan?.title ? String(plan.title) : `训练计划 ${idSeed.slice(-4)}`,
      scheduleType,
      days,
      cycleTotalDays,
      cycleDayOffset,
      workDays: parseInt(plan?.workDays) || 3,
      restDays: parseInt(plan?.restDays) || 1,
      startDate,
      groupId,
      groupTitle,
      enabled,
      exercises
    };
  },

  isPlanActiveOnDate(plan, targetDate = new Date()) {
    if (!plan || plan.enabled === false) return false;
    const d = targetDate instanceof Date ? targetDate : new Date(targetDate);
    if (Number.isNaN(d.getTime())) return false;

    const scheduleType = plan.scheduleType === 'cycle' ? 'cycle' : 'weekly';

    if (scheduleType === 'cycle') {
      const startStr = plan.startDate || new Date().toISOString().slice(0, 10);
      const startDate = new Date(startStr + 'T00:00:00');
      const targetZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      const diffTime = targetZero.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return false; // 未到起始日期

      const cycleTotalDays = Math.max(1, parseInt(plan.cycleTotalDays) || ((parseInt(plan.workDays) || 3) + (parseInt(plan.restDays) || 1)));
      const cycleDayOffset = Math.max(1, parseInt(plan.cycleDayOffset) || 1);

      const currentCycleDay = (diffDays % cycleTotalDays) + 1;
      return currentCycleDay === cycleDayOffset;
    } else {
      const daysMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dayName = daysMap[d.getDay()];
      return Array.isArray(plan.days) && plan.days.includes(dayName);
    }
  },

  getGroupedPlans(plans = []) {
    if (!Array.isArray(plans)) return [];

    const normPlans = plans.map((p, idx) => this.normalizePlan(p, `norm_${idx}`));
    const result = [];
    const processedIds = new Set();

    // 1. 显式组 (拥有相同的 groupId)
    const explicitGroupMap = new Map();
    normPlans.forEach(p => {
      if (p.groupId) {
        if (!explicitGroupMap.has(p.groupId)) {
          explicitGroupMap.set(p.groupId, []);
        }
        explicitGroupMap.get(p.groupId).push(p);
      }
    });

    explicitGroupMap.forEach((groupPlans, gId) => {
      groupPlans.forEach(p => processedIds.add(p.id));
      const first = groupPlans[0];
      const allEnabled = groupPlans.some(p => p.enabled !== false);
      result.push({
        isGroup: true,
        groupId: gId,
        groupTitle: first.groupTitle || `${first.scheduleType === 'cycle' ? first.cycleTotalDays + '天轮替' : '固定天'}训练套件`,
        scheduleType: first.scheduleType,
        enabled: allEnabled,
        plans: groupPlans.sort((a, b) => (a.cycleDayOffset || 0) - (b.cycleDayOffset || 0))
      });
    });

    // 2. 隐式周期组 (没有 groupId，但相同的 cycleTotalDays & startDate 且数量 >= 2)
    const cycleImplicitMap = new Map();
    normPlans.forEach(p => {
      if (!processedIds.has(p.id) && p.scheduleType === 'cycle') {
        const key = `${p.cycleTotalDays}_${p.startDate}`;
        if (!cycleImplicitMap.has(key)) {
          cycleImplicitMap.set(key, []);
        }
        cycleImplicitMap.get(key).push(p);
      }
    });

    cycleImplicitMap.forEach((groupPlans, key) => {
      if (groupPlans.length >= 2) {
        groupPlans.forEach(p => processedIds.add(p.id));
        const first = groupPlans[0];
        const gId = `auto_group_${key}`;
        const allEnabled = groupPlans.some(p => p.enabled !== false);
        result.push({
          isGroup: true,
          groupId: gId,
          groupTitle: `${first.cycleTotalDays}天轮替训练套件`,
          scheduleType: 'cycle',
          enabled: allEnabled,
          plans: groupPlans.sort((a, b) => (a.cycleDayOffset || 0) - (b.cycleDayOffset || 0))
        });
      }
    });

    // 3. 独立散计划
    normPlans.forEach(p => {
      if (!processedIds.has(p.id)) {
        result.push({
          isGroup: false,
          plan: p
        });
      }
    });

    return result;
  },

  normalizeBodyRecord(record, fallbackDate = '') {
    if (!record) return null;
    const weight = Math.round(Number(record.weight) * 10) / 10;
    if (!Number.isFinite(weight) || weight <= 0) return null;

    const sourceDate = record.date || record.recordedAt || record.ts || fallbackDate || Date.now();
    const parsedDate = new Date(sourceDate);
    const date = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString().slice(0, 10)
      : parsedDate.toISOString().slice(0, 10);

    const rawBodyFat = Number(record.bodyFat ?? record.fat);
    const bodyFat =
      Number.isFinite(rawBodyFat) && rawBodyFat > 0 ? Math.round(rawBodyFat * 10) / 10 : null;
    const rawTs = Number(record.ts);
    const ts = Number.isFinite(rawTs) ? rawTs : parsedDate.getTime();

    return {
      date,
      weight,
      bodyFat,
      ts: Number.isFinite(ts) ? ts : Date.now()
    };
  },

  normalizeBodyRecords(records) {
    if (!Array.isArray(records)) return [];
    const byDate = new Map();
    records.forEach((record, idx) => {
      const normalized = this.normalizeBodyRecord(record, `body_${idx}`);
      if (normalized) byDate.set(normalized.date, normalized);
    });
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  },

  normalizeWorkoutRecord(record, fallbackId = '') {
    if (!record) return null;
    const sourceEndedAt =
      record.endedAt || record.completedAt || record.date || record.ts || new Date().toISOString();
    const parsedEndedAt = new Date(sourceEndedAt);
    const endedAt = Number.isNaN(parsedEndedAt.getTime())
      ? new Date().toISOString()
      : parsedEndedAt.toISOString();
    const totalDurationSec = Math.max(0, parseInt(record.totalDurationSec) || 0);
    const totalSets = Math.max(0, parseInt(record.totalSets) || 0);
    const avgRestSec = Math.max(0, parseInt(record.avgRestSec) || 0);

    return {
      id: record.id ? String(record.id) : `ws_${Date.parse(endedAt)}_${fallbackId}`,
      endedAt,
      totalDurationSec,
      totalSets,
      avgRestSec,
      planTitle: record.planTitle ? String(record.planTitle) : ''
    };
  },

  normalizeWorkoutHistory(records) {
    if (!Array.isArray(records)) return [];
    const byKey = new Map();
    records.forEach((record, idx) => {
      const normalized = this.normalizeWorkoutRecord(record, `history_${idx}`);
      if (!normalized) return;
      byKey.set(normalized.id || normalized.endedAt, normalized);
    });
    return Array.from(byKey.values()).sort(
      (a, b) => new Date(a.endedAt).getTime() - new Date(b.endedAt).getTime()
    );
  },

  downloadBlob(fileName, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  exportJsonData(plans, fileName) {
    let finalName = fileName;
    if (!finalName.toLowerCase().endsWith('.json')) finalName += '.json';
    const payload = {
      schemaVersion: this.getBackupSchemaVersion(),
      exportedAt: new Date().toISOString(),
      plans: plans.map((plan, idx) => this.normalizePlan(plan, `exp_${idx}`))
    };
    this.downloadBlob(
      finalName,
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    );
  },

  exportCsvData(plans, fileName) {
    let finalName = fileName;
    if (!finalName.toLowerCase().endsWith('.csv')) finalName += '.csv';
    const escape = val => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = [
      [
        'plan_id',
        'plan_title',
        'days',
        'exercise_name',
        'sets',
        'reps',
        'rest_between_sets',
        'rest_after_exercise'
      ].join(',')
    ];
    plans.forEach((plan, pIdx) => {
      const normalized = this.normalizePlan(plan, `csv_${pIdx}`);
      if (!normalized.exercises.length) {
        rows.push(
          [
            escape(normalized.id),
            escape(normalized.title),
            escape(normalized.days.join('|')),
            '',
            '',
            '',
            '',
            ''
          ].join(',')
        );
        return;
      }
      normalized.exercises.forEach(ex => {
        rows.push(
          [
            escape(normalized.id),
            escape(normalized.title),
            escape(normalized.days.join('|')),
            escape(ex.name),
            ex.sets,
            escape(ex.reps),
            ex.restBetweenSets,
            ex.restAfterExercise
          ].join(',')
        );
      });
    });
    this.downloadBlob(
      finalName,
      new Blob([`\uFEFF${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
    );
  },

  exportBodyRecordsData(records, fileName) {
    let finalName = fileName;
    if (!finalName.toLowerCase().endsWith('.json')) finalName += '.json';
    const payload = {
      schemaVersion: this.getStatsBackupSchemaVersion(),
      exportedAt: new Date().toISOString(),
      dataType: 'body-records',
      records: this.normalizeBodyRecords(records)
    };
    this.downloadBlob(
      finalName,
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    );
  },

  exportWorkoutHistoryData(records, fileName) {
    let finalName = fileName;
    if (!finalName.toLowerCase().endsWith('.json')) finalName += '.json';
    const payload = {
      schemaVersion: this.getStatsBackupSchemaVersion(),
      exportedAt: new Date().toISOString(),
      dataType: 'workout-history',
      records: this.normalizeWorkoutHistory(records)
    };
    this.downloadBlob(
      finalName,
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    );
  },

  parseCsvRows(csvText) {
    const text = csvText.replace(/^\uFEFF/, '');
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];
      if (inQuotes) {
        if (char === '"' && next === '"') {
          field += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else field += char;
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (char !== '\r') field += char;
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  },

  parseCsvPlans(csvText) {
    const rows = this.parseCsvRows(csvText);
    if (rows.length < 2) return [];
    const header = rows[0].map(col => col.trim().toLowerCase());
    const idx = name => header.indexOf(name);
    const required = [
      'plan_id',
      'plan_title',
      'days',
      'exercise_name',
      'sets',
      'reps',
      'rest_between_sets',
      'rest_after_exercise'
    ];
    if (required.some(name => idx(name) === -1)) return null;
    const plansMap = new Map();
    rows.slice(1).forEach((cols, rowIndex) => {
      if (!cols.some(v => String(v || '').trim())) return;
      const id = String(cols[idx('plan_id')] || '').trim() || `csv_${Date.now()}_${rowIndex}`;
      if (!plansMap.has(id)) {
        plansMap.set(id, {
          id,
          title: String(cols[idx('plan_title')] || '').trim() || `训练计划 ${rowIndex + 1}`,
          days: String(cols[idx('days')] || '')
            .split('|')
            .map(day => day.trim())
            .filter(Boolean),
          exercises: []
        });
      }
      const exerciseName = String(cols[idx('exercise_name')] || '').trim();
      if (!exerciseName) return;
      plansMap.get(id).exercises.push({
        name: exerciseName,
        sets: Math.max(1, parseInt(cols[idx('sets')]) || 1),
        reps: String(cols[idx('reps')] || '10').trim() || '10',
        restBetweenSets: Math.max(0, parseInt(cols[idx('rest_between_sets')]) || 60),
        restAfterExercise: Math.max(0, parseInt(cols[idx('rest_after_exercise')]) || 90)
      });
    });
    return Array.from(plansMap.values());
  },

  parseImportPayload(rawData) {
    if (Array.isArray(rawData)) {
      return { version: 'legacy-array', plans: rawData, legacy: true };
    }
    if (rawData && typeof rawData === 'object' && Array.isArray(rawData.plans)) {
      return {
        version: rawData.schemaVersion || rawData.version || '',
        plans: rawData.plans,
        legacy: false
      };
    }
    return null;
  },

  parseBodyRecordsPayload(rawData) {
    if (Array.isArray(rawData)) {
      return { version: 'legacy-array', records: rawData, legacy: true };
    }
    if (!rawData || typeof rawData !== 'object') return null;
    if (rawData.dataType && rawData.dataType !== 'body-records') return null;
    if (Array.isArray(rawData.records)) {
      return {
        version: rawData.schemaVersion || rawData.version || '',
        records: rawData.records,
        legacy: false
      };
    }
    if (Array.isArray(rawData.bodyRecords)) {
      return {
        version: rawData.schemaVersion || rawData.version || '',
        records: rawData.bodyRecords,
        legacy: false
      };
    }
    return null;
  },

  parseWorkoutHistoryPayload(rawData) {
    if (Array.isArray(rawData)) {
      return { version: 'legacy-array', records: rawData, legacy: true };
    }
    if (!rawData || typeof rawData !== 'object') return null;
    if (rawData.dataType && rawData.dataType !== 'workout-history') return null;
    if (Array.isArray(rawData.records)) {
      return {
        version: rawData.schemaVersion || rawData.version || '',
        records: rawData.records,
        legacy: false
      };
    }
    if (Array.isArray(rawData.workoutHistory)) {
      return {
        version: rawData.schemaVersion || rawData.version || '',
        records: rawData.workoutHistory,
        legacy: false
      };
    }
    return null;
  },

  validateImportVersion(version, legacy) {
    if (legacy) return true;
    if (!version || typeof version !== 'string') return false;
    const major = parseInt(version.split('.')[0], 10);
    return Number.isFinite(major) && major === 1;
  },

  validateStatsImportVersion(version, legacy) {
    return this.validateImportVersion(version, legacy);
  },

  calculateImportDiff(incomingPlans, currentPlans) {
    const normalizeForCompare = plan => {
      const normalized = this.normalizePlan(plan);
      return JSON.stringify({
        title: normalized.title,
        days: normalized.days,
        exercises: normalized.exercises
      });
    };
    const currentMap = new Map(
      currentPlans.map(plan => [String(plan.id), normalizeForCompare(plan)])
    );
    const incomingMap = new Map(
      incomingPlans.map(plan => [String(plan.id), normalizeForCompare(plan)])
    );
    let added = 0;
    let updated = 0;
    let removed = 0;
    incomingMap.forEach((value, key) => {
      if (!currentMap.has(key)) added += 1;
      else if (currentMap.get(key) !== value) updated += 1;
    });
    currentMap.forEach((_, key) => {
      if (!incomingMap.has(key)) removed += 1;
    });
    return { added, updated, removed };
  }
};

window.DataManager = DataManager;
