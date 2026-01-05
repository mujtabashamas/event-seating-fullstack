import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller.js';
import { CacheService } from '../services/cache.service.js';

export function createCacheRoutes(cacheService: CacheService): Router {
  const router = Router();
  const cacheController = new CacheController(cacheService);

  // GET /api/v1/cache/status - Get cache statistics
  router.get('/status', (req, res) => {
    cacheController.getCacheStatus(req, res);
  });

  // DELETE /api/v1/cache - Clear all cache
  router.delete('/', (req, res) => {
    cacheController.clearCache(req, res);
  });

  return router;
}

