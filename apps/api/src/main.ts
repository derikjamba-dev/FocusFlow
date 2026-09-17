import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import 'express-async-errors';
import { app } from './app';
import { logger } from '@/shared/utils/logger';
import { prisma } from '@/shared/database/prisma';
import { redis } from '@/shared/database/redis';
import { startWorkers } from '@/shared/queues/queue.service';

const PORT = process.env.API_PORT || 4000;

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected');

    // Start background workers
    startWorkers();
    logger.info('✅ Background workers started');

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 API server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        // Close database connections
        await prisma.$disconnect();
        logger.info('Database disconnected');
        
        await redis.quit();
        logger.info('Redis disconnected');
        
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
