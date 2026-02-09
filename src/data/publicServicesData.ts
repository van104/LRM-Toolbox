


export interface ServiceItem {
  title: string;
  desc: string;
  icon: string;
  color: string;
  url: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  items: ServiceItem[];
}

export const serviceCategories: ServiceCategory[] = [
    {
        id: 'government',
        name: '政务与社保',
        icon: 'Stamp',
        items: [
            {
                title: '国家政务服务平台',
                desc: '一网通办，各类政务在线办理',
                icon: 'Coordinate',
                color: '#1890ff',
                url: 'http://gjzwfw.www.gov.cn/'
            },
            {
                title: '掌上社保查询',
                desc: '养老、医保、失业保险查询',
                icon: 'User',
                color: '#52c41a',
                url: 'http://www.12333.gov.cn/'
            },
            {
                title: '住房公积金查询',
                desc: '全国公积金余额与贷款查询',
                icon: 'House',
                color: '#faad14',
                url: 'http://www.mohurd.gov.cn/'
            },
            {
                title: '个人所得税',
                desc: '个税申报、退税、年度汇算',
                icon: 'Wallet',
                color: '#eb2f96',
                url: 'https://etax.chinatax.gov.cn/'
            },
            {
                title: '出入境证件预约',
                desc: '护照、港澳通行证在线预约',
                icon: 'Stamp',
                color: '#722ed1',
                url: 'https://s.nia.gov.cn/'
            },
            {
                title: '学信网',
                desc: '学历查询、学籍验证',
                icon: 'Reading',
                color: '#13c2c2',
                url: 'https://www.chsi.com.cn/'
            },
            {
                title: '中国人事考试网',
                desc: '职业资格考试报名查询',
                icon: 'Notebook',
                color: '#fa541c',
                url: 'http://www.cpta.com.cn/'
            }
        ]
    },
    {
        id: 'traffic',
        name: '交通出行',
        icon: 'Van',
        items: [
            {
                title: '交管12123',
                desc: '违章查询、驾照分、处理缴费',
                icon: 'Management',
                color: '#1890ff',
                url: 'https://gd.122.gov.cn/'
            },
            {
                title: '铁路12306',
                desc: '火车票购票、改签、退票',
                icon: 'Ticket',
                color: '#1890ff',
                url: 'https://www.12306.cn/'
            },
            {
                title: '航班信息查询',
                desc: '航班动态、机票预订',
                icon: 'Position',
                color: '#2f54eb',
                url: 'https://flights.ctrip.com/'
            },
            {
                title: '高速ETC服务',
                desc: 'ETC办理、充值、账单查询',
                icon: 'CreditCard',
                color: '#52c41a',
                url: 'https://www.etc.cn/'
            },
            {
                title: '驾驶证查询',
                desc: '驾驶证信息、记分查询',
                icon: 'Postcard',
                color: '#faad14',
                url: 'https://gd.122.gov.cn/'
            },
            {
                title: '机动车违法查询',
                desc: '全国机动车违法记录查询',
                icon: 'Warning',
                color: '#f5222d',
                url: 'https://gd.122.gov.cn/'
            }
        ]
    },
    {
        id: 'logistics',
        name: '生活物流',
        icon: 'List',
        items: [
            {
                title: '快递100',
                desc: '聚合顺丰、中通、圆通等物流',
                icon: 'Connection',
                color: '#722ed1',
                url: 'https://www.kuaidi100.com/'
            },
            {
                title: '顺丰速运',
                desc: '顺丰快递查询、寄件',
                icon: 'Van',
                color: '#f5222d',
                url: 'https://www.sf-express.com/'
            },
            {
                title: '中国邮政',
                desc: 'EMS、挂号信查询',
                icon: 'Message',
                color: '#52c41a',
                url: 'https://www.ems.com.cn/'
            },
            {
                title: '菜鸟裹裹',
                desc: '快递查询、寄件、驿站服务',
                icon: 'Box',
                color: '#fa8c16',
                url: 'https://www.guoguo-app.com/'
            }
        ]
    },
    {
        id: 'finance',
        name: '金融服务',
        icon: 'Money',
        items: [
            {
                title: '生活缴费',
                desc: '水费、电费、燃气费在线缴纳',
                icon: 'Wallet',
                color: '#fa8c16',
                url: 'https://www.alipay.com/'
            },
            {
                title: '个人信用报告',
                desc: '央行征信中心，信用记录查询',
                icon: 'Document',
                color: '#1890ff',
                url: 'https://ipcrs.pbccrc.org.cn/'
            },
            {
                title: '银联在线',
                desc: '银行卡查询、转账服务',
                icon: 'CreditCard',
                color: '#f5222d',
                url: 'https://www.unionpay.com/'
            },
            {
                title: '发票查验',
                desc: '全国增值税发票查验平台',
                icon: 'Tickets',
                color: '#722ed1',
                url: 'https://inv-veri.chinatax.gov.cn/'
            }
        ]
    },
    {
        id: 'medical',
        name: '医疗健康',
        icon: 'FirstAidKit',
        items: [
            {
                title: '医院挂号预约',
                desc: '全国医院统一预约挂号',
                icon: 'Calendar',
                color: '#1890ff',
                url: 'https://www.114yygh.com/'
            },
            {
                title: '药品查询',
                desc: '国家药品监督管理局',
                icon: 'FirstAidKit',
                color: '#52c41a',
                url: 'https://www.nmpa.gov.cn/'
            },
            {
                title: '健康码查询',
                desc: '各地健康码服务入口',
                icon: 'Checked',
                color: '#13c2c2',
                url: 'https://gjzwfw.www.gov.cn/'
            },
            {
                title: '核酸/疫苗查询',
                desc: '新冠疫苗接种、核酸检测记录',
                icon: 'Document',
                color: '#eb2f96',
                url: 'https://gjzwfw.www.gov.cn/'
            }
        ]
    },
    {
        id: 'education',
        name: '教育考试',
        icon: 'Reading',
        items: [
            {
                title: '中国教育考试网',
                desc: '各类考试报名、成绩查询',
                icon: 'Notebook',
                color: '#1890ff',
                url: 'http://www.neea.edu.cn/'
            },
            {
                title: '四六级成绩查询',
                desc: '大学英语四六级成绩',
                icon: 'Tickets',
                color: '#52c41a',
                url: 'http://cet.neea.edu.cn/'
            },
            {
                title: '普通话水平测试',
                desc: '普通话考试报名成绩',
                icon: 'Microphone',
                color: '#722ed1',
                url: 'https://www.cltt.org/'
            },
            {
                title: '计算机等级考试',
                desc: 'NCRE报名成绩查询',
                icon: 'Monitor',
                color: '#fa8c16',
                url: 'https://ncre.neea.edu.cn/'
            }
        ]
    },
    {
        id: 'utility',
        name: '生活工具',
        icon: 'HelpFilled',
        items: [
            {
                title: '天气预报查询',
                desc: '中国天气网权威预报',
                icon: 'Sunny',
                color: '#faad14',
                url: 'http://www.weather.com.cn/'
            },
            {
                title: '空气质量查询',
                desc: '全国城市空气质量指数',
                icon: 'WindPower',
                color: '#52c41a',
                url: 'http://www.cnemc.cn/'
            },
            {
                title: '汇率查询',
                desc: '实时外汇牌价、汇率换算',
                icon: 'TrendCharts',
                color: '#1890ff',
                url: 'https://www.boc.cn/sourcedb/whpj/'
            },
            {
                title: '邮编区号查询',
                desc: '全国邮政编码、区号查询',
                icon: 'Location',
                color: '#722ed1',
                url: 'https://www.ip138.com/'
            },
            {
                title: '万年历/老黄历',
                desc: '农历、节气、宜忌查询',
                icon: 'Calendar',
                color: '#eb2f96',
                url: 'https://wannianli.tianqi.com/'
            },
            {
                title: '度量衡换算',
                desc: '长度、重量、面积单位换算',
                icon: 'DataLine',
                color: '#13c2c2',
                url: 'https://www.convertworld.com/zh-hans/'
            }
        ]
    },
    {
        id: 'complaint',
        name: '投诉维权',
        icon: 'Bell',
        items: [
            {
                title: '12315消费者投诉',
                desc: '全国消费者投诉举报平台',
                icon: 'Bell',
                color: '#f5222d',
                url: 'https://www.12315.cn/'
            },
            {
                title: '12345政务服务热线',
                desc: '各地政务服务便民热线',
                icon: 'Phone',
                color: '#1890ff',
                url: 'https://gjzwfw.www.gov.cn/'
            },
            {
                title: '国家信访局',
                desc: '网上信访投诉平台',
                icon: 'ChatDotSquare',
                color: '#722ed1',
                url: 'https://www.gjxfj.gov.cn/'
            },
            {
                title: '中国裁判文书网',
                desc: '司法判决文书公开查询',
                icon: 'Document',
                color: '#fa8c16',
                url: 'https://wenshu.court.gov.cn/'
            },
            {
                title: '执行信息公开网',
                desc: '失信被执行人、执行案件查询',
                icon: 'CircleCheck',
                color: '#f5222d',
                url: 'http://zxgk.court.gov.cn/'
            },
            {
                title: '中国法律服务网',
                desc: '法律咨询、法律援助、公证办理',
                icon: 'Service',
                color: '#1890ff',
                url: 'http://www.12348.gov.cn/'
            }
        ]
    },
    {
        id: 'culture',
        name: '文化旅游',
        icon: 'MapLocation',
        items: [
            {
                title: '国家博物馆预约',
                desc: '中国国家博物馆参观预约',
                icon: 'Ticket',
                color: '#f5222d',
                url: 'https://www.chnmuseum.cn/'
            },
            {
                title: '故宫博物院票务',
                desc: '故宫门票预约及展览查询',
                icon: 'Location',
                color: '#cf1322',
                url: 'https://piao.dpm.org.cn/'
            },
            {
                title: '国家图书馆',
                desc: '图书检索、数字资源访问',
                icon: 'Reading',
                color: '#1890ff',
                url: 'http://www.nlc.cn/'
            },
            {
                title: '全国重点文物保护',
                desc: '全国重点文物保护单位名录',
                icon: 'Stamp',
                color: '#faad14',
                url: 'http://www.ncha.gov.cn/'
            }
        ]
    },
    {
        id: 'business',
        name: '企业服务',
        icon: 'Shop',
        items: [
            {
                title: '国家企业信用中心',
                desc: '企业信息、经营异常、行政处罚',
                icon: 'Monitor',
                color: '#1890ff',
                url: 'http://www.gsxt.gov.cn/'
            },
            {
                title: '企查查',
                desc: '企业背景、股权结构、法律诉讼',
                icon: 'Search',
                color: '#52c41a',
                url: 'https://www.qcc.com/'
            },
            {
                title: '天眼查',
                desc: '商业查询、关系发现',
                icon: 'View',
                color: '#1890ff',
                url: 'https://www.tianyancha.com/'
            },
            {
                title: '国家知识产权局',
                desc: '专利、商标查询与办理',
                icon: 'Lock',
                color: '#faad14',
                url: 'https://www.cnipa.gov.cn/'
            }
        ]
    },
    {
        id: 'recruitment',
        name: '求职招聘',
        icon: 'UserFilled',
        items: [
            {
                title: '国家大学生就业服务',
                desc: '教育部大学生就业服务平台',
                icon: 'Promotion',
                color: '#1890ff',
                url: 'https://24365.smartedu.cn/'
            },
            {
                title: '智联招聘',
                desc: '全国领先的求职招聘平台',
                icon: 'User',
                color: '#1890ff',
                url: 'https://www.zhaopin.com/'
            },
            {
                title: '前程无忧',
                desc: '专业的人力资源服务机构',
                icon: 'Suitcase',
                color: '#fa8c16',
                url: 'https://www.51job.com/'
            },
            {
                title: 'BOSS直聘',
                desc: '互联网求职招聘平台',
                icon: 'ChatLineRound',
                color: '#13c2c2',
                url: 'https://www.zhipin.com/'
            }
        ]
    }
]


export function searchServices(keyword: string): ServiceCategory[] {
  const lowerKeyword = keyword.toLowerCase();
  return serviceCategories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.desc.toLowerCase().includes(lowerKeyword)
    )
  })).filter(category => category.items.length > 0);
}


export function getTotalServicesCount() {
    return serviceCategories.reduce((sum, cat) => sum + cat.items.length, 0)
}


export function getCategoriesCount() {
    return serviceCategories.length
}
