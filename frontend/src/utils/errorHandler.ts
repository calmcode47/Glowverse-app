import { Alert } from "react-native";
import { handleAPIError } from "@utils/apiHelper";
import { log } from "@utils/logger";

type RetryFn = () => Promise<any>;

export function getUserFriendlyMessage(error: any): string {
  if (error?.response) return handleAPIError(error);
  if (typeof error === "string") return error;
  if (error?.message) return String(error.message);
  return "Unexpected error";
}

export async function reportError(error: any) {
  const msg = getUserFriendlyMessage(error);
  log("error", msg);
}

export async function withRetry<T>(fn: RetryFn, retries = 2): Promise<T> {
  let last: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

export function installGlobalHandler() {
  const handler = (err: any, isFatal?: boolean) => {
    reportError(err);
    const msg = getUserFriendlyMessage(err);
    if (isFatal) {
      Alert.alert("An error occurred", msg);
    }
  };
  const anyGlobal = (globalThis as any);
  if (anyGlobal.ErrorUtils && anyGlobal.ErrorUtils.setGlobalHandler) {
    anyGlobal.ErrorUtils.setGlobalHandler(handler);
  }
}
