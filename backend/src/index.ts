import express from 'express';
import cors from 'cors';
import { appConfig } from './config/app.js';
import { CacheService } from './services/cache.service.js';
import { QueueService } from './services/queue.service.js';
import { createUserRoutes } from './routes/user.routes.js';
import { createCacheRoutes } from './routes/cache.routes.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware.js';
import type { User } from './types/index.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
app.use(rateLimiterMiddleware);

// Initialize services
const cacheService = new CacheService(appConfig.cache.ttlSeconds);
const queueService = new QueueService<User>();

// Routes
app.use('/users', createUserRoutes(cacheService, queueService));
app.use('/cache', createCacheRoutes(cacheService));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);
  cacheService.stopCleanup();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
app.listen(appConfig.port, () => {
  console.log(`Server is running on http://localhost:${appConfig.port}`);
  console.log(`Health check: http://localhost:${appConfig.port}/health`);
  console.log(`API endpoints:`);
  console.log(`  GET    /users/:id`);
  console.log(`  POST   /users`);
  console.log(`  GET    /cache/status`);
  console.log(`  DELETE /cache`);
});
