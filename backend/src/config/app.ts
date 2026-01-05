export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  cache: {
    ttlSeconds: 60,
    cleanupIntervalMs: 10000,
  },
  rateLimit: {
    maxRequestsPerMinute: 10,
    burstCapacity: 5,
    burstWindowSeconds: 10,
    cleanupIntervalMs: 60000,
  },
  database: {
    simulatedDelayMs: 200,
  },
};

