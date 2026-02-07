import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface SkinAnalysisResult {
  id: string;
  userId: string;
  imageUrl: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  skinType?: string;
  skinTone?: string;
  concerns?: string[];
  scores?: {
    overall: number;
    hydration: number;
    texture: number;
    clarity: number;
  };
  recommendations?: Array<{
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    imageUrl: string;
    rating: number;
    suitabilityScore: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const analysisApi = {
  createAnalysis: async (imageUri: string): Promise<{ analysis: SkinAnalysisResult }> => {
    const formData = new FormData();
    formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'analysis.jpg' } as any);
    const response = await apiClient.post(API_ENDPOINTS.ANALYSIS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    });
    return response.data;
  },
  getAnalysis: async (id: string): Promise<{ analysis: SkinAnalysisResult }> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYSIS.GET_BY_ID(id));
    return response.data;
  },
  listAnalyses: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    data: SkinAnalysisResult[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> => {
    const response = await apiClient.get(API_ENDPOINTS.ANALYSIS.LIST, { params });
    return response.data;
  },
  deleteAnalysis: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ANALYSIS.DELETE(id));
  },
  shareAnalysis: async (id: string): Promise<{ shareUrl: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.ANALYSIS.SHARE(id));
    return response.data;
  },
  pollAnalysis: async (id: string, maxAttempts = 30, interval = 2000): Promise<SkinAnalysisResult> => {
    for (let i = 0; i < maxAttempts; i++) {
      const { analysis } = await analysisApi.getAnalysis(id);
      if (analysis.status === 'COMPLETED') return analysis;
      if (analysis.status === 'FAILED') throw new Error('Analysis failed');
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('Analysis timeout');
  }
};
