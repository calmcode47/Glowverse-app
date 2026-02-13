import { initStripe, useStripe } from "@stripe/stripe-react-native";
import { ENV } from "../config/environment";

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

let initialized = false;

export async function initializeStripe(): Promise<void> {
  if (initialized) return;
  await initStripe({
    publishableKey: ENV.stripePublishableKey || "",
    merchantIdentifier: ENV.stripeMerchantId || "merchant.com.glowverse",
    urlScheme: "glowverse"
  });
  initialized = true;
}

export function useStripePaymentService() {
  const stripe = useStripe();
  async function createCardPaymentMethod(): Promise<{ paymentMethod?: PaymentMethod; error?: string }> {
    const res = await stripe.createPaymentMethod({ paymentMethodType: "Card" as any });
    if ((res as any)?.error) return { error: (res as any).error.message };
    const pm = (res as any)?.paymentMethod;
    if (!pm?.id) return { error: "Unable to create payment method" };
    return { paymentMethod: { id: pm.id, card: pm.card } };
  }
  async function confirm(clientSecret: string, paymentMethodId: string): Promise<PaymentResult> {
    const res = await stripe.confirmPayment(clientSecret, {
      paymentMethodType: "Card" as any,
      paymentMethodData: { paymentMethodId }
    } as any);
    if ((res as any)?.error) return { status: "failed", error: (res as any).error.message };
    const pi = (res as any)?.paymentIntent;
    if (!pi?.status) return { status: "failed", error: "Payment confirmation failed" };
    if (pi.status === "requires_action") return { status: "requires_action", paymentIntentId: pi.id };
    return { status: "succeeded", paymentIntentId: pi.id };
  }
  async function handleNext(clientSecret: string): Promise<PaymentResult> {
    const res = await stripe.handleNextAction(clientSecret);
    if ((res as any)?.error) return { status: "failed", error: (res as any).error.message };
    const pi = (res as any)?.paymentIntent;
    if (!pi?.status) return { status: "failed", error: "Authentication failed" };
    if (pi.status === "succeeded") return { status: "succeeded", paymentIntentId: pi.id };
    return { status: "failed", error: "Authentication incomplete" };
  }
  return { createCardPaymentMethod, confirm, handleNext };
}
