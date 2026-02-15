/**
* AR Services Index
 * 
 * Central export for all AR-related services
 */

// Core services
export { FaceTrackingService } from './FaceTrackingService';
export { MakeupRenderer } from './MakeupRenderer';
export { PerformanceMonitor } from './PerformanceMonitor';
export { LandmarkProcessor } from './LandmarkProcessor';
export { ARErrorHandler } from './ErrorHandler';
export { TextureManager } from './TextureManager';
export { ScreenshotService } from './ScreenshotService';
export { SharingService } from './SharingService';
export { ARAnalytics, AnalyticsService } from './AnalyticsService';

// Re-export types
export type {
    FaceDetectionResult,
    FaceLandmark,
    FaceLandmarkGroups,
    FaceBounds,
    FaceOrientation,
    TrackingState,
    FaceTrackingQuality,
    MakeupProduct,
    MakeupCategory,
    MakeupFinish,
    MakeupApplicationSettings,
    ScreenshotOptions,
    ScreenshotResult,
    ARError,
    ARErrorType,
    PerformanceMetrics,
} from '../../modules/ar-sdk/types';
