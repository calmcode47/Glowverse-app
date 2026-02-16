import { NativeEventEmitter, NativeModules } from 'react-native';
import { ARSDKService } from '../../services/ar/ARSDKService';
import { ARSDKModule } from '../ar-sdk';
import type { AREvent } from '../ar-sdk/types';
import type { Product } from '../../data/products';
import { convertGlowverseProductToAR, arProductToMakeupProduct } from '../../services/arProductService';

type Listener = (event: AREvent) => void;

class ARBridgeClass {
  private emitter = new NativeEventEmitter((NativeModules as any).ARSDKModule);
  private unsub?: () => void;

  async initialize(licenseKey?: string): Promise<void> {
    await ARSDKService.initialize({ licenseKey });
  }

  async loadProduct(product: Product): Promise<void> {
    const ar = convertGlowverseProductToAR(product);
    const mp = arProductToMakeupProduct(ar);
    await ARSDKModule.applyMakeup(mp, ar.intensity.default / 100);
  }

  async startSession(): Promise<void> {
    await ARSDKService.startSession();
  }

  async stopSession(): Promise<void> {
    await ARSDKService.stopSession();
  }

  async capture(): Promise<{ uri: string }> {
    const res = await ARSDKService.captureScreenshot();
    return { uri: res.uri };
  }

  async setIntensity(category: string, value: number): Promise<void> {
    await ARSDKModule.updateIntensity(category, Math.max(0, Math.min(1, value / 100)));
  }

  addEventListener(listener: Listener): () => void {
    this.unsub?.();
    this.unsub = ARSDKModule.addEventListener(listener);
    return () => this.unsub?.();
  }
}

export const ARBridge = new ARBridgeClass();

