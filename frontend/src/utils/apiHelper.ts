/**
 * Returns a user-friendly error message from various error shapes
 */
export function handleAPIError(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.status) {
    const s = error.response.status;
    if (s === 401) return "Authentication required";
    if (s === 403) return "Not authorized";
    if (s === 404) return "Not found";
    if (s === 429) return "Too many requests. Please wait and try again.";
    if (s >= 500) return "Server error. Please try again later.";
  }
  return "Network error. Please check your connection.";
}

/**
 * Retries a provided async function up to N times with backoff
 */
export async function retryRequest<T>(fn: () => Promise<T>, retries = 2, delayMs = 400): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === retries) break;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

/**
 * Standardizes API response objects
 */
export function formatResponse<T>(data: T): T {
  return data;
}
