import { Router } from 'express';
import { StatsController } from './stats.controller';

const router = Router();
const controller = new StatsController();

router.get('/daily', controller.getDailyStats.bind(controller));

router.get('/streak', controller.getStreak.bind(controller));

router.get('/weekly', controller.getWeeklySummary.bind(controller));

router.get('/monthly', controller.getMonthlySummary.bind(controller));

export default router;
