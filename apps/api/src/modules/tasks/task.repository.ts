import { prisma } from '@/shared/database/prisma';
import { Priority, TaskStatus } from '@prisma/client';

export interface GetTasksOptions {
  page: number;
  limit: number;
  status?: TaskStatus;
  priority?: Priority;
  sortBy?: string;
}

export class TaskRepository {
  async findNextTask() {
    const today = new Date().toISOString().split('T')[0];

    const task = await prisma.$queryRaw<any[]>`
      SELECT * FROM tasks
      WHERE status = 'ACTIVE'
      ORDER BY
        CASE
          WHEN due_date IS NOT NULL AND due_date < ${today} THEN 0
          ELSE 1
        END,
        CASE priority
          WHEN 'HIGH' THEN 0
          WHEN 'MEDIUM' THEN 1
          WHEN 'LOW' THEN 2
        END,
        CASE
          WHEN due_date IS NOT NULL THEN due_date
          ELSE '9999-12-31'
        END,
        created_at ASC
      LIMIT 1
    `;

    return task[0] || null;
  }

  async findMany(options: GetTasksOptions) {
    const { page, limit, status, priority, sortBy = 'createdAt' } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      hasMore: total > skip + limit,
    };
  }

  async findById(id: string) {
    return prisma.task.findFirst({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    dueDate?: Date;
    priority?: Priority;
  }) {
    return prisma.task.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.task.updateMany({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.task.updateMany({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async complete(id: string) {
    return prisma.task.updateMany({
      where: { id, status: 'ACTIVE' },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  async incrementSessionCount(id: string) {
    return prisma.task.update({
      where: { id },
      data: {
        focusSessionsCount: { increment: 1 },
      },
    });
  }

  async getCompletedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.task.findMany({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: today,
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getOverdue() {
    const today = new Date().toISOString().split('T')[0];

    return prisma.task.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: {
          lt: today,
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}

export const taskRepository = new TaskRepository();
