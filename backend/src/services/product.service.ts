import prisma from "@config/database";
import { NotFoundError, AppError } from "@utils/errors";
import { ProductCategory, ProductFilters, PaginatedResponse, PaginationMetadata } from "@types/ecommerce.types";
import { Product } from "@prisma/client";

/**
 * Product Service
 * Handles all product-related business logic including search, filtering, and catalog management
 */
class ProductService {
    /**
     * Parse JSON fields from product
     */
    private parseProductJson(product: Product) {
        return {
            ...product,
            images: this.safeJsonParse(product.images, []),
            tags: this.safeJsonParse(product.tags, []),
            benefits: this.safeJsonParse(product.benefits, [])
        };
    }

    /**
     * Safely parse JSON string
     */
    private safeJsonParse<T>(jsonString: string, defaultValue: T): T {
        try {
            return JSON.parse(jsonString) as T;
        } catch {
            return defaultValue;
        }
    }

    /**
     * Calculate pagination metadata
     */
    private calculatePagination(page: number, limit: number, total: number): PaginationMetadata {
        const totalPages = Math.ceil(total / limit);
        return {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        };
    }

    /**
     * Get all products with filtering, search, and pagination
     */
    async getAllProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
        const {
            category,
            search,
            tags,
            minPrice,
            maxPrice,
            page = 1,
            limit = 20,
            sortBy = 'newest'
        } = filters;

        // Build where clause
        const where: any = {
            isActive: true
        };

        if (category) {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) where.price.gte = minPrice;
            if (maxPrice !== undefined) where.price.lte = maxPrice;
        }

        // Build orderBy clause
        let orderBy: any = {};
        switch (sortBy) {
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
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
                orderBy = { reviewCount: 'desc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
        }

        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit
            }),
            prisma.product.count({ where })
        ]);

        const parsedProducts = products.map(p => this.parseProductJson(p));

        return {
            items: parsedProducts as any,
            pagination: this.calculatePagination(page, limit, total)
        };
    }

    /**
     * Get a single product by ID
     */
    async getProductById(id: string): Promise<Product> {
        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product || !product.isActive) {
            throw new NotFoundError("Product not found");
        }

        return this.parseProductJson(product) as any;
    }

    /**
     * Get featured products
     */
    async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                isFeatured: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        });

        return products.map(p => this.parseProductJson(p)) as any;
    }

    /**
     * Search products by query string
     */
    async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
        if (!query || query.trim().length === 0) {
            return [];
        }

        const searchTerm = query.trim();

        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                    { brand: { contains: searchTerm, mode: 'insensitive' } },
                    { tags: { contains: searchTerm, mode: 'insensitive' } }
                ]
            },
            take: limit,
            orderBy: [
                { rating: 'desc' },
                { reviewCount: 'desc' }
            ]
        });

        return products.map(p => this.parseProductJson(p)) as any;
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(
        category: ProductCategory,
        filters: Omit<ProductFilters, 'category'> = {}
    ): Promise<PaginatedResponse<Product>> {
        return this.getAllProducts({ ...filters, category });
    }

    /**
     * Check if product has sufficient stock
     */
    async checkStock(productId: string, quantity: number): Promise<{ available: boolean; stock: number }> {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, isActive: true }
        });

        if (!product || !product.isActive) {
            throw new NotFoundError("Product not found");
        }

        return {
            available: product.stock >= quantity,
            stock: product.stock
        };
    }

    /**
     * Get related products (same category or similar tags)
     */
    async getRelatedProducts(productId: string, limit: number = 6): Promise<Product[]> {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { category: true, tags: true }
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const relatedProducts = await prisma.product.findMany({
            where: {
                isActive: true,
                id: { not: productId },
                category: product.category
            },
            orderBy: {
                rating: 'desc'
            },
            take: limit
        });

        return relatedProducts.map(p => this.parseProductJson(p)) as any;
    }
}

export default new ProductService();
