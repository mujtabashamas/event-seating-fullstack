import type { Request, Response } from 'express';
import { CacheService } from '../services/cache.service.js';
import { QueueService } from '../services/queue.service.js';
import { UserService } from '../services/user.service.js';
import { isValidInteger, validateUserData } from '../utils/validation.js';
import { measureResponseTime } from '../utils/responseTime.js';
import type { User } from '../types/index.js';

export class UserController {
  constructor(
    private cacheService: CacheService,
    private queueService: QueueService<User>,
    private userService: UserService
  ) {}

  async getUserById(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const userIdParam = req.params.id;

    // Validate user ID
    if (!isValidInteger(userIdParam)) {
      res.status(400).json({ error: 'Invalid user ID. Must be a positive integer.' });
      return;
    }

    const userId = parseInt(userIdParam, 10);

    // Check cache first
    const cachedUser = this.cacheService.get(userId);
    if (cachedUser) {
      measureResponseTime(startTime, (time) =>
        this.cacheService.updateAverageResponseTime(time)
      );
      res.json(cachedUser);
      return;
    }

    // Use queue to handle concurrent requests
    try {
      const user = await this.queueService.enqueue(`user-${userId}`, async () => {
        // Check cache again after waiting (in case another request cached it)
        const cached = this.cacheService.get(userId);
        if (cached) {
          return cached;
        }

        // Fetch from "database"
        const fetchedUser = await this.userService.getUserById(userId);

        // Cache the result (only if not already cached)
        this.cacheService.set(userId, fetchedUser);

        return fetchedUser;
      });

      measureResponseTime(startTime, (time) =>
        this.cacheService.updateAverageResponseTime(time)
      );
      res.json(user);
    } catch (error) {
      measureResponseTime(startTime, (time) =>
        this.cacheService.updateAverageResponseTime(time)
      );

      const errorMessage = (error as Error).message;
      if (errorMessage === 'User not found') {
        res.status(404).json({ error: 'User not found' });
      } else {
        throw error; // Re-throw to be handled by error middleware
      }
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const validation = validateUserData(req.body);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const { name, email } = req.body as { name: string; email: string };

    const newUser = await this.userService.createUser({ name: name.trim(), email: email.trim() });

    // Cache the new user
    this.cacheService.set(newUser.id, newUser);

    res.status(201).json(newUser);
  }
}

