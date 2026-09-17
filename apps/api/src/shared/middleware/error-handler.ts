import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    userId: (req as any).user?.id,
    ip: req.ip,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err instanceof AppError && 'errors' in err && { details: err.errors }),
    });
  }

  // Handle Prisma errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: 'Resource already exists',
        field: prismaError.meta?.target?.[0],
      });
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: 'Resource not found',
      });
    }
  }

  // Handle unexpected errors
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      error: 'Internal server error',
    });
  } else {
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  }
}
