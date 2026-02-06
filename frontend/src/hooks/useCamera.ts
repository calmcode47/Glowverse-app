import React from "react";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { useCameraContext } from "@context/CameraContext";

export type CaptureResult = {
  uri: string;
  width?: number;
  height?: number;
};

type ICameraRef = {
  takePictureAsync: (opts: { quality?: number; skipProcessing?: boolean }) => Promise<{
    uri: string;
    width?: number;
    height?: number;
  }>;
} | null;

export function useCamera() {
  const { permissions, setPermissions, addImage, cameraType, toggleCameraType } = useCameraContext();
  const [requesting, setRequesting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const requestPermissions = async () => {
    setRequesting(true);
    setError(null);
    try {
      const cam = await Camera.requestCameraPermissionsAsync();
      const lib = await MediaLibrary.requestPermissionsAsync();
      setPermissions({ camera: cam.granted, mediaLibrary: lib.status === "granted" });
      return { camera: cam.granted, mediaLibrary: lib.status === "granted" };
    } catch (e: any) {
      setError(e?.message || "Permission error");
      return { camera: false, mediaLibrary: false };
    } finally {
      setRequesting(false);
    }
  };

  const capturePhoto = async (cameraRef: ICameraRef): Promise<CaptureResult | null> => {
    if (!cameraRef) {
      setError("Camera not ready");
      return null;
    }
    try {
      const photo = await cameraRef.takePictureAsync({ quality: 0.85, skipProcessing: false });
      const result: CaptureResult = { uri: photo.uri, width: photo.width, height: photo.height };
      addImage({ uri: result.uri, width: result.width, height: result.height, timestamp: new Date().toISOString() });
      return result;
    } catch (e: any) {
      setError(e?.message || "Capture failed");
      return null;
    }
  };

  return {
    permissions,
    requestPermissions,
    requesting,
    error,
    cameraType,
    toggleCameraType,
    capturePhoto
  };
}
