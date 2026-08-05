/* eslint-disable no-undef */
// 跨平台同步模块 - WebSocket客户端
// 作为 App 的 mixin，通过 Object.assign 混入
const SyncModule = {
  SYNC_SERVER_KEY: 'fitness_sync_server_url',
  SYNC_ROLE_KEY: 'fitness_sync_role',
  SYNC_ROOM_KEY: 'fitness_sync_room',
  SYNC_PERSIST_KEY: 'fitness_sync_persist',
  HEARTBEAT_INTERVAL: 25000,
  RECONNECT_DELAY: 3000,
  MAX_RECONNECT_ATTEMPTS: 10,
  STATUS_SYNC_INTERVAL: 1000,
  AUTO_RECONNECT_DELAY: 2000,

  syncState: {
    ws: null,
    role: null, // 'host' | 'remote'
    roomCode: null,
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
    reconnectTimer: null,
    heartbeatTimer: null,
    statusSyncTimer: null,
    serverUrl: '',
    persistEnabled: false
  },

  // 初始化同步模块
  initSync() {
    // 缓存同步相关DOM
    this.dom.syncBtn = document.getElementById('sync-btn');
    this.dom.syncModal = document.getElementById('sync-modal');
    this.dom.syncBackdrop = document.getElementById('sync-backdrop');
    this.dom.syncPanel = document.getElementById('sync-panel');
    this.dom.syncCloseBtn = document.getElementById('sync-close-btn');
    this.dom.syncStatusIcon = document.getElementById('sync-btn');

    // 面板内容
    this.dom.syncMainView = document.getElementById('sync-main-view');
    this.dom.syncHostView = document.getElementById('sync-host-view');
    this.dom.syncRemoteView = document.getElementById('sync-remote-view');
    this.dom.syncRemoteControls = document.getElementById('sync-remote-controls');

    // 电脑端元素
    this.dom.syncRoomCode = document.getElementById('sync-room-code');
    this.dom.syncCreateBtn = document.getElementById('sync-create-btn');
    this.dom.syncDisconnectBtn = document.getElementById('sync-disconnect-btn');
    this.dom.syncRemoteCount = document.getElementById('sync-remote-count');
    this.dom.syncClearPersistBtnHost = document.getElementById('sync-clear-persist-btn-host');

    // 手机端元素
    this.dom.syncCodeInput = document.getElementById('sync-code-input');
    this.dom.syncJoinBtn = document.getElementById('sync-join-btn');
    this.dom.syncRemoteDisconnectBtn = document.getElementById('sync-remote-disconnect-btn');
    this.dom.syncClearPersistBtn = document.getElementById('sync-clear-persist-btn');

    // 手机端控制按钮
    this.dom.remoteActionBtn = document.getElementById('remote-action-btn');
    this.dom.remoteSkipBtn = document.getElementById('remote-skip-btn');
    this.dom.remoteResetBtn = document.getElementById('remote-reset-btn');
    this.dom.remoteMinus10Btn = document.getElementById('remote-minus-10-btn');
    this.dom.remotePlus10Btn = document.getElementById('remote-plus-10-btn');
    this.dom.remoteAdjustRestRow = document.getElementById('remote-adjust-rest-row');

    // 状态显示
    this.dom.syncStatusText = document.getElementById('sync-status-text');
    this.dom.syncCurrentExercise = document.getElementById('sync-current-exercise');
    this.dom.syncCurrentSet = document.getElementById('sync-current-set');
    this.dom.syncTimeLeft = document.getElementById('sync-time-left');

    // 持久化开关
    this.dom.syncPersistToggle = document.getElementById('sync-persist-toggle');

    // 加载保存的配对信息
    this.loadPersistedSync();

    this.bindSyncEvents();
    this.updateSyncUI();

    // 自动重连（如果启用了持久化）
    this.tryAutoReconnect();
  },

  // 绑定同步相关事件
  bindSyncEvents() {
    // 打开同步面板
    this.dom.syncBtn?.addEventListener('click', () => this.openSyncModal());

    // 关闭同步面板
    this.dom.syncCloseBtn?.addEventListener('click', () => this.closeSyncModal());
    this.dom.syncBackdrop?.addEventListener('click', () => this.closeSyncModal());

    // 创建房间（电脑端）
    this.dom.syncCreateBtn?.addEventListener('click', () => this.createRoom());

    // 加入房间（手机端）
    this.dom.syncJoinBtn?.addEventListener('click', () => this.joinRoom());

    // 断开连接
    this.dom.syncDisconnectBtn?.addEventListener('click', () => this.disconnect());
    this.dom.syncRemoteDisconnectBtn?.addEventListener('click', () => this.disconnect());

    // 清除配对信息
    this.dom.syncClearPersistBtn?.addEventListener('click', () => {
      this.disconnect(true);
      this.showSyncMessage('配对信息已清除', 'info');
    });
    this.dom.syncClearPersistBtnHost?.addEventListener('click', () => {
      this.disconnect(true);
      this.showSyncMessage('配对信息已清除', 'info');
    });

    // 手机端控制按钮
    this.dom.remoteActionBtn?.addEventListener('click', () => this.sendRemoteCommand('complete_set'));
    this.dom.remoteSkipBtn?.addEventListener('click', () => this.sendRemoteCommand('skip_rest'));
    this.dom.remoteResetBtn?.addEventListener('click', () => this.sendRemoteCommand('reset'));
    this.dom.remoteMinus10Btn?.addEventListener('click', () => this.sendRemoteCommand('adjust_rest', { seconds: -10 }));
    this.dom.remotePlus10Btn?.addEventListener('click', () => this.sendRemoteCommand('adjust_rest', { seconds: 10 }));

    // 输入框回车
    this.dom.syncCodeInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.joinRoom();
    });

    // 自动大写输入
    this.dom.syncCodeInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });

    // 持久化开关
    this.dom.syncPersistToggle?.addEventListener('change', (e) => {
      this.syncState.persistEnabled = e.target.checked;
      this.savePersistedSync();
    });

    // 页面关闭时保存配对信息（不断开连接）
    window.addEventListener('pagehide', () => {
      if (this.syncState.persistEnabled) {
        this.savePersistedSync();
      }
    });
    window.addEventListener('beforeunload', () => {
      if (this.syncState.persistEnabled) {
        this.savePersistedSync();
      }
    });

    // 页面可见性变化时尝试重连
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.syncState.persistEnabled) {
        this.tryAutoReconnect();
      }
    });
  },

  // 打开同步面板
  openSyncModal() {
    this.dom.syncModal.classList.remove('hidden');
    setTimeout(() => {
      this.dom.syncBackdrop.classList.remove('opacity-0');
      this.dom.syncPanel.classList.remove('translate-y-full');
    }, 10);
  },

  // 关闭同步面板
  closeSyncModal() {
    this.dom.syncBackdrop.classList.add('opacity-0');
    this.dom.syncPanel.classList.add('translate-y-full');
    setTimeout(() => {
      this.dom.syncModal.classList.add('hidden');
    }, 300);
  },

  // 检测是否为移动设备
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  // 加载持久化的配对信息
  loadPersistedSync() {
    try {
      const persistData = localStorage.getItem(this.SYNC_PERSIST_KEY);
      if (persistData) {
        const data = JSON.parse(persistData);
        this.syncState.persistEnabled = data.enabled || false;
        this.syncState.role = data.role || null;
        this.syncState.roomCode = data.roomCode || null;
        this.syncState.serverUrl = data.serverUrl || '';

        // 更新UI开关
        if (this.dom.syncPersistToggle) {
          this.dom.syncPersistToggle.checked = this.syncState.persistEnabled;
        }

        // 恢复输入框的配对码
        if (this.dom.syncCodeInput && data.roomCode) {
          this.dom.syncCodeInput.value = data.roomCode;
        }
      }
    } catch (e) {
      console.error('[Sync] 加载持久化数据失败:', e);
    }
  },

  // 保存持久化的配对信息
  savePersistedSync() {
    try {
      const data = {
        enabled: this.syncState.persistEnabled,
        role: this.syncState.role,
        roomCode: this.syncState.roomCode,
        serverUrl: this.syncState.serverUrl,
        lastSaved: Date.now()
      };
      localStorage.setItem(this.SYNC_PERSIST_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('[Sync] 保存持久化数据失败:', e);
    }
  },

  // 清除持久化的配对信息
  clearPersistedSync() {
    localStorage.removeItem(this.SYNC_PERSIST_KEY);
    this.syncState.persistEnabled = false;
    this.syncState.role = null;
    this.syncState.roomCode = null;
    if (this.dom.syncPersistToggle) {
      this.dom.syncPersistToggle.checked = false;
    }
  },

  // 尝试自动重连
  tryAutoReconnect() {
    if (!this.syncState.persistEnabled) return;
    if (this.syncState.connected || this.syncState.connecting) return;
    if (!this.syncState.role || !this.syncState.roomCode) return;

    console.log('[Sync] 尝试自动重连...');
    setTimeout(() => {
      this.connectToServer();
    }, this.AUTO_RECONNECT_DELAY);
  },

  // 获取WebSocket服务器URL
  getWsUrl() {
    // 如果已保存，使用保存的URL
    if (this.syncState.serverUrl) {
      return this.syncState.serverUrl;
    }

    // 自动检测：使用当前页面的host，连接到/ws-sync路径
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws-sync`;
  },

  // 创建房间（电脑端）
  createRoom() {
    if (this.syncState.connected) {
      this.showSyncMessage('已连接，请先断开', 'warning');
      return;
    }

    this.syncState.role = 'host';
    this.connectToServer();
  },

  // 加入房间（手机端）
  joinRoom() {
    const code = this.dom.syncCodeInput?.value?.trim();
    if (!code || code.length !== 6) {
      this.showSyncMessage('请输入6位配对码', 'warning');
      return;
    }

    if (this.syncState.connected) {
      this.showSyncMessage('已连接，请先断开', 'warning');
      return;
    }

    this.syncState.role = 'remote';
    this.syncState.roomCode = code;
    this.connectToServer();
  },

  // 连接到WebSocket服务器
  connectToServer() {
    if (this.syncState.connecting || this.syncState.connected) return;

    const wsUrl = this.getWsUrl();
    if (!wsUrl) {
      this.showSyncMessage('服务器地址未配置', 'error');
      return;
    }

    this.syncState.connecting = true;
    this.updateSyncUI();
    this.showSyncMessage('正在连接...', 'info');

    try {
      this.syncState.ws = new WebSocket(wsUrl);

      this.syncState.ws.onopen = () => {
        console.log('[Sync] WebSocket 已连接');
        this.syncState.connected = true;
        this.syncState.connecting = false;
        this.syncState.reconnectAttempts = 0;

        // 发送创建或加入房间请求
        if (this.syncState.role === 'host') {
          this.sendMessage({ type: 'create_room' });
        } else {
          this.sendMessage({ type: 'join_room', payload: { code: this.syncState.roomCode } });
        }

        this.startHeartbeat();
        this.updateSyncUI();
      };

      this.syncState.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('[Sync] 消息解析失败:', e);
        }
      };

      this.syncState.ws.onclose = () => {
        console.log('[Sync] WebSocket 已断开');
        this.handleDisconnect();
      };

      this.syncState.ws.onerror = (error) => {
        console.error('[Sync] WebSocket 错误:', error);
        this.showSyncMessage('连接失败', 'error');
      };
    } catch (e) {
      console.error('[Sync] 连接错误:', e);
      this.syncState.connecting = false;
      this.updateSyncUI();
      this.showSyncMessage('连接失败', 'error');
    }
  },

  // 处理接收到的消息
  handleMessage(message) {
    const { type, code, action, payload, message: msg } = message;

    switch (type) {
      case 'room_created':
        this.syncState.roomCode = code;
        this.showSyncMessage(`房间已创建: ${code}`, 'success');
        this.updateSyncUI();
        this.startStatusSync();
        break;

      case 'joined':
        this.syncState.roomCode = code;
        this.showSyncMessage('已成功连接', 'success');
        this.updateSyncUI();
        break;

      case 'join_failed':
        this.showSyncMessage(msg || '加入失败', 'error');
        this.disconnect();
        break;

      case 'remote_connected':
        this.showSyncMessage(`手机端已连接 (${message.count})`, 'success');
        this.updateSyncUI();
        break;

      case 'remote_disconnected':
        this.showSyncMessage(`手机端已断开 (${message.count})`, 'info');
        this.updateSyncUI();
        break;

      case 'command':
        this.handleRemoteCommand(action, payload);
        break;

      case 'status':
        this.handleStatusUpdate(payload);
        break;

      case 'room_closed':
      case 'room_expired':
        this.showSyncMessage(msg || '房间已关闭', 'warning');
        this.disconnect();
        break;

      case 'heartbeat_ack':
        // 心跳响应，忽略
        break;

      case 'error':
        this.showSyncMessage(msg || '发生错误', 'error');
        break;

      default:
        console.log('[Sync] 未知消息类型:', type);
    }
  },

  // 处理远程命令（电脑端接收）
  handleRemoteCommand(action, payload) {
    console.log('[Sync] 收到远程命令:', action);

    switch (action) {
      case 'start_workout':
      case 'complete_set':
      case 'next_set':
        this.toggleWorkout();
        break;

      case 'skip_rest':
        if (this.state.mode === 'workout_rest' || this.state.mode === 'workout_rest_end') {
          this.finishRest();
        }
        break;

      case 'reset':
        this.resetWorkoutState();
        break;

      case 'adjust_rest':
        if (payload?.seconds) {
          this.adjustRestTime(payload.seconds);
        }
        break;

      case 'start_free_timer':
        if (this.state.mode !== 'timer_running') {
          this.dom.ftStartBtn?.click();
        }
        break;

      case 'pause_free_timer':
        if (this.state.mode === 'timer_running') {
          this.dom.ftStartBtn?.click();
        }
        break;

      case 'reset_free_timer':
        this.dom.ftResetBtn?.click();
        break;

      default:
        console.log('[Sync] 未知命令:', action);
    }
  },

  // 处理状态更新（手机端接收）
  // 处理状态更新（手机端接收）
  handleStatusUpdate(payload) {
    if (!payload) return;

    const { mode, currentExercise, currentSet, totalSets, timeLeft } = payload;

    // 更新手机端状态显示 Badge 样式
    if (this.dom.syncStatusText) {
      const modeTexts = {
        'idle': '待机中',
        'workout_work': '锻炼中',
        'workout_rest': '休息中',
        'workout_rest_end': '休息结束',
        'timer_running': '计时中',
        'timer_paused': '已暂停'
      };

      const modeBadges = {
        'idle': 'bg-slate-700/60 text-slate-300 border-slate-600/50',
        'workout_work': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        'workout_rest': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        'workout_rest_end': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        'timer_running': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        'timer_paused': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
      };

      this.dom.syncStatusText.textContent = modeTexts[mode] || mode;
      this.dom.syncStatusText.className = `px-3 py-1 rounded-full text-xs font-bold border transition-all ${modeBadges[mode] || modeBadges.idle}`;
    }

    if (this.dom.syncCurrentExercise) {
      this.dom.syncCurrentExercise.textContent = currentExercise || '无';
    }

    if (this.dom.syncCurrentSet) {
      this.dom.syncCurrentSet.textContent = totalSets ? `${currentSet} / ${totalSets}` : '-';
    }

    if (this.dom.syncTimeLeft) {
      if (timeLeft !== undefined && timeLeft > 0) {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        this.dom.syncTimeLeft.textContent = `${m}:${s}`;
      } else {
        this.dom.syncTimeLeft.textContent = '--:--';
      }
    }

    // 休息时显示 10 秒加减微调栏
    if (this.dom.remoteAdjustRestRow) {
      const isResting = mode === 'workout_rest' || mode === 'workout_rest_end';
      this.dom.remoteAdjustRestRow.classList.toggle('hidden', !isResting);
    }

    // 更新手机端控制按钮状态
    this.updateRemoteControlButtons(mode);
  },

  // 更新手机端控制按钮
  updateRemoteControlButtons(mode) {
    if (!this.dom.remoteActionBtn) return;

    const isWorkoutMode = ['workout_work', 'workout_rest', 'workout_rest_end'].includes(mode);

    // 显示/隐藏控制按钮
    if (this.dom.syncRemoteControls) {
      this.dom.syncRemoteControls.classList.toggle('hidden', !isWorkoutMode && mode !== 'idle');
    }

    const baseClass = 'w-full py-4 rounded-2xl text-white font-extrabold text-base shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer';

    // 更新主按钮
    switch (mode) {
      case 'idle':
        this.dom.remoteActionBtn.innerHTML = '<i class="fa-solid fa-play text-sm"></i><span>开始训练</span>';
        this.dom.remoteActionBtn.className = `${baseClass} bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700`;
        break;
      case 'workout_work':
        this.dom.remoteActionBtn.innerHTML = '<i class="fa-solid fa-check text-base"></i><span>完成本组</span>';
        this.dom.remoteActionBtn.className = `${baseClass} bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700`;
        break;
      case 'workout_rest':
        this.dom.remoteActionBtn.innerHTML = '<i class="fa-solid fa-forward text-sm"></i><span>跳过休息</span>';
        this.dom.remoteActionBtn.className = `${baseClass} bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600`;
        break;
      case 'workout_rest_end':
        this.dom.remoteActionBtn.innerHTML = '<i class="fa-solid fa-play text-sm"></i><span>开始下一组</span>';
        this.dom.remoteActionBtn.className = `${baseClass} bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700`;
        break;
    }
  },

  // 发送远程命令（手机端发送）
  sendRemoteCommand(action, payload) {
    if (!this.syncState.connected) {
      this.showSyncMessage('未连接', 'warning');
      return;
    }

    this.sendMessage({
      type: 'command',
      action,
      payload
    });
  },

  // 发送状态更新（电脑端发送）
  sendStatusUpdate() {
    if (!this.syncState.connected || this.syncState.role !== 'host') return;

    const plan = this.state.currentPlan;
    const currentEx = plan?.exercises?.[this.state.currentExerciseIdx];

    this.sendMessage({
      type: 'status',
      payload: {
        mode: this.state.mode,
        currentExercise: currentEx?.name || '',
        currentSet: this.state.currentSet,
        totalSets: currentEx?.sets || 0,
        timeLeft: this.state.timeLeft,
        totalDuration: this.state.totalDuration,
        planTitle: plan?.title || ''
      }
    });
  },

  // 开始状态同步定时器
  startStatusSync() {
    this.stopStatusSync();
    if (this.syncState.role === 'host') {
      this.syncState.statusSyncTimer = setInterval(() => {
        this.sendStatusUpdate();
      }, this.STATUS_SYNC_INTERVAL);
    }
  },

  // 停止状态同步定时器
  stopStatusSync() {
    if (this.syncState.statusSyncTimer) {
      clearInterval(this.syncState.statusSyncTimer);
      this.syncState.statusSyncTimer = null;
    }
  },

  // 发送消息
  sendMessage(message) {
    if (this.syncState.ws && this.syncState.ws.readyState === WebSocket.OPEN) {
      this.syncState.ws.send(JSON.stringify(message));
    }
  },

  // 开始心跳
  startHeartbeat() {
    this.stopHeartbeat();
    this.syncState.heartbeatTimer = setInterval(() => {
      this.sendMessage({ type: 'heartbeat' });
    }, this.HEARTBEAT_INTERVAL);
  },

  // 停止心跳
  stopHeartbeat() {
    if (this.syncState.heartbeatTimer) {
      clearInterval(this.syncState.heartbeatTimer);
      this.syncState.heartbeatTimer = null;
    }
  },

  // 处理断开连接
  handleDisconnect() {
    this.syncState.connected = false;
    this.syncState.connecting = false;
    this.stopHeartbeat();
    this.stopStatusSync();

    if (this.syncState.ws) {
      this.syncState.ws = null;
    }

    // 如果启用了持久化，尝试自动重连
    if (this.syncState.persistEnabled && this.syncState.roomCode) {
      this.tryReconnect();
    }

    this.updateSyncUI();
  },

  // 尝试重连
  tryReconnect() {
    if (this.syncState.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.showSyncMessage('重连失败，请重新连接', 'error');
      this.syncState.roomCode = null;
      return;
    }

    this.syncState.reconnectAttempts++;
    console.log(`[Sync] 尝试重连 (${this.syncState.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);

    this.syncState.reconnectTimer = setTimeout(() => {
      this.connectToServer();
    }, this.RECONNECT_DELAY);
  },

  // 断开连接
  disconnect(clearPersist = false) {
    // 清除重连定时器
    if (this.syncState.reconnectTimer) {
      clearTimeout(this.syncState.reconnectTimer);
      this.syncState.reconnectTimer = null;
    }

    // 发送离开消息
    if (this.syncState.connected) {
      this.sendMessage({ type: 'leave_room' });
    }

    // 关闭WebSocket
    if (this.syncState.ws) {
      this.syncState.ws.close();
      this.syncState.ws = null;
    }

    this.syncState.connected = false;
    this.syncState.connecting = false;
    this.syncState.reconnectAttempts = 0;
    this.stopHeartbeat();
    this.stopStatusSync();

    // 如果明确要求清除持久化，或者未启用持久化，则清除配对信息
    if (clearPersist || !this.syncState.persistEnabled) {
      this.syncState.roomCode = null;
      this.syncState.role = null;
      if (clearPersist) {
        this.clearPersistedSync();
      }
    } else {
      // 保存当前状态以便重连
      this.savePersistedSync();
    }

    this.updateSyncUI();
    this.showSyncMessage('已断开连接', 'info');
  },

  // 更新同步UI
  updateSyncUI() {
    const { connected, connecting, role, roomCode, persistEnabled } = this.syncState;
    const isMobile = this.isMobile();

    // 更新连接状态图标
    if (this.dom.syncBtn) {
      if (connected) {
        this.dom.syncBtn.className = 'w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors';
        this.dom.syncBtn.innerHTML = '<i class="fa-solid fa-link text-sm"></i>';
      } else if (connecting) {
        this.dom.syncBtn.className = 'w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 hover:bg-yellow-200 transition-colors animate-pulse';
        this.dom.syncBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin text-sm"></i>';
      } else if (persistEnabled && roomCode) {
        // 持久化模式且有保存的配对码
        this.dom.syncBtn.className = 'w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors';
        this.dom.syncBtn.innerHTML = '<i class="fa-solid fa-link text-sm"></i>';
      } else {
        this.dom.syncBtn.className = 'w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors';
        this.dom.syncBtn.innerHTML = '<i class="fa-solid fa-link text-sm"></i>';
      }
    }

    // 显示/隐藏视图
    if (this.dom.syncMainView) {
      this.dom.syncMainView.classList.toggle('hidden', connected);
    }
    if (this.dom.syncHostView) {
      this.dom.syncHostView.classList.toggle('hidden', !connected || role !== 'host');
    }
    if (this.dom.syncRemoteView) {
      this.dom.syncRemoteView.classList.toggle('hidden', !connected || role !== 'remote');
    }

    // 显示房间码
    if (this.dom.syncRoomCode && roomCode) {
      this.dom.syncRoomCode.textContent = roomCode;
    }

    // 根据设备类型显示不同提示
    if (this.dom.syncMainView && !connected) {
      const hint = this.dom.syncMainView.querySelector('.sync-hint');
      if (hint) {
        if (persistEnabled && roomCode) {
          hint.textContent = '已保存配对信息，正在尝试重连...';
        } else {
          hint.textContent = isMobile
            ? '在电脑端创建房间后，输入配对码连接'
            : '创建房间，然后在手机端输入配对码连接';
        }
      }
    }

    // 更新持久化开关状态
    if (this.dom.syncPersistToggle) {
      this.dom.syncPersistToggle.checked = persistEnabled;
    }
  },

  // 显示同步消息
  showSyncMessage(text, type = 'info') {
    // 移除旧消息
    const existing = document.querySelector('.sync-toast');
    if (existing) existing.remove();

    const config = {
      info: { bg: 'bg-slate-900/90 border-slate-700/60', icon: 'fa-solid fa-circle-info text-blue-400' },
      success: { bg: 'bg-slate-900/90 border-emerald-500/40', icon: 'fa-solid fa-circle-check text-emerald-400' },
      warning: { bg: 'bg-slate-900/90 border-amber-500/40', icon: 'fa-solid fa-triangle-exclamation text-amber-400' },
      error: { bg: 'bg-slate-900/90 border-rose-500/40', icon: 'fa-solid fa-circle-xmark text-rose-400' }
    };

    const item = config[type] || config.info;

    const toast = document.createElement('div');
    toast.className = `sync-toast fixed top-6 left-1/2 -translate-x-1/2 z-[999999] px-4 py-2.5 rounded-full text-white text-xs font-bold shadow-2xl backdrop-blur-md border ${item.bg} flex items-center gap-2 transition-all duration-300 opacity-0 -translate-y-4 pointer-events-none`;
    toast.innerHTML = `<i class="${item.icon} text-sm"></i><span>${text}</span>`;
    document.body.appendChild(toast);

    // 动画显示
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', '-translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');
    });

    // 自动消失
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', '-translate-y-4');
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }
};

window.SyncModule = SyncModule;
