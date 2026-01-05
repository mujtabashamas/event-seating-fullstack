import type { RateLimitInfo } from '../types/index.js';

interface RequestRecord {
  count: number;
  resetTime: number;
  burstCount: number;
  burstResetTime: number;
}

export class RateLimiter {
  private requests: Map<string, RequestRecord>;
  private maxRequestsPerMinute: number;
  private burstCapacity: number;
  private burstWindow: number; // in milliseconds

  constructor(
    maxRequestsPerMinute: number = 10,
    burstCapacity: number = 5,
    burstWindowSeconds: number = 10
  ) {
    this.requests = new Map();
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.burstCapacity = burstCapacity;
    this.burstWindow = burstWindowSeconds * 1000;
  }

  checkLimit(identifier: string): { allowed: boolean; info: RateLimitInfo } {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record) {
      // First request
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + 60000, // 1 minute
        burstCount: 1,
        burstResetTime: now + this.burstWindow,
      });

      return {
        allowed: true,
        info: {
          remaining: this.maxRequestsPerMinute - 1,
          resetTime: now + 60000,
        },
      };
    }

    // Check burst limit first (10-second window)
    if (now < record.burstResetTime) {
      if (record.burstCount >= this.burstCapacity) {
        return {
          allowed: false,
          info: {
            remaining: 0,
            resetTime: record.burstResetTime,
          },
        };
      }
      record.burstCount++;
    } else {
      // Reset burst window
      record.burstCount = 1;
      record.burstResetTime = now + this.burstWindow;
    }

    // Check per-minute limit
    if (now < record.resetTime) {
      if (record.count >= this.maxRequestsPerMinute) {
        return {
          allowed: false,
          info: {
            remaining: 0,
            resetTime: record.resetTime,
          },
        };
      }
      record.count++;
    } else {
      // Reset minute window
      record.count = 1;
      record.resetTime = now + 60000;
    }

    this.requests.set(identifier, record);

    return {
      allowed: true,
      info: {
        remaining: this.maxRequestsPerMinute - record.count,
        resetTime: record.resetTime,
      },
    };
  }

  // Cleanup old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now >= record.resetTime && now >= record.burstResetTime) {
        this.requests.delete(key);
      }
    }
  }
}

