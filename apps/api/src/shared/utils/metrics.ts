import { Request, Response, NextFunction } from 'express';
import prometheus from 'prom-client';

// Create a Registry
export const register = new prometheus.Registry();

// Add default metrics
prometheus.collectDefaultMetrics({ 
  register,
  prefix: 'focusflow_api_',
});

// Custom metrics
export const httpRequestDuration = new prometheus.Histogram({
  name: 'focusflow_api_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new prometheus.Counter({
  name: 'focusflow_api_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const activeUsers = new prometheus.Gauge({
  name: 'focusflow_api_active_users_total',
  help: 'Number of active users',
  registers: [register],
});

export const taskCreated = new prometheus.Counter({
  name: 'focusflow_api_tasks_created_total',
  help: 'Total number of tasks created',
  labelNames: ['priority'],
  registers: [register],
});

export const taskCompleted = new prometheus.Counter({
  name: 'focusflow_api_tasks_completed_total',
  help: 'Total number of tasks completed',
  registers: [register],
});

export const focusSessionStarted = new prometheus.Counter({
  name: 'focusflow_api_focus_sessions_started_total',
  help: 'Total number of focus sessions started',
  registers: [register],
});

export const focusSessionCompleted = new prometheus.Counter({
  name: 'focusflow_api_focus_sessions_completed_total',
  help: 'Total number of focus sessions completed',
  registers: [register],
});

export const databaseQueryDuration = new prometheus.Histogram({
  name: 'focusflow_api_database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

// Middleware to track HTTP metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  
  next();
}
