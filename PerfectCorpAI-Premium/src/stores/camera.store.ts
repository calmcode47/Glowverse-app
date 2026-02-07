import { create } from 'zustand';

export type CameraMode = 'photo' | 'analysis' | 'tryon';
export type CameraType = 'front' | 'back';
export type FlashMode = 'on' | 'off' | 'auto';

interface CapturedImage {
  id: string;
  uri: string;
  mode: CameraMode;
  timestamp: number;
  width: number;
  height: number;
}

interface CameraState {
  currentMode: CameraMode;
  cameraType: CameraType;
  flashMode: FlashMode;
  isPermissionGranted: boolean;
  isCameraReady: boolean;
  capturedImages: CapturedImage[];
  lastCapturedImage: CapturedImage | null;
  settings: {
    showGrid: boolean;
    saveToGallery: boolean;
    imageQuality: number;
  };
  setMode: (mode: CameraMode) => void;
  toggleCamera: () => void;
  setFlashMode: (mode: FlashMode) => void;
  setPermission: (granted: boolean) => void;
  setCameraReady: (ready: boolean) => void;
  addCapturedImage: (image: CapturedImage) => void;
  removeCapturedImage: (id: string) => void;
  clearCapturedImages: () => void;
  updateSettings: (settings: Partial<CameraState['settings']>) => void;
}

export const useCameraStore = create<CameraState>((set, get) => ({
  currentMode: 'photo',
  cameraType: 'front',
  flashMode: 'auto',
  isPermissionGranted: false,
  isCameraReady: false,
  capturedImages: [],
  lastCapturedImage: null,
  settings: {
    showGrid: false,
    saveToGallery: true,
    imageQuality: 0.9
  },
  setMode: (mode) => set({ currentMode: mode }),
  toggleCamera: () =>
    set((state) => ({ cameraType: state.cameraType === 'front' ? 'back' : 'front' })),
  setFlashMode: (mode) => set({ flashMode: mode }),
  setPermission: (granted) => set({ isPermissionGranted: granted }),
  setCameraReady: (ready) => set({ isCameraReady: ready }),
  addCapturedImage: (image) =>
    set((state) => ({
      capturedImages: [image, ...state.capturedImages].slice(0, 50),
      lastCapturedImage: image
    })),
  removeCapturedImage: (id) =>
    set((state) => ({ capturedImages: state.capturedImages.filter((img) => img.id !== id) })),
  clearCapturedImages: () => set({ capturedImages: [], lastCapturedImage: null }),
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } }))
}));
