import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import env from "@config/env";
import { AppError } from "@utils/errors";
import logger from "@utils/logger";
import {
  SkinAnalysisRequest,
  SkinAnalysisResult,
  VirtualTryOnRequest,
  VirtualTryOnResult,
  ProductRecommendation
} from "@app-types/perfectcorp.types";

export class PerfectCorpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.perfectCorp.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": env.perfectCorp.apiKey
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        logger.info(`[PerfectCorp] ${String(config.method).toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.info(`[PerfectCorp] Response ${response.status}`);
        return response;
      },
      (error: AxiosError) => this.handleError(error)
    );
  }

  private async requestWithRetry<T>(fn: () => Promise<AxiosResponse<T>>, retries = 2, baseDelayMs = 500): Promise<T> {
    let attempt = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const res = await fn();
        return res.data;
      } catch (err) {
        const error = err as AxiosError;
        const status = error.response?.status;
        const shouldRetry =
          status === 429 ||
          status === 500 ||
          status === 502 ||
          status === 503 ||
          !error.response ||
          error.code === "ECONNABORTED";
        if (!shouldRetry || attempt >= retries) {
          throw this.normalizeError(error);
        }
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        attempt += 1;
      }
    }
  }

  private normalizeError(error: AxiosError): AppError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown> | undefined;
      const message = (typeof data?.message === "string" && data?.message) || "Perfect Corp API error";
      switch (status) {
        case 400:
          return new AppError(message || "Bad request to Perfect Corp API", 400);
        case 401:
          return new AppError("Invalid Perfect Corp API credentials", 401);
        case 403:
          return new AppError("Perfect Corp API access forbidden", 403);
        case 404:
          return new AppError("Perfect Corp API endpoint not found", 404);
        case 429:
          return new AppError("Perfect Corp API rate limit exceeded", 429);
        case 500:
        case 502:
        case 503:
          return new AppError("Perfect Corp API server error", 503);
        default:
          return new AppError(message, status);
      }
    }
    if (error.request) {
      return new AppError("No response from Perfect Corp API", 503);
    }
    return new AppError("Failed to make request to Perfect Corp API", 500);
  }

  private handleError(error: AxiosError): Promise<never> {
    return Promise.reject(this.normalizeError(error));
  }

  async analyzeSkin(request: SkinAnalysisRequest): Promise<SkinAnalysisResult> {
    const data = await this.requestWithRetry(() => this.client.post("/skin-analysis", request));
    return this.mapSkinAnalysisResponse(data as unknown);
  }

  async getSkinAnalysis(analysisId: string): Promise<SkinAnalysisResult> {
    const data = await this.requestWithRetry(() => this.client.get(`/skin-analysis/${analysisId}`));
    return this.mapSkinAnalysisResponse(data as unknown);
  }

  async applyVirtualMakeup(request: VirtualTryOnRequest): Promise<VirtualTryOnResult> {
    const data = await this.requestWithRetry(() => this.client.post("/virtual-tryon", request));
    return this.mapTryOnResponse(data as unknown);
  }

  async getVirtualTryOn(tryOnId: string): Promise<VirtualTryOnResult> {
    const data = await this.requestWithRetry(() => this.client.get(`/virtual-tryon/${tryOnId}`));
    return this.mapTryOnResponse(data as unknown);
  }

  async getRecommendations(
    analysisId: string,
    options?: { category?: string; priceRange?: { min: number; max: number }; limit?: number }
  ): Promise<ProductRecommendation[]> {
    const config: AxiosRequestConfig = { params: options };
    const data = await this.requestWithRetry(() => this.client.get(`/recommendations/${analysisId}`, config));
    return this.mapRecommendationsResponse(data as unknown);
  }

  async searchProducts(query: {
    keyword?: string;
    category?: string;
    skinType?: string;
    limit?: number;
  }): Promise<ProductRecommendation[]> {
    const config: AxiosRequestConfig = { params: query };
    const data = await this.requestWithRetry(() => this.client.get("/products/search", config));
    return this.mapRecommendationsResponse(data as unknown);
  }

  async detectFace(imageUrl: string): Promise<{ faceDetected: boolean; confidence: number; landmarks?: unknown }> {
    const data = await this.requestWithRetry(() => this.client.post("/face-detection", { imageUrl }));
    const d = data as Record<string, unknown>;
    return {
      faceDetected: Boolean(d.detected),
      confidence: typeof d.confidence === "number" ? d.confidence : 0,
      landmarks: d.landmarks
    };
  }

  private mapSkinAnalysisResponse(data: unknown): SkinAnalysisResult {
    const d = data as Record<string, unknown>;
    const scores = (d.scores as Record<string, unknown>) || {};
    const getNum = (v: unknown) => (typeof v === "number" ? v : 0);
    const getStr = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
    const concerns = Array.isArray(d.concerns) ? (d.concerns as string[]) : [];
    const recs = Array.isArray(d.recommendations) ? (d.recommendations as ProductRecommendation[]) : undefined;
    return {
      analysisId: getStr(d.id) || getStr((d as Record<string, unknown>).analysis_id),
      skinType: getStr(d.skin_type, "unknown"),
      skinTone: getStr(d.skin_tone, "unknown"),
      concerns,
      scores: {
        overall: getNum(scores.overall),
        hydration: getNum(scores.hydration),
        texture: getNum(scores.texture),
        clarity: getNum(scores.clarity)
      },
      recommendations: recs
    };
  }

  private mapTryOnResponse(data: unknown): VirtualTryOnResult {
    const d = data as Record<string, unknown>;
    const product = (d.product as Record<string, unknown>) || {};
    const getStr = (v: unknown) => (typeof v === "string" ? v : "");
    return {
      resultImageUrl: getStr(d.result_image_url) || getStr(d.image_url),
      productDetails: {
        id: getStr(product.id),
        name: getStr(product.name),
        brand: getStr(product.brand),
        color: getStr(product.color)
      }
    };
  }

  private mapRecommendationsResponse(data: unknown): ProductRecommendation[] {
    const d = data as Record<string, unknown>;
    const products = (d.products as unknown[]) || (d.recommendations as unknown[]) || [];
    const getStr = (v: unknown) => (typeof v === "string" ? v : "");
    const getNum = (v: unknown) => (typeof v === "number" ? v : 0);
    return products.map((p) => {
      const prod = p as Record<string, unknown>;
      return {
        id: getStr(prod.id),
        name: getStr(prod.name),
        brand: getStr(prod.brand),
        category: getStr(prod.category),
        price: getNum(prod.price),
        imageUrl: getStr(prod.image_url) || getStr(prod.imageUrl),
        rating: getNum(prod.rating),
        suitabilityScore: getNum(prod.suitability_score) || getNum(prod.score)
      };
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/health");
      return true;
    } catch {
      return false;
    }
  }
}

const perfectCorpService = new PerfectCorpService();
export default perfectCorpService;
