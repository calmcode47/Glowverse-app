import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CameraType } from "expo-camera";

export type CapturedImage = {
  uri: string;
  width?: number;
  height?: number;
  timestamp: string;
};

export type CameraPermissions = {
  camera: boolean;
  mediaLibrary: boolean;
};

export type CameraContextState = {
  capturedImages: CapturedImage[];
  permissions: CameraPermissions;
  cameraType: CameraType;
  preprocessingStatus: "idle" | "processing" | "done" | "error";
  setPermissions: (p: Partial<CameraPermissions>) => void;
  addImage: (img: CapturedImage) => void;
  clearImages: () => void;
  removeImage: (uri: string) => void;
  toggleCameraType: () => void;
  setPreprocessingStatus: (s: CameraContextState["preprocessingStatus"]) => void;
};

const initialState: CameraContextState = {
  capturedImages: [],
  permissions: { camera: false, mediaLibrary: false },
  cameraType: "back",
  preprocessingStatus: "idle",
  setPermissions: () => {},
  addImage: () => {},
  clearImages: () => {},
  removeImage: () => {},
  toggleCameraType: () => {},
  setPreprocessingStatus: () => {}
};

const CameraContext = React.createContext<CameraContextState>(initialState);

export function CameraProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<CameraContextState>(initialState);

  React.useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("capturedImages");
      if (stored) {
        const parsed = JSON.parse(stored) as CapturedImage[];
        setState((s) => ({ ...s, capturedImages: parsed }));
      }
    })();
  }, []);

  React.useEffect(() => {
    AsyncStorage.setItem("capturedImages", JSON.stringify(state.capturedImages));
  }, [state.capturedImages]);

  const setPermissions = (p: Partial<CameraPermissions>) => {
    setState((s) => ({ ...s, permissions: { ...s.permissions, ...p } }));
  };

  const addImage = (img: CapturedImage) => {
    setState((s) => ({ ...s, capturedImages: [img, ...s.capturedImages].slice(0, 50) }));
  };

  const clearImages = () => {
    setState((s) => ({ ...s, capturedImages: [] }));
  };

  const removeImage = (uri: string) => {
    setState((s) => ({ ...s, capturedImages: s.capturedImages.filter((i) => i.uri !== uri) }));
  };

  const toggleCameraType = () => {
    setState((s) => ({
      ...s,
      cameraType: s.cameraType === "back" ? "front" : "back"
    }));
  };

  const setPreprocessingStatus = (st: CameraContextState["preprocessingStatus"]) => {
    setState((s) => ({ ...s, preprocessingStatus: st }));
  };

  const value: CameraContextState = {
    ...state,
    setPermissions,
    addImage,
    clearImages,
    removeImage,
    toggleCameraType,
    setPreprocessingStatus
  };
  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}

export function useCameraContext() {
  return React.useContext(CameraContext);
}
