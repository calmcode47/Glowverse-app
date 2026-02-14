import { PaymentError, PaymentErrorType, StripeError } from "./paymentErrors";

const defaults: PaymentError = {
  type: PaymentErrorType.UNKNOWN,
  code: "unknown",
  message: "An unexpected error occurred",
  userMessage: "Something went wrong while processing your payment.",
  recoverable: true,
  retryable: false,
  suggestedActions: [{ type: "contact_support", label: "Contact Support" }],
  supportContext: { timestamp: new Date().toISOString(), amount: 0, currency: "usd" }
};

export function stripeErrorMapper(stripeError: StripeError, context: { amount: number; currency: string; transactionId?: string }): PaymentError {
  const code = stripeError?.code || "unknown";
  const map: Record<string, Partial<PaymentError>> = {
    card_declined: {
      type: PaymentErrorType.CARD_DECLINED,
      userMessage: "Your card was declined. Please try a different payment method.",
      recoverable: true,
      retryable: false,
      suggestedActions: [{ type: "change_method", label: "Try Another Card" }, { type: "contact_bank", label: "Contact Your Bank" }]
    },
    insufficient_funds: {
      type: PaymentErrorType.INSUFFICIENT_FUNDS,
      userMessage: "Your card has insufficient funds.",
      recoverable: true,
      retryable: false,
      suggestedActions: [{ type: "change_method", label: "Use Different Card" }, { type: "reduce_order", label: "Remove Items" }]
    },
    expired_card: {
      type: PaymentErrorType.CARD_EXPIRED,
      userMessage: "Your card has expired. Please update your payment information.",
      recoverable: true,
      retryable: false
    },
    incorrect_cvc: {
      type: PaymentErrorType.INVALID_CARD,
      userMessage: "The CVC code is incorrect. Please check and try again.",
      recoverable: true,
      retryable: false
    },
    invalid_cvc: {
      type: PaymentErrorType.INVALID_CARD,
      userMessage: "The CVC code is invalid. Please check and try again.",
      recoverable: true,
      retryable: false
    },
    incorrect_number: {
      type: PaymentErrorType.INVALID_CARD,
      userMessage: "The card number is incorrect.",
      recoverable: true,
      retryable: false
    },
    authentication_error: {
      type: PaymentErrorType.AUTH_FAILED,
      userMessage: "Authentication failed. Please try again or use another method.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Try Again" }]
    },
    api_connection_error: {
      type: PaymentErrorType.NETWORK_ERROR,
      userMessage: "No internet connection. Please check your network.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Retry", autoRetry: true }]
    },
    api_error: {
      type: PaymentErrorType.SERVER_ERROR,
      userMessage: "We encountered a server error. Please try again.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Try Again", autoRetry: true }]
    },
    rate_limit: {
      type: PaymentErrorType.SERVER_ERROR,
      userMessage: "Too many requests. Please wait and try again.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Try Again", autoRetry: true }]
    },
    processing_error: {
      type: PaymentErrorType.PROCESSING_ERROR,
      userMessage: "We encountered an error processing your payment. Please try again.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Try Again", autoRetry: true }]
    },
    request_timeout: {
      type: PaymentErrorType.TIMEOUT,
      userMessage: "Payment timed out. We will check the status and retry.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Retry", autoRetry: true }]
    },
    three_d_secure_authentication_failed: {
      type: PaymentErrorType.THREE_DS_FAILED,
      userMessage: "3D Secure authentication failed.",
      recoverable: true,
      retryable: true,
      suggestedActions: [{ type: "retry", label: "Authenticate Again" }]
    },
    fraudulent: {
      type: PaymentErrorType.FRAUD_SUSPECTED,
      userMessage: "We could not complete the payment for security reasons.",
      recoverable: false,
      retryable: false,
      suggestedActions: [{ type: "contact_support", label: "Contact Support" }]
    }
  };
  const base = map[code] || {};
  const message = stripeError?.message || defaults.message;
  const userMessage = base.userMessage || defaults.userMessage;
  return {
    ...defaults,
    ...base,
    code,
    message,
    userMessage,
    supportContext: {
      transactionId: context.transactionId,
      timestamp: new Date().toISOString(),
      amount: context.amount,
      currency: context.currency
    }
  };
}
