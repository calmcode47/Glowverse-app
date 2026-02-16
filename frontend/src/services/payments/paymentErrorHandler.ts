import type { PaymentError } from "../../types/paymentErrors";
import { isPaymentError } from "../../types/paymentErrors";
import { log } from "../../utils/logger";

export type StripeErrorLike = {
  code?: string;
  message?: string;
  decline_code?: string;
  declineCode?: string;
  type?: string;
};

export type ApiErrorLike = {
  code?: string;
  message?: string;
  userMessage?: string;
  status?: number;
  retryable?: boolean;
  details?: unknown;
};

const ERROR_MESSAGES: Record<
  string,
  { type: PaymentError["type"]; title: string; message: string; action: string; retryable: boolean }
> = {
  card_declined: {
    type: "CardDeclinedError",
    title: "Card Declined",
    message: "Your card was declined. Please try a different payment method.",
    action: "Try Another Card",
    retryable: false
  },
  insufficient_funds: {
    type: "InsufficientFundsError",
    title: "Insufficient Funds",
    message: "Your card has insufficient funds. Please use a different card.",
    action: "Change Card",
    retryable: false
  },
  incorrect_number: {
    type: "InvalidCardError",
    title: "Invalid Card",
    message: "Your card number looks incorrect. Please check and try again.",
    action: "Fix Card Details",
    retryable: false
  },
  incorrect_cvc: {
    type: "InvalidCardError",
    title: "Invalid CVC",
    message: "Your card security code looks incorrect. Please check and try again.",
    action: "Fix Card Details",
    retryable: false
  },
  expired_card: {
    type: "InvalidCardError",
    title: "Expired Card",
    message: "This card is expired. Please use a different card.",
    action: "Change Card",
    retryable: false
  },
  three_d_secure_authentication_failed: {
    type: "AuthenticationError",
    title: "Authentication Failed",
    message: "Card authentication failed. Please verify with your bank or try another card.",
    action: "Try Again",
    retryable: true
  },
  authentication_error: {
    type: "AuthenticationError",
    title: "Authentication Failed",
    message: "We couldn’t authenticate your payment method. Please try again.",
    action: "Try Again",
    retryable: true
  },
  api_connection_error: {
    type: "NetworkError",
    title: "Connection Issue",
    message: "We couldn't process your payment due to a network error. Please try again.",
    action: "Retry Payment",
    retryable: true
  },
  processing_error: {
    type: "ServerError",
    title: "Something Went Wrong",
    message: "We encountered an error processing your payment. Please try again in a moment.",
    action: "Retry",
    retryable: true
  }
};

export function getRetryDelay(attemptNumber: number): number {
  const baseDelay = 1000;
  const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1);
  const jitter = Math.random() * 500;
  return exponentialDelay + jitter;
}

export function shouldRetry(error: PaymentError): boolean {
  return error.retryable;
}

export function getUserMessage(error: PaymentError): string {
  return error.message;
}

export function logPaymentError(error: PaymentError, context: Record<string, unknown>): void {
  log("error", "Payment error", {
    type: error.type,
    code: error.code,
    message: error.message,
    technicalMessage: error.technicalMessage,
    retryable: error.retryable,
    retryDelay: error.retryDelay,
    suggestedAction: error.suggestedAction,
    ...context
  });
}

export function parseStripeError(error: StripeErrorLike | unknown): PaymentError {
  if (isPaymentError(error)) return error;
  const e = (error || {}) as StripeErrorLike;
  const rawCode = String(e.code || e.decline_code || (e as any).declineCode || "unknown");
  const mapped = ERROR_MESSAGES[rawCode];
  if (mapped) {
    return {
      type: mapped.type,
      code: rawCode,
      message: mapped.message,
      technicalMessage: String(e.message || rawCode),
      retryable: mapped.retryable,
      retryDelay: mapped.retryable ? getRetryDelay(1) : 0,
      suggestedAction: mapped.action
    };
  }
  return {
    type: "UnknownError",
    code: rawCode,
    message: "We couldn’t process your payment. Please try again.",
    technicalMessage: String(e.message || rawCode),
    retryable: true,
    retryDelay: getRetryDelay(1),
    suggestedAction: "Retry"
  };
}

export function parseBackendError(error: ApiErrorLike | unknown): PaymentError {
  if (isPaymentError(error)) return error;
  const e = (error || {}) as ApiErrorLike;
  const code = String(e.code || "server_error");
  const status = typeof e.status === "number" ? e.status : undefined;
  if (code === "NETWORK_ERROR" || status === 0) {
    return {
      type: "NetworkError",
      code: "network_error",
      message: "We couldn't connect. Please check your internet connection and try again.",
      technicalMessage: String(e.message || "NETWORK_ERROR"),
      retryable: true,
      retryDelay: getRetryDelay(1),
      suggestedAction: "Retry Payment"
    };
  }
  if (status === 408) {
    return {
      type: "TimeoutError",
      code: "timeout",
      message: "The request timed out. Please try again.",
      technicalMessage: String(e.message || "timeout"),
      retryable: true,
      retryDelay: getRetryDelay(1),
      suggestedAction: "Retry"
    };
  }
  if (status && status >= 500) {
    return {
      type: "ServerError",
      code,
      message: "We encountered a server error. Please try again.",
      technicalMessage: String(e.message || code),
      retryable: true,
      retryDelay: getRetryDelay(1),
      suggestedAction: "Retry"
    };
  }
  const msg = String(e.userMessage || e.message || "We couldn't process your payment.");
  return {
    type: "UnknownError",
    code,
    message: msg,
    technicalMessage: String(e.message || msg),
    retryable: Boolean(e.retryable),
    retryDelay: Boolean(e.retryable) ? getRetryDelay(1) : 0,
    suggestedAction: Boolean(e.retryable) ? "Retry" : "Change Card"
  };
}

