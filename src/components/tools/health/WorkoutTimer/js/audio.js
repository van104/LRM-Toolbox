/* eslint-disable no-undef */
/**
 * 音效管理器 (AudioMgr)
 * 支持系统内置提示音 (来自 Pixabay，中文命名)
 * 支持用户自定义上传提示音（仅存储于本地 IndexedDB，绝不上传服务器）
 */
const AudioMgr = {
  enabled: true,
  activeSoundId: 'original_default',
  timerEnd: new Audio(),
  tick: new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.m4a'),
  previewAudio: null,
  currentlyPlayingId: null,

  // 系统内置提示音列表 (包含原版默认音效 + 来自 Pixabay 的音效)
  builtinSounds: [
    { id: 'original_default', name: '默认经典提示音 (原版)', url: 'https://www.lrm123.site/tools/audio/audio/527475a0f6de' },
    { id: 'classic_timer', name: '经典计时结束音', url: './bgm/alexis_gaming_cam-timer-terminer-342934.mp3' },
    { id: 'ui_success', name: '清脆成功和弦', url: './bgm/soundshelfstudio-ui-chime-success-sound-551841.mp3' },
    { id: 'correct_prompt', name: '欢快正确提示音', url: './bgm/koiroylers-correct-356013.mp3' },
    { id: 'cute_chime', name: '萌趣和弦风铃', url: './bgm/dragon-studio-cute-chime-439613.mp3' },
    { id: 'notification_chime', name: '极简通知叮咚', url: './bgm/universfield-notification-chime-153308.mp3' },
    { id: 'reward_notification', name: '成就奖励通报', url: './bgm/universfield-reward-notification-140576.mp3' },
    { id: 'level_up_horn', name: '游戏升级号角', url: './bgm/universfield-level-up-191997.mp3' },
    { id: 'level_up_chime', name: '通关升级风铃', url: './bgm/universfield-level-up-chime-132474.mp3' },
    { id: 'game_over', name: '复古游戏结束音', url: './bgm/alphix-game-over-417465.mp3' },
    { id: 'classic_phone', name: '复古电话铃声', url: './bgm/soynoviembre-classic-phone-ringtone-439034.mp3' },
    { id: 'magical_ringtone', name: '梦幻和弦铃声', url: './bgm/soundreality-phone-ringtone-magical-273558.mp3' },
    { id: 'energetic_ringtone', name: '活力欢快铃声', url: './bgm/universfield-ringtone-030-437513.mp3' }
  ],

  customSoundsCache: [],

  async init() {
    this.timerEnd.volume = 0.8;
    this.timerEnd.loop = true;
    this.tick.volume = 0.3;

    // 从 localStorage 读取开启状态和选中的音效 ID
    const savedEnabled = localStorage.getItem('fitness_sound_enabled_v1');
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }

    const savedSoundId = localStorage.getItem('fitness_prompt_sound_id_v2') || 'original_default';
    this.activeSoundId = savedSoundId;

    // 建立 IndexedDB 数据库连接并载入当前提示音
    try {
      await this.loadCustomSounds();
      await this.applySelectedSound(this.activeSoundId);
    } catch (e) {
      console.warn('[AudioMgr] 初始化自定义音频失败:', e);
      this.applySelectedSound('original_default');
    }

    this.bindEvents();
  },

  // 建立 IndexedDB
  openDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('当前浏览器不支持 IndexedDB'));
        return;
      }
      const request = indexedDB.open('WorkoutTimerAudioDB', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('custom_sounds')) {
          db.createObjectStore('custom_sounds', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // 加载自定义音效列表
  async loadCustomSounds() {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('custom_sounds', 'readonly');
        const store = tx.objectStore('custom_sounds');
        const request = store.getAll();
        request.onsuccess = () => {
          this.customSoundsCache = request.result || [];
          resolve(this.customSoundsCache);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      this.customSoundsCache = [];
      return [];
    }
  },

  // 保存自定义音效到 IndexedDB
  async saveCustomSound(file) {
    if (!file) return null;
    if (!file.type.startsWith('audio/') && !/\.(mp3|wav|m4a|ogg|aac|flac|webm)$/i.test(file.name)) {
      throw new Error('请选择有效的音频格式 (MP3, WAV, M4A, OGG 等)');
    }
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('文件过大，请上传小于 20MB 的音频文件');
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

    const newSound = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      dataUrl,
      size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
      createdAt: Date.now()
    };

    const db = await this.openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('custom_sounds', 'readwrite');
      const store = tx.objectStore('custom_sounds');
      const request = store.put(newSound);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    await this.loadCustomSounds();
    return newSound;
  },

  // 删除自定义音效
  async deleteCustomSound(id) {
    const db = await this.openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('custom_sounds', 'readwrite');
      const store = tx.objectStore('custom_sounds');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    await this.loadCustomSounds();

    // 如果删除的是当前选中的提示音，回退到默认
    if (this.activeSoundId === id) {
      await this.selectSound('classic_timer');
    } else {
      this.renderModalLists();
    }
  },

  // 应用并设置当前的提示音
  async applySelectedSound(soundId) {
    this.activeSoundId = soundId;
    localStorage.setItem('fitness_prompt_sound_id_v2', soundId);

    // 查找内置音效
    const builtin = this.builtinSounds.find(s => s.id === soundId);
    if (builtin) {
      this.timerEnd.src = builtin.url;
      return;
    }

    // 查找自定义音效
    const custom = this.customSoundsCache.find(s => s.id === soundId);
    if (custom && custom.dataUrl) {
      this.timerEnd.src = custom.dataUrl;
      return;
    }

    // 未找到，回退默认
    const defaultSound = this.builtinSounds[0];
    this.activeSoundId = defaultSound.id;
    this.timerEnd.src = defaultSound.url;
  },

  // 选择切换提示音
  async selectSound(soundId) {
    await this.applySelectedSound(soundId);
    this.renderModalLists();
  },

  playTick() {
    if (!this.enabled) return;
    this.tick.currentTime = 0;
    this.tick.play().catch(() => {});
  },

  playEnd() {
    if (!this.enabled) return;
    this.stopPreview();
    this.timerEnd.currentTime = 0;
    this.timerEnd.play().catch(() => {});
  },

  stopEnd() {
    this.timerEnd.pause();
    this.timerEnd.currentTime = 0;
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('fitness_sound_enabled_v1', this.enabled ? 'true' : 'false');
    if (!this.enabled) {
      this.tick.pause();
      this.stopEnd();
      this.stopPreview();
    }
    this.updateNavbarSoundIcon();
    return this.enabled;
  },

  // 播放试听音频
  previewSound(soundId, urlOrDataUrl) {
    if (this.previewAudio && this.currentlyPlayingId === soundId) {
      this.stopPreview();
      return;
    }

    this.stopPreview();
    this.stopEnd();

    this.previewAudio = new Audio(urlOrDataUrl);
    this.previewAudio.volume = 0.8;
    this.currentlyPlayingId = soundId;
    this.renderModalLists();

    this.previewAudio.onended = () => {
      this.currentlyPlayingId = null;
      this.renderModalLists();
    };

    this.previewAudio.play().catch(e => {
      console.warn('[AudioMgr] 试听播放失败:', e);
      this.currentlyPlayingId = null;
      this.renderModalLists();
    });
  },

  stopPreview() {
    if (this.previewAudio) {
      this.previewAudio.pause();
      this.previewAudio.currentTime = 0;
      this.previewAudio = null;
    }
    this.currentlyPlayingId = null;
    this.renderModalLists();
  },

  // 更新 Navbar 声音按钮状态图标 & 模态框内开关同步
  updateNavbarSoundIcon() {
    const btn = document.getElementById('sound-toggle');
    if (btn) {
      btn.innerHTML = this.enabled
        ? '<i class="fa-solid fa-volume-high text-sm"></i>'
        : '<i class="fa-solid fa-volume-xmark text-sm"></i>';
      btn.classList.toggle('text-slate-400', !this.enabled);
      btn.classList.toggle('text-blue-600', this.enabled);
    }

    // 更新弹窗内独立滑块按钮 UI 状态
    const toggleBtn = document.getElementById('sound-modal-master-toggle-btn');
    const knob = document.getElementById('sound-modal-master-toggle-knob');
    if (toggleBtn && knob) {
      toggleBtn.classList.toggle('bg-blue-600', this.enabled);
      toggleBtn.classList.toggle('bg-slate-300', !this.enabled);
      knob.classList.toggle('translate-x-5', this.enabled);
      knob.classList.toggle('translate-x-0', !this.enabled);
    }
  },

  // 绑定事件
  bindEvents() {
    // 1. 原音频图标 (sound-toggle)：点击快速开启/静音音效
    const toggleBtn = document.getElementById('sound-toggle');
    if (toggleBtn) {
      toggleBtn.title = '开启/静音提示音';
      toggleBtn.onclick = (e) => {
        e.preventDefault();
        this.toggle();
      };
    }

    // 2. 独立设置按钮 (sound-config-btn)：点击打开提示音与音效设置弹窗
    const configBtn = document.getElementById('sound-config-btn');
    if (configBtn) {
      configBtn.title = '提示音与音效设置';
      configBtn.onclick = (e) => {
        e.preventDefault();
        this.openModal();
      };
    }

    // 模态框事件绑定
    const closeBtn = document.getElementById('sound-settings-close-btn');
    const backdrop = document.getElementById('sound-settings-backdrop');
    closeBtn?.addEventListener('click', () => this.closeModal());
    backdrop?.addEventListener('click', () => this.closeModal());

    // 模态框主开关滑块按钮点击
    const masterToggleBtn = document.getElementById('sound-modal-master-toggle-btn');
    if (masterToggleBtn) {
      masterToggleBtn.onclick = (e) => {
        e.preventDefault();
        this.toggle();
      };
    }

    // 文件上传监听
    const fileInput = document.getElementById('custom-audio-upload-input');
    if (fileInput) {
      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const newSound = await this.saveCustomSound(file);
          if (newSound) {
            await this.selectSound(newSound.id);
          }
        } catch (err) {
          alert(err.message || '音频上传失败');
        } finally {
          fileInput.value = '';
        }
      };
    }
  },

  // 打开弹窗
  async openModal() {
    await this.loadCustomSounds();
    const modal = document.getElementById('sound-settings-modal');
    const backdrop = document.getElementById('sound-settings-backdrop');
    const panel = document.getElementById('sound-settings-panel');

    if (!modal) return;

    this.updateNavbarSoundIcon();

    modal.classList.remove('hidden');
    setTimeout(() => {
      backdrop?.classList.remove('opacity-0');
      panel?.classList.remove('translate-y-full');
    }, 10);

    this.renderModalLists();
  },

  // 关闭弹窗
  closeModal() {
    this.stopPreview();
    const backdrop = document.getElementById('sound-settings-backdrop');
    const panel = document.getElementById('sound-settings-panel');
    const modal = document.getElementById('sound-settings-modal');

    backdrop?.classList.add('opacity-0');
    panel?.classList.add('translate-y-full');

    setTimeout(() => {
      modal?.classList.add('hidden');
    }, 300);
  },

  // 渲染列表 (内置 + 自定义)
  renderModalLists() {
    const builtinBox = document.getElementById('builtin-sounds-list');
    const customBox = document.getElementById('custom-sounds-list');

    // 1. 渲染内置音效
    if (builtinBox) {
      builtinBox.innerHTML = this.builtinSounds
        .map(sound => {
          const isSelected = this.activeSoundId === sound.id;
          const isPlaying = this.currentlyPlayingId === sound.id;

          return `
            <div class="flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              isSelected
                ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-bold'
                : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
            }">
              <div class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0" onclick="AudioMgr.selectSound('${sound.id}')">
                <input type="radio" name="sound-option" ${isSelected ? 'checked' : ''} class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer">
                <span class="text-xs truncate">${sound.name}</span>
                ${isSelected ? '<span class="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.2 rounded-full font-bold">已选</span>' : ''}
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  isPlaying
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600'
                }" onclick="AudioMgr.previewSound('${sound.id}', '${sound.url}')">
                  <i class="fa-solid ${isPlaying ? 'fa-square' : 'fa-play'} text-[10px]"></i>
                  <span>${isPlaying ? '停止' : '试听'}</span>
                </button>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 渲染自定义音效
    if (customBox) {
      if (this.customSoundsCache.length === 0) {
        customBox.innerHTML = `<div class="text-center py-4 text-xs text-indigo-400/80 font-medium">暂无自定义提示音，请点击上方按钮上传</div>`;
      } else {
        customBox.innerHTML = this.customSoundsCache
          .map(sound => {
            const isSelected = this.activeSoundId === sound.id;
            const isPlaying = this.currentlyPlayingId === sound.id;

            return `
              <div class="flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-indigo-100/70 border-indigo-300 text-indigo-950 font-bold'
                  : 'bg-white border-indigo-100/60 hover:border-indigo-200 text-slate-700'
              }">
                <div class="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0" onclick="AudioMgr.selectSound('${sound.id}')">
                  <input type="radio" name="sound-option" ${isSelected ? 'checked' : ''} class="w-4 h-4 text-indigo-600 border-indigo-300 focus:ring-indigo-500 cursor-pointer">
                  <div class="min-w-0">
                    <div class="text-xs truncate flex items-center gap-1.5">
                      <span>${sound.name}</span>
                      ${isSelected ? '<span class="text-[10px] bg-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">已选</span>' : ''}
                    </div>
                    <div class="text-[10px] text-slate-400 font-normal">${sound.size || '本地声音'}</div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isPlaying
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                  }" onclick="AudioMgr.previewSound('${sound.id}', '${sound.dataUrl}')">
                    <i class="fa-solid ${isPlaying ? 'fa-square' : 'fa-play'} text-[10px]"></i>
                    <span>${isPlaying ? '停止' : '试听'}</span>
                  </button>
                  <button type="button" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors" onclick="AudioMgr.deleteCustomSound('${sound.id}')" title="删除自定义音频">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>
            `;
          })
          .join('');
      }
    }
  }
};

window.AudioMgr = AudioMgr;
