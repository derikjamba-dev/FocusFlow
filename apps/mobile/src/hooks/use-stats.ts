import { useQuery } from '@tanstack/react-query';
import { getDailyStats, getMonthlyStats, getStreak, getWeeklyStats } from '../api/stats';

export function useDailyStats(date?: string) {
  return useQuery({
    queryKey: ['stats', 'daily', date],
    queryFn: () => getDailyStats(date),
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['stats', 'streak'],
    queryFn: () => getStreak(),
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: () => getWeeklyStats(),
  });
}

export function useMonthlyStats(year?: number, month?: number) {
  return useQuery({
    queryKey: ['stats', 'monthly', year, month],
    queryFn: () => getMonthlyStats(year, month),
  });
}