import type { User } from '../types/index.js';
import { appConfig } from '../config/app.js';
import { userRepository } from './user.repository.js';

export class UserService {
  /**
   * Simulate database call with delay
   */
  async getUserById(userId: number): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = userRepository.findById(userId);
        if (!user) {
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

