/**
 * ML Provider Integration Service
 * 
 * Provider-agnostic interface for AI/ML skin analysis.
 * Supports multiple backends: AWS Rekognition, Google Cloud Vision, Azure, Custom API.
 */

import type {
    SkinAnalysisResult,
    SkinConcernType,
    SkinType,
    ConcernSeverity,
    FaceArea,
} from './types';

export interface MLProviderConfig {
    provider: 'aws' | 'google' | 'azure' | 'custom';
    apiEndpoint?: string;
    apiKey?: string;
    modelVersion?: string;
}

/**
 * Base ML Provider Interface
 */
export interface IMLProvider {
    analyzeSkin(imageData: string | Buffer): Promise<Partial<SkinAnalysisResult>>;
    getName(): string;
    getVersion(): string;
}

/**
 * Mock ML Provider (for development/testing)
 */
export class MockMLProvider implements IMLProvider {
    getName(): string {
        return 'mock';
    }

    getVersion(): string {
        return '1.0.0';
    }

    async analyzeSkin(imageData: string | Buffer): Promise<Partial<SkinAnalysisResult>> {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Return mock data with realistic variety
        const mockSkinTypes: SkinType[] = ['oily', 'dry', 'combination', 'normal', 'sensitive'];
        const skinType = mockSkinTypes[Math.floor(Math.random() * mockSkinTypes.length)];

        const mockConcerns: SkinConcernType[] = [
            'acne',
            'wrinkles',
            'dark_spots',
            'redness',
            'large_pores',
            'dryness',
        ];

        // Randomly select 1-4 concerns
        const concernCount = Math.floor(Math.random() * 3) + 1;
        const selectedConcerns = mockConcerns
            .sort(() => Math.random() - 0.5)
            .slice(0, concernCount);

        const concerns = selectedConcerns.map(type => ({
            type,
            severity: (['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)]) as ConcernSeverity,
            confidence: 0.7 + Math.random() * 0.25,
            affectedAreas: this.getRandomAreas(),
            description: this.getConcernDescription(type),
        }));

        return {
            skinType,
            skinTypeConfidence: 0.8 + Math.random() * 0.15,
            skinTone: this.getRandomSkinTone(),
            concerns,
            overallConfidence: 0.85 + Math.random() * 0.1,
            mlProvider: 'custom',
            modelVersion: '1.0.0',
            processingTime: 1500 + Math.random() * 1000,
        };
    }

    private getRandomAreas(): FaceArea[] {
        const areas: FaceArea[] = ['forehead', 'cheeks', 'nose', 'chin', 't_zone'];
        const count = Math.floor(Math.random() * 3) + 1;
        return areas.sort(() => Math.random() - 0.5).slice(0, count);
    }

    private getRandomSkinTone(): string {
        const tones = ['#F5D0A9', '#E8B897', '#D4A574', '#C68E6F', '#A67C52', '#8D5524'];
        return tones[Math.floor(Math.random() * tones.length)];
    }

    private getConcernDescription(concern: SkinConcernType): string {
        const descriptions: Record<SkinConcernType, string> = {
            acne: 'Active breakouts and blemishes detected',
            wrinkles: 'Fine lines and wrinkles visible',
            fine_lines: 'Early signs of aging detected',
            dark_spots: 'Hyperpigmentation and dark spots present',
            hyperpigmentation: 'Uneven skin tone and pigmentation',
            redness: 'Redness and inflammation detected',
            irritation: 'Skin appears irritated or sensitive',
            large_pores: 'Enlarged pores visible',
            texture: 'Uneven skin texture detected',
            dryness: 'Dry patches and flaking visible',
            dehydration: 'Skin appears dehydrated',
            dullness: 'Lack of radiance and vitality',
            uneven_tone: 'Uneven skin tone detected',
        };

        return descriptions[concern];
    }
}

/**
 * Custom API Provider (backend integration)
 */
export class CustomAPIProvider implements IMLProvider {
    private apiEndpoint: string;

    constructor(apiEndpoint: string) {
        this.apiEndpoint = apiEndpoint;
    }

    getName(): string {
        return 'custom';
    }

    getVersion(): string {
        return '1.0.0';
    }

    async analyzeSkin(imageData: string | Buffer): Promise<Partial<SkinAnalysisResult>> {
        // This will be called by the backend, which handles the actual ML provider
        // The frontend just sends the image and receives structured results

        // Convert Buffer to base64 if needed
        const base64Image = typeof imageData === 'string'
            ? imageData
            : imageData.toString('base64');

        const response = await fetch(`${this.apiEndpoint}/api/v1/ai/skin-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageData: base64Image,
            }),
        });

        if (!response.ok) {
            throw new Error(`ML Provider API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
    }
}

/**
 * ML Provider Factory
 */
export class MLProviderFactory {
    static create(config?: MLProviderConfig): IMLProvider {
        // For frontend, we'll use Mock provider for testing
        // In production, use CustomAPIProvider to call backend

        if (__DEV__ || !config) {
            return new MockMLProvider();
        }

        switch (config.provider) {
            case 'custom':
                return new CustomAPIProvider(config.apiEndpoint || '');

            case 'aws':
            case 'google':
            case 'azure':
                // These would be handled by the backend
                // Frontend always uses CustomAPIProvider to communicate with backend
                return new CustomAPIProvider(config.apiEndpoint || '');

            default:
                return new MockMLProvider();
        }
    }
}

/**
 * Main Skin Analysis Service
 */
export class SkinAnalysisService {
    private mlProvider: IMLProvider;

    constructor(config?: MLProviderConfig) {
        this.mlProvider = MLProviderFactory.create(config);
    }

    /**
     * Analyze skin from image
     */
    async analyzeSkin(
        imageData: string,
        metadata: {
            userId: string;
            imageUrl?: string;
        }
    ): Promise<SkinAnalysisResult> {
        const startTime = Date.now();

        try {
            // Call ML provider
            const partialResult = await this.mlProvider.analyzeSkin(imageData);

            const processingTime = Date.now() - startTime;

            // Construct full result
            const result: SkinAnalysisResult = {
                analysisId: this.generateAnalysisId(),
                userId: metadata.userId,
                skinType: partialResult.skinType || 'normal',
                skinTypeConfidence: partialResult.skinTypeConfidence || 0.8,
                skinTone: partialResult.skinTone || '#F5D0A9',
                concerns: partialResult.concerns || [],
                recommendations: partialResult.recommendations || [],
                overallConfidence: partialResult.overallConfidence || 0.8,
                imageUrl: metadata.imageUrl || '',
                processedImageUrl: partialResult.processedImageUrl,
                analyzedAt: Date.now(),
                processingTime,
                mlProvider: partialResult.mlProvider || this.mlProvider.getName() as any,
                modelVersion: partialResult.modelVersion || this.mlProvider.getVersion(),
            };

            return result;
        } catch (error: any) {
            console.error('[SkinAnalysis] ML Provider error:', error);
            throw new Error(`Failed to analyze skin: ${error.message}`);
        }
    }

    private generateAnalysisId(): string {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export singleton instance
export const skinAnalysisService = new SkinAnalysisService();
