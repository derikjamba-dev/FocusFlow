import { prisma } from '@/shared/database/prisma';
import { redis } from '@/shared/database/redis';
import { NotFoundError, BadRequestError } from '@/shared/utils/errors';

interface GetSessionsOptions {
  page: number;
  limit: number;
  taskId?: string;
}

export class SessionService {
  async startSession(taskId?: string) {
    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { id: taskId },
      });

      if (!task) {
        throw new NotFoundError('Task not found');
      }

      if (task.status !== 'ACTIVE') {
        throw new BadRequestError('Cannot start session on completed task');
      }
    }

    const activeSession = await prisma.focusSession.findFirst({
      where: {
        endedAt: null,
      },
    });

    if (activeSession) {
      throw new BadRequestError('An active session already exists');
    }

    const session = await prisma.focusSession.create({
      data: {
        taskId,
        startedAt: new Date(),
        duration: 0,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
      },
    });

    await redis.del('sessions');

    return session;
  }

  async completeSession(sessionId: string) {
    const session = await prisma.focusSession.findFirst({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.endedAt) {
      throw new BadRequestError('Session already completed');
    }

    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - session.startedAt.getTime()) / 1000
    );

    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        endedAt: now,
        duration,
        completed: true,
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
      },
    });

    if (session.taskId) {
      await prisma.task.update({
        where: { id: session.taskId },
        data: {
          focusSessionsCount: { increment: 1 },
        },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    await prisma.dailyStat.upsert({
      where: {
        date: new Date(today),
      },
      update: {
        focusSessions: { increment: 1 },
        focusMinutes: { increment: Math.floor(duration / 60) },
      },
      create: {
        date: new Date(today),
        focusSessions: 1,
        focusMinutes: Math.floor(duration / 60),
        tasksCompleted: 0,
        streakCount: 0,
      },
    });

    await redis.del('sessions');
    await redis.del(`stats:${today}`);

    return updatedSession;
  }

  async getSessions(options: GetSessionsOptions) {
    const { page, limit, taskId } = options;
    const skip = (page - 1) * limit;

    const cacheKey = `sessions:${JSON.stringify(options)}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const [sessions, total] = await Promise.all([
      prisma.focusSession.findMany({
        where: {
          ...(taskId && { taskId }),
        },
        skip,
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          task: {
            select: {
              id: true,
              title: true,
              priority: true,
            },
          },
        },
      }),
      prisma.focusSession.count({
        where: {
          ...(taskId && { taskId }),
        },
      }),
    ]);

    const result = {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await redis.setex(cacheKey, 60, JSON.stringify(result));

    return result;
  }

  async getSessionById(sessionId: string) {
    const session = await prisma.focusSession.findFirst({
      where: { id: sessionId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    return session;
  }
}
