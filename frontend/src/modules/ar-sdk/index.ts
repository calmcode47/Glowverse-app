/**
 * AR SDK Native Module Bridge
 * 
 * This module provides a TypeScript wrapper around the native AR SDK implementations
 * for iOS and Android. It abstracts vendor-specific details and provides a unified API.
 * 
 * @module ARSDKModule
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import type {
    ARConfig,
    FaceDetectionResult,
    MakeupProduct,
    MakeupApplicationSettings,
    ScreenshotOptions,
    ScreenshotResult,
    AREvent,
    AREventListener,
    PerformanceMetrics,
} from './types';

/**
 * Native module interface definition
 * This matches the methods exposed by native iOS/Android modules
 */
interface NativeARSDKModule {
    /**
     * Initialize AR SDK with configuration
     * @param config SDK configuration
     * @returns Promise that resolves when initialization is complete
     */
    initialize(config: ARConfig): Promise<void>;

    /**
     * Start face tracking session
     * @returns Promise that resolves when tracking starts
     */
    startFaceTracking(): Promise<void>;

    /**
     * Stop face tracking session
     * @returns Promise that resolves when tracking stops
     */
    stopFaceTracking(): Promise<void>;

    /**
     * Apply makeup product with settings
     * @param settings Makeup application settings
     * @returns Promise that resolves when product is applied
     */
    applyMakeup(settings: MakeupApplicationSettings): Promise<void>;

    /**
     * Remove makeup for a specific category
     * @param category Makeup category to remove
     * @returns Promise that resolves when makeup is removed
     */
    removeMakeup(category: string): Promise<void>;

    /**
     * Clear all applied makeup
     * @returns Promise that resolves when all makeup is cleared
     */
    clearAllMakeup(): Promise<void>;

    /**
     * Update makeup intensity for a category
     * @param category Makeup category
     * @param intensity Intensity value (0-1)
     * @returns Promise that resolves when intensity is updated
     */
    updateIntensity(category: string, intensity: number): Promise<void>;

    /**
     * Capture screenshot of current AR view
     * @param options Screenshot options
     * @returns Promise that resolves with screenshot result
     */
    captureScreenshot(options: ScreenshotOptions): Promise<ScreenshotResult>;

    /**
     * Get current performance metrics
     * @returns Promise that resolves with performance metrics
     */
    getPerformanceMetrics(): Promise<PerformanceMetrics>;

    /**
     * Check if device supports AR features
     * @returns Promise that resolves with boolean
     */
    isARSupported(): Promise<boolean>;
}

/**
 * Get the native module (will be null if not linked)
 */
const NativeModule = NativeModules.ARSDKModule as NativeARSDKModule | undefined;

/**
 * Event emitter for AR events
 */
const eventEmitter = NativeModule ? new NativeEventEmitter(NativeModules.ARSDKModule) : null;

/**
 * AR SDK Module - High-level API for AR functionality
 */
class ARSDKModuleClass {
    private isInitialized = false;
    private isMockMode = false;
    private eventListeners: AREventListener[] = [];

    /**
     * Initialize the AR SDK
     * @param config AR configuration
     * @throws Error if native module is not available
     */
    async initialize(config: ARConfig): Promise<void> {
        // Check if native module exists
        if (!NativeModule) {
            console.warn('[ARSDK] Native module not found, using mock mode');
            this.isMockMode = true;
            this.isInitialized = true;
            this.emitEvent({ type: 'initialized' });
            return;
        }

        try {
            await NativeModule.initialize(config);
            this.isInitialized = true;
            this.setupEventListeners();
            this.emitEvent({ type: 'initialized' });
        } catch (error) {
            console.error('[ARSDK] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Start face tracking
     * @throws Error if SDK is not initialized
     */
    async startFaceTracking(): Promise<void> {
        this.ensureInitialized();

        if (this.isMockMode) {
            console.log('[ARSDK] Mock: Starting face tracking');
            return;
        }

        await NativeModule!.startFaceTracking();
    }

    /**
     * Stop face tracking
     */
    async stopFaceTracking(): Promise<void> {
        if (!this.isInitialized || this.isMockMode) return;

        await NativeModule!.stopFaceTracking();
    }

    /**
     * Apply makeup product
     * @param product Makeup product to apply
     * @param intensity Intensity (0-1, default 0.8)
     */
    async applyMakeup(product: MakeupProduct, intensity: number = 0.8): Promise<void> {
        this.ensureInitialized();

        if (this.isMockMode) {
            console.log(`[ARSDK] Mock: Applying ${product.category} - ${product.name} at ${intensity * 100}% intensity`);
            this.emitEvent({ type: 'productApplied', product });
            return;
        }

        const settings: MakeupApplicationSettings = {
            product,
            intensity,
        };

        await NativeModule!.applyMakeup(settings);
        this.emitEvent({ type: 'productApplied', product });
    }

    /**
     * Remove makeup for a category
     * @param category Makeup category to remove
     */
    async removeMakeup(category: string): Promise<void> {
        if (!this.isInitialized) return;

        if (this.isMockMode) {
            console.log(`[ARSDK] Mock: Removing ${category}`);
            this.emitEvent({ type: 'productRemoved', category: category as any });
            return;
        }

        await NativeModule!.removeMakeup(category);
        this.emitEvent({ type: 'productRemoved', category: category as any });
    }

    /**
     * Clear all makeup
     */
    async clearAll(): Promise<void> {
        if (!this.isInitialized) return;

        if (this.isMockMode) {
            console.log('[ARSDK] Mock: Clearing all makeup');
            return;
        }

        await NativeModule!.clearAllMakeup();
    }

    /**
     * Update intensity for a category
     * @param category Makeup category
     * @param intensity New intensity (0-1)
     */
    async updateIntensity(category: string, intensity: number): Promise<void> {
        this.ensureInitialized();

        if (this.isMockMode) {
            console.log(`[ARSDK] Mock: Updating ${category} intensity to ${intensity * 100}%`);
            this.emitEvent({ type: 'intensityChanged', category: category as any, intensity });
            return;
        }

        await NativeModule!.updateIntensity(category, intensity);
        this.emitEvent({ type: 'intensityChanged', category: category as any, intensity });
    }

    /**
     * Capture screenshot
     * @param options Screenshot options
     * @returns Screenshot result with URI
     */
    async captureScreenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
        this.ensureInitialized();

        if (this.isMockMode) {
            console.log('[ARSDK] Mock: Capturing screenshot');
            const mockResult: ScreenshotResult = {
                uri: 'file:///mock/screenshot.jpg',
                width: 1080,
                height: 1920,
                sizeBytes: 524288,
            };
            this.emitEvent({ type: 'screenshotCaptured', result: mockResult });
            return mockResult;
        }

        const result = await NativeModule!.captureScreenshot(options);
        this.emitEvent({ type: 'screenshotCaptured', result });
        return result;
    }

    /**
     * Get performance metrics
     * @returns Current performance metrics
     */
    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        if (!this.isInitialized || this.isMockMode) {
            return {
                fps: 30,
                avgFps: 30,
                droppedFrames: 0,
                memoryUsageMb: 80,
                timestamp: Date.now(),
            };
        }

        return await NativeModule!.getPerformanceMetrics();
    }

    /**
     * Check if device supports AR
     * @returns true if AR is supported
     */
    async isARSupported(): Promise<boolean> {
        if (!NativeModule) return false;

        try {
            return await NativeModule.isARSupported();
        } catch {
            return false;
        }
    }

    /**
     * Add event listener
     * @param listener Event listener callback
     * @returns Unsubscribe function
     */
    addEventListener(listener: AREventListener): () => void {
        this.eventListeners.push(listener);

        return () => {
            const index = this.eventListeners.indexOf(listener);
            if (index > -1) {
                this.eventListeners.splice(index, 1);
            }
        };
    }

    /**
     * Setup native event listeners
     */
    private setupEventListeners(): void {
        if (!eventEmitter) return;

        // Face detection events
        eventEmitter.addListener('onFaceDetected', (result: FaceDetectionResult) => {
            this.emitEvent({ type: 'faceDetected', result });
        });

        eventEmitter.addListener('onFaceLost', () => {
            this.emitEvent({ type: 'faceLost' });
        });

        eventEmitter.addListener('onTrackingQualityChanged', (quality: any) => {
            this.emitEvent({ type: 'trackingQualityChanged', quality });
        });

        eventEmitter.addListener('onPerformanceUpdate', (metrics: PerformanceMetrics) => {
            this.emitEvent({ type: 'performanceUpdate', metrics });
        });

        eventEmitter.addListener('onError', (error: any) => {
            this.emitEvent({ type: 'error', error });
        });
    }

    /**
     * Emit event to all listeners
     */
    private emitEvent(event: AREvent): void {
        this.eventListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('[ARSDK] Error in event listener:', error);
            }
        });
    }

    /**
     * Ensure SDK is initialized
     */
    private ensureInitialized(): void {
        if (!this.isInitialized) {
            throw new Error('AR SDK is not initialized. Call initialize() first.');
        }
    }

    /**
     * Get platform info
     */
    get platform(): typeof Platform.OS {
        return Platform.OS;
    }

    /**
     * Get mock mode status
     */
    get isMock(): boolean {
        return this.isMockMode;
    }
}

/**
 * Singleton instance of AR SDK Module
 */
export const ARSDKModule = new ARSDKModuleClass();

/**
 * Export types for convenience
 */
export * from './types';
