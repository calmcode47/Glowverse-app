import { arAnalyticsService } from "../arAnalyticsService";
import { analytics } from "../analytics.service";

jest.mock("../analytics.service", () => ({
  analytics: {
    logEvent: jest.fn(async () => {}),
  }
}));

describe("arAnalyticsService", () => {
  it("tracks session started", async () => {
    arAnalyticsService.trackARSessionStarted({ entryPoint: "product_page", hasUsedBefore: false });
    expect(analytics.logEvent).toHaveBeenCalledWith({ name: "ar_session_started", properties: { entryPoint: "product_page", hasUsedBefore: false } });
  });

  it("tracks product try-on", () => {
    arAnalyticsService.trackProductTryOn({ productId: "p1", productName: "Prod", category: "lipstick", price: 10, tryOnSequence: 1, timeToTryOn: 500 });
    expect(analytics.logEvent).toHaveBeenCalledWith(expect.objectContaining({ name: "ar_product_try_on" }));
  });
});

