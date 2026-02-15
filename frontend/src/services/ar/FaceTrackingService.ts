/**
 * Face Tracking Service
 * 
 * High-level service for managing face detection and tracking using the AR SDK.
 * Handles camera session, frame processing, and landmark extraction.
 * 
 * @module FaceTrackingService
 */

import { ARSDKModule } from '../../modules/ar-sdk';
import {
    FaceDetectionResult,
    TrackingState,
    FaceTrackingQuality,
    AREvent,
} from '../../modules/ar-sdk/types';
import { PerformanceMonitor } from './PerformanceMonitor';

/**
 * Face tracking event listeners
 */
type FaceTrackingListener = {
    onFaceDetected?: (result: FaceDetectionResult) => void;
    onFaceLost?: () => void;
    onTrackingQualityChanged?: (quality: FaceTrackingQuality) => void;
    onError?: (error: Error) => void;
};

/**
 * Face Tracking Service - Singleton
 */
class FaceTrackingServiceClass {
    private isTracking = false;
    private listeners: FaceTrackingListener[] = [];
    private currentFaceResult: FaceDetectionResult | null = null;
    private performanceMonitor: PerformanceMonitor;
    private unsubscribeAREvents: (() => void) | null = null;

    constructor() {
        this.performanceMonitor = new PerformanceMonitor();
    }

    /**
     * Start face tracking session
     * @throws Error if AR SDK is not initialized
     */
    async start(): Promise<void> {
        if (this.isTracking) {
            console.warn('[FaceTracking] Already tracking');
            return;
        }

        try {
            // Start AR SDK face tracking
            await ARSDKModule.startFaceTracking();

            // Subscribe to AR events
            this.unsubscribeAREvents = ARSDKModule.addEventListener(this.handleAREvent);

            // Start performance monitoring
            this.performanceMonitor.start();

            this.isTracking = true;
            console.log('[FaceTracking] Started successfully');
        } catch (error) {
            console.error('[FaceTracking] Failed to start:', error);
            this.notifyError(error as Error);
            throw error;
        }
    }

    /**
     * Stop face tracking session
     */
    async stop(): Promise<void> {
        if (!this.isTracking) return;

        try {
            await ARSDKModule.stopFaceTracking();

            // Unsubscribe from AR events
            if (this.unsubscribeAREvents) {
                this.unsubscribeAREvents();
                this.unsubscribeAREvents = null;
            }

            // Stop performance monitoring
            this.performanceMonitor.stop();

            this.isTracking = false;
            this.currentFaceResult = null;

            console.log('[FaceTracking] Stopped successfully');
        } catch (error) {
            console.error('[FaceTracking] Failed to stop:', error);
        }
    }

    /**
     * Get current face detection result
     * @returns Current face result or null if no face detected
     */
    getCurrentFace(): FaceDetectionResult | null {
        return this.currentFaceResult;
    }

    /**
     * Get current tracking state
     */
    getTrackingState(): TrackingState {
        if (!this.isTracking) {
            return TrackingState.NotInitialized;
        }

        if (!this.currentFaceResult) {
            return TrackingState.Searching;
        }

        return this.currentFaceResult.state;
    }

    /**
     * Get current tracking quality
     */
    getTrackingQuality(): FaceTrackingQuality {
        if (!this.currentFaceResult) {
            return 'none';
        }

        return this.currentFaceResult.quality;
    }

    /**
     * Check if face is currently detected
     */
    isFaceDetected(): boolean {
        return this.currentFaceResult !== null &&
            this.currentFaceResult.state === TrackingState.Tracking;
    }

    /**
     * Add event listener
     * @param listener Listener callbacks
     * @returns Unsubscribe function
     */
    addListener(listener: FaceTrackingListener): () => void {
        this.listeners.push(listener);

        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Handle AR SDK events
     */
    private handleAREvent = (event: AREvent): void => {
        switch (event.type) {
            case 'faceDetected':
                this.handleFaceDetected(event.result);
                break;

            case 'faceLost':
                this.handleFaceLost();
                break;

            case 'trackingQualityChanged':
                this.notifyTrackingQualityChanged(event.quality);
                break;

            case 'performanceUpdate':
                this.performanceMonitor.update(event.metrics);
                break;

            case 'error':
                this.notifyError(new Error(event.error.message));
                break;
        }
    };

    /**
     * Handle face detected event
     */
    private handleFaceDetected(result: FaceDetectionResult): void {
        this.currentFaceResult = result;

        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener.onFaceDetected?.(result);
            } catch (error) {
                console.error('[FaceTracking] Error in listener:', error);
            }
        });
    }

    /**
     * Handle face lost event
     */
    private handleFaceLost(): void {
        this.currentFaceResult = null;

        // Notify listeners
        this.listeners.forEach(listener => {
            try {
                listener.onFaceLost?.();
            } catch (error) {
                console.error('[FaceTracking] Error in listener:', error);
            }
        });
    }

    /**
     * Notify tracking quality changed
     */
    private notifyTrackingQualityChanged(quality: FaceTrackingQuality): void {
        this.listeners.forEach(listener => {
            try {
                listener.onTrackingQualityChanged?.(quality);
            } catch (error) {
                console.error('[FaceTracking] Error in listener:', error);
            }
        });
    }

    /**
     * Notify error
     */
    private notifyError(error: Error): void {
        this.listeners.forEach(listener => {
            try {
                listener.onError?.(error);
            } catch (err) {
                console.error('[FaceTracking] Error in error listener:', err);
            }
        });
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return this.performanceMonitor.getMetrics();
    }

    /**
     * Is service currently tracking
     */
    get isActive(): boolean {
        return this.isTracking;
    }
}

/**
 * Singleton instance
 */
export const FaceTrackingService = new FaceTrackingServiceClass();
