import { taskRepository, GetTasksOptions } from './task.repository';
import { cacheService } from '@/shared/services/cache.service';
import { queueService } from '@/shared/queues/queue.service';
import { NotFoundError } from '@/shared/utils/errors';
import { taskCreated, taskCompleted } from '@/shared/utils/metrics';
import { Priority } from '@prisma/client';

export class TaskService {
  async getTasks(options: GetTasksOptions) {
    const cacheKey = `tasks:${JSON.stringify(options)}`;

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await taskRepository.findMany(options);

    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  async getNextTask() {
    const cacheKey = 'tasks:next';

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const task = await taskRepository.findNextTask();

    if (task) {
      await cacheService.set(cacheKey, task, 300);
    }

    return task;
  }

  async getTaskById(id: string) {
    const task = await taskRepository.findById(id);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  async createTask(data: {
    title: string;
    dueDate?: string;
    priority?: Priority;
  }) {
    const task = await taskRepository.create({
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      priority: data.priority,
    });

    await this.invalidateCaches();

    taskCreated.inc({ priority: task.priority });

    return task;
  }

  async updateTask(id: string, data: any) {
    await this.getTaskById(id);

    await taskRepository.update(id, data);

    await this.invalidateCaches();

    return this.getTaskById(id);
  }

  async deleteTask(id: string) {
    await this.getTaskById(id);

    await taskRepository.delete(id);

    await this.invalidateCaches();
  }

  async completeTask(id: string) {
    const task = await this.getTaskById(id);

    if (task.status === 'COMPLETED') {
      return task;
    }

    await taskRepository.complete(id);

    await queueService.addAnalyticsJob({
      type: 'task-completed',
      data: { taskId: id },
    });

    await queueService.addAnalyticsJob({
      type: 'update-streak',
    });

    await this.invalidateCaches();

    taskCompleted.inc();

    return this.getTaskById(id);
  }

  async getCompletedToday() {
    const cacheKey = 'tasks:completed-today';

    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const tasks = await taskRepository.getCompletedToday();

    await cacheService.set(cacheKey, tasks, 300);

    return tasks;
  }

  async getOverdueTasks() {
    return taskRepository.getOverdue();
  }

  private async invalidateCaches() {
    await cacheService.invalidatePattern('tasks:*');
  }
}

export const taskService = new TaskService();
