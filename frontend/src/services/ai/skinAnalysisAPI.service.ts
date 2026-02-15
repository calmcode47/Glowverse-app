/**
 * AI Skin Analysis API Service
 * 
 * Frontend service for interacting with AI skin analysis backend.
 */

import { client } from '../api/client';
import type {
    SkinAnalysisResult,
    SkinAnalysisRequest,
    SkinAnalysisHistory,
    AIConsent,
    AnalysisComparison,
} from './types';

class SkinAnalysisAPIService {
    /**
     * Analyze skin from image
     */
    async analyzeSkin(request: {
        imageData?: string;
        imageUrl?: string;
    }): Promise<SkinAnalysisResult> {
        try {
            const response = await client.post<{ data: SkinAnalysisResult }>(
                '/api/v1/ai/skin-analysis',
                request
            );

            return response.data.data;
        } catch (error: any) {
            console.error('[SkinAnalysis] Analysis failed:', error);
            throw new Error(error.response?.data?.message || 'Failed to analyze skin');
        }
    }

    /**
     * Get analysis history
     */
    async getAnalysisHistory(page: number = 1, pageSize: number = 10): Promise<SkinAnalysisHistory> {
        try {
            const response = await client.get<SkinAnalysisHistory>(
                '/api/v1/ai/analysis-history',
                {
                    params: { page, pageSize },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to get history:', error);
            throw new Error('Failed to load analysis history');
        }
    }

    /**
     * Get specific analysis
     */
    async getAnalysis(analysisId: string): Promise<SkinAnalysisResult> {
        try {
            const response = await client.get<{ data: SkinAnalysisResult }>(
                `/api/v1/ai/analysis/${analysisId}`
            );

            return response.data.data;
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to get analysis:', error);
            throw new Error('Failed to load analysis');
        }
    }

    /**
     * Delete analysis
     */
    async deleteAnalysis(analysisId: string): Promise<void> {
        try {
            await client.delete(`/api/v1/ai/analysis/${analysisId}`);
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to delete analysis:', error);
            throw new Error('Failed to delete analysis');
        }
    }

    /**
     * Compare two analyses
     */
    async compareAnalyses(
        previousId: string,
        currentId: string
    ): Promise<AnalysisComparison> {
        try {
            const response = await client.get<AnalysisComparison>(
                '/api/v1/ai/analysis/compare',
                {
                    params: { previous: previousId, current: currentId },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to compare analyses:', error);
            throw new Error('Failed to compare analyses');
        }
    }

    /**
     * Record user consent for AI analysis
     */
    async recordConsent(): Promise<void> {
        try {
            await client.post('/api/v1/ai/consent', {
                timestamp: Date.now(),
            });
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to record consent:', error);
            throw new Error('Failed to record consent');
        }
    }

    /**
     * Check if user has given consent
     */
    async hasConsent(): Promise<boolean> {
        try {
            const response = await client.get<{ hasConsent: boolean }>(
                '/api/v1/ai/consent/status'
            );

            return response.data.hasConsent;
        } catch (error) {
            // If endpoint doesn't exist or fails, assume no consent
            return false;
        }
    }

    /**
     * Revoke consent
     */
    async revokeConsent(): Promise<void> {
        try {
            await client.delete('/api/v1/ai/consent');
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to revoke consent:', error);
            throw new Error('Failed to revoke consent');
        }
    }

    /**
     * Get recommendations for specific concerns
     */
    async getRecommendations(params: {
        skinType?: string;
        concerns?: string[];
        limit?: number;
    }): Promise<any[]> {
        try {
            const response = await client.get('/api/v1/ai/recommendations', {
                params,
            });

            return response.data.recommendations || response.data.items || [];
        } catch (error: any) {
            console.error('[SkinAnalysis] Failed to get recommendations:', error);
            return [];
        }
    }
}

export const skinAnalysisAPI = new SkinAnalysisAPIService();
