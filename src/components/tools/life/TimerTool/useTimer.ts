import { ref, computed } from 'vue';

export function useTimer() {
  const countdownTotal = ref(0);
  const countdownRemaining = ref(0);
  const isCountdownRunning = ref(false);
  const currentLabel = ref('');
  const countdownEndTime = ref(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  const isTimeEnd = computed(() => countdownTotal.value > 0 && countdownRemaining.value === 0);
  const canResetCountdown = computed(
    () =>
      countdownTotal.value > 0 &&
      (countdownRemaining.value < countdownTotal.value || !isCountdownRunning.value)
  );

  const startTimer = (seconds: number, label: string, onComplete?: () => void) => {
    if (seconds <= 0) return;
    countdownTotal.value = seconds;
    countdownRemaining.value = seconds;
    currentLabel.value = label;
    resumeCountdown(onComplete);
  };

  const resumeCountdown = (onComplete?: () => void) => {
    if (timerInterval) clearInterval(timerInterval);
    countdownEndTime.value = Date.now() + countdownRemaining.value * 1000;
    isCountdownRunning.value = true;

    timerInterval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((countdownEndTime.value - now) / 1000);

      if (diff <= 0) {
        countdownRemaining.value = 0;
        pauseCountdown();
        if (onComplete) onComplete();
      } else {
        countdownRemaining.value = diff;
      }
    }, 200);
  };

  const pauseCountdown = () => {
    isCountdownRunning.value = false;
    if (timerInterval) clearInterval(timerInterval);
  };

  const resetCountdown = () => {
    pauseCountdown();
    countdownRemaining.value = countdownTotal.value;
  };

  const cleanup = () => {
    if (timerInterval) clearInterval(timerInterval);
  };

  return {
    countdownTotal,
    countdownRemaining,
    isCountdownRunning,
    currentLabel,
    isTimeEnd,
    canResetCountdown,
    startTimer,
    resumeCountdown,
    pauseCountdown,
    resetCountdown,
    cleanup
  };
}
