import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStripe } from "@stripe/stripe-react-native";
import { PaymentStatus } from "../types/payment";
import type { PaymentError, PaymentIntent, PaymentMethod } from "../types/payment";
import { createCardPaymentMethod, createPaymentIntent, deletePaymentMethod, getSavedPaymentMethods, processPaymentWithAuth, savePaymentMethod } from "../services/paymentService";
import { isPaymentError } from "../types/paymentErrors";

type PaymentContextValue = {
  savedMethods: PaymentMethod[];
  selectedPaymentMethodId: string | null;
  status: PaymentStatus;
  error: PaymentError | null;
  refreshSavedMethods: () => Promise<void>;
  selectPaymentMethod: (paymentMethodId: string) => Promise<void>;
  addNewPaymentMethod: (options: { saveForFuture: boolean }) => Promise<string>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  startPayment: (params: { amountCents: number; currency: string; metadata?: Record<string, unknown> }) => Promise<PaymentIntent>;
  completePayment: (params: { clientSecret: string; paymentMethodId: string; amountCents: number; currency: string }) => Promise<{ paymentIntentId: string }>;
  clearError: () => void;
};

const SELECTED_METHOD_KEY = "selected_payment_method_id_v1";

const PaymentContext = React.createContext<PaymentContextValue>({
  savedMethods: [],
  selectedPaymentMethodId: null,
  status: PaymentStatus.IDLE,
  error: null,
  refreshSavedMethods: async () => {},
  selectPaymentMethod: async () => {},
  addNewPaymentMethod: async () => "",
  removePaymentMethod: async () => {},
  startPayment: async () => ({ id: "", status: "requires_payment_method", amount: 0, currency: "usd" }),
  completePayment: async () => ({ paymentIntentId: "" }),
  clearError: () => {}
});

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const stripe = useStripe() as any;
  const [savedMethods, setSavedMethods] = React.useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<PaymentStatus>(PaymentStatus.IDLE);
  const [error, setError] = React.useState<PaymentError | null>(null);

  const hydrateSelection = React.useCallback(async () => {
    const v = await AsyncStorage.getItem(SELECTED_METHOD_KEY);
    if (v) setSelectedPaymentMethodId(String(v));
  }, []);

  const refreshSavedMethods = React.useCallback(async () => {
    try {
      const list = await getSavedPaymentMethods();
      setSavedMethods(list);
      const cachedSelected = selectedPaymentMethodId || (await AsyncStorage.getItem(SELECTED_METHOD_KEY));
      const defaultId = list.find((m) => m.isDefault)?.id;
      const nextSelected =
        (cachedSelected && list.some((m) => m.id === cachedSelected) ? cachedSelected : null) ||
        (defaultId ? defaultId : list[0]?.id || null);
      setSelectedPaymentMethodId(nextSelected);
      if (nextSelected) await AsyncStorage.setItem(SELECTED_METHOD_KEY, nextSelected);
    } catch (e) {
      const err = isPaymentError(e) ? e : null;
      setError(err);
      setSavedMethods([]);
    }
  }, [selectedPaymentMethodId]);

  React.useEffect(() => {
    hydrateSelection().catch(() => {});
    refreshSavedMethods().catch(() => {});
  }, [hydrateSelection, refreshSavedMethods]);

  const selectPaymentMethod = React.useCallback(async (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);
    await AsyncStorage.setItem(SELECTED_METHOD_KEY, paymentMethodId);
  }, []);

  const addNewPaymentMethod = React.useCallback(
    async (options: { saveForFuture: boolean }) => {
      setStatus(PaymentStatus.PROCESSING);
      setError(null);
      try {
        const { paymentMethodId } = await createCardPaymentMethod(stripe);
        if (options.saveForFuture) {
          await savePaymentMethod(paymentMethodId);
        }
        await refreshSavedMethods();
        await selectPaymentMethod(paymentMethodId);
        setStatus(PaymentStatus.SUCCESS);
        return paymentMethodId;
      } catch (e) {
        const err = isPaymentError(e) ? e : null;
        setError(err);
        setStatus(PaymentStatus.ERROR);
        throw e;
      } finally {
        setStatus(PaymentStatus.IDLE);
      }
    },
    [refreshSavedMethods, selectPaymentMethod, stripe]
  );

  const removePaymentMethod = React.useCallback(
    async (paymentMethodId: string) => {
      setStatus(PaymentStatus.PROCESSING);
      setError(null);
      try {
        await deletePaymentMethod(paymentMethodId);
        await refreshSavedMethods();
        if (selectedPaymentMethodId === paymentMethodId) {
          const next = savedMethods.filter((m: PaymentMethod) => m.id !== paymentMethodId)[0]?.id || null;
          setSelectedPaymentMethodId(next);
          if (next) await AsyncStorage.setItem(SELECTED_METHOD_KEY, next);
        }
        setStatus(PaymentStatus.SUCCESS);
      } catch (e) {
        const err = isPaymentError(e) ? e : null;
        setError(err);
        setStatus(PaymentStatus.ERROR);
        throw e;
      } finally {
        setStatus(PaymentStatus.IDLE);
      }
    },
    [refreshSavedMethods, savedMethods, selectedPaymentMethodId]
  );

  const startPayment = React.useCallback(async (params: { amountCents: number; currency: string; metadata?: Record<string, unknown> }) => {
    setStatus(PaymentStatus.PROCESSING);
    setError(null);
    try {
      const intent = await createPaymentIntent(params.amountCents, params.currency, params.metadata);
      setStatus(PaymentStatus.SUCCESS);
      return intent;
    } catch (e) {
      const err = isPaymentError(e) ? e : null;
      setError(err);
      setStatus(PaymentStatus.ERROR);
      throw e;
    } finally {
      setStatus(PaymentStatus.IDLE);
    }
  }, []);

  const completePayment = React.useCallback(
    async (params: { clientSecret: string; paymentMethodId: string; amountCents: number; currency: string }) => {
      setStatus(PaymentStatus.PROCESSING);
      setError(null);
      try {
        const res = await processPaymentWithAuth({
          stripe,
          clientSecret: params.clientSecret,
          paymentMethodId: params.paymentMethodId,
          amount: params.amountCents,
          currency: params.currency
        });
        setStatus(PaymentStatus.SUCCESS);
        return res;
      } catch (e) {
        const err = isPaymentError(e) ? e : null;
        setError(err);
        setStatus(PaymentStatus.ERROR);
        throw e;
      } finally {
        setStatus(PaymentStatus.IDLE);
      }
    },
    [stripe]
  );

  const clearError = React.useCallback(() => setError(null), []);

  const value: PaymentContextValue = {
    savedMethods,
    selectedPaymentMethodId,
    status,
    error,
    refreshSavedMethods,
    selectPaymentMethod,
    addNewPaymentMethod,
    removePaymentMethod,
    startPayment,
    completePayment,
    clearError
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayment() {
  return React.useContext(PaymentContext);
}
