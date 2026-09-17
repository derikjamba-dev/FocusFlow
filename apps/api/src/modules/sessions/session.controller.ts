import { Request, Response, NextFunction } from 'express';
import { SessionService } from './session.service';
import { focusSessionStarted, focusSessionCompleted } from '@/shared/utils/metrics';

const sessionService = new SessionService();

export class SessionController {
  async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.body;

      const session = await sessionService.startSession(taskId);

      focusSessionStarted.inc();

      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }

  async completeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const session = await sessionService.completeSession(id);

      focusSessionCompleted.inc();

      res.json(session);
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, taskId } = req.query;

      const result = await sessionService.getSessions({
        page: Number(page),
        limit: Math.min(Number(limit), 100),
        taskId: taskId as string | undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSessionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const session = await sessionService.getSessionById(id);

      res.json(session);
    } catch (error) {
      next(error);
    }
  }
}
