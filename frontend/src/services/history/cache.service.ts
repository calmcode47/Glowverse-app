import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ActivityItem } from './types';

const KEY = 'history:aggregated';

export async function getCachedHistory(): Promise<ActivityItem[] | null> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    if (!json) return null;
    const arr = JSON.parse(json);
    if (!Array.isArray(arr)) return null;
    return arr as ActivityItem[];
  } catch {
    return null;
  }
}

export async function setCachedHistory(items: ActivityItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
}

