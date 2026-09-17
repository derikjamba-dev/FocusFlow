import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from '@/shared/utils/logger';
import { requestLogger } from '@/shared/middleware/request-logger';
import { errorHandler } from '@/shared/middleware/error-handler';
import { notFoundHandler } from '@/shared/middleware/not-found';
import { metricsMiddleware } from '@/shared/utils/metrics';
import { register } from '@/shared/utils/metrics';

// Import routes
import taskRoutes from '@/modules/tasks/task.routes';
import sessionRoutes from '@/modules/sessions/session.routes';
import statsRoutes from '@/modules/stats/stats.routes';

export const app: Application = express();

// ── CORS — must be FIRST, before helmet and everything else ──────────────────
const corsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Handles OPTIONS preflight for all routes (fallback)
app.options('*', cors(corsOptions));

// Ensure CORS headers on every response including errors (fallback)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && !res.headersSent) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS' && !res.headersSent) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.sendStatus(200);
  }
  next();
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

// ============================================
// BODY PARSING
// ============================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// LOGGING
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// ============================================
// METRICS
// ============================================
app.use(metricsMiddleware);

// ============================================
// HEALTH CHECKS
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

app.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const { prisma } = await import('@/shared/database/prisma');
    const { redis } = await import('@/shared/database/redis');
    
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    
    res.json({ 
      status: 'ready',
      checks: {
        database: 'ok',
        cache: 'ok',
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============================================
// API ROUTES
// ============================================
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/tasks`, taskRoutes);
app.use(`${API_PREFIX}/sessions`, sessionRoutes);
app.use(`${API_PREFIX}/stats`, statsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'FocusFlow API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: API_PREFIX,
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
