import { WebSocketServer } from 'ws';

// 房间管理
const rooms = new Map(); // roomCode -> { host: ws, remotes: Set<ws>, createdAt, lastActivity }
const clientRooms = new Map(); // ws -> roomCode

// 生成6位配对码
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 清理过期房间（5分钟无活动）
function cleanupRooms() {
  const now = Date.now();
  const timeout = 5 * 60 * 1000; // 5分钟

  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActivity > timeout) {
      // 通知所有客户端
      const msg = JSON.stringify({ type: 'room_expired', message: '房间已过期' });
      if (room.host && room.host.readyState === 1) {
        room.host.send(msg);
        room.host.close();
      }
      room.remotes.forEach(remote => {
        if (remote.readyState === 1) {
          remote.send(msg);
          remote.close();
        }
      });
      rooms.delete(code);
    }
  }
}

// 每分钟清理一次过期房间
setInterval(cleanupRooms, 60 * 1000);

// 广播消息给房间内除发送者外的所有客户端
function broadcast(roomCode, sender, message) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const data = JSON.stringify(message);

  // 发送给host
  if (sender !== room.host && room.host && room.host.readyState === 1) {
    room.host.send(data);
  }

  // 发送给所有remote
  room.remotes.forEach(remote => {
    if (sender !== remote && remote.readyState === 1) {
      remote.send(data);
    }
  });
}

// 发送消息给指定客户端
function sendTo(ws, message) {
  if (ws && ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

// 处理WebSocket连接
function handleConnection(ws) {
  console.log('[WS] 新客户端连接');

  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleMessage(ws, message);
    } catch (e) {
      console.error('[WS] 消息解析失败:', e);
      sendTo(ws, { type: 'error', message: '消息格式错误' });
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });

  ws.on('error', (error) => {
    console.error('[WS] 客户端错误:', error);
  });
}

// 处理消息
function handleMessage(ws, message) {
  const { type, action, payload } = message;

  switch (type) {
    case 'create_room':
      handleCreateRoom(ws);
      break;

    case 'join_room':
      handleJoinRoom(ws, payload?.code);
      break;

    case 'command':
      handleCommand(ws, action, payload);
      break;

    case 'status':
      handleStatusUpdate(ws, payload);
      break;

    case 'heartbeat':
      handleHeartbeat(ws);
      break;

    case 'leave_room':
      handleLeaveRoom(ws);
      break;

    default:
      sendTo(ws, { type: 'error', message: `未知消息类型: ${type}` });
  }
}

// 创建房间（电脑端调用）
function handleCreateRoom(ws) {
  // 如果已在房间中，先离开
  if (clientRooms.has(ws)) {
    handleLeaveRoom(ws);
  }

  let roomCode;
  do {
    roomCode = generateRoomCode();
  } while (rooms.has(roomCode));

  const room = {
    host: ws,
    remotes: new Set(),
    createdAt: Date.now(),
    lastActivity: Date.now()
  };

  rooms.set(roomCode, room);
  clientRooms.set(ws, roomCode);

  console.log(`[WS] 房间已创建: ${roomCode}`);

  sendTo(ws, {
    type: 'room_created',
    code: roomCode,
    message: '房间已创建，等待手机端连接'
  });
}

// 加入房间（手机端调用）
function handleJoinRoom(ws, code) {
  if (!code || typeof code !== 'string') {
    sendTo(ws, { type: 'error', message: '配对码无效' });
    return;
  }

  const roomCode = code.toUpperCase().trim();
  const room = rooms.get(roomCode);

  if (!room) {
    sendTo(ws, { type: 'join_failed', message: '房间不存在或已过期' });
    return;
  }

  // 如果已在房间中，先离开
  if (clientRooms.has(ws)) {
    handleLeaveRoom(ws);
  }

  room.remotes.add(ws);
  room.lastActivity = Date.now();
  clientRooms.set(ws, roomCode);

  console.log(`[WS] 设备加入房间: ${roomCode}, 当前远程设备数: ${room.remotes.size}`);

  // 通知手机端加入成功
  sendTo(ws, {
    type: 'joined',
    code: roomCode,
    message: '已成功连接'
  });

  // 通知电脑端有新设备加入
  sendTo(room.host, {
    type: 'remote_connected',
    count: room.remotes.size,
    message: '手机端已连接'
  });
}

// 处理命令（手机端发送）
function handleCommand(ws, action, payload) {
  const roomCode = clientRooms.get(ws);
  if (!roomCode) {
    sendTo(ws, { type: 'error', message: '未连接到房间' });
    return;
  }

  const room = rooms.get(roomCode);
  if (!room) {
    sendTo(ws, { type: 'error', message: '房间不存在' });
    return;
  }

  // 验证命令类型
  const validCommands = [
    'start_workout',
    'complete_set',
    'skip_rest',
    'next_set',
    'reset',
    'adjust_rest',
    'start_free_timer',
    'pause_free_timer',
    'reset_free_timer'
  ];

  if (!validCommands.includes(action)) {
    sendTo(ws, { type: 'error', message: `无效命令: ${action}` });
    return;
  }

  room.lastActivity = Date.now();

  // 转发命令给电脑端
  sendTo(room.host, {
    type: 'command',
    action,
    payload,
    timestamp: Date.now()
  });

  console.log(`[WS] 命令转发: ${action} -> 房间 ${roomCode}`);
}

// 处理状态更新（电脑端发送）
function handleStatusUpdate(ws, payload) {
  const roomCode = clientRooms.get(ws);
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (!room || room.host !== ws) return; // 只有host可以发送状态

  room.lastActivity = Date.now();

  // 转发状态给所有手机端
  const message = {
    type: 'status',
    payload,
    timestamp: Date.now()
  };

  room.remotes.forEach(remote => {
    if (remote.readyState === 1) {
      remote.send(JSON.stringify(message));
    }
  });
}

// 处理心跳
function handleHeartbeat(ws) {
  const roomCode = clientRooms.get(ws);
  if (roomCode) {
    const room = rooms.get(roomCode);
    if (room) {
      room.lastActivity = Date.now();
    }
  }
  sendTo(ws, { type: 'heartbeat_ack', timestamp: Date.now() });
}

// 处理离开房间
function handleLeaveRoom(ws) {
  const roomCode = clientRooms.get(ws);
  if (!roomCode) return;

  const room = rooms.get(roomCode);
  if (!room) {
    clientRooms.delete(ws);
    return;
  }

  if (room.host === ws) {
    // 电脑端离开，关闭整个房间
    const msg = JSON.stringify({ type: 'room_closed', message: '电脑端已断开连接' });
    room.remotes.forEach(remote => {
      if (remote.readyState === 1) {
        remote.send(msg);
        remote.close();
      }
    });
    rooms.delete(roomCode);
    console.log(`[WS] 房间已关闭（电脑端离开）: ${roomCode}`);
  } else {
    // 手机端离开
    room.remotes.delete(ws);
    room.lastActivity = Date.now();

    // 通知电脑端
    sendTo(room.host, {
      type: 'remote_disconnected',
      count: room.remotes.size,
      message: '手机端已断开'
    });

    console.log(`[WS] 手机端离开房间: ${roomCode}, 剩余: ${room.remotes.size}`);
  }

  clientRooms.delete(ws);
}

// 处理断开连接
function handleDisconnect(ws) {
  handleLeaveRoom(ws);
  console.log('[WS] 客户端断开');
}

// 初始化WebSocket服务器
export function initWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws-sync'
  });

  wss.on('connection', handleConnection);

  // 心跳检测
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  console.log('[WS] WebSocket 服务器已启动，路径: /ws-sync');

  return wss;
}
