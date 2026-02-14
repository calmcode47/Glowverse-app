import { useCallback } from "react";
import { analytics } from "../../services/analytics.service";
import { AnalyticsEventName } from "../../services/analytics/types";
import type { Product } from "../../data/products";

export const useWishlistAnalytics = () => {
  const trackAddToWishlist = useCallback((product: Product, source: "product_detail" | "product_list") => {
    analytics.trackEvent(AnalyticsEventName.ADD_TO_WISHLIST, {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      currency: "USD",
      source
    });
  }, []);
  const trackRemoveFromWishlist = useCallback((product: Product, source: "product_detail" | "product_list") => {
    analytics.trackEvent(AnalyticsEventName.REMOVE_FROM_WISHLIST, {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      currency: "USD",
      source
    });
  }, []);
  return { trackAddToWishlist, trackRemoveFromWishlist };
};
