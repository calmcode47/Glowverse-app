export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type UploadImageResponse = {
  id: string;
  uri: string;
  format: "jpeg" | "png";
  sizeBytes: number;
};

export type AnalysisRequest = {
  imageId: string;
  features: Array<"skin" | "face" | "hair" | "makeup">;
};

export type AnalysisResult = {
  imageId: string;
  timestamp: string;
  metrics: {
    skinScore?: number;
    faceAttributes?: {
      age?: number;
      gender?: "male" | "female" | "non-binary" | "unknown";
    };
  };
};
