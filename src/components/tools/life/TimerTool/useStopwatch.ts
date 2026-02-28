import { ref, computed } from 'vue';

export function useStopwatch() {
  const stopwatchStartTime = ref(0);
  const stopwatchElapsed = ref(0);
  const isStopwatchRunning = ref(false);
  const laps = ref<{ index: number; time: number; split: number }[]>([]);
  let stopwatchIntervalId: ReturnType<typeof setInterval> | null = null;

  const startStopwatch = () => {
    if (!isStopwatchRunning.value) {
      stopwatchStartTime.value = Date.now() - stopwatchElapsed.value;
      isStopwatchRunning.value = true;
      stopwatchIntervalId = setInterval(() => {
        stopwatchElapsed.value = Date.now() - stopwatchStartTime.value;
      }, 10);
    }
  };

  const pauseStopwatch = () => {
    isStopwatchRunning.value = false;
    if (stopwatchIntervalId) clearInterval(stopwatchIntervalId);
  };

  const resetStopwatch = () => {
    pauseStopwatch();
    stopwatchElapsed.value = 0;
    laps.value = [];
  };

  const lapStopwatch = () => {
    const current = stopwatchElapsed.value;
    const lastLapTime = laps.value.length > 0 ? laps.value[laps.value.length - 1].time : 0;
    laps.value.push({
      index: laps.value.length + 1,
      time: current,
      split: current - lastLapTime
    });
  };

  const reversedLaps = computed(() => [...laps.value].reverse());

  const cleanup = () => {
    if (stopwatchIntervalId) clearInterval(stopwatchIntervalId);
  };

  return {
    stopwatchElapsed,
    isStopwatchRunning,
    laps,
    reversedLaps,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    lapStopwatch,
    cleanup
  };
}
