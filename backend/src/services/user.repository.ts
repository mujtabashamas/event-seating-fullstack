import type { User } from '../types/index.js';

// In-memory data store (simulating database)
const users: Record<number, User> = {
  1: { id: 1, name: 'John Doe', email: 'john@example.com' },
  2: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  3: { id: 3, name: 'Alice Johnson', email: 'alice@example.com' },
};

export const userRepository = {
  findById(id: number): User | undefined {
    return users[id];
  },

  save(user: User): void {
    users[user.id] = user;
  },

  getMaxId(): number {
    const ids = Object.keys(users).map(Number);
    return ids.length > 0 ? Math.max(...ids) : 0;
  },
};

