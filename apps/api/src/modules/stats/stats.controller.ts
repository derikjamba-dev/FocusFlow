import { Request, Response, NextFunction } from 'express';
import { StatsService } from './stats.service';

const statsService = new StatsService();

export class StatsController {
  async getDailyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;

      const stats = await statsService.getDailyStats(
        date as string | undefined
      );

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getStreak(req: Request, res: Response, next: NextFunction) {
    try {
      const streak = await statsService.getStreak();

      res.json({ streak });
    } catch (error) {
      next(error);
    }
  }

  async getWeeklySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await statsService.getWeeklySummary();

      res.json(summary);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;

      const summary = await statsService.getMonthlySummary(
        year ? Number(year) : undefined,
        month ? Number(month) : undefined
      );

      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}
