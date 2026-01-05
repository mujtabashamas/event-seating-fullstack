export const appConfig = {
  port: Number(process.env.PORT) || 3000,
  apiVersion: 'v1',
  apiPrefix: '/api',
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
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
};
