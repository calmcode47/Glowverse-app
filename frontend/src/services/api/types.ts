/**
 * APIError describes a normalized API error
 */
export type APIError = {
  code: string;
  message: string;
  status?: number;
  details?: Record<string, unknown>;
};

/**
 * UploadResponse returned by image upload
 */
export type UploadResponse = {
  imageId: string;
  uri: string;
  format: "jpeg" | "png";
  sizeBytes: number;
};

/**
 * FaceFeatures extracted from an image
 */
export type FaceFeatures = {
  age?: number;
  gender?: "male" | "female" | "non-binary" | "unknown";
  faceShape?: "oval" | "round" | "square" | "heart" | "diamond" | "unknown";
  skinTone?: string;
  landmarks?: Record<string, { x: number; y: number }>;
};

/**
 * SkinAnalysisResult describes skin metrics and features
 */
export type SkinAnalysisResult = {
  analysisId: string;
  imageId: string;
  metrics: {
    skinScore: number;
    acne: number;
    wrinkles: number;
    darkSpots: number;
    pores: number;
    redness: number;
  };
  features?: FaceFeatures;
  timestamp: string;
};

/**
 * MakeupTryOnResult for virtual try-on
 */
export type MakeupTryOnResult = {
  resultId: string;
  imageId: string;
  makeupId: string;
  applied: boolean;
  previewUri?: string;
  processedAt: string;
};

/**
 * ProductRecommendation suggested products
 */
export type ProductRecommendation = {
  id: string;
  name: string;
  brand?: string;
  category: string;
  score?: number;
  imageUrl?: string;
};
