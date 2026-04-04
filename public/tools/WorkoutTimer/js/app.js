/* eslint-disable no-undef */
// App 主对象 + 初始化 + 事件绑定
// 将所有 mixin 模块混入 App
const App = {
  state: {
    mode: 'idle', // idle, workout_work, workout_rest, timer_running, timer_paused
    currentPlan: null,
    currentExerciseIdx: 0,
    currentSet: 1,
    timeLeft: 0,
    timerId: null,
    totalDuration: 0,
    freeTimerSetting: 0,
    freeTimerRemainingMs: 0,
    freeTimerTargetAt: 0,
    freeTimerType: 'countdown',
    stopwatchElapsed: 0,
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

    this.setFreeTimerType('countdown');
    this.initStatsView();
    this.initChangelog();
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
      this.updateSessionStatsUI();
      this.renderWorkoutHistoryChart();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      this.data.workoutHistory = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.data.workoutHistory = [];
    }
    const latest = this.data.workoutHistory[this.data.workoutHistory.length - 1];
    if (latest) {
      this.state.sessionLastDurationSec = latest.totalDurationSec || 0;
      this.state.sessionLastSets = latest.totalSets || 0;
      this.state.sessionLastAvgRestSec = latest.avgRestSec || 0;
    }
    this.updateSessionStatsUI();
    this.renderWorkoutHistoryChart();
  },

  saveWorkoutHistory() {
    localStorage.setItem('fitness_workout_history_v1', JSON.stringify(this.data.workoutHistory));
    this.renderWorkoutHistoryChart();
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
