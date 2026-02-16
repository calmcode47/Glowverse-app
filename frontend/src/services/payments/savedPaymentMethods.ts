import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFromStorage, saveToStorage } from "../../utils/storage";

const METHODS_KEY = "payments:saved_methods:v1";
const DEFAULT_METHOD_KEY = "payments:default_method_id:v1";

export type SavedPaymentMethod = {
  id: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  addedAt: string;
};

export async function listSavedPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const raw = await getFromStorage<unknown>(METHODS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m) => m && typeof m === "object" && typeof (m as any).id === "string")
    .map((m) => m as SavedPaymentMethod);
}

export async function getDefaultSavedPaymentMethodId(): Promise<string | null> {
  const v = await AsyncStorage.getItem(DEFAULT_METHOD_KEY);
  return v ? String(v) : null;
}

export async function setDefaultSavedPaymentMethodId(paymentMethodId: string): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_METHOD_KEY, paymentMethodId);
}

export async function upsertSavedPaymentMethod(method: Omit<SavedPaymentMethod, "addedAt"> & { addedAt?: string }): Promise<void> {
  const existing = await listSavedPaymentMethods();
  const normalized: SavedPaymentMethod = { ...method, addedAt: method.addedAt || new Date().toISOString() };
  const next = [normalized, ...existing.filter((m) => m.id !== normalized.id)];
  await saveToStorage(METHODS_KEY, next.slice(0, 10));
}

export async function removeSavedPaymentMethod(paymentMethodId: string): Promise<void> {
  const existing = await listSavedPaymentMethods();
  const next = existing.filter((m) => m.id !== paymentMethodId);
  await saveToStorage(METHODS_KEY, next);
  const def = await getDefaultSavedPaymentMethodId();
  if (def === paymentMethodId) {
    await AsyncStorage.removeItem(DEFAULT_METHOD_KEY);
  }
}

