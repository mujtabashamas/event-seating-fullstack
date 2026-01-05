import type { Request, Response, NextFunction } from 'express';
import { RateLimiter } from './rateLimiter.js';
import { appConfig } from '../config/app.js';

// Initialize rate limiter with config values
const rateLimiter = new RateLimiter(
  appConfig.rateLimit.maxRequestsPerMinute,
  appConfig.rateLimit.burstCapacity,
  appConfig.rateLimit.burstWindowSeconds
);

// Cleanup rate limiter periodically
setInterval(() => {
  rateLimiter.cleanup();
}, appConfig.rateLimit.cleanupIntervalMs);

export function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Use IP address as identifier (in production, consider using user ID or API key)
  const identifier = req.ip || req.socket.remoteAddress || 'unknown';
  const result = rateLimiter.checkLimit(identifier);

  if (!result.allowed) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${appConfig.rateLimit.maxRequestsPerMinute} requests per minute allowed, with a burst capacity of ${appConfig.rateLimit.burstCapacity} requests in ${appConfig.rateLimit.burstWindowSeconds} seconds`,
      resetTime: new Date(result.info.resetTime).toISOString(),
    });
    return;
  }

  // Add rate limit headers
  res.setHeader('X-RateLimit-Remaining', result.info.remaining.toString());
  res.setHeader('X-RateLimit-Reset', new Date(result.info.resetTime).toISOString());

  next();
}

