import type {
  UploadResponse,
  SkinAnalysisResult,
  MakeupTryOnResult,
  ProductRecommendation
} from "./types";

/**
 * Endpoint constants
 */
export const endpoints = {
  uploadImage: "/images/upload",
  analyzeSkin: "/analysis/skin",
  applyMakeup: "/tryon/makeup",
  recommendations: "/products/recommendations"
} as const;

/**
 * Request and Response types per endpoint
 */
export type UploadImageRequest = {
  fileUri: string;
  filename?: string;
  mimeType?: "image/jpeg" | "image/png";
};
export type UploadImageResponse = UploadResponse;

export type AnalyzeSkinRequest = {
  imageId: string;
};
export type AnalyzeSkinResponse = SkinAnalysisResult;

export type ApplyMakeupRequest = {
  imageId: string;
  makeupId: string;
};
export type ApplyMakeupResponse = MakeupTryOnResult;

export type RecommendationsRequest = {
  analysisId: string;
  limit?: number;
};
export type RecommendationsResponse = {
  items: ProductRecommendation[];
};
