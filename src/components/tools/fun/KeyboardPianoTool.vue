<template>
  <div class="piano-tool" tabindex="0" @keydown="handleKeyDown" @keyup="handleKeyUp">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>键盘钢琴</h1>
        <span class="nav-subtitle">Keyboard Piano</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <div class="piano-container glass-card">
        <div class="controls">
          <div class="control-group">
            <label>音色</label>
            <select v-model="currentInstrument" class="instrument-select">
              <option v-for="inst in instruments" :key="inst.id" :value="inst.id">
                {{ inst.name }}
              </option>
            </select>
          </div>
          <div class="control-group">
            <label>八度</label>
            <div class="octave-btns">
              <button @click="octave = Math.max(1, octave - 1)">-</button>
              <span>{{ octave }}</span>
              <button @click="octave = Math.min(6, octave + 1)">+</button>
            </div>
          </div>
          <div class="control-group record-controls">
            <button v-if="!isRecording" class="record-btn" @click="startRecording">
              <span class="icon">⏺</span> 录制
            </button>
            <button v-else class="record-btn recording" @click="stopRecording">
              <span class="icon">⏹</span> 停止
            </button>
            <button :disabled="recording.length === 0" class="play-btn" @click="playRecording">
              <span class="icon">▶</span> 播放
            </button>
            <button :disabled="recording.length === 0" class="clear-btn" @click="clearRecording">
              <span class="icon">🗑</span> 清除
            </button>
          </div>
        </div>

        <div class="key-hints">
          <span v-for="key in keyBindings" :key="key.key" class="key-hint">
            {{ key.key.toUpperCase() }}
          </span>
        </div>

        <div class="piano">
          <div
            v-for="note in visibleNotes"
            :key="note.key"
            class="key"
            :class="[note.type, { active: activeKeys.has(note.key) }]"
            :style="note.type === 'black' ? getBlackKeyStyle(note) : {}"
            @mousedown="playNote(note)"
            @mouseup="releaseNote(note)"
            @mouseleave="releaseNote(note)"
          >
            <span class="key-label">{{ note.key }}</span>
          </div>
        </div>

        <div class="keyboard-map">
          <h3>键盘映射</h3>
          <div class="map-grid">
            <div v-for="binding in keyBindings" :key="binding.key" class="map-item">
              <kbd>{{ binding.key.toUpperCase() }}</kbd>
              <span>→</span>
              <span class="note-name">{{ binding.note }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 键盘钢琴</footer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  interface Note {
    key: string;
    note: string;
    type: 'white' | 'black';
    position: number;
  }

  const instruments = [
    { id: 'sine', name: '正弦波' },
    { id: 'square', name: '方波' },
    { id: 'sawtooth', name: '锯齿波' },
    { id: 'triangle', name: '三角波' }
  ];

  const currentInstrument = ref('sine');
  const octave = ref(4);
  const activeKeys = ref<Set<string>>(new Set());
  const isRecording = ref(false);
  const recording = ref<{ note: string; time: number; duration: number }[]>([]);
  const audioContext = ref<AudioContext | null>(null);
  const oscillators = ref<Map<string, OscillatorNode>>(new Map());
  const recordStartTime = ref(0);

  const keyBindings = [
    { key: 'a', note: 'C' },
    { key: 'w', note: 'C#' },
    { key: 's', note: 'D' },
    { key: 'e', note: 'D#' },
    { key: 'd', note: 'E' },
    { key: 'f', note: 'F' },
    { key: 't', note: 'F#' },
    { key: 'g', note: 'G' },
    { key: 'y', note: 'G#' },
    { key: 'h', note: 'A' },
    { key: 'u', note: 'A#' },
    { key: 'j', note: 'B' },
    { key: 'k', note: 'C+' },
    { key: 'o', note: 'C#+' },
    { key: 'l', note: 'D+' },
    { key: 'p', note: 'D#+' },
    { key: ';', note: 'E+' }
  ];

  const noteFrequencies: Record<string, number> = {
    C: 261.63,
    'C#': 277.18,
    D: 293.66,
    'D#': 311.13,
    E: 329.63,
    F: 349.23,
    'F#': 369.99,
    G: 392.0,
    'G#': 415.3,
    A: 440.0,
    'A#': 466.16,
    B: 493.88
  };

  const visibleNotes = computed<Note[]>(() => {
    const notes: Note[] = [];
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C+', 'D+', 'E+'];
    const blackNotes = ['C#', 'D#', 'F#', 'G#', 'A#', 'C#+', 'D#+'];

    let whitePos = 0;
    whiteNotes.forEach(note => {
      notes.push({ key: note, note, type: 'white', position: whitePos++ });
    });

    const blackPositions = [0.7, 1.7, 3.7, 4.7, 5.7, 7.7, 8.7];
    blackNotes.forEach((note, i) => {
      if (i < blackPositions.length) {
        notes.push({ key: note, note, type: 'black', position: blackPositions[i] });
      }
    });

    return notes;
  });

  const getFrequency = (note: string): number => {
    const isHigher = note.endsWith('+');
    const baseNote = isHigher ? note.slice(0, -1) : note;
    let freq = noteFrequencies[baseNote] || 440;

    const oct = isHigher ? octave.value + 1 : octave.value;
    freq = freq * Math.pow(2, oct - 4);

    return freq;
  };

  const getBlackKeyStyle = (note: Note) => {
    const left = note.position * (100 / 10);
    return { left: `${left}%` };
  };

  const initAudio = () => {
    if (!audioContext.value) {
      audioContext.value = new AudioContext();
    }
  };

  const playNote = (note: Note) => {
    initAudio();
    if (activeKeys.value.has(note.key)) return;

    activeKeys.value.add(note.key);

    const ctx = audioContext.value!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = currentInstrument.value as 'sine' | 'square' | 'sawtooth' | 'triangle';
    osc.frequency.value = getFrequency(note.note);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscillators.value.set(note.key, osc);

    if (isRecording.value) {
      const time = Date.now() - recordStartTime.value;
      recording.value.push({ note: note.note, time, duration: 0 });
    }
  };

  const releaseNote = (note: Note) => {
    if (!activeKeys.value.has(note.key)) return;

    activeKeys.value.delete(note.key);

    const osc = oscillators.value.get(note.key);
    if (osc) {
      osc.stop();
      oscillators.value.delete(note.key);
    }

    if (isRecording.value && recording.value.length > 0) {
      const last = recording.value[recording.value.length - 1];
      if (last.note === note.note && last.duration === 0) {
        last.duration = Date.now() - recordStartTime.value - last.time;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const binding = keyBindings.find(b => b.key === e.key.toLowerCase());
    if (binding) {
      const note = visibleNotes.value.find(n => n.note === binding.note);
      if (note) playNote(note);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const binding = keyBindings.find(b => b.key === e.key.toLowerCase());
    if (binding) {
      const note = visibleNotes.value.find(n => n.note === binding.note);
      if (note) releaseNote(note);
    }
  };

  const startRecording = () => {
    recording.value = [];
    isRecording.value = true;
    recordStartTime.value = Date.now();
  };

  const stopRecording = () => {
    isRecording.value = false;
  };

  const playRecording = async () => {
    for (const item of recording.value) {
      await new Promise(resolve =>
        setTimeout(
          resolve,
          item.time -
            (recording.value.indexOf(item) > 0
              ? recording.value[recording.value.indexOf(item) - 1].time
              : 0)
        )
      );

      const note = visibleNotes.value.find(n => n.note === item.note);
      if (note) {
        playNote(note);
        await new Promise(resolve => setTimeout(resolve, item.duration || 200));
        releaseNote(note);
      }
    }
  };

  const clearRecording = () => {
    recording.value = [];
  };

  onMounted(() => {
    (document.querySelector('.piano-tool') as HTMLElement | null)?.focus();
  });

  onUnmounted(() => {
    oscillators.value.forEach(osc => osc.stop());
    if (audioContext.value) {
      audioContext.value.close();
    }
  });
</script>

<style scoped>
  .piano-tool {
    --bg: #f5f7fa;
    --card: #ffffff;
    --text: #2c3e50;
    --text-secondary: #7f8c8d;
    --primary: #409eff;
    --success: #67c23a;
    --danger: #f56c6c;

    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    user-select: none;
    outline: none;
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 60px;
    background: var(--card);
    border-bottom: 1px solid #eef2f7;
  }

  .nav-back,
  .nav-spacer {
    width: 100px;
  }
  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.95rem;
  }

  .nav-center {
    text-align: center;
  }
  .nav-center h1 {
    font-size: 1.15rem;
    margin: 0;
    color: var(--text);
  }
  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-secondary);
    display: block;
    margin-top: 1px;
  }

  .main-content {
    display: flex;
    justify-content: center;
    padding: 2rem 1rem;
    min-height: calc(100vh - 140px);
  }

  .piano-container {
    background: var(--card);
    border-radius: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    width: 100%;
    max-width: 900px;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .control-group label {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .instrument-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    cursor: pointer;
  }

  .octave-btns {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .octave-btns button {
    width: 28px;
    height: 28px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-weight: bold;
  }

  .octave-btns span {
    min-width: 20px;
    text-align: center;
    font-weight: bold;
  }

  .record-controls {
    display: flex;
    gap: 0.5rem;
  }

  .record-btn,
  .play-btn,
  .clear-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .record-btn {
    background: #fff0f0;
    color: var(--danger);
  }
  .record-btn.recording {
    background: var(--danger);
    color: white;
    animation: pulse 1s infinite;
  }
  .play-btn {
    background: #f0fff0;
    color: var(--success);
  }
  .clear-btn {
    background: #f5f5f5;
    color: var(--text-secondary);
  }
  .clear-btn:disabled,
  .play-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  .key-hints {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .key-hint {
    padding: 2px 8px;
    background: #f0f0f0;
    border-radius: 4px;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .piano {
    position: relative;
    height: 180px;
    background: linear-gradient(180deg, #2c2c2c 0%, #1a1a1a 100%);
    border-radius: 0 0 12px 12px;
    padding: 10px;
    display: flex;
    overflow: hidden;
  }

  .key {
    position: relative;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 10px;
    cursor: pointer;
    transition: all 0.1s;
  }

  .key.white {
    flex: 1;
    background: linear-gradient(180deg, #fff 0%, #f0f0f0 100%);
    border-radius: 0 0 6px 6px;
    border: 1px solid #ccc;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .key.white.active {
    background: linear-gradient(180deg, #e6f0ff 0%, #cce0ff 100%);
    transform: translateY(2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .key.black {
    position: absolute;
    width: 8%;
    height: 60%;
    background: linear-gradient(180deg, #333 0%, #000 100%);
    border-radius: 0 0 4px 4px;
    z-index: 2;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .key.black.active {
    background: linear-gradient(180deg, #555 0%, #222 100%);
    height: 58%;
  }

  .key-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
  }

  .key.black .key-label {
    color: #888;
  }

  .keyboard-map {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 12px;
  }

  .keyboard-map h3 {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    color: var(--text);
  }

  .map-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .map-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: white;
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .map-item kbd {
    background: #e0e0e0;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
  }

  .map-item .note-name {
    color: var(--primary);
    font-weight: bold;
  }

  .footer {
    text-align: center;
    padding: 2rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid #eef2f7;
    background: var(--card);
  }
</style>
