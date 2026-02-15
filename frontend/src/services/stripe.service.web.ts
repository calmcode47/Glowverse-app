export type PaymentMethod = {
  id: string;
  card?: {
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
};

export type PaymentResult = {
  status: "succeeded" | "requires_action" | "failed";
  error?: string;
  paymentIntentId?: string;
};

export async function initializeStripe(): Promise<void> {
  return;
}

export function useStripePaymentService() {
  async function createCardPaymentMethod(): Promise<{ paymentMethod?: PaymentMethod; error?: string }> {
    return { error: "Card payments are not available on web" };
  }
  async function confirm(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    return { status: "failed", error: "Payment confirmation not available on web" };
  }
  async function handleNext(clientSecret: string): Promise<PaymentResult> {
    return { status: "failed", error: "3DS not available on web" };
  }
  return { createCardPaymentMethod, confirm, handleNext };
}

