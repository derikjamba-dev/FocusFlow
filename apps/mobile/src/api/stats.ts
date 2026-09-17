import { apiClient } from './client';

export interface DailyStat {
  id: string;
  date: string;
  tasksCompleted: number;
  focusSessions: number;
  focusMinutes: number;
  streakCount: number;
}

export interface WeeklySummary {
  totalTasksCompleted: number;
  totalFocusSessions: number;
  totalFocusMinutes: number;
  averageTasksPerDay: number;
  averageFocusMinutesPerDay: number;
  dailyBreakdown: DailyStat[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalTasksCompleted: number;
  totalFocusSessions: number;
  totalFocusMinutes: number;
  totalFocusHours: number;
  averageTasksPerDay: number;
  productiveDays: number;
  dailyBreakdown: DailyStat[];
}

export async function getDailyStats(date?: string): Promise<DailyStat> {
  const res = await apiClient.get<DailyStat>('/stats/daily', { params: date ? { date } : {} });
  return res.data;
}

export async function getStreak(): Promise<{ streak: number }> {
  const res = await apiClient.get<{ streak: number }>('/stats/streak');
  return res.data;
}

export async function getWeeklyStats(): Promise<WeeklySummary> {
  const res = await apiClient.get<WeeklySummary>('/stats/weekly');
  return res.data;
}

export async function getMonthlyStats(
  year?: number,
  month?: number,
): Promise<MonthlySummary> {
  const res = await apiClient.get<MonthlySummary>('/stats/monthly', {
    params: { year, month },
  });
  return res.data;
}