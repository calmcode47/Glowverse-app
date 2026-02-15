/**
 * Product Recommendation Service
 * 
 * Generates product recommendations based on skin analysis results.
 */

import type {
    SkinAnalysisResult,
    ProductRecommendation,
    SkinConcernType,
    ConcernSeverity,
} from './types';
import { getRecommendationsForConcern } from './concernMappings';

export interface ProductSearchCriteria {
    categories: string[];
    keywords: string[];
    ingredients: string[];
    avoidIngredients: string[];
    skinType: string;
}

export class RecommendationService {
    /**
     * Generate product recommendations from analysis results
     */
    generateRecommendations(analysis: SkinAnalysisResult): ProductSearchCriteria[] {
        const criteria: ProductSearchCriteria[] = [];

        // Sort concerns by severity (severe first)
        const sortedConcerns = [...analysis.concerns].sort((a, b) => {
            const severityOrder = { severe: 3, moderate: 2, mild: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });

        // Generate search criteria for each concern
        for (const concern of sortedConcerns) {
            const recommendations = getRecommendationsForConcern(
                concern.type,
                analysis.skinType
            );

            criteria.push({
                categories: recommendations.categories,
                keywords: recommendations.keywords,
                ingredients: recommendations.ingredients,
                avoidIngredients: recommendations.avoidIngredients,
                skinType: analysis.skinType,
            });
        }

        return criteria;
    }

    /**
     * Prioritize concerns based on severity and confidence
     */
    prioritizeConcerns(analysis: SkinAnalysisResult): Array<{
        concern: SkinConcernType;
        severity: ConcernSeverity;
        priority: number;
    }> {
        return analysis.concerns
            .map(concern => ({
                concern: concern.type,
                severity: concern.severity,
                priority: this.calculatePriority(concern.severity, concern.confidence),
            }))
            .sort((a, b) => b.priority - a.priority);
    }

    /**
     * Calculate priority score (1-10)
     */
    private calculatePriority(severity: ConcernSeverity, confidence: number): number {
        const severityScores = {
            severe: 8,
            moderate: 5,
            mild: 3,
        };

        const baseScore = severityScores[severity];
        const confidenceBoost = confidence * 2; // 0-2 boost

        return Math.min(10, baseScore + confidenceBoost);
    }

    /**
     * Get routine recommendations (AM/PM)
     */
    getRoutineRecommendations(analysis: SkinAnalysisResult): {
        morning: string[];
        evening: string[];
    } {
        const morning: string[] = [];
        const evening: string[] = [];

        // Base routine for all skin types
        morning.push('Cleanser', 'Serum', 'Moisturizer', 'Sunscreen');
        evening.push('Cleanser', 'Treatment', 'Moisturizer');

        // Add specific products based on concerns
        const hasConcern = (type: SkinConcernType) =>
            analysis.concerns.some(c => c.type === type);

        if (hasConcern('acne')) {
            morning.splice(2, 0, 'Spot Treatment');
            evening.splice(2, 0, 'Acne Treatment');
        }

        if (hasConcern('wrinkles') || hasConcern('fine_lines')) {
            evening.splice(2, 0, 'Retinol/Retinoid');
            morning.splice(2, 0, 'Eye Cream');
        }

        if (hasConcern('dark_spots') || hasConcern('hyperpigmentation')) {
            morning.splice(2, 0, 'Brightening Serum');
        }

        if (hasConcern('dryness') || hasConcern('dehydration')) {
            morning.splice(2, 0, 'Hydrating Serum');
            evening.push('Facial Oil');
        }

        if (hasConcern('texture')) {
            evening.splice(2, 0, 'Exfoliant (2-3x/week)');
        }

        return { morning, evening };
    }

    /**
     * Get ingredient recommendations
     */
    getIngredientRecommendations(analysis: SkinAnalysisResult): {
        recommended: string[];
        avoid: string[];
    } {
        const recommended = new Set<string>();
        const avoid = new Set<string>();

        for (const concern of analysis.concerns) {
            const recs = getRecommendationsForConcern(concern.type, analysis.skinType);

            recs.ingredients.forEach(ing => recommended.add(ing));
            recs.avoidIngredients.forEach(ing => avoid.add(ing));
        }

        // Add general skin type recommendations
        switch (analysis.skinType) {
            case 'oily':
                recommended.add('salicylic acid');
                recommended.add('niacinamide');
                avoid.add('heavy oils');
                avoid.add('comedogenic ingredients');
                break;

            case 'dry':
                recommended.add('hyaluronic acid');
                recommended.add('ceramides');
                recommended.add('squalane');
                avoid.add('alcohol');
                avoid.add('strong acids');
                break;

            case 'sensitive':
                recommended.add('centella asiatica');
                recommended.add('aloe vera');
                recommended.add('chamomile');
                avoid.add('fragrance');
                avoid.add('alcohol');
                avoid.add('strong acids');
                break;

            case 'combination':
                recommended.add('niacinamide');
                recommended.add('hyaluronic acid');
                break;
        }

        return {
            recommended: Array.from(recommended),
            avoid: Array.from(avoid),
        };
    }
}

export const recommendationService = new RecommendationService();
