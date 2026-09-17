import Redis from 'ioredis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('ready', () => {
  logger.info('Redis client ready');
});

redis.on('error', (err) => {
  logger.error('Redis client error:', err);
});

redis.on('close', () => {
  logger.warn('Redis client connection closed');
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
});

// Connect to Redis
redis.connect().catch((err) => {
  logger.error('Failed to connect to Redis:', err);
});
