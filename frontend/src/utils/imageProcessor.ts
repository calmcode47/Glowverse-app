import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { config } from "@constants/config";

/**
 * Compresses an image and returns new URI
 */
export async function compressImage(uri: string, quality: number): Promise<string> {
  const r = await ImageManipulator.manipulateAsync(uri, [], {
    compress: Math.max(0.1, Math.min(1, quality)),
    format: ImageManipulator.SaveFormat.JPEG
  });
  return r.uri;
}

/**
 * Resizes an image by max width (maintains aspect ratio)
 */
export async function resizeImage(uri: string, maxWidth: number): Promise<string> {
  const r = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: maxWidth } }], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG
  });
  return r.uri;
}

/**
 * Converts an image to base64 string
 */
export async function convertToBase64(uri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: "base64" as any });
  return base64;
}

/**
 * Validates image by existence, extension, and size limit
 */
export async function validateImage(uri: string): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return false;
  if (typeof info.size === "number" && info.size > config.limits.maxUploadBytes) return false;
  const ext = uri.split(".").pop()?.toLowerCase();
  return ext === "jpg" || ext === "jpeg" || ext === "png";
}
