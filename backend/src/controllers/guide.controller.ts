import { Request, Response, NextFunction } from 'express';
import GuideService from '../services/guide.service';
import { GuideCategory } from '@prisma/client';

// Authenticated Request type
type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role?: string;
    };
};

export class GuideController {
    /**
     * Get all guides
     * GET /api/v1/guides
     */
    static async getGuides(req: Request, res: Response, next: NextFunction) {
        try {
            const filters = {
                category: req.query.category as GuideCategory,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20,
                search: req.query.search as string,
            };

            const result = await GuideService.getGuides(filters);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single guide
     * GET /api/v1/guides/:idOrSlug
     */
    static async getGuide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const guide = await GuideService.getGuide(req.params.idOrSlug as string, userId);
            res.status(200).json({
                success: true,
                data: guide
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get featured guides
     * GET /api/v1/guides/featured
     */
    static async getFeaturedGuides(req: Request, res: Response, next: NextFunction) {
        try {
            const guides = await GuideService.getFeaturedGuides();
            res.status(200).json({
                success: true,
                data: guides
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get trending guides
     * GET /api/v1/guides/trending
     */
    static async getTrendingGuides(req: Request, res: Response, next: NextFunction) {
        try {
            const guides = await GuideService.getTrendingGuides();
            res.status(200).json({
                success: true,
                data: guides
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get new guides
     * GET /api/v1/guides/new
     */
    static async getNewGuides(req: Request, res: Response, next: NextFunction) {
        try {
            const guides = await GuideService.getNewGuides();
            res.status(200).json({
                success: true,
                data: guides
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Search guides
     * GET /api/v1/guides/search
     */
    static async searchGuides(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string;
            if (!query) {
                res.status(400).json({ success: false, message: 'Search query required' });
                return;
            }
            const guides = await GuideService.searchGuides(query);
            res.status(200).json({
                success: true,
                data: guides
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get guides by category
     * GET /api/v1/guides/category/:category
     */
    static async getGuidesByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const category = req.params.category as GuideCategory;
            // Validate category enum
            if (!Object.values(GuideCategory).includes(category)) {
                res.status(400).json({ success: false, message: 'Invalid category' });
                return;
            }

            const result = await GuideService.getGuidesByCategory(category);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get related guides
     * GET /api/v1/guides/:id/related
     */
    static async getRelatedGuides(req: Request, res: Response, next: NextFunction) {
        try {
            const guides = await GuideService.getRelatedGuides(req.params.id as string);
            res.status(200).json({
                success: true,
                data: guides
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Like guide
     * POST /api/v1/guides/:id/like
     */
    static async likeGuide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await GuideService.likeGuide(userId, req.params.id as string);
            res.status(200).json({
                success: true,
                message: 'Guide liked'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Unlike guide
     * DELETE /api/v1/guides/:id/like
     */
    static async unlikeGuide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await GuideService.unlikeGuide(userId, req.params.id as string);
            res.status(200).json({
                success: true,
                message: 'Guide unliked'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bookmark guide
     * POST /api/v1/guides/:id/bookmark
     */
    static async bookmarkGuide(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await GuideService.bookmarkGuide(userId, req.params.id as string);
            res.status(200).json({
                success: true,
                message: 'Guide bookmarked'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove bookmark
     * DELETE /api/v1/guides/:id/bookmark
     */
    static async removeBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await GuideService.removeBookmark(userId, req.params.id as string);
            res.status(200).json({
                success: true,
                message: 'Bookmark removed'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user bookmarks
     * GET /api/v1/guides/my/bookmarks
     */
    static async getMyBookmarks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const bookmarks = await GuideService.getUserBookmarks(userId);
            res.status(200).json({
                success: true,
                data: bookmarks
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add comment
     * POST /api/v1/guides/:id/comment
     */
    static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { content, rating } = req.body;
            const comment = await GuideService.commentOnGuide(userId, req.params.id as string, content, rating);
            res.status(201).json({
                success: true,
                message: 'Comment added',
                data: comment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Track share
     * POST /api/v1/guides/:id/share
     */
    static async trackShare(req: Request, res: Response, next: NextFunction) {
        try {
            await GuideService.trackShare(req.params.id as string);
            res.status(200).json({
                success: true,
                message: 'Share tracked'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default GuideController;
