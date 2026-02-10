<template>
  <div class="scheduling-tool">
    <nav class="nav-bar">
      <button class="nav-back" @click="$router.back()">
        <el-icon>
          <Back />
        </el-icon>
        返回
      </button>
      <div class="nav-center">
        <h1>CPU 调度算法可视化</h1>
        <span class="nav-subtitle">Process Scheduling Visualization</span>
      </div>
      <div class="nav-spacer"></div>
    </nav>

    <main class="main-content">
      <section class="card panel-grid">
        <div class="controls-left">
          <div class="flex-row">
            <div class="control-group">
              <label>算法：</label>
              <select v-model="selectedAlgo" @change="handleAlgoChange">
                <option value="FCFS">FCFS（先来先服务）</option>
                <option value="SJF">SJF（短作业，非抢占）</option>
                <option value="LJF">LJF（长作业，非抢占）</option>
                <option value="SRTF">SRTF（短剩余，抢占）</option>
                <option value="LRTF">LRTF（长剩余，抢占）</option>
                <option value="HRRN">HRRN（最高响应比）</option>
                <option value="RR">RR（轮转）</option>
                <option value="MLFQ">MLFQ（多级反馈队列）</option>
                <option value="PR">Priority（优先级）</option>
              </select>
            </div>

            <div class="control-group">
              <label>进程数：</label>
              <input
                v-model.number="processCount"
                type="number"
                min="1"
                max="26"
                class="num-input"
              />
              <button class="btn btn-primary" @click="genDefault(processCount)">生成</button>
            </div>
          </div>

          <div v-if="selectedAlgo === 'RR' || selectedAlgo === 'MLFQ'" class="algo-options">
            <div class="flex-row">
              <label>基础时间片 q：</label>
              <input v-model.number="timeQuantum" type="number" min="1" class="num-input" />
            </div>
            <div v-if="selectedAlgo === 'MLFQ'" class="info-text">
              <span>策略：3级队列 (Q0: q, Q1: 2q, Q2: FCFS)</span>
            </div>
          </div>
          <div v-else-if="selectedAlgo === 'PR'" class="algo-options">
            <div class="flex-row">
              <label>优先级方向：</label>
              <select v-model="prioDir">
                <option value="low">数字小 = 高优先级</option>
                <option value="high">数字大 = 高优先级</option>
              </select>
            </div>
            <div class="flex-row">
              <label>是否抢占：</label>
              <select v-model="isPreemptive">
                <option :value="true">抢占</option>
                <option :value="false">非抢占</option>
              </select>
            </div>
          </div>
          <div v-else class="algo-options info-box">
            <span v-if="selectedAlgo === 'SJF'"
              >SJF 为非抢占式（短作业优先），若想要抢占式请选择 SRTF。</span
            >
            <span v-else-if="selectedAlgo === 'LJF'"
              >LJF：长作业优先（非抢占），是 SJF 的反面教材。</span
            >
            <span v-else-if="selectedAlgo === 'SRTF'"
              >SRTF 为抢占式短剩余时间优先（每时刻可能切换）。</span
            >
            <span v-else-if="selectedAlgo === 'LRTF'"
              >LRTF：长剩余时间优先（抢占），是 SRTF 的对立面。</span
            >
            <span v-else-if="selectedAlgo === 'HRRN'"
              >HRRN：响应比 = (等待+服务)/服务，非抢占。</span
            >
            <span v-else>FCFS：先来先服务（非抢占）。</span>
          </div>

          <div class="flex-row speed-control">
            <label>播放速度: {{ speed.toFixed(1) }}x</label>
            <input
              v-model.number="speed"
              type="range"
              min="0.2"
              max="2"
              step="0.1"
              class="slider"
            />
          </div>
        </div>

        <aside class="controls-right">
          <button class="btn btn-primary block-btn" @click="runDispatch">运行计算</button>
          <div class="btn-group">
            <button class="btn btn-secondary" @click="playTimeline">播放</button>
            <button class="btn btn-secondary" @click="pauseTimeline">暂停</button>
            <button class="btn btn-secondary" @click="resetTimeline">重置</button>
          </div>
          <button class="btn btn-secondary block-btn" @click="addRow">添加进程</button>
        </aside>
      </section>

      <section v-if="results.length || timeline.length" class="card">
        <div class="gantt-section">
          <h3>甘特图 (Gantt Chart)</h3>
          <div class="gantt-wrap">
            <div class="gantt-chart">
              <div
                v-for="(seg, i) in displayedTimeline"
                :key="i"
                class="gantt-seg"
                :style="{
                  width: seg.width,
                  backgroundColor: getColor(seg.name)
                }"
                :title="`${seg.name}: ${seg.start} → ${seg.end}${seg.level !== undefined ? ' (Q' + seg.level + ')' : ''}`"
              >
                {{ seg.name }}
              </div>
            </div>
            <div class="time-scale">
              <span v-for="t in timeTicks" :key="t" class="tick">{{ t }}</span>
            </div>
          </div>

          <div class="legend">
            <div v-for="name in uniqueNames" :key="name" class="legend-item">
              <span class="badge" :style="{ background: getColor(name) }"></span>
              <span>{{ name }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <h3>进程表 (A-Z)</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>进程</th>
                <th>到达时间</th>
                <th>服务时间</th>
                <th>优先级</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in processes" :key="idx">
                <td class="fw-bold">{{ p.name }}</td>
                <td>
                  <input v-model.number="p.arrival" type="number" min="0" class="table-input" />
                </td>
                <td>
                  <input v-model.number="p.service" type="number" min="1" class="table-input" />
                </td>
                <td><input v-model.number="p.priority" type="number" class="table-input" /></td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="removeRow(idx)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="results.length || timeline.length" class="card">
        <div class="results-header">
          <div class="results-col">
            <h3>调度结果</h3>
            <div class="results-table-container">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>进程</th>
                    <th>到达</th>
                    <th>服务</th>
                    <th>完成</th>
                    <th>周转</th>
                    <th>带权周转</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in results" :key="r.name">
                    <td>{{ r.name }}</td>
                    <td>{{ r.arrival }}</td>
                    <td>{{ r.service }}</td>
                    <td>{{ r.finish }}</td>
                    <td>{{ r.turnaround }}</td>
                    <td>{{ r.weighted.toFixed(2) }}</td>
                  </tr>
                  <tr class="summary-row">
                    <td>平均</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>{{ avgTurnaround }}</td>
                    <td>{{ avgWeighted }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">© 2026 LRM工具箱 - 调度算法可视化</footer>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { Back } from '@element-plus/icons-vue';

  const selectedAlgo = ref('FCFS');
  const processCount = ref(4);
  const timeQuantum = ref(2);
  const prioDir = ref('low');
  const isPreemptive = ref(false);
  const speed = ref(1.0);

  const processes = ref([]);
  const timeline = ref([]);
  const results = ref([]);

  const displayedTimeline = ref([]);
  const animTimer = ref(null);
  const currentAnimIndex = ref(0); // Track animation progress

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const genDefault = n => {
    n = Math.max(1, Math.min(26, n));
    processes.value = [];
    for (let i = 0; i < n; i++) {
      processes.value.push({
        name: letters[i],
        arrival: i,
        service: Math.max(1, i + 1),
        priority: 0
      });
    }

    clearResults();
  };

  const addRow = () => {
    if (processes.value.length >= 26) return;
    const i = processes.value.length;
    processes.value.push({
      name: letters[i],
      arrival: 0,
      service: 1,
      priority: 0
    });
  };

  const removeRow = idx => {
    processes.value.splice(idx, 1);

    processes.value.forEach((p, i) => {
      p.name = letters[i];
    });
  };

  const handleAlgoChange = () => {
    clearResults();
  };

  const clearResults = () => {
    timeline.value = [];
    results.value = [];
    displayedTimeline.value = [];
    currentAnimIndex.value = 0;
    if (animTimer.value) clearInterval(animTimer.value);
    animTimer.value = null;
  };

  const scheduleFCFS = raw => {
    const procs = raw.map(p => ({ ...p })).sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const tl = [];
    const finished = [];
    for (const p of procs) {
      if (time < p.arrival) time = p.arrival;
      tl.push({ name: p.name, start: time, end: time + p.service });
      time += p.service;
      p.finish = time;
      finished.push({ ...p });
    }
    return finalize(tl, finished);
  };

  const scheduleSJF = raw => {
    const procs = raw.map(p => ({ ...p }));
    procs.sort((a, b) => a.arrival - b.arrival || a.service - b.service);
    let time = 0;
    const tl = [];
    const finished = [];
    const ready = [];
    while (procs.length || ready.length) {
      while (procs.length && procs[0].arrival <= time) ready.push(procs.shift());
      if (!ready.length) {
        time = procs[0].arrival;
        continue;
      }
      ready.sort((a, b) => a.service - b.service || a.arrival - b.arrival);
      const cur = ready.shift();
      tl.push({ name: cur.name, start: time, end: time + cur.service });
      time += cur.service;
      cur.finish = time;
      finished.push(cur);
    }
    return finalize(tl, finished);
  };

  const scheduleSRTF = raw => {
    const procs = raw.map(p => ({ ...p }));
    procs.sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const tl = [];
    const ready = [];
    let idx = 0;
    let current = null;
    let segStart = 0;

    let safeguard = 0;

    while ((idx < procs.length || ready.length || current) && safeguard < 10000) {
      safeguard++;

      while (idx < procs.length && procs[idx].arrival <= time) {
        ready.push({ ...procs[idx] });
        idx++;
      }

      if (!current && !ready.length) {
        if (idx < procs.length) {
          time = procs[idx].arrival;
          continue;
        } else {
          break;
        }
      }

      if (!current) {
        ready.sort((a, b) => a.service - b.service || a.arrival - b.arrival);
        current = ready.shift();
        if (!current.remaining) current.remaining = current.service;
        segStart = time;
      } else {
        ready.sort((a, b) => a.service - b.service || a.arrival - b.arrival);
        if (ready.length && ready[0].service < current.remaining) {
          tl.push({ name: current.name, start: segStart, end: time });
          ready.push(current);
          current = ready.shift();
          if (!current.remaining) current.remaining = current.service;
          segStart = time;
        }
      }

      current.remaining -= 1;
      time += 1;

      if (current.remaining === 0) {
        tl.push({ name: current.name, start: segStart, end: time });

        current = null;
      }
    }

    const finished = [];

    const finishMap = {};

    tl.forEach(s => {
      finishMap[s.name] = Math.max(finishMap[s.name] || 0, s.end);
    });

    raw.forEach(p => finished.push({ ...p, finish: finishMap[p.name] }));
    return finalize(tl, finished);
  };

  const scheduleHRRN = raw => {
    const procs = raw.map(p => ({ ...p }));

    procs.sort((a, b) => a.arrival - b.arrival);

    let time = 0;
    const tl = [];
    const finished = [];
    const ready = [];

    while (procs.length || ready.length) {
      while (procs.length && procs[0].arrival <= time) {
        ready.push(procs.shift());
      }

      if (!ready.length) {
        if (procs.length) {
          time = procs[0].arrival;
          continue;
        } else {
          break;
        }
      }

      ready.sort((a, b) => {
        const wa = time - a.arrival;
        const wb = time - b.arrival;
        const ra = (wa + a.service) / a.service;
        const rb = (wb + b.service) / b.service;

        if (ra !== rb) return rb - ra;
        return a.arrival - b.arrival;
      });

      const cur = ready.shift();
      tl.push({ name: cur.name, start: time, end: time + cur.service });
      time += cur.service;
      cur.finish = time;
      finished.push(cur);
    }
    return finalize(tl, finished);
  };

  const scheduleRR = (raw, q) => {
    const procs = raw.map(p => ({ ...p, remaining: p.service }));
    procs.sort((a, b) => a.arrival - b.arrival);
    const queue = [];
    let idx = 0,
      time = 0;
    const tl = [];
    const finished = [];

    while (idx < procs.length || queue.length) {
      while (idx < procs.length && procs[idx].arrival <= time) queue.push(procs[idx++]);
      if (!queue.length) {
        time = procs[idx].arrival;
        continue;
      }
      const cur = queue.shift();
      const run = Math.min(q, cur.remaining);
      tl.push({ name: cur.name, start: time, end: time + run });
      time += run;
      cur.remaining -= run;
      while (idx < procs.length && procs[idx].arrival <= time) queue.push(procs[idx++]);
      if (cur.remaining > 0) queue.push(cur);
      else {
        cur.finish = time;
        finished.push(cur);
      }
    }
    return finalize(tl, finished);
  };

  const scheduleMLFQ = (raw, q1) => {
    const procs = raw.map(p => ({ ...p, remaining: p.service, level: 0 }));
    procs.sort((a, b) => a.arrival - b.arrival);

    const q0 = [];
    const q1List = [];
    const q2 = [];

    let time = 0;
    let idx = 0;
    const tl = [];
    const finished = [];
    let safeguard = 0;

    const pushNewlyArrived = () => {
      while (idx < procs.length && procs[idx].arrival <= time) {
        q0.push(procs[idx++]);
      }
    };

    while ((idx < procs.length || q0.length || q1List.length || q2.length) && safeguard < 20000) {
      safeguard++;
      pushNewlyArrived();

      if (q0.length === 0 && q1List.length === 0 && q2.length === 0) {
        if (idx < procs.length) {
          time = procs[idx].arrival;
          continue;
        } else {
          break;
        }
      }

      let cur = null;
      let quantum = 0;
      let queueLevel = -1;

      if (q0.length > 0) {
        cur = q0.shift();
        quantum = q1;
        queueLevel = 0;
      } else if (q1List.length > 0) {
        cur = q1List.shift();
        quantum = q1 * 2;
        queueLevel = 1;
      } else if (q2.length > 0) {
        cur = q2.shift();
        quantum = 999999;
        queueLevel = 2;
      }

      const possibleRun = Math.min(quantum, cur.remaining);

      let actualRun = 0;

      if (queueLevel === 2) {
        actualRun = possibleRun;
      } else {
        actualRun = possibleRun;
      }

      tl.push({ name: cur.name, start: time, end: time + actualRun, level: queueLevel });
      time += actualRun;
      cur.remaining -= actualRun;

      pushNewlyArrived();

      if (cur.remaining > 0) {
        if (queueLevel === 0) q1List.push(cur);
        else if (queueLevel === 1) q2.push(cur);
        else q2.push(cur);
      } else {
        cur.finish = time;
        finished.push(cur);
      }
    }
    return finalize(tl, finished);
  };

  const schedulePriority = (raw, opts = { preemptive: false, dir: 'low' }) => {
    const procs = raw.map(p => ({ ...p }));
    procs.sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const tl = [];
    const ready = [];
    let idx = 0;
    let finished = [];

    const prioCompare = (a, b) => {
      if (opts.dir === 'low') {
        if (a.priority !== b.priority) return a.priority - b.priority;
      } else {
        if (a.priority !== b.priority) return b.priority - a.priority;
      }
      return a.arrival - b.arrival;
    };

    procs.forEach(p => (p.remaining = p.service));

    if (!opts.preemptive) {
      while (idx < procs.length || ready.length) {
        while (idx < procs.length && procs[idx].arrival <= time) ready.push({ ...procs[idx++] });
        if (!ready.length) {
          time = procs[idx].arrival;
          continue;
        }
        ready.sort(prioCompare);
        const cur = ready.shift();
        tl.push({ name: cur.name, start: time, end: time + cur.service });
        time += cur.service;
        cur.finish = time;
        finished.push(cur);
      }
    } else {
      let current = null;
      let segStart = 0;
      while (idx < procs.length || ready.length || current) {
        while (idx < procs.length && procs[idx].arrival <= time) ready.push({ ...procs[idx++] });
        if (!current && !ready.length) {
          time = procs[idx].arrival;
          continue;
        }

        if (!current) {
          ready.sort(prioCompare);
          current = ready.shift();
          segStart = time;
        } else {
          if (ready.length) {
            ready.sort(prioCompare);

            let preempt = false;
            if (opts.dir === 'low') {
              if (ready[0].priority < current.priority) preempt = true;
            } else {
              if (ready[0].priority > current.priority) preempt = true;
            }

            if (preempt) {
              tl.push({ name: current.name, start: segStart, end: time });
              ready.push(current);
              current = ready.shift();
              segStart = time;
            }
          }
        }

        current.remaining -= 1;
        time += 1;
        if (current.remaining === 0) {
          tl.push({ name: current.name, start: segStart, end: time });
          current.finish = time;
          finished.push(current);
          current = null;
        }
      }
    }

    return finalize(tl, finished);
  };

  const scheduleLJF = raw => {
    const procs = raw.map(p => ({ ...p }));
    // Sort by arrival first
    procs.sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const tl = [];
    const finished = [];
    const ready = [];

    while (procs.length || ready.length) {
      // Collect arrived processes
      while (procs.length && procs[0].arrival <= time) ready.push(procs.shift());

      if (!ready.length) {
        // Jump to next arrival if idle
        if (procs.length) {
          time = procs[0].arrival;
          continue;
        }
      }

      // Strategy: choose longest service time
      ready.sort((a, b) => b.service - a.service || a.arrival - b.arrival);
      const cur = ready.shift();

      tl.push({ name: cur.name, start: time, end: time + cur.service });
      time += cur.service;
      cur.finish = time;
      finished.push(cur);
    }
    return finalize(tl, finished);
  };

  const scheduleLRTF = raw => {
    const procs = raw.map(p => ({ ...p }));
    procs.sort((a, b) => a.arrival - b.arrival);
    let time = 0;
    const tl = [];
    const ready = [];
    let idx = 0;
    let current = null;
    let segStart = 0;
    let safeguard = 0;

    // Pre-fill remaining time
    procs.forEach(p => {
      if (!p.remaining) p.remaining = p.service;
    });

    while ((idx < procs.length || ready.length || current) && safeguard < 10000) {
      safeguard++;

      while (idx < procs.length && procs[idx].arrival <= time) {
        ready.push({ ...procs[idx] });
        idx++;
      }

      if (!current && !ready.length) {
        if (idx < procs.length) {
          time = procs[idx].arrival;
          continue;
        } else {
          break;
        }
      }

      if (!current) {
        // Choose longest remaining
        ready.sort((a, b) => b.remaining - a.remaining || a.arrival - b.arrival);
        current = ready.shift();
        segStart = time;
      } else {
        // Check preemption: if someone in ready queue has MORE remaining time than current
        // For LRTF, we switch if ready process > current remaining
        // or if equal, usually we continue current or FCFS. Let's stick to simple "strictly greater" check for stability
        ready.sort((a, b) => b.remaining - a.remaining || a.arrival - b.arrival);

        if (ready.length && ready[0].remaining > current.remaining) {
          tl.push({ name: current.name, start: segStart, end: time });
          ready.push(current);
          current = ready.shift();
          segStart = time;
        }
      }

      current.remaining -= 1;
      time += 1;

      if (current.remaining === 0) {
        tl.push({ name: current.name, start: segStart, end: time });
        current = null;
      }
    }

    const finished = [];
    const finishMap = {};

    tl.forEach(s => {
      finishMap[s.name] = Math.max(finishMap[s.name] || 0, s.end);
    });

    raw.forEach(p => finished.push({ ...p, finish: finishMap[p.name] }));
    return finalize(tl, finished);
  };

  const finalize = tl => {
    const merged = [];
    if (tl.length) {
      for (const seg of tl) {
        if (!merged.length) merged.push({ ...seg });
        else {
          const last = merged[merged.length - 1];
          if (last.name === seg.name && last.end === seg.start) {
            last.end = seg.end;
          } else {
            merged.push({ ...seg });
          }
        }
      }
    }

    const finishMap = {};
    merged.forEach(s => (finishMap[s.name] = Math.max(finishMap[s.name] || 0, s.end)));

    const resNames = Object.keys(finishMap).sort();

    const finalRes = resNames.map(n => {
      const inputP = processes.value.find(p => p.name === n) || {};
      const arrival = inputP.arrival || 0;
      const service = inputP.service || 1;
      const finish = finishMap[n];
      const turnaround = finish - arrival;
      const weighted = parseFloat((turnaround / service).toFixed(2));
      return { name: n, arrival, service, finish, turnaround, weighted };
    });

    return { timeline: merged, results: finalRes };
  };

  const runDispatch = () => {
    pauseTimeline();
    if (!processes.value.length) return;
    const raw = processes.value;
    let out;
    if (selectedAlgo.value === 'FCFS') out = scheduleFCFS(raw);
    else if (selectedAlgo.value === 'SJF') out = scheduleSJF(raw);
    else if (selectedAlgo.value === 'LJF') out = scheduleLJF(raw);
    else if (selectedAlgo.value === 'SRTF') out = scheduleSRTF(raw);
    else if (selectedAlgo.value === 'LRTF') out = scheduleLRTF(raw);
    else if (selectedAlgo.value === 'HRRN') out = scheduleHRRN(raw);
    else if (selectedAlgo.value === 'RR') out = scheduleRR(raw, timeQuantum.value);
    else if (selectedAlgo.value === 'MLFQ') out = scheduleMLFQ(raw, timeQuantum.value);
    else if (selectedAlgo.value === 'PR')
      out = schedulePriority(raw, {
        dir: prioDir.value,
        preemptive: isPreemptive.value
      });

    timeline.value = out.timeline;
    results.value = out.results;

    renderGanttFull();
  };

  const palette = [
    '#0b69ff',
    '#3d8aff',
    '#10b981',
    '#60a5fa',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#ec4899'
  ];
  const getColor = name => {
    const idx = name.charCodeAt(0) - 'A'.charCodeAt(0);
    return palette[idx % palette.length];
  };

  const uniqueNames = computed(() => {
    const names = new Set(timeline.value.map(s => s.name));
    return Array.from(names).sort();
  });

  const avgTurnaround = computed(() => {
    if (!results.value.length) return 0;
    const sum = results.value.reduce((acc, r) => acc + r.turnaround, 0);
    return (sum / results.value.length).toFixed(2);
  });
  const avgWeighted = computed(() => {
    if (!results.value.length) return 0;
    const sum = results.value.reduce((acc, r) => acc + r.weighted, 0);
    return (sum / results.value.length).toFixed(2);
  });

  const totalTime = computed(() => {
    if (!timeline.value.length) return 1;
    const start = Math.min(...timeline.value.map(s => s.start));
    const end = Math.max(...timeline.value.map(s => s.end));
    return Math.max(1, end - start);
  });

  const timeTicks = computed(() => {
    const total = totalTime.value;

    const count = Math.min(20, total);
    const ticks = [];
    const step = total / count;
    for (let i = 0; i <= count; i++) ticks.push(Math.round(i * step));
    return Array.from(new Set(ticks));
  });

  const renderGanttFull = () => {
    displayedTimeline.value = timeline.value.map(seg => ({
      ...seg,
      width: ((seg.end - seg.start) / totalTime.value) * 100 + '%'
    }));
  };

  const playTimeline = () => {
    if (!timeline.value.length) runDispatch();

    // If fully displayed (e.g. after calculation or finished), restart
    if (displayedTimeline.value.length >= timeline.value.length) {
      displayedTimeline.value = [];
      currentAnimIndex.value = 0;
    } else {
      // Resume from current state
      // If currentAnimIndex is 0 but we have items, it's weird, but let's sync
      if (displayedTimeline.value.length !== currentAnimIndex.value) {
        currentAnimIndex.value = displayedTimeline.value.length;
      }
    }

    if (animTimer.value) return;

    const interval = Math.max(100, 600 / speed.value);

    animTimer.value = setInterval(() => {
      if (currentAnimIndex.value >= timeline.value.length) {
        clearInterval(animTimer.value);
        animTimer.value = null;
        return;
      }
      const seg = timeline.value[currentAnimIndex.value++];
      displayedTimeline.value.push({
        ...seg,
        width: ((seg.end - seg.start) / totalTime.value) * 100 + '%'
      });
    }, interval);
  };

  const pauseTimeline = () => {
    if (animTimer.value) {
      clearInterval(animTimer.value);
      animTimer.value = null;
    }
  };

  const resetTimeline = () => {
    pauseTimeline();
    genDefault(4);
    selectedAlgo.value = 'FCFS';
    timeline.value = [];
    results.value = [];
    displayedTimeline.value = [];
  };

  onMounted(() => {
    genDefault(4);
  });
</script>

<style scoped>
  .scheduling-tool {
    --bg: #faf9f7;
    --card: #ffffff;
    --border: #e8e6e3;
    --text: #1a1a1a;
    --text-2: #6b6b6b;
    --primary: #0b69ff;
    --accent: #10b981;
    --danger: #ef4444;

    font-family: 'Noto Sans SC', sans-serif;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
  }

  .nav-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    background: var(--card);
    border-bottom: 1px solid var(--border);
  }

  .nav-back,
  .nav-spacer {
    width: 80px;
  }

  .nav-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: var(--text-2);
    cursor: pointer;
    font-size: 0.9rem;
  }

  .nav-center {
    text-align: center;
  }

  .nav-center h1 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .nav-subtitle {
    font-size: 0.7rem;
    color: var(--text-2);
    text-transform: uppercase;
    display: block;
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .panel-grid {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    .panel-grid {
      flex-direction: column;
    }
  }

  .controls-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .controls-right {
    width: 140px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .flex-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  label {
    font-size: 0.9rem;
    color: var(--text-2);
  }

  input[type='number'],
  select {
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: #fbfdff;
    font-size: 0.9rem;
  }

  .num-input {
    width: 80px;
  }

  .table-input {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
  }

  .btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: none;
    font-size: 0.9rem;
    cursor: pointer;
    transition: 0.2s;
  }

  .btn-primary {
    background: var(--primary);
    color: #fff;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #333;
    border: 1px solid #e5e7eb;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn-danger {
    background: #fee2e2;
    color: #dc2626;
  }

  .btn-danger:hover {
    background: #fecaca;
  }

  .block-btn {
    width: 100%;
  }

  .btn-group {
    display: flex;
    gap: 4px;
  }

  .btn-group .btn {
    flex: 1;
    padding: 6px;
    font-size: 0.8rem;
  }

  .info-box {
    background: #f3f4f6;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #666;
  }

  .table-container {
    overflow-x: auto;
    margin-top: 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th,
  td {
    padding: 10px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
  }

  th {
    background: #f9fafb;
    color: #666;
    font-weight: 600;
  }

  .fw-bold {
    font-weight: 700;
    color: var(--primary);
  }

  .results-table-container {
    margin-top: 10px;
  }

  .results-table {
    font-size: 0.85rem;
  }

  .summary-row {
    background: #f0f9ff;
    font-weight: 600;
    color: var(--primary);
  }

  .gantt-section {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }

  .gantt-wrap {
    overflow-x: auto;
    padding: 15px;
    background: #fbfeff;
    border-radius: 8px;
    border: 1px solid #eef6ff;
    margin-top: 10px;
  }

  .gantt-chart {
    display: flex;
    height: 48px;
    border-radius: 6px;
    overflow: hidden;
    background: #eee;
    margin-bottom: 8px;
  }

  .gantt-seg {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    transition: width 0.3s ease;
    border-right: 1px solid rgba(255, 255, 255, 0.3);
  }

  .time-scale {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #999;
  }

  .tick {
    flex: 1;
    text-align: center;
    border-left: 1px solid #eee;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
  }

  .badge {
    width: 16px;
    height: 16px;
    border-radius: 4px;
  }

  .footer {
    text-align: center;
    padding: 2rem;
    color: var(--text-2);
    border-top: 1px solid var(--border);
    margin-top: 2rem;
    font-size: 0.85rem;
  }
</style>
