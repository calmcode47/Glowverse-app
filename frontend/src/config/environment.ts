import Constants from "expo-constants";

function sanitize(value: any, fallback: string): string {
  if (typeof value !== "string" || !value) return fallback;
  if (value.startsWith("${") && value.endsWith("}")) return fallback;
  return value;
}

const extra: any = (Constants.expoConfig?.extra as any) || {};
const hostUri =
  (Constants.expoConfig as any)?.hostUri ||
  (Constants as any)?.manifest?.debuggerHost ||
  (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
  "";

function getDevHost(uri: string): string | null {
  if (!uri) return null;
  const cleaned = uri.replace(/^https?:\/\//, "");
  const host = cleaned.split(":")[0];
  if (!host || host === "localhost" || host === "127.0.0.1") return null;
  return host;
}

const devHost = getDevHost(hostUri);
const defaultApiBaseUrl = devHost ? `http://${devHost}:5000/api/v1` : "http://localhost:5000/api/v1";

export const ENV = {
  apiBaseUrl: sanitize(extra.apiBaseUrl, defaultApiBaseUrl),
  cloudinaryCloudName: sanitize(extra.cloudinaryCloudName, ""),
  environment: sanitize(extra.environment, "development"),
  sentryDSN: sanitize(extra.sentryDsn, ""),
  stripePublishableKey: sanitize(extra.stripePublishableKey, ""),
  stripeMerchantId: sanitize(extra.stripeMerchantId, "merchant.com.glowverse")
};
