import { useState, useEffect, useRef } from "react";
import { TryOnAPI } from "@services/api";
import type { TryOn } from "@services/api/tryon.api";

type Options = {
  interval?: number;
  maxAttempts?: number;
  onComplete?: (tryOn: TryOn) => void;
  onError?: (error: string) => void;
};

export function useTryOnPolling(tryOnId: string | null, options: Options = {}) {
  const { interval = 2000, maxAttempts = 30, onComplete, onError } = options;
  const [data, setData] = useState<TryOn | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attemptsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoading(false);
  };

  const tick = async () => {
    if (!tryOnId) return;
    try {
      attemptsRef.current += 1;
      const response = await TryOnAPI.getTryOn(tryOnId);
      const tryOn = response.tryOn;
      setData(tryOn);

      if (tryOn.status === "COMPLETED") {
        stopPolling();
        onComplete?.(tryOn);
      } else if (tryOn.status === "FAILED") {
        stopPolling();
        const msg = (tryOn as any).errorMessage || "Try-on failed";
        setError(msg);
        onError?.(msg);
      }

      if (attemptsRef.current >= maxAttempts) {
        stopPolling();
        setError("Try-on timeout");
        onError?.("Timeout");
      }
    } catch (err: any) {
      stopPolling();
      const msg = err?.message || "Network error";
      setError(msg);
      onError?.(msg);
    }
  };

  const startPolling = () => {
    if (!tryOnId || intervalRef.current) return;
    setLoading(true);
    attemptsRef.current = 0;
    intervalRef.current = setInterval(tick, interval);
  };

  useEffect(() => {
    if (tryOnId) startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tryOnId]);

  return { data, loading, error, stopPolling, startPolling };
}
