import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/constants/api-endpoints';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../storage/secure-storage';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      const headers = (config.headers ?? {}) as any;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
    if (__DEV__) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token?: string | null) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token available');
        const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = (response as any).data.tokens;
        await setTokens(accessToken, newRefreshToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      });
    }
    const errorMessage = (error.response?.data as any)?.error || error.message;
    if (__DEV__) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: errorMessage
      });
    }
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

const retryRequest = async (config: AxiosRequestConfig, retries = API_CONFIG.RETRY_ATTEMPTS): Promise<any> => {
  try {
    return await apiClient(config);
  } catch (error: any) {
    if (retries === 0 || error.status === 401 || error.status === 403) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
    return retryRequest(config, retries - 1);
  }
};

export default apiClient;
export { retryRequest };
