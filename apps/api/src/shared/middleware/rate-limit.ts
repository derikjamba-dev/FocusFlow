import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../database/redis';

export const createRateLimiter = (options: {
  max: number;
  windowMs: number;
  keyPrefix?: string;
  message?: string;
}) => {
  const sendCommand = (...args: string[]): Promise<string> =>
    redis.call(...args) as Promise<string>;

  return rateLimit({
    store: new RedisStore({
      sendCommand,
      prefix: options.keyPrefix || 'rl:',
    }),
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: options.message || 'Too many requests, please try again later.' },
    skipSuccessfulRequests: false,
  });
};

export const apiRateLimit = createRateLimiter({
  max: 100,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'rl:api:',
});

export const premiumRateLimit = createRateLimiter({
  max: 500,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'rl:premium:',
});

export const taskCreationLimit = createRateLimiter({
  max: 30,
  windowMs: 60 * 1000, // 1 minute
  keyPrefix: 'rl:task:create:',
  message: 'Too many tasks created, please slow down.',
});
