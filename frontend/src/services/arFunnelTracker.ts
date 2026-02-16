type Step = "session_started" | "product_try_on" | "added_to_cart" | "checkout_initiated" | "purchase";

export type ARFunnelData = {
  sessionsStarted: number;
  productsTried: number;
  addedToCart: number;
  checkoutInitiated: number;
  purchases: number;
  dropOffRate: {
    sessionToTryOn: number;
    tryOnToCart: number;
    cartToCheckout: number;
    checkoutToPurchase: number;
  };
  averageTimeToConvert: {
    tryOnToCart: number;
    cartToCheckout: number;
    checkoutToPurchase: number;
  };
};

class ARFunnelTrackerClass {
  private counts = { sessionsStarted: 0, productsTried: 0, addedToCart: 0, checkoutInitiated: 0, purchases: 0 };
  private times: Record<string, number> = {};
  private durations = { tryOnToCart: [] as number[], cartToCheckout: [] as number[], checkoutToPurchase: [] as number[] };

  trackFunnelStep(step: Step, data: { sessionId?: string; ts?: number }) {
    const ts = data.ts || Date.now();
    const sid = data.sessionId || "default";
    if (step === "session_started") {
      this.counts.sessionsStarted += 1;
      this.times[`${sid}:start`] = ts;
    } else if (step === "product_try_on") {
      this.counts.productsTried += 1;
      this.times[`${sid}:tryon`] = ts;
    } else if (step === "added_to_cart") {
      this.counts.addedToCart += 1;
      const t = this.times[`${sid}:tryon`];
      if (t) this.durations.tryOnToCart.push((ts - t) / 1000);
      this.times[`${sid}:cart`] = ts;
    } else if (step === "checkout_initiated") {
      this.counts.checkoutInitiated += 1;
      const c = this.times[`${sid}:cart`];
      if (c) this.durations.cartToCheckout.push((ts - c) / 1000);
      this.times[`${sid}:checkout`] = ts;
    } else if (step === "purchase") {
      this.counts.purchases += 1;
      const ch = this.times[`${sid}:checkout`];
      if (ch) this.durations.checkoutToPurchase.push((ts - ch) / 1000);
    }
  }

  calculateFunnelMetrics(): ARFunnelData {
    const d = this.counts;
    const dr = {
      sessionToTryOn: d.sessionsStarted ? Math.max(0, 100 - (d.productsTried / d.sessionsStarted) * 100) : 0,
      tryOnToCart: d.productsTried ? Math.max(0, 100 - (d.addedToCart / d.productsTried) * 100) : 0,
      cartToCheckout: d.addedToCart ? Math.max(0, 100 - (d.checkoutInitiated / d.addedToCart) * 100) : 0,
      checkoutToPurchase: d.checkoutInitiated ? Math.max(0, 100 - (d.purchases / d.checkoutInitiated) * 100) : 0
    };
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    return {
      sessionsStarted: d.sessionsStarted,
      productsTried: d.productsTried,
      addedToCart: d.addedToCart,
      checkoutInitiated: d.checkoutInitiated,
      purchases: d.purchases,
      dropOffRate: dr,
      averageTimeToConvert: {
        tryOnToCart: avg(this.durations.tryOnToCart),
        cartToCheckout: avg(this.durations.cartToCheckout),
        checkoutToPurchase: avg(this.durations.checkoutToPurchase)
      }
    };
  }

  identifyDropOffReasons(): string[] {
    const m = this.calculateFunnelMetrics();
    const reasons: string[] = [];
    if (m.dropOffRate.sessionToTryOn > 50) reasons.push("Low engagement after session start");
    if (m.dropOffRate.tryOnToCart > 50) reasons.push("Users try but don't add to cart");
    if (m.dropOffRate.cartToCheckout > 50) reasons.push("Cart friction before checkout");
    if (m.dropOffRate.checkoutToPurchase > 50) reasons.push("Checkout friction");
    return reasons;
  }
}

export const ARFunnelTracker = new ARFunnelTrackerClass();

