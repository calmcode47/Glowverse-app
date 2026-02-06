import React from "react";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAI } from "@context/AIContext";
import { client } from "@services/api/client";

type CacheEntry<T> = {
  timestamp: number;
  data: T;
};

type RequestOptions = {
  retry?: number;
  cacheKey?: string;
  ttlMs?: number;
  config?: AxiosRequestConfig;
};

export function usePerfectCorpAPI() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const cacheRef = React.useRef<Map<string, CacheEntry<any>>>(new Map());
  const { addHistory } = useAI();

  const loadCacheFromStorage = React.useCallback(async () => {
    const raw = await AsyncStorage.getItem("apiCache");
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, CacheEntry<any>>;
      cacheRef.current = new Map(Object.entries(obj));
    }
  }, []);

  React.useEffect(() => {
    loadCacheFromStorage();
  }, [loadCacheFromStorage]);

  const persistCache = async () => {
    const obj: Record<string, CacheEntry<any>> = {};
    cacheRef.current.forEach((v, k) => (obj[k] = v));
    await AsyncStorage.setItem("apiCache", JSON.stringify(obj));
  };

  async function call<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: unknown,
    options?: RequestOptions
  ): Promise<T | null> {
    setLoading(true);
    setError(null);
    const key = options?.cacheKey || `${method}:${path}:${JSON.stringify(data || {})}`;
    const ttl = options?.ttlMs ?? 5 * 60 * 1000;
    const now = Date.now();
    const cached = cacheRef.current.get(key);
    if (cached && now - cached.timestamp < ttl) {
      setLoading(false);
      addHistory({ endpoint: path, method, timestamp: new Date().toISOString(), status: "success" });
      return cached.data as T;
    }
    let attempts = (options?.retry ?? 2) + 1;
    let lastError: any = null;
    while (attempts > 0) {
      try {
        const req: AxiosRequestConfig = {
          url: path,
          method,
          ...(method !== "GET" ? { data } : {}),
          ...(options?.config || {})
        };
        const res: AxiosResponse<T> = await client.request<T>(req);
        cacheRef.current.set(key, { data: res.data, timestamp: now });
        await persistCache();
        addHistory({ endpoint: path, method, timestamp: new Date().toISOString(), status: "success" });
        setLoading(false);
        return res.data;
      } catch (e: any) {
        lastError = e;
        attempts -= 1;
        await new Promise((r) => setTimeout(r, 300 * (3 - attempts)));
      }
    }
    setError(lastError?.message || "API error");
    addHistory({ endpoint: path, method, timestamp: new Date().toISOString(), status: "error" });
    setLoading(false);
    return null;
  }

  return { call, loading, error };
}
