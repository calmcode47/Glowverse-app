export type PCAuthToken = {
  token: string;
  expiresAt: string;
};

export type PCFaceAnalysisMetric = {
  name: string;
  score: number;
  description?: string;
};

export type PCFaceAnalysisResult = {
  requestId: string;
  imageId: string;
  metrics: PCFaceAnalysisMetric[];
  recommendations?: string[];
};

export type PCARFilter = {
  id: string;
  name: string;
  category: "lipstick" | "eyeshadow" | "foundation" | "hair" | "accessory";
  parameters: Record<string, number | string | boolean>;
  previewImageUrl?: string;
};

export type PCAIInferenceRequest = {
  imageUri: string;
  features: Array<"skin" | "face" | "hair" | "makeup">;
  filters?: string[];
};

export type PCAIInferenceResponse = {
  resultId: string;
  analysis: PCFaceAnalysisResult;
  appliedFilters?: PCARFilter[];
  processedAt: string;
};

export type PCError = {
  code: string;
  message: string;
  status?: number;
};
