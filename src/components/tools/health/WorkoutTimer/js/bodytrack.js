/**
 * 身体数据追踪模块 (BodyTrackModule)
 * 体重 / 体脂率 记录 + 折线图趋势
 */
const BodyTrackModule = {
  STORAGE_KEY: 'fitness_body_records',

  initBodyTrack() {
    this.data.bodyRecords = this.loadBodyRecords();
    this.state.bodyChartRange = 30; // 默认显示最近30天

    // 绑定事件
    document.getElementById('body-add-btn')?.addEventListener('click', () => this.openBodyInput());
    document
      .getElementById('body-export-btn')
      ?.addEventListener('click', () => this.exportBodyData());
    document.getElementById('body-import-btn')?.addEventListener('click', () => {
      document.getElementById('body-import-file-input')?.click();
    });
    document.getElementById('body-import-file-input')?.addEventListener('change', e => {
      this.importBodyData(e.target.files?.[0]);
      e.target.value = '';
    });
    document
      .getElementById('body-save-btn')
      ?.addEventListener('click', () => this.saveBodyRecord());
    document
      .getElementById('body-cancel-btn')
      ?.addEventListener('click', () => this.closeBodyInput());

    // 时间范围切换
    document.querySelectorAll('.body-range-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.state.bodyChartRange = parseInt(tab.dataset.range);
        document.querySelectorAll('.body-range-tab').forEach(t => {
          t.classList.toggle('bg-blue-600', t === tab);
          t.classList.toggle('text-white', t === tab);
          t.classList.toggle('text-slate-400', t !== tab);
        });
        this.renderBodyChart();
      });
    });

    // 清空
    document.getElementById('body-clear-btn')?.addEventListener('click', () => {
      this.confirm('清空数据', '确定清空所有身体数据记录吗？', () => {
        this.data.bodyRecords = [];
        this.saveBodyRecords();
        this.renderBodyChart();
        this.renderBodyRecordsList();
      });
    });

    this.renderBodyChart();
    this.renderBodyRecordsList();
  },

  loadBodyRecords() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? DataManager.normalizeBodyRecords(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  },

  saveBodyRecords() {
    this.data.bodyRecords = DataManager.normalizeBodyRecords(this.data.bodyRecords);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data.bodyRecords));
  },

  openBodyInput() {
    const panel = document.getElementById('body-input-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    // 默认填入今天日期和上次记录
    const dateInput = document.getElementById('body-date-input');
    const weightInput = document.getElementById('body-weight-input');
    const fatInput = document.getElementById('body-fat-input');

    const today = new Date().toISOString().slice(0, 10);
    if (dateInput) dateInput.value = today;

    // 预填上次数据
    const last = this.data.bodyRecords[this.data.bodyRecords.length - 1];
    if (last && weightInput) weightInput.value = last.weight || '';
    if (fatInput) fatInput.value = '';
  },

  closeBodyInput() {
    const panel = document.getElementById('body-input-panel');
    if (panel) panel.classList.add('hidden');
  },

  saveBodyRecord() {
    const dateVal = document.getElementById('body-date-input')?.value;
    const weightVal = parseFloat(document.getElementById('body-weight-input')?.value);
    const fatVal = parseFloat(document.getElementById('body-fat-input')?.value);

    if (!dateVal || isNaN(weightVal) || weightVal <= 0) {
      this.confirm('提示', '请输入有效的体重数据');
      return;
    }

    const record = {
      date: dateVal,
      weight: Math.round(weightVal * 10) / 10,
      bodyFat: !isNaN(fatVal) && fatVal > 0 ? Math.round(fatVal * 10) / 10 : null,
      ts: Date.now()
    };

    // 同一天覆盖
    const existIdx = this.data.bodyRecords.findIndex(r => r.date === dateVal);
    if (existIdx !== -1) {
      this.data.bodyRecords[existIdx] = record;
    } else {
      this.data.bodyRecords.push(record);
    }

    // 按日期排序
    this.data.bodyRecords.sort((a, b) => a.date.localeCompare(b.date));
    this.saveBodyRecords();
    this.closeBodyInput();
    this.renderBodyChart();
    this.renderBodyRecordsList();
  },

  renderBodyChart() {
    const canvas = document.getElementById('body-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // HiDPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = '200px';
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = 200;
    const PAD = { top: 20, right: 50, bottom: 30, left: 45 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    // 过滤数据范围
    const rangeDays = this.state.bodyChartRange;
    const now = new Date();
    const cutoff = new Date(now.getTime() - rangeDays * 86400000).toISOString().slice(0, 10);
    const data = this.data.bodyRecords.filter(r => r.date >= cutoff);

    // 更新统计摘要
    this.updateBodySummary(data);

    if (data.length < 2) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(
        data.length === 0 ? '暂无数据，点击 + 记录体重' : '至少需要2条数据绘制趋势',
        W / 2,
        H / 2
      );
      return;
    }

    // 计算范围
    const weights = data.map(d => d.weight);
    const minW = Math.floor(Math.min(...weights) - 1);
    const maxW = Math.ceil(Math.max(...weights) + 1);
    const rangeW = maxW - minW || 1;

    // 体脂范围
    const fats = data.filter(d => d.bodyFat !== null).map(d => d.bodyFat);
    const hasFat = fats.length >= 2;
    let minF = 0,
      maxF = 40,
      rangeF = 40;
    if (hasFat) {
      minF = Math.floor(Math.min(...fats) - 2);
      maxF = Math.ceil(Math.max(...fats) + 2);
      rangeF = maxF - minF || 1;
    }

    const toX = i => PAD.left + (i / (data.length - 1)) * plotW;
    const toYW = v => PAD.top + (1 - (v - minW) / rangeW) * plotH;
    const toYF = v => PAD.top + (1 - (v - minF) / rangeF) * plotH;

    // 绘制网格
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const y = PAD.top + (i / gridSteps) * plotH;
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();

      // 左侧体重标签
      const wVal = maxW - (i / gridSteps) * rangeW;
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(wVal.toFixed(1), PAD.left - 6, y + 3);

      // 右侧体脂标签
      if (hasFat) {
        const fVal = maxF - (i / gridSteps) * rangeF;
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'left';
        ctx.fillText(fVal.toFixed(0) + '%', W - PAD.right + 6, y + 3);
      }
    }

    // X 轴日期标签
    const maxLabels = Math.min(data.length, 6);
    const labelStep = Math.max(1, Math.floor(data.length / maxLabels));
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i < data.length; i += labelStep) {
      const d = data[i].date.slice(5); // MM-DD
      ctx.fillText(d, toX(i), H - 8);
    }
    // 最后一个
    if (data.length > 1) {
      ctx.fillText(data[data.length - 1].date.slice(5), toX(data.length - 1), H - 8);
    }

    // 体脂线（先画，在底层）
    if (hasFat) {
      const fatData = data.filter(d => d.bodyFat !== null);
      if (fatData.length >= 2) {
        // 渐变填充
        const gradient = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.beginPath();
        fatData.forEach((d, i) => {
          const dataIdx = data.indexOf(d);
          const x = toX(dataIdx);
          const y = toYF(d.bodyFat);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        // 填充区域
        const lastFatIdx = data.indexOf(fatData[fatData.length - 1]);
        const firstFatIdx = data.indexOf(fatData[0]);
        ctx.lineTo(toX(lastFatIdx), PAD.top + plotH);
        ctx.lineTo(toX(firstFatIdx), PAD.top + plotH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // 线条
        ctx.beginPath();
        fatData.forEach((d, i) => {
          const dataIdx = data.indexOf(d);
          const x = toX(dataIdx);
          const y = toYF(d.bodyFat);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 点
        fatData.forEach(d => {
          const dataIdx = data.indexOf(d);
          ctx.beginPath();
          ctx.arc(toX(dataIdx), toYF(d.bodyFat), 3, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
      }
    }

    // 体重线
    // 渐变填充
    const wGradient = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + plotH);
    wGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    wGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    ctx.beginPath();
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toYW(d.weight);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(data.length - 1), PAD.top + plotH);
    ctx.lineTo(toX(0), PAD.top + plotH);
    ctx.closePath();
    ctx.fillStyle = wGradient;
    ctx.fill();

    // 线条
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toYW(d.weight);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // 数据点
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toYW(d.weight);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 交互 tooltip 区域存储
    this._bodyChartPoints = data.map((d, i) => ({
      x: toX(i),
      y: toYW(d.weight),
      data: d
    }));

    // 绑定 canvas 鼠标事件
    if (!canvas._tooltipBound) {
      canvas._tooltipBound = true;
      canvas.addEventListener('mousemove', e => this.handleBodyChartHover(e));
      canvas.addEventListener('mouseleave', () => this.hideChartTooltip());
      canvas.addEventListener(
        'touchstart',
        e => {
          const touch = e.touches[0];
          this.handleBodyChartHover({
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: canvas
          });
        },
        { passive: true }
      );
    }
  },

  handleBodyChartHover(e) {
    if (!this._bodyChartPoints?.length) return;
    const canvas = e.target;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;

    // 找最近的点
    let closest = null;
    let minDist = Infinity;
    this._bodyChartPoints.forEach(pt => {
      const dist = Math.abs(pt.x - mx);
      if (dist < minDist) {
        minDist = dist;
        closest = pt;
      }
    });

    if (closest && minDist < 30) {
      const tooltip = document.getElementById('chart-tooltip');
      const textEl = document.getElementById('chart-tooltip-text');
      if (!tooltip || !textEl) return;

      let text = `${closest.data.date}  体重: ${closest.data.weight}kg`;
      if (closest.data.bodyFat !== null) {
        text += `  体脂: ${closest.data.bodyFat}%`;
      }
      textEl.textContent = text;
      tooltip.classList.remove('hidden');

      // 定位
      const tooltipRect = tooltip.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      let left = canvasRect.left + closest.x - tooltipRect.width / 2;
      let top = canvasRect.top + closest.y - tooltipRect.height - 10;
      if (left < 4) left = 4;
      if (top < 4) top = canvasRect.top + closest.y + 15;
      tooltip.style.left = left + 'px';
      tooltip.style.top = top + 'px';
    } else {
      this.hideChartTooltip();
    }
  },

  updateBodySummary(data) {
    const currentEl = document.getElementById('body-current-weight');
    const changeEl = document.getElementById('body-weight-change');
    const fatEl = document.getElementById('body-current-fat');

    if (data.length > 0) {
      const latest = data[data.length - 1];
      if (currentEl) currentEl.textContent = latest.weight.toFixed(1);
      if (fatEl)
        fatEl.textContent = latest.bodyFat !== null ? latest.bodyFat.toFixed(1) + '%' : '--';

      if (data.length >= 2 && changeEl) {
        const first = data[0];
        const diff = latest.weight - first.weight;
        const sign = diff > 0 ? '+' : '';
        changeEl.textContent = `${sign}${diff.toFixed(1)}kg`;
        changeEl.className = `text-xs font-bold ${diff > 0 ? 'text-red-500' : diff < 0 ? 'text-green-500' : 'text-slate-400'}`;
      } else if (changeEl) {
        changeEl.textContent = '--';
        changeEl.className = 'text-xs font-bold text-slate-400';
      }
    } else {
      if (currentEl) currentEl.textContent = '--';
      if (changeEl) {
        changeEl.textContent = '--';
        changeEl.className = 'text-xs font-bold text-slate-400';
      }
      if (fatEl) fatEl.textContent = '--';
    }
  },

  renderBodyRecordsList() {
    const container = document.getElementById('body-records-list');
    if (!container) return;

    const records = [...this.data.bodyRecords].reverse().slice(0, 15);
    if (records.length === 0) {
      container.innerHTML = '<div class="py-4 text-center text-xs text-slate-400">暂无记录</div>';
      return;
    }

    container.innerHTML = records
      .map((r, idx) => {
        const prev = idx < records.length - 1 ? records[idx + 1] : null;
        let changeHtml = '';
        if (prev) {
          const diff = r.weight - prev.weight;
          if (Math.abs(diff) > 0.05) {
            const color = diff > 0 ? 'text-red-400' : 'text-green-400';
            const arrow = diff > 0 ? '↑' : '↓';
            changeHtml = `<span class="${color} text-[10px]">${arrow}${Math.abs(diff).toFixed(1)}</span>`;
          }
        }
        return `
        <div class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors group">
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 tabular-nums">${r.date.slice(5)}</span>
            ${changeHtml}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-bold text-slate-700 tabular-nums">${r.weight}kg</span>
            ${r.bodyFat !== null ? `<span class="text-xs text-amber-500 tabular-nums">${r.bodyFat}%</span>` : ''}
            <button class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 text-xs transition-all" onclick="App.deleteBodyRecord('${r.date}')">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
      `;
      })
      .join('');
  },

  deleteBodyRecord(date) {
    this.data.bodyRecords = this.data.bodyRecords.filter(r => r.date !== date);
    this.saveBodyRecords();
    this.renderBodyChart();
    this.renderBodyRecordsList();
  }
};

window.BodyTrackModule = BodyTrackModule;
