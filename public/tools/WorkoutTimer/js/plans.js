// 计划 CRUD / UI 渲染
// 作为 App 的 mixin，通过 Object.assign 混入
const PlansModule = {
  renderPlansList() {
    const container = document.getElementById('plans-list');
    container.innerHTML = '';

    if (this.data.plans.length === 0) {
      container.innerHTML = `<div class="text-center py-10 text-slate-400"><i class="fa-regular fa-clipboard text-4xl mb-3 opacity-50"></i><p>暂无训练计划，点击右上角添加</p></div>`;
      return;
    }

    this.data.plans.forEach((plan, planIdx) => {
      const el = document.createElement('div');
      el.className =
        'bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group';
      el.dataset.planId = plan.id;
      el.dataset.planIdx = planIdx;
      // 计划卡片拖拽属性
      el.draggable = true;
      el.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="cursor-pointer flex-1" onclick="App.togglePlanCard(this)">
                        <h3 class="font-bold text-lg text-slate-800 flex items-center">
                            <i class="fa-solid fa-grip-vertical mr-2 text-xs text-slate-300 cursor-grab plan-drag-handle"></i>
                            ${plan.title}
                            <i class="fa-solid fa-chevron-down ml-2 text-xs text-slate-300 transition-transform duration-300"></i>
                        </h3>
                        <div class="flex gap-1 mt-1 flex-wrap">
                            ${plan.days.map(d => `<span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">${d}</span>`).join('')}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors" onclick="App.editPlan('${plan.id}')">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" onclick="App.deletePlan('${plan.id}')">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
                <div class="space-y-2 hidden plan-exercises overflow-hidden transition-all duration-300">
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

      // 绑定小动作拖拽事件
      this.initExerciseDragInCard(el, plan.id);
    });

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
    // 重置拖拽绑定标志
    const exList = document.getElementById('exercises-list');
    exList._dragBound = false;

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

    if (planId) {
      document.getElementById('modal-title').textContent = '编辑计划';
      const plan = this.data.plans.find(p => p.id === planId);
      if (plan) {
        this.dom.planForm.querySelector('input[name="planId"]').value = plan.id;
        this.dom.planForm.querySelector('input[name="title"]').value = plan.title;

        // 填充星期
        plan.days.forEach(d => {
          const btn = dayContainer.querySelector(`[data-day="${d}"]`);
          if (btn) this.toggleDayBtn(btn, true);
        });

        // 填充动作
        plan.exercises.forEach(ex => this.addExerciseRow(ex));
      }
    } else {
      document.getElementById('modal-title').textContent = '新建计划';
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
                    <input type="text" class="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none exercise-name-input" placeholder="动作名称" value="${data ? data.name : ''}" required name="ex_name" autocomplete="off">
                    <div class="exercise-autocomplete-list hidden absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl max-h-48 overflow-y-auto"></div>
                </div>
                <div class="col-span-2">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none" placeholder="组" value="${data ? data.sets : 3}" required min="1" name="ex_sets">
                </div>
                <div class="col-span-2">
                    <input type="text" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none" placeholder="次" value="${data ? data.reps : '12'}" required name="ex_reps">
                </div>
                <div class="col-span-2">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none" placeholder="组间休(秒)" value="${restBetween}" required min="0" name="ex_rest_between">
                </div>
                <div class="col-span-1">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none" placeholder="动作休(秒)" value="${restAfter}" required min="0" name="ex_rest_after">
                </div>
                <div class="col-span-1 flex justify-center pt-2">
                    <button type="button" class="text-slate-300 hover:text-red-500" onclick="this.parentElement.parentElement.remove()"><i class="fa-solid fa-minus-circle"></i></button>
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
    const title = formData.get('title');
    const daysStr = formData.get('days');
    const days = daysStr ? JSON.parse(daysStr) : [];
    const planId = formData.get('planId');

    if (days.length === 0) {
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

    const newPlan = {
      id: planId || Date.now().toString(),
      title,
      days,
      exercises
    };

    if (planId) {
      const idx = this.data.plans.findIndex(p => p.id === planId);
      if (idx !== -1) this.data.plans[idx] = newPlan;
    } else {
      this.data.plans.push(newPlan);
    }

    this.saveData();
    this.closeModal();
  }
};

window.PlansModule = PlansModule;
