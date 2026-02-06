import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Linking } from "react-native";

export async function requestCameraPermission(): Promise<boolean> {
  try {
    const res = await Camera.requestCameraPermissionsAsync();
    return res.granted;
  } catch {
    return false;
  }
}

export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const res = await MediaLibrary.requestPermissionsAsync();
    return res.status === "granted";
  } catch {
    return false;
  }
}

export async function checkPermissionStatus(permission: "camera" | "mediaLibrary"): Promise<string> {
  try {
    if (permission === "camera") {
      const res = await Camera.getCameraPermissionsAsync();
      return res.status;
    }
    const res = await MediaLibrary.getPermissionsAsync();
    return res.status;
  } catch {
    return "undetermined";
  }
}

export function openSettings(): void {
  if (Linking.openSettings) {
    Linking.openSettings();
  } else {
    Linking.openURL("app-settings:");
  }
}
