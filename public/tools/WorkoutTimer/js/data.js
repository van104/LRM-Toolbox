// 数据管理：导入/导出/CSV解析/数据规范化
const DataManager = {
  getBackupSchemaVersion() {
    return '1.0.0';
  },

  normalizePlan(plan, fallbackId = '') {
    const idSeed = plan?.id ? String(plan.id) : `${Date.now()}_${fallbackId}`;
    const days = Array.isArray(plan?.days) ? plan.days.filter(Boolean).map(String) : [];
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
      days,
      exercises
    };
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

  validateImportVersion(version, legacy) {
    if (legacy) return true;
    if (!version || typeof version !== 'string') return false;
    const major = parseInt(version.split('.')[0], 10);
    return Number.isFinite(major) && major === 1;
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
    const incomingMap = new Map(incomingPlans.map(plan => [String(plan.id), normalizeForCompare(plan)]));
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

