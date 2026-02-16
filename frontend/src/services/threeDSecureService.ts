import type { PaymentIntent } from "../types/payment";
import type { PaymentError } from "../types/paymentErrors";
import { parseStripeError, logPaymentError } from "./payments/paymentErrorHandler";

type StripeNextActionResult = {
  paymentIntent?: { id?: string; status?: string };
  error?: { code?: string; message?: string; decline_code?: string; type?: string };
};

export type StripeNextActionLike = {
  handleNextAction: (clientSecret: string) => Promise<StripeNextActionResult>;
};

export async function handle3DSAuthentication(params: {
  stripe: StripeNextActionLike;
  paymentIntent: PaymentIntent;
  timeoutMs?: number;
}): Promise<{ paymentIntentId: string }> {
  const { stripe, paymentIntent } = params;
  if (paymentIntent.status !== "requires_action") {
    return { paymentIntentId: paymentIntent.id };
  }
  const clientSecret = paymentIntent.clientSecret;
  if (!clientSecret) {
    const err: PaymentError = {
      type: "AuthenticationError",
      code: "missing_client_secret",
      message: "We couldn’t start authentication. Please try again.",
      technicalMessage: "paymentIntent.clientSecret missing for 3DS",
      retryable: true,
      retryDelay: 1000,
      suggestedAction: "Retry"
    };
    logPaymentError(err, { operation: "handle3DSAuthentication" });
    throw err;
  }

  const timeoutMs = params.timeoutMs ?? 5 * 60 * 1000;

  try {
    const res = await new Promise<StripeNextActionResult>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          parseStripeError({
            code: "three_d_secure_authentication_failed",
            message: "Authentication timed out"
          })
        );
      }, timeoutMs);
      stripe
        .handleNextAction(clientSecret)
        .then((v) => {
          clearTimeout(timeout);
          resolve(v);
        })
        .catch((e) => {
          clearTimeout(timeout);
          reject(e);
        });
    });

    if (res.error) throw parseStripeError(res.error);
    const status = String(res.paymentIntent?.status || "");
    if (status !== "succeeded") {
      throw parseStripeError({ code: "three_d_secure_authentication_failed", message: "Authentication incomplete" });
    }
    const id = String(res.paymentIntent?.id || paymentIntent.id || "");
    if (!id) throw parseStripeError({ code: "three_d_secure_authentication_failed", message: "Missing payment intent id" });
    return { paymentIntentId: id };
  } catch (e) {
    const parsed = parseStripeError(e);
    logPaymentError(parsed, { operation: "handle3DSAuthentication" });
    throw parsed;
  }
}

