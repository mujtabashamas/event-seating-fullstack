import { Router, type Request, type Response } from 'express';
import { CacheService } from '../services/cache.service.js';
import { appConfig } from '../config/app.js';

export function createHealthRoutes(cacheService: CacheService): Router {
  const router = Router();

  // Basic health check
  router.get('/', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Detailed health check with service status
  router.get('/detailed', (_req: Request, res: Response) => {
    const cacheStats = cacheService.getStats();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: appConfig.apiVersion,
      services: {
        cache: {
          status: 'operational',
          stats: {
            size: cacheStats.size,
            hits: cacheStats.hits,
            misses: cacheStats.misses,
            hitRate: cacheStats.totalRequests > 0 
              ? ((cacheStats.hits / cacheStats.totalRequests) * 100).toFixed(2) + '%'
              : '0%',
          },
        },
        database: {
          status: 'operational',
          type: 'in-memory',
        },
      },
      memory: {
        used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  });

  return router;
}

