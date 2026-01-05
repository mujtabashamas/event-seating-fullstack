import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { CacheService } from '../services/cache.service.js';
import { QueueService } from '../services/queue.service.js';
import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { User } from '../types/index.js';

export function createUserRoutes(
  cacheService: CacheService,
  queueService: QueueService<User>
): Router {
  const router = Router();
  const userService = new UserService();
  const userController = new UserController(cacheService, queueService, userService);

  router.get('/:id', asyncHandler((req, res) => userController.getUserById(req, res)));
  router.post('/', asyncHandler((req, res) => userController.createUser(req, res)));

  return router;
}

