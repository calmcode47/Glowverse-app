export type PaymentErrorType =
  | "NetworkError"
  | "CardDeclinedError"
  | "InsufficientFundsError"
  | "InvalidCardError"
  | "AuthenticationError"
  | "ServerError"
  | "UnknownError"
  | "TimeoutError";

export interface PaymentError {
  type: PaymentErrorType;
  code: string;
  message: string;
  technicalMessage: string;
  retryable: boolean;
  retryDelay: number;
  suggestedAction: string;
}

export function isPaymentError(error: unknown): error is PaymentError {
  const e = error as PaymentError | null | undefined;
  return Boolean(e && typeof e === "object" && typeof e.code === "string" && typeof e.type === "string");
}

