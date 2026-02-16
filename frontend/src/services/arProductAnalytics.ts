export type ARProductAnalytics = {
  productId: string;
  tryOnCount: number;
  averageTryOnDuration: number;
  conversionRate: number;
  screenshotRate: number;
  shareRate: number;
  averageIntensity: number;
  cartAddRate: number;
  comparedWith: string[];
  performanceScore: number;
};

export function calculateProductPerformanceScore(a: ARProductAnalytics): number {
  const weights = { conversionRate: 0.4, tryOnDuration: 0.2, screenshotRate: 0.2, shareRate: 0.2 };
  return a.conversionRate * weights.conversionRate + (a.averageTryOnDuration / 60) * weights.tryOnDuration + a.screenshotRate * weights.screenshotRate + a.shareRate * weights.shareRate;
}

class ProductAnalyticsStore {
  private stats = new Map<string, ARProductAnalytics>();

  recordTryOn(productId: string, duration: number, intensity: number, comparedWith: string[]) {
    const a = this.stats.get(productId) || {
      productId, tryOnCount: 0, averageTryOnDuration: 0, conversionRate: 0, screenshotRate: 0, shareRate: 0, averageIntensity: 0, cartAddRate: 0, comparedWith: [], performanceScore: 0
    };
    a.tryOnCount += 1;
    a.averageTryOnDuration = a.averageTryOnDuration === 0 ? duration : (a.averageTryOnDuration * (a.tryOnCount - 1) + duration) / a.tryOnCount;
    a.averageIntensity = a.averageIntensity === 0 ? intensity : (a.averageIntensity * (a.tryOnCount - 1) + intensity) / a.tryOnCount;
    a.comparedWith = Array.from(new Set([...a.comparedWith, ...comparedWith.filter(id => id !== productId)]));
    a.performanceScore = calculateProductPerformanceScore(a);
    this.stats.set(productId, a);
  }

  recordScreenshot(productId: string, shared: boolean) {
    const a = this.stats.get(productId);
    if (!a) return;
    const newRateBase = Math.max(1, a.tryOnCount);
    a.screenshotRate = Math.min(1, (a.screenshotRate * (newRateBase - 1) + 1) / newRateBase);
    if (shared) {
      a.shareRate = Math.min(1, (a.shareRate * (newRateBase - 1) + 1) / newRateBase);
    }
    a.performanceScore = calculateProductPerformanceScore(a);
  }

  recordAddedToCart(productId: string) {
    const a = this.stats.get(productId);
    if (!a) return;
    const base = Math.max(1, a.tryOnCount);
    a.cartAddRate = Math.min(1, (a.cartAddRate * (base - 1) + 1) / base);
    a.performanceScore = calculateProductPerformanceScore(a);
  }

  recordPurchased(productId: string) {
    const a = this.stats.get(productId);
    if (!a) return;
    const base = Math.max(1, a.tryOnCount);
    a.conversionRate = Math.min(1, (a.conversionRate * (base - 1) + 1) / base);
    a.performanceScore = calculateProductPerformanceScore(a);
  }

  getAnalytics(productId: string): ARProductAnalytics | null {
    return this.stats.get(productId) || null;
  }

  topByTryOn(n = 10): ARProductAnalytics[] {
    return Array.from(this.stats.values()).sort((a, b) => b.tryOnCount - a.tryOnCount).slice(0, n);
  }
}

export const arProductAnalyticsStore = new ProductAnalyticsStore();

