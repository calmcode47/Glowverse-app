import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveToStorage(key: string, value: any): Promise<void> {
  const data = typeof value === "string" ? value : JSON.stringify(value);
  await AsyncStorage.setItem(key, data);
}

export async function getFromStorage<T = any>(key: string): Promise<T | null> {
  const data = await AsyncStorage.getItem(key);
  if (data === null) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return data as unknown as T;
  }
}

export async function removeFromStorage(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearStorage(): Promise<void> {
  await AsyncStorage.clear();
}
