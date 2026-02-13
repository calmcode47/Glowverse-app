import { PrismaClient, Product, Prisma, ProductCategory } from '@prisma/client';
import { AppError } from '../utils/errors';

import { prisma } from '../config/database';

export interface ProductFilters {
    category?: ProductCategory;
    search?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestseller?: boolean;
    inStock?: boolean;
    brand?: string;
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular' | 'name';
}

export interface PaginatedProducts {
    products: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ProductService {
    /**
     * Get all products with advanced filtering, sorting and pagination
     */
    static async getAllProducts(filters: ProductFilters): Promise<PaginatedProducts> {
        const {
            category,
            search,
            tags,
            minPrice,
            maxPrice,
            isFeatured,
            isNewArrival,
            isBestseller,
            inStock,
            brand,
            page = 1,
            limit = 20,
            sortBy = 'newest'
        } = filters;

        const where: Prisma.ProductWhereInput = {
            isActive: true
        };

        // Apply filters
        if (category) where.category = category;
        if (brand) where.brand = brand;
        if (isFeatured !== undefined) where.isFeatured = isFeatured;
        if (isNewArrival !== undefined) where.isNewArrival = isNewArrival;
        if (isBestseller !== undefined) where.isBestseller = isBestseller;

        if (inStock) {
            where.stock = { gt: 0 };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { tags: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (tags && tags.length > 0) {
            // For JSON string tags, we search if the string contains the tag
            // This is a simplified approach. Ideally use specific JSON operators or full text search
            where.AND = tags.map(tag => ({
                tags: { contains: tag, mode: 'insensitive' }
            }));
        }

        // Determine sorting
        let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {};
        switch (sortBy) {
            case 'price-asc':
                orderBy = { price: 'asc' };
                break;
            case 'price-desc':
                orderBy = { price: 'desc' };
                break;
            case 'rating':
                orderBy = { rating: 'desc' };
                break;
            case 'popular':
                orderBy = [{ purchaseCount: 'desc' }, { viewCount: 'desc' }];
                break;
            case 'name':
                orderBy = { name: 'asc' };
                break;
            case 'newest':
            default:
                orderBy = { publishedAt: 'desc' }; // Fallback to createdAt if publishedAt is null via coalesce in raw query, but here simple
                break;
        }

        // fallback for newest if publishedAt is null is handled by prisma automatically placing nulls last/first depending on DB
        // To be safe, we can default to createdAt
        if (sortBy === 'newest') {
            orderBy = { createdAt: 'desc' };
        }

        // Execute query
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.product.count({ where })
        ]);

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get filtered product by ID
     */
    static async getProductById(id: string): Promise<Product> {
        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product || !product.isActive) {
            throw new AppError('Product not found', 404);
        }

        // Fire and forget view increment
        this.incrementViewCount(id).catch(console.error);

        return product;
    }

    /**
     * Get product by slug
     */
    static async getProductBySlug(slug: string): Promise<Product> {
        const product = await prisma.product.findUnique({
            where: { slug }
        });

        if (!product || !product.isActive) {
            throw new AppError('Product not found', 404);
        }

        // Fire and forget view increment
        this.incrementViewCount(product.id).catch(console.error);

        return product;
    }

    /**
     * Get featured products
     */
    static async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
        return prisma.product.findMany({
            where: {
                isFeatured: true,
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Get new arrivals
     */
    static async getNewArrivals(limit: number = 10): Promise<Product[]> {
        return prisma.product.findMany({
            where: {
                isNewArrival: true,
                isActive: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Get bestsellers
     */
    static async getBestsellers(limit: number = 10): Promise<Product[]> {
        return prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { isBestseller: true },
                    { purchaseCount: { gt: 0 } }
                ]
            },
            orderBy: [
                { isBestseller: 'desc' },
                { purchaseCount: 'desc' }
            ],
            take: limit
        });
    }

    /**
     * Search products
     */
    static async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
        return prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { brand: { contains: query, mode: 'insensitive' } },
                    { tags: { contains: query, mode: 'insensitive' } }
                ]
            },
            // Simple relevance sorting: matches in name could be prioritized by application logic
            // But for simple prisma query, we rely on default or specified generic order
            orderBy: {
                name: 'asc'
            },
            take: limit
        });
    }

    /**
     * Get products by category
     */
    static async getProductsByCategory(
        category: ProductCategory,
        filters: Partial<ProductFilters> = {}
    ): Promise<PaginatedProducts> {

        // Reuse getAllProducts but force the category
        return this.getAllProducts({
            ...filters,
            category
        });
    }

    /**
     * Get related products
     */
    static async getRelatedProducts(productId: string, limit: number = 6): Promise<Product[]> {
        const product = await this.getProductById(productId);

        // Parse tags to find overlaps
        const tags = this.parseJsonField<string[]>(product.tags);

        return prisma.product.findMany({
            where: {
                isActive: true,
                id: { not: productId },
                OR: [
                    { category: product.category },
                    {
                        tags: {
                            // Check if any of the tags string matches. 
                            // Since this is a JSON string field, simple contains on the whole string for each tag is a basic approx
                            contains: tags[0] || '',
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            orderBy: {
                category: 'asc' // Same category first effectively if we sorted results, but DB sort is limited here
            },
            take: limit
        });
        // Note: Better relevance sorting would require raw SQL or in-app sorting, keeping it simple for now.
    }

    /**
     * Check stock availability
     */
    static async checkStock(productId: string, quantity: number): Promise<{
        available: boolean;
        currentStock: number;
        requested: number;
    }> {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, isActive: true }
        });

        if (!product || !product.isActive) {
            throw new AppError('Product not found', 404);
        }

        return {
            available: product.stock >= quantity,
            currentStock: product.stock,
            requested: quantity
        };
    }

    /**
     * Update stock
     */
    static async updateStock(
        productId: string,
        quantity: number,
        operation: 'increment' | 'decrement'
    ): Promise<Product> {

        // If decrementing, check stock first to avoid negative errors or handle gracefully
        if (operation === 'decrement') {
            const { available } = await this.checkStock(productId, quantity);
            if (!available) {
                throw new AppError('Insufficient stock', 400);
            }

            const product = await prisma.product.update({
                where: { id: productId },
                data: { stock: { decrement: quantity } }
            });

            // Check low stock threshold
            if (product.stock <= product.lowStockThreshold) {
                // TODO: Trigger low stock notification
                console.warn(`Product ${product.name} (${product.id}) is low on stock: ${product.stock}`);
            }

            return product;
        } else {
            return prisma.product.update({
                where: { id: productId },
                data: { stock: { increment: quantity } }
            });
        }
    }

    /**
     * Get product stats
     */
    static async getProductStats(productId: string): Promise<{
        viewCount: number;
        purchaseCount: number;
        favoriteCount: number;
        rating: number;
        reviewCount: number;
        stock: number;
        isLowStock: boolean;
    }> {
        const product = await this.getProductById(productId);

        const favoriteCount = await prisma.favorite.count({
            where: { productId }
        });

        return {
            viewCount: product.viewCount,
            purchaseCount: product.purchaseCount,
            favoriteCount,
            rating: Number(product.rating) || 0,
            reviewCount: product.reviewCount,
            stock: product.stock,
            isLowStock: product.stock <= product.lowStockThreshold
        };
    }

    /**
     * Increment view count
     */
    static async incrementViewCount(productId: string): Promise<void> {
        await prisma.product.update({
            where: { id: productId },
            data: { viewCount: { increment: 1 } }
        });
    }

    /**
     * Helper to parse JSON fields safely
     */
    static parseJsonField<T>(field: string | null): T {
        if (!field) return [] as unknown as T;
        try {
            return JSON.parse(field);
        } catch {
            return [] as unknown as T;
        }
    }
}
