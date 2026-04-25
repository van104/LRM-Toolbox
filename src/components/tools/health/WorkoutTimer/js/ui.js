/* eslint-disable no-undef */
// UI 辅助功能：模态框、确认框、主题、Tab导航、统计图表
// 作为 App 的 mixin，通过 Object.assign 混入
const UIModule = {
  GOALS_STORAGE_KEY: 'fitness_training_goals_v1',
  DEFAULT_TRAINING_GOALS: [
    { id: 'goal_weekly_default', type: 'weekly_workouts', target: 4, name: '每周训练次数' },
    { id: 'goal_monthly_default', type: 'monthly_minutes', target: 600, name: '每月训练总时长' },
    { id: 'goal_streak_default', type: 'streak_days', target: 7, name: '连续打卡目标' }
  ],

  // --- 路由与导航 ---
  switchTab(targetId) {
    if (this.state.focusMode && targetId === 'plan-mode') {
      targetId = 'workout-mode';
    }
    this.dom.tabs.forEach(t => {
      if (t.dataset.target === targetId) t.classList.add('tab-active', 'text-blue-600');
      else t.classList.remove('tab-active', 'text-blue-600');
    });

    this.dom.modes.forEach(m => {
      if (m.id === targetId) m.classList.add('active');
      else m.classList.remove('active');
    });

    requestAnimationFrame(() => this.updateTabIndicator());
  },

  updateTabIndicator() {
    if (!this.dom.tabIndicator || !this.dom.tabsTrack) return;
    const activeTab = Array.from(this.dom.tabs).find(tab => tab.classList.contains('tab-active'));
    if (!activeTab) return;
    const trackRect = this.dom.tabsTrack.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const width = Math.max(20, Math.round(tabRect.width * 0.45));
    const left = tabRect.left - trackRect.left + (tabRect.width - width) / 2;
    this.dom.tabIndicator.style.width = `${width}px`;
    this.dom.tabIndicator.style.transform = `translateX(${left}px)`;
  },

  // --- 会话统计 ---
  resetSessionStats() {
    this.state.sessionStartedAt = null;
    this.state.sessionRestStartedAt = null;
    this.state.sessionTotalRestMs = 0;
    this.state.sessionRestCount = 0;
    this.state.sessionCompletedSets = 0;
    this.state.sessionLastDurationSec = 0;
    this.state.sessionLastSets = 0;
    this.state.sessionLastAvgRestSec = 0;
    this.updateSessionStatsUI();
  },

  startSessionIfNeeded() {
    if (this.state.sessionStartedAt) return;
    this.state.sessionStartedAt = Date.now();
    this.updateSessionStatsUI();
  },

  startRestTracking() {
    this.state.sessionRestStartedAt = Date.now();
  },

  finishRestTracking() {
    if (!this.state.sessionRestStartedAt) return;
    const elapsed = Date.now() - this.state.sessionRestStartedAt;
    this.state.sessionRestStartedAt = null;
    if (elapsed > 0) {
      this.state.sessionTotalRestMs += elapsed;
      this.state.sessionRestCount += 1;
    }
    this.updateSessionStatsUI();
  },

  formatDurationText(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (safe % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  },

  updateSessionStatsUI() {
    if (!this.dom.sessionTotalTime && !this.dom.sessionTotalTimePage) return;
    const liveDuration = this.state.sessionStartedAt
      ? Math.max(0, Math.round((Date.now() - this.state.sessionStartedAt) / 1000))
      : 0;
    const liveAvgRest =
      this.state.sessionRestCount > 0
        ? Math.round(this.state.sessionTotalRestMs / this.state.sessionRestCount / 1000)
        : 0;
    const totalSeconds = this.state.sessionStartedAt
      ? liveDuration
      : this.state.sessionLastDurationSec;
    const totalSets = this.state.sessionStartedAt
      ? this.state.sessionCompletedSets
      : this.state.sessionLastSets;
    const avgRestSeconds = this.state.sessionStartedAt
      ? liveAvgRest
      : this.state.sessionLastAvgRestSec;
    const totalText = this.formatDurationText(totalSeconds);
    const avgText = this.formatDurationText(avgRestSeconds);
    if (this.dom.sessionTotalTime) this.dom.sessionTotalTime.textContent = totalText;
    if (this.dom.sessionTotalSets) this.dom.sessionTotalSets.textContent = totalSets;
    if (this.dom.sessionAvgRest) this.dom.sessionAvgRest.textContent = avgText;
    if (this.dom.sessionTotalTimePage) this.dom.sessionTotalTimePage.textContent = totalText;
    if (this.dom.sessionTotalSetsPage) this.dom.sessionTotalSetsPage.textContent = totalSets;
    if (this.dom.sessionAvgRestPage) this.dom.sessionAvgRestPage.textContent = avgText;
  },

  // === 多视图训练统计 ===
  initStatsView() {
    this.state.statsView = 'week'; // week | month | year
    this.state.statsOffset = 0; // 0 = 当前, -1 = 上一个, etc
    this.loadTrainingGoals();

    // Tab 切换
    document.querySelectorAll('.stats-view-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchStatsView(tab.dataset.view));
    });

    // 导航
    document
      .getElementById('stats-nav-prev')
      ?.addEventListener('click', () => this.navigateStats(-1));
    document
      .getElementById('stats-nav-next')
      ?.addEventListener('click', () => this.navigateStats(1));

    document
      .getElementById('stats-export-history')
      ?.addEventListener('click', () => this.exportWorkoutHistory());
    document.getElementById('stats-import-history')?.addEventListener('click', () => {
      document.getElementById('history-import-file-input')?.click();
    });
    document.getElementById('history-import-file-input')?.addEventListener('change', e => {
      this.importWorkoutHistory(e.target.files?.[0]);
      e.target.value = '';
    });
    document
      .getElementById('stats-goals-add')
      ?.addEventListener('click', () => this.openTrainingGoalEditor());

    // 清空历史
    document.getElementById('stats-clear-history')?.addEventListener('click', () => {
      this.confirm('清空记录', '确定清空所有训练历史记录吗？此操作不可恢复。', () => {
        this.data.workoutHistory = [];
        this.saveWorkoutHistory();
        this.renderStatsView();
        this.renderHeatmap();
      });
    });

    // 热力图
    this.state.heatmapYear = new Date().getFullYear();
    document
      .getElementById('heatmap-nav-prev')
      ?.addEventListener('click', () => this.navigateHeatmap(-1));
    document
      .getElementById('heatmap-nav-next')
      ?.addEventListener('click', () => this.navigateHeatmap(1));

    this.renderStatsView();
    this.renderHeatmap();
  },

  getTrainingGoalTypeConfig(type) {
    const configs = {
      weekly_workouts: {
        type: 'weekly_workouts',
        label: '每周训练次数',
        description: '当前自然周训练次数',
        min: 1,
        max: 14,
        accentClass: 'text-blue-600',
        progressClass: 'from-blue-500 to-blue-400'
      },
      monthly_minutes: {
        type: 'monthly_minutes',
        label: '每月训练总时长',
        description: '当前自然月累计训练时长',
        min: 30,
        max: 43200,
        accentClass: 'text-teal-600',
        progressClass: 'from-teal-500 to-emerald-400'
      },
      streak_days: {
        type: 'streak_days',
        label: '连续打卡目标',
        description: '按当前连续训练天数计算',
        min: 1,
        max: 365,
        accentClass: 'text-amber-600',
        progressClass: 'from-amber-500 to-orange-400'
      }
    };
    return configs[type] || configs.weekly_workouts;
  },

  normalizeTrainingGoal(goal, index = 0) {
    if (!goal || typeof goal !== 'object') return null;
    const config = this.getTrainingGoalTypeConfig(goal.type);
    const target = Math.min(config.max, Math.max(config.min, parseInt(goal.target) || config.min));
    const name = String(goal.name || config.label).trim() || config.label;
    return {
      id: goal.id ? String(goal.id) : `goal_${config.type}_${Date.now()}_${index}`,
      type: config.type,
      target,
      name
    };
  },

  normalizeTrainingGoals(goals) {
    if (Array.isArray(goals)) {
      return goals.map((goal, index) => this.normalizeTrainingGoal(goal, index)).filter(Boolean);
    }

    const safe = goals && typeof goals === 'object' ? goals : null;
    if (!safe) {
      return this.DEFAULT_TRAINING_GOALS.map((goal, index) =>
        this.normalizeTrainingGoal(goal, index)
      );
    }

    if ('weeklyWorkouts' in safe || 'monthlyMinutes' in safe || 'streakDays' in safe) {
      return [
        this.normalizeTrainingGoal(
          {
            id: 'goal_weekly_default',
            type: 'weekly_workouts',
            target: safe.weeklyWorkouts,
            name: '每周训练次数'
          },
          0
        ),
        this.normalizeTrainingGoal(
          {
            id: 'goal_monthly_default',
            type: 'monthly_minutes',
            target: safe.monthlyMinutes,
            name: '每月训练总时长'
          },
          1
        ),
        this.normalizeTrainingGoal(
          {
            id: 'goal_streak_default',
            type: 'streak_days',
            target: safe.streakDays,
            name: '连续打卡目标'
          },
          2
        )
      ].filter(Boolean);
    }

    return this.DEFAULT_TRAINING_GOALS.map((goal, index) =>
      this.normalizeTrainingGoal(goal, index)
    );
  },

  loadTrainingGoals() {
    const raw = localStorage.getItem(this.GOALS_STORAGE_KEY);
    if (!raw) {
      this.state.trainingGoals = this.normalizeTrainingGoals(this.DEFAULT_TRAINING_GOALS);
      return;
    }
    try {
      this.state.trainingGoals = this.normalizeTrainingGoals(JSON.parse(raw));
    } catch {
      this.state.trainingGoals = this.normalizeTrainingGoals(this.DEFAULT_TRAINING_GOALS);
    }
  },

  saveTrainingGoals() {
    this.state.trainingGoals = this.normalizeTrainingGoals(this.state.trainingGoals);
    localStorage.setItem(this.GOALS_STORAGE_KEY, JSON.stringify(this.state.trainingGoals));
    this.renderTrainingGoals();
  },

  getTrainingGoalTypePromptDefault(type) {
    const configs = ['weekly_workouts', 'monthly_minutes', 'streak_days'];
    const index = Math.max(0, configs.indexOf(type));
    return String(index + 1);
  },

  parseTrainingGoalType(value) {
    const input = String(value || '')
      .trim()
      .toLowerCase();
    if (input === '1' || input === 'weekly' || input === 'week' || input === 'weekly_workouts') {
      return 'weekly_workouts';
    }
    if (input === '2' || input === 'monthly' || input === 'month' || input === 'monthly_minutes') {
      return 'monthly_minutes';
    }
    if (input === '3' || input === 'streak' || input === 'streak_days') {
      return 'streak_days';
    }
    return '';
  },

  openTrainingGoalEditor(goalId = '') {
    const currentGoals = this.normalizeTrainingGoals(this.state.trainingGoals);
    const editingGoal = goalId ? currentGoals.find(goal => goal.id === goalId) : null;
    const afterPrompt = callback => setTimeout(callback, 320);

    const askType = defaultValue => {
      this.prompt(
        editingGoal ? '编辑目标类型' : '目标类型',
        '输入 1 每周训练次数 / 2 每月训练总时长(分钟) / 3 连续打卡天数',
        defaultValue,
        typeValue => {
          const type = this.parseTrainingGoalType(typeValue);
          if (!type) {
            this.confirm('提示', '请输入有效的目标类型：1、2 或 3。', () => {
              afterPrompt(() => askType(typeValue || defaultValue));
            });
            return;
          }
          const config = this.getTrainingGoalTypeConfig(type);
          afterPrompt(() => askTarget(type, editingGoal?.target || config.min));
        }
      );
    };

    const askTarget = (type, defaultValue) => {
      const config = this.getTrainingGoalTypeConfig(type);
      const placeholder =
        type === 'monthly_minutes'
          ? `请输入目标值（分钟，${config.min}-${config.max}）`
          : `请输入目标值（${config.min}-${config.max}）`;
      this.prompt(
        editingGoal ? '编辑目标数值' : '目标数值',
        placeholder,
        String(defaultValue),
        value => {
          const target = parseInt(value);
          if (!Number.isFinite(target) || target < config.min || target > config.max) {
            const limitText =
              type === 'monthly_minutes'
                ? `请输入有效的目标时长（${config.min}-${config.max} 分钟）。`
                : `请输入有效的目标数值（${config.min}-${config.max}）。`;
            this.confirm('提示', limitText, () => {
              afterPrompt(() => askTarget(type, value || defaultValue));
            });
            return;
          }
          afterPrompt(() => askName(type, target, editingGoal?.name || config.label));
        }
      );
    };

    const askName = (type, target, defaultValue) => {
      const config = this.getTrainingGoalTypeConfig(type);
      this.prompt(
        editingGoal ? '编辑目标名称' : '目标名称',
        '请输入自定义名称，可留空使用默认名称',
        String(defaultValue),
        nameValue => {
          const finalGoal = this.normalizeTrainingGoal(
            {
              id: editingGoal?.id || '',
              type,
              target,
              name: String(nameValue || '').trim() || config.label
            },
            currentGoals.length
          );
          if (!finalGoal) return;

          if (editingGoal) {
            this.state.trainingGoals = currentGoals.map(goal =>
              goal.id === editingGoal.id ? finalGoal : goal
            );
          } else {
            this.state.trainingGoals = [...currentGoals, finalGoal];
          }
          this.saveTrainingGoals();
          afterPrompt(() => {
            this.confirm(
              editingGoal ? '目标已更新' : '目标已添加',
              editingGoal
                ? '训练目标已更新，统计页会实时显示最新进度。'
                : '新的训练目标已添加，统计页会实时显示最新进度。'
            );
          });
        }
      );
    };

    askType(this.getTrainingGoalTypePromptDefault(editingGoal?.type || 'weekly_workouts'));
  },

  deleteTrainingGoal(goalId) {
    const goals = this.normalizeTrainingGoals(this.state.trainingGoals);
    const targetGoal = goals.find(goal => goal.id === goalId);
    if (!targetGoal) return;
    this.confirm('删除目标', `确定删除目标“${targetGoal.name}”吗？`, () => {
      this.state.trainingGoals = goals.filter(goal => goal.id !== goalId);
      this.saveTrainingGoals();
    });
  },

  switchStatsView(view) {
    this.state.statsView = view;
    this.state.statsOffset = 0;

    // 更新 Tab UI
    const tabs = document.querySelectorAll('.stats-view-tab');
    const indicator = document.getElementById('stats-view-indicator');
    tabs.forEach((tab, idx) => {
      if (tab.dataset.view === view) {
        tab.classList.add('text-blue-600');
        tab.classList.remove('text-slate-400');
        if (indicator) {
          indicator.style.width = `${100 / tabs.length}%`;
          indicator.style.transform = `translateX(${idx * 100}%)`;
        }
      } else {
        tab.classList.remove('text-blue-600');
        tab.classList.add('text-slate-400');
      }
    });

    this.renderStatsView();
  },

  navigateStats(direction) {
    this.state.statsOffset += direction;
    // 不允许看未来
    if (this.state.statsOffset > 0) this.state.statsOffset = 0;
    this.renderStatsView();
  },

  // 计算时间范围
  getStatsPeriod() {
    const now = new Date();
    const view = this.state.statsView;
    const offset = this.state.statsOffset;

    if (view === 'week') {
      const dayOfWeek = now.getDay() || 7; // 周一为1
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1 + offset * 7);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday, end: sunday, slots: 7 };
    }
    if (view === 'month') {
      const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const start = new Date(target.getFullYear(), target.getMonth(), 1);
      const end = new Date(target.getFullYear(), target.getMonth() + 1, 0, 23, 59, 59, 999);
      const daysInMonth = end.getDate();
      return { start, end, slots: daysInMonth };
    }
    // year
    const targetYear = now.getFullYear() + offset;
    const start = new Date(targetYear, 0, 1);
    const end = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    return { start, end, slots: 12 };
  },

  // 格式化时间范围标签
  formatPeriodLabel() {
    const period = this.getStatsPeriod();
    const view = this.state.statsView;
    const offset = this.state.statsOffset;
    const fmtDate = d => d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });

    if (view === 'week') {
      const label = offset === 0 ? '本周' : offset === -1 ? '上周' : `${Math.abs(offset)}周前`;
      return { label, range: `${fmtDate(period.start)} - ${fmtDate(period.end)}` };
    }
    if (view === 'month') {
      const label =
        offset === 0
          ? '本月'
          : offset === -1
            ? '上月'
            : period.start.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
      const range = `${fmtDate(period.start)} - ${fmtDate(period.end)}`;
      return { label, range };
    }
    const year = period.start.getFullYear();
    const label = offset === 0 ? '今年' : `${year}年`;
    return { label, range: `${year}.01 - ${year}.12` };
  },

  // 将记录按时间段聚合
  aggregateHistory(period) {
    const { start, end, slots } = period;
    const view = this.state.statsView;
    const filtered = this.data.workoutHistory.filter(item => {
      const d = new Date(item.endedAt);
      return d >= start && d <= end;
    });

    // 创建聚合桶
    const buckets = Array.from({ length: slots }, () => ({
      totalSec: 0,
      totalSets: 0,
      count: 0,
      totalRestSec: 0,
      restCount: 0
    }));

    filtered.forEach(item => {
      const d = new Date(item.endedAt);
      let idx;
      if (view === 'week') {
        idx = (d.getDay() || 7) - 1; // 周一=0
      } else if (view === 'month') {
        idx = d.getDate() - 1;
      } else {
        idx = d.getMonth();
      }
      if (idx >= 0 && idx < slots) {
        buckets[idx].totalSec += item.totalDurationSec || 0;
        buckets[idx].totalSets += item.totalSets || 0;
        buckets[idx].count += 1;
        buckets[idx].totalRestSec += item.avgRestSec || 0;
        buckets[idx].restCount += 1;
      }
    });

    return { filtered, buckets };
  },

  // 获取柱状图标签
  getBarLabels(period) {
    const view = this.state.statsView;
    if (view === 'week') {
      return ['一', '二', '三', '四', '五', '六', '日'];
    }
    if (view === 'month') {
      return Array.from({ length: period.slots }, (_, i) => String(i + 1));
    }
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  },

  // 计算连续训练天数
  calculateStreak() {
    if (!this.data.workoutHistory.length) return 0;
    const dateSet = new Set();
    this.data.workoutHistory.forEach(item => {
      const d = new Date(item.endedAt);
      dateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });

    let streak = 0;
    const today = new Date();
    const check = new Date(today);
    // 检查今天是否有训练
    const todayKey = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
    if (!dateSet.has(todayKey)) {
      // 昨天开始检查
      check.setDate(check.getDate() - 1);
    }
    while (true) {
      const key = `${check.getFullYear()}-${check.getMonth()}-${check.getDate()}`;
      if (dateSet.has(key)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  },

  getCurrentWeekWorkoutCount() {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return this.data.workoutHistory.filter(item => {
      const endedAt = new Date(item.endedAt);
      return endedAt >= start && endedAt <= end;
    }).length;
  },

  getCurrentMonthDurationSec() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.data.workoutHistory.reduce((total, item) => {
      const endedAt = new Date(item.endedAt);
      if (endedAt >= start && endedAt <= end) {
        return total + (item.totalDurationSec || 0);
      }
      return total;
    }, 0);
  },

  renderTrainingGoals(streak = this.calculateStreak()) {
    const container = document.getElementById('training-goals-list');
    if (!container) return;

    const goals = this.normalizeTrainingGoals(this.state.trainingGoals);
    this.state.trainingGoals = goals;
    const weeklyCount = this.getCurrentWeekWorkoutCount();
    const monthlyDurationSec = this.getCurrentMonthDurationSec();
    if (!goals.length) {
      container.innerHTML = `
        <div class="rounded-xl bg-white px-4 py-6 border border-dashed border-slate-200 text-center">
          <div class="text-xs font-semibold text-slate-500">暂无训练目标</div>
          <div class="text-[11px] text-slate-400 mt-1">点击右上角添加你的第一个训练目标</div>
        </div>
      `;
      return;
    }

    const currentMetrics = {
      weekly_workouts: weeklyCount,
      monthly_minutes: monthlyDurationSec,
      streak_days: streak
    };

    container.innerHTML = goals
      .map(goal => {
        const config = this.getTrainingGoalTypeConfig(goal.type);
        const currentValue = currentMetrics[goal.type] || 0;
        const targetValue = goal.type === 'monthly_minutes' ? goal.target * 60 : goal.target;
        const percent = Math.min(100, Math.round((currentValue / Math.max(1, targetValue)) * 100));
        let statusText = '未开始';
        let statusClass = 'text-[11px] font-bold text-slate-400';
        if (percent >= 100) {
          statusText = '已完成';
          statusClass = 'text-[11px] font-bold text-green-600';
        } else if (currentValue > 0) {
          statusText = `进行中 ${percent}%`;
          statusClass = `text-[11px] font-bold ${config.accentClass}`;
        }

        const metaText =
          goal.type === 'monthly_minutes'
            ? `本月 ${this.formatDurationText(currentValue)} / ${this.formatDurationText(targetValue)}`
            : goal.type === 'weekly_workouts'
              ? `本周 ${currentValue} / ${goal.target} 次`
              : `当前 ${currentValue} / ${goal.target} 天`;

        return `
          <div class="rounded-xl bg-white px-4 py-3 border border-slate-100">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="min-w-0">
                <div class="text-xs font-bold text-slate-700 truncate">${goal.name}</div>
                <div class="text-[11px] text-slate-400 mt-0.5">${config.description}</div>
                <div class="text-[11px] text-slate-400 mt-1">${metaText}</div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="${statusClass}">${statusText}</div>
                <button
                  class="training-goal-edit w-7 h-7 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  data-goal-id="${goal.id}"
                  title="编辑目标"
                >
                  <i class="fa-solid fa-pen text-[10px]"></i>
                </button>
                <button
                  class="training-goal-delete w-7 h-7 rounded-full bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  data-goal-id="${goal.id}"
                  title="删除目标"
                >
                  <i class="fa-solid fa-trash text-[10px]"></i>
                </button>
              </div>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-full rounded-full bg-gradient-to-r ${config.progressClass} transition-all duration-500"
                style="width: ${percent}%"
              ></div>
            </div>
          </div>
        `;
      })
      .join('');

    container.querySelectorAll('.training-goal-edit').forEach(btn => {
      btn.addEventListener('click', () => this.openTrainingGoalEditor(btn.dataset.goalId));
    });
    container.querySelectorAll('.training-goal-delete').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTrainingGoal(btn.dataset.goalId));
    });
  },

  // 主渲染函数
  renderStatsView() {
    const period = this.getStatsPeriod();
    const { label, range } = this.formatPeriodLabel();
    const { filtered, buckets } = this.aggregateHistory(period);
    const labels = this.getBarLabels(period);

    // 更新导航标签
    const labelEl = document.getElementById('stats-period-label');
    const rangeEl = document.getElementById('stats-period-range');
    if (labelEl) labelEl.textContent = label;
    if (rangeEl) rangeEl.textContent = range;

    // 汇总统计
    const totalCount = filtered.length;
    const totalSec = filtered.reduce((s, i) => s + (i.totalDurationSec || 0), 0);
    const totalSets = filtered.reduce((s, i) => s + (i.totalSets || 0), 0);
    const avgSec = totalCount > 0 ? Math.round(totalSec / totalCount) : 0;
    const avgRestAll = filtered.reduce((s, i) => s + (i.avgRestSec || 0), 0);
    const avgRest = totalCount > 0 ? Math.round(avgRestAll / totalCount) : 0;
    const streak = this.calculateStreak();

    // 更新统计卡片
    const el = (id, val) => {
      const e = document.getElementById(id);
      if (e) e.textContent = val;
    };
    el('stats-workout-count', totalCount);
    el('stats-total-time', this.formatDurationText(totalSec));
    el('stats-total-sets', totalSets);
    el('stats-avg-time', this.formatDurationText(avgSec));
    el('stats-streak', streak);
    el('stats-avg-rest', this.formatDurationText(avgRest));
    el('stats-chart-summary', totalCount > 0 ? `共 ${totalCount} 次训练` : '');
    this.renderTrainingGoals(streak);

    // 禁用未来导航
    const nextBtn = document.getElementById('stats-nav-next');
    if (nextBtn) {
      nextBtn.disabled = this.state.statsOffset >= 0;
      nextBtn.classList.toggle('opacity-30', this.state.statsOffset >= 0);
      nextBtn.classList.toggle('pointer-events-none', this.state.statsOffset >= 0);
    }

    // 渲染图表
    this.renderStatsChart(buckets, labels, filtered.length === 0);

    // 渲染训练记录列表
    this.renderHistoryList(filtered);
  },

  renderStatsChart(buckets, labels, isEmpty) {
    const chartEmpty = document.getElementById('stats-chart-empty');
    const chartContainer = document.getElementById('stats-chart-container');
    const chartBars = document.getElementById('stats-chart-bars');

    if (!chartEmpty || !chartContainer || !chartBars) return;

    if (isEmpty) {
      chartEmpty.classList.remove('hidden');
      chartContainer.classList.add('hidden');
      chartBars.innerHTML = '';
      return;
    }

    chartEmpty.classList.add('hidden');
    chartContainer.classList.remove('hidden');

    const maxSec = Math.max(...buckets.map(b => b.totalSec), 60);
    const view = this.state.statsView;
    // 月视图显示太多柱子，缩小间距
    const isMonth = view === 'month';
    const barWidth = isMonth ? 'w-2' : 'w-4';
    const labelSize = isMonth ? 'text-[7px]' : 'text-[10px]';
    const showLabel = idx => {
      if (view === 'week') return true;
      if (view === 'year') return true;
      // 月视图只显示 1, 5, 10, 15, 20, 25, 末尾
      return idx === 0 || (idx + 1) % 5 === 0 || idx === buckets.length - 1;
    };

    chartBars.innerHTML = buckets
      .map((bucket, idx) => {
        const h =
          bucket.totalSec > 0 ? Math.max(6, Math.round((bucket.totalSec / maxSec) * 100)) : 0;
        const hasData = bucket.count > 0;
        const timeText = this.formatDurationText(bucket.totalSec);
        return `
          <div class="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
            <div class="h-40 w-full flex items-end justify-center">
              ${
                hasData
                  ? `<div class="history-bar ${barWidth} rounded-t-md bg-gradient-to-t from-blue-600 to-blue-300 cursor-pointer transition-all hover:opacity-80"
                       style="height: ${h}%"
                       data-chart-date="${labels[idx]}"
                       data-chart-time="${timeText}"
                       data-chart-sets="${bucket.totalSets}"
                       data-chart-plan="${bucket.count}次训练"></div>`
                  : `<div class="${barWidth} rounded-t-md bg-slate-100" style="height: 4%"></div>`
              }
            </div>
            ${showLabel(idx) ? `<div class="${labelSize} text-slate-400 truncate">${labels[idx]}</div>` : '<div class="h-3"></div>'}
          </div>
        `;
      })
      .join('');

    // 绑定 tooltip
    chartBars.querySelectorAll('.history-bar').forEach(bar => {
      bar.addEventListener('mouseenter', e => this.showChartTooltip(e, bar));
      bar.addEventListener('mousemove', e => this.positionChartTooltip(e));
      bar.addEventListener('mouseleave', () => this.hideChartTooltip());
      bar.addEventListener(
        'touchstart',
        e => {
          e.preventDefault();
          this.showChartTooltip(e.touches[0], bar);
        },
        { passive: false }
      );
      bar.addEventListener('touchend', () => this.hideChartTooltip());
    });
  },

  renderHistoryList(filtered) {
    const listEl = document.getElementById('stats-history-list');
    if (!listEl) return;

    if (!filtered.length) {
      listEl.innerHTML = '<div class="py-6 text-center text-xs text-slate-400">暂无训练记录</div>';
      return;
    }

    // 按时间倒序，最多显示 20 条
    const items = [...filtered]
      .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
      .slice(0, 20);

    listEl.innerHTML = items
      .map(item => {
        const d = new Date(item.endedAt);
        const date = d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
        const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const duration = this.formatDurationText(item.totalDurationSec || 0);
        const planName = item.planTitle || '自由训练';

        return `
        <div class="flex flex-col bg-slate-50 rounded-xl px-3 py-2.5 hover:bg-slate-100 transition-colors group">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-dumbbell text-blue-500 text-xs"></i>
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-slate-700 truncate">${planName}</div>
                <div class="text-[10px] text-slate-400">${date} ${time}</div>
              </div>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
              <span class="tabular-nums"><i class="fa-regular fa-clock mr-1"></i>${duration}</span>
              <span class="tabular-nums"><i class="fa-solid fa-layer-group mr-1"></i>${item.totalSets || 0}组</span>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  },

  // 兼容旧调用
  renderWorkoutHistoryChart() {
    this.renderStatsView();
  },

  showChartTooltip(e, bar) {
    const tooltip = document.getElementById('chart-tooltip');
    const textEl = document.getElementById('chart-tooltip-text');
    if (!tooltip || !textEl) return;
    const date = bar.dataset.chartDate;
    const time = bar.dataset.chartTime;
    const sets = bar.dataset.chartSets;
    const plan = bar.dataset.chartPlan;
    let text = `${date}  ⏱ ${time}  ·  ${sets}组`;
    if (plan) text += `  ·  ${plan}`;
    textEl.textContent = text;
    tooltip.classList.remove('hidden');
    this.positionChartTooltip(e);
  },

  positionChartTooltip(e) {
    const tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) return;
    const x = (e.clientX || e.pageX) - tooltip.offsetWidth / 2;
    const y = (e.clientY || e.pageY) - tooltip.offsetHeight - 12;
    tooltip.style.left = `${Math.max(4, x)}px`;
    tooltip.style.top = `${Math.max(4, y)}px`;
  },

  hideChartTooltip() {
    const tooltip = document.getElementById('chart-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
  },

  // --- 主题与专注模式 ---
  loadUiPrefs() {
    const raw = localStorage.getItem('fitness_ui_prefs_v1');
    if (!raw) {
      this.applyTheme(this.state.theme);
      this.applyFocusMode(this.state.focusMode);
      return;
    }
    try {
      const prefs = JSON.parse(raw);
      const theme = prefs.theme === 'dark' ? 'dark' : 'light';
      const focusMode = Boolean(prefs.focusMode);
      this.applyTheme(theme);
      this.applyFocusMode(focusMode);
    } catch {
      this.applyTheme('light');
      this.applyFocusMode(false);
    }
  },

  saveUiPrefs() {
    localStorage.setItem(
      'fitness_ui_prefs_v1',
      JSON.stringify({
        theme: this.state.theme,
        focusMode: this.state.focusMode
      })
    );
  },

  applyTheme(theme) {
    this.state.theme = theme === 'dark' ? 'dark' : 'light';
    document.body.classList.toggle('theme-dark', this.state.theme === 'dark');
    this.dom.themeToggle.innerHTML =
      this.state.theme === 'dark'
        ? '<i class="fa-solid fa-sun text-sm"></i>'
        : '<i class="fa-solid fa-moon text-sm"></i>';
    this.dom.themeToggle.classList.toggle('text-blue-600', this.state.theme === 'dark');
  },

  applyFocusMode(enabled) {
    this.state.focusMode = Boolean(enabled);
    document.body.classList.toggle('focus-mode', this.state.focusMode);
    this.dom.focusToggle.classList.toggle('text-blue-600', this.state.focusMode);
    this.dom.focusToggle.innerHTML = this.state.focusMode
      ? '<i class="fa-solid fa-bullseye text-sm"></i>'
      : '<i class="fa-solid fa-crosshairs text-sm"></i>';
    if (this.state.focusMode) {
      const activeTab = document.querySelector('.nav-tab.tab-active');
      if (activeTab?.dataset.target === 'plan-mode') {
        this.switchTab('workout-mode');
      }
    }
    requestAnimationFrame(() => this.updateTabIndicator());
  },

  // --- 模板模态框 ---
  openTemplateModal() {
    this.renderTemplateList();
    this.dom.templateModal.classList.remove('hidden');
    setTimeout(() => {
      this.dom.templateBackdrop.classList.remove('opacity-0');
      this.dom.templatePanel.classList.remove('translate-y-full');
    }, 10);
  },

  closeTemplateModal() {
    this.dom.templateBackdrop.classList.add('opacity-0');
    this.dom.templatePanel.classList.add('translate-y-full');
    setTimeout(() => {
      this.dom.templateModal.classList.add('hidden');
    }, 300);
  },

  renderTemplateList() {
    const templates = PlanTemplates.getAll();
    this.dom.templateList.innerHTML = templates
      .map(
        tpl => `
                <div class="border border-slate-100 rounded-2xl p-4 hover:border-blue-200 transition-colors">
                  <div class="flex justify-between items-start gap-4">
                    <div>
                      <div class="font-bold text-slate-800">${tpl.name}</div>
                      <div class="text-xs text-slate-500 mt-1">${tpl.description}</div>
                      <div class="text-[11px] text-slate-400 mt-2">动作数 ${tpl.plan.exercises.length} · 训练日 ${tpl.plan.days.join(' / ')}</div>
                    </div>
                    <button data-template-id="${tpl.id}" class="template-apply-btn text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                      一键套用
                    </button>
                  </div>
                </div>
              `
      )
      .join('');
    this.dom.templateList.querySelectorAll('.template-apply-btn').forEach(btn => {
      btn.addEventListener('click', () => this.applyTemplate(btn.dataset.templateId));
    });
  },

  applyTemplate(templateId) {
    const template = PlanTemplates.getAll().find(tpl => tpl.id === templateId);
    if (!template) return;
    const normalized = DataManager.normalizePlan(template.plan, `tpl_${templateId}`);
    normalized.id = `tpl_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.data.plans.push(normalized);
    this.saveData();
    this.closeTemplateModal();
    this.switchTab('plan-mode');
    this.confirm('模板已套用', `已新增计划：${normalized.title}`);
  },

  // --- 导出格式模态框 ---
  openExportFormatModal() {
    this.state.exportFormat = 'json';
    this.updateExportFormatButtons();
    // 填充默认文件名
    const defaultName = `workout_plans_${new Date().toISOString().split('T')[0]}`;
    if (this.dom.exportFilenameInput) {
      this.dom.exportFilenameInput.value = defaultName;
    }
    this.dom.exportFormatModal.classList.remove('hidden');
    this.dom.exportFormatModal.classList.add('flex');
    void this.dom.exportFormatModal.offsetHeight;
    this.dom.exportFormatModal.classList.add('active');
    // 聚焦并选中文件名
    setTimeout(() => {
      if (this.dom.exportFilenameInput) {
        this.dom.exportFilenameInput.focus();
        this.dom.exportFilenameInput.select();
      }
    }, 100);
  },

  closeExportFormatModal() {
    this.dom.exportFormatModal.classList.remove('active');
    setTimeout(() => {
      this.dom.exportFormatModal.classList.add('hidden');
      this.dom.exportFormatModal.classList.remove('flex');
    }, 300);
  },

  setExportFormat(format) {
    if (format !== 'json' && format !== 'csv') return;
    this.state.exportFormat = format;
    this.updateExportFormatButtons();
  },

  updateExportFormatButtons() {
    const setActive = (btn, active) => {
      btn.classList.toggle('border-blue-500', active);
      btn.classList.toggle('bg-blue-50', active);
      btn.classList.toggle('text-blue-600', active);
      btn.classList.toggle('border-slate-200', !active);
      btn.classList.toggle('bg-slate-50', !active);
      btn.classList.toggle('text-slate-600', !active);
    };
    setActive(this.dom.exportFormatJsonBtn, this.state.exportFormat === 'json');
    setActive(this.dom.exportFormatCsvBtn, this.state.exportFormat === 'csv');
  },

  // --- 自定义确认框 ---
  confirm(title, message, onOk, onCancel, options = {}) {
    this.dom.confirmTitle.textContent = title;
    this.dom.confirmMsg.textContent = message;
    const isAlert = typeof onOk !== 'function';
    const okText = options.okText || (isAlert ? '我知道了' : '确定');
    const cancelText = options.cancelText || '取消';
    this.dom.confirmCancel.classList.toggle('hidden', isAlert);
    this.dom.confirmOk.textContent = okText;
    this.dom.confirmCancel.textContent = cancelText;
    this.dom.confirmOk.classList.toggle('flex-1', !isAlert);
    this.dom.confirmOk.classList.toggle('w-full', isAlert);
    this.dom.confirmModal.classList.remove('hidden');
    this.dom.confirmModal.classList.add('flex');

    void this.dom.confirmModal.offsetHeight;
    this.dom.confirmModal.classList.add('active');

    const cleanup = () => {
      this.dom.confirmModal.classList.remove('active');
      setTimeout(() => {
        this.dom.confirmModal.classList.add('hidden');
        this.dom.confirmModal.classList.remove('flex');
      }, 300);
    };

    this.dom.confirmOk.onclick = () => {
      cleanup();
      if (!isAlert) onOk();
    };

    this.dom.confirmCancel.onclick = () => {
      cleanup();
      if (!isAlert && typeof onCancel === 'function') onCancel();
    };
    this.dom.confirmBackdrop.onclick = () => {
      cleanup();
      if (!isAlert && typeof onCancel === 'function' && options.backdropAsCancel !== false) {
        onCancel();
      }
    };
  },

  prompt(title, message, defaultValue, onOk) {
    this.dom.promptTitle.textContent = title;
    this.dom.promptInput.placeholder = message;
    this.dom.promptInput.value = defaultValue || '';
    this.dom.promptModal.classList.remove('hidden');
    this.dom.promptModal.classList.add('flex');

    void this.dom.promptModal.offsetHeight;
    this.dom.promptModal.classList.add('active');

    const cleanup = () => {
      this.dom.promptModal.classList.remove('active');
      setTimeout(() => {
        this.dom.promptModal.classList.add('hidden');
        this.dom.promptModal.classList.remove('flex');
      }, 300);
    };

    this.dom.promptOk.onclick = () => {
      const val = this.dom.promptInput.value;
      cleanup();
      if (onOk) onOk(val);
    };

    this.dom.promptCancel.onclick = cleanup;
    this.dom.promptBackdrop.onclick = cleanup;

    setTimeout(() => {
      this.dom.promptInput.focus();
      this.dom.promptInput.select();
    }, 100);
  },

  // --- 辅助函数 ---
  clearInterval() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }
  },

  updateTimerDisplay(seconds) {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    this.dom.timerDisplay.textContent = `${m}:${s}`;
  },

  setProgress(percent) {
    const circle = this.dom.ringCircle;
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  },

  updateCounters() {
    const plan = this.state.currentPlan;
    if (!plan) return;

    const currentEx = plan.exercises[this.state.currentExerciseIdx];
    this.dom.setCounter.textContent = `${this.state.currentSet}/${currentEx.sets}`;
    this.dom.exCounter.textContent = `${this.state.currentExerciseIdx + 1}/${plan.exercises.length}`;

    const totalSets = plan.exercises.reduce((sum, ex) => {
      return sum + (parseInt(ex.sets) || 0);
    }, 0);

    let finishedSetsBefore = 0;
    for (let i = 0; i < this.state.currentExerciseIdx; i++) {
      finishedSetsBefore += parseInt(plan.exercises[i].sets) || 0;
    }

    const finishedInCurrent = Math.max(
      0,
      Math.min(this.state.currentSet - 1, parseInt(currentEx.sets) || 0)
    );

    const finishedTotal = finishedSetsBefore + finishedInCurrent;
    const percent = totalSets > 0 ? (finishedTotal / totalSets) * 100 : 0;
    this.dom.overallProgress.style.width = `${percent}%`;
  },

  // === 训练日历热力图 ===
  navigateHeatmap(direction) {
    this.state.heatmapYear += direction;
    const now = new Date();
    if (this.state.heatmapYear > now.getFullYear()) {
      this.state.heatmapYear = now.getFullYear();
    }
    this.renderHeatmap();
  },

  renderHeatmap() {
    const year = this.state.heatmapYear;
    const now = new Date();
    const currentYear = now.getFullYear();

    // 更新年份标签
    const yearLabel = document.getElementById('heatmap-year-label');
    if (yearLabel) yearLabel.textContent = year;

    // 禁用未来导航
    const nextBtn = document.getElementById('heatmap-nav-next');
    if (nextBtn) {
      const disabled = year >= currentYear;
      nextBtn.disabled = disabled;
      nextBtn.classList.toggle('opacity-30', disabled);
      nextBtn.classList.toggle('pointer-events-none', disabled);
    }

    // 构建该年每天的数据映射 dateKey -> { count, totalSec, totalSets }
    const dayMap = {};
    this.data.workoutHistory.forEach(item => {
      const d = new Date(item.endedAt);
      if (d.getFullYear() !== year) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!dayMap[key]) dayMap[key] = { count: 0, totalSec: 0, totalSets: 0 };
      dayMap[key].count += 1;
      dayMap[key].totalSec += item.totalDurationSec || 0;
      dayMap[key].totalSets += item.totalSets || 0;
    });

    // 计算强度等级 (0-4)
    const maxCount = Math.max(1, ...Object.values(dayMap).map(v => v.count));
    const getLevel = count => {
      if (count === 0) return 0;
      if (maxCount <= 1) return count > 0 ? 3 : 0;
      const ratio = count / maxCount;
      if (ratio <= 0.25) return 1;
      if (ratio <= 0.5) return 2;
      if (ratio <= 0.75) return 3;
      return 4;
    };

    const levelColors = [
      'bg-slate-100 dark:bg-slate-700',
      'bg-green-200 dark:bg-green-900',
      'bg-green-400 dark:bg-green-700',
      'bg-green-600 dark:bg-green-500',
      'bg-green-800 dark:bg-green-400'
    ];

    // 生成该年的所有日期 (1月1日 ~ 12月31日 或到今天)
    const startDate = new Date(year, 0, 1);
    const endDate = year === currentYear ? now : new Date(year, 11, 31);

    // 按周分组（每列一周，周一开头）
    const weeks = [];
    let currentWeek = new Array(7).fill(null);

    // 填充第一周前面的空格
    const startDow = (startDate.getDay() || 7) - 1; // 周一=0
    for (let i = 0; i < startDow; i++) {
      currentWeek[i] = null;
    }

    const d = new Date(startDate);
    while (d <= endDate) {
      const dow = (d.getDay() || 7) - 1;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const data = dayMap[key] || null;
      currentWeek[dow] = {
        date: new Date(d),
        key,
        data,
        count: data ? data.count : 0,
        level: getLevel(data ? data.count : 0)
      };

      if (dow === 6) {
        weeks.push(currentWeek);
        currentWeek = new Array(7).fill(null);
      }
      d.setDate(d.getDate() + 1);
    }
    // 最后一个不完整周
    if (currentWeek.some(c => c !== null)) {
      weeks.push(currentWeek);
    }

    // 渲染星期标签
    const dayLabelsEl = document.getElementById('heatmap-day-labels');
    if (dayLabelsEl) {
      const dayNames = ['一', '', '三', '', '五', '', '日'];
      dayLabelsEl.innerHTML = dayNames
        .map(
          name =>
            `<div class="w-3 h-3 flex items-center justify-center text-[8px] text-slate-400 font-medium">${name}</div>`
        )
        .join('');
    }

    // 渲染月份标签
    const monthLabelsEl = document.getElementById('heatmap-month-labels');
    if (monthLabelsEl) {
      const monthNames = [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月'
      ];
      // 计算每个月在第几周开始
      const monthPositions = [];
      let lastMonth = -1;
      weeks.forEach((week, weekIdx) => {
        for (const cell of week) {
          if (cell && cell.date) {
            const m = cell.date.getMonth();
            if (m !== lastMonth) {
              monthPositions.push({ month: m, weekIdx });
              lastMonth = m;
            }
            break;
          }
        }
      });

      // 生成标签 HTML
      let labelsHtml = '';
      let lastWeekIdx = 0;
      monthPositions.forEach(({ month, weekIdx }) => {
        const gap = weekIdx - lastWeekIdx;
        if (gap > 0) {
          labelsHtml += `<div style="width: ${gap * 14 - 2}px" class="flex-shrink-0"></div>`;
        }
        labelsHtml += `<div class="text-[8px] text-slate-400 font-medium flex-shrink-0">${monthNames[month]}</div>`;
        lastWeekIdx = weekIdx;
      });
      monthLabelsEl.innerHTML = labelsHtml;
    }

    // 渲染网格
    const gridEl = document.getElementById('heatmap-grid');
    if (gridEl) {
      gridEl.innerHTML = weeks
        .map(week => {
          const cells = week
            .map(cell => {
              if (!cell) return '<div class="w-3 h-3"></div>';
              const colorClass = levelColors[cell.level];
              const dateStr = cell.date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
              });
              let title = `${dateStr}：无训练`;
              if (cell.data) {
                const time = this.formatDurationText(cell.data.totalSec);
                title = `${dateStr}：${cell.data.count}次训练，${time}，${cell.data.totalSets}组`;
              }
              return `<div class="w-3 h-3 rounded-sm ${colorClass} cursor-pointer transition-all hover:scale-125 hover:ring-1 hover:ring-offset-1 hover:ring-green-400 heatmap-cell"
                       title="${title}"
                       data-date="${cell.key}"
                       data-count="${cell.count}"></div>`;
            })
            .join('');
          return `<div class="flex flex-col gap-0.5">${cells}</div>`;
        })
        .join('');

      // 绑定 tooltip
      gridEl.querySelectorAll('.heatmap-cell').forEach(cell => {
        cell.addEventListener('mouseenter', e => {
          const tooltip = document.getElementById('chart-tooltip');
          const textEl = document.getElementById('chart-tooltip-text');
          if (!tooltip || !textEl) return;
          textEl.textContent = cell.title;
          tooltip.classList.remove('hidden');
          this.positionChartTooltip(e);
        });
        cell.addEventListener('mousemove', e => this.positionChartTooltip(e));
        cell.addEventListener('mouseleave', () => this.hideChartTooltip());
      });
    }

    // 更新汇总信息
    const totalDays = Object.keys(dayMap).length;
    const totalEl = document.getElementById('heatmap-total-days');
    if (totalEl) {
      totalEl.textContent = totalDays > 0 ? `${totalDays} 天` : '';
    }
    const summaryEl = document.getElementById('heatmap-summary');
    if (summaryEl) {
      const totalWorkouts = Object.values(dayMap).reduce((s, v) => s + v.count, 0);
      summaryEl.textContent =
        totalWorkouts > 0
          ? `${year}年共训练 ${totalWorkouts} 次，覆盖 ${totalDays} 天`
          : `${year}年暂无训练记录`;
    }
  },

  // --- 卡片折叠/展开 ---
  initCollapsibleCards() {
    document.querySelectorAll('[data-collapsible]').forEach(card => {
      const toggle = card.querySelector('[data-card-toggle]');
      const body = card.querySelector('.collapsible-body');
      const chevron = card.querySelector('.collapse-chevron');
      if (!toggle || !body) return;

      toggle.addEventListener('click', e => {
        if (e.target.closest('[data-no-collapse]')) return;
        body.classList.toggle('collapsed');
        if (chevron) chevron.classList.toggle('collapsed');
      });
    });
  }
};

window.UIModule = UIModule;
