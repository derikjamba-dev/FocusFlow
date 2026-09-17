import { prisma } from '@/shared/database/prisma';
import { redis } from '@/shared/database/redis';

export class StatsService {
  async getDailyStats(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    const cacheKey = `stats:${dateStr}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const stats = await prisma.dailyStat.upsert({
      where: {
        date: new Date(dateStr),
      },
      update: {},
      create: {
        date: new Date(dateStr),
        tasksCompleted: 0,
        focusSessions: 0,
        focusMinutes: 0,
        streakCount: 0,
      },
    });

    await redis.setex(cacheKey, 300, JSON.stringify(stats));

    return stats;
  }

  async getStreak(): Promise<number> {
    const cacheKey = 'stats:streak';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return Number(cached);
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];

      const stats = await prisma.dailyStat.findUnique({
        where: {
          date: new Date(dateStr),
        },
      });

      if (stats && stats.tasksCompleted > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }

      if (streak > 365) break;
    }

    await redis.setex(cacheKey, 3600, String(streak));

    if (streak > 0) {
      const todayStr = today.toISOString().split('T')[0];
      await prisma.dailyStat.updateMany({
        where: {
          date: new Date(todayStr),
        },
        data: {
          streakCount: streak,
        },
      });
    }

    return streak;
  }

  async getWeeklySummary() {
    const cacheKey = 'stats:weekly';
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats = await prisma.dailyStat.findMany({
      where: {
        date: {
          gte: weekAgo,
          lte: today,
        },
      },
      orderBy: { date: 'desc' },
    });

    const summary = {
      totalTasksCompleted: stats.reduce((sum, s) => sum + s.tasksCompleted, 0),
      totalFocusSessions: stats.reduce((sum, s) => sum + s.focusSessions, 0),
      totalFocusMinutes: stats.reduce((sum, s) => sum + s.focusMinutes, 0),
      averageTasksPerDay: stats.length > 0
        ? Math.round(stats.reduce((sum, s) => sum + s.tasksCompleted, 0) / stats.length)
        : 0,
      averageFocusMinutesPerDay: stats.length > 0
        ? Math.round(stats.reduce((sum, s) => sum + s.focusMinutes, 0) / stats.length)
        : 0,
      dailyBreakdown: stats,
    };

    await redis.setex(cacheKey, 600, JSON.stringify(summary));

    return summary;
  }

  async getMonthlySummary(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const cacheKey = `stats:monthly:${targetYear}-${targetMonth}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const stats = await prisma.dailyStat.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    const summary = {
      year: targetYear,
      month: targetMonth,
      totalTasksCompleted: stats.reduce((sum, s) => sum + s.tasksCompleted, 0),
      totalFocusSessions: stats.reduce((sum, s) => sum + s.focusSessions, 0),
      totalFocusMinutes: stats.reduce((sum, s) => sum + s.focusMinutes, 0),
      totalFocusHours: Math.round(
        stats.reduce((sum, s) => sum + s.focusMinutes, 0) / 60
      ),
      averageTasksPerDay: stats.length > 0
        ? Math.round(stats.reduce((sum, s) => sum + s.tasksCompleted, 0) / stats.length)
        : 0,
      productiveDays: stats.filter(s => s.tasksCompleted > 0).length,
      dailyBreakdown: stats,
    };

    await redis.setex(cacheKey, 3600, JSON.stringify(summary));

    return summary;
  }

  async updateDailyStats(date: Date, updates: {
    tasksCompleted?: number;
    focusSessions?: number;
    focusMinutes?: number;
  }) {
    const dateStr = date.toISOString().split('T')[0];

    await prisma.dailyStat.upsert({
      where: {
        date: new Date(dateStr),
      },
      update: updates,
      create: {
        date: new Date(dateStr),
        tasksCompleted: updates.tasksCompleted || 0,
        focusSessions: updates.focusSessions || 0,
        focusMinutes: updates.focusMinutes || 0,
        streakCount: 0,
      },
    });

    await redis.del(`stats:${dateStr}`);
    await redis.del('stats:streak');
    await redis.del('stats:weekly');
  }
}
