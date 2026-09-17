import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });

// ============================================
// QUEUES
// ============================================
export const emailQueue = new Queue('email', { connection });
export const analyticsQueue = new Queue('analytics', { connection });
export const notificationQueue = new Queue('notification', { connection });

// ============================================
// WORKER MANAGEMENT
// ============================================
let emailWorker: Worker | null = null;
let analyticsWorker: Worker | null = null;
let notificationWorker: Worker | null = null;

export function startWorkers(): void {
  if (emailWorker || analyticsWorker || notificationWorker) {
    logger.warn('Workers already started');
    return;
  }

  emailWorker = new Worker(
    'email',
    async (job) => {
      const { to, subject, template, data } = job.data;
      logger.info('Processing email job', { to, subject });
      logger.info('Email sent successfully', { to });
    },
    { connection }
  );

  emailWorker.on('completed', (job) => {
    logger.info('Email job completed', { jobId: job.id });
  });

  emailWorker.on('failed', (job, err) => {
    logger.error('Email job failed', { jobId: job?.id, error: err.message });
  });

  analyticsWorker = new Worker(
    'analytics',
    async (job) => {
      const { type, data } = job.data;
      logger.info('Processing analytics job', { type });

      switch (type) {
        case 'task-completed':
          await updateDailyStats('task');
          break;
        case 'session-completed':
          await updateDailyStats('session', data.duration);
          break;
        case 'update-streak':
          await calculateStreak();
          break;
      }

      logger.info('Analytics job completed', { type });
    },
    { connection }
  );

  analyticsWorker.on('failed', (job, err) => {
    logger.error('Analytics job failed', { jobId: job?.id, error: err.message });
  });

  notificationWorker = new Worker(
    'notification',
    async (job) => {
      const { type, data } = job.data;
      logger.info('Processing notification job', { type });
      logger.info('Notification sent', { type });
    },
    { connection }
  );

  logger.info('All workers started');
}

export async function stopWorkers(): Promise<void> {
  const toClose = [emailWorker, analyticsWorker, notificationWorker].filter(Boolean);
  await Promise.all(toClose.map((w) => w!.close()));
  emailWorker = null;
  analyticsWorker = null;
  notificationWorker = null;
  logger.info('All workers stopped');
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updateDailyStats(type: 'task' | 'session', duration?: number) {
  const { prisma } = await import('../database/prisma');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStat.upsert({
    where: {
      date: today,
    },
    update: {
      tasksCompleted: type === 'task' ? { increment: 1 } : undefined,
      focusSessions: type === 'session' ? { increment: 1 } : undefined,
      focusMinutes: type === 'session' && duration
        ? { increment: Math.floor(duration / 60) }
        : undefined,
    },
    create: {
      date: today,
      tasksCompleted: type === 'task' ? 1 : 0,
      focusSessions: type === 'session' ? 1 : 0,
      focusMinutes: type === 'session' && duration ? Math.floor(duration / 60) : 0,
      streakCount: 0,
    },
  });

  const { redis } = await import('../database/redis');
  const dateStr = new Date().toISOString().split('T')[0];
  await redis.del(`stats:${dateStr}`);
  await redis.del('stats:streak');
  await redis.del('stats:weekly');
}

async function calculateStreak() {
  const { prisma } = await import('../database/prisma');

  const stats = await prisma.dailyStat.findMany({
    orderBy: { date: 'desc' },
    take: 365,
  });

  if (stats.length === 0) return;

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < stats.length; i++) {
    const statDate = new Date(stats[i].date);
    statDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (statDate.getTime() !== expectedDate.getTime()) {
      break;
    }

    if (stats[i].tasksCompleted > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  const todayStat = stats[0];
  if (todayStat && new Date(todayStat.date).getTime() === today.getTime()) {
    await prisma.dailyStat.update({
      where: { id: todayStat.id },
      data: { streakCount: currentStreak },
    });
  }
}

// ============================================
// QUEUE SERVICE
// ============================================
export class QueueService {
  async addEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    data: any;
  }) {
    await emailQueue.add('send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async addAnalyticsJob(data: {
    type: string;
    data?: any;
  }) {
    await analyticsQueue.add('analytics-event', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addNotificationJob(data: {
    type: string;
    data: any;
  }) {
    await notificationQueue.add('send-notification', data, {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    });
  }
}

export const queueService = new QueueService();
