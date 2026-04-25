/* eslint-disable no-undef */
// App 主对象 + 初始化 + 事件绑定
// 将所有 mixin 模块混入 App
const App = {
  FIRST_VISIT_NOTICE_KEY: 'fitness_first_visit_notice_v1',
  INTERRUPTION_RECOVERY_KEY: 'fitness_interrupted_session_v1',

  state: {
    mode: 'idle', // idle, workout_work, workout_rest, timer_running, timer_paused
    currentPlan: null,
    currentExerciseIdx: 0,
    currentSet: 1,
    timeLeft: 0,
    workoutRestEndsAt: 0,
    timerId: null,
    totalDuration: 0,
    freeTimerSetting: 0,
    freeTimerRemainingMs: 0,
    freeTimerTargetAt: 0,
    freeTimerEndsAt: 0,
    freeTimerType: 'countdown',
    stopwatchElapsed: 0,
    stopwatchStartedAt: 0,
    stopwatchLaps: [],
    theme: 'light',
    focusMode: false,
    sessionStartedAt: null,
    sessionRestStartedAt: null,
    sessionTotalRestMs: 0,
    sessionRestCount: 0,
    sessionCompletedSets: 0,
    sessionLastDurationSec: 0,
    sessionLastSets: 0,
    sessionLastAvgRestSec: 0,
    exportFormat: 'json'
  },

  data: {
    plans: [],
    workoutHistory: []
  },

  dom: {},

  init() {
    // 1. 优先缓存DOM元素
    this.cacheDom();

    // 加载数据
    const savedPlans = localStorage.getItem('fitness_plans_v2');
    if (savedPlans) {
      this.data.plans = JSON.parse(savedPlans);
    } else {
      this.data.plans = PlanTemplates.getDefaultPlans();
      this.saveData();
    }
    this.loadWorkoutHistory();

    this.bindEvents();
    this.renderPlansList();
    this.checkTodayPlan();
    AudioMgr.init();
    this.loadUiPrefs();
    this.initBodyTrack(); // 记录身体数据功能初始化

    this.setFreeTimerType('countdown', false);
    this.initStatsView();
    this.initCollapsibleCards();
    const hasRecoveryPrompt = this.maybePromptInterruptedSessionRecovery();
    this.initChangelog();
    if (!hasRecoveryPrompt) this.maybeShowFirstVisitNotice();
    requestAnimationFrame(() => this.updateTabIndicator());
  },

  cacheDom() {
    this.dom = {
      tabs: document.querySelectorAll('.nav-tab'),
      tabsTrack: document.getElementById('nav-tabs-track'),
      tabIndicator: document.getElementById('nav-tab-indicator'),
      themeToggle: document.getElementById('theme-toggle'),
      focusToggle: document.getElementById('focus-toggle'),
      modes: document.querySelectorAll('.mode-container'),
      mainCard: document.getElementById('main-card'),
      statusTitle: document.getElementById('workout-status-title'),
      statusSubtitle: document.getElementById('workout-status-subtitle'),
      timerDisplay: document.getElementById('timer-display'),
      timerLabel: document.getElementById('timer-label'),
      timerControls: document.getElementById('timer-adjust-controls'),
      ringCircle: document.getElementById('progress-ring-circle'),
      actionBtn: document.getElementById('main-action-btn'),
      resetBtn: document.getElementById('reset-btn'),
      dayBadge: document.getElementById('current-day-badge'),
      setCounter: document.getElementById('set-counter'),
      exCounter: document.getElementById('exercise-counter'),
      statsRow: document.getElementById('stats-row'),
      overallProgress: document.getElementById('overall-progress'),
      sessionTotalTime: document.getElementById('session-total-time'),
      sessionTotalSets: document.getElementById('session-total-sets'),
      sessionAvgRest: document.getElementById('session-avg-rest'),

      // 自由计时器
      ftDisplay: document.getElementById('free-timer-display'),
      ftSetup: document.getElementById('free-timer-setup'),
      ftMin: document.getElementById('ft-min'),
      ftSec: document.getElementById('ft-sec'),
      ftStartBtn: document.getElementById('ft-start-btn'),
      ftResetBtn: document.getElementById('ft-reset-btn'),
      ftConfirmBtn: document.getElementById('ft-confirm-btn'),
      ftModeTitle: document.getElementById('ft-mode-title'),
      ftModeSubtitle: document.getElementById('ft-mode-subtitle'),
      ftModeCard: document.getElementById('ft-mode-card'),
      ftModeCountdownBtn: document.getElementById('ft-mode-countdown'),
      ftModeStopwatchBtn: document.getElementById('ft-mode-stopwatch'),
      ftModeSwitch: document.getElementById('ft-mode-switch'),
      ftModeSwitchIndicator: document.getElementById('ft-mode-switch-indicator'),
      ftPresets: document.getElementById('ft-presets'),
      ftLapBtn: document.getElementById('ft-lap-btn'),
      ftLapsPanel: document.getElementById('ft-laps-panel'),
      ftLapList: document.getElementById('ft-lap-list'),
      ftLapCount: document.getElementById('ft-lap-count'),
      ftLapEmpty: document.getElementById('ft-lap-empty'),

      // 模态框
      modal: document.getElementById('plan-modal'),
      modalBackdrop: document.getElementById('modal-backdrop'),
      modalPanel: document.getElementById('modal-panel'),
      planForm: document.getElementById('plan-form'),
      templateModal: document.getElementById('template-modal'),
      templateBackdrop: document.getElementById('template-backdrop'),
      templatePanel: document.getElementById('template-panel'),
      templateList: document.getElementById('template-list'),

      // 确认弹窗
      confirmModal: document.getElementById('confirm-modal'),
      confirmBackdrop: document.getElementById('confirm-backdrop'),
      confirmPanel: document.getElementById('confirm-panel'),
      confirmTitle: document.getElementById('confirm-title'),
      confirmMsg: document.getElementById('confirm-message'),
      confirmOk: document.getElementById('confirm-ok-btn'),
      confirmCancel: document.getElementById('confirm-cancel-btn'),

      // 输入弹窗
      promptModal: document.getElementById('prompt-modal'),
      promptBackdrop: document.getElementById('prompt-backdrop'),
      promptPanel: document.getElementById('prompt-panel'),
      promptTitle: document.getElementById('prompt-title'),
      promptInput: document.getElementById('prompt-input'),
      promptOk: document.getElementById('prompt-ok-btn'),
      promptCancel: document.getElementById('prompt-cancel-btn'),
      exportFormatModal: document.getElementById('export-format-modal'),
      exportFormatBackdrop: document.getElementById('export-format-backdrop'),
      exportFormatPanel: document.getElementById('export-format-panel'),
      exportFormatJsonBtn: document.getElementById('export-format-json'),
      exportFormatCsvBtn: document.getElementById('export-format-csv'),
      exportFormatOkBtn: document.getElementById('export-format-ok-btn'),
      exportFormatCancelBtn: document.getElementById('export-format-cancel-btn'),
      exportFilenameInput: document.getElementById('export-filename-input')
    };
  },

  loadWorkoutHistory() {
    const raw = localStorage.getItem('fitness_workout_history_v1');
    if (!raw) {
      this.data.workoutHistory = [];
      this.syncLastWorkoutStatsFromHistory();
      this.renderWorkoutHistoryChart();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      this.data.workoutHistory = DataManager.normalizeWorkoutHistory(parsed);
    } catch {
      this.data.workoutHistory = [];
    }
    this.syncLastWorkoutStatsFromHistory();
    this.renderWorkoutHistoryChart();
  },

  saveWorkoutHistory() {
    this.data.workoutHistory = DataManager.normalizeWorkoutHistory(this.data.workoutHistory);
    localStorage.setItem('fitness_workout_history_v1', JSON.stringify(this.data.workoutHistory));
    this.syncLastWorkoutStatsFromHistory();
    this.renderWorkoutHistoryChart();
    this.renderHeatmap();
  },

  syncLastWorkoutStatsFromHistory() {
    const latest = this.data.workoutHistory[this.data.workoutHistory.length - 1];
    this.state.sessionLastDurationSec = latest?.totalDurationSec || 0;
    this.state.sessionLastSets = latest?.totalSets || 0;
    this.state.sessionLastAvgRestSec = latest?.avgRestSec || 0;
    this.updateSessionStatsUI();
  },

  saveData() {
    localStorage.setItem('fitness_plans_v2', JSON.stringify(this.data.plans));
    this.renderPlansList();
    this.checkTodayPlan();
  },

  exportData() {
    if (this.data.plans.length === 0) {
      this.confirm('错误', '当前没有可导出的训练计划', null);
      return;
    }
    this.openExportFormatModal();
  },

  exportDataByFormat(format, fileName) {
    if (format === 'csv') {
      DataManager.exportCsvData(this.data.plans, fileName);
      return;
    }
    DataManager.exportJsonData(this.data.plans, fileName);
  },

  importData(file) {
    if (!file) return;
    const lowerName = file.name?.toLowerCase() || '';
    const isJsonFile = lowerName.endsWith('.json');
    const isCsvFile = lowerName.endsWith('.csv');
    if (!isJsonFile && !isCsvFile) {
      this.confirm('错误', '导入失败：仅支持 .json 或 .csv 文件。', null);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        let parsedPlans = null;
        let version = '';
        let legacy = false;
        if (isCsvFile) {
          parsedPlans = DataManager.parseCsvPlans(e.target.result);
          if (parsedPlans === null) {
            this.confirm('错误', '导入失败：CSV 列结构不正确，请使用系统导出的 CSV 文件。', null);
            return;
          }
          version = 'csv-v1';
          legacy = true;
        } else {
          const parsed = DataManager.parseImportPayload(JSON.parse(e.target.result));
          if (!parsed) {
            this.confirm('错误', '导入失败：文件内容格式不正确，请使用导出的训练计划文件。', null);
            return;
          }
          parsedPlans = parsed.plans;
          version = parsed.version;
          legacy = parsed.legacy;
          if (!DataManager.validateImportVersion(version, legacy)) {
            this.confirm(
              '错误',
              `导入失败：备份版本 ${version || '未知'} 不受支持，请使用 v1.x 的导出文件。`,
              null
            );
            return;
          }
        }
        const normalizedPlans = parsedPlans
          .map((plan, idx) => DataManager.normalizePlan(plan, `imp_${idx}`))
          .filter(plan => plan.exercises.length > 0);
        if (!normalizedPlans.length) {
          this.confirm('错误', '导入失败：未发现有效训练计划。', null);
          return;
        }
        const diff = DataManager.calculateImportDiff(normalizedPlans, this.data.plans);
        const message = `导入前预览：共 ${normalizedPlans.length} 个计划，新增 ${diff.added}，更新 ${diff.updated}，删除 ${diff.removed}。确认导入后将覆盖现有计划。`;
        this.confirm('导入计划', message, () => {
          this.data.plans = normalizedPlans;
          this.saveData();
        });
      } catch {
        this.confirm('错误', '导入失败：文件无法解析，请确认文件格式正确。', null);
      }
    };
    reader.readAsText(file);
  },

  readJsonFile(file, onLoad) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        try {
          onLoad(parsed);
        } catch {
          this.confirm('错误', '导入失败：文件内容格式不正确，请检查备份文件。', null);
        }
      } catch {
        this.confirm('错误', '导入失败：文件无法解析，请确认文件格式正确。', null);
      }
    };
    reader.readAsText(file);
  },

  exportBodyData() {
    if (!this.data.bodyRecords?.length) {
      this.confirm('错误', '当前没有可导出的身体数据', null);
      return;
    }
    const defaultName = `body_records_${new Date().toISOString().split('T')[0]}`;
    this.prompt('导出身体数据', '请输入文件名', defaultName, fileName => {
      const finalName = (fileName || '').trim() || defaultName;
      DataManager.exportBodyRecordsData(this.data.bodyRecords, finalName);
    });
  },

  importBodyData(file) {
    if (!file) return;
    const lowerName = file.name?.toLowerCase() || '';
    if (!lowerName.endsWith('.json')) {
      this.confirm('错误', '导入失败：身体数据仅支持 .json 文件。', null);
      return;
    }
    this.readJsonFile(file, raw => {
      const parsed = DataManager.parseBodyRecordsPayload(raw);
      if (!parsed || !DataManager.validateStatsImportVersion(parsed.version, parsed.legacy)) {
        this.confirm('错误', '导入失败：文件内容格式不正确，请使用系统导出的身体数据文件。', null);
        return;
      }
      const normalizedRecords = DataManager.normalizeBodyRecords(parsed.records);
      if (!normalizedRecords.length) {
        this.confirm('错误', '导入失败：未发现有效身体数据记录。', null);
        return;
      }
      const message = `导入前预览：共 ${normalizedRecords.length} 条身体数据记录。确认导入后将覆盖当前 ${this.data.bodyRecords.length} 条记录。`;
      this.confirm('导入身体数据', message, () => {
        this.data.bodyRecords = normalizedRecords;
        this.saveBodyRecords();
        this.renderBodyChart();
        this.renderBodyRecordsList();
      });
    });
  },

  exportWorkoutHistory() {
    if (!this.data.workoutHistory.length) {
      this.confirm('错误', '当前没有可导出的训练记录', null);
      return;
    }
    const defaultName = `workout_history_${new Date().toISOString().split('T')[0]}`;
    this.prompt('导出训练记录', '请输入文件名', defaultName, fileName => {
      const finalName = (fileName || '').trim() || defaultName;
      DataManager.exportWorkoutHistoryData(this.data.workoutHistory, finalName);
    });
  },

  importWorkoutHistory(file) {
    if (!file) return;
    const lowerName = file.name?.toLowerCase() || '';
    if (!lowerName.endsWith('.json')) {
      this.confirm('错误', '导入失败：训练记录仅支持 .json 文件。', null);
      return;
    }
    this.readJsonFile(file, raw => {
      const parsed = DataManager.parseWorkoutHistoryPayload(raw);
      if (!parsed || !DataManager.validateStatsImportVersion(parsed.version, parsed.legacy)) {
        this.confirm('错误', '导入失败：文件内容格式不正确，请使用系统导出的训练记录文件。', null);
        return;
      }
      const normalizedHistory = DataManager.normalizeWorkoutHistory(parsed.records);
      if (!normalizedHistory.length) {
        this.confirm('错误', '导入失败：未发现有效训练记录。', null);
        return;
      }
      const message = `导入前预览：共 ${normalizedHistory.length} 条训练记录。确认导入后将覆盖当前 ${this.data.workoutHistory.length} 条记录。`;
      this.confirm('导入训练记录', message, () => {
        this.data.workoutHistory = normalizedHistory;
        this.saveWorkoutHistory();
      });
    });
  },

  buildInterruptionSnapshot() {
    const workoutModes = ['workout_work', 'workout_rest', 'workout_rest_end'];
    if (workoutModes.includes(this.state.mode) && this.state.currentPlan) {
      return {
        kind: 'workout',
        mode: this.state.mode,
        savedAt: Date.now(),
        currentPlanId: this.state.currentPlan.id || '',
        currentPlan: this.state.currentPlan,
        currentExerciseIdx: this.state.currentExerciseIdx,
        currentSet: this.state.currentSet,
        timeLeft: this.state.timeLeft,
        totalDuration: this.state.totalDuration,
        workoutRestEndsAt: this.state.workoutRestEndsAt || 0,
        sessionStartedAt: this.state.sessionStartedAt,
        sessionRestStartedAt: this.state.sessionRestStartedAt,
        sessionTotalRestMs: this.state.sessionTotalRestMs,
        sessionRestCount: this.state.sessionRestCount,
        sessionCompletedSets: this.state.sessionCompletedSets
      };
    }

    if (this.state.mode === 'timer_running' || this.state.mode === 'timer_paused') {
      return {
        kind: 'free-timer',
        mode: this.state.mode,
        savedAt: Date.now(),
        freeTimerType: this.state.freeTimerType,
        freeTimerSetting: this.state.freeTimerSetting,
        freeTimerRemainingMs: this.state.freeTimerRemainingMs,
        freeTimerEndsAt: this.state.freeTimerEndsAt || 0,
        stopwatchElapsed: this.state.stopwatchElapsed,
        stopwatchStartedAt: this.state.stopwatchStartedAt || 0,
        stopwatchLaps: Array.isArray(this.state.stopwatchLaps) ? this.state.stopwatchLaps : []
      };
    }

    return null;
  },

  persistInterruptedSession() {
    const snapshot = this.buildInterruptionSnapshot();
    if (!snapshot) {
      this.clearInterruptedSession();
      return;
    }
    localStorage.setItem(this.INTERRUPTION_RECOVERY_KEY, JSON.stringify(snapshot));
  },

  clearInterruptedSession() {
    localStorage.removeItem(this.INTERRUPTION_RECOVERY_KEY);
  },

  maybePromptInterruptedSessionRecovery() {
    const raw = localStorage.getItem(this.INTERRUPTION_RECOVERY_KEY);
    if (!raw) return false;
    try {
      const snapshot = JSON.parse(raw);
      if (!snapshot || typeof snapshot !== 'object') {
        this.clearInterruptedSession();
        return false;
      }
      this.confirm(
        '恢复中断进度',
        '检测到上次有未完成的训练或计时进度，是否继续恢复？',
        () => {
          const restored = this.restoreInterruptedSession(snapshot);
          if (!restored) {
            this.clearInterruptedSession();
            this.confirm('恢复失败', '未能恢复上次进度，已清除失效的恢复记录。');
          }
          this.deferFirstVisitNotice();
        },
        () => {
          this.clearInterruptedSession();
          this.deferFirstVisitNotice();
        },
        {
          okText: '恢复',
          cancelText: '放弃'
        }
      );
      return true;
    } catch {
      this.clearInterruptedSession();
      return false;
    }
  },

  deferFirstVisitNotice() {
    setTimeout(() => this.maybeShowFirstVisitNotice(), 260);
  },

  restoreInterruptedSession(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    if (snapshot.kind === 'workout') return this.restoreInterruptedWorkout(snapshot);
    if (snapshot.kind === 'free-timer') return this.restoreInterruptedFreeTimer(snapshot);
    return false;
  },

  restoreInterruptedWorkout(snapshot) {
    const fallbackPlan = snapshot.currentPlan
      ? DataManager.normalizePlan(snapshot.currentPlan, 'recovery')
      : null;
    const matchedPlan = this.data.plans.find(plan => plan.id === snapshot.currentPlanId);
    const plan = matchedPlan || fallbackPlan;
    if (!plan || !Array.isArray(plan.exercises) || !plan.exercises.length) return false;

    const exerciseIdx = Math.min(
      Math.max(0, parseInt(snapshot.currentExerciseIdx) || 0),
      plan.exercises.length - 1
    );
    const exercise = plan.exercises[exerciseIdx];
    const currentSet = Math.min(
      Math.max(1, parseInt(snapshot.currentSet) || 1),
      Math.max(1, parseInt(exercise.sets) || 1)
    );

    this.state.currentPlan = plan;
    this.state.currentExerciseIdx = exerciseIdx;
    this.state.currentSet = currentSet;
    this.state.sessionStartedAt = snapshot.sessionStartedAt || Date.now();
    this.state.sessionRestStartedAt = snapshot.sessionRestStartedAt || null;
    this.state.sessionTotalRestMs = Math.max(0, parseInt(snapshot.sessionTotalRestMs) || 0);
    this.state.sessionRestCount = Math.max(0, parseInt(snapshot.sessionRestCount) || 0);
    this.state.sessionCompletedSets = Math.max(0, parseInt(snapshot.sessionCompletedSets) || 0);
    this.state.totalDuration = Math.max(0, parseInt(snapshot.totalDuration) || 0);
    this.state.timeLeft = Math.max(0, parseInt(snapshot.timeLeft) || 0);
    this.state.workoutRestEndsAt = Math.max(0, parseInt(snapshot.workoutRestEndsAt) || 0);
    this.state.mode = snapshot.mode;

    this.switchTab('workout-mode');

    if (snapshot.mode === 'workout_work') {
      WakeLockMgr.request();
      this.renderWorkoutWorkState(exercise);
      this.persistInterruptedSession();
      return true;
    }

    if (snapshot.mode === 'workout_rest') {
      const now = Date.now();
      const restEndsAt =
        this.state.workoutRestEndsAt || now + Math.max(0, this.state.timeLeft) * 1000;
      const remainingSec = Math.max(0, Math.ceil((restEndsAt - now) / 1000));
      if (remainingSec <= 0) {
        this.completeRecoveredRest(restEndsAt);
        this.renderWorkoutRestEndState();
      } else {
        WakeLockMgr.request();
        this.state.timeLeft = remainingSec;
        this.state.workoutRestEndsAt = restEndsAt;
        this.renderWorkoutRestState(exercise);
        this.startWorkoutRestCountdown();
      }
      this.persistInterruptedSession();
      return true;
    }

    if (snapshot.mode === 'workout_rest_end') {
      this.renderWorkoutRestEndState();
      this.persistInterruptedSession();
      return true;
    }

    return false;
  },

  restoreInterruptedFreeTimer(snapshot) {
    const type = snapshot.freeTimerType === 'stopwatch' ? 'stopwatch' : 'countdown';
    this.switchTab('timer-mode');
    this.setFreeTimerType(type, false);

    if (type === 'countdown') {
      this.state.freeTimerSetting = Math.max(0, parseInt(snapshot.freeTimerSetting) || 0);
      if (snapshot.mode === 'timer_running') {
        const remainingMs = Math.max(
          0,
          Math.round((parseInt(snapshot.freeTimerEndsAt) || 0) - Date.now())
        );
        if (remainingMs <= 0) {
          this.state.freeTimerRemainingMs = 0;
          this.state.freeTimerEndsAt = 0;
          this.updateFreeTimerDisplay(0);
          this.updateFreeTimerActionBtn('开始', false);
          this.clearInterruptedSession();
          return false;
        }
        this.state.freeTimerRemainingMs = remainingMs;
        this.runFreeTimer();
      } else if (snapshot.mode === 'timer_paused') {
        this.clearInterval();
        this.state.mode = 'timer_paused';
        this.state.freeTimerEndsAt = 0;
        this.state.freeTimerRemainingMs = Math.max(0, parseInt(snapshot.freeTimerRemainingMs) || 0);
        this.updateFreeTimerDisplay(this.state.freeTimerRemainingMs);
        this.updateFreeTimerActionBtn('继续', false);
        this.updateLapBtnState();
      } else return false;
      this.persistInterruptedSession();
      return true;
    }

    this.state.stopwatchLaps = Array.isArray(snapshot.stopwatchLaps) ? snapshot.stopwatchLaps : [];
    this.renderStopwatchLaps();
    if (snapshot.mode === 'timer_running') {
      this.state.stopwatchElapsed = Math.max(0, parseInt(snapshot.stopwatchElapsed) || 0);
      this.state.stopwatchStartedAt =
        parseInt(snapshot.stopwatchStartedAt) || Date.now() - this.state.stopwatchElapsed * 1000;
      this.runStopwatch();
    } else if (snapshot.mode === 'timer_paused') {
      this.clearInterval();
      this.state.mode = 'timer_paused';
      this.state.stopwatchStartedAt = 0;
      this.state.stopwatchElapsed = Math.max(0, parseInt(snapshot.stopwatchElapsed) || 0);
      this.updateStopwatchDisplay(this.state.stopwatchElapsed);
      this.updateFreeTimerActionBtn('继续', false);
      this.updateLapBtnState();
    } else return false;
    this.persistInterruptedSession();
    return true;
  },

  maybeShowFirstVisitNotice() {
    if (localStorage.getItem(this.FIRST_VISIT_NOTICE_KEY) === 'seen') return;
    localStorage.setItem(this.FIRST_VISIT_NOTICE_KEY, 'seen');
    setTimeout(() => {
      this.confirm(
        '温馨提示',
        '该工具的数据保存在当前浏览器本地。清理浏览器缓存、更换设备或使用无痕模式都可能导致训练计划、训练记录和身体数据丢失，请及时导出保存数据。'
      );
    }, 180);
  },

  // --- 事件绑定 ---
  bindEvents() {
    // Tab 切换
    this.dom.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.target));
    });
    window.addEventListener('resize', () => {
      this.updateTabIndicator();
      this.updateFreeTimerModeButtons();
    });
    window.addEventListener('pagehide', () => this.persistInterruptedSession());
    window.addEventListener('beforeunload', () => this.persistInterruptedSession());

    this.dom.themeToggle.addEventListener('click', () => {
      this.applyTheme(this.state.theme === 'dark' ? 'light' : 'dark');
      this.saveUiPrefs();
    });

    this.dom.focusToggle.addEventListener('click', () => {
      this.applyFocusMode(!this.state.focusMode);
      this.saveUiPrefs();
    });

    // 锻炼控制
    this.dom.actionBtn.addEventListener('click', () => this.toggleWorkout());
    this.dom.resetBtn.addEventListener('click', () => {
      const isWorkoutInProgress =
        this.state.mode === 'workout_work' ||
        this.state.mode === 'workout_rest' ||
        this.state.mode === 'workout_rest_end';
      if (!isWorkoutInProgress) {
        this.confirm('提示', '当前未进行训练');
        return;
      }
      this.confirm('确认重置', '确定要重置当前训练进度吗？', () => {
        this.resetWorkoutState();
      });
    });

    // 声音开关
    document.getElementById('sound-toggle').addEventListener('click', e => {
      const enabled = AudioMgr.toggle();
      e.currentTarget.innerHTML = enabled
        ? '<i class="fa-solid fa-volume-high text-sm"></i>'
        : '<i class="fa-solid fa-volume-xmark text-sm"></i>';
      e.currentTarget.classList.toggle('text-slate-400', !enabled);
      e.currentTarget.classList.toggle('text-blue-600', enabled);
    });

    // 自由计时器
    this.initFreeTimer();

    // 计划管理
    document.getElementById('add-plan-btn').addEventListener('click', () => this.openModal());
    document
      .getElementById('apply-template-btn')
      .addEventListener('click', () => this.openTemplateModal());
    document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    document
      .getElementById('template-close-btn')
      .addEventListener('click', () => this.closeTemplateModal());
    this.dom.templateBackdrop.addEventListener('click', () => this.closeTemplateModal());
    document
      .getElementById('modal-save-btn')
      .addEventListener('click', () => this.savePlanFromForm());
    document
      .getElementById('add-exercise-btn')
      .addEventListener('click', () => this.addExerciseRow());
    document.getElementById('clear-all-plans').addEventListener('click', () => {
      this.confirm('清空计划', '确定清空所有计划吗？这将无法恢复。', () => {
        this.data.plans = [];
        this.saveData();
      });
    });

    // 休息时间微调按钮事件
    this.dom.timerControls.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const adjust = parseInt(btn.dataset.adjust);
        this.adjustRestTime(adjust);
      });
    });

    // 第三方 App 跳转
    document.querySelectorAll('.music-launch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = btn.dataset.app;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

        // 匹配不同平台的 scheme
        let url = '';
        switch (app) {
          case 'netease':
            url = isMobile ? 'orpheus://' : 'neteasemusic://';
            break;
          case 'qqmusic':
            url = 'qqmusic://';
            break;
          case 'spotify':
            url = 'spotify://';
            break;
          case 'apple':
            url = 'music://';
            break;
          default:
            return;
        }

        // 使用 a 标签 + target="_top" 绕过 iframe 的 CSP frame-src 限制
        const a = document.createElement('a');
        a.href = url;
        a.target = '_top';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          console.log(`尝试打开音乐应用: ${app}`);
        }, 1000);
      });
    });

    // 导入导出
    document.getElementById('export-plans-btn').addEventListener('click', () => this.exportData());
    this.dom.exportFormatJsonBtn.addEventListener('click', () => this.setExportFormat('json'));
    this.dom.exportFormatCsvBtn.addEventListener('click', () => this.setExportFormat('csv'));
    this.dom.exportFormatCancelBtn.addEventListener('click', () => this.closeExportFormatModal());
    this.dom.exportFormatBackdrop.addEventListener('click', () => this.closeExportFormatModal());
    this.dom.exportFormatOkBtn.addEventListener('click', () => {
      const inputName = (this.dom.exportFilenameInput?.value || '').trim();
      const baseName = inputName || `workout_plans_${new Date().toISOString().split('T')[0]}`;
      this.exportDataByFormat(this.state.exportFormat, baseName);
      this.closeExportFormatModal();
    });
    document.getElementById('import-plans-btn').addEventListener('click', () => {
      document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input').addEventListener('change', e => {
      this.importData(e.target.files[0]);
      e.target.value = '';
    });

    // 键盘快捷键
    document.addEventListener('keydown', e => {
      const isSpace = e.code === 'Space' || e.key === ' ';
      const isR = e.code === 'KeyR' || e.key === 'r' || e.key === 'R';
      if (!isSpace && !isR) return;

      const target = e.target;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const activeTab = document.querySelector('.nav-tab.tab-active');
      if (!activeTab) return;

      const targetId = activeTab.dataset.target;

      if (targetId === 'workout-mode') {
        if (isSpace) {
          if (!this.state.currentPlan || this.dom.actionBtn.disabled) return;
          e.preventDefault();
          this.dom.actionBtn.click();
          this.dom.actionBtn.classList.add('btn-bounce');
          setTimeout(() => {
            this.dom.actionBtn.classList.remove('btn-bounce');
          }, 200);
        } else if (isR) {
          e.preventDefault();
          this.dom.resetBtn.click();
        }
      } else if (targetId === 'timer-mode' && isR) {
        e.preventDefault();
        this.dom.ftResetBtn.click();
      }
    });
  }
};

// 混入所有模块
Object.assign(
  App,
  UIModule,
  WorkoutModule,
  TimerModule,
  PlansModule,
  ChangelogModule,
  BodyTrackModule
);

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
