import AsyncStorage from "@react-native-async-storage/async-storage";

type PaymentResult = {
  status: "succeeded" | "requires_action" | "failed";
  paymentIntentId?: string;
  error?: string;
};

const KEY_PREFIX = "idem:";

export class PaymentIdempotencyManager {
  private processed: Set<string> = new Set();

  async processPaymentSafely<T extends PaymentResult>(
    idempotencyKey: string,
    executor: () => Promise<T>
  ): Promise<T> {
    if (this.processed.has(idempotencyKey)) {
      const existing = await this.getPaymentResult<T>(idempotencyKey);
      if (existing) return existing;
    }
    this.processed.add(idempotencyKey);
    try {
      const result = await executor();
      await this.storePaymentResult(idempotencyKey, result);
      return result;
    } catch (e) {
      this.processed.delete(idempotencyKey);
      throw e;
    }
  }

  private async storePaymentResult<T extends PaymentResult>(key: string, result: T): Promise<void> {
    await AsyncStorage.setItem(`${KEY_PREFIX}${key}`, JSON.stringify(result));
  }

  private async getPaymentResult<T extends PaymentResult>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
