import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { config as appConfig } from "@constants/config";
import { handleAPIError } from "@utils/apiHelper";

declare module "axios" {
  export interface AxiosRequestConfig {
    retry?: number;
    retryDelayMs?: number;
  }
}

/**
 * Creates a shared Axios client with interceptors
 */
export const client: AxiosInstance = axios.create({
  baseURL: appConfig.baseUrl,
  timeout: appConfig.timeoutMs
});

client.interceptors.request.use(async (cfg) => {
  const token = await AsyncStorage.getItem("pcAuthToken");
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

    const message = handleAPIError(error);
    return Promise.reject(new Error(message));
  }
);
