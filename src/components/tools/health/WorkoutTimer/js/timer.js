/* eslint-disable no-undef */
// 自由计时器逻辑 (倒计时 + 正计时/秒表)
// 作为 App 的 mixin，通过 Object.assign 混入
const TimerModule = {
  initFreeTimer() {
    this.dom.ftModeCountdownBtn.addEventListener('click', () => this.setFreeTimerType('countdown'));
    this.dom.ftModeStopwatchBtn.addEventListener('click', () => this.setFreeTimerType('stopwatch'));

    this.dom.ftDisplay.addEventListener('click', () => {
      if (this.state.freeTimerType !== 'countdown') return;
      if (this.state.mode === 'workout_work' || this.state.mode === 'workout_rest') {
        this.confirm('提示', '当前正在进行训练流程，请先结束或重置训练后再使用自由计时器。');
        return;
      }
      if (this.state.mode === 'timer_running') {
        this.pauseFreeTimer();
      }
      this.dom.ftDisplay.classList.add('hidden');
      this.dom.ftSetup.classList.remove('hidden');
    });

    this.dom.ftConfirmBtn.addEventListener('click', () => {
      const min = parseInt(this.dom.ftMin.value) || 0;
      const sec = parseInt(this.dom.ftSec.value) || 0;
      const total = min * 60 + sec;
      this.confirmFreeTimer(total);
    });

    document.querySelectorAll('.ft-preset-btn').forEach(btn => {
      btn.onclick = () => {
        const seconds = parseInt(btn.dataset.time);
        this.confirmFreeTimer(seconds);
      };
    });

    this.dom.ftStartBtn.addEventListener('click', () => {
      if (this.state.mode === 'workout_work' || this.state.mode === 'workout_rest') {
        this.confirm('提示', '当前正在进行训练流程，请先结束或重置训练后再使用自由计时器。');
        return;
      }
      if (this.state.freeTimerType === 'countdown') {
        if (this.state.mode === 'timer_running') {
          this.pauseFreeTimer();
        } else if (this.state.mode === 'timer_paused') {
          this.runFreeTimer();
        } else {
          if (this.state.freeTimerSetting <= 0) {
            this.dom.ftDisplay.click();
            return;
          }
          this.state.freeTimerRemainingMs = this.state.freeTimerSetting * 1000;
          this.runFreeTimer();
        }
      } else if (this.state.mode === 'timer_running') {
        this.pauseStopwatch();
      } else {
        this.runStopwatch();
      }
    });

    this.dom.ftResetBtn.addEventListener('click', () => {
      AudioMgr.stopEnd();
      this.clearInterval();
      WakeLockMgr.release();
      this.state.mode = 'idle';
      this.state.freeTimerEndsAt = 0;
      this.state.stopwatchStartedAt = 0;
      if (this.state.freeTimerType === 'countdown') {
        this.state.freeTimerRemainingMs = this.state.freeTimerSetting * 1000;
        this.updateFreeTimerDisplay(this.state.freeTimerRemainingMs);
      } else {
        this.state.stopwatchElapsed = 0;
        this.updateStopwatchDisplay(0);
        this.resetStopwatchLaps();
      }
      this.updateFreeTimerActionBtn('开始', false);
      this.updateLapBtnState();
      this.clearInterruptedSession();
    });

    this.dom.ftLapBtn.addEventListener('click', () => this.addStopwatchLap());
  },

  setFreeTimerType(type, clearRecovery = true) {
    if (type !== 'countdown' && type !== 'stopwatch') return;
    if (
      this.state.mode === 'workout_work' ||
      this.state.mode === 'workout_rest' ||
      this.state.mode === 'workout_rest_end'
    ) {
      this.confirm('提示', '当前正在进行训练流程，请先结束或重置训练后再使用自由计时器。');
      return;
    }
    AudioMgr.stopEnd();
    this.clearInterval();
    WakeLockMgr.release();
    this.state.mode = 'idle';
    this.state.freeTimerEndsAt = 0;
    this.state.stopwatchStartedAt = 0;
    this.dom.ftSetup.classList.add('hidden');
    this.dom.ftDisplay.classList.remove('hidden');
    this.state.freeTimerType = type;
    this.animateFreeTimerModeSwitch();
    this.updateFreeTimerModeButtons();
    this.updateFreeTimerActionBtn('开始', false);

    if (type === 'countdown') {
      this.dom.ftModeTitle.textContent = '倒计时';
      this.dom.ftModeSubtitle.textContent = '自定义倒计时长';
      this.dom.ftDisplay.classList.add('cursor-pointer', 'hover:text-blue-600');
      this.dom.ftPresets.classList.remove('hidden');
      this.dom.ftLapsPanel.classList.add('hidden');
      this.dom.ftLapBtn.classList.add('hidden');
      this.state.freeTimerRemainingMs = this.state.freeTimerSetting * 1000;
      this.updateFreeTimerDisplay(this.state.freeTimerRemainingMs);
      this.updateLapBtnState();
    } else {
      this.dom.ftModeTitle.textContent = '正计时';
      this.dom.ftModeSubtitle.textContent = '记录训练时长与计次';
      this.dom.ftDisplay.classList.remove('cursor-pointer', 'hover:text-blue-600');
      this.dom.ftPresets.classList.add('hidden');
      this.dom.ftLapsPanel.classList.remove('hidden');
      this.dom.ftLapBtn.classList.remove('hidden');
      this.state.stopwatchElapsed = 0;
      this.updateStopwatchDisplay(0);
      this.resetStopwatchLaps();
      this.updateLapBtnState();
    }
    if (clearRecovery) this.clearInterruptedSession();
  },

  updateFreeTimerModeButtons() {
    const isCountdown = this.state.freeTimerType === 'countdown';
    this.dom.ftModeCountdownBtn.classList.toggle('text-blue-600', isCountdown);
    this.dom.ftModeCountdownBtn.classList.toggle('text-slate-500', !isCountdown);
    this.dom.ftModeStopwatchBtn.classList.toggle('text-blue-600', !isCountdown);
    this.dom.ftModeStopwatchBtn.classList.toggle('text-slate-500', isCountdown);
    const activeBtn = isCountdown ? this.dom.ftModeCountdownBtn : this.dom.ftModeStopwatchBtn;
    const switchRect = this.dom.ftModeSwitch.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    this.dom.ftModeSwitchIndicator.style.width = `${btnRect.width}px`;
    this.dom.ftModeSwitchIndicator.style.transform = `translateX(${btnRect.left - switchRect.left}px)`;
  },

  animateFreeTimerModeSwitch() {
    this.dom.ftModeCard.classList.remove('ft-mode-switching');
    void this.dom.ftModeCard.offsetHeight; // trigger reflow
    this.dom.ftModeCard.classList.add('ft-mode-switching');
  },

  updateFreeTimerActionBtn(text, isPause) {
    this.dom.ftStartBtn.innerHTML = `<i class="fa-solid fa-${isPause ? 'pause' : 'play'}"></i><span>${text}</span>`;
    this.dom.ftStartBtn.classList.toggle('bg-amber-500', isPause);
    this.dom.ftStartBtn.classList.toggle('hover:bg-amber-600', isPause);
    this.dom.ftStartBtn.classList.toggle('bg-slate-800', !isPause);
    this.dom.ftStartBtn.classList.toggle('hover:bg-slate-900', !isPause);
  },

  updateLapBtnState() {
    const canLap = this.state.freeTimerType === 'stopwatch' && this.state.mode === 'timer_running';
    this.dom.ftLapBtn.disabled = !canLap;
    this.dom.ftLapBtn.classList.toggle('opacity-50', !canLap);
    this.dom.ftLapBtn.classList.toggle('cursor-not-allowed', !canLap);
  },

  resetStopwatchLaps() {
    this.state.stopwatchLaps = [];
    this.renderStopwatchLaps();
    this.persistInterruptedSession();
  },

  renderStopwatchLaps() {
    this.dom.ftLapCount.textContent = this.state.stopwatchLaps.length;
    if (this.state.stopwatchLaps.length === 0) {
      this.dom.ftLapList.classList.add('hidden');
      this.dom.ftLapEmpty.classList.remove('hidden');
      this.dom.ftLapList.innerHTML = '';
      return;
    }

    this.dom.ftLapEmpty.classList.add('hidden');
    this.dom.ftLapList.classList.remove('hidden');
    this.dom.ftLapList.innerHTML = this.state.stopwatchLaps
      .map(
        lap => `
                <div class="flex items-center justify-between px-4 py-2">
                  <span class="font-semibold text-slate-600">第 ${lap.index} 次</span>
                  <span class="text-slate-400 text-xs">分段 ${this.formatFreeTimer(lap.deltaSeconds * 1000, true, true)}</span>
                  <span class="font-bold text-slate-800 tabular-nums">${this.formatFreeTimer(lap.totalSeconds * 1000, true, true)}</span>
                </div>
              `
      )
      .join('');
  },

  confirmFreeTimer(total) {
    if (this.state.freeTimerType !== 'countdown') return;
    if (total > 0) {
      this.state.freeTimerSetting = total;
      this.state.freeTimerRemainingMs = total * 1000;
      if (this.state.mode === 'timer_running' || this.state.mode === 'timer_paused') {
        this.clearInterval();
        this.state.mode = 'idle';
        this.state.freeTimerEndsAt = 0;
      }
      this.updateFreeTimerDisplay(this.state.freeTimerRemainingMs);
      this.dom.ftDisplay.classList.remove('hidden');
      this.dom.ftSetup.classList.add('hidden');
      this.updateFreeTimerActionBtn('开始', false);
      this.clearInterruptedSession();
    } else this.confirm('提示', '请设置有效的时间');
  },

  runFreeTimer() {
    if (this.state.freeTimerType !== 'countdown') return;
    this.clearInterval();
    AudioMgr.stopEnd();
    this.state.mode = 'timer_running';
    WakeLockMgr.request();
    this.updateFreeTimerActionBtn('暂停', true);
    const startRemainingMs = Math.max(
      0,
      this.state.freeTimerRemainingMs || this.state.freeTimerSetting * 1000
    );
    this.state.freeTimerRemainingMs = startRemainingMs;
    this.state.freeTimerEndsAt = Date.now() + startRemainingMs;
    this.persistInterruptedSession();

    this.state.timerId = setInterval(() => {
      const remainingMs = Math.max(0, this.state.freeTimerEndsAt - Date.now());
      this.state.freeTimerRemainingMs = remainingMs;
      this.state.timeLeft = Math.ceil(remainingMs / 1000);
      this.updateFreeTimerDisplay(remainingMs);

      if (remainingMs <= 0) {
        this.clearInterval();
        this.state.mode = 'idle';
        WakeLockMgr.release();
        AudioMgr.playEnd();
        this.state.freeTimerRemainingMs = 0;
        this.state.freeTimerEndsAt = 0;
        this.updateFreeTimerDisplay(0);
        this.updateFreeTimerActionBtn('开始', false);
        this.clearInterruptedSession();
      }
    }, 100);
  },

  pauseFreeTimer() {
    if (this.state.freeTimerType !== 'countdown') return;
    this.state.freeTimerRemainingMs = Math.max(0, this.state.freeTimerEndsAt - Date.now());
    this.clearInterval();
    this.state.mode = 'timer_paused';
    this.state.freeTimerEndsAt = 0;
    WakeLockMgr.release();
    this.updateFreeTimerDisplay(this.state.freeTimerRemainingMs);
    this.updateFreeTimerActionBtn('继续', false);
    this.persistInterruptedSession();
  },

  updateFreeTimerDisplay(milliseconds) {
    const display = this.formatFreeTimer(milliseconds, false);
    this.dom.ftDisplay.textContent = display;
    document.title = milliseconds > 0 ? `${display} - 倒计时` : '智能健身助手 Pro';
  },

  runStopwatch() {
    if (this.state.freeTimerType !== 'stopwatch') return;
    this.clearInterval();
    AudioMgr.stopEnd();
    this.state.mode = 'timer_running';
    WakeLockMgr.request();
    this.updateFreeTimerActionBtn('暂停', true);
    this.updateLapBtnState();
    if (!this.state.stopwatchStartedAt) {
      this.state.stopwatchStartedAt = Date.now() - this.state.stopwatchElapsed * 1000;
    }
    this.persistInterruptedSession();
    this.state.timerId = setInterval(() => {
      this.state.stopwatchElapsed = Math.max(
        0,
        Math.floor((Date.now() - this.state.stopwatchStartedAt) / 1000)
      );
      this.updateStopwatchDisplay(this.state.stopwatchElapsed);
    }, 250);
  },

  pauseStopwatch() {
    if (this.state.freeTimerType !== 'stopwatch') return;
    this.state.stopwatchElapsed = Math.max(
      0,
      Math.floor((Date.now() - (this.state.stopwatchStartedAt || Date.now())) / 1000)
    );
    this.clearInterval();
    this.state.mode = 'timer_paused';
    this.state.stopwatchStartedAt = 0;
    WakeLockMgr.release();
    this.updateStopwatchDisplay(this.state.stopwatchElapsed);
    this.updateFreeTimerActionBtn('继续', false);
    this.updateLapBtnState();
    this.persistInterruptedSession();
  },

  addStopwatchLap() {
    if (this.state.freeTimerType !== 'stopwatch' || this.state.mode !== 'timer_running') return;
    const totalSeconds = this.state.stopwatchElapsed;
    const lastLap = this.state.stopwatchLaps[0];
    const deltaSeconds = lastLap ? totalSeconds - lastLap.totalSeconds : totalSeconds;
    this.state.stopwatchLaps.unshift({
      index: this.state.stopwatchLaps.length + 1,
      totalSeconds,
      deltaSeconds
    });
    this.renderStopwatchLaps();
    this.persistInterruptedSession();
  },

  updateStopwatchDisplay(seconds) {
    const display = this.formatFreeTimer(seconds * 1000, false, true);
    this.dom.ftDisplay.textContent = display;
    document.title = `${display} - 正计时`;
  },

  formatFreeTimer(milliseconds, showMilliseconds = false, forceHour = false) {
    const safeMilliseconds = Math.max(0, Math.floor(milliseconds));
    const totalSeconds = Math.floor(safeMilliseconds / 1000);
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    const ms = (safeMilliseconds % 1000).toString().padStart(3, '0');
    const base = forceHour || h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`;
    return showMilliseconds ? `${base}.${ms}` : base;
  }
};

window.TimerModule = TimerModule;
