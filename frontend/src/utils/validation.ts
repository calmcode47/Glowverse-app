import * as FileSystem from "expo-file-system";
import { validateImage as validateImageProcessor } from "@utils/imageProcessor";

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function validatePhoneNumber(phone: string): boolean {
  const re = /^\+?[0-9]{7,15}$/;
  return re.test(phone);
}

export async function validateImage(uri: string): Promise<boolean> {
  try {
    return await validateImageProcessor(uri);
  } catch {
    try {
      const info = await FileSystem.getInfoAsync(uri);
      return Boolean(info.exists);
    } catch {
      return false;
    }
  }
}

export function validateFileSize(size: number, maxSize: number): boolean {
  if (!Number.isFinite(size) || !Number.isFinite(maxSize)) return false;
  return size <= maxSize;
}
