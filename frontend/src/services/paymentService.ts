import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "./api/client";
import type { PaymentIntent, PaymentMethod } from "../types/payment";
import type { PaymentError } from "../types/paymentErrors";
import { parseBackendError, parseStripeError, logPaymentError, getRetryDelay } from "./payments/paymentErrorHandler";
import { retryPayment, createRetryController } from "./payments/paymentRetryService";

const METHODS_CACHE_KEY = "payment_methods_cache_v1";
const DEFAULT_METHOD_KEY = "default_payment_method_id_v1";
const REQUEST_TIMEOUT_MS = 30000;

type StripeConfirmResult = {
  paymentIntent?: { id?: string; status?: string; clientSecret?: string };
  error?: { code?: string; message?: string; decline_code?: string; type?: string };
};

export type StripeLike = {
  confirmPayment: (clientSecret: string, params: { paymentMethodId: string }) => Promise<StripeConfirmResult>;
  handleNextAction: (clientSecret: string) => Promise<StripeConfirmResult>;
  createPaymentMethod: (params: { paymentMethodType: "Card" }) => Promise<{ paymentMethod?: { id?: string; card?: any }; error?: any }>;
};

function mapBrand(raw: string | undefined): PaymentMethod["brand"] {
  const v = String(raw || "").toLowerCase();
  if (v === "visa") return "visa";
  if (v === "mastercard") return "mastercard";
  if (v === "amex") return "amex";
  if (v === "discover") return "discover";
  return "unknown";
}

function withTimeout<T>(p: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      const err: PaymentError = {
        type: "TimeoutError",
        code: "timeout",
        message: "The request timed out. Please try again.",
        technicalMessage: `timeout after ${timeoutMs}ms`,
        retryable: true,
        retryDelay: 1000,
        suggestedAction: "Retry"
      };
      reject(err);
    }, timeoutMs);
    p.then(
      (v) => {
        clearTimeout(timeout);
        resolve(v);
      },
      (e) => {
        clearTimeout(timeout);
        reject(e);
      }
    );
  });
}

async function apiWithRetry<T>(
  operation: string,
  fn: () => Promise<T>,
  context: Record<string, unknown>,
  maxAttempts: number = 3
): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      return await withTimeout(fn(), REQUEST_TIMEOUT_MS);
    } catch (e) {
      const parsed = parseBackendError(e);
      if (!parsed.retryable || attempt >= maxAttempts) {
        logPaymentError(parsed, { operation, attempt, ...context });
        throw parsed;
      }
      const delay = getRetryDelay(attempt);
      logPaymentError(parsed, { operation, attempt, retryInMs: delay, ...context });
      await new Promise((r) => setTimeout(r, delay));
      attempt += 1;
    }
  }
}

function mapIntent(data: any): PaymentIntent {
  return {
    id: String(data.id || data.paymentIntentId || data.payment_intent_id || ""),
    clientSecret: data.clientSecret ? String(data.clientSecret) : data.client_secret ? String(data.client_secret) : undefined,
    status: String(data.status || "requires_payment_method") as PaymentIntent["status"],
    amount: Number(data.amount || 0),
    currency: String(data.currency || "usd")
  };
}

function mapMethod(data: any, defaultId?: string | null): PaymentMethod {
  const card = data.card || {};
  const id = String(data.id || data.paymentMethodId || "");
  return {
    id,
    brand: mapBrand(card.brand || data.brand),
    last4: String(card.last4 || data.last4 || "0000"),
    expMonth: card.exp_month ? Number(card.exp_month) : card.expiryMonth ? Number(card.expiryMonth) : undefined,
    expYear: card.exp_year ? Number(card.exp_year) : card.expiryYear ? Number(card.expiryYear) : undefined,
    isDefault: defaultId ? id === defaultId : Boolean(data.isDefault)
  };
}

async function getDefaultMethodId(): Promise<string | null> {
  const v = await AsyncStorage.getItem(DEFAULT_METHOD_KEY);
  return v ? String(v) : null;
}

async function setDefaultMethodId(paymentMethodId: string): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_METHOD_KEY, paymentMethodId);
}

async function getCachedMethods(): Promise<PaymentMethod[]> {
  const raw = await AsyncStorage.getItem(METHODS_CACHE_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as any[];
    const defaultId = await getDefaultMethodId();
    return Array.isArray(arr) ? arr.map((x) => mapMethod(x, defaultId)) : [];
  } catch {
    return [];
  }
}

async function setCachedMethods(methods: PaymentMethod[]): Promise<void> {
  const serializable = methods.map((m) => ({
    id: m.id,
    brand: m.brand,
    last4: m.last4,
    expMonth: m.expMonth,
    expYear: m.expYear,
    isDefault: m.isDefault
  }));
  await AsyncStorage.setItem(METHODS_CACHE_KEY, JSON.stringify(serializable));
}

export async function createPaymentIntent(amount: number, currency: string, metadata?: Record<string, unknown>): Promise<PaymentIntent> {
  const res = await apiWithRetry(
    "createPaymentIntent",
    () => client.post("/api/v1/payments/create-intent", { amount, currency, metadata }),
    { amount, currency }
  );
  const data = (res as any).data || {};
  return mapIntent(data);
}

export async function confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<PaymentIntent> {
  const res = await apiWithRetry(
    "confirmPayment",
    () => client.post("/api/v1/payments/confirm", { paymentIntentId, paymentMethodId }),
    { paymentIntentId, paymentMethodId }
  );
  const data = (res as any).data || {};
  return mapIntent(data.paymentIntent || data);
}

export async function getSavedPaymentMethods(): Promise<PaymentMethod[]> {
  const defaultId = await getDefaultMethodId();
  try {
    const res = await apiWithRetry("getSavedPaymentMethods", () => client.get("/api/v1/payments/methods"), {});
    const data = (res as any).data || {};
    const arr = Array.isArray(data.methods) ? data.methods : Array.isArray(data.paymentMethods) ? data.paymentMethods : Array.isArray(data) ? data : [];
    const methods = arr.map((m: any) => mapMethod(m, defaultId));
    await setCachedMethods(methods);
    return methods;
  } catch (e) {
    return await getCachedMethods();
  }
}

export async function savePaymentMethod(paymentMethodId: string): Promise<void> {
  await apiWithRetry("savePaymentMethod", () => client.post("/api/v1/payments/methods", { paymentMethodId }), { paymentMethodId });
  await setDefaultMethodId(paymentMethodId);
  const existing = await getCachedMethods();
  const updated = existing.map((m) => ({ ...m, isDefault: m.id === paymentMethodId }));
  await setCachedMethods(updated);
}

export async function deletePaymentMethod(paymentMethodId: string): Promise<void> {
  await apiWithRetry(
    "deletePaymentMethod",
    () => client.delete(`/api/v1/payments/methods/${encodeURIComponent(paymentMethodId)}`),
    { paymentMethodId }
  );
  const existing = await getCachedMethods();
  const updated = existing.filter((m) => m.id !== paymentMethodId);
  await setCachedMethods(updated);
  const defaultId = await getDefaultMethodId();
  if (defaultId === paymentMethodId) {
    await AsyncStorage.removeItem(DEFAULT_METHOD_KEY);
  }
}

export async function processPaymentWithAuth(params: {
  stripe: StripeLike;
  clientSecret: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
}): Promise<{ paymentIntentId: string }> {
  const controller = createRetryController();
  const run = async () => {
    const res = await params.stripe.confirmPayment(params.clientSecret, { paymentMethodId: params.paymentMethodId });
    if (res.error) throw parseStripeError(res.error);
    const status = String(res.paymentIntent?.status || "");
    if (status === "requires_action") {
      const next = await params.stripe.handleNextAction(params.clientSecret);
      if (next.error) throw parseStripeError(next.error);
      const nextStatus = String(next.paymentIntent?.status || "");
      if (nextStatus !== "succeeded") {
        throw parseStripeError({ code: "three_d_secure_authentication_failed", message: "Authentication incomplete" });
      }
      const id = String(next.paymentIntent?.id || "");
      if (!id) throw parseStripeError({ code: "unknown", message: "Missing payment intent id" });
      return { paymentIntentId: id };
    }
    if (status !== "succeeded") {
      throw parseStripeError({ code: "processing_error", message: "Payment not completed" });
    }
    const id = String(res.paymentIntent?.id || "");
    if (!id) throw parseStripeError({ code: "unknown", message: "Missing payment intent id" });
    return { paymentIntentId: id };
  };

  try {
    return await retryPayment(run, 3, {
      type: "NetworkError",
      code: "network_error",
      message: "We couldn't process your payment due to a network error. Please try again.",
      technicalMessage: "retry wrapper",
      retryable: true,
      retryDelay: 1000,
      suggestedAction: "Retry Payment"
    }, controller);
  } catch (e) {
    const parsed = parseStripeError(e);
    logPaymentError(parsed, { operation: "processPaymentWithAuth", amount: params.amount, currency: params.currency });
    throw parsed;
  }
}

export async function createCardPaymentMethod(stripe: StripeLike): Promise<{ paymentMethodId: string }> {
  try {
    const res = await stripe.createPaymentMethod({ paymentMethodType: "Card" });
    if (res.error) throw parseStripeError(res.error);
    const id = String(res.paymentMethod?.id || "");
    if (!id) throw parseStripeError({ code: "unknown", message: "Unable to create payment method" });
    return { paymentMethodId: id };
  } catch (e) {
    const parsed = parseStripeError(e);
    logPaymentError(parsed, { operation: "createCardPaymentMethod" });
    throw parsed;
  }
}
