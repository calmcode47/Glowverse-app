class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }
    const promise = fn().then(
      (res) => {
        this.pendingRequests.delete(key);
        return res;
      },
      (err) => {
        this.pendingRequests.delete(key);
        throw err;
      }
    );
    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear(key?: string): void {
    if (key) this.pendingRequests.delete(key);
    else this.pendingRequests.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();
