import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_SIZE_LIMIT = 100 * 1024 * 1024;
const CACHE_SIZE_KEY = "image_cache_size";

export const imageCacheManager = {
  async getCacheSize(): Promise<number> {
    const size = await AsyncStorage.getItem(CACHE_SIZE_KEY);
    return size ? parseInt(size, 10) : 0;
  },
  async updateCacheSize(size: number): Promise<void> {
    await AsyncStorage.setItem(CACHE_SIZE_KEY, String(size));
  },
  async clearCache(): Promise<void> {
    try {
      const FastImage = require("react-native-fast-image");
      await FastImage.clearDiskCache();
      await FastImage.clearMemoryCache();
    } catch {}
    await AsyncStorage.setItem(CACHE_SIZE_KEY, "0");
  },
  async checkAndClearIfNeeded(): Promise<void> {
    const current = await this.getCacheSize();
    if (current > CACHE_SIZE_LIMIT) {
      await this.clearCache();
    }
  },
  async monitorCacheSize(): Promise<void> {
    await this.checkAndClearIfNeeded();
  }
};
