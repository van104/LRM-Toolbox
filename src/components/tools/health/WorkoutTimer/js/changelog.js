/**
 * 更新日志模块 (ChangelogModule)
 * 管理版本更新历史的展示和新版本提示
 */
const ChangelogModule = {
  CURRENT_VERSION: 'v2.7.1',
  STORAGE_KEY: 'fitness_changelog_last_seen',

  CHANGELOG: [
    {
      version: 'v2.7.1',
      date: '2026-04-14',
      tag: '问题修复',
      tagColor: 'amber',
      items: [
        {
          type: 'fix',
          text: '修复训练进行中切换自由计时器模式（倒计时/正计时）导致训练流程意外中断的 bug'
        }
      ]
    },
    {
      version: 'v2.7.0',
      date: '2026-04-07',
      tag: '体验升级',
      tagColor: 'teal',
      items: [
        { type: 'feat', text: '训练记录与身体数据支持独立导入 / 导出，统计页可直接备份恢复' },
        { type: 'feat', text: '新增首次使用温馨提示，提醒本地数据需及时导出保存' },
        { type: 'feat', text: '新增中断恢复：训练流程、自由倒计时、正计时支持刷新后继续' },
        { type: 'feat', text: '新增训练目标系统，支持自定义添加、编辑、删除多个训练目标' },
        { type: 'fix', text: '修复训练目标连续编辑时弹窗意外退出的问题' }
      ]
    },
    {
      version: 'v2.6.0',
      date: '2026-04-04',
      tag: '重磅更新',
      tagColor: 'indigo',
      items: [
        { type: 'feat', text: '动作库补全：内置60+常见动作及肌肉标签，名称输入自动补全' },
        { type: 'feat', text: '身体数据追踪：打卡记录体重及体脂，生成最高至一年的趋势折线图' }
      ]
    },
    {
      version: 'v2.5.0',
      date: '2026-04-04',
      tag: '重大更新',
      tagColor: 'blue',
      items: [
        { type: 'feat', text: '训练日历热力图，5级绿色色阶' },
        { type: 'feat', text: '热力图支持年度导航，悬停显示每日训练详情' },
        { type: 'feat', text: '训练统计支持周/月/年多视图切换 + 时间导航' },
        { type: 'feat', text: '新增统计卡片：训练次数、总时长、总组数、平均时长' },
        { type: 'feat', text: '新增连续训练天数🔥统计 + 训练记录列表' },
        { type: 'feat', text: '计划卡片和动作支持拖拽排序（PC + 移动端长按）' },
        { type: 'feat', text: '导出计划支持自定义文件名' },
        { type: 'feat', text: '条形图悬停显示训练详情 Tooltip' },
        { type: 'feat', text: '新增更新日志模块，版本变更一目了然' },
        { type: 'fix', text: '修复拖拽小动作后面板自动关闭的问题' }
      ]
    },
    {
      version: 'v2.1.0',
      date: '2026-03-24',
      tag: '架构重构',
      tagColor: 'purple',
      items: [
        { type: 'refactor', text: '单文件拆分为模块化架构（8个JS模块 + 独立CSS）' },
        { type: 'feat', text: '新增计划模板库（PPL/上下肢/全身/5天循环）' },
        { type: 'feat', text: '导入/导出支持 JSON 和 CSV 格式' },
        { type: 'feat', text: '新增自由计时器（正计时 & 倒计时）' },
        { type: 'feat', text: '深色模式 & 专注模式' }
      ]
    },
    {
      version: 'v2.0.0',
      date: '2026-03-20',
      tag: '全新版本',
      tagColor: 'rose',
      items: [
        { type: 'feat', text: '全新 UI 设计，玻璃态卡片风格' },
        { type: 'feat', text: '训练计划管理（增删改查）' },
        { type: 'feat', text: '智能训练引导，自动组间休息计时' },
        { type: 'feat', text: '训练历史记录 & 条形图统计' },
        { type: 'feat', text: '数据本地持久化（localStorage）' },
        { type: 'feat', text: '移动端响应式布局' }
      ]
    }
  ],

  // 初始化
  initChangelog() {
    const btn = document.getElementById('changelog-toggle');
    const closeBtn = document.getElementById('changelog-close-btn');
    const backdrop = document.getElementById('changelog-backdrop');

    btn?.addEventListener('click', () => this.openChangelog());
    closeBtn?.addEventListener('click', () => this.closeChangelog());
    backdrop?.addEventListener('click', () => this.closeChangelog());

    // 检查是否有新版本未读
    this.checkNewVersion();
  },

  checkNewVersion() {
    const lastSeen = localStorage.getItem(this.STORAGE_KEY);
    const badge = document.getElementById('changelog-badge');
    if (badge) {
      if (lastSeen !== this.CURRENT_VERSION) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },

  openChangelog() {
    const modal = document.getElementById('changelog-modal');
    const backdrop = document.getElementById('changelog-backdrop');
    const panel = document.getElementById('changelog-panel');
    if (!modal) return;

    this.renderChangelog();

    modal.classList.remove('hidden');
    setTimeout(() => {
      backdrop.classList.remove('opacity-0');
      panel.classList.remove('translate-y-full');
    }, 10);

    // 标记已读
    localStorage.setItem(this.STORAGE_KEY, this.CURRENT_VERSION);
    const badge = document.getElementById('changelog-badge');
    if (badge) badge.classList.add('hidden');
  },

  closeChangelog() {
    const modal = document.getElementById('changelog-modal');
    const backdrop = document.getElementById('changelog-backdrop');
    const panel = document.getElementById('changelog-panel');
    if (!modal) return;

    backdrop.classList.add('opacity-0');
    panel.classList.add('translate-y-full');
    setTimeout(() => modal.classList.add('hidden'), 300);
  },

  renderChangelog() {
    const container = document.getElementById('changelog-content');
    if (!container) return;

    const tagColors = {
      blue: 'from-blue-500 to-blue-600 text-white',
      teal: 'from-teal-500 to-teal-600 text-white',
      indigo: 'from-indigo-500 to-indigo-600 text-white',
      amber: 'from-amber-400 to-amber-500 text-white',
      purple: 'from-purple-500 to-purple-600 text-white',
      rose: 'from-rose-500 to-rose-600 text-white'
    };

    const typeIcons = {
      feat: { icon: 'fa-plus', color: 'text-green-500', bg: 'bg-green-50', label: '新增' },
      fix: { icon: 'fa-wrench', color: 'text-amber-500', bg: 'bg-amber-50', label: '修复' },
      refactor: {
        icon: 'fa-arrows-rotate',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        label: '重构'
      },
      perf: { icon: 'fa-bolt', color: 'text-purple-500', bg: 'bg-purple-50', label: '优化' },
      remove: { icon: 'fa-minus', color: 'text-red-500', bg: 'bg-red-50', label: '移除' }
    };

    container.innerHTML = this.CHANGELOG.map((release, idx) => {
      const isLatest = idx === 0;
      const tagClass = tagColors[release.tagColor] || tagColors.blue;

      const itemsHtml = release.items
        .map(item => {
          const t = typeIcons[item.type] || typeIcons.feat;
          return `
          <div class="flex items-start gap-2.5 py-1.5">
            <div class="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md ${t.bg} flex items-center justify-center">
              <i class="fa-solid ${t.icon} text-[9px] ${t.color}"></i>
            </div>
            <span class="text-sm text-slate-600 leading-relaxed">${item.text}</span>
          </div>
        `;
        })
        .join('');

      return `
        <div class="relative ${idx > 0 ? 'mt-6' : ''}">
          ${idx < this.CHANGELOG.length - 1 ? '<div class="absolute left-[11px] top-8 bottom-0 w-px bg-slate-100"></div>' : ''}
          <div class="flex items-center gap-3 mb-3">
            <div class="w-6 h-6 rounded-full ${isLatest ? 'bg-blue-600' : 'bg-slate-200'} flex items-center justify-center flex-shrink-0 relative z-10">
              <i class="fa-solid ${isLatest ? 'fa-star' : 'fa-code-commit'} text-[10px] ${isLatest ? 'text-white' : 'text-slate-400'}"></i>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-black text-slate-800">${release.version}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${tagClass}">${release.tag}</span>
              <span class="text-[11px] text-slate-400">${release.date}</span>
            </div>
          </div>
          <div class="ml-9 bg-slate-50/80 rounded-xl p-3 border border-slate-100/80">
            ${itemsHtml}
          </div>
        </div>
      `;
    }).join('');
  }
};
