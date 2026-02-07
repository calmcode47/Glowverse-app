import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id'
};

export const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
};

export const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
};

export const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(KEYS.USER_ID);
};

export const setUserId = async (userId: string): Promise<void> => {
  await SecureStore.setItemAsync(KEYS.USER_ID, userId);
};

export const getUserId = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(KEYS.USER_ID);
};
