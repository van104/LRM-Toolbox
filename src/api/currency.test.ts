import { describe, it, expect, vi } from 'vitest';
import {
  formatHistoryForChart,
  getCurrencies,
  currencyNames,
  type HistoricalRatesResponse
} from './currency';

// Mock fetch globally
global.fetch = vi.fn();

describe('Currency API', () => {
  describe('formatHistoryForChart', () => {
    it('should format historical rates correctly', () => {
      const mockData: HistoricalRatesResponse = {
        amount: 1,
        base: 'USD',
        start_date: '2023-01-01',
        end_date: '2023-01-02',
        rates: {
          '2023-01-01': { CNY: 7.1 },
          '2023-01-02': { CNY: 7.2 }
        }
      };

      const result = formatHistoryForChart(mockData, 'CNY');

      expect(result.labels).toEqual(['1/1', '1/2']);
      expect(result.values).toEqual([7.1, 7.2]);
    });

    it('should handle empty rates', () => {
      const mockData: HistoricalRatesResponse = {
        amount: 1,
        base: 'USD',
        start_date: '2023-01-01',
        end_date: '2023-01-01',
        rates: {}
      };

      const result = formatHistoryForChart(mockData, 'CNY');

      expect(result.labels).toEqual([]);
      expect(result.values).toEqual([]);
    });
  });

  describe('getCurrencies', () => {
    it('should return currencies from API when successful', async () => {
      const mockResponse = { USD: 'United States Dollar', EUR: 'Euro' };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await getCurrencies();
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('https://api.frankfurter.app/currencies');
    });

    it('should fall back to local data when API fails', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      // Spy on console.error to suppress the error log during test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getCurrencies();

      // Should return the extensive local currency list
      expect(result).toEqual(currencyNames);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
