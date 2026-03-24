/* eslint-disable no-undef */
// UI 辅助功能：模态框、确认框、主题、Tab导航、统计图表
// 作为 App 的 mixin，通过 Object.assign 混入
const UIModule = {
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

  renderWorkoutHistoryChart() {
    const recent = this.data.workoutHistory.slice(-7);
    const renderTo = (chartEl, emptyEl, barsEl, barHeightClass) => {
      if (!chartEl || !emptyEl || !barsEl) return;
      if (!recent.length) {
        chartEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        barsEl.innerHTML = '';
        return;
      }
      const maxSeconds = Math.max(...recent.map(item => item.totalDurationSec), 60);
      chartEl.classList.remove('hidden');
      emptyEl.classList.add('hidden');
      barsEl.innerHTML = recent
        .map(item => {
          const h = Math.max(10, Math.round((item.totalDurationSec / maxSeconds) * 100));
          const label = new Date(item.endedAt).toLocaleDateString('zh-CN', {
            month: '2-digit',
            day: '2-digit'
          });
          const tooltip = `${label} ${this.formatDurationText(item.totalDurationSec)}`;
          return `
                <div class="flex-1 flex flex-col items-center justify-end gap-1">
                  <div class="${barHeightClass} w-full flex items-end justify-center">
                    <div class="history-bar w-4 rounded-t-md bg-gradient-to-t from-blue-600 to-blue-300" style="height: ${h}%" title="${tooltip}"></div>
                  </div>
                  <div class="text-[10px] text-slate-400">${label}</div>
                </div>
              `;
        })
        .join('');
    };
    renderTo(this.dom.historyChart, this.dom.historyChartEmpty, this.dom.historyBars, 'h-24');
    renderTo(
      this.dom.historyChartPage,
      this.dom.historyChartEmptyPage,
      this.dom.historyBarsPage,
      'h-44'
    );
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
    this.dom.exportFormatModal.classList.remove('hidden');
    this.dom.exportFormatModal.classList.add('flex');
    void this.dom.exportFormatModal.offsetHeight;
    this.dom.exportFormatModal.classList.add('active');
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
  confirm(title, message, onOk) {
    this.dom.confirmTitle.textContent = title;
    this.dom.confirmMsg.textContent = message;
    const isAlert = typeof onOk !== 'function';
    this.dom.confirmCancel.classList.toggle('hidden', isAlert);
    this.dom.confirmOk.textContent = isAlert ? '我知道了' : '确定';
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

    this.dom.confirmCancel.onclick = cleanup;
    this.dom.confirmBackdrop.onclick = cleanup;
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
  }
};

window.UIModule = UIModule;
