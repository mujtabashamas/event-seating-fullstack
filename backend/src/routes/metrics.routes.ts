import { Router, type Request, type Response } from 'express';
import { MetricsService } from '../services/metrics.service.js';

export function createMetricsRoutes(): Router {
  const router = Router();
  const metricsService = MetricsService.getInstance();

  // Prometheus metrics endpoint
  router.get('/', async (_req: Request, res: Response) => {
    res.set('Content-Type', metricsService.getRegister().contentType);
    const metrics = await metricsService.getMetrics();
    res.send(metrics);
  });

  return router;
}

