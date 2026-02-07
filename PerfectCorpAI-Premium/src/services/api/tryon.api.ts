import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export interface TryOnResult {
  id: string;
  userId: string;
  originalImageUrl: string;
  resultImageUrl?: string;
  type: 'LIPSTICK' | 'EYESHADOW' | 'BLUSH' | 'FOUNDATION' | 'HAIR_COLOR';
  productId: string;
  intensity: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export const tryonApi = {
  createTryOn: async (data: {
    imageUri: string;
    type: TryOnResult['type'];
    productId: string;
    intensity?: number;
  }): Promise<{ tryOn: TryOnResult }> => {
    const formData = new FormData();
    formData.append('image', { uri: data.imageUri, type: 'image/jpeg', name: 'tryon.jpg' } as any);
    formData.append('type', data.type);
    formData.append('productId', data.productId);
    if (data.intensity) {
      formData.append('intensity', data.intensity.toString());
    }
    const response = await apiClient.post(API_ENDPOINTS.TRYON.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000
    });
    return response.data;
  },
  getTryOn: async (id: string): Promise<{ tryOn: TryOnResult }> => {
    const response = await apiClient.get(API_ENDPOINTS.TRYON.GET_BY_ID(id));
    return response.data;
  },
  listTryOns: async (params?: { page?: number; limit?: number }): Promise<{
    data: TryOnResult[];
    pagination: any;
  }> => {
    const response = await apiClient.get(API_ENDPOINTS.TRYON.LIST, { params });
    return response.data;
  },
  deleteTryOn: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.TRYON.DELETE(id));
  },
  pollTryOn: async (id: string, maxAttempts = 30, interval = 2000): Promise<TryOnResult> => {
    for (let i = 0; i < maxAttempts; i++) {
      const { tryOn } = await tryonApi.getTryOn(id);
      if (tryOn.status === 'COMPLETED') return tryOn;
      if (tryOn.status === 'FAILED') throw new Error('Try-on failed');
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error('Try-on timeout');
  }
};
