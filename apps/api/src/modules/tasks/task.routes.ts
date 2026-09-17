import { Router } from 'express';
import { taskController } from './task.controller';
import { validateRequest } from '@/shared/middleware/validate';
import { apiRateLimit, taskCreationLimit } from '@/shared/middleware/rate-limit';
import { createTaskSchema, updateTaskSchema, taskIdSchema } from './task.validators';

const router = Router();

router.get(
  '/',
  apiRateLimit,
  taskController.getTasks.bind(taskController)
);

router.get(
  '/next',
  apiRateLimit,
  taskController.getNextTask.bind(taskController)
);

router.get(
  '/completed-today',
  apiRateLimit,
  taskController.getCompletedToday.bind(taskController)
);

router.get(
  '/overdue',
  apiRateLimit,
  taskController.getOverdue.bind(taskController)
);

router.get(
  '/:id',
  apiRateLimit,
  validateRequest(taskIdSchema),
  taskController.getTask.bind(taskController)
);

router.post(
  '/',
  taskCreationLimit,
  validateRequest(createTaskSchema),
  taskController.createTask.bind(taskController)
);

router.patch(
  '/:id',
  apiRateLimit,
  validateRequest(updateTaskSchema),
  taskController.updateTask.bind(taskController)
);

router.delete(
  '/:id',
  apiRateLimit,
  validateRequest(taskIdSchema),
  taskController.deleteTask.bind(taskController)
);

router.post(
  '/:id/complete',
  apiRateLimit,
  validateRequest(taskIdSchema),
  taskController.completeTask.bind(taskController)
);

export default router;
