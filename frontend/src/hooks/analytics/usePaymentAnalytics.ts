import { useCallback } from "react";
import { analytics } from "../../services/analytics.service";
import { AnalyticsEventName } from "../../services/analytics/types";

export const usePaymentAnalytics = () => {
  const trackSelected = useCallback((method: "card" | "paypal" | "applepay" | "googlepay") => {
    analytics.trackEvent(AnalyticsEventName.PAYMENT_METHOD_SELECTED, { method });
  }, []);
  const trackAdded = useCallback((method: "card" | "paypal" | "applepay" | "googlepay", id?: string) => {
    analytics.trackEvent(AnalyticsEventName.PAYMENT_METHOD_ADDED, { method, payment_method_id: id });
  }, []);
  return { trackSelected, trackAdded };
};
