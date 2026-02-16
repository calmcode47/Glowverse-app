import * as Device from 'expo-device';
import type { PerformanceMetrics } from '../modules/ar-sdk/types';

export enum ARQualityPreset {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  AUTO = 'auto'
}

export type ARQualitySettings = {
  preset: ARQualityPreset;
  frameRate: number;
  resolution: { width: number; height: number };
  textureQuality: 'high' | 'medium' | 'low';
  enableShadows: boolean;
  enableReflections: boolean;
};

type DeviceCapabilities = {
  ramMb: number;
  model: string;
  os: string;
  gpuClass: 'high' | 'mid' | 'low';
};

class ARQualityManagerClass {
  private current: ARQualitySettings | null = null;
  private overridePreset: ARQualityPreset | null = null;

  detectDeviceCapabilities(): DeviceCapabilities {
    const ramMb = (Device.totalMemory ?? 2 * 1024 * 1024 * 1024) / (1024 * 1024);
    const model = Device.modelName ?? 'Unknown';
    const os = `${Device.osName} ${Device.osVersion}`;
    const gpuClass = ramMb > 5000 ? 'high' : ramMb > 3000 ? 'mid' : 'low';
    return { ramMb, model, os, gpuClass };
  }

  selectOptimalPreset(): ARQualityPreset {
    if (this.overridePreset && this.overridePreset !== ARQualityPreset.AUTO) return this.overridePreset;
    const caps = this.detectDeviceCapabilities();
    if (caps.gpuClass === 'high') return ARQualityPreset.HIGH;
    if (caps.gpuClass === 'mid') return ARQualityPreset.MEDIUM;
    return ARQualityPreset.LOW;
  }

  applyQualitySettings(settings?: Partial<ARQualitySettings>): ARQualitySettings {
    const preset = settings?.preset || this.selectOptimalPreset();
    const base = this.settingsForPreset(preset);
    this.current = { ...base, ...settings, preset };
    return this.current;
  }

  adjustQualityDynamically(metrics: PerformanceMetrics): void {
    if (!this.current) return;
    if (metrics.fps < this.current.frameRate * 0.8 && this.current.preset !== ARQualityPreset.LOW) {
      this.applyQualitySettings({ preset: this.downgradePreset(this.current.preset) });
    } else if (metrics.fps > this.current.frameRate * 1.1 && this.current.preset !== ARQualityPreset.HIGH) {
      this.applyQualitySettings({ preset: this.upgradePreset(this.current.preset) });
    }
  }

  setManualPreset(preset: ARQualityPreset | null): void {
    this.overridePreset = preset;
  }

  getCurrentSettings(): ARQualitySettings | null {
    return this.current;
  }

  private settingsForPreset(preset: ARQualityPreset): ARQualitySettings {
    switch (preset) {
      case ARQualityPreset.HIGH:
        return { preset, frameRate: 30, resolution: { width: 1080, height: 1920 }, textureQuality: 'high', enableShadows: true, enableReflections: true };
      case ARQualityPreset.MEDIUM:
        return { preset, frameRate: 24, resolution: { width: 720, height: 1280 }, textureQuality: 'medium', enableShadows: true, enableReflections: false };
      case ARQualityPreset.LOW:
      default:
        return { preset: ARQualityPreset.LOW, frameRate: 20, resolution: { width: 480, height: 854 }, textureQuality: 'low', enableShadows: false, enableReflections: false };
    }
  }

  private downgradePreset(p: ARQualityPreset): ARQualityPreset {
    if (p === ARQualityPreset.HIGH) return ARQualityPreset.MEDIUM;
    return ARQualityPreset.LOW;
    }

  private upgradePreset(p: ARQualityPreset): ARQualityPreset {
    if (p === ARQualityPreset.LOW) return ARQualityPreset.MEDIUM;
    return ARQualityPreset.HIGH;
  }
}

export const ARQualityManager = new ARQualityManagerClass();

