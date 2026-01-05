import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  private static instance: MetricsService;

  // HTTP Metrics
  public httpRequestsTotal: Counter<string>;
  public httpRequestDuration: Histogram<string>;
  public httpRequestErrors: Counter<string>;

  // Cache Metrics
  public cacheHitsTotal: Counter<string>;
  public cacheMissesTotal: Counter<string>;
  public cacheSize: Gauge<string>;
  public cacheOperationDuration: Histogram<string>;

  // Database Metrics
  public databaseQueryDuration: Histogram<string>;
  public databaseErrors: Counter<string>;

  // Rate Limit Metrics
  public rateLimitExceeded: Counter<string>;

  // Queue Metrics
  public queueLength: Gauge<string>;
  public queueProcessingTime: Histogram<string>;

  private constructor() {
    // Collect default metrics (CPU, memory, etc.)
    collectDefaultMetrics({ register });

    // HTTP Request Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [register],
    });

    this.httpRequestErrors = new Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'error_type'],
      registers: [register],
    });

    // Cache Metrics
    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      registers: [register],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      registers: [register],
    });

    this.cacheSize = new Gauge({
      name: 'cache_size',
      help: 'Current number of items in cache',
      registers: [register],
    });

    this.cacheOperationDuration = new Histogram({
      name: 'cache_operation_duration_ms',
      help: 'Duration of cache operations in milliseconds',
      labelNames: ['operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 25, 50, 100],
      registers: [register],
    });

    // Database Metrics
    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_ms',
      help: 'Duration of database queries in milliseconds',
      labelNames: ['operation'],
      buckets: [10, 25, 50, 100, 250, 500, 1000, 2500],
      registers: [register],
    });

    this.databaseErrors = new Counter({
      name: 'database_errors_total',
      help: 'Total number of database errors',
      labelNames: ['operation'],
      registers: [register],
    });

    // Rate Limit Metrics
    this.rateLimitExceeded = new Counter({
      name: 'rate_limit_exceeded_total',
      help: 'Total number of rate limit exceeded errors',
      labelNames: ['endpoint'],
      registers: [register],
    });

    // Queue Metrics
    this.queueLength = new Gauge({
      name: 'queue_length',
      help: 'Current length of the async queue',
      registers: [register],
    });

    this.queueProcessingTime = new Histogram({
      name: 'queue_processing_time_ms',
      help: 'Time spent processing queue items in milliseconds',
      buckets: [10, 25, 50, 100, 250, 500, 1000],
      registers: [register],
    });
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public getRegister() {
    return register;
  }

  public async getMetrics(): Promise<string> {
    return register.metrics();
  }

  public resetMetrics(): void {
    register.resetMetrics();
  }
}

