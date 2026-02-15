/**
 * Backend: AI Skin Analysis Types
 * 
 * Type definitions for backend AI skin analysis service.
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
    confidence: number;
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
    reason: string;
    priority: number;
    targetsConcerns: SkinConcernType[];
    suitableForSkinType: SkinType[];
}

export interface SkinAnalysisResult {
    analysisId: string;
    userId: string;
    skinType: SkinType;
    skinTypeConfidence: number;
    skinTone: string;
    concerns: SkinConcern[];
    recommendations: ProductRecommendation[];
    overallConfidence: number;
    imageUrl: string;
    processedImageUrl?: string;
    analyzedAt: number;
    processingTime?: number;
    mlProvider?: string;
    modelVersion?: string;
}

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
