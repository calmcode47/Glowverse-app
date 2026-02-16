import React from "react";

export function useApi<T>(apiCall: () => Promise<T>) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  return { data, loading, error, execute };
}

