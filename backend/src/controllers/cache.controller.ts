import type { Request, Response } from 'express';
import { CacheService } from '../services/cache.service.js';

export class CacheController {
  constructor(private cacheService: CacheService) {}

  clearCache(_req: Request, res: Response): void {
    this.cacheService.clear();
    res.json({ message: 'Cache cleared successfully' });
  }

  getCacheStatus(_req: Request, res: Response): void {
    const stats = this.cacheService.getStats();
    res.json({
      size: stats.size,
      hits: stats.hits,
      misses: stats.misses,
      hitRate:
        stats.totalRequests > 0
          ? (stats.hits / stats.totalRequests) * 100
          : 0,
      averageResponseTime: stats.averageResponseTime,
    });
  }
}

