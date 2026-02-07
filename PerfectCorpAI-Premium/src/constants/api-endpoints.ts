import { Platform } from 'react-native';

const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:5000/api/v1'
      : 'http://localhost:5000/api/v1';
  }
  return 'https://your-api.railway.app/api/v1';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    UPLOAD_AVATAR: '/user/avatar',
    DELETE_ACCOUNT: '/user/account',
    STATS: '/user/stats',
    HISTORY: '/user/history'
  },
  ANALYSIS: {
    CREATE: '/analysis/skin',
    GET_BY_ID: (id: string) => `/analysis/${id}`,
    LIST: '/analysis',
    DELETE: (id: string) => `/analysis/${id}`,
    SHARE: (id: string) => `/analysis/${id}/share`
  },
  TRYON: {
    CREATE: '/tryon',
    GET_BY_ID: (id: string) => `/tryon/${id}`,
    LIST: '/tryon',
    DELETE: (id: string) => `/tryon/${id}`
  },
  FAVORITES: {
    LIST: '/favorites',
    ADD: '/favorites',
    REMOVE: (id: string) => `/favorites/${id}`,
    CHECK: (itemType: string, itemId: string) =>
      `/favorites/check?type=${itemType}&id=${itemId}`
  },
  UPLOAD: {
    IMAGE: '/upload/image',
    MULTIPLE: '/upload/multiple'
  },
  PRODUCTS: {
    LIST: '/products',
    GET: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    RECOMMENDATIONS: '/products/recommendations'
  }
};
