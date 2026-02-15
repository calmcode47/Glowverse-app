/**
 * Performance Monitor
 * 
 * Monitors AR performance metrics (FPS, memory usage) and automatically
 * adjusts quality settings for optimal experience.
 * 
 * @module PerformanceMonitor
 */

import type { PerformanceMetrics } from '../../modules/ar-sdk/types';

/**
 * Performance level presets
 */
export enum PerformanceLevel {
    High = 'high',
    Medium = 'medium',
    Low = 'low',
}

/**
 * Performance configuration
 */
interface PerformanceConfig {
    targetFps: number;
    enableAutoAdjust: boolean;
    samplingInterval: number; // milliseconds
}

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
    private metrics: PerformanceMetrics | null = null;
    private isMonitoring = false;
    private config: PerformanceConfig;
    private performanceLevel: PerformanceLevel = PerformanceLevel.High;
    private fpsHistory: number[] = [];
    private readonly FPS_HISTORY_SIZE = 30; // last 30 frames

    constructor(config?: Partial<PerformanceConfig>) {
        this.config = {
            targetFps: 30,
            enableAutoAdjust: true,
            samplingInterval: 1000,
            ...config,
        };
    }

    /**
     * Start performance monitoring
     */
    start(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.fpsHistory = [];

        console.log('[PerformanceMonitor] Started');
    }

    /**
     * Stop performance monitoring
     */
    stop(): void {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        this.metrics = null;
        this.fpsHistory = [];

        console.log('[PerformanceMonitor] Stopped');
    }

    /**
     * Update metrics
     * @param metrics New performance metrics
     */
    update(metrics: PerformanceMetrics): void {
        if (!this.isMonitoring) return;

        this.metrics = metrics;

        // Update FPS history
        this.fpsHistory.push(metrics.fps);
        if (this.fpsHistory.length > this.FPS_HISTORY_SIZE) {
            this.fpsHistory.shift();
        }

        // Auto-adjust if enabled
        if (this.config.enableAutoAdjust) {
            this.autoAdjustPerformance();
        }
    }

    /**
     * Get current metrics
     */
    getMetrics(): PerformanceMetrics | null {
        return this.metrics;
    }

    /**
     * Get current FPS
     */
    getCurrentFps(): number {
        return this.metrics?.fps || 0;
    }

    /**
     * Get average FPS from history
     */
    getAverageFps(): number {
        if (this.fpsHistory.length === 0) return 0;

        const sum = this.fpsHistory.reduce((acc, fps) => acc + fps, 0);
        return sum / this.fpsHistory.length;
    }

    /**
     * Get performance level
     */
    getPerformanceLevel(): PerformanceLevel {
        return this.performanceLevel;
    }

    /**
     * Check if performance is acceptable
     */
    isPerformanceAcceptable(): boolean {
        const avgFps = this.getAverageFps();
        return avgFps >= this.config.targetFps * 0.8; // 80% of target FPS
    }

    /**
     * Get dropped frames count
     */
    getDroppedFrames(): number {
        return this.metrics?.droppedFrames || 0;
    }

    /**
     * Get memory usage
     */
    getMemoryUsageMb(): number {
        return this.metrics?.memoryUsageMb || 0;
    }

    /**
     * Auto-adjust performance based on metrics
     */
    private autoAdjustPerformance(): void {
        const avgFps = this.getAverageFps();

        // Not enough data yet
        if (this.fpsHistory.length < 10) return;

        // Downgrade if FPS is consistently low
        if (avgFps < this.config.targetFps * 0.6) {
            this.downgradePerformance();
        }
        // Upgrade if FPS is consistently high
        else if (avgFps > this.config.targetFps * 1.2 && this.performanceLevel !== PerformanceLevel.High) {
            this.upgradePerformance();
        }
    }

    /**
     * Downgrade performance level
     */
    private downgradePerformance(): void {
        const previousLevel = this.performanceLevel;

        if (this.performanceLevel === PerformanceLevel.High) {
            this.performanceLevel = PerformanceLevel.Medium;
        } else if (this.performanceLevel === PerformanceLevel.Medium) {
            this.performanceLevel = PerformanceLevel.Low;
        }

        if (previousLevel !== this.performanceLevel) {
            console.log(`[PerformanceMonitor] Downgraded: ${previousLevel} → ${this.performanceLevel}`);
            // TODO: Emit event for quality adjustment
        }
    }

    /**
     * Upgrade performance level
     */
    private upgradePerformance(): void {
        const previousLevel = this.performanceLevel;

        if (this.performanceLevel === PerformanceLevel.Low) {
            this.performanceLevel = PerformanceLevel.Medium;
        } else if (this.performanceLevel === PerformanceLevel.Medium) {
            this.performanceLevel = PerformanceLevel.High;
        }

        if (previousLevel !== this.performanceLevel) {
            console.log(`[PerformanceMonitor] Upgraded: ${previousLevel} → ${this.performanceLevel}`);
            // TODO: Emit event for quality adjustment
        }
    }

    /**
     * Get performance summary
     */
    getSummary(): {
        fps: number;
        avgFps: number;
        level: PerformanceLevel;
        isAcceptable: boolean;
        memoryMb: number;
    } {
        return {
            fps: this.getCurrentFps(),
            avgFps: this.getAverageFps(),
            level: this.performanceLevel,
            isAcceptable: this.isPerformanceAcceptable(),
            memoryMb: this.getMemoryUsageMb(),
        };
    }
}
