import { Request, Response, NextFunction } from 'express';
import SearchService from '../services/search.service';

export class SearchController {
    /**
     * GET /api/v1/search?q=query&types=products,guides
     */
    static async globalSearch(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string;

            if (!query || query.trim().length < 2) {
                res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters',
                });
                return;
            }

            const types = req.query.types
                ? (req.query.types as string).split(',') as any[]
                : undefined;

            const limit = parseInt(req.query.limit as string) || 20;

            const results = await SearchService.globalSearch(query, {
                types,
                limit,
            });

            res.json({
                success: true,
                data: results,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/search/suggestions?q=query
     */
    static async getSearchSuggestions(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string;

            if (!query || query.trim().length < 2) {
                res.json({
                    success: true,
                    data: { products: [], guides: [], tags: [] },
                });
                return;
            }

            const suggestions = await SearchService.getSearchSuggestions(query);

            res.json({
                success: true,
                data: suggestions,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/search/popular
     */
    static async getPopularSearches(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 10;
            const searches = await SearchService.getPopularSearches(limit);

            res.json({
                success: true,
                data: { searches },
            });
        } catch (error) {
            next(error);
        }
    }
}

export default SearchController;
