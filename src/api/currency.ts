const BASE_URL = 'https://api.frankfurter.app';

export const currencyNames: Record<string, string> = {
  CNY: '人民币',
  USD: '美元',
  EUR: '欧元',
  JPY: '日元',
  HKD: '港币',
  GBP: '英镑',
  AUD: '澳元',
  CAD: '加元',
  CHF: '瑞士法郎',
  KRW: '韩元',
  SGD: '新加坡元',
  THB: '泰铢',
  MYR: '马来西亚林吉特',
  NZD: '新西兰元',
  INR: '印度卢比',
  RUB: '俄罗斯卢布',
  BRL: '巴西雷亚尔',
  MXN: '墨西哥比索',
  ZAR: '南非兰特',
  SEK: '瑞典克朗',
  NOK: '挪威克朗',
  DKK: '丹麦克朗',
  PLN: '波兰兹罗提',
  CZK: '捷克克朗',
  HUF: '匈牙利福林',
  TRY: '土耳其里拉',
  IDR: '印尼盾',
  PHP: '菲律宾比索',
  TWD: '新台币',
  ILS: '以色列新谢克尔',
  BGN: '保加利亚列弗',
  RON: '罗马尼亚列伊',
  ISK: '冰岛克朗'
};

export const popularCurrencies: string[] = [
  'CNY',
  'USD',
  'EUR',
  'JPY',
  'HKD',
  'GBP',
  'AUD',
  'CAD',
  'CHF',
  'KRW'
];

export async function getCurrencies(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/currencies`);
    if (!response.ok) throw new Error('获取货币列表失败');
    return await response.json();
  } catch (error) {
    console.error('getCurrencies error:', error);
    // Fallback to local data if API fails
    return currencyNames;
  }
}

export async function getLatestRate(
  from: string,
  to: string | string[],
  amount: number = 1
): Promise<any> {
  try {
    const toParam = Array.isArray(to) ? to.join(',') : to;
    const url = `${BASE_URL}/latest?from=${from}&to=${toParam}&amount=${amount}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取汇率失败');
    return await response.json();
  } catch (error) {
    console.error('getLatestRate error:', error);
    throw error;
  }
}

export async function getHistoricalRates(
  from: string,
  to: string,
  days: number = 30
): Promise<any> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const url = `${BASE_URL}/${formatDate(startDate)}..${formatDate(endDate)}?from=${from}&to=${to}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取历史汇率失败');
    return await response.json();
  } catch (error) {
    console.error('getHistoricalRates error:', error);
    throw error;
  }
}

export function formatHistoryForChart(
  historyData: any,
  targetCurrency: string
): { labels: string[]; values: number[] } {
  const rates = historyData.rates || {};
  const sortedDates = Object.keys(rates).sort();

  const labels = sortedDates.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  const values = sortedDates.map(date => rates[date][targetCurrency]);

  return { labels, values };
}

export default {
  getCurrencies,
  getLatestRate,
  getHistoricalRates,
  formatHistoryForChart,
  currencyNames,
  popularCurrencies
};
