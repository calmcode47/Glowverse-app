/**
 * AI Skin Analysis Type Definitions
 * 
 * Comprehensive types for skin analysis results, concerns, and recommendations.
 */

export type SkinType = 'oily' | 'dry' | 'combination' | 'normal' | 'sensitive';

export type SkinConcernType =
    | 'acne'
    | 'wrinkles'
    | 'fine_lines'
    | 'dark_spots'
    | 'hyperpigmentation'
    | 'redness'
    | 'irritation'
    | 'large_pores'
    | 'texture'
    | 'dryness'
    | 'dehydration'
    | 'dullness'
    | 'uneven_tone';

export type ConcernSeverity = 'mild' | 'moderate' | 'severe';

export type FaceArea =
    | 'forehead'
    | 'cheeks'
    | 'nose'
    | 'chin'
    | 'under_eyes'
    | 'around_mouth'
    | 'jawline'
    | 't_zone';

export interface SkinConcern {
    type: SkinConcernType;
    severity: ConcernSeverity;
    confidence: number; // 0-1
    affectedAreas: FaceArea[];
    description?: string;
}

export interface ProductRecommendation {
    productId: string;
    name: string;
    brand: string;
    category: string;
    imageUrl?: string;
    price: number;
    reason: string; // Why this product is recommended
    priority: number; // 1-5, higher is more important
    targetsConcerns: SkinConcernType[];
    suitableForSkinType: SkinType[];
}

export interface SkinAnalysisResult {
    analysisId: string;
    userId: string;

    // Skin characteristics
    skinType: SkinType;
    skinTypeConfidence: number;
    skinTone: string; // Hex color or classification

    // Detected concerns
    concerns: SkinConcern[];

    // Product recommendations
    recommendations: ProductRecommendation[];

    // Overall confidence
    overallConfidence: number; // 0-1

    // Metadata
    imageUrl: string;
    processedImageUrl?: string;
    analyzedAt: number;
    processingTime?: number; // milliseconds

    // ML provider info
    mlProvider?: 'aws' | 'google' | 'azure' | 'custom';
    modelVersion?: string;
}

export interface SkinAnalysisRequest {
    userId: string;
    imageData?: string; // base64 encoded
    imageUrl?: string; // Alternative to imageData
    timestamp: number;
    source?: 'camera' | 'upload' | 'url';
}

export interface SkinAnalysisHistory {
    analyses: SkinAnalysisResult[];
    total: number;
    page: number;
    pageSize: number;
}

export interface AnalysisComparison {
    previous: SkinAnalysisResult;
    current: SkinAnalysisResult;
    improvements: {
        concern: SkinConcernType;
        previousSeverity: ConcernSeverity;
        currentSeverity: ConcernSeverity;
        percentageChange: number;
    }[];
    concerns: {
        concern: SkinConcernType;
        previousSeverity?: ConcernSeverity;
        currentSeverity: ConcernSeverity;
        isNew: boolean;
    }[];
}

/**
 * Image validation result
 */
export interface ImageValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    metadata?: {
        width: number;
        height: number;
        size: number; // bytes
        format: string;
    };
}

/**
 * ML Provider Response (internal)
 */
export interface MLProviderResponse {
    skinType?: {
        type: SkinType;
        confidence: number;
    };
    skinTone?: {
        hex: string;
        classification: string;
    };
    detections: {
        label: string;
        confidence: number;
        boundingBox?: {
            left: number;
            top: number;
            width: number;
            height: number;
        };
    }[];
    processingTime: number;
    modelVersion: string;
}

/**
 * User consent for AI analysis
 */
export interface AIConsent {
    userId: string;
    consentedAt: number;
    ipAddress?: string;
    userAgent?: string;
    version: string; // Policy version
}
