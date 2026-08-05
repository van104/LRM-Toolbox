// 计划 CRUD / UI 渲染
// 作为 App 的 mixin，通过 Object.assign 混入
const PlansModule = {
  renderPlansList() {
    const container = document.getElementById('plans-list');
    if (!container) return;
    container.innerHTML = '';

    if (!this.data.plans || this.data.plans.length === 0) {
      container.innerHTML = `<div class="text-center py-10 text-slate-400"><i class="fa-regular fa-clipboard text-4xl mb-3 opacity-50"></i><p>暂无训练计划，点击右上角添加</p></div>`;
      return;
    }

    const groupedItems = DataManager.getGroupedPlans(this.data.plans);
    const isCombineMode = !!this.state.isCombineMode;

    // 绑定顶部合并控制栏按钮事件
    const combineBtn = document.getElementById('combine-plans-btn');
    const combineBar = document.getElementById('combine-mode-bar');
    const cancelCombineBtn = document.getElementById('cancel-combine-btn');
    const confirmCombineBtn = document.getElementById('confirm-combine-btn');

    if (combineBtn && !combineBtn._bound) {
      combineBtn._bound = true;
      combineBtn.onclick = () => this.toggleCombineMode(true);
    }
    if (cancelCombineBtn && !cancelCombineBtn._bound) {
      cancelCombineBtn._bound = true;
      cancelCombineBtn.onclick = () => this.toggleCombineMode(false);
    }
    if (confirmCombineBtn && !confirmCombineBtn._bound) {
      confirmCombineBtn._bound = true;
      confirmCombineBtn.onclick = () => this.confirmCombineSelected();
    }

    if (combineBar) {
      combineBar.classList.toggle('hidden', !isCombineMode);
    }

    groupedItems.forEach((item, itemIdx) => {
      if (item.isGroup) {
        // === 大计划组卡片 (大框包裹) ===
        const groupEl = document.createElement('div');
        const isGroupEnabled = item.enabled !== false;
        groupEl.className = `rounded-3xl p-4 md:p-5 border-2 transition-all relative ${
          isGroupEnabled
            ? 'bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white border-indigo-200/90 shadow-md'
            : 'bg-slate-50 border-slate-200 opacity-60 grayscale-[40%]'
        }`;
        groupEl.dataset.groupId = item.groupId;

        const subCardsHtml = item.plans
          .map(
            (plan, pIdx) => `
          <div class="bg-white rounded-2xl p-4 border border-indigo-100/80 shadow-sm relative group mb-2.5 transition-all hover:border-indigo-300" data-plan-id="${plan.id}">
            <div class="flex justify-between items-start">
              ${
                isCombineMode
                  ? `<div class="pt-1 mr-2"><input type="checkbox" class="combine-checkbox w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" data-plan-id="${plan.id}"></div>`
                  : ''
              }
              <div class="cursor-pointer flex-1 min-w-0" onclick="App.togglePlanCard(this)">
                <h4 class="font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <i class="fa-solid fa-grip-vertical text-xs text-slate-300 cursor-grab plan-drag-handle"></i>
                  <span class="truncate">${plan.title}</span>
                  <i class="fa-solid fa-chevron-down text-xs text-slate-300 transition-transform duration-300"></i>
                </h4>
                <div class="flex gap-1 mt-1 flex-wrap">
                  ${
                    plan.scheduleType === 'cycle'
                      ? `<span class="text-[11px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><i class="fa-solid fa-rotate text-[9px]"></i>${plan.cycleTotalDays || 4}天循环 · 第 ${plan.cycleDayOffset || 1} 天${plan.startDate ? ` (基准:${plan.startDate.slice(5)})` : ''}</span>`
                      : plan.days.map(d => `<span class="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">${d}</span>`).join('')
                  }
                  ${plan.enabled === false ? `<span class="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-bold">单项停用</span>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <button type="button" class="px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  plan.enabled !== false
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }" onclick="App.togglePlanEnabled('${plan.id}', event)" title="开关此单项计划">
                  ${plan.enabled !== false ? '开启' : '关闭'}
                </button>
                <button class="w-7 h-7 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors" onclick="App.editPlan('${plan.id}')" title="编辑子计划">
                  <i class="fa-solid fa-pen text-[11px]"></i>
                </button>
                <button class="w-7 h-7 rounded-full bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" onclick="App.deletePlan('${plan.id}')" title="删除子计划">
                  <i class="fa-solid fa-trash text-[11px]"></i>
                </button>
              </div>
            </div>
            <div class="space-y-1.5 hidden plan-exercises overflow-hidden transition-all duration-300 mt-2.5 border-t border-slate-100 pt-2">
              ${plan.exercises
                .map(
                  (ex, exIdx) => `
                <div class="flex justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg exercise-item cursor-grab" draggable="true" data-plan-id="${plan.id}" data-exercise-idx="${exIdx}">
                  <span class="font-medium flex items-center gap-1.5"><i class="fa-solid fa-grip-vertical text-[9px] text-slate-300"></i>${ex.name}</span>
                  <div class="flex gap-2 text-[11px] text-slate-400">
                    <span>${ex.sets}组</span>
                    <span>${ex.reps}</span>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
          )
          .join('');

        groupEl.innerHTML = `
          <div class="mb-3 pb-2 border-b border-indigo-100/60">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <i class="fa-solid fa-layer-group text-xs"></i>
              </div>
              <h3 class="font-black text-base text-slate-800 cursor-pointer hover:text-indigo-600 break-words" onclick="App.editGroupTitle('${item.groupId}')" title="点击修改大套件名称">
                ${item.groupTitle}
                <i class="fa-solid fa-pen text-[10px] text-slate-300 ml-1"></i>
              </h3>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                ${item.plans.length} 个训练日
              </span>
              <div class="flex items-center gap-2 flex-shrink-0">
                <button type="button" class="px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isGroupEnabled
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-slate-300 text-slate-600 hover:bg-slate-400'
                }" onclick="App.toggleGroupEnabled('${item.groupId}', event)" title="一键开启/关闭整组大计划">
                  ${isGroupEnabled ? '<i class="fa-solid fa-power-off mr-1"></i>整组开启' : '<i class="fa-solid fa-pause mr-1"></i>整组暂停'}
                </button>
                <button type="button" class="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 flex items-center justify-center transition-colors shadow-xs" onclick="App.splitGroup('${item.groupId}', event)" title="拆分为独立卡片">
                  <i class="fa-solid fa-object-ungroup text-xs"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="group-sub-plans-container">
            ${subCardsHtml}
          </div>
        `;

        container.appendChild(groupEl);

        // 为大框内的子卡片绑定拖拽事件
        groupEl.querySelectorAll('[data-plan-id]').forEach(cardEl => {
          const pId = cardEl.dataset.planId;
          this.initExerciseDragInCard(cardEl, pId);
        });
      } else {
        // === 独立卡片 ===
        const plan = item.plan;
        const isPlanEnabled = plan.enabled !== false;
        const el = document.createElement('div');
        el.className = `bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all relative group ${
          isPlanEnabled ? 'border-slate-100' : 'border-slate-200 opacity-60 grayscale-[30%]'
        }`;
        el.dataset.planId = plan.id;
        el.draggable = true;

        el.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            ${
              isCombineMode
                ? `<div class="pt-1 mr-2"><input type="checkbox" class="combine-checkbox w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" data-plan-id="${plan.id}"></div>`
                : ''
            }
            <div class="cursor-pointer flex-1 min-w-0" onclick="App.togglePlanCard(this)">
              <h3 class="font-bold text-lg text-slate-800 flex items-center">
                <i class="fa-solid fa-grip-vertical mr-2 text-xs text-slate-300 cursor-grab plan-drag-handle"></i>
                <span class="truncate">${plan.title}</span>
                <i class="fa-solid fa-chevron-down ml-2 text-xs text-slate-300 transition-transform duration-300"></i>
              </h3>
              <div class="flex gap-1 mt-1 flex-wrap">
                ${
                  plan.scheduleType === 'cycle'
                    ? `<span class="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><i class="fa-solid fa-rotate text-[10px]"></i>${plan.cycleTotalDays || 4}天循环 · 第 ${plan.cycleDayOffset || 1} 天${plan.startDate ? ` (基准:${plan.startDate.slice(5)})` : ''}</span>`
                    : plan.days.map(d => `<span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">${d}</span>`).join('')
                }
                ${!isPlanEnabled ? `<span class="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">已关停</span>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0 ml-2">
              <button type="button" class="px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                isPlanEnabled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
              }" onclick="App.togglePlanEnabled('${plan.id}', event)" title="开关此计划">
                ${isPlanEnabled ? '已开启' : '已关闭'}
              </button>
              <button class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors" onclick="App.editPlan('${plan.id}')" title="编辑计划">
                <i class="fa-solid fa-pen text-xs"></i>
              </button>
              <button class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" onclick="App.deletePlan('${plan.id}')" title="删除计划">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </div>
          <div class="space-y-2 hidden plan-exercises overflow-hidden transition-all duration-300 border-t border-slate-100 pt-2.5">
            ${plan.exercises
              .map(
                (ex, exIdx) => `
              <div class="flex justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg exercise-item cursor-grab" draggable="true" data-plan-id="${plan.id}" data-exercise-idx="${exIdx}">
                <span class="font-medium flex items-center gap-1.5"><i class="fa-solid fa-grip-vertical text-[10px] text-slate-300"></i>${ex.name}</span>
                <div class="flex gap-3 text-xs text-slate-400">
                  <span><i class="fa-solid fa-layer-group mr-1"></i>${ex.sets}组</span>
                  <span><i class="fa-solid fa-rotate mr-1"></i>${ex.reps}</span>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        `;
        container.appendChild(el);
        this.initExerciseDragInCard(el, plan.id);
      }
    });

    if (isCombineMode) {
      container.querySelectorAll('.combine-checkbox').forEach(cb => {
        cb.onchange = () => this.updateCombineSelectedCount();
      });
      this.updateCombineSelectedCount();
    }

    // 绑定大计划卡片拖拽事件
    this.initPlanCardDrag(container);

    // 全局绑定动作自动补全点击外部关闭
    document.addEventListener('click', e => {
      if (!e.target.closest('.exercise-autocomplete-wrapper')) {
        document.querySelectorAll('.exercise-autocomplete-list').forEach(list => {
          list.classList.add('hidden');
        });
      }
    });
  },

  // === 计划卡片拖拽排序 ===
  initPlanCardDrag(container) {
    let draggedPlan = null;

    container.addEventListener('dragstart', e => {
      const card = e.target.closest('[data-plan-id]');
      if (!card || !card.parentElement || card.parentElement !== container) return;
      // 确保只有通过卡片本身启动（不是内部 exercise-item）
      if (e.target.classList.contains('exercise-item')) return;
      draggedPlan = card;
      card.classList.add('opacity-50');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.dataset.planId);
    });

    container.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest('[data-plan-id]');
      if (
        !target ||
        target === draggedPlan ||
        !target.parentElement ||
        target.parentElement !== container
      )
        return;
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        container.insertBefore(draggedPlan, target);
      } else {
        container.insertBefore(draggedPlan, target.nextSibling);
      }
    });

    container.addEventListener('dragend', () => {
      if (draggedPlan) {
        draggedPlan.classList.remove('opacity-50');
        // 根据 DOM 顺序更新数据
        const newOrder = Array.from(container.querySelectorAll('[data-plan-id]')).map(
          el => el.dataset.planId
        );
        const reordered = newOrder
          .map(id => this.data.plans.find(p => p.id === id))
          .filter(Boolean);
        if (reordered.length === this.data.plans.length) {
          this.data.plans = reordered;
          this.saveDataSilent();
        }
        draggedPlan = null;
      }
    });

    // === 长按触屏拖拽支持（移动端） ===
    this.initPlanTouchDrag(container);
  },

  // === 小动作拖拽排序（计划卡片内） ===
  initExerciseDragInCard(cardEl, planId) {
    const exercisesContainer = cardEl.querySelector('.plan-exercises');
    if (!exercisesContainer) return;

    let draggedEx = null;

    exercisesContainer.addEventListener('dragstart', e => {
      const item = e.target.closest('.exercise-item');
      if (!item) return;
      e.stopPropagation(); // 防止触发父级计划卡片拖拽
      draggedEx = item;
      item.classList.add('opacity-50');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'exercise');
    });

    exercisesContainer.addEventListener('dragover', e => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest('.exercise-item');
      if (!target || target === draggedEx) return;
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        exercisesContainer.insertBefore(draggedEx, target);
      } else {
        exercisesContainer.insertBefore(draggedEx, target.nextSibling);
      }
    });

    exercisesContainer.addEventListener('dragend', () => {
      if (draggedEx) {
        draggedEx.classList.remove('opacity-50');
        // 根据 DOM 顺序更新数据
        const plan = this.data.plans.find(p => p.id === planId);
        if (plan) {
          const newOrder = Array.from(exercisesContainer.querySelectorAll('.exercise-item')).map(
            el => parseInt(el.dataset.exerciseIdx)
          );
          const reordered = newOrder.map(idx => plan.exercises[idx]).filter(Boolean);
          if (reordered.length === plan.exercises.length) {
            plan.exercises = reordered;
            this.saveDataSilent();
            // 就地更新 idx，不重新渲染（避免面板关闭）
            Array.from(exercisesContainer.querySelectorAll('.exercise-item')).forEach((el, i) => {
              el.dataset.exerciseIdx = i;
            });
          }
        }
        draggedEx = null;
      }
    });

    // 移动端触屏支持
    this.initExerciseTouchDrag(exercisesContainer, planId);
  },

  // === 移动端触屏拖拽 - 计划卡片 ===
  initPlanTouchDrag(container) {
    let touchItem = null;
    let touchTimer = null;
    let isDragging = false;
    let startY = 0;

    const onTouchStart = e => {
      const card = e.target.closest('[data-plan-id]');
      if (!card || card.parentElement !== container) return;
      if (e.target.closest('.exercise-item')) return;
      startY = e.touches[0].clientY;
      touchTimer = setTimeout(() => {
        isDragging = true;
        touchItem = card;
        card.classList.add('opacity-50', 'scale-[1.02]');
        // 触发触觉反馈
        if (navigator.vibrate) navigator.vibrate(30);
      }, 400);
    };

    const onTouchMove = e => {
      if (!isDragging || !touchItem) {
        if (Math.abs(e.touches[0].clientY - startY) > 10) {
          clearTimeout(touchTimer);
        }
        return;
      }
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const cards = Array.from(container.querySelectorAll('[data-plan-id]'));
      for (const card of cards) {
        if (card === touchItem) continue;
        const rect = card.getBoundingClientRect();
        if (touchY > rect.top && touchY < rect.bottom) {
          const midY = rect.top + rect.height / 2;
          if (touchY < midY) {
            container.insertBefore(touchItem, card);
          } else {
            container.insertBefore(touchItem, card.nextSibling);
          }
          break;
        }
      }
    };

    const onTouchEnd = () => {
      clearTimeout(touchTimer);
      if (isDragging && touchItem) {
        touchItem.classList.remove('opacity-50', 'scale-[1.02]');
        const newOrder = Array.from(container.querySelectorAll('[data-plan-id]')).map(
          el => el.dataset.planId
        );
        const reordered = newOrder
          .map(id => this.data.plans.find(p => p.id === id))
          .filter(Boolean);
        if (reordered.length === this.data.plans.length) {
          this.data.plans = reordered;
          this.saveDataSilent();
        }
      }
      isDragging = false;
      touchItem = null;
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
  },

  // === 移动端触屏拖拽 - 小动作 ===
  initExerciseTouchDrag(exercisesContainer, planId) {
    let touchItem = null;
    let touchTimer = null;
    let isDragging = false;
    let startY = 0;

    const onTouchStart = e => {
      const item = e.target.closest('.exercise-item');
      if (!item) return;
      startY = e.touches[0].clientY;
      touchTimer = setTimeout(() => {
        isDragging = true;
        touchItem = item;
        item.classList.add('opacity-50', 'scale-[1.02]', 'ring-2', 'ring-blue-300');
        if (navigator.vibrate) navigator.vibrate(30);
      }, 400);
    };

    const onTouchMove = e => {
      if (!isDragging || !touchItem) {
        if (Math.abs(e.touches[0].clientY - startY) > 10) {
          clearTimeout(touchTimer);
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const touchY = e.touches[0].clientY;
      const items = Array.from(exercisesContainer.querySelectorAll('.exercise-item'));
      for (const item of items) {
        if (item === touchItem) continue;
        const rect = item.getBoundingClientRect();
        if (touchY > rect.top && touchY < rect.bottom) {
          const midY = rect.top + rect.height / 2;
          if (touchY < midY) {
            exercisesContainer.insertBefore(touchItem, item);
          } else {
            exercisesContainer.insertBefore(touchItem, item.nextSibling);
          }
          break;
        }
      }
    };

    const onTouchEnd = () => {
      clearTimeout(touchTimer);
      if (isDragging && touchItem) {
        touchItem.classList.remove('opacity-50', 'scale-[1.02]', 'ring-2', 'ring-blue-300');
        const plan = this.data.plans.find(p => p.id === planId);
        if (plan) {
          const newOrder = Array.from(exercisesContainer.querySelectorAll('.exercise-item')).map(
            el => parseInt(el.dataset.exerciseIdx)
          );
          const reordered = newOrder.map(idx => plan.exercises[idx]).filter(Boolean);
          if (reordered.length === plan.exercises.length) {
            plan.exercises = reordered;
            this.saveDataSilent();
            Array.from(exercisesContainer.querySelectorAll('.exercise-item')).forEach((el, i) => {
              el.dataset.exerciseIdx = i;
            });
          }
        }
      }
      isDragging = false;
      touchItem = null;
    };

    exercisesContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    exercisesContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    exercisesContainer.addEventListener('touchend', onTouchEnd);
  },

  // 保存数据但不重新渲染（避免拖拽中 UI 闪烁）
  saveDataSilent() {
    localStorage.setItem('fitness_plans_v2', JSON.stringify(this.data.plans));
    this.checkTodayPlan();
  },

  togglePlanCard(headerEl) {
    const card = headerEl.closest('.group');
    const content = card.querySelector('.plan-exercises');
    const icon = headerEl.querySelector('.fa-chevron-down');
    content.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
  },

  switchScheduleType(type) {
    const weeklyRadio = document.getElementById('schedule-type-weekly');
    const cycleRadio = document.getElementById('schedule-type-cycle');
    const weeklyLbl = document.getElementById('schedule-type-weekly-lbl');
    const cycleLbl = document.getElementById('schedule-type-cycle-lbl');
    const weeklyBox = document.getElementById('weekly-schedule-box');
    const cycleBox = document.getElementById('cycle-schedule-box');

    if (type === 'cycle') {
      if (cycleRadio) cycleRadio.checked = true;
      cycleLbl?.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-600');
      cycleLbl?.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-500');
      weeklyLbl?.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-600');
      weeklyLbl?.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-500');
      weeklyBox?.classList.add('hidden');
      cycleBox?.classList.remove('hidden');
    } else {
      if (weeklyRadio) weeklyRadio.checked = true;
      weeklyLbl?.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-600');
      weeklyLbl?.classList.remove('border-slate-200', 'bg-slate-50', 'text-slate-500');
      cycleLbl?.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-600');
      cycleLbl?.classList.add('border-slate-200', 'bg-slate-50', 'text-slate-500');
      weeklyBox?.classList.remove('hidden');
      cycleBox?.classList.add('hidden');
    }
  },

  openModal(planId = null) {
    this.dom.modal.classList.remove('hidden');
    setTimeout(() => {
      this.dom.modalBackdrop.classList.remove('opacity-0');
      this.dom.modalPanel.classList.remove('translate-y-full');
    }, 10);

    // 重置表单
    this.dom.planForm.reset();
    this.dom.planForm.querySelector('input[name="planId"]').value = '';
    document.getElementById('exercises-list').innerHTML = '';
    const exList = document.getElementById('exercises-list');
    exList._dragBound = false;

    // 绑定单选切换事件
    const weeklyLbl = document.getElementById('schedule-type-weekly-lbl');
    const cycleLbl = document.getElementById('schedule-type-cycle-lbl');
    if (weeklyLbl) weeklyLbl.onclick = () => this.switchScheduleType('weekly');
    if (cycleLbl) cycleLbl.onclick = () => this.switchScheduleType('cycle');

    // 生成星期选择器
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dayContainer = document.getElementById('day-selector');
    dayContainer.innerHTML = days
      .map(
        d => `
                <button type="button" class="day-btn w-9 h-9 rounded-full text-xs font-bold border border-slate-200 text-slate-400 hover:border-blue-500 transition-colors" data-day="${d}">${d.replace('周', '')}</button>
            `
      )
      .join('');

    const todayStr = new Date().toISOString().slice(0, 10);
    const startDateInput = this.dom.planForm.querySelector('input[name="startDate"]');
    if (startDateInput) startDateInput.value = todayStr;

    if (planId) {
      document.getElementById('modal-title').textContent = '编辑计划';
      const plan = this.data.plans.find(p => p.id === planId);
      if (plan) {
        this.dom.planForm.querySelector('input[name="planId"]').value = plan.id;
        this.dom.planForm.querySelector('input[name="title"]').value = plan.title;

        this.switchScheduleType(plan.scheduleType || 'weekly');

        if (plan.scheduleType === 'cycle') {
          const totalDaysInput = this.dom.planForm.querySelector('input[name="cycleTotalDays"]');
          const dayOffsetInput = this.dom.planForm.querySelector('input[name="cycleDayOffset"]');
          if (totalDaysInput) totalDaysInput.value = plan.cycleTotalDays || 4;
          if (dayOffsetInput) dayOffsetInput.value = plan.cycleDayOffset || 1;
          if (startDateInput) startDateInput.value = plan.startDate || todayStr;
        }

        // 填充星期
        (plan.days || []).forEach(d => {
          const btn = dayContainer.querySelector(`[data-day="${d}"]`);
          if (btn) this.toggleDayBtn(btn, true);
        });

        // 填充动作
        plan.exercises.forEach(ex => this.addExerciseRow(ex));
      }
    } else {
      document.getElementById('modal-title').textContent = '新建计划';
      this.switchScheduleType('weekly');
      this.addExerciseRow(); // 默认加一行
    }

    // 绑定星期点击事件
    dayContainer.querySelectorAll('.day-btn').forEach(btn => {
      btn.onclick = () => this.toggleDayBtn(btn);
    });
  },

  closeModal() {
    this.dom.modalBackdrop.classList.add('opacity-0');
    this.dom.modalPanel.classList.add('translate-y-full');
    setTimeout(() => {
      this.dom.modal.classList.add('hidden');
    }, 300);
  },

  toggleDayBtn(btn, forceSelect = false) {
    if (forceSelect || !btn.classList.contains('bg-blue-600')) {
      btn.classList.add('bg-blue-600', 'text-white', 'border-transparent');
      btn.classList.remove('text-slate-400', 'border-slate-200');
    } else {
      btn.classList.remove('bg-blue-600', 'text-white', 'border-transparent');
      btn.classList.add('text-slate-400', 'border-slate-200');
    }
    this.updateSelectedDays();
  },

  updateSelectedDays() {
    const selected = Array.from(document.querySelectorAll('.day-btn.bg-blue-600')).map(
      b => b.dataset.day
    );
    document.getElementById('selected-days-input').value = JSON.stringify(selected);
  },

  addExerciseRow(data = null) {
    const container = document.getElementById('exercises-list');
    const div = document.createElement('div');
    div.className =
      'grid grid-cols-12 gap-2 items-start animate-[fadeIn_0.3s_ease-out] exercise-edit-row';
    div.draggable = true;

    const restBetween = data ? (data.restBetweenSets ?? data.rest ?? 60) : 60;
    const restAfter = data ? (data.restAfterExercise ?? data.rest ?? 90) : 90;

    div.innerHTML = `
                <div class="col-span-1 flex items-center justify-center pt-2 cursor-grab exercise-edit-handle">
                    <i class="fa-solid fa-grip-vertical text-xs text-slate-300"></i>
                </div>
                <div class="col-span-3 relative exercise-autocomplete-wrapper">
                    <input type="text" class="w-full bg-slate-50 rounded-lg px-2 py-2 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none exercise-name-input" placeholder="动作名称" value="${data ? data.name : ''}" required name="ex_name" autocomplete="off">
                    <div class="exercise-autocomplete-list hidden absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl max-h-48 overflow-y-auto"></div>
                </div>
                <div class="col-span-1">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-0.5 py-2 text-xs font-bold text-center focus:ring-1 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="组" value="${data ? data.sets : 3}" required min="1" name="ex_sets" title="组数">
                </div>
                <div class="col-span-2">
                    <input type="text" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-xs font-bold text-center focus:ring-1 focus:ring-blue-500 outline-none" placeholder="次" value="${data ? data.reps : '12'}" required name="ex_reps" title="次数/目标">
                </div>
                <div class="col-span-2">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-xs font-bold text-center focus:ring-1 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="组休(秒)" value="${restBetween}" required min="0" name="ex_rest_between" title="组间休(秒)">
                </div>
                <div class="col-span-2">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-xs font-bold text-center focus:ring-1 focus:ring-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="动休(秒)" value="${restAfter}" required min="0" name="ex_rest_after" title="动作休(秒)">
                </div>
                <div class="col-span-1 flex justify-center pt-2">
                    <button type="button" class="text-slate-300 hover:text-red-500" onclick="this.parentElement.parentElement.remove()" title="删除动作"><i class="fa-solid fa-minus-circle"></i></button>
                </div>
            `;
    container.appendChild(div);
    this.initEditRowDrag(container);

    // 绑定自动补全
    const input = div.querySelector('.exercise-name-input');
    const list = div.querySelector('.exercise-autocomplete-list');

    input.addEventListener('input', () => {
      const val = input.value;
      if (!val) {
        list.classList.add('hidden');
        return;
      }

      const results = window.ExerciseLibrary.search(val);
      if (results.length === 0) {
        list.classList.add('hidden');
        return;
      }

      list.innerHTML = results
        .map(
          item => `
        <div class="p-2 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex flex-col gap-1 transition-colors autocomplete-item" data-name="${item.name}">
          <span class="text-sm font-bold text-slate-700">${item.name}</span>
          <div class="flex flex-wrap gap-1">
            <span class="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">${item.group}</span>
            ${item.tags.map(t => `<span class="text-[9px] bg-blue-50 text-blue-500 px-1 py-0.5 rounded">${t}</span>`).join('')}
          </div>
        </div>
      `
        )
        .join('');

      list.querySelectorAll('.autocomplete-item').forEach(el => {
        el.addEventListener('click', () => {
          input.value = el.dataset.name;
          list.classList.add('hidden');
        });
      });
      list.classList.remove('hidden');
    });

    input.addEventListener('focus', () => {
      if (input.value && list.innerHTML) {
        list.classList.remove('hidden');
      }
    });
  },

  // === 编辑模态框内动作行拖拽 ===
  initEditRowDrag(container) {
    // 避免重复绑定
    if (container._dragBound) return;
    container._dragBound = true;

    let draggedRow = null;

    container.addEventListener('dragstart', e => {
      const row = e.target.closest('.exercise-edit-row');
      if (!row) return;
      draggedRow = row;
      row.classList.add('opacity-50');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', 'edit-row');
    });

    container.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest('.exercise-edit-row');
      if (!target || target === draggedRow) return;
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (e.clientY < midY) {
        container.insertBefore(draggedRow, target);
      } else {
        container.insertBefore(draggedRow, target.nextSibling);
      }
    });

    container.addEventListener('dragend', () => {
      if (draggedRow) {
        draggedRow.classList.remove('opacity-50');
        draggedRow = null;
      }
    });

    // 移动端触屏
    let touchItem = null;
    let touchTimer = null;
    let isDragging = false;
    let startY = 0;

    container.addEventListener(
      'touchstart',
      e => {
        const row = e.target.closest('.exercise-edit-row');
        if (!row) return;
        startY = e.touches[0].clientY;
        touchTimer = setTimeout(() => {
          isDragging = true;
          touchItem = row;
          row.classList.add('opacity-50', 'ring-2', 'ring-blue-300');
          if (navigator.vibrate) navigator.vibrate(30);
        }, 400);
      },
      { passive: true }
    );

    container.addEventListener(
      'touchmove',
      e => {
        if (!isDragging || !touchItem) {
          if (Math.abs(e.touches[0].clientY - startY) > 10) {
            clearTimeout(touchTimer);
          }
          return;
        }
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const rows = Array.from(container.querySelectorAll('.exercise-edit-row'));
        for (const row of rows) {
          if (row === touchItem) continue;
          const rect = row.getBoundingClientRect();
          if (touchY > rect.top && touchY < rect.bottom) {
            const midY = rect.top + rect.height / 2;
            if (touchY < midY) {
              container.insertBefore(touchItem, row);
            } else {
              container.insertBefore(touchItem, row.nextSibling);
            }
            break;
          }
        }
      },
      { passive: false }
    );

    container.addEventListener('touchend', () => {
      clearTimeout(touchTimer);
      if (touchItem) {
        touchItem.classList.remove('opacity-50', 'ring-2', 'ring-blue-300');
      }
      isDragging = false;
      touchItem = null;
    });
  },

  editPlan(id) {
    this.openModal(id);
  },

  deletePlan(id) {
    this.confirm('删除计划', '确定删除该计划吗？', () => {
      this.data.plans = this.data.plans.filter(p => p.id !== id);
      this.saveData();
    });
  },

  savePlanFromForm() {
    const form = this.dom.planForm;
    const formData = new FormData(form);
    const title = formData.get('title')?.trim();
    const scheduleType = formData.get('scheduleType') === 'cycle' ? 'cycle' : 'weekly';
    const daysStr = formData.get('days');
    const days = daysStr ? JSON.parse(daysStr) : [];
    const planId = formData.get('planId');

    const cycleTotalDays = Math.max(1, parseInt(formData.get('cycleTotalDays')) || 4);
    const cycleDayOffset = Math.max(1, parseInt(formData.get('cycleDayOffset')) || 1);
    const startDate = formData.get('startDate') || new Date().toISOString().slice(0, 10);

    if (!title) {
      this.confirm('提示', '请输入计划名称');
      return;
    }

    if (scheduleType === 'weekly' && days.length === 0) {
      this.confirm('提示', '请至少选择一天');
      return;
    }

    // 收集动作数据
    const exercises = [];
    const names = form.querySelectorAll('input[name="ex_name"]');
    const sets = form.querySelectorAll('input[name="ex_sets"]');
    const reps = form.querySelectorAll('input[name="ex_reps"]');
    const restsBetween = form.querySelectorAll('input[name="ex_rest_between"]');
    const restsAfter = form.querySelectorAll('input[name="ex_rest_after"]');

    for (let i = 0; i < names.length; i++) {
      if (names[i].value.trim()) {
        exercises.push({
          name: names[i].value.trim(),
          sets: parseInt(sets[i].value) || 1,
          reps: reps[i].value || '10',
          restBetweenSets: parseInt(restsBetween[i].value) || 60,
          restAfterExercise: parseInt(restsAfter[i].value) || 90
        });
      }
    }

    if (exercises.length === 0) {
      this.confirm('提示', '请至少添加一个动作');
      return;
    }

    const newPlan = DataManager.normalizePlan({
      id: planId || Date.now().toString(),
      title,
      scheduleType,
      days,
      cycleTotalDays,
      cycleDayOffset,
      startDate,
      exercises
    });

    if (planId) {
      const idx = this.data.plans.findIndex(p => p.id === planId);
      if (idx !== -1) this.data.plans[idx] = newPlan;
    } else {
      this.data.plans.push(newPlan);
    }

    this.saveData();
    this.closeModal();
  },

  // === 开关单计划 ===
  togglePlanEnabled(planId, e) {
    if (e) e.stopPropagation();
    const plan = this.data.plans.find(p => p.id === planId);
    if (plan) {
      plan.enabled = plan.enabled === false;
      this.saveData();
      if (this.checkTodayPlan) this.checkTodayPlan();
    }
  },

  // === 开关整个大计划组 ===
  toggleGroupEnabled(groupId, e) {
    if (e) e.stopPropagation();
    const grouped = DataManager.getGroupedPlans(this.data.plans);
    const targetGroup = grouped.find(g => g.isGroup && g.groupId === groupId);
    if (!targetGroup) return;

    const newTargetState = !targetGroup.enabled;
    const planIds = new Set(targetGroup.plans.map(p => p.id));

    this.data.plans.forEach(p => {
      if (planIds.has(p.id)) {
        p.enabled = newTargetState;
      }
    });

    this.saveData();
    if (this.checkTodayPlan) this.checkTodayPlan();
  },

  // === 拆分大计划组 ===
  splitGroup(groupId, e) {
    if (e) e.stopPropagation();
    this.confirm('拆分大套件', '确定将此大训练套件拆分为独立分散的计划吗？', () => {
      const grouped = DataManager.getGroupedPlans(this.data.plans);
      const targetGroup = grouped.find(g => g.isGroup && g.groupId === groupId);
      if (!targetGroup) return;

      const planIds = new Set(targetGroup.plans.map(p => p.id));
      this.data.plans.forEach(p => {
        if (planIds.has(p.id)) {
          p.groupId = null;
          p.groupTitle = '';
        }
      });

      this.saveData();
      if (this.checkTodayPlan) this.checkTodayPlan();
    });
  },

  // === 修改大套件标题 ===
  editGroupTitle(groupId) {
    const grouped = DataManager.getGroupedPlans(this.data.plans);
    const targetGroup = grouped.find(g => g.isGroup && g.groupId === groupId);
    if (!targetGroup) return;

    const oldTitle = targetGroup.groupTitle || '训练套件';
    this.prompt('修改大套件名称', '请输入大训练套件名称', oldTitle, newTitle => {
      if (newTitle && newTitle.trim() && newTitle.trim() !== oldTitle) {
        const trimmed = newTitle.trim();
        const planIds = new Set(targetGroup.plans.map(p => p.id));
        this.data.plans.forEach(p => {
          if (planIds.has(p.id)) {
            p.groupId = groupId.startsWith('auto_group_') ? `group_${Date.now()}` : groupId;
            p.groupTitle = trimmed;
          }
        });
        this.saveData();
      }
    });
  },

  // === 手动多选合并控制 ===
  toggleCombineMode(forceState = null) {
    this.state.isCombineMode = forceState !== null ? !!forceState : !this.state.isCombineMode;
    this.renderPlansList();
  },

  updateCombineSelectedCount() {
    const checked = document.querySelectorAll('.combine-checkbox:checked');
    const countEl = document.getElementById('combine-selected-count');
    if (countEl) countEl.textContent = checked.length;
  },

  confirmCombineSelected() {
    const checked = Array.from(document.querySelectorAll('.combine-checkbox:checked')).map(
      cb => cb.dataset.planId
    );
    if (checked.length < 2) {
      this.confirm('提示', '请至少勾选 2 个训练计划进行合并');
      return;
    }

    const defaultTitle = `组合套件 (${checked.length} 个训练日)`;
    this.prompt('合并训练套件', '请输入合并后的套件名称', defaultTitle, groupTitle => {
      const finalTitle = (groupTitle || '').trim() || defaultTitle;
      const newGroupId = `group_${Date.now()}`;

      this.data.plans.forEach(p => {
        if (checked.includes(p.id)) {
          p.groupId = newGroupId;
          p.groupTitle = finalTitle;
        }
      });

      this.state.isCombineMode = false;
      this.saveData();
      if (this.checkTodayPlan) this.checkTodayPlan();
    });
  }
};

window.PlansModule = PlansModule;
