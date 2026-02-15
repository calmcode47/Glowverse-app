import Constants from "expo-constants";

function sanitize(value: any, fallback: string): string {
  if (typeof value !== "string" || !value) return fallback;
  if (value.startsWith("${") && value.endsWith("}")) return fallback;
  return value;
}

const extra: any = (Constants.expoConfig?.extra as any) || {};

export const ENV = {
  apiBaseUrl: sanitize(extra.apiBaseUrl, "http://localhost:5000/api/v1"),
  cloudinaryCloudName: sanitize(extra.cloudinaryCloudName, ""),
  environment: sanitize(extra.environment, "development"),
  sentryDSN: sanitize(extra.sentryDsn, ""),
  stripePublishableKey: sanitize(extra.stripePublishableKey, ""),
  stripeMerchantId: sanitize(extra.stripeMerchantId, "merchant.com.glowverse")
};
