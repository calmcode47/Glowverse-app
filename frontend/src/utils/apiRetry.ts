type RetryConfig = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
};

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

export async function withRetry<T>(fn: () => Promise<T>, cfg: Partial<RetryConfig> = {}): Promise<T> {
  const full = { ...defaultRetryConfig, ...cfg };
  let lastError: any;
  for (let attempt = 0; attempt <= full.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (!isRetryableError(error, full.retryableStatuses) || attempt === full.maxRetries) {
        throw error;
      }
      const base = Math.min(full.initialDelayMs * Math.pow(full.backoffMultiplier, attempt), full.maxDelayMs);
      const jitter = base * 0.25 * ((Math.random() * 2) - 1);
      const delay = Math.max(0, Math.round(base + jitter));
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[Retry] Attempt ${attempt + 1}/${full.maxRetries} after ${delay}ms`);
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  if (!error?.response) return true; // network error
  return retryableStatuses.includes(error.response.status);
}
