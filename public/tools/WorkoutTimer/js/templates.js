// 计划模板数据
const PlanTemplates = {
  getAll() {
    return [
      {
        id: 'tpl_tabata',
        name: 'Tabata 20/10',
        description: '高强度间歇，20秒冲刺 + 10秒休息，共8组',
        plan: {
          title: 'Tabata 间歇（模板）',
          days: ['周二', '周四'],
          exercises: [
            {
              name: '波比跳冲刺',
              sets: 8,
              reps: '20秒',
              restBetweenSets: 10,
              restAfterExercise: 120
            }
          ]
        }
      },
      {
        id: 'tpl_hiit',
        name: 'HIIT 30/30',
        description: '中高强度循环，30秒训练 + 30秒恢复，共12组',
        plan: {
          title: 'HIIT 循环（模板）',
          days: ['周三', '周六'],
          exercises: [
            {
              name: '高抬腿',
              sets: 4,
              reps: '30秒',
              restBetweenSets: 30,
              restAfterExercise: 60
            },
            {
              name: '开合跳',
              sets: 4,
              reps: '30秒',
              restBetweenSets: 30,
              restAfterExercise: 60
            },
            {
              name: '登山跑',
              sets: 4,
              reps: '30秒',
              restBetweenSets: 30,
              restAfterExercise: 90
            }
          ]
        }
      },
      {
        id: 'tpl_strength',
        name: '力量训练',
        description: '上肢 + 下肢 + 核心的基础分组方案',
        plan: {
          title: '力量训练（模板）',
          days: ['周一', '周五'],
          exercises: [
            {
              name: '深蹲',
              sets: 4,
              reps: '10次',
              restBetweenSets: 75,
              restAfterExercise: 90
            },
            {
              name: '俯卧撑',
              sets: 4,
              reps: '12次',
              restBetweenSets: 60,
              restAfterExercise: 90
            },
            {
              name: '平板支撑',
              sets: 3,
              reps: '45秒',
              restBetweenSets: 45,
              restAfterExercise: 90
            }
          ]
        }
      }
    ];
  },

  getDefaultPlans() {
    return [
      {
        id: 'p1',
        title: '上肢力量 (示例)',
        days: ['周一'],
        exercises: [
          {
            name: '俯卧撑',
            sets: 4,
            reps: '12次',
            restBetweenSets: 60,
            restAfterExercise: 90
          },
          {
            name: '哑铃弯举',
            sets: 3,
            reps: '10次',
            restBetweenSets: 60,
            restAfterExercise: 90
          }
        ]
      },
      {
        id: 'p2',
        title: '核心燃脂 (示例)',
        days: ['周三', '周五'],
        exercises: [
          {
            name: '平板支撑',
            sets: 3,
            reps: '60秒',
            restBetweenSets: 60,
            restAfterExercise: 90
          },
          { name: '卷腹', sets: 4, reps: '20次', restBetweenSets: 60, restAfterExercise: 90 },
          {
            name: '波比跳',
            sets: 3,
            reps: '15次',
            restBetweenSets: 60,
            restAfterExercise: 90
          }
        ]
      }
    ];
  }
};

window.PlanTemplates = PlanTemplates;

