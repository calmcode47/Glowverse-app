import React from "react";
import { ARFunnelTracker } from "../services/arFunnelTracker";
import { arProductAnalyticsStore } from "../services/arProductAnalytics";

export type AnalyticsFilters = { from?: Date; to?: Date; productId?: string; segment?: string };
export type ARMetrics = { funnel: ReturnType<typeof ARFunnelTracker.calculateFunnelMetrics>; topTried: ReturnType<typeof arProductAnalyticsStore.topByTryOn> };

export function useARAnalytics(filters?: AnalyticsFilters) {
  const [metrics, setMetrics] = React.useState<ARMetrics | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(() => {
    setLoading(true);
    const funnel = ARFunnelTracker.calculateFunnelMetrics();
    const topTried = arProductAnalyticsStore.topByTryOn(10);
    setMetrics({ funnel, topTried });
    setLoading(false);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [JSON.stringify(filters)]);

  const exportData = React.useCallback(() => {
    return JSON.stringify(metrics || {}, null, 2);
  }, [metrics]);

  return { metrics, loading, refresh, exportData };
}

