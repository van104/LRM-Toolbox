export interface Career {
  id: string;
  name: string;
  salary: number;
  req: {
    smarts?: number;
    looks?: number;
    health?: number;
    happiness?: number;
    fame?: number;
    wealth?: number;
  };
}

export interface Talent {
  id: string;
  name: string;
  desc: string;
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  effect: {
    looks?: number;
    smarts?: number;
    health?: number;
    happiness?: number;
    wealth?: number;
    luck?: number;
  };
  gift?: string;
}

export interface EducationLevel {
  id: string;
  name: string;
  age: number;
  maxAge: number;
  free?: boolean;
  cost?: number;
  req?: {
    smarts?: number;
  };
}

export interface House {
  id: string;
  name: string;
  type: 'rent' | 'buy';
  price: number;
  rent: number;
  desc: string;
  image: string;
}

export interface Vehicle {
  id: string;
  name: string;
  price: number;
  desc: string;
  image: string;
}

export interface Bank {
  depositRates: {
    current: number;
    fixed1: number;
    fixed3: number;
  };
  loanRate: number;
}

export interface AgeEvent {
  text: string;
  effect?: {
    health?: number;
    smarts?: number;
    happiness?: number;
    wealth?: number;
    fame?: number;
    looks?: number;
    karma?: number;
    stress?: number;
    luck?: number;
    death?: boolean;
  };
  minAge?: number;
  maxAge?: number;
   
  choices?: any[];
  log?: string;
}

export interface LifeData {
  careers: Career[];
  talents: Talent[];
  education: {
    levels: EducationLevel[];
  };
  housing: House[];
  vehicles: Vehicle[];
  bank: Bank;
  ageEvents: Record<number, AgeEvent[]>;
  deathEvents: Record<string, AgeEvent[]>;
  periods: Record<string, AgeEvent[]>;
}

export const lifeData: LifeData = {
    careers: [
        { id: 'programmer', name: '程序员', salary: 12000, req: { smarts: 60 } },
        { id: 'teacher', name: '教师', salary: 6000, req: { smarts: 40 } },
        { id: 'doctor', name: '医生', salary: 20000, req: { smarts: 80 } },
        { id: 'influencer', name: '网红', salary: 8000, req: { looks: 70 } },
        { id: 'writer', name: '作家', salary: 5000, req: { smarts: 70 } },
        { id: 'artist', name: '艺术家', salary: 4000, req: { looks: 60, smarts: 50 } },
        { id: 'lawyer', name: '律师', salary: 15000, req: { smarts: 85 } },
        { id: 'athlete', name: '运动员', salary: 10000, req: { health: 90 } },
        { id: 'actor', name: '演员', salary: 18000, req: { looks: 85 } },
        { id: 'chef', name: '厨师', salary: 7000, req: { health: 60 } },
        { id: 'waiter', name: '服务员', salary: 3500, req: {} },
        { id: 'manager', name: '经理', salary: 18000, req: { smarts: 70, fame: 20 } },
        { id: 'ceo', name: 'CEO', salary: 50000, req: { smarts: 90, fame: 50, wealth: 100000 } },
        { id: 'engineer', name: '工程师', salary: 9000, req: { smarts: 70 } },
        { id: 'police', name: '警察', salary: 6000, req: { health: 70 } },
        { id: 'nurse', name: '护士', salary: 5500, req: { smarts: 50, health: 50 } },
        { id: 'pilot', name: '飞行员', salary: 25000, req: { health: 90, smarts: 80 } },
        { id: 'scientist', name: '科学家', salary: 11000, req: { smarts: 95 } },
        { id: 'musician', name: '音乐家', salary: 5000, req: { happiness: 80, looks: 50 } },
        { id: 'architect', name: '建筑师', salary: 10000, req: { smarts: 75 } }
    ],

    
    talents: [
        { id: 't001', name: '天选之子', desc: '全属性+5，SSR级命格', rarity: 'SSR', effect: { looks: 5, smarts: 5, health: 5, happiness: 5 } },
        { id: 't002', name: '红颜薄命', desc: '颜值+8，健康-5', rarity: 'SR', effect: { looks: 8, health: -5 } },
        { id: 't003', name: '家里有矿', desc: '家境(快乐)+10，初始资金+5000', rarity: 'SR', effect: { happiness: 10, wealth: 5000 } },
        { id: 't004', name: '书呆子', desc: '智力+8，颜值-3', rarity: 'R', effect: { smarts: 8, looks: -3 } },
        { id: 't005', name: '傻人傻福', desc: '智力-5，快乐+10', rarity: 'R', effect: { smarts: -5, happiness: 10 } },
        { id: 't006', name: '运动健将', desc: '健康+8', rarity: 'R', effect: { health: 8 } },
        { id: 't007', name: '普通市民', desc: '全属性+1', rarity: 'N', effect: { looks: 1, smarts: 1, health: 1, happiness: 1 } },
        { id: 't008', name: '早产儿', desc: '健康-5，智力+2', rarity: 'N', effect: { health: -5, smarts: 2 } },
        { id: 't999', name: '赛博精神病', desc: '智力+10，健康-10', rarity: 'SR', effect: { smarts: 10, health: -10 } },
        { id: 't100', name: '锦鲤附体', desc: '初始运气爆棚，容易中彩票', rarity: 'SSR', effect: { happiness: 5, luck: 10 } },
        { id: 't101', name: '独行侠', desc: '快乐-5，智力+5', rarity: 'R', effect: { happiness: -5, smarts: 5 } },
        { id: 't102', name: '偷电瓶养你', desc: '颜值-2，初始获得电动车一辆', rarity: 'SR', effect: { looks: -2 }, gift: 'scooter' }
    ],

    education: {
        levels: [
            { id: 'primary', name: '小学', age: 6, maxAge: 12, free: true },
            { id: 'middle', name: '初中', age: 13, maxAge: 15, free: true },
            { id: 'high', name: '高中', age: 16, maxAge: 18, free: false, cost: 2000 },
            { id: 'university', name: '大学本科', age: 19, maxAge: 22, cost: 8000, req: { smarts: 50 } },
            { id: 'master', name: '硕士研究生', age: 23, maxAge: 25, cost: 12000, req: { smarts: 70 } },
            { id: 'phd', name: '博士研究生', age: 26, maxAge: 29, cost: 15000, req: { smarts: 85 } }
        ]
    },

    housing: [
        { id: 'rental_room', name: '合租单间', type: 'rent', price: 0, rent: 800, desc: '仅仅是一个睡觉的地方。', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=60' },
        { id: 'rental_apt', name: '整租公寓', type: 'rent', price: 0, rent: 2500, desc: '拥有自己的独立空间。', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=60' },
        { id: 'condo', name: '市区商品房', type: 'buy', price: 1500000, rent: 0, desc: '交通便利，升值空间大。', image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=500&q=60' },
        { id: 'villa', name: '郊区别墅', type: 'buy', price: 5000000, rent: 0, desc: '带花园的梦想之家。', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=60' },
        { id: 'mansion', name: '豪华庄园', type: 'buy', price: 50000000, rent: 0, desc: '顶级富豪的象征，配备私人管家。', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=500&q=60' }
    ],

    vehicles: [
        { id: 'scooter', name: '电动车', price: 3000, desc: '不怕堵车，外卖小哥同款。', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=60' },
        { id: 'economy_car', name: '经济型轿车', price: 100000, desc: '省油耐用，家庭首选。', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=60' },
        { id: 'luxury_car', name: '豪华轿车', price: 800000, desc: '舒适与面子的代名词。', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=500&q=60' },
        { id: 'sports_car', name: '超级跑车', price: 5000000, desc: '3秒破百，回头率200%。', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=500&q=60' },
        { id: 'yacht', name: '私人游艇', price: 20000000, desc: '征服海洋的座驾。', image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=500&q=60' }
    ],

    bank: {
        depositRates: {
            current: 0.003, 
            fixed1: 0.02,   
            fixed3: 0.035   
        },
        loanRate: 0.06 
    },

    
    ageEvents: {
        0: [
            { text: '你出生了，哭声响亮，护士阿姨夸你肺活量大。', effect: { health: 5 } },
            { text: '你出生时外面下着大雪，父母为你取了一个富有诗意的名字。', effect: { smarts: 2 } },
            { text: '你是一个早产儿，在保温箱里待了一周。', effect: { health: -5 } },
            { text: '你出生在一个阳光明媚的早晨，全家人都为你感到高兴。', effect: { happiness: 10 } }
        ],
        1: [
            { text: '你学会了爬行，满屋子乱爬，把家里的花瓶打碎了。', effect: { smarts: 2, happiness: -2 } },
            { text: '你第一次开口叫了妈妈，妈妈感动得流下了眼泪。', effect: { happiness: 10 } },
            { text: '抓周仪式上，你一把抓住了鼠标，看来以后是个极客。', effect: { smarts: 5 } },
            { text: '抓周仪式上，你抓了一张百元大钞，全场哄堂大笑。', effect: { wealth: 100 } }
        ],
        2: [
            { text: '你开始蹒跚学步，走两步就摔个屁股墩，但你坚强地没哭。', effect: { health: 1, smarts: 1 } },
            { text: '你模仿爸爸打电话的样子，拿着香蕉喂喂喂，逗乐了全家。', effect: { happiness: 5 } },
            { text: '因为抢玩具，你狠狠地咬了邻居小孩一口。', effect: { fame: -2, health: -1 } }
        ],
        3: [
            { text: '你上幼儿园小班了，因为不想离开妈妈，你在门口大哭了一场。', effect: { happiness: -5 } },
            { text: '你自己学会了穿鞋子，虽然左右脚穿反了，但很自豪。', effect: { smarts: 2 } },
            { text: '你在幼儿园午睡时尿床了，觉得非常丢脸。', effect: { happiness: -10, fame: -1 } }
        ],
        4: [
            { text: '你迷上了看奥特曼，每天都模仿发射光波。', effect: { health: 2, happiness: 5 } },
            { text: '你在家里的白墙上画了一幅“抽象派大作”，被混合双打。', effect: { happiness: -10, smarts: 1 } },
            { text: '你学会了用筷子，虽然还不太熟练。', effect: { smarts: 2 } }
        ],
        5: [
            { text: '你开始换牙了，说话漏风，不敢张嘴大笑。', effect: { looks: -2 } },
            { text: '你帮妈妈扫地，获得了一朵小红花奖励。', effect: { karma: 5, happiness: 2 } },
            { text: '你在公园里交到了第一个好朋友。', effect: { happiness: 8 } }
        ],
        6: [
            { text: '你上小学一年级了，背上了崭新的书包。', effect: { smarts: 2 } },
            { text: '你因为上课讲话被老师罚站。', effect: { happiness: -5, fame: -2 } },
            { text: '第一次考试，你拿了双百，父母奖励了你一顿大餐。', effect: { smarts: 5, happiness: 10 } }
        ],
        7: [
            { text: '你加入了少先队，光荣地戴上了红领巾。', effect: { fame: 2, happiness: 5 } },
            { text: '你开始学习才艺，每周末都要去上兴趣班。', effect: { smarts: 2, happiness: -2 } }
        ],
        8: [
            { text: '爸爸教你骑自行车，你摔了好几次，膝盖都磕破了。', effect: { health: -2, smarts: 2 } },
            { text: '你迷上了乐高积木，能一个人玩一下午。', effect: { smarts: 3 } }
        ],
        9: [
            { text: '为了抢电视遥控器，你和家人发生了一场“大战”。', effect: { happiness: -2 } },
            { text: '学校组织秋游，你兴奋得一晚上没睡好。', effect: { happiness: 5 } }
        ],
        10: [
            { text: '十岁生日，父母为你举办了一个盛大的生日派对，邀请了很多同学。', effect: { happiness: 10, fame: 5 } },
            { text: '你开始有了自己的零花钱，虽然不多，但感觉自己是个小富翁。', effect: { wealth: 50 } }
        ],
        11: [
            { text: '你正在长身体，饭量大增，一顿能吃两碗饭。', effect: { health: 2 } },
            { text: '无论是哪门课的老师，似乎都比以前严厉了。', effect: { stress: 2 } }
        ],
        12: [
            { text: '你小学毕业了，即将步入初中。', effect: { smarts: 2 } },
            { text: '你的身高突飞猛进，裤子都短了一截。', effect: { health: 5, looks: 2 } }
        ],
        13: [
            { text: '初一的新环境让你既兴奋又紧张。', effect: { stress: 2 } },
            { text: '你开始在意自己的穿着打扮，不想穿校服。', effect: { looks: 2 } }
        ],
        14: [
            { text: '初二的功课变难了，物理成了你的噩梦。', effect: { smarts: -1, stress: 5 } },
            { text: '你在日记本里写下了不愿告诉父母的秘密。', effect: { happiness: 2 } }
        ],
        15: [
            { text: '你进入了叛逆期，觉得父母什么都不懂。', effect: { happiness: -5 } },
            { text: '你偷偷喜欢上了隔壁班的同学，每天故意路过TA的教室。', effect: { happiness: 5 } },
            { text: '中考就在眼前，你感到了前所未有的压力。', effect: { stress: 10, smarts: 5 } }
        ],
        16: [
            { text: '升入高中，可以住校了，你终于摆脱了父母的唠叨。', effect: { happiness: 5 } },
            { text: '军训把你晒成了煤球，回来后大家差点没认出你。', effect: { looks: -5, health: 2 } }
        ],
        17: [
            { text: '高二的分班考试，你和最好的朋友分到了不同班级，有些伤感。', effect: { happiness: -5 } },
            { text: '为了备战高考，你开始挑灯夜战，黑眼圈越来越重。', effect: { health: -2, smarts: 5 } }
        ],
        18: [
            { text: '你成年了！这是人生的重要里程碑。', effect: { happiness: 10 } },
            {
                text: '高考结束了，你面临人生的第一次重大选择：',
                choices: [
                    { text: '去大城市读大学', effect: { smarts: 10, wealth: -5000, stress: 5 }, log: '你来到了繁华的都市，眼界大开。' },
                    { text: '留在本地读大学', effect: { happiness: 5, wealth: -2000 }, log: '你选择了安逸，离家近确实很方便。' },
                    { text: '直接工作', effect: { wealth: 2000, smarts: -5 }, log: '你早早步入社会，体验了赚钱的不易。' }
                ]
            }
        ],
        19: [
            { text: '大学生活比你想象的要自由，你加入了感兴趣的社团。', effect: { happiness: 5, fame: 2 } },
            { text: '第一次离家这么久，中秋节的时候你格外想家。', effect: { happiness: -5 } }
        ],
        20: [
            { text: '大二课程开始繁重，你为了不挂科在图书馆熬夜复习。', effect: { smarts: 2, health: -1 } },
            { text: '你在校园里谈了一场恋爱，空气都是甜的。', effect: { happiness: 10 } }
        ],
        21: [
            { text: '大三了，身边的同学都在准备考研或实习，你开始感到迷茫。', effect: { stress: 5 } },
            { text: '你尝试着做兼职，赚到了人生的第一桶金。', effect: { wealth: 500 } }
        ],
        22: [
            { text: '大学毕业了，你正式告别了学生时代。', effect: { smarts: 5 } },
            {
                text: '在这个岔路口，你决定：',
                choices: [
                    { text: '考研深造', effect: { smarts: 10, wealth: -5000 }, log: '你继续在学术的海洋里遨游。' },
                    { text: '疯狂投简历', effect: { wealth: 3000, health: -2 }, log: '你成为了一名社畜，开始了996的生活。' },
                    { text: '间隔年环游中国', effect: { happiness: 20, wealth: -10000 }, log: '你花光了积蓄，但收获了无数在路上的故事。' }
                ]
            }
        ],
        23: [
            { text: '刚入职场，你是个新人，每天即使没事做也不敢早退。', effect: { happiness: -2 } },
            { text: '第一次发工资，你给父母买了礼物。', effect: { wealth: -500, karma: 5 } }
        ],
        24: [
            { text: '本命年，你穿上了红袜子。', effect: { luck: 5 } },
            { text: '被家里安排相亲，场面一度十分尴尬。', effect: { happiness: -5 } }
        ],
        25: [
            { text: '工作几年了，你开始考虑跳槽涨薪。', effect: { wealth: 2000 } },
            { text: '七大姑八大姨开启了催婚模式。', effect: { stress: 10 } }
        ],
        26: [
            { text: '你身边的朋友陆陆续续都结婚了，你收到了很多红色炸弹。', effect: { wealth: -2000 } },
            { text: '你开始注重理财，不再月光。', effect: { smarts: 2 } }
        ],
        27: [
            { text: '你在工作中开始独当一面，领导对你很赏识。', effect: { fame: 2, wealth: 1000 } }
        ],
        28: [
            { text: '你感觉身体不如以前了，熬夜后很难恢复。', effect: { health: -2 } },
            { text: '你参加了高中同学聚会，大家变化都很大。', effect: { happiness: 2 } }
        ],
        29: [
            { text: '二十九岁，站在三十岁的门槛上，你有些焦虑。', effect: { stress: 5 } }
        ],
        30: [
            { text: '三十而立，你开始对未来感到一丝焦虑。', effect: { happiness: -5 } },
            { text: '参加同学聚会，发现以前的学渣居然当了大老板。', effect: { happiness: -10 } },
            { text: '你的发际线似乎有点后移了。', effect: { looks: -5 } }
        ],
        35: [
            { text: '职场危机感袭来，你担心自己被优化。', effect: { stress: 10 } },
            { text: '孩子上幼儿园了，接送成了一个大问题。', effect: { happiness: -2 } }
        ],
        40: [
            { text: '四十不惑，你成为了家里的顶梁柱。', effect: { smarts: 5 } },
            { text: '你开始关注养生，保温杯里泡起了枸杞。', effect: { health: 5 } }
        ],
        45: [
            { text: '父母年纪大了，身体开始出现各种毛病，你经常要跑医院。', effect: { happiness: -5, wealth: -2000 } },
            { text: '你作为公司元老，受到了新人的尊敬。', effect: { fame: 5 } }
        ],
        50: [
            { text: '知天命之年，你对很多事情都看开了。', effect: { happiness: 5 } },
            { text: '你的孩子都长大了，家里突然显得有些冷清。', effect: { happiness: -2 } }
        ],
        55: [
            { text: '你开始规划退休后的生活，想去环游世界。', effect: { happiness: 5 } },
            { text: '你的记忆力开始下降，经常忘记拿钥匙。', effect: { smarts: -2 } }
        ],
        60: [
            { text: '耳顺之年，你正式退休了（如果还没退的话）。', effect: { happiness: 10 } },
            { text: '你办理了退休手续，每个月可以领养老金了。', effect: { wealth: 2000 } }
        ],
        70: [
            { text: '古稀之年，你依然精神矍铄，每天坚持晨练。', effect: { health: 2 } },
            { text: '孙子孙女来看你，那是你最快乐的时光。', effect: { happiness: 10 } }
        ],
        75: [
            { text: '你的牙齿开始松动，吃东西变得小心翼翼。', effect: { health: -2 } },
            { text: '你金婚了，和老伴拍了一组纪念照。', effect: { happiness: 15 } }
        ],
        80: [
            { text: '八十岁大寿，家里四世同堂，热热闹闹。', effect: { happiness: 20, fame: 5 } },
            { text: '你回顾一生，充满了酸甜苦辣，但你并不后悔。', effect: { happiness: 5 } }
        ]
    },

    
    deathEvents: {
        child: [
            { text: '你在河边玩耍时不慎落水，抢救无效...', effect: { death: true } },
            { text: '你误食了有毒的野生菌，中毒身亡。', effect: { death: true } },
            { text: '一场突如其来的高烧夺走了你幼小的生命。', effect: { death: true } }
        ],
        teen: [
            { text: '你在过马路时遭遇了严重车祸，抢救无效...', effect: { death: true } },
            { text: '你在海边游泳时遭遇了溺水意外。', effect: { death: true } },
            { text: '你在极限运动中发生了意外。', effect: { death: true } }
        ],
        adult: [
            { text: '连续通宵加班后，突发心肌梗塞倒在了工位上。', effect: { death: true } },
            { text: '你在高速公路上遭遇连环车祸，不幸遇难。', effect: { death: true } },
            { text: '你被确诊为癌症晚期，医治无效离世。', effect: { death: true } },
            { text: '一场飞机失事带走了你的生命。', effect: { death: true } }
        ],
        elder: [
            { text: '你在浴室不慎滑倒，头部受到重创。', effect: { death: true } },
            { text: '突发脑溢血，你在睡梦中离世。', effect: { death: true } },
            { text: '心力衰竭带走了你的生命。', effect: { death: true } },
            { text: '老伴去世后，你郁郁寡欢，不久也随之而去。', effect: { death: true } }
        ]
    },

    
    periods: {
        child: [ 
            { text: '你在公园玩泥巴，弄得一身脏兮兮的，但很开心。', effect: { happiness: 3, health: -1, looks: -1 }, minAge: 2 },
            { text: '换季了，你不小心感冒了，鼻涕流个不停。', effect: { health: -5 }, minAge: 0 },
            { text: '因为挑食不吃青椒，你在饭桌上被父母教育了一顿。', effect: { health: -1, happiness: -2 }, minAge: 3 },
            { text: '你在路边蹲了半小时，观察蚂蚁搬家。', effect: { smarts: 2 }, minAge: 4 },
            { text: '因为不想午睡，你大哭大闹，吵醒了全家人。', effect: { happiness: -2 }, minAge: 1, maxAge: 5 },
            { text: '你在期末考试中考了满分，父母奖励了你想要的玩具。', effect: { smarts: 2, happiness: 5, wealth: 100 }, minAge: 6 },
            { text: '你在学校才艺表演上唱了一首歌，虽然跑调了但勇气可嘉。', effect: { fame: 2, happiness: 2 }, minAge: 6 },
            { text: '你偷偷把家里的闹钟拆了，结果装不回去了。', effect: { smarts: 3, wealth: -50 }, minAge: 5 },
            { text: '被隔壁家的小胖欺负了，你哭着跑回了家。', effect: { happiness: -5, fame: -1 }, minAge: 4 },
            { text: '你在小区里捡到了一只流浪小狗，央求父母收养它。', effect: { happiness: 10, wealth: -200 }, minAge: 5 },
            { text: '你被选入学校合唱团，开始每天练习唱歌。', effect: { fame: 2, happiness: 3 }, minAge: 7 },
            {
                text: '放学路上，有高年级学生向你索要零花钱，你决定？',
                choices: [
                    { text: '严词拒绝', effect: { fame: 5, health: -5 }, log: '你勇敢地说了不，虽然挨了一拳，但他们被你的气势吓跑了。' },
                    { text: '乖乖给钱', effect: { wealth: -50, happiness: -5 }, log: '你破财免灾，但心里觉得很窝囊。' },
                    { text: '告诉家长', effect: { smarts: 2, fame: -2 }, log: '家长到学校解决了问题，但你被嘲笑是由于没断奶。' }
                ],
                minAge: 7
            }
        ],
        teen: [ 
            { text: '最近脸上冒出了很多青春痘，让你很烦恼。', effect: { looks: -5 }, minAge: 13 },
            { text: '你开始偷偷写日记，记录少年的心事。', effect: { smarts: 2 }, minAge: 13 },
            { text: '为了玩游戏，你第一次去网吧通宵。', effect: { health: -5, smarts: -2 }, minAge: 14 },
            { text: '你在校运会长跑比赛中获得了第一名，全班为你欢呼。', effect: { health: 5, fame: 10 }, minAge: 13 },
            { text: '因为发型问题，你被教导主任在校门口拦住了。', effect: { happiness: -5 }, minAge: 13 },
            { text: '你收到了一封情书，心里小鹿乱撞。', effect: { happiness: 10, fame: 2 }, minAge: 14 },
            { text: '你第一次尝试喝酒，结果一杯就倒了。', effect: { health: -2, happiness: 2 }, minAge: 16 },
            { text: '你被选为交换生，有机会去国外游学一周。', effect: { smarts: 5, wealth: -5000 }, minAge: 15 },
            {
                text: '好朋友邀请你周末去KTV唱歌，但是你作业还没写完。',
                choices: [
                    { text: '去玩个痛快', effect: { happiness: 10, smarts: -5 }, log: '你玩得很开心，周一补作业补到手断。' },
                    { text: '在家写作业', effect: { smarts: 5, happiness: -5 }, log: '你是个乖孩子，但错过了一次聚会。' }
                ],
                minAge: 13
            },
            { text: '你迷上了一本小说，上课都在偷偷看。', effect: { smarts: -2, happiness: 5 }, minAge: 13 }
        ],
        adult: [ 
            { text: '无论多忙，你坚持每个月读一本书。', effect: { smarts: 3 } },
            { text: '为了减肥，你办了张健身卡，虽然去的次数屈指可数。', effect: { wealth: -2000, health: 1 } },
            { text: '运气爆棚！你买彩票中了三等奖。', effect: { wealth: 5000, happiness: 20 } },
            { text: '在地铁上给老人让座，被旁人称赞。', effect: { fame: 2, karma: 5 } },
            { text: '长期熬夜加班，你的体检报告上出现了很多箭头。', effect: { health: -10 } },
            { text: '周末去爬山，呼吸了新鲜空气，心情大好。', effect: { health: 3, happiness: 5 } },
            { text: '走路玩手机，一脚踩进了水坑，鞋子全湿了。', effect: { happiness: -5, looks: -1 } },
            { text: '你做了一顿丰盛的晚餐，邀请朋友来家里聚餐。', effect: { happiness: 5, wealth: -500 } },
            { text: '你投资的股票跌停了，心在滴血。', effect: { wealth: -10000, happiness: -10 } },
            { text: '你收养了一只流浪猫，它很粘人。', effect: { happiness: 10, wealth: -1000 } },
            { text: '你在公司遭遇了职场霸凌，心情非常低落。', effect: { happiness: -20 } },
            { text: '你拿出积蓄付了首付，终于在这个城市有了自己的小窝。', effect: { wealth: -500000, happiness: 30 } },
            {
                text: '公司有个去海外分部工作的机会，这意味要背井离乡。',
                choices: [
                    { text: '接受挑战', effect: { wealth: 50000, happiness: -5 }, log: '薪水翻倍，但你开始想念家乡的红烧肉。' },
                    { text: '婉言拒绝', effect: { happiness: 5, fame: -5 }, log: '你选择了陪伴家人，放弃了高薪。' }
                ]
            },
            {
                text: '前任突然联系你，想约你出来喝咖啡。',
                choices: [
                    { text: '果断拉黑', effect: { happiness: 5 }, log: '过去就让它过去吧，你觉得自己很酷。' },
                    { text: '赴约叙旧', effect: { happiness: -5, karma: -5 }, log: '场面一度很尴尬，你后悔来了。' }
                ]
            }
        ],
        elder: [ 
            { text: '你加入了小区的广场舞队，成为了领舞。', effect: { health: 5, fame: 5 } },
            { text: '感觉身体不适，去医院做了一次全面体检。', effect: { wealth: -2000, health: 2 } },
            { text: '给孙子孙女发了大红包。', effect: { wealth: -2000, happiness: 10 } },
            { text: '你开始学习书法，修身养性。', effect: { smarts: 3, happiness: 3 } },
            { text: '以前的老同事聚会，大家都在比谁的孙子可爱。', effect: { happiness: 5 } },
            { text: '你遭遇了电信诈骗，幸好被你识破了。', effect: { smarts: 2, fame: 2 } },
            { text: '你遭遇了电信诈骗，损失了一笔钱。', effect: { wealth: -5000, happiness: -10 } },
            { text: '子女们周末都回来看望你，家里热热闹闹的。', effect: { happiness: 15 } },
            { text: '你报名参加了老年大学的摄影班。', effect: { smarts: 3, happiness: 5 } },
            {
                text: '社区组织老年旅游团，去长城做好汉。',
                choices: [
                    { text: '报名参加', effect: { health: 2, wealth: -3000, happiness: 10 }, log: '虽然腿脚有点累，但风景真好。' },
                    { text: '在家休息', effect: { health: 1 }, log: '你在家里阳台晒太阳，也很惬意。' }
                ]
            }
        ]
    }
};

export interface GameState {
  age: number;
  health: number;
  happiness: number;
  smarts: number;
  looks: number;
  wealth: number;
  fame: number;
  isAlive: boolean;
   
  log: any[];
  job: Career | null;
  savings: number;
  houses: string[];
  cars: string[];
  degree: string;
   
  inventory: any[];
}

export const initialStats: GameState = {
    age: 0,
    health: 0,
    happiness: 0,
    smarts: 0,
    looks: 0,
    wealth: 0,
    fame: 0,
    isAlive: true,
    log: [],
    job: null,
    
    savings: 0,
    houses: [],
    cars: [],
    degree: 'none',
    inventory: []
};
