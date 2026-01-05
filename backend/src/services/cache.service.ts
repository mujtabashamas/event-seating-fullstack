import type { CacheEntry, CacheStats, User } from '../types/index.js';
import { appConfig } from '../config/app.js';
import { MetricsService } from './metrics.service.js';

export class CacheService {
  private cache: Map<number, CacheEntry<User>>;
  private stats: CacheStats;
  private ttl: number; // TTL in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metricsService: MetricsService;

  constructor(ttlSeconds: number = 60) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      averageResponseTime: 0,
      totalRequests: 0,
    };
    this.metricsService = MetricsService.getInstance();

    // Start background cleanup task
    this.startCleanup();
  }

  get(key: number): User | null {
    const start = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      this.incrementMiss();
      this.metricsService.cacheOperationDuration.observe(
        { operation: 'get' },
        Date.now() - start
      );
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.updateSize();
      this.incrementMiss();
      this.metricsService.cacheOperationDuration.observe(
        { operation: 'get' },
        Date.now() - start
      );
      return null;
    }

    // Move to end (most recently used) - LRU behavior
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.incrementHit();
    this.metricsService.cacheOperationDuration.observe(
      { operation: 'get' },
      Date.now() - start
    );
    return entry.data;
  }

  private incrementHit(): void {
    this.stats.hits++;
    this.stats.totalRequests++;
    this.metricsService.cacheHitsTotal.inc();
  }

  private incrementMiss(): void {
    this.stats.misses++;
    this.stats.totalRequests++;
    this.metricsService.cacheMissesTotal.inc();
  }

  set(key: number, value: User): void {
    const start = Date.now();
    const now = Date.now();
    const entry: CacheEntry<User> = {
      data: value,
      timestamp: now,
      ttl: this.ttl,
    };

    // Only set if not already cached (as per requirement)
    if (!this.cache.has(key)) {
      this.cache.set(key, entry);
      this.updateSize();
    }

    this.metricsService.cacheOperationDuration.observe(
      { operation: 'set' },
      Date.now() - start
    );
  }

  clear(): void {
    this.cache.clear();
    this.updateSize();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  getSize(): number {
    return this.cache.size;
  }

  updateAverageResponseTime(responseTime: number): void {
    const totalRequests = this.stats.totalRequests;
    const currentAverage = this.stats.averageResponseTime;
    
    // Calculate new average: (oldAverage * (n-1) + newValue) / n
    this.stats.averageResponseTime = totalRequests === 1
      ? responseTime
      : (currentAverage * (totalRequests - 1) + responseTime) / totalRequests;
  }

  private updateSize(): void {
    this.stats.size = this.cache.size;
    this.metricsService.cacheSize.set(this.cache.size);
  }

  private startCleanup(): void {
    // Run cleanup at configured interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleEntries();
    }, appConfig.cache.cleanupIntervalMs);
  }

  private cleanupStaleEntries(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.updateSize();
    }
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

