import { PerformanceMonitor } from './ar/PerformanceMonitor';
import * as Device from 'expo-device';

export interface ARPerformanceMetrics {
  fps: number;
  memoryUsage: number; // MB
  batteryLevel: number; // %
  batteryDrain: number; // % per minute
  frameDrops: number;
  cameraLatency: number; // ms
  productLoadTime: number; // ms
  deviceInfo: {
    model: string;
    os: string;
    osVersion: string;
    ram: number; // MB
  };
}

class ARPerformanceMonitorService {
  private monitor = new PerformanceMonitor();
  private startedAt: number = 0;
  private lastBatteryLevel: number = -1;
  private lastBatteryCheck: number = 0;

  startMonitoring(): void {
    this.startedAt = Date.now();
    this.monitor.start();
  }
  stopMonitoring(): void {
    this.monitor.stop();
  }

  getMetrics(): ARPerformanceMetrics {
    const now = Date.now();
    const m = this.monitor.getMetrics() || { fps: 0, avgFps: 0, droppedFrames: 0, memoryUsageMb: 0, timestamp: now };
    const ram = (Device.totalMemory ?? 2 * 1024 * 1024 * 1024) / (1024 * 1024);
    const batteryLevel = this.lastBatteryLevel >= 0 ? this.lastBatteryLevel : -1;
    const minutes = Math.max(1, (now - (this.lastBatteryCheck || this.startedAt)) / 60000);
    const batteryDrain = batteryLevel >= 0 ? 0 : 0;
    return {
      fps: m.fps,
      memoryUsage: m.memoryUsageMb,
      batteryLevel,
      batteryDrain,
      frameDrops: m.droppedFrames,
      cameraLatency: 0,
      productLoadTime: 0,
      deviceInfo: {
        model: Device.modelName ?? 'Unknown',
        os: Device.osName ?? 'OS',
        osVersion: String(Device.osVersion ?? ''),
        ram,
      }
    };
  }

  shouldReduceQuality(): boolean {
    return !this.monitor.isPerformanceAcceptable();
  }

  logPerformanceReport(): void {
    const s = this.monitor.getSummary();
    // eslint-disable-next-line no-console
    console.log('[ARPerformance]', s);
  }
}

export const ARPerformanceMonitor = new ARPerformanceMonitorService();

