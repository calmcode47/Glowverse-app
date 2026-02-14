import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../../config/environment";
import { config } from "../../constants/config";
import { handleAPIError } from "@utils/apiHelper";
import { analytics } from "../analytics.service";
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require("@sentry/react-native");
} catch {}

declare module "axios" {
  export interface AxiosRequestConfig {
    retry?: number;
    retryDelayMs?: number;
    _retry?: boolean;
    __retryCount?: number;
    __startTimeMs?: number;
  }
}

/**
 * Creates a shared Axios client with interceptors
 */
export const client: AxiosInstance = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: config.timeoutMs
});

export type TokenProvider = {
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  clearTokens: () => Promise<void>;
};

let tokenProvider: TokenProvider | null = null;

export function registerAuthTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

async function getAccessToken(): Promise<string | null> {
  if (tokenProvider?.getAccessToken) return tokenProvider.getAccessToken();
  const v = await SecureStore.getItemAsync("pcAuthToken");
  if (v) return v;
  return AsyncStorage.getItem("pcAuthToken");
}

async function getRefreshToken(): Promise<string | null> {
  if (tokenProvider?.getRefreshToken) return tokenProvider.getRefreshToken();
  const v = await SecureStore.getItemAsync("pcRefreshToken");
  if (v) return v;
  return AsyncStorage.getItem("pcRefreshToken");
}

async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (tokenProvider?.setTokens) return tokenProvider.setTokens(accessToken, refreshToken);
  await SecureStore.setItemAsync("pcAuthToken", accessToken);
  await SecureStore.setItemAsync("pcRefreshToken", refreshToken);
  await AsyncStorage.setItem("pcAuthToken", accessToken);
  await AsyncStorage.setItem("pcRefreshToken", refreshToken);
}

let refreshing: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const rt = await getRefreshToken();
    if (!rt) {
      if (tokenProvider?.clearTokens) await tokenProvider.clearTokens();
      await SecureStore.deleteItemAsync("pcAuthToken");
      await SecureStore.deleteItemAsync("pcRefreshToken");
      await AsyncStorage.removeItem("pcAuthToken");
      await AsyncStorage.removeItem("pcRefreshToken");
      throw new Error("Authentication required");
    }
    const overrideBase = await AsyncStorage.getItem("apiBaseUrl");
    const base = overrideBase || client.defaults.baseURL || "";
    const res = await axios.post(`${base}/api/${"v1"}/auth/refresh`, { refreshToken: rt }, { timeout: config.timeoutMs });
    const data = res.data as { accessToken: string; refreshToken: string };
    await setTokens(data.accessToken, data.refreshToken);
  })();
  try {
    await refreshing;
  } finally {
    refreshing = null;
  }
}

client.interceptors.request.use(async (cfg) => {
  cfg.__startTimeMs = Date.now();
  const token = await getAccessToken();
  const overrideBase = await AsyncStorage.getItem("apiBaseUrl");
  if (overrideBase) {
    cfg.baseURL = overrideBase;
  }
  if (token) {
    cfg.headers = {
      ...(cfg.headers || {}),
      Authorization: `Bearer ${token}`
    } as any;
  }
  cfg.headers = {
    Accept: "application/json",
    "Content-Type": (cfg.data instanceof FormData) ? "multipart/form-data" : "application/json",
    "X-Client-Version": "1.0.0",
    "X-Platform": (typeof navigator !== "undefined" && (navigator as any).product === "ReactNative") ? "react-native" : "web",
    ...(cfg.headers || {})
  } as any;
  // Exponential backoff defaults
  if (cfg.__retryCount === undefined) cfg.__retryCount = 0;
  if (cfg.retry === undefined) cfg.retry = 3;
  if (cfg.retryDelayMs === undefined) cfg.retryDelayMs = 1000;
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[API Request] ${String(cfg.method || "GET").toUpperCase()} ${cfg.baseURL || ""}${cfg.url}`, {
      params: cfg.params,
      data: cfg.data
    });
  }
  return cfg;
});

client.interceptors.response.use(
  (res: AxiosResponse) => {
    const cfg = res.config as AxiosRequestConfig;
    const latency = cfg.__startTimeMs ? Date.now() - cfg.__startTimeMs : undefined;
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log(`[API Response] ${String(res.config.method || "GET").toUpperCase()} ${res.config.url}`, {
        status: res.status,
        latency
      });
    }
    if (latency !== undefined) {
      analytics.logEvent({
        name: "api_latency",
        properties: {
          endpoint: res.config.url,
          method: res.config.method,
          status: res.status,
          latency
        }
      });
    }
    return res;
  },
  async (error) => {
    if (!error?.response) {
      const apiError: any = new Error("No internet connection. Please check your network.");
      apiError.code = "NETWORK_ERROR";
      apiError.userMessage = "Unable to connect. Check your internet connection.";
      apiError.retryable = true;
      apiError.status = 0;
      analytics.logEvent({
        name: "api_error",
        properties: {
          code: apiError.code,
          status: apiError.status,
          endpoint: error.config?.url,
          method: error.config?.method
        }
      });
      Sentry?.captureException?.(error, {
        tags: { api_error: true, error_code: apiError.code },
        extra: { apiError }
      });
      return Promise.reject(apiError);
    }
    const cfg = error.config as AxiosRequestConfig | undefined;
    const status = error?.response?.status;
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const shouldRetry =
      cfg &&
      (cfg.retry ?? 0) > 0 &&
      (!status || retryableStatuses.includes(status));

    if (shouldRetry && cfg) {
      const attempt = cfg.__retryCount ?? 0;
      const baseDelay = cfg.retryDelayMs ?? 1000;
      const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
      const jitter = delay * 0.25 * ((Math.random() * 2) - 1);
      const finalDelay = Math.max(0, Math.round(delay + jitter));
      cfg.__retryCount = attempt + 1;
      cfg.retry = (cfg.retry ?? 0) - 1;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`[API Retry] attempt ${cfg.__retryCount} in ${finalDelay}ms for ${cfg.url}`);
      }
      await new Promise((r) => setTimeout(r, finalDelay));
      return client.request(cfg);
    }

    if (status === 401 && cfg && !cfg._retry) {
      try {
        cfg._retry = true;
        await refreshTokens();
        const token = await getAccessToken();
        if (token) {
          cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` } as any;
        } else {
          if (tokenProvider?.clearTokens) await tokenProvider.clearTokens();
          await SecureStore.deleteItemAsync("pcAuthToken");
          await SecureStore.deleteItemAsync("pcRefreshToken");
          await AsyncStorage.removeItem("pcAuthToken");
          await AsyncStorage.removeItem("pcRefreshToken");
          throw new Error("Authentication required");
        }
        return client.request(cfg);
      } catch (e) {
        if (tokenProvider?.clearTokens) await tokenProvider.clearTokens();
        await SecureStore.deleteItemAsync("pcAuthToken");
        await SecureStore.deleteItemAsync("pcRefreshToken");
        await AsyncStorage.removeItem("pcAuthToken");
        await AsyncStorage.removeItem("pcRefreshToken");
      }
    }

    const message = handleAPIError(error);
    const apiError: any = new Error(message);
    apiError.status = status;
    apiError.code = error.response?.data?.error_code || `HTTP_${status}`;
    apiError.userMessage = message;
    apiError.retryable = retryableStatuses.includes(status);
    apiError.details = error.response?.data?.details;
    analytics.logEvent({
      name: "api_error",
      properties: {
        code: apiError.code,
        status: apiError.status,
        endpoint: error.config?.url,
        method: error.config?.method
      }
    });
    Sentry?.captureException?.(error, {
      tags: { api_error: true, error_code: apiError.code },
      extra: {
        apiError,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      }
    });
    return Promise.reject(apiError);
  }
);
