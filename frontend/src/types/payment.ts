export enum PaymentStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error"
}

export type PaymentMethodBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export interface PaymentMethod {
  id: string;
  brand: PaymentMethodBrand;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
}

export type PaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded";

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
}

export type PaymentError = import("./paymentErrors").PaymentError;

