import { useState, useEffect, useRef } from "react";
import { AnalysisAPI } from "@services/api";
import type { Analysis } from "@services/api/analysis.api";

type Options = {
  interval?: number;
  maxAttempts?: number;
  onComplete?: (analysis: Analysis) => void;
  onError?: (error: string) => void;
};

export function useAnalysisPolling(analysisId: string | null, options: Options = {}) {
  const { interval = 2000, maxAttempts = 30, onComplete, onError } = options;
  const [data, setData] = useState<Analysis | null>(null);
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
    if (!analysisId) return;
    try {
      attemptsRef.current += 1;
      const response = await AnalysisAPI.getAnalysis(analysisId);
      const analysis = response.analysis;
      setData(analysis);

      if (analysis.status === "COMPLETED") {
        stopPolling();
        onComplete?.(analysis);
      } else if (analysis.status === "FAILED") {
        stopPolling();
        const msg = (analysis as any).errorMessage || "Analysis failed";
        setError(msg);
        onError?.(msg);
      }

      if (attemptsRef.current >= maxAttempts) {
        stopPolling();
        setError("Analysis timeout");
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
    if (!analysisId || intervalRef.current) return;
    setLoading(true);
    attemptsRef.current = 0;
    intervalRef.current = setInterval(tick, interval);
  };

  useEffect(() => {
    if (analysisId) startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  return { data, loading, error, stopPolling, startPolling };
}
