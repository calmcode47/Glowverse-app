import { useCallback } from "react";
import { analytics } from "../../services/analytics.service";
import { AnalyticsEventName } from "../../services/analytics/types";

export const useReviewAnalytics = () => {
  const trackStarted = useCallback((itemId: string, itemName?: string) => {
    analytics.trackEvent(AnalyticsEventName.REVIEW_STARTED, { item_id: itemId, item_name: itemName });
  }, []);
  const trackSubmitted = useCallback((itemId: string, rating: number, commentLength?: number) => {
    analytics.trackEvent(AnalyticsEventName.REVIEW_SUBMITTED, { item_id: itemId, rating, comment_length: commentLength });
  }, []);
  return { trackStarted, trackSubmitted };
};
