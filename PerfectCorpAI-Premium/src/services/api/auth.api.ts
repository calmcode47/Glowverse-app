import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { setTokens, clearTokens } from '../storage/secure-storage';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    return response.data;
  },
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    return response.data;
  },
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await clearTokens();
    }
  },
  refreshToken: async (refreshToken: string): Promise<AuthResponse['tokens']> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    await setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    return response.data.tokens;
  },
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }
};
