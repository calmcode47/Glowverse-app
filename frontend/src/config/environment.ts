import Constants from "expo-constants";

export const ENV = {
  apiBaseUrl: (Constants.expoConfig?.extra as any)?.apiBaseUrl || "http://localhost:5000/api/v1",
  cloudinaryCloudName: (Constants.expoConfig?.extra as any)?.cloudinaryCloudName || "",
  environment: (Constants.expoConfig?.extra as any)?.environment || "development",
  sentryDSN: (Constants.expoConfig?.extra as any)?.sentryDsn || ""
};
