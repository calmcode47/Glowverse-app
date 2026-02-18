import { client } from "./client";

export interface Promotion {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  endDate: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  title?: string; // For backward compatibility if needed
  image?: string;
  termsUrl?: string;
}

export interface ValidatePromotionResponse {
  success: boolean;
  valid: boolean;
  discount?: number;
  promotion?: Promotion;
  error?: string;
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const res = await client.get<{ success: boolean; promotions: Promotion[] }>("/api/v1/promotions/active");
  return res.data.promotions;
}

// Alias for backward compatibility if used elsewhere
export const listPromotions = getActivePromotions;

export async function validatePromotion(
  code: string,
  subtotal: number,
  items: { productId: string; category: string }[]
): Promise<ValidatePromotionResponse> {
  try {
    const res = await client.post<ValidatePromotionResponse>("/api/v1/promotions/validate", {
      code,
      subtotal,
      items
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      valid: false,
      error: error.message || "Failed to validate promotion"
    };
  }
}

export async function getPromotionHistory(page = 1, limit = 20): Promise<any> {
  const res = await client.get(`/api/v1/promotions/history?page=${page}&limit=${limit}`);
  return res.data;
}
