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

    this.data.plans.forEach(plan => {
      const el = document.createElement('div');
      el.className =
        'bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group';
      el.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="cursor-pointer flex-1" onclick="App.togglePlanCard(this)">
                        <h3 class="font-bold text-lg text-slate-800 flex items-center">
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
                        ex => `
                        <div class="flex justify-between text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <span class="font-medium">${ex.name}</span>
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
    });
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
    div.className = 'grid grid-cols-12 gap-2 items-start animate-[fadeIn_0.3s_ease-out]';

    const restBetween = data ? (data.restBetweenSets ?? data.rest ?? 60) : 60;
    const restAfter = data ? (data.restAfterExercise ?? data.rest ?? 90) : 90;

    div.innerHTML = `
                <div class="col-span-3">
                    <input type="text" class="w-full bg-slate-50 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="动作名称" value="${data ? data.name : ''}" required name="ex_name">
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
                <div class="col-span-2">
                    <input type="number" class="w-full bg-slate-50 rounded-lg px-1 py-2 text-xs text-center focus:ring-1 focus:ring-blue-500 outline-none" placeholder="动作休(秒)" value="${restAfter}" required min="0" name="ex_rest_after">
                </div>
                <div class="col-span-1 flex justify-center pt-2">
                    <button type="button" class="text-slate-300 hover:text-red-500" onclick="this.parentElement.parentElement.remove()"><i class="fa-solid fa-minus-circle"></i></button>
                </div>
            `;
    container.appendChild(div);
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

