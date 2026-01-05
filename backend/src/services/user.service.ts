import type { User } from '../types/index.js';
import { appConfig } from '../config/app.js';
import { userRepository } from './user.repository.js';
import { MetricsService } from './metrics.service.js';

export class UserService {
  private metricsService: MetricsService;

  constructor() {
    this.metricsService = MetricsService.getInstance();
  }

  /**
   * Simulate database call with delay
   */
  async getUserById(userId: number): Promise<User> {
    const start = Date.now();
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = userRepository.findById(userId);
        
        // Record database query duration
        this.metricsService.databaseQueryDuration.observe(
          { operation: 'getUserById' },
          Date.now() - start
        );

        if (!user) {
          this.metricsService.databaseErrors.inc({ operation: 'getUserById' });
          reject(new Error('User not found'));
        } else {
          resolve(user);
        }
      }, appConfig.database.simulatedDelayMs);
    });
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const newId = userRepository.getMaxId() + 1;
    const newUser: User = {
      id: newId,
      ...userData,
    };
    userRepository.save(newUser);
    return newUser;
  }
}

