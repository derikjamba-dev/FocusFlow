import morgan from 'morgan';
import { logger, logStream } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

// Custom tokens
morgan.token('user-id', (req: any) => req.user?.id || 'anonymous');
morgan.token('body', (req) => JSON.stringify(req.body));

export const requestLogger = morgan(
  ':method :url :status :response-time ms - :user-id',
  {
    stream: logStream,
    skip: (req) => req.url === '/health' || req.url === '/metrics',
  }
);

// Detailed error logging middleware
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next(err);
}
