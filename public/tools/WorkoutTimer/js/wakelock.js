// 屏幕常亮管理器
const WakeLockMgr = {
  lock: null,
  async request() {
    if (!('wakeLock' in navigator)) return;
    try {
      this.lock = await navigator.wakeLock.request('screen');
      console.log('Screen Wake Lock acquired');
      this.lock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
        this.lock = null;
      });
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  },
  async release() {
    if (this.lock) {
      await this.lock.release();
      this.lock = null;
    }
  }
};

// 监听页面可见性，在恢复可见时重新获取锁
document.addEventListener('visibilitychange', async () => {
  if (WakeLockMgr.lock !== null && document.visibilityState === 'visible') {
    await WakeLockMgr.request();
  }
});

window.WakeLockMgr = WakeLockMgr;

