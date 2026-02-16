import { networkMonitor } from "../sync/NetworkMonitor";
import type { PaymentError } from "../../types/paymentErrors";
import { getRetryDelay, shouldRetry } from "./paymentErrorHandler";

export type RetryCallbacks = {
  onAttempt?: (attemptNumber: number, error: PaymentError) => void;
  onWait?: (attemptNumber: number, delayMs: number, error: PaymentError) => void;
};

export type RetryController = {
  cancel: () => void;
  getCancelled: () => boolean;
};

export function createRetryController(): RetryController {
  let cancelled = false;
  return {
    cancel: () => {
      cancelled = true;
    },
    getCancelled: () => cancelled
  };
}

const MAX_RETRIES_BY_TYPE: Record<PaymentError["type"], number> = {
  NetworkError: 3,
  ServerError: 2,
  TimeoutError: 2,
  AuthenticationError: 1,
  CardDeclinedError: 0,
  InsufficientFundsError: 0,
  InvalidCardError: 0,
  UnknownError: 1
};

export async function retryPayment<T>(
  paymentFn: () => Promise<T>,
  maxAttempts: number,
  error: PaymentError,
  controller: RetryController = createRetryController(),
  callbacks: RetryCallbacks = {}
): Promise<T> {
  const hardMax = MAX_RETRIES_BY_TYPE[error.type] ?? 0;
  const allowed = Math.min(maxAttempts, hardMax + 1);
  let attempt = 1;

  while (true) {
    if (controller.getCancelled()) throw error;
    try {
      callbacks.onAttempt?.(attempt, error);
      return await paymentFn();
    } catch (e) {
      if (controller.getCancelled()) throw error;
      if (!shouldRetry(error) || attempt >= allowed) throw e;

      const online = await networkMonitor.waitForOnline(30000);
      if (!online) throw e;

      const delay = getRetryDelay(attempt);
      callbacks.onWait?.(attempt, delay, error);
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
}

