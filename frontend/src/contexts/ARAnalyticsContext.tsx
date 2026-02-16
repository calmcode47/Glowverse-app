import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import type { ARError } from "../modules/ar-sdk/types";
import { arAnalyticsService, type DeviceInfo } from "../services/arAnalyticsService";
import { ARPerformanceMonitor, type ARPerformanceMetrics } from "../services/arPerformanceMonitor";
import { ARFunnelTracker } from "../services/arFunnelTracker";
import { arProductAnalyticsStore } from "../services/arProductAnalytics";

export type ARSessionData = {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  entryPoint: string;
  productsTried: Array<{ productId: string; startTime: Date; endTime?: Date; intensityChanges: number }>;
  screenshotsTaken: number;
  screenshotsShared: number;
  productsAddedToCart: string[];
  errors: Array<{ type: string; time: Date }>;
  performanceMetrics: ARPerformanceMetrics;
};

export type ARAnalyticsContextValue = {
  sessionData: ARSessionData | null;
  startSession(entryPoint: string): void;
  endSession(): void;
  trackProductTryOn(productId: string): void;
  trackIntensityChange(productId: string, intensity: number): void;
  trackScreenshot(products: string[], shared: boolean): void;
  trackProductAddedToCart(productId: string): void;
  trackError(error: ARError): void;
  trackPerformance(metrics: ARPerformanceMetrics): void;
};

const Ctx = React.createContext<ARAnalyticsContextValue | undefined>(undefined);

export function ARAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [sessionData, setSessionData] = React.useState<ARSessionData | null>(null);
  const [hasUsedBefore, setHasUsedBefore] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem("ar_has_used").then(v => setHasUsedBefore(v === "true"));
  }, []);

  React.useEffect(() => {
    const sub = AppState.addEventListener("change", state => {
      if (state !== "active") endSession();
    });
    return () => sub.remove();
  }, [sessionData]);

  const startSession = React.useCallback((entryPoint: string) => {
    if (sessionData?.endTime == null && sessionData != null) return;
    const sid = `arsess_${Date.now()}`;
    const d: ARSessionData = {
      sessionId: sid,
      startTime: new Date(),
      entryPoint,
      productsTried: [],
      screenshotsTaken: 0,
      screenshotsShared: 0,
      productsAddedToCart: [],
      errors: [],
      performanceMetrics: { fps: 0, memoryUsage: 0, batteryLevel: -1, batteryDrain: 0, frameDrops: 0, cameraLatency: 0, productLoadTime: 0, deviceInfo: { model: "", os: "", osVersion: "", ram: 0 } }
    };
    setSessionData(d);
    ARPerformanceMonitor.startMonitoring();
    ARFunnelTracker.trackFunnelStep("session_started", { sessionId: sid });
    arAnalyticsService.trackARSessionStarted({ entryPoint: entryPoint as any, hasUsedBefore });
    AsyncStorage.setItem("ar_has_used", "true").catch(() => {});
  }, [sessionData, hasUsedBefore]);

  const endSession = React.useCallback(() => {
    if (!sessionData || sessionData.endTime) return;
    const end = new Date();
    const durationSec = Math.round((end.getTime() - sessionData.startTime.getTime()) / 1000);
    const productsTriedCount = sessionData.productsTried.length;
    const screenshotsTaken = sessionData.screenshotsTaken;
    const productsAddedToCart = sessionData.productsAddedToCart.length;
    setSessionData({ ...sessionData, endTime: end });
    ARPerformanceMonitor.stopMonitoring();
    arAnalyticsService.trackARSessionEnded({ duration: durationSec, productsTriedCount, screenshotsTaken, productsAddedToCart });
  }, [sessionData]);

  const trackProductTryOn = React.useCallback((productId: string) => {
    if (!sessionData) return;
    const startTime = new Date();
    const updated: ARSessionData = { ...sessionData, productsTried: [...sessionData.productsTried, { productId, startTime, intensityChanges: 0 }] };
    setSessionData(updated);
    const tryOnSequence = updated.productsTried.length;
    const timeToTryOn = startTime.getTime() - sessionData.startTime.getTime();
    arAnalyticsService.trackProductTryOn({ productId, productName: productId, category: "unknown", price: 0, tryOnSequence, timeToTryOn });
    ARFunnelTracker.trackFunnelStep("product_try_on", { sessionId: updated.sessionId });
    const comparedWith = updated.productsTried.map(p => p.productId);
    arProductAnalyticsStore.recordTryOn(productId, Math.round(timeToTryOn / 1000), 80, comparedWith);
  }, [sessionData]);

  const trackIntensityChange = React.useCallback((productId: string, intensity: number) => {
    if (!sessionData) return;
    const idx = sessionData.productsTried.findIndex(p => p.productId === productId);
    if (idx >= 0) {
      const arr = [...sessionData.productsTried];
      arr[idx] = { ...arr[idx], intensityChanges: arr[idx].intensityChanges + 1 };
      setSessionData({ ...sessionData, productsTried: arr });
    }
    arAnalyticsService.trackProductIntensityChanged({ productId, intensityValue: intensity, changeCount: 1 });
  }, [sessionData]);

  const trackScreenshot = React.useCallback((products: string[], shared: boolean) => {
    if (!sessionData) return;
    setSessionData({ ...sessionData, screenshotsTaken: sessionData.screenshotsTaken + 1, screenshotsShared: sessionData.screenshotsShared + (shared ? 1 : 0) });
    arAnalyticsService.trackScreenshotCaptured({ productsInFrame: products, shared, savedToGallery: false });
    if (products[0]) arProductAnalyticsStore.recordScreenshot(products[0], shared);
  }, [sessionData]);

  const trackProductAddedToCart = React.useCallback((productId: string) => {
    if (!sessionData) return;
    const arr = [...sessionData.productsTried];
    const p = arr.find(x => x.productId === productId);
    const triedOnDuration = p ? Math.round((Date.now() - p.startTime.getTime()) / 1000) : 0;
    const intensityUsed = 80;
    setSessionData({ ...sessionData, productsAddedToCart: Array.from(new Set([...sessionData.productsAddedToCart, productId])) });
    arAnalyticsService.trackARProductAddedToCart({ productId, productName: productId, price: 0, triedOnDuration, intensityUsed, screenshotTaken: sessionData.screenshotsTaken > 0 });
    ARFunnelTracker.trackFunnelStep("added_to_cart", { sessionId: sessionData.sessionId });
    arProductAnalyticsStore.recordAddedToCart(productId);
  }, [sessionData]);

  const trackError = React.useCallback((error: ARError) => {
    if (!sessionData) return;
    setSessionData({ ...sessionData, errors: [...sessionData.errors, { type: error.type, time: new Date() }] });
    const now = Date.now();
    const durationSec = Math.round((now - sessionData.startTime.getTime()) / 1000);
    const info: DeviceInfo = arAnalyticsService.getDeviceInfo();
    arAnalyticsService.trackARError({ errorType: error.type, errorMessage: error.message, deviceInfo: info, sessionDuration: durationSec });
  }, [sessionData]);

  const trackPerformance = React.useCallback((metrics: ARPerformanceMetrics) => {
    if (!sessionData) return;
    setSessionData({ ...sessionData, performanceMetrics: metrics });
  }, [sessionData]);

  const value: ARAnalyticsContextValue = {
    sessionData,
    startSession,
    endSession,
    trackProductTryOn,
    trackIntensityChange,
    trackScreenshot,
    trackProductAddedToCart,
    trackError,
    trackPerformance
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useARAnalyticsContext(): ARAnalyticsContextValue {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("ARAnalyticsContext not available");
  return v;
}

