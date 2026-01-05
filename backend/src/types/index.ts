export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  averageResponseTime: number;
  totalRequests: number;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
}

