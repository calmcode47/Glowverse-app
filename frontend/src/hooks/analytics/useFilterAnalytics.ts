import { useCallback } from "react";
import { analytics } from "../../services/analytics.service";
import { AnalyticsEventName } from "../../services/analytics/types";

export const useFilterAnalytics = () => {
  const trackApply = useCallback((filter_type: "category" | "price" | "brand" | "rating" | "sort", filter_value: string | number, results_count: number) => {
    analytics.trackEvent(AnalyticsEventName.APPLY_FILTER, { filter_type, filter_value, results_count });
  }, []);
  const trackRemove = useCallback((filter_type: "category" | "price" | "brand" | "rating", filter_value: string | number, results_count: number) => {
    analytics.trackEvent(AnalyticsEventName.REMOVE_FILTER, { filter_type, filter_value, results_count });
  }, []);
  const trackSort = useCallback((sortKey: string, results_count: number) => {
    analytics.trackEvent(AnalyticsEventName.CHANGE_SORT, { filter_type: "sort", filter_value: sortKey, results_count });
  }, []);
  return { trackApply, trackRemove, trackSort };
};
