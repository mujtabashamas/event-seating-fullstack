import type { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../services/metrics.service.js';

const metricsService = MetricsService.getInstance();

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  // Capture the original res.json to track response
  const originalJson = res.json.bind(res);
  
  res.json = function (body: unknown) {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();

    // Record metrics
    metricsService.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    metricsService.httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      duration
    );

    // Track errors (4xx and 5xx)
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      metricsService.httpRequestErrors.inc({
        method,
        route,
        error_type: errorType,
      });
    }

    return originalJson(body);
  };

  next();
}

