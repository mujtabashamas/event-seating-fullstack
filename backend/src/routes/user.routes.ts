import { Router, type Request, type Response } from 'express';
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

  // GET /api/v1/users - Get all users (optional: for completeness)
  router.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Get all users endpoint',
      note: 'This is a placeholder. Implement pagination if needed.',
    });
  });

  // GET /api/v1/users/:id - Get user by ID
  router.get('/:id', asyncHandler((req, res) => userController.getUserById(req, res)));

  // POST /api/v1/users - Create new user
  router.post('/', asyncHandler((req, res) => userController.createUser(req, res)));

  return router;
}

