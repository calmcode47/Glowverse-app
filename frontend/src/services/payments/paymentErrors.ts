export enum PaymentErrorType {
  NETWORK_ERROR = "network_error",
  AUTH_FAILED = "auth_failed",
  INVALID_CARD = "invalid_card",
  CARD_DECLINED = "card_declined",
  INSUFFICIENT_FUNDS = "insufficient_funds",
  CARD_EXPIRED = "card_expired",
  PROCESSING_ERROR = "processing_error",
  FRAUD_SUSPECTED = "fraud_suspected",
  THREE_DS_FAILED = "3ds_failed",
  SERVER_ERROR = "server_error",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown"
}

export type PaymentRecoveryAction =
  | { type: "retry"; label: string; autoRetry?: boolean }
  | { type: "change_method"; label: string }
  | { type: "contact_bank"; label: string }
  | { type: "reduce_order"; label: string }
  | { type: "contact_support"; label: string };

export interface PaymentError {
  type: PaymentErrorType;
  code: string;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
  suggestedActions: PaymentRecoveryAction[];
  supportContext: {
    transactionId?: string;
    timestamp: string;
    amount: number;
    currency: string;
  };
}

export type StripeError = {
  code?: string;
  message?: string;
  type?: string;
  decline_code?: string;
};
