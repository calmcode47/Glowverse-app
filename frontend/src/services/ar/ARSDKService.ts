import { ARSDKModule } from '../../modules/ar-sdk';
import type {
  ARConfig as NativeARConfig,
  FaceDetectionResult,
  MakeupProduct,
  MakeupCategory,
  ScreenshotResult
} from '../../modules/ar-sdk/types';
import type { AREvent } from '../../modules/ar-sdk/types';
import { getARConfig, isAREnabled } from '../../modules/ar-sdk/config';
import { ARSDKError, ARErrorCode, toARSDKError } from './errors';

export type PerformanceMode = 'high' | 'balanced' | 'low';

export interface ARConfig {
  licenseKey: string;
  enableFaceTracking: boolean;
  performanceMode: PerformanceMode;
}

export interface ApplyMakeupParams {
  productId: string;
  category: 'lipstick' | 'eyeshadow' | 'eyeliner' | 'blush' | 'foundation';
  color: string;
  intensity: number;
  texture?: 'matte' | 'glossy' | 'shimmer';
}

type FaceDetectedCallback = (landmarks: FaceDetectionResult) => void;
type FaceLostCallback = () => void;

class ARSDKServiceClass {
  private initialized = false;
  private tracking = false;
  private faceDetectedCb: FaceDetectedCallback | null = null;
  private faceLostCb: FaceLostCallback | null = null;
  private unsubscribe: (() => void) | null = null;

  async initialize(config?: Partial<ARConfig>): Promise<void> {
    if (this.initialized) return;
    if (!isAREnabled()) {
      throw new ARSDKError(ARErrorCode.PLATFORM_NOT_SUPPORTED, 'AR SDK disabled by configuration');
    }

    const env = getARConfig();
    const nativeConfig: NativeARConfig = {
      vendor: env.vendor,
      apiKey: env.apiKey,
      licenseKey: config?.licenseKey || env.licenseKey,
      apiUrl: env.apiUrl,
      targetFps: env.targetFps || 30,
      enableGpuAcceleration: env.enableGpuAcceleration !== false,
      maxTextureCacheSizeMb: env.maxTextureCacheSizeMb || 128
    };
    try {
      await ARSDKModule.initialize(nativeConfig);
      this.initialized = true;
      this.setupEvents();
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  async startSession(): Promise<void> {
    this.ensureInitialized();
    try {
      await ARSDKModule.startFaceTracking();
      this.tracking = true;
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  async stopSession(): Promise<void> {
    if (!this.initialized) return;
    try {
      await ARSDKModule.stopFaceTracking();
      this.tracking = false;
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  onFaceDetected(cb: FaceDetectedCallback): void {
    this.faceDetectedCb = cb;
  }

  onFaceLost(cb: FaceLostCallback): void {
    this.faceLostCb = cb;
  }

  async applyMakeup(params: ApplyMakeupParams): Promise<void> {
    this.ensureInitialized();
    const product: MakeupProduct = {
      id: params.productId,
      name: params.productId,
      category: params.category as MakeupCategory,
      brand: 'Glowverse',
      color: params.color,
      finish: params.texture === 'glossy' ? 'glossy' : params.texture === 'shimmer' ? 'shimmer' : 'matte',
      opacity: Math.max(0, Math.min(1, params.intensity / 100)),
      vendorProductId: params.productId
    };
    try {
      await ARSDKModule.applyMakeup(product, Math.max(0, Math.min(1, params.intensity / 100)));
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  async updateMakeupIntensity(category: ApplyMakeupParams['category'], intensity: number): Promise<void> {
    this.ensureInitialized();
    try {
      await ARSDKModule.updateIntensity(category, Math.max(0, Math.min(1, intensity / 100)));
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  async removeMakeup(category?: ApplyMakeupParams['category']): Promise<void> {
    this.ensureInitialized();
    try {
      if (category) {
        await ARSDKModule.removeMakeup(category);
      } else {
        await ARSDKModule.clearAll();
      }
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  async captureScreenshot(): Promise<ScreenshotResult> {
    this.ensureInitialized();
    try {
      return await ARSDKModule.captureScreenshot({ format: 'jpeg', quality: 90, saveToGallery: false });
    } catch (e) {
      throw toARSDKError(e, ARErrorCode.SDK_ERROR);
    }
  }

  async dispose(): Promise<void> {
    await this.stopSession();
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.initialized = false;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }
  get isTracking(): boolean {
    return this.tracking;
  }

  private setupEvents(): void {
    this.unsubscribe?.();
    this.unsubscribe = ARSDKModule.addEventListener((event: AREvent) => {
      if (event.type === 'faceDetected') {
        this.faceDetectedCb?.(event.result);
      } else if (event.type === 'faceLost') {
        this.faceLostCb?.();
      }
    });
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new ARSDKError(ARErrorCode.NOT_INITIALIZED, 'AR SDK not initialized');
    }
  }
}

export const ARSDKService = new ARSDKServiceClass();
