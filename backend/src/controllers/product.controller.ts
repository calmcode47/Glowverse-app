import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { ProductCategory } from '@prisma/client';

export class ProductController {
    /**
     * GET /api/v1/products
     * Get all products with filters
     */
    static async getAllProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                category: req.query.category as ProductCategory,
                search: req.query.search as string,
                tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                isFeatured: req.query.isFeatured === 'true' ? true : undefined,
                isNewArrival: req.query.isNewArrival === 'true' ? true : undefined,
                isBestseller: req.query.isBestseller === 'true' ? true : undefined,
                inStock: req.query.inStock === 'true' ? true : undefined,
                brand: req.query.brand as string,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
                sortBy: req.query.sortBy as any
            };

            const result = await ProductService.getAllProducts(filters);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/:id
     * Get single product by ID
     */
    static async getProductById(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await ProductService.getProductById(req.params.id);
            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/slug/:slug
     * Get product by slug
     */
    static async getProductBySlug(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await ProductService.getProductBySlug(req.params.slug);
            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/featured
     * Get featured products
     */
    static async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const products = await ProductService.getFeaturedProducts(limit);
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/new-arrivals
     * Get new arrival products
     */
    static async getNewArrivals(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const products = await ProductService.getNewArrivals(limit);
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/bestsellers
     * Get bestseller products
     */
    static async getBestsellers(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const products = await ProductService.getBestsellers(limit);
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/search
     * Search products
     */
    static async searchProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string || '';
            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const products = await ProductService.searchProducts(query, limit);
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/category/:category
     * Get products by category
     */
    static async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const category = req.params.category as ProductCategory;
            // Reuse basic filters handling
            const filters = {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                sortBy: req.query.sortBy as any
            };

            const result = await ProductService.getProductsByCategory(category, filters);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/products/:id/related
     * Get related products
     */
    static async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 6;
            const products = await ProductService.getRelatedProducts(req.params.id, limit);
            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            next(error);
        }
    }
}
