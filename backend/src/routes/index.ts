import { Router } from 'express';
import { CacheService } from '../services/cache.service.js';
import { QueueService } from '../services/queue.service.js';
import { createUserRoutes } from './user.routes.js';
import { createCacheRoutes } from './cache.routes.js';
import { createHealthRoutes } from './health.routes.js';
import { createMetricsRoutes } from './metrics.routes.js';
import type { User } from '../types/index.js';

export function createApiRoutes(
  cacheService: CacheService,
  queueService: QueueService<User>
): Router {
  const router = Router();

  // Prometheus metrics endpoint (no rate limiting)
  router.use('/metrics', createMetricsRoutes());

  // Health check routes
  router.use('/health', createHealthRoutes(cacheService));

  // User management routes
  router.use('/users', createUserRoutes(cacheService, queueService));

  // Cache management routes
  router.use('/cache', createCacheRoutes(cacheService));

  return router;
}

