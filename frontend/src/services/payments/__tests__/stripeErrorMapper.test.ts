import { stripeErrorMapper } from "../../payments/stripeErrorMapper";
import { PaymentErrorType } from "../../payments/paymentErrors";

describe("stripeErrorMapper", () => {
  const ctx = { amount: 1234, currency: "usd" as const };
  it("maps card_declined", () => {
    const e = stripeErrorMapper({ code: "card_declined", message: "declined" }, ctx);
    expect(e.type).toBe(PaymentErrorType.CARD_DECLINED);
    expect(e.retryable).toBe(false);
    expect(e.userMessage).toMatch(/declined/i);
  });
  it("maps insufficient_funds", () => {
    const e = stripeErrorMapper({ code: "insufficient_funds", message: "insufficient" }, ctx);
    expect(e.type).toBe(PaymentErrorType.INSUFFICIENT_FUNDS);
    expect(e.retryable).toBe(false);
  });
  it("maps expired_card", () => {
    const e = stripeErrorMapper({ code: "expired_card", message: "expired" }, ctx);
    expect(e.type).toBe(PaymentErrorType.CARD_EXPIRED);
  });
  it("maps 3ds failure", () => {
    const e = stripeErrorMapper({ code: "three_d_secure_authentication_failed", message: "3ds" }, ctx);
    expect(e.type).toBe(PaymentErrorType.THREE_DS_FAILED);
  });
  it("maps api_connection_error to network", () => {
    const e = stripeErrorMapper({ code: "api_connection_error", message: "network" }, ctx);
    expect(e.type).toBe(PaymentErrorType.NETWORK_ERROR);
    expect(e.retryable).toBe(true);
  });
  it("defaults to unknown", () => {
    const e = stripeErrorMapper({ code: "random_error", message: "oops" }, ctx);
    expect(e.type).toBe(PaymentErrorType.UNKNOWN);
  });
});
