import { redis } from '../database/redis';
import { logger } from '../utils/logger';

export class CacheService {
  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await redis.setex(key, ttl, serialized);
      } else {
        await redis.set(key, serialized);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Delete key(s) from cache
   */
  async del(key: string | string[]): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Invalidate all keys matching pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await redis.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire error:', error);
    }
  }

  /**
   * Increment counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
