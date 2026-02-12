import { Request, Response } from "express";
import PromotionService from "@services/promotion.service";
import { AppError } from "@utils/errors";

type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role?: string;
    };
};

/**
 * Promotion Controller
 * Handles HTTP requests for promotion operations
 */
const PromotionController = {
    /**
     * GET /api/v1/promotions/active
     * Get all active promotions
     */
    async getActivePromotions(_req: Request, res: Response) {
        const promotions = await PromotionService.getActivePromotions();

        return res.status(200).json({
            success: true,
            promotions
        });
    },

    /**
     * POST /api/v1/promotions/validate
     * Validate promotion code for cart
     */
    async validatePromotion(req: AuthenticatedRequest, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { code, subtotal, items } = req.body;

        const validation = await PromotionService.validatePromotion(
            code,
            req.user.userId,
            { subtotal, items }
        );

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }

        return res.status(200).json({
            success: true,
            valid: true,
            discount: validation.discount,
            promotion: validation.promotion
        });
    },

    /**
     * GET /api/v1/promotions/history
     * Get user's promotion usage history
     */
    async getPromotionHistory(req: AuthenticatedRequest, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { page, limit } = req.query;

        const result = await PromotionService.getUserPromotionHistory(
            req.user.userId,
            page ? parseInt(page as string, 10) : undefined,
            limit ? parseInt(limit as string, 10) : undefined
        );

        return res.status(200).json({
            success: true,
            usages: result.usages,
            total: result.total,
            pagination: result.pagination
        });
    }
};

export default PromotionController;
