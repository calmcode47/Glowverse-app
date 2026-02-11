import Constants from "expo-constants";
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) ||
  (process.env.API_BASE_URL as string) ||
  "http://localhost:5000";
export const REQUEST_TIMEOUT_MS = 20000;
