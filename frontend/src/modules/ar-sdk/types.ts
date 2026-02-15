/**
 * Type definitions for AR SDK module
 * Supports multiple AR SDK vendors with a unified interface
 */

/**
 * Supported AR SDK vendors
 */
export type ARSDKVendor = 'perfectcorp' | 'banuba' | 'deepar' | 'modiface' | 'mock';

/**
 * AR SDK configuration options
 */
export interface ARConfig {
  /** SDK vendor identifier */
  vendor: ARSDKVendor;
  
  /** API key for SDK authentication */
  apiKey?: string;
  
  /** License key for SDK (vendor specific) */
  licenseKey?: string;
  
  /** API URL for SDK backend */
  apiUrl?: string;
  
  /** Target frames per second (default: 30) */
  targetFps?: number;
  
  /** Enable GPU acceleration if available */
  enableGpuAcceleration?: boolean;
  
  /** Maximum texture cache size in MB */
  maxTextureCacheSizeMb?: number;
}

/**
 * Face tracking state
 */
export enum TrackingState {
  /** Face tracking not initialized */
  NotInitialized = 'NOT_INITIALIZED',
  
  /** Searching for face */
  Searching = 'SEARCHING',
  
  /** Face detected and tracking */
  Tracking = 'TRACKING',
  
  /** Face tracking lost */
  Lost = 'LOST',
  
  /** Multiple faces detected */
  MultipleDetected = 'MULTIPLE_DETECTED',
  
  /** Error state */
  Error = 'ERROR',
}

/**
 * Face tracking quality indicator
 */
export type FaceTrackingQuality = 'excellent' | 'good' | 'poor' | 'none';

/**
 * 3D coordinate for face landmark
 */
export interface FaceLandmark {
  /** X coordinate (normalized 0-1 or pixel value) */
  x: number;
  
  /** Y coordinate (normalized 0-1 or pixel value) */
  y: number;
  
  /** Z coordinate for depth (optional, normalized) */
  z?: number;
  
  /** Confidence score 0-1 (optional) */
  confidence?: number;
}

/**
 * Face landmark groups for easier access
 */
export interface FaceLandmarkGroups {
  /** Left eye landmarks (6-8 points) */
  leftEye: FaceLandmark[];
  
  /** Right eye landmarks (6-8 points) */
  rightEye: FaceLandmark[];
  
  /** Left eyebrow landmarks (5-6 points) */
  leftEyebrow: FaceLandmark[];
  
  /** Right eyebrow landmarks (5-6 points) */
  rightEyebrow: FaceLandmark[];
  
  /** Nose landmarks (9 points) */
  nose: FaceLandmark[];
  
  /** Lip outer contour landmarks (12 points) */
  lipsOuter: FaceLandmark[];
  
  /** Lip inner contour landmarks (8 points) */
  lipsInner: FaceLandmark[];
  
  /** Face contour landmarks (17 points) */
  faceContour: FaceLandmark[];
  
  /** Left cheek landmark */
  leftCheek: FaceLandmark;
  
  /** Right cheek landmark */
  rightCheek: FaceLandmark;
}

/**
 * Face bounds rectangle
 */
export interface FaceBounds {
  /** Left edge X coordinate */
  left: number;
  
  /** Top edge Y coordinate */
  top: number;
  
  /** Width of face bounds */
  width: number;
  
  /** Height of face bounds */
  height: number;
  
  /** Center point X */
  centerX: number;
  
  /** Center point Y */
  centerY: number;
}

/**
 * Face orientation (Euler angles)
 */
export interface FaceOrientation {
  /** Pitch (nodding up/down) in degrees */
  pitch: number;
  
  /** Yaw (turning left/right) in degrees */
  yaw: number;
  
  /** Roll (tilting head) in degrees */
  roll: number;
}

/**
 * Complete face detection result
 */
export interface FaceDetectionResult {
  /** Tracking state */
  state: TrackingState;
  
  /** Overall tracking quality */
  quality: FaceTrackingQuality;
  
  /** All facial landmarks (68+ points) */
  landmarks: FaceLandmark[];
  
  /** Grouped landmarks for convenience */
  landmarkGroups: FaceLandmarkGroups;
  
  /** Face bounding box */
  bounds: FaceBounds;
  
  /** Face orientation */
  orientation: FaceOrientation;
  
  /** Confidence score 0-1 */
  confidence: number;
  
  /** Timestamp of detection */
  timestamp: number;
}

/**
 * Makeup product categories
 */
export type MakeupCategory = 'lipstick' | 'eyeshadow' | 'eyeliner' | 'blush' | 'foundation' | 'mascara';

/**
 * Makeup finish types
 */
export type MakeupFinish = 'matte' | 'glossy' | 'satin' | 'shimmer' | 'glitter' | 'metallic';

/**
 * Makeup product definition
 */
export interface MakeupProduct {
  /** Unique product identifier */
  id: string;
  
  /** Product name */
  name: string;
  
  /** Product category */
  category: MakeupCategory;
  
  /** Brand name */
  brand?: string;
  
  /** Primary color (hex or rgb/rgba string) */
  color: string;
  
  /** Additional colors for multi-tone products */
  additionalColors?: string[];
  
  /** Finish type */
  finish: MakeupFinish;
  
  /** Default opacity (0-1) */
  opacity: number;
  
  /** Texture image URL (optional) */
  textureUrl?: string;
  
  /** Thumbnail image URL */
  thumbnailUrl?: string;
  
  /** Vendor-specific product ID (for SDK integration) */
  vendorProductId?: string;
}

/**
 * Makeup application settings
 */
export interface MakeupApplicationSettings {
  /** Product to apply */
  product: MakeupProduct;
  
  /** Intensity multiplier (0-1, where 1 is 100%) */
  intensity: number;
  
  /** Custom opacity override (0-1) */
  opacity?: number;
  
  /** Custom color override */
  customColor?: string;
  
  /** Blend mode (if supported by SDK) */
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
}

/**
 * Screenshot capture options
 */
export interface ScreenshotOptions {
  /** Include watermark */
  watermark?: boolean;
  
  /** JPEG quality (0-100) */
  quality?: number;
  
  /** Image format */
  format?: 'jpeg' | 'png';
  
  /** Save to device gallery */
  saveToGallery?: boolean;
}

/**
 * Screenshot result
 */
export interface ScreenshotResult {
  /** File URI of captured screenshot */
  uri: string;
  
  /** Width in pixels */
  width: number;
  
  /** Height in pixels */
  height: number;
  
  /** File size in bytes */
  sizeBytes: number;
}

/**
 * AR error types
 */
export enum ARErrorType {
  /** SDK initialization failed */
  InitializationFailed = 'INITIALIZATION_FAILED',
  
  /** Camera permission denied */
  PermissionDenied = 'PERMISSION_DENIED',
  
  /** Device doesn't support AR features */
  UnsupportedDevice = 'UNSUPPORTED_DEVICE',
  
  /** Invalid license key */
  InvalidLicense = 'INVALID_LICENSE',
  
  /** Face detection timeout */
  DetectionTimeout = 'DETECTION_TIMEOUT',
  
  /** Low performance detected */
  LowPerformance = 'LOW_PERFORMANCE',
  
  /** Error applying makeup product */
  ProductApplicationFailed = 'PRODUCT_APPLICATION_FAILED',
  
  /** Screenshot capture failed */
  ScreenshotFailed = 'SCREENSHOT_FAILED',
  
  /** Network error (SDK backend) */
  NetworkError = 'NETWORK_ERROR',
  
  /** Unknown error */
  Unknown = 'UNKNOWN',
}

/**
 * AR error object
 */
export interface ARError {
  /** Error type */
  type: ARErrorType;
  
  /** User-friendly error message */
  message: string;
  
  /** Technical error details */
  details?: string;
  
  /** Error code (vendor-specific) */
  code?: string;
  
  /** Suggested recovery action */
  recoveryAction?: string;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Current frames per second */
  fps: number;
  
  /** Average FPS over measurement window */
  avgFps: number;
  
  /** Number of dropped frames */
  droppedFrames: number;
  
  /** Memory usage in MB */
  memoryUsageMb: number;
  
  /** CPU usage percentage (0-100) */
  cpuUsage?: number;
  
  /** GPU usage percentage (0-100, if available) */
  gpuUsage?: number;
  
  /** Measurement timestamp */
  timestamp: number;
}

/**
 * Event types emitted by AR SDK
 */
export type AREvent =
  | { type: 'initialized'; }
  | { type: 'faceDetected'; result: FaceDetectionResult; }
  | { type: 'faceLost'; }
  | { type: 'trackingQualityChanged'; quality: FaceTrackingQuality; }
  | { type: 'productApplied'; product: MakeupProduct; }
  | { type: 'productRemoved'; category: MakeupCategory; }
  | { type: 'intensityChanged'; category: MakeupCategory; intensity: number; }
  | { type: 'screenshotCaptured'; result: ScreenshotResult; }
  | { type: 'performanceUpdate'; metrics: PerformanceMetrics; }
  | { type: 'error'; error: ARError; };

/**
 * Event listener callback type
 */
export type AREventListener = (event: AREvent) => void;
