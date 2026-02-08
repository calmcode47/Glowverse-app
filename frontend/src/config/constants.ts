import Constants from "expo-constants";

export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@glowverse:accessToken",
  REFRESH_TOKEN: "@glowverse:refreshToken",
  USER: "@glowverse:user"
} as const;
