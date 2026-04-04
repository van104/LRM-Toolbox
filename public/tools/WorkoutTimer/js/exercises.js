/**
 * 动作库模块 (ExerciseLibrary)
 * 预置常见健身动作 + 肌肉群标签 + 输入自动补全
 */
const ExerciseLibrary = {
  // 分类 → 动作列表
  DB: {
    胸部: [
      { name: '平板杠铃卧推', tags: ['胸大肌', '三角肌前束', '肱三头肌'] },
      { name: '上斜杠铃卧推', tags: ['上胸', '三角肌前束'] },
      { name: '下斜杠铃卧推', tags: ['下胸', '肱三头肌'] },
      { name: '平板哑铃卧推', tags: ['胸大肌', '稳定肌群'] },
      { name: '上斜哑铃卧推', tags: ['上胸'] },
      { name: '哑铃飞鸟', tags: ['胸大肌', '拉伸'] },
      { name: '上斜哑铃飞鸟', tags: ['上胸'] },
      { name: '龙门架夹胸', tags: ['胸大肌', '内侧胸'] },
      { name: '蝴蝶机夹胸', tags: ['胸大肌'] },
      { name: '俯卧撑', tags: ['胸大肌', '核心', '自重'] },
      { name: '双杠臂屈伸', tags: ['下胸', '肱三头肌'] }
    ],
    背部: [
      { name: '引体向上', tags: ['背阔肌', '肱二头肌', '自重'] },
      { name: '高位下拉', tags: ['背阔肌', '大圆肌'] },
      { name: '宽握下拉', tags: ['背阔肌外侧'] },
      { name: '窄握下拉', tags: ['背阔肌', '肱二头肌'] },
      { name: '杠铃划船', tags: ['背阔肌', '菱形肌', '复合'] },
      { name: '哑铃划船', tags: ['背阔肌', '单侧'] },
      { name: '坐姿划船', tags: ['背阔肌', '菱形肌'] },
      { name: 'T杠划船', tags: ['中背', '菱形肌'] },
      { name: '直臂下压', tags: ['背阔肌', '孤立'] },
      { name: '山羊挺身', tags: ['竖脊肌', '下背'] },
      { name: '硬拉', tags: ['全背', '臀大肌', '复合'] }
    ],
    肩部: [
      { name: '杠铃推举', tags: ['三角肌前束', '复合'] },
      { name: '哑铃推举', tags: ['三角肌前束', '稳定'] },
      { name: '阿诺德推举', tags: ['三角肌全束'] },
      { name: '侧平举', tags: ['三角肌中束', '孤立'] },
      { name: '前平举', tags: ['三角肌前束'] },
      { name: '俯身飞鸟', tags: ['三角肌后束'] },
      { name: '反向蝴蝶机', tags: ['三角肌后束'] },
      { name: '面拉', tags: ['三角肌后束', '菱形肌'] },
      { name: '绳索侧平举', tags: ['三角肌中束'] },
      { name: '耸肩', tags: ['斜方肌'] }
    ],
    手臂: [
      { name: '杠铃弯举', tags: ['肱二头肌', '复合'] },
      { name: '哑铃弯举', tags: ['肱二头肌'] },
      { name: '锤式弯举', tags: ['肱肌', '前臂'] },
      { name: '牧师椅弯举', tags: ['肱二头肌', '孤立'] },
      { name: '集中弯举', tags: ['肱二头肌峰'] },
      { name: '绳索弯举', tags: ['肱二头肌'] },
      { name: '窄握卧推', tags: ['肱三头肌', '复合'] },
      { name: '绳索下压', tags: ['肱三头肌'] },
      { name: '头顶绳索臂屈伸', tags: ['肱三头肌长头'] },
      { name: '哑铃臂屈伸', tags: ['肱三头肌'] },
      { name: '仰卧臂屈伸', tags: ['肱三头肌'] },
      { name: '反握下压', tags: ['肱三头肌内侧'] }
    ],
    腿部: [
      { name: '杠铃深蹲', tags: ['股四头肌', '臀大肌', '复合'] },
      { name: '前蹲', tags: ['股四头肌', '核心'] },
      { name: '哈克深蹲', tags: ['股四头肌'] },
      { name: '腿举', tags: ['股四头肌', '臀大肌'] },
      { name: '保加利亚分腿蹲', tags: ['股四头肌', '臀中肌', '单侧'] },
      { name: '腿屈伸', tags: ['股四头肌', '孤立'] },
      { name: '腿弯举', tags: ['腘绳肌', '孤立'] },
      { name: '罗马尼亚硬拉', tags: ['腘绳肌', '臀大肌'] },
      { name: '直腿硬拉', tags: ['腘绳肌'] },
      { name: '坐姿腿弯举', tags: ['腘绳肌'] },
      { name: '站姿提踵', tags: ['小腿', '孤立'] },
      { name: '坐姿提踵', tags: ['比目鱼肌'] },
      { name: '箭步蹲', tags: ['股四头肌', '臀大肌'] }
    ],
    核心: [
      { name: '卷腹', tags: ['腹直肌上部', '自重'] },
      { name: '反向卷腹', tags: ['腹直肌下部'] },
      { name: '悬垂举腿', tags: ['腹直肌', '髂腰肌'] },
      { name: '平板支撑', tags: ['核心稳定', '自重'] },
      { name: '俄罗斯转体', tags: ['腹斜肌'] },
      { name: '绳索卷腹', tags: ['腹直肌'] },
      { name: '死虫式', tags: ['核心稳定'] },
      { name: '侧平板支撑', tags: ['腹斜肌', '自重'] }
    ]
  },

  // 扁平化搜索索引（初始化时生成）
  _searchIndex: null,

  getSearchIndex() {
    if (this._searchIndex) return this._searchIndex;
    this._searchIndex = [];
    for (const [group, exercises] of Object.entries(this.DB)) {
      exercises.forEach(ex => {
        this._searchIndex.push({
          name: ex.name,
          group,
          tags: ex.tags,
          searchText: `${ex.name} ${group} ${ex.tags.join(' ')}`.toLowerCase()
        });
      });
    }
    return this._searchIndex;
  },

  // 模糊搜索
  search(query, limit = 8) {
    if (!query || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const index = this.getSearchIndex();

    // 评分：名称精确匹配 > 名称开头 > 名称包含 > 标签/分组包含
    const results = index
      .map(item => {
        let score = 0;
        const nameLower = item.name.toLowerCase();
        if (nameLower === q) score = 100;
        else if (nameLower.startsWith(q)) score = 80;
        else if (nameLower.includes(q)) score = 60;
        else if (item.searchText.includes(q)) score = 40;
        // 拼音首字母匹配可以后续扩展
        return { ...item, score };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results;
  },

  // 获取某个动作的详情
  getExercise(name) {
    return this.getSearchIndex().find(e => e.name === name) || null;
  },

  // 获取所有分类
  getGroups() {
    return Object.keys(this.DB);
  },

  // 按分类获取
  getByGroup(group) {
    return this.DB[group] || [];
  }
};

window.ExerciseLibrary = ExerciseLibrary;
