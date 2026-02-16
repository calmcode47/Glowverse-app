import { imagePreprocessingService } from "./imagePreprocessingService";
import { skinAnalysisAPI } from "./skinAnalysisAPI.service";
import type { SkinAnalysisResult, SkinAnalysisRequest } from "./types";

type ProviderResponse = any;

class SkinAnalysisAIService {
  private apiKey = process.env.AI_PROVIDER_API_KEY || "";
  private baseURL = process.env.AI_PROVIDER_BASE_URL || "";
  private timeout = Number(process.env.AI_PROVIDER_TIMEOUT || "30000");

  async analyzeImage(request: { imageUri?: string; base64?: string; userId: string; analysisType?: "full" | "quick" | "targeted"; includeRecommendations?: boolean }): Promise<SkinAnalysisResult> {
    try {
      const imageBase64 = request.base64 || (await imagePreprocessingService.prepareForAnalysis(request.imageUri!)).base64;
      if (this.baseURL && this.apiKey) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), this.timeout);
        const res = await fetch(`${this.baseURL.replace(/\/$/, "")}/analyze`, {
          method: "POST",
          headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imageBase64,
            user_id: request.userId,
            analysis_type: request.analysisType || "full",
            include_recommendations: request.includeRecommendations !== false
          }),
          signal: controller.signal
        } as any);
        clearTimeout(t);
        const data: ProviderResponse = await res.json();
        return this.parseProviderResponse(data, imageBase64, request.userId);
      }
      const result = await skinAnalysisAPI.analyzeSkin({ imageData: imageBase64 });
      return result;
    } catch (e: any) {
      // Fallback to backend if provider call failed
      if (request.imageUri || request.base64) {
        const b64 = request.base64 || (await imagePreprocessingService.prepareForAnalysis(request.imageUri!)).base64;
        return await skinAnalysisAPI.analyzeSkin({ imageData: b64 });
      }
      throw e;
    }
  }

  private parseProviderResponse(data: any, imageBase64: string, userId: string): SkinAnalysisResult {
    const now = Date.now();
    const concerns = Array.isArray(data?.concerns)
      ? data.concerns.map((c: any) => ({
          type: String(c.type || c.label || "uneven_tone"),
          severity: (String(c.severity || "moderate").toLowerCase() as any) || "moderate",
          confidence: Number(c.confidence || 0.7),
          affectedAreas: Array.isArray(c.affectedAreas) ? c.affectedAreas : ["full_face"],
          description: String(c.description || "")
        }))
      : [];
    const recommendations = Array.isArray(data?.recommendations)
      ? data.recommendations.map((r: any) => ({
          productId: String(r.productId || r.id),
          name: String(r.productName || r.name || "Product"),
          brand: String(r.brand || "Glowverse"),
          category: String(r.category || "skincare"),
          imageUrl: r.imageUrl,
          price: Number(r.price || 0),
          reason: (r.reasonsMatched || r.reason || ["Recommended"]).join?.(", ") || String(r.reason || "Recommended"),
          priority: Number(r.priority || 3),
          targetsConcerns: Array.isArray(r.targetsConcerns) ? r.targetsConcerns : [],
          suitableForSkinType: Array.isArray(r.suitableForSkinType) ? r.suitableForSkinType : []
        }))
      : [];
    const skinType = (data?.skinType || "combination") as any;
    return {
      analysisId: String(data?.analysisId || `ana_${now}`),
      userId,
      skinType,
      skinTypeConfidence: Number(data?.confidence || 0.8),
      skinTone: String(data?.skinTone || "#C48E6A"),
      concerns,
      recommendations,
      overallConfidence: Number(data?.confidence || 0.8),
      imageUrl: `data:image/jpeg;base64,${imageBase64.slice(0, 20)}...`, // placeholder for client-only context
      processedImageUrl: data?.processedImageUrl,
      analyzedAt: now,
      processingTime: Number(data?.processingTime || 0),
      mlProvider: "custom",
      modelVersion: String(data?.modelVersion || "v1")
    };
  }

  async retryAnalysis(_analysisId: string): Promise<SkinAnalysisResult> {
    throw new Error("Retry not implemented in client; backend should manage retries");
  }

  async getAnalysisHistory(_userId: string): Promise<SkinAnalysisResult[]> {
    const h = await skinAnalysisAPI.getAnalysisHistory(1, 20).catch(() => ({ analyses: [] as any[] } as any));
    return (h as any)?.analyses || [];
  }
}

export const skinAnalysisAIService = new SkinAnalysisAIService();
