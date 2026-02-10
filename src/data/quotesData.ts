export interface QuoteCategory {
  id: string;
  name: string;
}

export const quoteCategories: QuoteCategory[] = [
  { id: 'poetry', name: '诗词名言' },
  { id: 'movie', name: '电影对白' },
  { id: 'rainbow', name: '彩虹屁' },
  { id: 'coder', name: '程序员语录' },
  { id: 'sad', name: '伤感语录' }
];

export interface Quote {
  category: string;
  content: string;
  author: string;
}

export const quotes: Quote[] = [
  { category: 'poetry', content: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德' },
  { category: 'poetry', content: '大漠孤烟直，长河落日圆。', author: '王维' },
  { category: 'poetry', content: '我见青山多妩媚，料青山见我应如是。', author: '辛弃疾' },
  { category: 'poetry', content: '愿你历尽千帆，归来仍是少年。', author: '网络' },
  { category: 'poetry', content: '星垂平野阔，月涌大江流。', author: '杜甫' },
  { category: 'poetry', content: '落霞与孤鹜齐飞，秋水共长天一色。', author: '王勃' },

  {
    category: 'movie',
    content: '生活就像一盒巧克力，你永远不知道下一块是什么味道。',
    author: '《阿甘正传》'
  },
  { category: 'movie', content: '你保护世界，我保护你。', author: '《少年的你》' },
  {
    category: 'movie',
    content: '有些鸟儿是永远关不住的，因为它们的每一片羽翼上都沾满了自由的光辉。',
    author: '《肖申克的救赎》'
  },
  {
    category: 'movie',
    content: '在这个世界上，只有两样东西是别人抢不走的：一是藏在心里的梦想，二是读进大脑的知识。',
    author: '《三傻大闹宝莱坞》'
  },
  {
    category: 'movie',
    content: '如果我们不能建筑建筑，我们就去建筑梦想。',
    author: '《海上钢琴师》'
  },
  {
    category: 'movie',
    content: '原来这个世界上还有一种鸟是没有脚的，它一生只能在天上飞。',
    author: '《阿飞正传》'
  },
  {
    category: 'movie',
    content: '曾经有一份真挚的感情摆在我的面前，我没有珍惜，等我失去的时候才追悔莫及。',
    author: '《大话西游》'
  },
  { category: 'movie', content: '做人如果没有梦想，跟咸鱼有什么区别？', author: '《少林足球》' },
  { category: 'movie', content: '世间所有的相遇，都是久别重逢。', author: '《一代宗师》' },
  {
    category: 'movie',
    content: '说好是一辈子，差一年，差一个月，差一个时辰，都不算一辈子！',
    author: '《霸王别姬》'
  },
  {
    category: 'movie',
    content: '你不愿意种花，你说，我不愿看见它一点点凋落。是的，为了避免结束，你避免了一切开始。',
    author: '《人间失格》'
  },
  { category: 'movie', content: '你不懂得恐惧，就谈不上勇敢。', author: '《疯狂原始人》' },
  { category: 'movie', content: '真相，有时候并不是最重要的。', author: '《致命 ID》' },
  {
    category: 'movie',
    content: '只要我们不放弃，我们终会到达彼岸。',
    author: '《少年派的奇幻咆哮》'
  },
  {
    category: 'movie',
    content: '既然注定要分开，那么天亮之前，让我们再好好爱一次。',
    author: '《情书》'
  },
  { category: 'movie', content: '有些错，一旦错过，就是一辈子。', author: '《情书》' },
  {
    category: 'movie',
    content: '不要温顺地走进那个良夜，老年人在日暮时分应当燃烧并咆哮。',
    author: '《星际穿越》'
  },
  { category: 'movie', content: '只有勇敢的人，才配拥有真爱。', author: '《泰坦尼克号》' },
  { category: 'movie', content: '人生路，美梦似路长。', author: '《倩女幽魂》' },
  { category: 'movie', content: '生活不是电影，生活比电影苦多了。', author: '《天堂电影院》' },
  { category: 'movie', content: '在这个世界上，总有一个人在等你。', author: '《半生缘》' },
  {
    category: 'movie',
    content: '你要相信，这个世界上总有一个人会一直守护着你。',
    author: '《龙猫》'
  },
  { category: 'movie', content: '每一个阶段，都有它存在的意义。', author: '《少年时代》' },
  { category: 'movie', content: '只要我们努力，我们终会获得成功。', author: '《当幸福来敲门》' },
  { category: 'movie', content: '星星之火，可以燎原。', author: '《星星之火》' },
  {
    category: 'movie',
    content: '人生最精彩的不是完成梦想，而是完成梦想的过程。',
    author: '《燃情岁月》'
  },
  {
    category: 'movie',
    content: '希望是美好的，也许是人间至善，而美好的事物永不消逝。',
    author: '《肖申克的救赎》'
  },
  { category: 'movie', content: '人生没有预演，每一天都是直播。', author: '《楚门的世界》' },
  { category: 'movie', content: '只要我们坚持到底，我们就一定能赢。', author: '《绝杀慕尼黑》' },
  {
    category: 'movie',
    content: '每一个不曾起舞的日子，都是对生命的辜负。',
    author: '《尼采的眼泪》'
  },
  { category: 'movie', content: '黎耀辉，不如我们从头来过。', author: '《春光乍泄》' },
  { category: 'movie', content: '人有悲欢离合，月有阴晴圆缺。', author: '《东邪西毒》' },
  { category: 'movie', content: '哪怕是再微小的光，也能照亮黑暗。', author: '《借物少女艾莉缇》' },
  {
    category: 'movie',
    content: '有时候，最平凡的人也能成就最伟大的事业。',
    author: '《模仿游戏》'
  },
  { category: 'movie', content: '每一个灵魂，都有属于自己的节律。', author: '《心灵奇旅》' },
  { category: 'movie', content: '只要我们心怀爱意，世界就不会崩塌。', author: '《云图》' },
  { category: 'movie', content: '记忆是会说谎的，但心不会。', author: '《记忆碎片》' },
  { category: 'movie', content: '哪怕前路漫漫，也要砥砺前行。', author: '《哪吒之魔童降世》' },
  {
    category: 'movie',
    content:
      '我等了三年，就是要等一个机会，我要争一口气，不是想证明我了不起；我是要告诉人家，我失去的东西我一定要拿回来！',
    author: '《英雄本色》'
  },
  {
    category: 'movie',
    content: '如果，我多一张船票，你会不会跟我一起走？',
    author: '《花样年华》'
  },
  {
    category: 'movie',
    content: '我甚至连他的一张照片都没有。他只活在我的记忆里。',
    author: '《泰坦尼克号》'
  },
  { category: 'movie', content: '只有勇敢面对，就没有过不去的坎。', author: '《勇敢的心》' },
  {
    category: 'movie',
    content: '当一个人无法拥有的时候，他唯一能做的，就是不要忘记。',
    author: '《东邪西毒》'
  },

  { category: 'rainbow', content: '你不仅是可爱的，你简直是可爱炸了。', author: '夸夸群' },
  { category: 'rainbow', content: '众生皆苦，唯有你是草莓味。', author: '网络' },
  { category: 'rainbow', content: '我想在你那里买一块地。买你的死心塌地。', author: '网络' },
  { category: 'rainbow', content: '你今天长得特别像我的一位亲戚——我妈的女婿。', author: '网络' },
  {
    category: 'rainbow',
    content: '你的眼睛真好看，里面有山川，有河流，有云朵，还有我。',
    author: '网络'
  },
  { category: 'rainbow', content: '你是落日弥漫的橘，天边透亮的光。', author: '网络' },
  { category: 'rainbow', content: '还没去过迪士尼，但这已经看到白雪公主了。', author: '网络' },
  {
    category: 'rainbow',
    content: '如果漂亮可以当饭吃，你已经可以让全球人吃饱了。',
    author: '网络'
  },
  { category: 'rainbow', content: '你这种人，除了好看，一无所获。', author: '网络' },
  { category: 'rainbow', content: '每次看到你的脸，我都觉得这个世界还有救。', author: '网络' },
  { category: 'rainbow', content: '你是不是带了吸铁石？不然我怎么总是被你吸引。', author: '网络' },
  { category: 'rainbow', content: '你的笑容像糖，甜而不腻，刚好进了我的心。', author: '网络' },
  { category: 'rainbow', content: '自从遇见你，我所有的词典里都在赞美。', author: '网络' },
  { category: 'rainbow', content: '今天的风是甜的，因为你刚才从这里经过。', author: '网络' },
  { category: 'rainbow', content: '你脸上的每一个毛孔，都在散发着迷人的魅力。', author: '网络' },
  { category: 'rainbow', content: '我怀疑你是偷心大盗，不然我的心怎么不见了。', author: '网络' },
  { category: 'rainbow', content: '众生皆草木，唯你是青山。', author: '网络' },
  { category: 'rainbow', content: '你是人间烟火里，最亮眼的那一抹。', author: '网络' },
  { category: 'rainbow', content: '你的存在本身，就是对这个世界的一种奖赏。', author: '网络' },
  { category: 'rainbow', content: '想要变成一缕阳光，这样每天都能吻你的脸。', author: '网络' },
  { category: 'rainbow', content: '生活很苦，但你是甜的。', author: '网络' },
  {
    category: 'rainbow',
    content: '你要是再这么看我，我可就要报警把你抓进我心里了。',
    author: '网络'
  },
  { category: 'rainbow', content: '对你的喜欢，就像是银河系一样无边无际。', author: '网络' },
  {
    category: 'rainbow',
    content: '你的气质里，藏着你读过的书，走过的路，和你的美貌。',
    author: '网络'
  },
  { category: 'rainbow', content: '哪怕是背景板，你也是最华丽的那一块。', author: '网络' },
  { category: 'rainbow', content: '你的才华和美貌，简直是这个时代的奇迹。', author: '网络' },
  { category: 'rainbow', content: '你不是人，你是坠入凡间的小仙女。', author: '网络' },
  {
    category: 'rainbow',
    content: '每次你不说话，我都觉得空气在凝固，因为大家在等你惊艳全场。',
    author: '网络'
  },
  { category: 'rainbow', content: '你不仅仅是女神，你简直是信仰。', author: '网络' },
  { category: 'rainbow', content: '我想和你虚度时光，比如用来赞美你的眼睛。', author: '网络' },
  { category: 'rainbow', content: '如果美丽是一种罪，你已经罪无可赦了。', author: '网络' },
  { category: 'rainbow', content: '看一眼你的照片，我能多跑五公里。', author: '网络' },
  {
    category: 'rainbow',
    content: '你就是正能量的化身，看到你就觉得浑身充满了干劲。',
    author: '网络'
  },
  { category: 'rainbow', content: '你的声音，是我听过最好听的旋律。', author: '网络' },
  { category: 'rainbow', content: '所有的辞藻在你面前都显得苍白无力。', author: '网络' },
  { category: 'rainbow', content: '你是我见过执行力最强、同时长得也最强的人。', author: '网络' },
  { category: 'rainbow', content: '这里没有灯，但你有光。', author: '网络' },
  { category: 'rainbow', content: '你一定是上帝亲手雕刻的艺术品。', author: '网络' },
  {
    category: 'rainbow',
    content: '就算在人潮中，你的名字也是我唯一能听清的那个词。',
    author: '网络'
  },
  { category: 'rainbow', content: '还没准备好怎么惊艳时光，你就已经先做到了。', author: '网络' },
  {
    category: 'rainbow',
    content: '每次见到你，我都想问问上帝，为什么对你这么偏爱。',
    author: '网络'
  },
  { category: 'rainbow', content: '有你在的地方，连空气都是香的。', author: '网络' },
  { category: 'rainbow', content: '你身上自带的那种自信，是我见过最迷人的风景。', author: '网络' },
  { category: 'rainbow', content: '你是月亮，也是我心里的白月光。', author: '网络' },
  {
    category: 'rainbow',
    content: '遇到你之后，我所有的桃花运都变成了这一场邂逅。',
    author: '网络'
  },
  {
    category: 'rainbow',
    content: '你不需要任何滤镜，因为你本人就是最高级别的滤镜。',
    author: '网络'
  },
  { category: 'rainbow', content: '想要把你的笑容打包，作为我的私人珍藏。', author: '网络' },
  { category: 'rainbow', content: '你不仅业务能力第一，颜值也是断层领先。', author: '网络' },
  { category: 'rainbow', content: '在你的魅力面前，所有的逻辑都失去了意义。', author: '网络' },
  {
    category: 'rainbow',
    content: '每一个和你共事的人，上辈子肯定都拯救过银河系。',
    author: '网络'
  },
  { category: 'rainbow', content: '你的温柔，是我见过最有力量的武器。', author: '网络' },
  { category: 'rainbow', content: '你这种级别的优秀，应该被写进教科书里。', author: '网络' },
  { category: 'rainbow', content: '你是晨曦，是雨露，是人间不可多得的惊喜。', author: '网络' },
  { category: 'rainbow', content: '别低头，皇冠会掉，别变老，我会心疼。', author: '网络' },
  { category: 'rainbow', content: '这个世界的可爱，有一半是属于你的。', author: '网络' },

  { category: 'coder', content: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { category: 'coder', content: '在我的机器上是好的啊！', author: '程序员经典' },
  { category: 'coder', content: '代码没写完，怎么能睡觉呢？', author: '某资深开发' },
  {
    category: 'coder',
    content: '删库跑路虽然不提倡，但有时候真的是种解脱。',
    author: '代码哲学家'
  },
  { category: 'coder', content: '程序出bug了不要慌，先重启一下试试。', author: '运维大神' },
  {
    category: 'coder',
    content: '世上只有 10 种人：懂得二进制的和不懂得二进制的。',
    author: '二进制传说'
  },
  {
    category: 'coder',
    content: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson'
  },
  { category: 'coder', content: 'Java 之于 JavaScript 就像狗之于热狗。', author: 'Jeremy Keith' },
  { category: 'coder', content: '世界上最远的距离，是我在写 Bug，你在改 Bug。', author: '网络' },
  { category: 'coder', content: '一个好的程序员在过马路时，总是向两边看。', author: 'Doug Linder' },
  { category: 'coder', content: '如果不确定该怎么办，就先写个注释吧。', author: '鲁迅没说过' },
  {
    category: 'coder',
    content: '我的代码不需要注释，因为好的代码本身就是文档。',
    author: '某自信程序员'
  },
  { category: 'coder', content: '软件交付后，唯一的文档就是源代码。', author: '架构师格言' },
  { category: 'coder', content: '简单化是长久生存的关键。', author: 'Rich Hickey' },
  { category: 'coder', content: '写代码就像写诗，只是韵律是逻辑。', author: '匿名' },
  { category: 'coder', content: 'Bug 并不是错误，它们只是意外的特性。', author: '微软风格' },
  {
    category: 'coder',
    content: '如果一个程序在第一次运行就没报错，那它一定有问题。',
    author: '程序员直觉'
  },
  { category: 'coder', content: '调试（Debugging）就像是在侦探小说中寻找真凶。', author: '网络' },
  {
    category: 'coder',
    content: '只有当你意识到代码是写给人看而非虚拟机看的时候，你才算入门了。',
    author: '资深开发'
  },
  { category: 'coder', content: '程序员的快乐，就是看到满屏绿色的测试通过。', author: 'TDD 信徒' },
  { category: 'coder', content: '这个需求很简单，怎么还没做完？', author: '产品经理' },
  { category: 'coder', content: 'Ctrl+C 和 Ctrl+V 是我最常用的设计模式。', author: 'CV 工程师' },
  { category: 'coder', content: '只要逻辑不出错，世界就在我手中。', author: '全栈工程师' },
  { category: 'coder', content: '过早的优化是万恶之源。', author: 'Donald Knuth' },
  { category: 'coder', content: '代码是写给未来的自己看的。', author: '网络' },
  {
    category: 'coder',
    content: '如果所有的程序员由于某种原因突然罢工，世界将会停止运转。',
    author: '事实'
  },
  {
    category: 'coder',
    content: '为了理解什么是递归，你必须首先理解什么是递归。',
    author: '递归原理'
  },
  {
    category: 'coder',
    content: '任何功能，只要你努力尝试，都可以用一行代码写完（虽然没人看得懂）。',
    author: 'Perl 玩家'
  },
  { category: 'coder', content: '比起重写代码，我更倾向于直接重写人生。', author: '厌世开发者' },
  { category: 'coder', content: '昨晚做梦，梦里我也在写 Bug。', author: '职业病' },
  { category: 'coder', content: '我不是在修 Bug，我是在优化用户体验。', author: '辩论达人' },
  { category: 'coder', content: 'Git Commit 时写「fixed」是我的底线。', author: '匿名' },
  {
    category: 'coder',
    content: '世界上有两种程序员：一种是觉得 C++ 太难的，另一种是还没发现 C++ 有多难的。',
    author: '程序员幽默'
  },
  { category: 'coder', content: 'PHP 是世界上最好的语言。', author: '传世经典' },
  {
    category: 'coder',
    content: '没有什么问题是重启解决不了的，如果有，就再重启一次。',
    author: '万能法则'
  },
  {
    category: 'coder',
    content: '代码评审（Code Review）不是为了找茬，是为了共同进步（才怪）。',
    author: '真实独白'
  },
  {
    category: 'coder',
    content: '我的电脑很听话，因为它只做我命令它做的事，哪怕是错的。',
    author: '事实'
  },
  { category: 'coder', content: '如果架构设计得足够好，编码只是体力活。', author: '架构大牛' },
  { category: 'coder', content: '不要把所有的鸡蛋都放进一个缓存逻辑里。', author: '性能专家' },
  {
    category: 'coder',
    content: '任何你觉得会出问题的地方，由于墨菲定律，它一定会出问题。',
    author: '后端痛点'
  },
  {
    category: 'coder',
    content: '前端：我只是调调 CSS；后端：我只是查查数据库。',
    author: '相互误解'
  },
  {
    category: 'coder',
    content: '如果你发现自己写了太多重复的代码，请反思一下 DRY 原则。',
    author: '洁癖开发'
  },
  {
    category: 'coder',
    content: '程序员最讨厌的两件事：写文档，和别人不写文档。',
    author: '自相矛盾'
  },
  {
    category: 'coder',
    content: '有些 Bug 就像鬼魂，你觉得它在，可当你盯着它看时它又消失了。',
    author: '海森堡 Bug'
  },
  { category: 'coder', content: '写代码是一门手艺，而不仅仅是一份工作。', author: '匠心精神' },
  {
    category: 'coder',
    content: '所谓的技术债，就是今天为了便利而欠下的明天的麻烦。',
    author: '真相'
  },
  {
    category: 'coder',
    content: 'API 文档就像一张地图，如果地图画错了，那目的地也就没意义了。',
    author: '集成笔记'
  },
  { category: 'coder', content: '在二进制的世界里，没有灰色地带。', author: '逻辑之魂' },
  {
    category: 'coder',
    content: '每一个成功的 App 背后，都有无数个被删掉的 Bug。',
    author: '开发史'
  },
  { category: 'coder', content: '别问我是怎么实现的，问就是黑魔法。', author: '高级开发' },
  { category: 'coder', content: '代码如人，简洁即是高级。', author: '美学追求' },
  {
    category: 'coder',
    content: '如果一个程序员看起来在发呆，其实他可能正在运行数个复杂的逻辑模型。',
    author: '生存现状'
  },
  { category: 'coder', content: '头发和代码，总有一个要变乱。', author: '岁月痕迹' },
  {
    category: 'coder',
    content: '只要心中有逻辑，哪怕用记事本也能写出改变世界的代码。',
    author: '信徒'
  },
  {
    category: 'coder',
    content: '祝所有的程序员：新的一年，0 Error，0 Warning！',
    author: '终极梦想'
  },

  { category: 'sad', content: '我把所有的门都关上了，只留下一扇通往你的门。', author: '网络' },
  { category: 'sad', content: '有些故事，从一开始就注定了结局。', author: '网络' },
  { category: 'sad', content: '我怀念的不是你，而是那个曾经深爱你的自己。', author: '网络' },
  { category: 'sad', content: '我们都曾以为，只要足够努力，就能留住想要的人。', author: '网络' },
  { category: 'sad', content: '有些话，只适合说给风听。', author: '网络' },
  { category: 'sad', content: '我用尽全力，却还是没能走进你的世界。', author: '网络' },
  { category: 'sad', content: '我们之间的距离，隔着一个未曾说出口的未来。', author: '网络' },
  { category: 'sad', content: '你是我见过最美的风景，也是我最痛的遗憾。', author: '网络' },
  { category: 'sad', content: '有些爱，注定只能在回忆里开花。', author: '网络' },
  { category: 'sad', content: '我以为我可以忘记，但思念从不曾停止。', author: '网络' },
  {
    category: 'sad',
    content: '我们都曾以为自己很坚强，直到那个瞬间才发现自己有多脆弱。',
    author: '网络'
  },
  { category: 'sad', content: '有些故事，没有结局也是一种结局。', author: '网络' },
  { category: 'sad', content: '我把所有的温柔都给了你，却忘了给自己留一份。', author: '网络' },
  { category: 'sad', content: '我们之间的距离，是爱而不得的距离。', author: '网络' },
  { category: 'sad', content: '后来我们都很好，只是再也没有了后来。', author: '网络' },
  { category: 'sad', content: '最难过的不是大吵大闹，而是那种莫名其妙的疏离。', author: '网络' },
  { category: 'sad', content: '原来真的有两个人，相互思念却互不打扰。', author: '网络' },
  { category: 'sad', content: '有些遗憾，注定要放在心里一辈子。', author: '网络' },
  { category: 'sad', content: '我瞒着所有人，依然还在想念你。', author: '网络' },
  { category: 'sad', content: '时间带走了很多人，也带走了那颗说好不分开的心。', author: '网络' },
  { category: 'sad', content: '你是那束光，却从未照进我的余生。', author: '网络' },
  { category: 'sad', content: '说出口的再见，往往是真的再也不见。', author: '网络' },
  { category: 'sad', content: '我以为是终点，其实只是我一个人的独角戏。', author: '网络' },
  { category: 'sad', content: '有些人，仅仅是遇见就已经花光了所有运气。', author: '网络' },
  { category: 'sad', content: '如果可以重来，我希望从未在那个夏天遇见你。', author: '网络' },
  {
    category: 'sad',
    content: '孤独不是没人陪，而是心里那个位置空了，谁也填不满。',
    author: '网络'
  },
  { category: 'sad', content: '最廉价的，往往是那个一无所有时的深情。', author: '网络' },
  {
    category: 'sad',
    content: '我们总是在最无能为力的年纪，遇见了最想照顾一辈子的人。',
    author: '网络'
  },
  { category: 'sad', content: '再烫的水也会凉，再深的情也会忘。', author: '网络' },
  { category: 'sad', content: '原来，这个世界上真的没有感同身受这回事。', author: '网络' },
  {
    category: 'sad',
    content: '那种感觉又回来了，那种全世界只剩下我一个人的感觉。',
    author: '网络'
  },
  { category: 'sad', content: '有些伤口，时间不仅无法治愈，还会让它慢慢结成疤。', author: '网络' },
  { category: 'sad', content: '我还是会去那个路口，只是再也不会等那个人。', author: '网络' },
  {
    category: 'sad',
    content: '我们这一生，总是在不停地告别，却从未学会如何说再见。',
    author: '网络'
  },
  {
    category: 'sad',
    content: '有些人的名字，只能存进黑名单，却存不进记忆的垃圾桶。',
    author: '网络'
  },
  { category: 'sad', content: '我还是那个我，只是眼神里再也没有了曾经的光。', author: '网络' },
  { category: 'sad', content: '你走后的每一天，空气里都弥漫着你的名字。', author: '网络' },
  { category: 'sad', content: '所谓成长，就是把哭声调成静音的过程。', author: '网络' },
  { category: 'sad', content: '心碎的声音，其实很安静。', author: '网络' },
  { category: 'sad', content: '我们最后，还是活成了彼此最熟悉的陌生人。', author: '网络' },
  { category: 'sad', content: '有一种孤独，是站在人群中却想念一个人。', author: '网络' },
  { category: 'sad', content: '如果你真的想走，我绝对不会挽留。', author: '网络' },
  { category: 'sad', content: '我以为我们是特例，结果也只是那万千平庸中的一个。', author: '网络' },
  { category: 'sad', content: '别再问我好不好了，我的答案你其实并不在意。', author: '网络' },
  { category: 'sad', content: '那些说好要一直陪着我的人，最后都成了路人甲。', author: '网络' },
  { category: 'sad', content: '原来有些东西，即便你紧紧攥在手心，也会随风消散。', author: '网络' },
  { category: 'sad', content: '我没哭，我只是眼睛里进了沙子，心里进了你的名字。', author: '网络' },
  { category: 'sad', content: '有些人，换个身份，就再也没有见面的理由。', author: '网络' },
  { category: 'sad', content: '你的世界人来人往，而我只是其中一个路过的过客。', author: '网络' },
  { category: 'sad', content: '最后，我还是那个在原地打转的傻瓜。', author: '网络' }
];
