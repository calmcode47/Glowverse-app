import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SearchService {
    /**
     * Global search across all content
     */
    static async globalSearch(
        query: string,
        filters?: {
            types?: ('products' | 'guides')[];
            limit?: number;
        }
    ): Promise<{
        products: any[];
        guides: any[];
        total: number;
    }> {
        const limit = filters?.limit || 20;
        const searchTypes = filters?.types || ['products', 'guides'];

        const results: any = {
            products: [],
            guides: [],
            total: 0,
        };

        // Search products
        if (searchTypes.includes('products')) {
            const products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { brand: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    images: true,
                    category: true,
                    brand: true,
                    slug: true,
                    rating: true
                }
            });
            results.products = products;
            results.total += products.length;
        }

        // Search guides
        if (searchTypes.includes('guides')) {
            const guides = await prisma.guide.findMany({
                where: {
                    isPublished: true,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { content: { contains: query, mode: 'insensitive' } },
                        { tags: { contains: query, mode: 'insensitive' } }
                    ],
                },
                take: limit,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    thumbnailUrl: true,
                    category: true,
                    difficulty: true,
                    readTime: true,
                    publishedAt: true
                }
            });
            results.guides = guides;
            results.total += guides.length;
        }

        return results;
    }

    /**
     * Search suggestions/autocomplete
     */
    static async getSearchSuggestions(
        query: string,
        limit: number = 10
    ): Promise<{
        products: string[];
        guides: string[];
        tags: string[];
    }> {
        // Get product names matching query
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                name: { contains: query, mode: 'insensitive' },
            },
            select: { name: true },
            take: limit,
        });

        // Get guide titles matching query
        const guides = await prisma.guide.findMany({
            where: {
                isPublished: true,
                title: { contains: query, mode: 'insensitive' },
            },
            select: { title: true },
            take: limit,
        });

        // Get matching tags (simplified implementation)
        // In a real scenario, tags should be indexed or in a separate table
        // Here we'll just check if the query matches some common tags
        const commonTags = [
            'skincare', 'makeup', 'hair', 'acne', 'anti-aging',
            'moisturizer', 'cleanser', 'serum', 'routine', 'tips'
        ];
        const tags = commonTags.filter(t => t.includes(query.toLowerCase()));

        return {
            products: products.map(p => p.name),
            guides: guides.map(g => g.title),
            tags,
        };
    }

    /**
     * Get popular searches
     */
    static async getPopularSearches(limit: number = 10): Promise<string[]> {
        // Return hardcoded popular searches for now
        return [
            'hyaluronic acid serum',
            'vitamin c',
            'morning skincare routine',
            'anti-aging products',
            'sunscreen',
            'retinol guide',
            'eye cream',
            'makeup tutorial',
            'sensitive skin',
            'acne treatment',
        ].slice(0, limit);
    }
}

export default SearchService;
