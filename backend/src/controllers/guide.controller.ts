import { Request, Response } from "express";
import GuideService from "@services/guide.service";
import { AppError } from "@utils/errors";

/**
 * Guide Controller
 * Handles HTTP requests for grooming guides and educational content
 */
const GuideController = {
    /**
     * GET /api/v1/guides
     * Get all guides with filters
     */
    async getGuides(req: Request, res: Response) {
        const { category, tags, difficulty, search, page, limit } = req.query;

        const filters: any = {};
        if (category) filters.category = category as string;
        if (tags) filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
        if (difficulty) filters.difficulty = difficulty as string;
        if (search) filters.search = search as string;
        if (page) filters.page = parseInt(page as string, 10);
        if (limit) filters.limit = parseInt(limit as string, 10);

        const result = await GuideService.getGuides(filters);

        return res.status(200).json({
            success: true,
            guides: result.guides,
            total: result.total,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/guides/trending
     * Get trending guides
     */
    async getTrendingGuides(req: Request, res: Response) {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

        const guides = await GuideService.getTrendingGuides(limit);

        return res.status(200).json({
            success: true,
            guides
        });
    },

    /**
     * GET /api/v1/guides/featured
     * Get featured guides
     */
    async getFeaturedGuides(req: Request, res: Response) {
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

        const guides = await GuideService.getFeaturedGuides(limit);

        return res.status(200).json({
            success: true,
            guides
        });
    },

    /**
     * GET /api/v1/guides/search
     * Search guides
     */
    async searchGuides(req: Request, res: Response) {
        const query = req.query.q as string;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

        if (!query) {
            throw new AppError("Search query is required", 400);
        }

        const guides = await GuideService.searchGuides(query, limit);

        return res.status(200).json({
            success: true,
            guides
        });
    },

    /**
     * GET /api/v1/guides/category/:category
     * Get guides by category
     */
    async getGuidesByCategory(req: Request, res: Response) {
        const { category } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

        const guides = await GuideService.getGuidesByCategory(category as any, limit);

        return res.status(200).json({
            success: true,
            guides
        });
    },

    /**
     * GET /api/v1/guides/:idOrSlug
     * Get single guide
     */
    async getGuide(req: Request, res: Response) {
        const { idOrSlug } = req.params;
        const userId = req.user?.userId;

        const guide = await GuideService.getGuide(idOrSlug, userId);

        return res.status(200).json({
            success: true,
            guide
        });
    },

    /**
     * GET /api/v1/guides/:id/related
     * Get related guides
     */
    async getRelatedGuides(req: Request, res: Response) {
        const { id } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;

        const guides = await GuideService.getRelatedGuides(id, limit);

        return res.status(200).json({
            success: true,
            guides
        });
    },

    /**
     * POST /api/v1/guides/:id/like
     * Like guide
     */
    async likeGuide(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await GuideService.likeGuide(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Guide liked successfully"
        });
    },

    /**
     * DELETE /api/v1/guides/:id/like
     * Unlike guide
     */
    async unlikeGuide(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await GuideService.unlikeGuide(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Guide unliked successfully"
        });
    },

    /**
     * POST /api/v1/guides/:id/bookmark
     * Bookmark guide
     */
    async bookmarkGuide(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await GuideService.bookmarkGuide(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Guide bookmarked successfully"
        });
    },

    /**
     * DELETE /api/v1/guides/:id/bookmark
     * Remove bookmark
     */
    async removeBookmark(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await GuideService.removeBookmark(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Bookmark removed successfully"
        });
    },

    /**
     * GET /api/v1/guides/user/bookmarks
     * Get user's bookmarked guides
     */
    async getUserBookmarks(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { page, limit } = req.query;

        const result = await GuideService.getUserBookmarks(
            req.user.userId,
            page ? parseInt(page as string, 10) : undefined,
            limit ? parseInt(limit as string, 10) : undefined
        );

        return res.status(200).json({
            success: true,
            guides: result.guides,
            total: result.total,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/guides/:id/stats
     * Get guide statistics
     */
    async getGuideStats(req: Request, res: Response) {
        const { id } = req.params;

        const stats = await GuideService.getGuideStatistics(id);

        return res.status(200).json({
            success: true,
            stats
        });
    }
};

export default GuideController;
