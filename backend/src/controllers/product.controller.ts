import { Request, Response } from "express";
import ProductService from "@services/product.service";
import { ProductCategory, ProductFilters } from "@types/ecommerce.types";
import { AppError } from "@utils/errors";

/**
 * Product Controller
 * Handles HTTP requests for product catalog operations
 */
const ProductController = {
    /**
     * GET /api/v1/products
     * Get all products with optional filters
     */
    async getAllProducts(req: Request, res: Response) {
        const {
            category,
            search,
            tags,
            minPrice,
            maxPrice,
            page,
            limit,
            sortBy
        } = req.query;

        const filters: ProductFilters = {};

        if (category && typeof category === 'string') {
            filters.category = category as ProductCategory;
        }
        if (search && typeof search === 'string') {
            filters.search = search;
        }
        if (tags && typeof tags === 'string') {
            filters.tags = tags.split(',');
        }
        if (minPrice) {
            filters.minPrice = parseFloat(minPrice as string);
        }
        if (maxPrice) {
            filters.maxPrice = parseFloat(maxPrice as string);
        }
        if (page) {
            filters.page = parseInt(page as string, 10);
        }
        if (limit) {
            filters.limit = parseInt(limit as string, 10);
        }
        if (sortBy && typeof sortBy === 'string') {
            filters.sortBy = sortBy as any;
        }

        const result = await ProductService.getAllProducts(filters);

        return res.status(200).json({
            success: true,
            products: result.items,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/products/featured
     * Get featured products
     */
    async getFeaturedProducts(req: Request, res: Response) {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

        if (limit > 50) {
            throw new AppError("Limit cannot exceed 50", 400);
        }

        const products = await ProductService.getFeaturedProducts(limit);

        return res.status(200).json({
            success: true,
            products
        });
    },

    /**
     * GET /api/v1/products/search
     * Search products by query
     */
    async searchProducts(req: Request, res: Response) {
        const { q, limit } = req.query;

        if (!q || typeof q !== 'string') {
            throw new AppError("Search query is required", 400);
        }

        const searchLimit = limit ? parseInt(limit as string, 10) : 20;

        if (searchLimit > 100) {
            throw new AppError("Limit cannot exceed 100", 400);
        }

        const products = await ProductService.searchProducts(q, searchLimit);

        return res.status(200).json({
            success: true,
            query: q,
            count: products.length,
            products
        });
    },

    /**
     * GET /api/v1/products/category/:category
     * Get products by category
     */
    async getProductsByCategory(req: Request, res: Response) {
        const { category } = req.params;

        if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
            throw new AppError("Invalid category", 400);
        }

        const { page, limit, sortBy } = req.query;

        const filters: Omit<ProductFilters, 'category'> = {};
        if (page) filters.page = parseInt(page as string, 10);
        if (limit) filters.limit = parseInt(limit as string, 10);
        if (sortBy && typeof sortBy === 'string') filters.sortBy = sortBy as any;

        const result = await ProductService.getProductsByCategory(
            category as ProductCategory,
            filters
        );

        return res.status(200).json({
            success: true,
            category,
            products: result.items,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/products/:id
     * Get single product details
     */
    async getProduct(req: Request, res: Response) {
        const { id } = req.params;

        const product = await ProductService.getProductById(id);

        return res.status(200).json({
            success: true,
            product
        });
    },

    /**
     * GET /api/v1/products/:id/related
     * Get related products
     */
    async getRelatedProducts(req: Request, res: Response) {
        const { id } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;

        if (limit > 20) {
            throw new AppError("Limit cannot exceed 20", 400);
        }

        const products = await ProductService.getRelatedProducts(id, limit);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    }
};

export default ProductController;
