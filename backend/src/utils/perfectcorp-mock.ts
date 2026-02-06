import { SkinAnalysisResult, VirtualTryOnResult, ProductRecommendation } from "@app-types/perfectcorp.types";

export class PerfectCorpMock {
  static mockSkinAnalysis(): SkinAnalysisResult {
    return {
      analysisId: `mock-analysis-${Date.now()}`,
      skinType: "combination",
      skinTone: "medium",
      concerns: ["acne", "dark_spots", "fine_lines"],
      scores: {
        overall: 7.5,
        hydration: 6.8,
        texture: 7.2,
        clarity: 8.0
      },
      recommendations: this.mockRecommendations()
    };
  }

  static mockVirtualTryOn(): VirtualTryOnResult {
    return {
      resultImageUrl: "https://via.placeholder.com/800x800/FF6B9D/FFFFFF?text=Virtual+Try-On+Result",
      productDetails: {
        id: "MOCK-LIPSTICK-001",
        name: "Ruby Red Matte Lipstick",
        brand: "BeautyBrand",
        color: "#C41E3A"
      }
    };
  }

  static mockRecommendations(): ProductRecommendation[] {
    return [
      {
        id: "PROD-001",
        name: "Hydrating Face Serum",
        brand: "SkinCare Pro",
        category: "skincare",
        price: 49.99,
        imageUrl: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Serum",
        rating: 4.5,
        suitabilityScore: 0.92
      },
      {
        id: "PROD-002",
        name: "Vitamin C Moisturizer",
        brand: "GlowUp",
        category: "skincare",
        price: 39.99,
        imageUrl: "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Moisturizer",
        rating: 4.7,
        suitabilityScore: 0.88
      },
      {
        id: "PROD-003",
        name: "Matte Finish Foundation",
        brand: "MakeupMasters",
        category: "makeup",
        price: 44.99,
        imageUrl: "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Foundation",
        rating: 4.6,
        suitabilityScore: 0.85
      }
    ];
  }

  static async delay(ms: number = 1500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default PerfectCorpMock;
