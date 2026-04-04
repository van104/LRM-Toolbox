// 音效管理器
const AudioMgr = {
  enabled: true,
  bgm: null,
  timerEnd: new Audio('https://www.lrm123.site/tools/audio/audio/527475a0f6de'), // 提示音 (循环)
  tick: new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a'), // 倒计时滴答声

  init() {
    this.timerEnd.volume = 0.8;
    this.timerEnd.loop = true; // 开启循环播放
    this.tick.volume = 0.3;
  },

  playTick() {
    if (!this.enabled) return;
    this.tick.currentTime = 0;
    this.tick.play().catch(() => {});
  },

  playEnd() {
    if (!this.enabled) return;
    this.timerEnd.currentTime = 0;
    this.timerEnd.play().catch(() => {});
  },

  stopEnd() {
    this.timerEnd.pause();
    this.timerEnd.currentTime = 0;
  },

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.tick.pause();
      this.stopEnd(); // 禁用声音时立即停止
    }
    return this.enabled;
  }
};

window.AudioMgr = AudioMgr;
