import { ARFunnelTracker } from "../arFunnelTracker";

describe("ARFunnelTracker", () => {
  it("computes funnel metrics and drop-offs", () => {
    const sid = "s1";
    ARFunnelTracker.trackFunnelStep("session_started", { sessionId: sid, ts: 1000 });
    ARFunnelTracker.trackFunnelStep("product_try_on", { sessionId: sid, ts: 2000 });
    ARFunnelTracker.trackFunnelStep("added_to_cart", { sessionId: sid, ts: 4000 });
    ARFunnelTracker.trackFunnelStep("checkout_initiated", { sessionId: sid, ts: 6000 });
    ARFunnelTracker.trackFunnelStep("purchase", { sessionId: sid, ts: 9000 });
    const data = ARFunnelTracker.calculateFunnelMetrics();
    expect(data.sessionsStarted).toBeGreaterThan(0);
    expect(data.purchases).toBeGreaterThan(0);
    expect(data.averageTimeToConvert.tryOnToCart).toBeGreaterThan(0);
  });
});

