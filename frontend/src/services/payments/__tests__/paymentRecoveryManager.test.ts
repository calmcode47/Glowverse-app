jest.mock("../../../../src/services/analytics.service", () => ({
  analytics: { logEvent: jest.fn(async () => {}) }
}));
import { PaymentRecoveryManager } from "../../payments/paymentRecoveryManager";
import { PaymentError, PaymentErrorType } from "../../payments/paymentErrors";

function makeError(type: PaymentErrorType): PaymentError {
  return {
    type,
    code: "x",
    message: "m",
    userMessage: "u",
    recoverable: true,
    retryable: true,
    suggestedActions: [],
    supportContext: { timestamp: new Date().toISOString(), amount: 100, currency: "usd" }
  };
}

describe("PaymentRecoveryManager", () => {
  it("determines screens by type", () => {
    const mgr = new PaymentRecoveryManager(async () => {});
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.NETWORK_ERROR)).screen).toBe("PaymentNetworkError");
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.CARD_DECLINED)).screen).toBe("PaymentDeclined");
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.PROCESSING_ERROR)).screen).toBe("PaymentProcessingError");
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.THREE_DS_FAILED)).screen).toBe("Payment3DSError");
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.FRAUD_SUSPECTED)).screen).toBe("PaymentFraud");
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.TIMEOUT)).screen).toBe("PaymentTimeout");
    expect(mgr.determineRecoveryStrategy(makeError(PaymentErrorType.UNKNOWN)).screen).toBe("PaymentGenericError");
  });

  it("passes callbacks to error screen", async () => {
    const fn = jest.fn(async () => {});
    const mgr = new PaymentRecoveryManager(fn);
    const nav: any = { navigate: jest.fn() };
    const err = makeError(PaymentErrorType.PROCESSING_ERROR);
    await mgr.handlePaymentError(err, "pi", nav);
    const args = nav.navigate.mock.calls[0][1];
    expect(typeof args.onRetry).toBe("function");
    expect(typeof args.onChangeMethod).toBe("function");
    expect(typeof args.onContactSupport).toBe("function");
  });
});
