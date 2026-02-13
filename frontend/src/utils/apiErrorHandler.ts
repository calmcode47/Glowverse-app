export type ErrorResponse = { message: string; statusCode: number; code?: string };

export function handleAPIError(error: any): string {
  const s = error?.response?.status;
  if (s === 400) return "Invalid request. Please check your input.";
  if (s === 401) return "Please log in to continue.";
  if (s === 403) return "You don't have permission to do this.";
  if (s === 404) return "Content not found.";
  if (s === 429) return "Too many requests. Please try again later.";
  if (s === 500) return "Server error. Please try again.";
  return "Something went wrong. Please try again.";
}

export async function withBackoffRetry<T>(fn: () => Promise<T>, onAttempt?: (n: number) => void): Promise<T> {
  const delays = [500, 1000, 2000];
  let lastErr: any = null;
  for (let i = 0; i <= delays.length; i++) {
    try {
      onAttempt?.(i + 1);
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i === delays.length) break;
      await new Promise((r) => setTimeout(r, delays[i]));
    }
  }
  throw lastErr;
}
