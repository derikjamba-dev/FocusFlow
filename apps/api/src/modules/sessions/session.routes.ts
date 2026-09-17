import { Router } from 'express';
import { validateRequest } from '@/shared/middleware/validate';
import { SessionController } from './session.controller';
import { startSessionSchema, completeSessionSchema } from './session.validators';

const router = Router();
const controller = new SessionController();

router.post(
  '/',
  validateRequest(startSessionSchema),
  controller.startSession.bind(controller)
);

router.post(
  '/:id/complete',
  validateRequest(completeSessionSchema),
  controller.completeSession.bind(controller)
);

router.get('/', controller.getSessions.bind(controller));

router.get('/:id', controller.getSessionById.bind(controller));

export default router;
