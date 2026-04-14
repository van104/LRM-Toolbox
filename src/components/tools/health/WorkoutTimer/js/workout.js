/* eslint-disable no-undef */
// 锻炼模式核心逻辑
// 作为 App 的 mixin，通过 Object.assign 混入
const WorkoutModule = {
  getCurrentWorkoutExercise() {
    return this.state.currentPlan?.exercises?.[this.state.currentExerciseIdx] || null;
  },

  getWorkoutRestConfig(exercise) {
    const setsTotal = parseInt(exercise.sets) || 1;
    const isLastSet = this.state.currentSet >= setsTotal;
    const hasNextExercise =
      this.state.currentExerciseIdx < this.state.currentPlan.exercises.length - 1;

    const betweenRaw =
      exercise.restBetweenSets !== undefined ? exercise.restBetweenSets : exercise.rest;
    const afterRaw =
      exercise.restAfterExercise !== undefined ? exercise.restAfterExercise : exercise.rest;
    const betweenRest = parseInt(betweenRaw) || 60;
    const afterRest = parseInt(afterRaw) || 90;

    return {
      setsTotal,
      isLastSet,
      hasNextExercise,
      restSeconds: isLastSet ? afterRest : betweenRest
    };
  },

  checkTodayPlan() {
    // 安全检查
    if (!this.dom.dayBadge) return;

    const daysMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = daysMap[new Date().getDay()];
    this.dom.dayBadge.textContent = today;

    // 查找今日计划
    const todayPlan = this.data.plans.find(p => p.days.includes(today));

    if (todayPlan) {
      this.state.currentPlan = todayPlan;
      this.resetWorkoutState(!localStorage.getItem(this.INTERRUPTION_RECOVERY_KEY));
      this.dom.statusTitle.textContent = todayPlan.title;
      this.dom.statusSubtitle.textContent = `共 ${todayPlan.exercises.length} 个动作，准备开始`;
      this.dom.actionBtn.disabled = false;
      this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>开始训练</span>';
      this.dom.actionBtn.classList.remove('bg-slate-400', 'cursor-not-allowed');
      this.dom.actionBtn.classList.add('bg-blue-600', 'shadow-lg');
    } else {
      this.state.currentPlan = null;
      this.dom.statusTitle.textContent = '今天也是休息日';
      this.dom.statusSubtitle.textContent = '好好放松，或者添加一个临时计划';
      this.dom.actionBtn.disabled = true;
      this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-bed"></i><span>暂无计划</span>';
      this.dom.actionBtn.classList.add('bg-slate-400', 'cursor-not-allowed');
      this.dom.actionBtn.classList.remove('bg-blue-600', 'shadow-lg');
      this.resetWorkoutUI();
    }
  },

  resetWorkoutState(clearRecovery = true) {
    this.clearInterval();
    this.finishRestTracking();
    this.state.mode = 'idle';
    this.state.currentExerciseIdx = 0;
    this.state.currentSet = 1;
    this.state.timeLeft = 0;
    this.state.totalDuration = 0;
    this.state.workoutRestEndsAt = 0;
    this.resetSessionStats();
    this.updateCounters();
    this.setProgress(0);
    this.dom.timerDisplay.textContent = '--:--';
    this.dom.timerLabel.textContent = '待机中';
    this.dom.mainCard.classList.remove(
      'border-green-400',
      'border-amber-400',
      'border-blue-400',
      'border-2'
    );
    this.dom.overallProgress.style.width = '0%';
    if (this.dom.timerControls) this.dom.timerControls.classList.add('hidden');

    // 重置按钮 UI
    if (this.state.currentPlan) {
      this.dom.statusTitle.textContent = this.state.currentPlan.title;
      this.dom.statusSubtitle.textContent = `共 ${this.state.currentPlan.exercises.length} 个动作，准备开始`;
      this.dom.actionBtn.disabled = false;
      this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>开始训练</span>';
      this.dom.actionBtn.className =
        'col-span-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-blue-500/30 btn-click transition-all';
    }

    AudioMgr.stopEnd();
    WakeLockMgr.release();
    if (clearRecovery) this.clearInterruptedSession();
  },

  resetWorkoutUI() {
    this.dom.timerDisplay.textContent = '--:--';
    this.dom.setCounter.textContent = '-/-';
    this.dom.exCounter.textContent = '-/-';
    this.setProgress(0);
    if (this.dom.timerControls) this.dom.timerControls.classList.add('hidden');
  },

  toggleWorkout() {
    if (!this.state.currentPlan) return;
    if (this.state.mode === 'timer_running' || this.state.mode === 'timer_paused') {
      this.confirm('提示', '当前正在自由计时，请先重置或等待计时结束后再开始训练。');
      return;
    }

    const plan = this.state.currentPlan;
    const exercises = plan.exercises;
    const currentEx = exercises[this.state.currentExerciseIdx];

    if (this.state.mode === 'idle') {
      this.startExercise(currentEx);
    } else if (this.state.mode === 'workout_work') {
      this.startRest(currentEx);
    } else if (this.state.mode === 'workout_rest') {
      this.finishRest();
    } else if (this.state.mode === 'workout_rest_end') {
      this.finishRest();
    }
  },

  startExercise(exercise) {
    this.clearInterval();
    this.startSessionIfNeeded();
    this.state.mode = 'workout_work';
    this.state.workoutRestEndsAt = 0;
    WakeLockMgr.request();

    this.renderWorkoutWorkState(exercise);
    this.persistInterruptedSession();
  },

  renderWorkoutWorkState(exercise) {
    this.dom.statusTitle.textContent = exercise.name;
    this.dom.statusSubtitle.textContent = `目标: ${exercise.reps}`;
    this.dom.timerDisplay.textContent = '锻炼中';
    this.dom.timerDisplay.classList.add('text-4xl');
    this.dom.timerDisplay.classList.remove('text-6xl');
    this.dom.timerLabel.textContent = '点击按钮完成本组';

    // 按钮状态
    this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>完成本组</span>';
    this.dom.actionBtn.className =
      'col-span-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-green-500/30 btn-click transition-all';

    // 视觉反馈
    this.dom.mainCard.classList.remove('border-amber-400', 'border-blue-400');
    this.dom.mainCard.classList.add('border-2', 'border-green-400');
    this.dom.ringCircle.classList.add('text-green-500');
    this.dom.ringCircle.classList.remove('text-blue-600', 'text-amber-500');
    this.setProgress(100);
    this.dom.timerControls.classList.add('hidden');

    this.updateCounters();
    this.updateSessionStatsUI();
  },

  startRest(exercise) {
    this.state.sessionCompletedSets += 1;
    this.finishRestTracking();
    this.state.mode = 'workout_rest';
    this.startRestTracking();
    AudioMgr.stopEnd();

    const { restSeconds } = this.getWorkoutRestConfig(exercise);

    this.state.timeLeft = restSeconds;
    this.state.totalDuration = restSeconds;
    this.state.workoutRestEndsAt = Date.now() + restSeconds * 1000;

    this.renderWorkoutRestState(exercise);
    this.startWorkoutRestCountdown();
    this.persistInterruptedSession();
  },

  renderWorkoutRestState(exercise) {
    const { isLastSet, hasNextExercise } = this.getWorkoutRestConfig(exercise);
    this.dom.statusTitle.textContent = '休息一下';
    if (!isLastSet) {
      this.dom.statusSubtitle.textContent = `下一组: ${exercise.name}`;
    } else if (hasNextExercise) {
      this.dom.statusSubtitle.textContent = `准备下一个动作: ${this.state.currentPlan.exercises[this.state.currentExerciseIdx + 1].name}`;
    } else {
      this.dom.statusSubtitle.textContent = `本次训练已完成，稍作放松`;
    }

    this.dom.timerDisplay.classList.remove('text-4xl');
    this.dom.timerDisplay.classList.add('text-6xl');
    this.dom.timerLabel.textContent = '休息计时中';

    // 按钮状态
    this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-forward"></i><span>跳过休息</span>';
    this.dom.actionBtn.className =
      'col-span-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-amber-500/30 btn-click transition-all';

    // 视觉反馈
    this.dom.mainCard.classList.remove('border-green-400', 'border-blue-400');
    this.dom.mainCard.classList.add('border-2', 'border-amber-400');
    this.dom.ringCircle.classList.add('text-amber-500');
    this.dom.ringCircle.classList.remove('text-blue-600', 'text-green-500');

    this.dom.timerControls.classList.remove('hidden');
    this.updateCounters();
    this.updateSessionStatsUI();
    this.updateTimerDisplay(this.state.timeLeft);
    const percent = this.state.totalDuration
      ? (this.state.timeLeft / this.state.totalDuration) * 100
      : 0;
    this.setProgress(percent);
  },

  startWorkoutRestCountdown() {
    this.clearInterval();
    const syncRest = () => {
      const remainingMs = Math.max(0, (this.state.workoutRestEndsAt || 0) - Date.now());
      const nextTimeLeft = Math.ceil(remainingMs / 1000);
      if (nextTimeLeft !== this.state.timeLeft) {
        this.state.timeLeft = nextTimeLeft;
        this.updateTimerDisplay(this.state.timeLeft);
        const percent = this.state.totalDuration
          ? (this.state.timeLeft / this.state.totalDuration) * 100
          : 0;
        this.setProgress(percent);
        if (this.state.timeLeft <= 3 && this.state.timeLeft > 0) {
          AudioMgr.playTick();
        }
      }
      if (remainingMs <= 0) {
        this.onRestEnd();
      }
    };
    syncRest();
    this.state.timerId = setInterval(syncRest, 250);
  },

  onRestEnd() {
    this.finishRestTracking();
    this.clearInterval();
    this.state.mode = 'workout_rest_end';
    this.state.workoutRestEndsAt = 0;
    AudioMgr.playEnd();

    this.renderWorkoutRestEndState();
    this.persistInterruptedSession();
  },

  renderWorkoutRestEndState() {
    this.dom.statusTitle.textContent = '休息结束！';
    this.dom.statusSubtitle.textContent = '准备好进行下一组了吗？';
    this.dom.timerDisplay.textContent = '00:00';
    this.dom.timerLabel.textContent = '点击下方按钮开始';

    this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>开始下一组</span>';
    this.dom.actionBtn.className =
      'col-span-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-green-500/30 btn-click transition-all';

    this.dom.mainCard.classList.remove('border-amber-400');
    this.dom.mainCard.classList.add('border-2', 'border-blue-400');
    this.dom.ringCircle.classList.remove('text-amber-500');
    this.dom.ringCircle.classList.add('text-blue-600');
    this.setProgress(100);

    this.dom.timerControls.classList.add('hidden');
    this.updateCounters();
    this.updateSessionStatsUI();
  },

  completeRecoveredRest(restEndedAt) {
    if (!this.state.sessionRestStartedAt) return;
    const finalRestAt = Math.max(
      this.state.sessionRestStartedAt,
      parseInt(restEndedAt) || this.state.sessionRestStartedAt
    );
    const elapsed = finalRestAt - this.state.sessionRestStartedAt;
    this.state.sessionRestStartedAt = null;
    if (elapsed > 0) {
      this.state.sessionTotalRestMs += elapsed;
      this.state.sessionRestCount += 1;
    }
    this.state.mode = 'workout_rest_end';
    this.state.workoutRestEndsAt = 0;
    this.updateSessionStatsUI();
  },

  adjustRestTime(seconds) {
    if (this.state.mode !== 'workout_rest') return;
    const remainingMs = Math.max(0, (this.state.workoutRestEndsAt || 0) - Date.now());
    const adjustedMs = Math.max(0, remainingMs + seconds * 1000);
    this.state.workoutRestEndsAt = Date.now() + adjustedMs;
    this.state.timeLeft = Math.ceil(adjustedMs / 1000);
    if (this.state.timeLeft > this.state.totalDuration) {
      this.state.totalDuration = this.state.timeLeft;
    }
    this.updateTimerDisplay(this.state.timeLeft);
    const percent = this.state.totalDuration
      ? (this.state.timeLeft / this.state.totalDuration) * 100
      : 0;
    this.setProgress(percent);
    if (adjustedMs <= 0) {
      this.onRestEnd();
      return;
    }
    this.persistInterruptedSession();
  },

  finishRest() {
    this.finishRestTracking();
    this.clearInterval();
    AudioMgr.stopEnd();
    this.dom.timerControls.classList.add('hidden');
    this.state.workoutRestEndsAt = 0;

    const plan = this.state.currentPlan;
    const currentEx = plan.exercises[this.state.currentExerciseIdx];

    if (this.state.currentSet < currentEx.sets) {
      this.state.currentSet++;
      this.startExercise(currentEx);
    } else {
      if (this.state.currentExerciseIdx < plan.exercises.length - 1) {
        this.state.currentExerciseIdx++;
        this.state.currentSet = 1;
        this.startExercise(plan.exercises[this.state.currentExerciseIdx]);
      } else {
        this.finishWorkout();
      }
    }
  },

  finishWorkout() {
    this.finishRestTracking();
    this.state.mode = 'idle';
    WakeLockMgr.release();
    this.dom.statusTitle.textContent = '训练完成！🎉';
    this.dom.statusSubtitle.textContent = '你太棒了！休息一下吧';
    this.dom.timerDisplay.textContent = 'DONE';
    this.dom.timerLabel.textContent = '今日计划已结束';

    this.dom.actionBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i><span>再来一次</span>';
    this.dom.actionBtn.className =
      'col-span-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 flex items-center justify-center gap-2 font-bold text-lg shadow-lg shadow-blue-500/30 btn-click transition-all';

    this.dom.mainCard.classList.remove('border-amber-400', 'border-green-400', 'border-2');
    this.dom.ringCircle.classList.remove('text-amber-500', 'text-green-500');
    this.dom.ringCircle.classList.add('text-blue-600');
    this.dom.timerControls.classList.add('hidden');

    this.dom.overallProgress.style.width = '100%';

    const totalDurationSec = this.state.sessionStartedAt
      ? Math.max(0, Math.round((Date.now() - this.state.sessionStartedAt) / 1000))
      : 0;
    const avgRestSec =
      this.state.sessionRestCount > 0
        ? Math.round(this.state.sessionTotalRestMs / this.state.sessionRestCount / 1000)
        : 0;
    this.data.workoutHistory.push({
      id: `ws_${Date.now()}`,
      endedAt: new Date().toISOString(),
      totalDurationSec,
      totalSets: this.state.sessionCompletedSets,
      avgRestSec,
      planTitle: this.state.currentPlan?.title || ''
    });
    this.state.sessionLastDurationSec = totalDurationSec;
    this.state.sessionLastSets = this.state.sessionCompletedSets;
    this.state.sessionLastAvgRestSec = avgRestSec;
    this.saveWorkoutHistory();
    this.state.sessionStartedAt = null;
    this.updateSessionStatsUI();

    this.state.currentExerciseIdx = 0;
    this.state.currentSet = 1;
    this.state.workoutRestEndsAt = 0;
    this.clearInterruptedSession();
  }
};

window.WorkoutModule = WorkoutModule;
