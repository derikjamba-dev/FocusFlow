import { apiClient } from './client';

export const statsApi = {
  daily: async (date?: string) => {
    const res = await apiClient.get('/stats/daily', { params: date ? { date } : undefined });
    return res.data;
  },
  streak: async () => {
    const res = await apiClient.get('/stats/streak');
    return res.data;
  },
  weekly: async () => {
    const res = await apiClient.get('/stats/weekly');
    return res.data;
  },
  monthly: async (year?: number, month?: number) => {
    const res = await apiClient.get('/stats/monthly', { params: { year, month } });
    return res.data;
  },
};
