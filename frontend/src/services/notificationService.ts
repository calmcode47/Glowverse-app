import { client } from "./api/client";

export async function sendOrderConfirmationEmail(orderId: string): Promise<void> {
  let attempts = 0;
  const maxRetries = 3;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  while (attempts < maxRetries) {
    try {
      await client.post(`/api/v1/orders/${encodeURIComponent(orderId)}/email/confirmation`);
      return;
    } catch {
      attempts += 1;
      if (attempts >= maxRetries) {
        return;
      }
      await wait(500 * attempts);
    }
  }
}

