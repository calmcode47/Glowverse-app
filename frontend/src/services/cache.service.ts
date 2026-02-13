import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "@cache_";
const DEFAULT_EXPIRY = 1000 * 60 * 60 * 24; // 24h

export const cacheService = {
  async set(key: string, data: any, expiry = DEFAULT_EXPIRY): Promise<void> {
    const payload = { data, timestamp: Date.now(), expiry };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  },
  async get<T = any>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    try {
      const { data, timestamp, expiry } = JSON.parse(raw);
      if (Date.now() - timestamp > (expiry ?? DEFAULT_EXPIRY)) {
        await this.remove(key);
        return null;
      }
      return data as T;
    } catch {
      return null;
    }
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },
  async clear(): Promise<void> {
    const keys: string[] = await AsyncStorage.getAllKeys();
    const toClear = keys.filter((k: string) => k.startsWith(CACHE_PREFIX));
    if (toClear.length) await AsyncStorage.multiRemove(toClear);
  }
};
