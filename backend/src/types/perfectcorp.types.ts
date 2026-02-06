export interface PerfectCorpConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
}

export interface SkinAnalysisRequest {
  imageUrl: string;
  options?: {
    detailed?: boolean;
    includeRecommendations?: boolean;
  };
}

export interface SkinAnalysisResult {
  analysisId: string;
  skinType: string;
  skinTone: string;
  concerns: string[];
  scores: {
    overall: number;
    hydration: number;
    texture: number;
    clarity: number;
  };
  recommendations?: ProductRecommendation[];
}

export interface VirtualTryOnRequest {
  imageUrl: string;
  productId: string;
  productType: "lipstick" | "eyeshadow" | "blush" | "foundation";
  intensity?: number;
}

export interface VirtualTryOnResult {
  resultImageUrl: string;
  productDetails: {
    id: string;
    name: string;
    brand: string;
    color: string;
  };
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  imageUrl: string;
  rating: number;
  suitabilityScore: number;
}
