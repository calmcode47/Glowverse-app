/**
 * PerfectCorp API Mock Data
 * Simulates responses from PerfectCorp AR/AI endpoints
 */
export const PerfectCorpMock = {
  // Face Detection
  faceDetection: {
    success: {
      result: "success",
      face_count: 1,
      faces: [
        {
          face_id: "face_123",
          landmarks: [[10, 10], [20, 20], [30, 30]], // Simplified landmarks
          attributes: {
            age: 25,
            gender: "female",
            emotion: "happy",
            skin_tone: "fair"
          }
        }
      ]
    },
    noFace: {
      result: "success",
      face_count: 0,
      faces: []
    },
    error: {
      error: {
        code: "INVALID_IMAGE",
        message: "The provided image format is not supported."
      }
    }
  },

  // Makeup Try-On
  tryOn: {
    success: {
      result: "success",
      image_url: "https://api.perfectcorp.com/v1/tryon/result_abc123.jpg",
      products_applied: [
        {
          sku: "LIP-RED-001",
          type: "lipstick",
          color: "#FF0000"
        }
      ]
    },
    invalidProduct: {
      error: {
        code: "INVALID_SKU",
        message: "Product SKU not found or not mapped."
      }
    }
  },

  // Skin Analysis
  skinAnalysis: {
    success: {
      result: "success",
      skin_score: 85,
      skin_age: 23,
      concerns: {
        spots: { score: 80, severity: "low" },
        wrinkles: { score: 90, severity: "none" },
        texture: { score: 75, severity: "medium" },
        dark_circles: { score: 85, severity: "low" }
      },
      summary: "Your skin is in great condition!"
    },
    error: {
      error: {
        code: "ANALYSIS_FAILED",
        message: "Could not analyze skin features. Please try another photo."
      }
    }
  }
};

export class MockPerfectCorpService {
  static async detectFace(imageUrl: string): Promise<any> {
    if (imageUrl.includes("no-face")) return PerfectCorpMock.faceDetection.noFace;
    if (imageUrl.includes("invalid")) throw new Error("API Error: INVALID_IMAGE");
    return PerfectCorpMock.faceDetection.success;
  }

  static async tryOnMakeup(imageUrl: string, products: any[]): Promise<any> {
    if (products.some(p => p.sku === "INVALID")) throw new Error("API Error: INVALID_SKU");
    return PerfectCorpMock.tryOn.success;
  }

  static async analyzeSkin(imageUrl: string): Promise<any> {
    if (imageUrl.includes("error")) throw new Error("API Error: ANALYSIS_FAILED");
    return PerfectCorpMock.skinAnalysis.success;
  }
}

export default MockPerfectCorpService;
