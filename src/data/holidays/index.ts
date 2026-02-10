import yearsList from './available_years.json';

export interface Holiday {
  year: string;
  name: string;
  range: string;
  length: number;
  adjustments: string[];
  tip: string;
}

export interface NextHoliday {
  name: string;
  daysLeft: number | string;
  range: string;
  length: number;
}

const cache = new Map<string, Holiday[]>();

export const availableYears: string[] = yearsList;

export async function loadHolidays(year: string): Promise<Holiday[]> {
  if (cache.has(year)) return cache.get(year)!;
  try {
    // Dynamic import needs to be specific enough for Vite to bundle
    // Using raw dynamic import varies by bundler.
    // Using explicit map is safer if glob is tricky in strict mode.
    // But for now let's try standard import()
    const mod = await import(`./${year}.json`);
    const data = mod.default || mod;
    cache.set(year, data);
    return data;
  } catch (e) {
    console.error('Failed to load holidays for year', year, e);
    return [];
  }
}

export async function getNextHoliday(): Promise<NextHoliday> {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Check current year and next year
  const yearsToCheck = [currentYear.toString(), (currentYear + 1).toString()].filter(y =>
    availableYears.includes(y)
  );

  let minDiff = Infinity;
  let nextHoliday: NextHoliday | null = null;

  for (const year of yearsToCheck) {
    const holidays = await loadHolidays(year);
    for (const h of holidays) {
      const startDate = parseStartDate(h.range, h.year);
      if (!startDate) continue;

      const diff = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        nextHoliday = {
          name: h.name,
          daysLeft: diff,
          range: `${h.year}年${h.range}`,
          length: h.length
        };
      }
    }
    if (nextHoliday) break;
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

function parseStartDate(range: string, year: string): Date | null {
  const match = range.match(/(\d+)月(\d+)日/);
  if (match) {
    return new Date(parseInt(year), parseInt(match[1]) - 1, parseInt(match[2]));
  }
  return null;
}
