/**
 * AR Analytics Service
 * 
 * Tracks AR usage events for analytics and optimization.
 * 
 * @module AnalyticsService
 */

import type {
    MakeupProduct,
    MakeupCategory,
    PerformanceMetrics,
    ARError,
} from '../../modules/ar-sdk/types';

/**
 * Analytics event types
 */
type AnalyticsEvent =
    | { event: 'ar_session_started'; platform: string; }
    | { event: 'ar_session_ended'; duration: number; productsApplied: number; }
    | { event: 'ar_face_detected'; timeToDetect: number; quality: string; }
    | { event: 'ar_product_applied'; product: MakeupProduct; intensity: number; }
    | { event: 'ar_product_removed'; category: MakeupCategory; }
    | { event: 'ar_intensity_changed'; category: MakeupCategory; from: number; to: number; }
    | { event: 'ar_screenshot_captured'; products: MakeupProduct[]; }
    | { event: 'ar_screenshot_shared'; platform?: string; }
    | { event: 'ar_performance_issue'; metrics: PerformanceMetrics; }
    | { event: 'ar_error_occurred'; error: ARError; };

/**
 * AR Analytics Service class
 */
export class AnalyticsService {
    private sessionStartTime: number | null = null;
    private sessionProductCount: number = 0;

    /**
     * Track AR session start
     */
    trackSessionStart(platform: string): void {
        this.sessionStartTime = Date.now();
        this.sessionProductCount = 0;

        this.track({
            event: 'ar_session_started',
            platform,
        });
    }

    /**
     * Track AR session end
     */
    trackSessionEnd(): void {
        if (!this.sessionStartTime) return;

        const duration = Date.now() - this.sessionStartTime;

        this.track({
            event: 'ar_session_ended',
            duration,
            productsApplied: this.sessionProductCount,
        });

        this.sessionStartTime = null;
        this.sessionProductCount = 0;
    }

    /**
     * Track face detection
     */
    trackFaceDetected(timeToDetect: number, quality: string): void {
        this.track({
            event: 'ar_face_detected',
            timeToDetect,
            quality,
        });
    }

    /**
     * Track product application
     */
    trackProductApplied(product: MakeupProduct, intensity: number): void {
        this.sessionProductCount++;

        this.track({
            event: 'ar_product_applied',
            product,
            intensity,
        });
    }

    /**
     * Track product removal
     */
    trackProductRemoved(category: MakeupCategory): void {
        this.track({
            event: 'ar_product_removed',
            category,
        });
    }

    /**
     * Track intensity change
     */
    trackIntensityChanged(category: MakeupCategory, from: number, to: number): void {
        this.track({
            event: 'ar_intensity_changed',
            category,
            from,
            to,
        });
    }

    /**
     * Track screenshot capture
     */
    trackScreenshotCaptured(products: MakeupProduct[]): void {
        this.track({
            event: 'ar_screenshot_captured',
            products,
        });
    }

    /**
     * Track screenshot share
     */
    trackScreenshotShared(platform?: string): void {
        this.track({
            event: 'ar_screenshot_shared',
            platform,
        });
    }

    /**
     * Track performance issue
     */
    trackPerformanceIssue(metrics: PerformanceMetrics): void {
        this.track({
            event: 'ar_performance_issue',
            metrics,
        });
    }

    /**
     * Track error
     */
    trackError(error: ARError): void {
        this.track({
            event: 'ar_error_occurred',
            error,
        });
    }

    /**
     * Send event to analytics backend
     */
    private track(event: AnalyticsEvent): void {
        // TODO: Integrate with Firebase Analytics, Segment, orother analytics service

        console.log('[Analytics]', event);

        // Example Firebase Analytics integration:
        // import analytics from '@react-native-firebase/analytics';
        // analytics().logEvent(event.event, event);
    }
}

/**
 * Singleton instance
 */
export const ARAnalytics = new AnalyticsService();
