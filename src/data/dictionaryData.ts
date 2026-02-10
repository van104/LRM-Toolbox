export interface DictionaryItem {
  name: string;
  pinyin: string;
  meaning: string;
  synonyms?: string[];
  antonyms?: string[];
  example: string;
}

export const dictionary: DictionaryItem[] = [
  {
    name: '胸有成竹',
    pinyin: 'xiōng yǒu chéng zhú',
    meaning: '原指画竹子要在心里有一幅竹子的形象。后比喻做事之前已经有通盘的考虑。',
    synonyms: ['心中有数', '成竹在胸'],
    antonyms: ['不知所措', '手忙脚乱'],
    example: '对于这次考试，他早已复习得胸有成竹了。'
  },
  {
    name: '半途而废',
    pinyin: 'bàn tú ér fèi',
    meaning: '指做事不能坚持到底，中途停顿，有始无终。',
    synonyms: ['浅尝辄止', '有始无终'],
    antonyms: ['持之以恒', '坚持不懈'],
    example: '学习要有恒心，绝不能半途而废。'
  },
  {
    name: '欣欣向荣',
    pinyin: 'xīn xīn xiàng róng',
    meaning: '形容草木长得茂盛。比喻事业蓬勃发展。',
    synonyms: ['昌盛', '繁荣'],
    antonyms: ['枯萎', '凋谢'],
    example: '这里的经济呈现出一派欣欣向荣的景象。'
  },
  {
    name: '卧薪尝胆',
    pinyin: 'wò xīn cháng dǎn',
    meaning: '形容人刻苦自励，发愤图强。',
    synonyms: ['奋发图强', '发愤图强'],
    antonyms: ['自甘堕落', '玩物丧志'],
    example: '只要有卧薪尝胆的精神，就没有克服不了的困难。'
  },
  {
    name: '破釜沉舟',
    pinyin: 'pò fǔ chén zhōu',
    meaning: '比喻下定决心，不顾一切地战斗到底。',
    synonyms: ['义无反顾', '背水一战'],
    antonyms: ['优柔寡断', '瞻前顾后'],
    example: '他怀着破釜沉舟的决心，决定辞职创业。'
  },
  {
    name: '精益求精',
    pinyin: 'jīng yì qiú jīng',
    meaning: '好了还求更好。',
    synonyms: ['锦上添花', '完善自我'],
    antonyms: ['粗制滥造', '得过且过'],
    example: '在技术上，我们应该要有精益求精的精神。'
  },
  {
    name: '锲而不舍',
    pinyin: 'qiè ér bù shě',
    meaning: '比喻有恒心，有毅力。',
    synonyms: ['坚持不懈', '持之以恒'],
    antonyms: ['半途而废', '有始无终'],
    example: '做任何事情都要有锲而不舍的精神。'
  },
  {
    name: '一诺千金',
    pinyin: 'yī nuò qiān jīn',
    meaning: '形容说话极有信用。',
    synonyms: ['言而有信', '金口玉言'],
    antonyms: ['言而无信', '食言而肥'],
    example: '他是个一诺千金的人，答应过的事一定会做到。'
  },
  {
    name: '源远流长',
    pinyin: 'yuán yuǎn liú cháng',
    meaning: '河流的源头很远，水流很长。比喻历史悠久。',
    synonyms: ['历史悠久', '根深叶茂'],
    antonyms: ['无本之木', '昙花一现'],
    example: '中华文化源远流长，是人类文明的瑰宝。'
  },
  {
    name: '纸上谈兵',
    pinyin: 'zhǐ shàng tán bīng',
    meaning: '比喻空谈理论，不能解决实际问题。',
    synonyms: ['坐而论道', '空中楼阁'],
    antonyms: ['脚踏实地', '实事求生'],
    example: '解决困难要靠实际行动，不能只是纸上谈兵。'
  },
  {
    name: '望梅止渴',
    pinyin: 'wàng méi zhǐ kě',
    meaning: '比喻用空想来安慰自己。',
    synonyms: ['画饼充饥'],
    antonyms: ['实事求生'],
    example: '在这个特殊时期，我们只能望梅止渴，互相鼓励。'
  },
  {
    name: '闻鸡起舞',
    pinyin: 'wén jī qǐ wǔ',
    meaning: '听到鸡叫就起来舞剑。后比喻有志报国的人及时奋起。',
    synonyms: ['发愤图强', '自强不息'],
    antonyms: ['自暴自弃', '游手好闲'],
    example: '年轻人应该有闻鸡起舞的进取精神。'
  },
  {
    name: '守株待兔',
    pinyin: 'shǒu zhū dài tù',
    meaning: '比喻死守经验，不知变通，或妄想不劳而获。',
    synonyms: ['墨守成规', '坐享其成'],
    antonyms: ['随机应变', '通权达变'],
    example: '我们不能守株待兔，要主动出击去寻找机会。'
  },
  {
    name: '画龙点睛',
    pinyin: 'huà lóng diǎn jīng',
    meaning: '比喻作文或说话时在关键地方加上精辟的话，使内容更加生动。',
    synonyms: ['锦上添花', '神来之笔'],
    antonyms: ['画蛇添足', '点石成金'],
    example: '他最后的总结真是画龙点睛。'
  },
  {
    name: '画蛇添足',
    pinyin: 'huà shé tiān zú',
    meaning: '比喻多此一举，不但无益，反而有害。',
    synonyms: ['多此一举', '徒劳无益'],
    antonyms: ['恰到好处', '画龙点睛'],
    example: '你在这篇文章末尾加这一句，纯属画蛇添足。'
  },
  {
    name: '掩耳盗铃',
    pinyin: 'yǎn ěr dào líng',
    meaning: '比喻自己欺骗自己。',
    synonyms: ['自欺欺人'],
    antonyms: ['诚实守信'],
    example: '这种做法无异于掩耳盗铃。'
  },
  {
    name: '拔苗助长',
    pinyin: 'bá miáo zhù zhǎng',
    meaning: '比喻违反事物的发展规律，急于求成，反而把事情弄糟。',
    synonyms: ['急于求成'],
    antonyms: ['循序渐进'],
    example: '教育孩子不能拔苗助长，要遵循他们的成长规律。'
  },
  {
    name: '水滴石穿',
    pinyin: 'shuǐ dī shí chuān',
    meaning: '水不停地滴，能把石头滴穿。比喻力量虽小，只要坚持不懈，也能把难题解决。',
    synonyms: ['磨杵成针', '持之以恒'],
    antonyms: ['半途而废', '浅尝辄止'],
    example: '只要有水滴石穿的毅力，就没有办不到的事。'
  },
  {
    name: '名列前茅',
    pinyin: 'míng liè qián máo',
    meaning: '比喻名次排在前面。',
    synonyms: ['首屈一指', '出类拔萃'],
    antonyms: ['名落孙山', '滥竽充数'],
    example: '他在这次期末考试中名列前茅。'
  },
  {
    name: '名贯满盈',
    pinyin: 'míng guàn mǎn yíng',
    meaning: '形容名声很大。',
    synonyms: ['赫赫有名', '声名显赫'],
    antonyms: ['默默无闻', '名不见经传'],
    example: '他是一位名贯满盈的科学家。'
  },
  {
    name: '刻舟求剑',
    pinyin: 'kè zhōu qiú jiàn',
    meaning: '比喻死守教条，不知道跟着情况的变化而改变。',
    synonyms: ['守株待兔', '墨守成规'],
    antonyms: ['随机应变'],
    example: '我们不能刻舟求剑，要学会根据形势的变化调整策略。'
  },
  {
    name: '入木三分',
    pinyin: 'rù mù sān fēn',
    meaning: '原形容书法笔力雄健。后多比喻分析问题深刻、透彻。',
    synonyms: ['一针见血', '深刻深刻'],
    antonyms: ['肤浅'],
    example: '这篇文章对社会现象的描写真是入木三分。'
  },
  {
    name: '老马识途',
    pinyin: 'lǎo mǎ shí tú',
    meaning: '老马认识路。比喻年纪大的人经验丰富。',
    synonyms: ['识途老马'],
    antonyms: ['幼稚可笑'],
    example: '这种事情还是向他请教吧，毕竟老马识途嘛。'
  },
  {
    name: '惊弓之鸟',
    pinyin: 'jīng gōng zhī niǎo',
    meaning: '被弓箭吓怕了的鸟。比喻受过惊吓的人，遇到类似情况就惶恐不安。',
    synonyms: ['丧家之犬'],
    antonyms: ['面不改色'],
    example: '他现在已经是惊弓之鸟，一点小动静都能让他跳起来。'
  },
  {
    name: '杯弓蛇影',
    pinyin: 'bēi gōng shé yǐng',
    meaning: '比喻疑神疑鬼，自相惊扰。',
    synonyms: ['草木皆兵', '疑神疑鬼'],
    antonyms: ['坦荡无私'],
    example: '那是你由于过于紧张而产生的幻觉，不要杯弓蛇影了。'
  },
  {
    name: '狐假虎威',
    pinyin: 'hú jiǎ hǔ wēi',
    meaning: '狐狸假借老虎的威势。比喻依仗别人的权势来欺压人。',
    synonyms: ['依仗权势'],
    antonyms: ['平易近人'],
    example: '他不过是狐假虎威，没什么了不起。'
  },
  {
    name: '对牛弹琴',
    pinyin: 'duì niú tán qín',
    meaning: '比喻对不讲道理的人讲道理，或对不懂美的人讲美。',
    synonyms: ['枉费心机'],
    antonyms: ['有的放矢'],
    example: '我跟他讲艺术，简直是对牛弹琴。'
  },
  {
    name: '如鱼得水',
    pinyin: 'rú yú dé shuǐ',
    meaning: '像鱼得到水一样。比喻得到跟自己十分投合的人或对自己很合适的环境。',
    synonyms: ['如虎添翼'],
    antonyms: ['寸步难行'],
    example: '加入了这个团队，他感到如鱼得水。'
  },
  {
    name: '青出于蓝',
    pinyin: 'qīng chū yú lán',
    meaning: '比喻学生超过老师，或后人超过前人。',
    synonyms: ['后来居上'],
    antonyms: ['一代不如一代'],
    example: '他的画功已经超过了他的老师，真是青出于蓝。'
  },
  {
    name: '世外桃源',
    pinyin: 'shì wài táo yuán',
    meaning: '原指理想的安居乐业的世界。现多指理想的圣地或不受外界干扰的地方。',
    synonyms: ['人间仙境', '理想国'],
    antonyms: ['人间地狱'],
    example: '这里依山傍水，安静祥和，真是一个世外桃源。'
  },
  {
    name: '完璧归赵',
    pinyin: 'wán bì guī zhào',
    meaning: '比喻把原物完整地归还本人。',
    synonyms: ['物归原主'],
    antonyms: ['据为己有'],
    example: '借来的东西用完后要完璧归赵。'
  },
  {
    name: '负荆请罪',
    pinyin: 'fù jīng qǐng zuì',
    meaning: '背着荆条去请罪。表示认错赔礼，态度诚恳。',
    synonyms: ['认错投降'],
    antonyms: ['死不认错'],
    example: '既然是你错了，你就应该去向人家负荆请罪。'
  },
  {
    name: '望洋兴叹',
    pinyin: 'wàng yáng xīng tàn',
    meaning: '比喻做事力量不够，感到无可奈何。',
    synonyms: ['无可奈何'],
    antonyms: ['雄心斗志'],
    example: '面对这么庞大的工作量，他只能望洋兴叹。'
  },
  {
    name: '杞人忧天',
    pinyin: 'qǐ rén yōu tiān',
    meaning: '比喻不必要的忧虑。',
    synonyms: ['庸人自扰'],
    antonyms: ['高枕无忧'],
    example: '这事还没发生呢，你别杞人忧天。'
  },
  {
    name: '草船借箭',
    pinyin: 'cǎo chuán jiè jiàn',
    meaning: '比喻运用智谋，利用他人的力量来达到目的。',
    synonyms: ['借力打力'],
    example: '他这招草船借箭玩得真是漂亮。'
  },
  {
    name: '三顾茅庐',
    pinyin: 'sān gù máo lú',
    meaning: '比喻真心诚意地邀请。',
    synonyms: ['礼贤下士'],
    example: '他为了邀请这位专家，可谓是三顾茅庐。'
  },
  {
    name: '井底之蛙',
    pinyin: 'jǐng dǐ zhī wā',
    meaning: '比喻见识狭窄的人。',
    synonyms: ['一孔之见', '孤陋寡闻'],
    antonyms: ['见多识广', '博学多才'],
    example: '我们要多看书，多旅行，不要做一名井底之蛙。'
  },
  {
    name: '顺手牵羊',
    pinyin: 'shùn shǒu qiān yáng',
    meaning: '比喻趁机随手拿走别人的东西。',
    synonyms: ['乘虚而入'],
    antonyms: ['拾金不昧'],
    example: '他在超市购物时，竟然顺手牵羊拿走了一盒巧克力。'
  },
  {
    name: '百折不挠',
    pinyin: 'bǎi zhé bù náo',
    meaning: '比喻意志坚强，无论受到多少次挫折都不屈服。',
    synonyms: ['坚忍不拔', '百折不回'],
    antonyms: ['知难而退', '一蹶不振'],
    example: '科学家们正是凭着这种百折不挠的精神，才攻克了一个又一个难关。'
  },
  {
    name: '谈笑风生',
    pinyin: 'tán xiào fēng shēng',
    meaning: '形容谈话时有说有笑，兴致很高，并且很有风趣。',
    synonyms: ['谈笑自若'],
    antonyms: ['沉默寡言'],
    example: '在晚会上，他谈笑风生，赢得了大家的阵阵掌声。'
  },
  {
    name: '落井下石',
    pinyin: 'luò jǐng xià shí',
    meaning: '比喻乘人危难时加以陷害。',
    synonyms: ['乘人之危'],
    antonyms: ['雪中送炭'],
    example: '在别人遇到困难时，我们应该伸出援手，而不是落井下石。'
  },
  {
    name: '班门弄斧',
    pinyin: 'bān mén nòng fǔ',
    meaning: '比喻在行家面前卖弄本领。',
    synonyms: ['布鼓雷门', '自不量力'],
    antonyms: ['深藏不露', '虚怀若谷'],
    example: '我在各位专家面前谈建筑，真是班门弄斧了。'
  },
  {
    name: '朝三暮四',
    pinyin: 'zhāo sān mù sì',
    meaning: '原指玩弄手法欺骗人。后用来比喻常常变卦，反复无常。',
    synonyms: ['反复无常', '见异思迁'],
    antonyms: ['始终如一', '持之以恒'],
    example: '做事要有定性，不能朝三暮四。'
  },
  {
    name: '亡羊补牢',
    pinyin: 'wáng yáng bǔ láo',
    meaning: '羊丢了再去修补羊圈。比喻出了问题以后想办法补救，免得以后继续受损失。',
    synonyms: ['知错就改'],
    antonyms: ['执迷不悟'],
    example: '虽然这次考试考砸了，但只要能亡羊补牢，下次还是有希望的。'
  },
  {
    name: '精卫填海',
    pinyin: 'jīng wèi tián hǎi',
    meaning: '比喻意志坚决，不畏艰难。',
    synonyms: ['坚忍不拔', '愚公移山'],
    example: '只要我们有精卫填海的意志，任何困难都能克服。'
  },
  {
    name: '愚公移山',
    pinyin: 'yú gōng yí shān',
    meaning: '比喻坚持不懈地改造自然和克服困难。',
    synonyms: ['持之以恒', '锲而不舍'],
    antonyms: ['半途而废'],
    example: '学习要有愚公移山的精神，日积月累才能成功。'
  },
  {
    name: '四海为家',
    pinyin: 'sì hǎi wéi jiā',
    meaning: '原指天下一家。后指随处可以安家，不留恋故乡。',
    synonyms: ['浪迹天涯', '颠沛流离'],
    antonyms: ['安居乐业'],
    example: '这些地质队员长年奔波在外，四海为家。'
  },
  {
    name: '名副其实',
    pinyin: 'míng fù qí shí',
    meaning: '名声与实际相符。',
    synonyms: ['名副其实', '言行一致'],
    antonyms: ['名不副实', '虚有其表'],
    example: '他是一个名副其实的运动天才。'
  },
  {
    name: '一石二鸟',
    pinyin: 'yī shí èr niǎo',
    meaning: '比喻做一件事可以达到两个目的。',
    synonyms: ['一举两得'],
    antonyms: ['得不偿失'],
    example: '这个办法既能节省开支，又能提高效率，真是一石二鸟。'
  },
  {
    name: '志同道合',
    pinyin: 'zhì tóng dào hé',
    meaning: '指志向相同，道路一致。形容彼此理想、志趣相合。',
    synonyms: ['情投意合', '莫逆之交'],
    antonyms: ['分道扬镳', '道不同不相为谋'],
    example: '我们是一群志同道合的朋友，决定一起创业。'
  },
  {
    name: '莫名其妙',
    pinyin: 'mò míng qí miào',
    meaning: '原意是说不出其中的奥妙。现指事情很奇怪，让人不明白。',
    synonyms: ['百思不解', '不可思议'],
    antonyms: ['显而易见', '一目了然'],
    example: '他突然发火，让大家感到莫名其妙。'
  },
  {
    name: '恍然大悟',
    pinyin: 'huǎng rán dà wù',
    meaning: '一下子完全明白了。',
    synonyms: ['矛塞顿开', '如梦初醒'],
    antonyms: ['百思不解', '如坠烟海'],
    example: '听了他的解释，我才恍然大悟。'
  },
  {
    name: '络绎不绝',
    pinyin: 'luò yì bù jué',
    meaning: '形容行人车马来来往往，接连不断。',
    synonyms: ['川流不息', '源源不断'],
    antonyms: ['门可罗雀', '冷冷清清'],
    example: '马路上行人车辆络绎不绝。'
  },
  {
    name: '聚精会神',
    pinyin: 'jù jīng huì shén',
    meaning: '集中精神，专心致志。',
    synonyms: ['全神贯注', '专心致志'],
    antonyms: ['心不在焉', '漫不经心'],
    example: '同学们都在聚精会神地听老师讲课。'
  },
  {
    name: '走马观花',
    pinyin: 'zǒu mǎ guān huā',
    meaning: '骑在奔跑的马上看花。原形容得意愉快的心情。后多指观察事物不深入，只是粗略地扫视。',
    synonyms: ['浮光掠影', '蜻蜓点水'],
    antonyms: ['下马看花', '入木三分'],
    example: '由于时间太紧，我们只能走马观花地看了一下。'
  },
  {
    name: '悬梁刺股',
    pinyin: 'xuán liáng cì gǔ',
    meaning: '形容刻苦学习。',
    synonyms: ['刻苦钻研'],
    antonyms: ['贪图安逸'],
    example: '古人悬梁刺股，发奋读书，最终成就了一番事业。'
  },
  {
    name: '凿壁偷光',
    pinyin: 'záo bì tōu guāng',
    meaning: '形容勤学苦读。',
    synonyms: ['发奋苦读'],
    example: '匡衡勤学好问，甚至凿壁偷光，深受后世推崇。'
  },
  {
    name: '顺其自然',
    pinyin: 'shùn qí zì rán',
    meaning: '指顺应事物的自然发展，不强行干预。',
    synonyms: ['听其自然'],
    antonyms: ['强求'],
    example: '很多事情我们只要尽力了，剩下的就顺其自然吧。'
  },
  {
    name: '守口如瓶',
    pinyin: 'shǒu kǒu rú píng',
    meaning: '闭口不谈，像瓶口塞紧了一样。形容说话谨慎，保守秘密。',
    synonyms: ['缄口不言'],
    antonyms: ['信口雌黄', '口无遮拦'],
    example: '他是个守口如瓶的人，绝不会泄露这个消息。'
  },
  {
    name: '披星戴月',
    pinyin: 'pī xīng dài yuè',
    meaning: '顶着星星，披着月亮。形容早出晚归，旅途辛劳或工作忙碌。',
    synonyms: ['早出晚归'],
    antonyms: ['过分享乐'],
    example: '地质队员披星戴月，长年奔波在荒野。'
  },
  {
    name: '循循善诱',
    pinyin: 'xún xún shàn yòu',
    meaning: '善于有步骤地引导别人学习。',
    synonyms: ['诲人不倦'],
    example: '王老师循循善诱，总能激发起学生的学习兴趣。'
  },
  {
    name: '饮水思源',
    pinyin: 'yǐn shuǐ sī yuán',
    meaning: '喝水的时候想起水的源头。比喻享受成果时不忘其根源和对他人的感激。',
    synonyms: ['慎终追远'],
    antonyms: ['忘恩负义'],
    example: '我们取得了今天的成就，更要饮水思源，不能忘记老一辈的付出。'
  },
  {
    name: '助人为乐',
    pinyin: 'zhù rén wéi lè',
    meaning: '以帮助他人为快乐。',
    synonyms: ['乐于助人'],
    example: '雷锋同志一生助人为乐，是我们的楷模。'
  },
  {
    name: '铁杵成针',
    pinyin: 'tiě chǔ chéng zhēn',
    meaning: '比喻只要有恒心，肯努力，再难的事也能成功。',
    synonyms: ['磨杵成针', '持之以恒'],
    example: '只要肯下功夫，铁杵成针。'
  },
  {
    name: '囊萤映雪',
    pinyin: 'náng yíng yìng xuě',
    meaning: '形容贫寒家境的孩子刻苦读书。',
    synonyms: ['刻苦苦读'],
    example: '古人囊萤映雪的精神值得我们学习。'
  },
  {
    name: '乘风破浪',
    pinyin: 'chéng fēng pò làng',
    meaning: '比喻排除障碍，奋勇前进。也指志向远大。',
    synonyms: ['勇往直前', '志在四方'],
    antonyms: ['裹足不前', '垂头丧气'],
    example: '我们要乘风破浪，勇往直前，实现我们的梦想。'
  },
  {
    name: '兢兢业业',
    pinyin: 'jīng jīng yè yè',
    meaning: '形容做事谨慎、勤恳。',
    synonyms: ['勤勤恳恳', '脚踏实地'],
    antonyms: ['敷衍了事'],
    example: '他在这个岗位上兢兢业业工作了三十年。'
  },
  {
    name: '孜孜不倦',
    pinyin: 'zī zī bù juàn',
    meaning: '形容学习或工作勤奋，不知疲倦。',
    synonyms: ['勤勉'],
    antonyms: ['游手好闲'],
    example: '他孜孜不倦地钻研各种学术难题。'
  },
  {
    name: '废寝忘食',
    pinyin: 'fèi qǐn wàng shí',
    meaning: '顾不得睡觉，忘了吃饭。形容非常专注、刻苦。',
    synonyms: ['全神贯注', '专心致志'],
    antonyms: ['饱食终日'],
    example: '为了攻克这个难题，他整天废寝忘食地在实验室里忙碌。'
  },
  {
    name: '炉火纯青',
    pinyin: 'lú huǒ chún qīng',
    meaning: '比喻功夫达到了纯熟完美的地步。',
    synonyms: ['出神入化', '登峰造极'],
    antonyms: ['半途而废'],
    example: '他的书法技艺已经达到了炉火纯青的境界。'
  },
  {
    name: '鹤立鸡群',
    pinyin: 'hè lì jī qún',
    meaning: '比喻一个人的才能或仪表在一群人中显得很突出。',
    synonyms: ['出类拔萃', '首屈一指'],
    antonyms: ['滥竽充数'],
    example: '他那高大的形象在人群中可谓是鹤立鸡群。'
  },
  {
    name: '狼吞虎咽',
    pinyin: 'láng tūn hǔ yàn',
    meaning: '形容吃东西又急又猛。',
    synonyms: ['大快朵颐'],
    antonyms: ['细嚼慢咽'],
    example: '他饿极了，一回家就狼吞虎咽地吃起来。'
  },
  {
    name: '绘声绘色',
    pinyin: 'huì shēng huì sè',
    meaning: '形容叙述、描写得极其生动真实。',
    synonyms: ['栩栩如生'],
    example: '他把那段惊险的经历讲得绘声绘色。'
  },
  {
    name: '栩栩如生',
    pinyin: 'xǔ xǔ rú shēng',
    meaning: '指画作、雕塑等艺术品非常生动，像活的一样。',
    synonyms: ['绘声绘色', '惟妙惟肖'],
    antonyms: ['死气沉沉'],
    example: '这尊雕像刻画得栩栩如生，仿佛随时都会走下来。'
  },
  {
    name: '气势磅礴',
    pinyin: 'qì shì páng bó',
    meaning: '形容气势极其宏伟浩大。',
    synonyms: ['雄伟壮观'],
    example: '黄河壶口瀑布气势磅礴，令人震撼。'
  },
  {
    name: '谈笑自若',
    pinyin: 'tán xiào zì ruò',
    meaning: '指在不平常的情况下，仍能跟平时一样谈笑得很自然。',
    synonyms: ['面不改色'],
    example: '面对敌人的重重包围，将军谈笑自若。'
  },
  {
    name: '雄心壮志',
    pinyin: 'xióng xīn zhuàng zhì',
    meaning: '指远大的理想和抱负。',
    synonyms: ['胸怀大志'],
    example: '年轻人应该树立起雄心壮志。'
  },
  {
    name: '不耻下问',
    pinyin: 'bù chǐ xià wèn',
    meaning: '指不以向地位比自己低、知识比自己少的人请教为耻。形容虚心好学。',
    synonyms: ['虚心好学', '不耻下教'],
    antonyms: ['好为人师', '骄傲自满'],
    example: '我们在学习上要发扬不耻下问的精神。'
  },
  {
    name: '别具一格',
    pinyin: 'bié jù yī gé',
    meaning: '另有一种独特的风格。',
    synonyms: ['独树一帜', '别开生面'],
    antonyms: ['千篇一律', '如出一辙'],
    example: '他的装修风格别具一格，让人眼前一亮。'
  },
  {
    name: '沧海桑田',
    pinyin: 'cāng hǎi sāng tián',
    meaning: '大海变成农田，农田变成大海。比喻世事变化巨大。',
    synonyms: ['白云苍狗', '日新月异'],
    antonyms: ['一成不变'],
    example: '离开家乡几十年，回来一看，真是沧海桑田，物是人非。'
  },
  {
    name: '唇亡齿寒',
    pinyin: 'chún wáng chǐ hán',
    meaning: '嘴唇没了，牙齿就会感到寒冷。比喻利害密切相关。',
    synonyms: ['息息相关', '患难与共'],
    antonyms: ['格格不入'],
    example: '这两家公司是战略合作伙伴，有着唇亡齿寒的关系。'
  },
  {
    name: '打草惊蛇',
    pinyin: 'dǎ cǎo jīng shé',
    meaning: '比喻做事不慎，致使对方察觉而有所戒备。',
    synonyms: ['因小失大'],
    example: '在证据不足的情况下，我们不能打草惊蛇。'
  },
  {
    name: '得心应手',
    pinyin: 'dé xīn yìng shǒu',
    meaning: '形容技艺纯熟，心里怎么想，手就能怎么做。',
    synonyms: ['驾轻就熟', '游刃有余'],
    antonyms: ['无从下手', '手脚忙乱'],
    example: '这台机器他已经操作多年，用起来得心应手。'
  },
  {
    name: '独具匠心',
    pinyin: 'dú jù jiàng xīn',
    meaning: '形容艺术构思运用的独特、巧妙。',
    synonyms: ['别出心裁', '别具一格'],
    antonyms: ['墨守成规'],
    example: '这座建筑的设计独具匠心，融合了古今建筑的精华。'
  },
  {
    name: '恩将仇报',
    pinyin: 'ēn jiāng chóu bào',
    meaning: '用仇恨来报答恩惠。',
    synonyms: ['忘恩负义'],
    antonyms: ['投桃报李', '感恩图报'],
    example: '我们绝不能做恩将仇报的小人。'
  },
  {
    name: '赴汤蹈火',
    pinyin: 'fù tāng dǎo huǒ',
    meaning: '跳进滚水，踏进烈火。比喻不避艰险，奋勇向前。',
    synonyms: ['出生入死', '在所不辞'],
    antonyms: ['贪生怕死'],
    example: '为了保家卫国，战士们愿意赴汤蹈火。'
  },
  {
    name: '刚愎自用',
    pinyin: 'gāng bì zì yòng',
    meaning: '形容人固执己见，不听取别人的意见。',
    synonyms: ['主观臆断', '固执己见'],
    antonyms: ['虚怀若谷', '从善如流'],
    example: '他这个人刚愎自用，很难听进别人的劝告。'
  },
  {
    name: '孤掌难鸣',
    pinyin: 'gū zhǎng nán míng',
    meaning: '一个巴掌拍不响。比喻力量单薄，难以成事。',
    synonyms: ['孤立无援'],
    antonyms: ['众人拾柴火焰高'],
    example: '没有大家的配合，他一个人真是孤掌难鸣。'
  },
  {
    name: '归心似箭',
    pinyin: 'guī xīn sì jiàn',
    meaning: '想回家的心情像射出的箭一样快。形容回家心切。',
    synonyms: ['急于求成'],
    example: '春节将至，工人们都归心似箭。'
  },
  {
    name: '和颜悦色',
    pinyin: 'hé yán yuè sè',
    meaning: '形容和蔼可亲的神态。',
    synonyms: ['平易近人'],
    antonyms: ['横眉冷对'],
    example: '王老师总是和颜悦色地对待每一个学生。'
  },
  {
    name: '呼风唤雨',
    pinyin: 'hū fēng huàn yǔ',
    meaning: '形容神仙道士有法术。后多比喻人有巨大的权势和影响力。',
    example: '他在这个圈子里可是个呼风唤雨的人物。'
  },
  {
    name: '豁然开朗',
    pinyin: 'huò rán kāi lǎng',
    meaning: '原指由狭窄暗淡转变为开阔明亮。后也比喻一下子领悟了某种道理。',
    synonyms: ['茅塞顿开'],
    antonyms: ['百思不解'],
    example: '走出山洞，面前呈现出一片豁然开朗的景色。'
  },
  {
    name: '鸡犬不宁',
    pinyin: 'jī quǎn bù níng',
    meaning: '形容骚扰得很厉害，连鸡狗都不得安宁。',
    synonyms: ['骚乱不堪'],
    antonyms: ['平安无事'],
    example: '被他们这一闹，全村都被搞得鸡犬不宁。'
  },
  {
    name: '井井有条',
    pinyin: 'jǐng jǐng yǒu tiáo',
    meaning: '形容条理清晰，整齐不乱。',
    synonyms: ['整齐划一', '秩序井然'],
    antonyms: ['杂乱无章', '乱七八糟'],
    example: '在她的管理下，办公室里的文件都被整理得井井有条。'
  },
  {
    name: '迥然不同',
    pinyin: 'jiǒng rán bù tóng',
    meaning: '形容差别很大，完全不一样。',
    synonyms: ['天差地别'],
    antonyms: ['大同小异', '如出一辙'],
    example: '这两份报告的结论迥然不同。'
  },
  {
    name: '绝无仅有',
    pinyin: 'jué wú jǐn yǒu',
    meaning: '只有一个，再没有第二个。形容极其罕见。',
    synonyms: ['凤毛麟角', '独一无二'],
    antonyms: ['成千上万', '司空见惯'],
    example: '这件文物具有绝无仅有的艺术价值。'
  },
  {
    name: '慷慨解囊',
    pinyin: 'kāng kǎi jiě náng',
    meaning: '形容大方地捐助钱财。',
    synonyms: ['乐善好施'],
    antonyms: ['一门不出'],
    example: '面对地震灾情，社会各界积极慷慨解囊。'
  },
  {
    name: '空中楼阁',
    pinyin: 'kōng zhōng lóu gé',
    meaning: '比喻虚幻、没有根据的事物。',
    synonyms: ['虚无缥缈', '纸上谈兵'],
    antonyms: ['脚踏实地'],
    example: '没有基础的计划只能是空中楼阁。'
  },
  {
    name: '口是心非',
    pinyin: 'kǒu shì xīn fēi',
    meaning: '嘴上说的是一套，心里想的是另一套。',
    synonyms: ['阳奉阴违'],
    antonyms: ['言行一致', '表里如一'],
    example: '像他这种口是心非的人，不值得深交。'
  },
  {
    name: '滥竽充数',
    pinyin: 'làn yú chōng shù',
    meaning: '比喻无本领的人混在有本领的人中。也比喻以次充好。',
    synonyms: ['鱼目混珠'],
    antonyms: ['名副其实'],
    example: '我们公司绝不允许有人在这里滥竽充数。'
  },
  {
    name: '乐极生悲',
    pinyin: 'lè jí shēng bēi',
    meaning: '高兴到极点，往往会引起悲伤的事。',
    synonyms: ['否极泰来'],
    antonyms: ['因祸得福'],
    example: '玩耍的时候要注意安全，千万不要乐极生悲。'
  },
  {
    name: '历历在目',
    pinyin: 'lì lì zài mù',
    meaning: '指过去的景物清楚地呈现在眼前。',
    synonyms: ['记忆犹新'],
    antonyms: ['模糊不清'],
    example: '往事历历在目，仿佛就发生在昨天。'
  },
  {
    name: '梁上君子',
    pinyin: 'liáng shàng jūn zǐ',
    meaning: '指小偷。',
    example: '他由于不务正业，最终沦为了梁上君子。'
  },
  {
    name: '满载而归',
    pinyin: 'mǎn zài ér guī',
    meaning: '装得满满地回来。比喻收获很大。',
    example: '这次出海捕鱼，渔民们满载而归。'
  },
  {
    name: '慢条斯理',
    pinyin: 'màn tiáo sī lǐ',
    meaning: '形容动作缓慢，情绪从容。',
    synonyms: ['从容不迫'],
    antonyms: ['风风火火', '心急如焚'],
    example: '他总是慢条斯理地说话，从来不着急。'
  },
  {
    name: '眉飞色舞',
    pinyin: 'méi fēi sè wǔ',
    meaning: '形容非常高兴得意。',
    synonyms: ['喜笑颜开'],
    antonyms: ['愁眉苦脸'],
    example: '想起那件事，他忍不住眉飞色舞地讲了起来。'
  },
  {
    name: '门庭若市',
    pinyin: 'mén tíng ruò shì',
    meaning: '形容来往的人很多。',
    synonyms: ['热闹非凡'],
    antonyms: ['门可罗雀', '冷冷清清'],
    example: '自从他当选后，家里每天都是门庭若市。'
  }
];
