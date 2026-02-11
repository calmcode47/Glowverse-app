import { Request, Response } from "express";
import ReferralService from "@services/referral.service";
import { AppError } from "@utils/errors";

/**
 * Referral Controller
 * Handles HTTP requests for referral operations
 */
const ReferralController = {
    /**
     * GET /api/v1/referrals/code
     * Get user's referral code
     */
    async getReferralCode(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const code = await ReferralService.getUserReferralCode(req.user.userId);

        return res.status(200).json({
            success: true,
            code
        });
    },

    /**
     * GET /api/v1/referrals/stats
     * Get referral statistics
     */
    async getReferralStats(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const stats = await ReferralService.getReferralStats(req.user.userId);

        return res.status(200).json({
            success: true,
            stats
        });
    },

    /**
     * GET /api/v1/referrals
     * Get user's referral list
     */
    async getReferrals(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { status, page, limit } = req.query;

        const result = await ReferralService.getUserReferrals(req.user.userId, {
            status: status as any,
            page: page ? parseInt(page as string, 10) : undefined,
            limit: limit ? parseInt(limit as string, 10) : undefined
        });

        return res.status(200).json({
            success: true,
            referrals: result.referrals,
            total: result.total,
            pagination: result.pagination
        });
    },

    /**
     * POST /api/v1/referrals/apply
     * Apply referral code
     */
    async applyReferralCode(req: Request, res: Response) {
        const { code, email } = req.body;

        const referral = await ReferralService.applyReferralCode(email, code);

        return res.status(200).json({
            success: true,
            message: "Referral code applied successfully",
            referral
        });
    }
};

export default ReferralController;
