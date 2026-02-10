export interface Holiday {
  year: string;
  name: string;
  range: string;
  length: number;
  adjustments: string[];
  tip: string;
}

export const holidayData: Holiday[] = [
  {
    year: '2024',
    name: '元旦',
    range: '1月1日',
    length: 1,
    adjustments: [],
    tip: '与周末连休'
  },
  {
    year: '2024',
    name: '春节',
    range: '2月10日至17日',
    length: 8,
    adjustments: ['2月4日(周日)', '2月18日(周日)'],
    tip: '鼓励落实带薪休假，除夕自发休假'
  },
  {
    year: '2024',
    name: '清明节',
    range: '4月4日至6日',
    length: 3,
    adjustments: ['4月7日(周日)'],
    tip: '清明时节雨纷纷'
  },
  {
    year: '2024',
    name: '劳动节',
    range: '5月1日至5日',
    length: 5,
    adjustments: ['4月28日(周日)', '5月11日(周六)'],
    tip: '劳动最光荣'
  },
  {
    year: '2024',
    name: '端午节',
    range: '6月8日至10日',
    length: 3,
    adjustments: [],
    tip: '与周末连休'
  },
  {
    year: '2024',
    name: '中秋节',
    range: '9月15日至17日',
    length: 3,
    adjustments: ['9月14日(周六)'],
    tip: '团圆中秋'
  },
  {
    year: '2024',
    name: '国庆节',
    range: '10月1日至7日',
    length: 7,
    adjustments: ['9月29日(周日)', '10月12日(周六)'],
    tip: '祖国生日快乐'
  },

  {
    year: '2025',
    name: '元旦',
    range: '1月1日',
    length: 1,
    adjustments: [],
    tip: '周三放假，不调休'
  },
  {
    year: '2025',
    name: '春节',
    range: '1月28日至2月4日',
    length: 8,
    adjustments: ['1月26日(周日)', '2月8日(周六)'],
    tip: '除夕至初七，团圆佳节'
  },
  {
    year: '2025',
    name: '清明节',
    range: '4月4日至6日',
    length: 3,
    adjustments: [],
    tip: '与周末连休'
  },
  {
    year: '2025',
    name: '劳动节',
    range: '5月1日至5日',
    length: 5,
    adjustments: ['4月27日(周日)'],
    tip: '五一小长假'
  },
  {
    year: '2025',
    name: '端午节',
    range: '5月31日至6月2日',
    length: 3,
    adjustments: [],
    tip: '与周末连休'
  },
  {
    year: '2025',
    name: '中秋节',
    range: '10月6日',
    length: 1,
    adjustments: [],
    tip: '与国庆节连休'
  },
  {
    year: '2025',
    name: '国庆节',
    range: '10月1日至8日',
    length: 8,
    adjustments: ['9月28日(周日)', '10月11日(周六)'],
    tip: '中秋国庆连休'
  },

  {
    year: '2026',
    name: '元旦',
    range: '1月1日至3日',
    length: 3,
    adjustments: ['1月4日(周日)'],
    tip: '周四至周六放假，周日补班'
  },
  {
    year: '2026',
    name: '春节',
    range: '2月15日至23日',
    length: 7,
    adjustments: ['2月14日(周六)', '2月28日(周六)'],
    tip: '除夕至初六，阖家团圆'
  },
  {
    year: '2026',
    name: '清明节',
    range: '4月4日至6日',
    length: 3,
    adjustments: [],
    tip: '周六至周一，与周末连休'
  },
  {
    year: '2026',
    name: '劳动节',
    range: '5月1日至5日',
    length: 5,
    adjustments: ['5月9日(周六)'],
    tip: '五一小长假'
  },
  {
    year: '2026',
    name: '端午节',
    range: '6月19日至21日',
    length: 3,
    adjustments: [],
    tip: '周五至周日，与周末连休'
  },
  {
    year: '2026',
    name: '中秋节',
    range: '9月25日至27日',
    length: 3,
    adjustments: ['9月20日(周日)'],
    tip: '周五至周日，与周末连休'
  },
  {
    year: '2026',
    name: '国庆节',
    range: '10月1日至7日',
    length: 7,
    adjustments: ['10月10日(周六)'],
    tip: '祖国生日快乐'
  }
];

export const availableYears: string[] = ['2024', '2025', '2026'];

export function getHolidaysByYear(year: string): Holiday[] {
  return holidayData.filter(h => h.year === year);
}

export interface NextHoliday {
  name: string;
  daysLeft: number | string;
  range: string;
  length: number;
}

export function getNextHoliday(): NextHoliday {
  const now = new Date();
  const currentYear = now.getFullYear();

  const parseStartDate = (range: string, year: string) => {
    const match = range.match(/(\d+)月(\d+)日/);
    if (match) {
      return new Date(parseInt(year), parseInt(match[1]) - 1, parseInt(match[2]));
    }
    return null;
  };

  let nextHoliday: NextHoliday | null = null;
  let minDiff = Infinity;

  for (const holiday of holidayData) {
    const holidayYear = parseInt(holiday.year);
    if (holidayYear < currentYear) continue;

    const startDate = parseStartDate(holiday.range, holiday.year);
    if (!startDate) continue;

    const diff = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextHoliday = {
        name: holiday.name,
        daysLeft: diff,
        range: `${holiday.year}年${holiday.range}`,
        length: holiday.length
      };
    }
  }

  return (
    nextHoliday || {
      name: '暂无',
      daysLeft: '-',
      range: '-',
      length: 0
    }
  );
}
