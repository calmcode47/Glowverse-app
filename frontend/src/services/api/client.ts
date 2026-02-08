import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config as appConfig } from "@constants/config";
import { handleAPIError } from "@utils/apiHelper";

declare module "axios" {
  export interface AxiosRequestConfig {
    retry?: number;
    retryDelayMs?: number;
    _retry?: boolean;
  }
}

/**
 * Creates a shared Axios client with interceptors
 */
export const client: AxiosInstance = axios.create({
  baseURL: appConfig.baseUrl,
  timeout: appConfig.timeoutMs
});

async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem("pcAuthToken");
}

async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem("pcRefreshToken");
}

async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.setItem("pcAuthToken", accessToken);
  await AsyncStorage.setItem("pcRefreshToken", refreshToken);
}

let refreshing: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const rt = await getRefreshToken();
    if (!rt) {
      await AsyncStorage.removeItem("pcAuthToken");
      throw new Error("Authentication required");
    }
    const overrideBase = await AsyncStorage.getItem("apiBaseUrl");
    const base = overrideBase || client.defaults.baseURL || "";
    const res = await axios.post(`${base}/api/${"v1"}/auth/refresh`, { refreshToken: rt }, { timeout: appConfig.timeoutMs });
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
    ...(cfg.headers || {})
  } as any;
  if (cfg.data instanceof FormData) {
    (cfg.headers as any)["Content-Type"] = "multipart/form-data";
  }
  if (cfg.retry === undefined) cfg.retry = 2;
  if (cfg.retryDelayMs === undefined) cfg.retryDelayMs = 400;
  return cfg;
});

client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error) => {
    const cfg = error.config as AxiosRequestConfig | undefined;
    const status = error?.response?.status;
    const shouldRetry =
      cfg &&
      (cfg.retry ?? 0) > 0 &&
      (!status || [429, 500, 502, 503, 504].includes(status));

    if (shouldRetry && cfg) {
      cfg.retry = (cfg.retry ?? 0) - 1;
      const delay = cfg.retryDelayMs ?? 400;
      await new Promise((r) => setTimeout(r, delay));
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
          await AsyncStorage.removeItem("pcAuthToken");
          await AsyncStorage.removeItem("pcRefreshToken");
          throw new Error("Authentication required");
        }
        return client.request(cfg);
      } catch (e) {
        await AsyncStorage.removeItem("pcAuthToken");
        await AsyncStorage.removeItem("pcRefreshToken");
      }
    }

    const message = handleAPIError(error);
    return Promise.reject(new Error(message));
  }
);
