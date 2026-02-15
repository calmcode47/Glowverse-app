/**
 * Recommendation Engine - Concern to Product Mappings
 * 
 * Maps skin concerns to product categories and search terms.
 */

import type { SkinConcernType, SkinType } from './types';

export interface ConcernMapping {
    concern: SkinConcernType;
    productCategories: string[];
    searchKeywords: string[];
    ingredients: string[];
    avoidIngredientsFor?: {
        skinType: SkinType;
        ingredients: string[];
    }[];
}

/**
 * Comprehensive concern-to-product mappings
 */
export const CONCERN_MAPPINGS: ConcernMapping[] = [
    {
        concern: 'acne',
        productCategories: ['Cleanser', 'Serum', 'Treatment', 'Moisturizer'],
        searchKeywords: [
            'acne',
            'blemish',
            'clarifying',
            'purifying',
            'anti-blemish',
            'spot treatment',
        ],
        ingredients: [
            'salicylic acid',
            'benzoyl peroxide',
            'niacinamide',
            'tea tree oil',
            'zinc',
            'sulfur',
        ],
        avoidIngredientsFor: [
            {
                skinType: 'dry',
                ingredients: ['alcohol', 'strong acids'],
            },
        ],
    },

    {
        concern: 'wrinkles',
        productCategories: ['Serum', 'Eye Cream', 'Moisturizer', 'Treatment'],
        searchKeywords: [
            'anti-aging',
            'anti-wrinkle',
            'firming',
            'lifting',
            'retinol',
            'peptide',
        ],
        ingredients: [
            'retinol',
            'retinoid',
            'peptides',
            'vitamin c',
            'hyaluronic acid',
            'collagen',
            'niacinamide',
        ],
    },

    {
        concern: 'fine_lines',
        productCategories: ['Serum', 'Eye Cream', 'Moisturizer'],
        searchKeywords: [
            'anti-aging',
            'plumping',
            'hydrating',
            'smoothing',
        ],
        ingredients: [
            'hyaluronic acid',
            'peptides',
            'vitamin c',
            'ceramides',
            'retinol',
        ],
    },

    {
        concern: 'dark_spots',
        productCategories: ['Serum', 'Treatment', 'Moisturizer'],
        searchKeywords: [
            'brightening',
            'dark spot',
            'hyperpigmentation',
            'even tone',
            'radiance',
        ],
        ingredients: [
            'vitamin c',
            'niacinamide',
            'alpha arbutin',
            'kojic acid',
            'licorice extract',
            'tranexamic acid',
        ],
    },

    {
        concern: 'hyperpigmentation',
        productCategories: ['Serum', 'Treatment', 'Sunscreen'],
        searchKeywords: [
            'brightening',
            'hyperpigmentation',
            'even tone',
            'dark spot corrector',
        ],
        ingredients: [
            'vitamin c',
            'niacinamide',
            'alpha arbutin',
            'azelaic acid',
            'tranexamic acid',
        ],
    },

    {
        concern: 'redness',
        productCategories: ['Serum', 'Moisturizer', 'Treatment'],
        searchKeywords: [
            'calming',
            'soothing',
            'redness relief',
            'anti-redness',
            'sensitive skin',
        ],
        ingredients: [
            'centella asiatica',
            'azelaic acid',
            'niacinamide',
            'green tea',
            'aloe vera',
            'chamomile',
        ],
    },

    {
        concern: 'irritation',
        productCategories: ['Cleanser', 'Moisturizer', 'Treatment'],
        searchKeywords: [
            'calming',
            'soothing',
            'gentle',
            'sensitive skin',
            'barrier repair',
        ],
        ingredients: [
            'ceramides',
            'centella asiatica',
            'colloidal oatmeal',
            'allantoin',
            'panthenol',
        ],
    },

    {
        concern: 'large_pores',
        productCategories: ['Cleanser', 'Toner', 'Serum'],
        searchKeywords: [
            'pore minimizing',
            'pore refining',
            'mattifying',
            'exfoliating',
        ],
        ingredients: [
            'niacinamide',
            'salicylic acid',
            'retinol',
            'clay',
            'charcoal',
        ],
    },

    {
        concern: 'texture',
        productCategories: ['Exfoliator', 'Serum', 'Toner'],
        searchKeywords: [
            'smoothing',
            'resurfacing',
            'exfoliating',
            'texture',
        ],
        ingredients: [
            'glycolic acid',
            'lactic acid',
            'retinol',
            'enzyme exfoliants',
            'niacinamide',
        ],
    },

    {
        concern: 'dryness',
        productCategories: ['Cleanser', 'Moisturizer', 'Serum', 'Mask'],
        searchKeywords: [
            'hydrating',
            'moisturizing',
            'nourishing',
            'dry skin',
            'intense hydration',
        ],
        ingredients: [
            'hyaluronic acid',
            'ceramides',
            'glycerin',
            'squalane',
            'shea butter',
            'peptides',
        ],
    },

    {
        concern: 'dehydration',
        productCategories: ['Serum', 'Moisturizer', 'Mask'],
        searchKeywords: [
            'hydrating',
            'plumping',
            'water-based',
            'moisture boost',
        ],
        ingredients: [
            'hyaluronic acid',
            'glycerin',
            'aloe vera',
            'snail mucin',
            'beta-glucan',
        ],
    },

    {
        concern: 'dullness',
        productCategories: ['Exfoliator', 'Serum', 'Mask'],
        searchKeywords: [
            'brightening',
            'radiance',
            'glow',
            'illuminating',
            'vitamin c',
        ],
        ingredients: [
            'vitamin c',
            'niacinamide',
            'glycolic acid',
            'lactic acid',
            'vitamin e',
        ],
    },

    {
        concern: 'uneven_tone',
        productCategories: ['Serum', 'Treatment', 'Exfoliator'],
        searchKeywords: [
            'even tone',
            'brightening',
            'complexion',
            'radiance',
        ],
        ingredients: [
            'vitamin c',
            'niacinamide',
            'alpha arbutin',
            'glycolic acid',
            'licorice extract',
        ],
    },
];

/**
 * Get product recommendations for a specific concern
 */
export function getRecommendationsForConcern(
    concern: SkinConcernType,
    skinType?: SkinType
): {
    categories: string[];
    keywords: string[];
    ingredients: string[];
    avoidIngredients: string[];
} {
    const mapping = CONCERN_MAPPINGS.find(m => m.concern === concern);

    if (!mapping) {
        return {
            categories: [],
            keywords: [],
            ingredients: [],
            avoidIngredients: [],
        };
    }

    let avoidIngredients: string[] = [];

    if (skinType && mapping.avoidIngredientsFor) {
        const avoidRule = mapping.avoidIngredientsFor.find(
            rule => rule.skinType === skinType
        );
        if (avoidRule) {
            avoidIngredients = avoidRule.ingredients;
        }
    }

    return {
        categories: mapping.productCategories,
        keywords: mapping.searchKeywords,
        ingredients: mapping.ingredients,
        avoidIngredients,
    };
}
