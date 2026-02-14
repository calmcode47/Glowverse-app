import React from "react";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { useAI } from "@context/AIContext";
import { client } from "@services/api/client";

type RequestOptions = {
  retry?: number;
  config?: AxiosRequestConfig;
};

export function usePerfectCorpAPI() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { addHistory } = useAI();

  async function call<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: unknown,
    options?: RequestOptions
  ): Promise<T | null> {
    setLoading(true);
    setError(null);
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
