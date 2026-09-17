'use client';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats';

export function useDailyStats(date?: string) {
  return useQuery({
    queryKey: ['stats', 'daily', date],
    queryFn: () => statsApi.daily(date),
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ['stats', 'streak'],
    queryFn: () => statsApi.streak(),
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ['stats', 'weekly'],
    queryFn: () => statsApi.weekly(),
  });
}

export function useMonthlyStats(year?: number, month?: number) {
  return useQuery({
    queryKey: ['stats', 'monthly', year, month],
    queryFn: () => statsApi.monthly(year, month),
  });
}
