import { client } from "./client";

export async function createPaymentIntent(payload: { amount: number; currency: string; metadata?: Record<string, any> }): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const res = await client.post("/api/v1/payments/create-intent", payload);
  const data = res.data || {};
  return {
    clientSecret: String(data.clientSecret || data.client_secret || ""),
    paymentIntentId: String(data.paymentIntentId || data.id || data.paymentIntentId || "")
  };
}
