import { Router } from 'express';
import { CacheController } from '../controllers/cache.controller.js';
import { CacheService } from '../services/cache.service.js';

export function createCacheRoutes(cacheService: CacheService): Router {
  const router = Router();
  const cacheController = new CacheController(cacheService);

  router.delete('/', (req, res) => {
    cacheController.clearCache(req, res);
  });

  router.get('/status', (req, res) => {
    cacheController.getCacheStatus(req, res);
  });

  return router;
}

