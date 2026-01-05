import express from 'express';
import cors from 'cors';
import { appConfig } from './config/app.js';
import { CacheService } from './services/cache.service.js';
import { QueueService } from './services/queue.service.js';
import { createApiRoutes } from './routes/index.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.middleware.js';
import { metricsMiddleware } from './middleware/metrics.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import type { User } from './types/index.js';

const app = express();

// Middleware
app.use(cors(appConfig.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Metrics middleware (tracks all requests)
app.use(metricsMiddleware);

// API version and info
app.get('/', (_req, res) => {
  res.json({
    name: 'User Data API',
    version: appConfig.apiVersion,
    description: 'Express.js API with advanced caching, rate limiting, and asynchronous processing',
    endpoints: {
      health: `${appConfig.apiPrefix}/${appConfig.apiVersion}/health`,
      users: `${appConfig.apiPrefix}/${appConfig.apiVersion}/users`,
      cache: `${appConfig.apiPrefix}/${appConfig.apiVersion}/cache`,
      metrics: `${appConfig.apiPrefix}/${appConfig.apiVersion}/metrics`,
    },
  });
});

// Rate limiting middleware (applied to all API routes)
app.use(`${appConfig.apiPrefix}/${appConfig.apiVersion}`, rateLimiterMiddleware);

// Initialize services
const cacheService = new CacheService(appConfig.cache.ttlSeconds);
const queueService = new QueueService<User>();

// Mount API routes
app.use(
  `${appConfig.apiPrefix}/${appConfig.apiVersion}`,
  createApiRoutes(cacheService, queueService)
);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  cacheService.stopCleanup();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
app.listen(appConfig.port, () => {
  console.log('\n🚀 Server is running!');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📡 Base URL: http://localhost:${appConfig.port}`);
  console.log(`📋 API Version: ${appConfig.apiVersion}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n📍 API Endpoints:`);
  console.log(`  GET    http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/health`);
  console.log(`  GET    http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/health/detailed`);
  console.log(`  GET    http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/users/:id`);
  console.log(`  POST   http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/users`);
  console.log(`  GET    http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/cache/status`);
  console.log(`  DELETE http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/cache`);
  console.log(`\n📊 Monitoring:`);
  console.log(`  GET    http://localhost:${appConfig.port}${appConfig.apiPrefix}/${appConfig.apiVersion}/metrics (Prometheus)`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
