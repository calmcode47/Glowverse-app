import Constants from "expo-constants";

export const ENV = {
  apiBaseUrl: (Constants.expoConfig?.extra as any)?.apiBaseUrl || "http://localhost:5000/api/v1",
  cloudinaryCloudName: (Constants.expoConfig?.extra as any)?.cloudinaryCloudName || "",
  environment: (Constants.expoConfig?.extra as any)?.environment || "development",
  sentryDSN: (Constants.expoConfig?.extra as any)?.sentryDsn || "",
  stripePublishableKey: (Constants.expoConfig?.extra as any)?.stripePublishableKey || "",
  stripeMerchantId: (Constants.expoConfig?.extra as any)?.stripeMerchantId || "merchant.com.glowverse"
};
