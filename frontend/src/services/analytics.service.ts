const Analytics = {
  logEvent: async (_name?: string, _params?: Record<string, any>) => {},
  setUserId: async (_id?: string) => {},
  setUserProperty: async (_name?: string, _value?: string) => {}
};

// Optional Sentry integration without hard dependency
let Sentry: any;
try {
  const name: any = "@sentry/react-native";
  Sentry = (require as any)(name);
} catch {
  Sentry = {
    addBreadcrumb: () => {},
    setUser: () => {}
  };
}

import type { Product as UIProduct } from "../data/products";
import type { Cart, CartItem } from "./api/cart.api";
import type { Order } from "./api/orders.api";
import type { Promotion } from "./api/promotions.api";
import { AnalyticsEventName, type AnalyticsEventParams } from "./analytics/types";

type Properties = Record<string, any>;

interface AnalyticsEvent {
  name: string;
  properties?: Properties;
}

class AnalyticsService {
  trackEvent<K extends AnalyticsEventName>(eventName: K, params: AnalyticsEventParams[K]): void {
    // Route through the safe wrapper to avoid module quirks
    this.logEvent({ name: String(eventName), properties: this.sanitizeParams(params as any) }).catch(() => {});
  }

  private sanitizeParams(params: any): Record<string, any> {
    const sanitized: Record<string, any> = {};
    if (!params || typeof params !== "object") return sanitized;
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (this.isPIIField(key)) {
        sanitized[key] = "[REDACTED]";
        continue;
      }
      if (Array.isArray(value)) {
        try {
          sanitized[key] = JSON.stringify(value);
        } catch {
          sanitized[key] = String(value);
        }
      } else if (typeof value === "object") {
        try {
          sanitized[key] = JSON.stringify(value);
        } catch {
          sanitized[key] = String(value);
        }
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private isPIIField(fieldName: string): boolean {
    const piiFields = ["email", "phone", "address", "credit_card", "password", "ssn"];
    return piiFields.some((pii) => fieldName.toLowerCase().includes(pii));
  }

  async logEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const props = (event && typeof event === "object" && event.properties)
        ? this.sanitizeParams(event.properties)
        : undefined;
      if (props && Object.keys(props).length > 0) {
        await Analytics.logEvent(event.name, props);
      } else {
        await Analytics.logEvent(event.name);
      }
      Sentry.addBreadcrumb?.({
        category: "analytics",
        message: event.name,
        level: "info",
        data: props || {}
      });
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("[Analytics]", event.name, props || {});
      }
    } catch (error: any) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("Analytics suppressed:", error?.message || String(error));
      }
    }
  }

  async setUserId(userId: string): Promise<void> {
    try {
      await Analytics.setUserId(userId);
      Sentry.setUser?.({ id: userId });
    } catch {}
  }

  async setUserProperties(properties: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(properties)) {
      try {
        await Analytics.setUserProperty(key, String(value));
      } catch {}
    }
  }

  async logScreenView(screenName: string, screenClass?: string): Promise<void> {
    await this.logEvent({
      name: "screen_view",
      properties: {
        screen_name: screenName,
        screen_class: screenClass || screenName
      }
    });
  }

  // E‑commerce events
  async logViewItem(item: UIProduct): Promise<void> {
    await this.logEvent({
      name: "view_item",
      properties: {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_brand: item.brand,
        price: item.price
      }
    });
  }

  async logAddToCart(item: CartItem): Promise<void> {
    await this.logEvent({
      name: "add_to_cart",
      properties: {
        item_id: item.product.id,
        item_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        value: item.total
      }
    });
  }

  async logRemoveFromCart(item: CartItem): Promise<void> {
    await this.logEvent({
      name: "remove_from_cart",
      properties: {
        item_id: item.product.id,
        item_name: item.product.name,
        quantity: item.quantity
      }
    });
  }

  async logBeginCheckout(cart: Cart): Promise<void> {
    await this.logEvent({
      name: "begin_checkout",
      properties: {
        currency: "USD",
        value: cart.total,
        items: cart.items.map((i) => ({
          item_id: i.product.id,
          item_name: i.product.name,
          quantity: i.quantity,
          price: i.price
        }))
      }
    });
  }

  async logPurchase(order: Order): Promise<void> {
    await this.logEvent({
      name: "purchase",
      properties: {
        transaction_id: order.id,
        currency: "USD",
        value: order.total,
        tax: order.tax,
        shipping: order.shipping,
        items: order.items.map((i) => ({
          item_id: i.product?.id || i.productId,
          item_name: i.product?.name,
          quantity: i.quantity,
          price: i.price
        }))
      }
    });
  }

  async logSearch(query: string, results: number): Promise<void> {
    await this.logEvent({
      name: "search",
      properties: {
        search_term: query,
        result_count: results
      }
    });
  }

  // AR & Analysis
  async logTryOnStart(product: UIProduct): Promise<void> {
    await this.logEvent({
      name: "tryon_start",
      properties: {
        product_id: product.id,
        product_name: product.name,
        category: product.category
      }
    });
  }

  async logTryOnComplete(tryOnId: string, duration: number): Promise<void> {
    await this.logEvent({
      name: "tryon_complete",
      properties: {
        tryon_id: tryOnId,
        duration_seconds: duration
      }
    });
  }

  // Sharing / Referral / Promo
  async logShare(contentType: string, method: string): Promise<void> {
    await this.logEvent({
      name: "share",
      properties: { content_type: contentType, method }
    });
  }

  async logReferralShared(code: string): Promise<void> {
    await this.logEvent({
      name: "referral_shared",
      properties: { referral_code: code }
    });
  }

  async logPromoViewed(promo: Promotion): Promise<void> {
    await this.logEvent({
      name: "promo_viewed",
      properties: {
        promo_id: promo.id,
        promo_code: promo.code,
        promo_type: (promo as any).discountLabel
      }
    });
  }

  async logPromoApplied(promo: Promotion, discount: number): Promise<void> {
    await this.logEvent({
      name: "promo_applied",
      properties: {
        promo_id: promo.id,
        promo_code: promo.code,
        discount_amount: discount
      }
    });
  }
}

export const analytics = new AnalyticsService();
