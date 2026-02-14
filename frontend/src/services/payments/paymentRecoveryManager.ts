import AsyncStorage from "@react-native-async-storage/async-storage";
import { analytics } from "../../services/analytics.service";
import { PaymentError, PaymentErrorType } from "./paymentErrors";

type Strategy = { screen: string };

export class PaymentRecoveryManager {
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private process: (paymentIntent: string) => Promise<void>;

  constructor(processPayment: (paymentIntent: string) => Promise<void>) {
    this.process = processPayment;
  }

  determineRecoveryStrategy(error: PaymentError): Strategy {
    if (error.type === PaymentErrorType.NETWORK_ERROR) return { screen: "PaymentNetworkError" };
    if (
      error.type === PaymentErrorType.CARD_DECLINED ||
      error.type === PaymentErrorType.INSUFFICIENT_FUNDS ||
      error.type === PaymentErrorType.CARD_EXPIRED ||
      error.type === PaymentErrorType.INVALID_CARD
    )
      return { screen: "PaymentDeclined" };
    if (error.type === PaymentErrorType.THREE_DS_FAILED) return { screen: "Payment3DSError" };
    if (error.type === PaymentErrorType.FRAUD_SUSPECTED) return { screen: "PaymentFraud" };
    if (error.type === PaymentErrorType.TIMEOUT) return { screen: "PaymentTimeout" };
    if (error.type === PaymentErrorType.PROCESSING_ERROR || error.type === PaymentErrorType.SERVER_ERROR) return { screen: "PaymentProcessingError" };
    return { screen: "PaymentGenericError" };
  }

  async handlePaymentError(error: PaymentError, paymentIntent: string, navigation: any): Promise<void> {
    const strategy = this.determineRecoveryStrategy(error);
    await analytics.logEvent({
      name: "payment_error",
      properties: {
        type: error.type,
        code: error.code,
        retryable: error.retryable,
        transaction_id: error.supportContext.transactionId || null
      }
    });
    navigation.navigate(strategy.screen, {
      error,
      onRetry: () => this.retryPayment(paymentIntent, error),
      onChangeMethod: () => this.changePaymentMethod(navigation),
      onContactSupport: () => this.contactSupport(error)
    });
  }

  private async retryPayment(paymentIntent: string, error: PaymentError): Promise<void> {
    const attempts = this.retryAttempts.get(paymentIntent) || 0;
    if (attempts >= this.maxRetries) {
      throw new Error("Maximum retry attempts exceeded");
    }
    const backoffMs = 1000 * Math.pow(2, attempts);
    await new Promise((r) => setTimeout(r, backoffMs));
    this.retryAttempts.set(paymentIntent, attempts + 1);
    try {
      await this.process(paymentIntent);
      this.retryAttempts.delete(paymentIntent);
    } catch (e) {
      if (attempts + 1 < this.maxRetries) {
        return this.retryPayment(paymentIntent, error);
      }
      throw e;
    }
  }

  private async changePaymentMethod(navigation: any): Promise<void> {
    navigation.popToTop?.();
    navigation.navigate?.("Checkout", {});
  }

  private async contactSupport(error: PaymentError): Promise<void> {
    const payload = {
      type: error.type,
      code: error.code,
      message: error.message,
      transaction_id: error.supportContext.transactionId || null,
      timestamp: error.supportContext.timestamp,
      amount: error.supportContext.amount,
      currency: error.supportContext.currency
    };
    try {
      await AsyncStorage.setItem("lastPaymentError", JSON.stringify(payload));
    } catch {}
    await analytics.logEvent({
      name: "payment_support_context",
      properties: {
        type: payload.type,
        code: payload.code,
        transaction_id: payload.transaction_id
      }
    });
  }
}
