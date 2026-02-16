import { analytics } from "./analytics.service";
import * as Device from "expo-device";

export type DeviceInfo = {
  model: string;
  os: string;
  osVersion: string;
  ramMb: number;
};

export const arAnalyticsService = {
  trackARSessionStarted(data: { entryPoint: "home" | "product_page" | "shop" | "navigation"; hasUsedBefore: boolean }) {
    analytics.logEvent({ name: "ar_session_started", properties: data as any }).catch(() => {});
  },
  trackARSessionEnded(data: { duration: number; productsTriedCount: number; screenshotsTaken: number; productsAddedToCart: number }) {
    analytics.logEvent({ name: "ar_session_ended", properties: data as any }).catch(() => {});
  },
  trackProductTryOn(data: { productId: string; productName: string; category: string; price: number; tryOnSequence: number; timeToTryOn: number }) {
    analytics.logEvent({ name: "ar_product_try_on", properties: data as any }).catch(() => {});
  },
  trackProductIntensityChanged(data: { productId: string; intensityValue: number; changeCount: number }) {
    analytics.logEvent({ name: "ar_intensity_changed", properties: data as any }).catch(() => {});
  },
  trackProductRemoved(data: { productId: string; durationWorn: number }) {
    analytics.logEvent({ name: "ar_product_removed", properties: data as any }).catch(() => {});
  },
  trackARProductAddedToCart(data: { productId: string; productName: string; price: number; triedOnDuration: number; intensityUsed: number; screenshotTaken: boolean }) {
    analytics.logEvent({ name: "ar_product_added_to_cart", properties: data as any }).catch(() => {});
  },
  trackARProductPurchased(data: { productId: string; productName: string; price: number; triedOnInSession: boolean; screenshotShared: boolean }) {
    analytics.logEvent({ name: "ar_product_purchased", properties: data as any }).catch(() => {});
  },
  trackScreenshotCaptured(data: { productsInFrame: string[]; shared: boolean; savedToGallery: boolean }) {
    analytics.logEvent({ name: "ar_screenshot_captured", properties: data as any }).catch(() => {});
  },
  trackScreenshotShared(data: { productsInFrame: string[]; platform: "instagram" | "facebook" | "twitter" | "other" }) {
    analytics.logEvent({ name: "ar_screenshot_shared", properties: data as any }).catch(() => {});
  },
  trackARError(data: { errorType: string; errorMessage: string; deviceInfo: DeviceInfo; sessionDuration: number }) {
    analytics.logEvent({ name: "ar_error", properties: data as any }).catch(() => {});
  },
  trackARPerformance(data: { averageFPS: number; memoryUsage: number; batteryDrain: number; deviceModel: string; qualityPreset: string }) {
    analytics.logEvent({ name: "ar_performance", properties: data as any }).catch(() => {});
  },
  trackFaceDetected(data: { timeToDetect: number; confidence: number }) {
    analytics.logEvent({ name: "ar_face_detected", properties: data as any }).catch(() => {});
  },
  trackFaceLost(data: { durationHadFace: number }) {
    analytics.logEvent({ name: "ar_face_lost", properties: data as any }).catch(() => {});
  },
  trackARExperiment(experimentId: string, variantId: string, event: string, data: object) {
    analytics.logEvent({ name: "ar_experiment_event", properties: { experimentId, variantId, event, ...data } }).catch(() => {});
  },
  getDeviceInfo(): DeviceInfo {
    const ramMb = (Device.totalMemory ?? 2 * 1024 * 1024 * 1024) / (1024 * 1024);
    return {
      model: Device.modelName ?? "Unknown",
      os: Device.osName ?? "OS",
      osVersion: String(Device.osVersion ?? ""),
      ramMb
    };
  }
};

