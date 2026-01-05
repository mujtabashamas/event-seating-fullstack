type QueueTask<T> = () => Promise<T>;

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class QueueService<T> {
  private queue: QueueTask<T>[] = [];
  private pendingRequests: Map<string, PendingRequest<T>[]> = new Map();
  private processing = false;

  async enqueue(key: string, task: QueueTask<T>): Promise<T> {
    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending && pending.length > 0) {
      // Wait for the existing request to complete
      return new Promise<T>((resolve, reject) => {
        pending.push({ resolve, reject });
      });
    }

    // Create new pending request list
    const newPending: PendingRequest<T>[] = [];
    this.pendingRequests.set(key, newPending);

    // Add task to queue
    this.queue.push(async () => {
      try {
        const result = await task();
        // Resolve all pending requests for this key
        newPending.forEach((p) => p.resolve(result));
        this.pendingRequests.delete(key);
        return result;
      } catch (error) {
        // Reject all pending requests for this key
        newPending.forEach((p) => p.reject(error as Error));
        this.pendingRequests.delete(key);
        throw error;
      }
    });

    // Start processing if not already
    if (!this.processing) {
      this.process();
    }

    // Return promise that will resolve when task completes
    return new Promise<T>((resolve, reject) => {
      newPending.push({ resolve, reject });
    });
  }

  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          // Error already handled in task
          console.error('Queue task error:', error);
        }
      }
    }

    this.processing = false;
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

