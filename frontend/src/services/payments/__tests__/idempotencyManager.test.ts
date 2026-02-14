import { PaymentIdempotencyManager } from "../../payments/idempotencyManager";

describe("PaymentIdempotencyManager", () => {
  it("prevents duplicate executions", async () => {
    const idem = new PaymentIdempotencyManager();
    let runs = 0;
    const key = "k1";
    const exec = async () => {
      runs++;
      return { status: "succeeded", paymentIntentId: "pi_1" } as any;
    };
    const r1 = await idem.processPaymentSafely(key, exec);
    const r2 = await idem.processPaymentSafely(key, exec);
    expect(r1.paymentIntentId).toBe("pi_1");
    expect(r2.paymentIntentId).toBe("pi_1");
    expect(runs).toBe(1);
  });
});
