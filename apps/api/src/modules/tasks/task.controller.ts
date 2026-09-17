import { Request, Response } from 'express';
import { taskService } from './task.service';

export class TaskController {
  async getTasks(req: Request, res: Response) {
    const { page = 1, limit = 20, status, priority, sortBy = 'createdAt' } = req.query;

    const result = await taskService.getTasks({
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      status: status as any,
      priority: priority as any,
      sortBy: sortBy as string,
    });

    res.json({
      data: result.tasks,
      meta: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(result.total / Number(limit)),
        hasMore: result.hasMore,
      },
    });
  }

  async getNextTask(req: Request, res: Response) {
    const task = await taskService.getNextTask();

    res.json({
      data: task,
    });
  }

  async getCompletedToday(req: Request, res: Response) {
    const tasks = await taskService.getCompletedToday();

    res.json({
      data: tasks,
    });
  }

  async getOverdue(req: Request, res: Response) {
    const tasks = await taskService.getOverdueTasks();

    res.json({
      data: tasks,
    });
  }

  async getTask(req: Request, res: Response) {
    const task = await taskService.getTaskById(req.params.id);

    res.json({
      data: task,
    });
  }

  async createTask(req: Request, res: Response) {
    const task = await taskService.createTask(req.body);

    res.status(201).json({
      message: 'Task created successfully',
      data: task,
    });
  }

  async updateTask(req: Request, res: Response) {
    const task = await taskService.updateTask(req.params.id, req.body);

    res.json({
      message: 'Task updated successfully',
      data: task,
    });
  }

  async deleteTask(req: Request, res: Response) {
    await taskService.deleteTask(req.params.id);

    res.json({
      message: 'Task deleted successfully',
    });
  }

  async completeTask(req: Request, res: Response) {
    const task = await taskService.completeTask(req.params.id);

    res.json({
      message: 'Task completed successfully',
      data: task,
    });
  }
}

export const taskController = new TaskController();
