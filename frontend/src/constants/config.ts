import Constants from "expo-constants";

export type ApiConfig = {
  baseUrl: string;
  timeoutMs: number;
  imageQuality: {
    jpegQuality: number;
    maxWidth: number;
    maxHeight: number;
  };
  camera: {
    resolution: "720p" | "1080p" | "4k";
    aspectRatio: "4:3" | "16:9";
    fps?: 30 | 60;
  };
  limits: {
    maxUploadBytes: number;
    maxCacheItems: number;
  };
};

export const config: ApiConfig = {
  baseUrl: (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1",
  timeoutMs: 20000,
  imageQuality: {
    jpegQuality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080
  },
  camera: {
    resolution: "1080p",
    aspectRatio: "16:9",
    fps: 30
  },
  limits: {
    maxUploadBytes: 10 * 1024 * 1024,
    maxCacheItems: 100
  }
};
