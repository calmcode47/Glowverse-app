import { useCallback } from "react";
import { analytics } from "../../services/analytics.service";
import { AnalyticsEventName } from "../../services/analytics/types";

export const usePromoAnalytics = () => {
  const trackPromoApplied = useCallback((promoCode: string, discountType: "percentage" | "fixed", discountValue: number, cartValue?: number) => {
    analytics.trackEvent(AnalyticsEventName.PROMO_APPLIED, {
      promo_code: promoCode,
      discount_type: discountType,
      discount_value: discountValue,
      cart_value: cartValue
    });
  }, []);
  const trackPromoFailed = useCallback((promoCode: string, reason?: string) => {
    analytics.trackEvent(AnalyticsEventName.PROMO_FAILED, {
      promo_code: promoCode,
      discount_type: "fixed",
      discount_value: 0,
      reason
    });
  }, []);
  const trackPromoCopied = useCallback((promoCode: string) => {
    analytics.trackEvent(AnalyticsEventName.PROMO_COPIED, { promo_code: promoCode });
  }, []);
  const trackPromoViewed = useCallback((promoCode?: string) => {
    analytics.trackEvent(AnalyticsEventName.PROMO_VIEWED, { promo_code: promoCode });
  }, []);
  return { trackPromoApplied, trackPromoFailed, trackPromoCopied, trackPromoViewed };
};
