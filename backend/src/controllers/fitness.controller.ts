import { Request, Response } from "express";
import FitnessService from "@services/fitness.service";
import { AppError } from "@utils/errors";

/**
 * Fitness Controller
 * Handles HTTP requests for fitness tracking operations
 */
const FitnessController = {
    /**
     * POST /api/v1/fitness/activities
     * Log new activity
     */
    async logActivity(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const activityData = req.body;

        const activity = await FitnessService.logActivity(req.user.userId, activityData);

        return res.status(201).json({
            success: true,
            activity
        });
    },

    /**
     * GET /api/v1/fitness/activities
     * Get activity history
     */
    async getActivities(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { type, startDate, endDate, page, limit } = req.query;

        const filters: any = {};
        if (type) filters.type = type as string;
        if (startDate) filters.startDate = new Date(startDate as string);
        if (endDate) filters.endDate = new Date(endDate as string);
        if (page) filters.page = parseInt(page as string, 10);
        if (limit) filters.limit = parseInt(limit as string, 10);

        const result = await FitnessService.getActivityHistory(req.user.userId, filters);

        return res.status(200).json({
            success: true,
            activities: result.activities,
            total: result.total,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/fitness/activities/:id
     * Get single activity
     */
    async getActivity(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        const activity = await FitnessService.getActivityById(req.user.userId, id);

        return res.status(200).json({
            success: true,
            activity
        });
    },

    /**
     * PATCH /api/v1/fitness/activities/:id
     * Update activity
     */
    async updateActivity(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;
        const updateData = req.body;

        const activity = await FitnessService.updateActivity(req.user.userId, id, updateData);

        return res.status(200).json({
            success: true,
            activity
        });
    },

    /**
     * DELETE /api/v1/fitness/activities/:id
     * Delete activity
     */
    async deleteActivity(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await FitnessService.deleteActivity(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Activity deleted successfully"
        });
    },

    /**
     * GET /api/v1/fitness/stats
     * Get fitness statistics
     */
    async getStatistics(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { period = 'week' } = req.query;

        const stats = await FitnessService.getStatistics(
            req.user.userId,
            period as 'week' | 'month' | 'year'
        );

        return res.status(200).json({
            success: true,
            stats
        });
    },

    /**
     * POST /api/v1/fitness/goals
     * Set new goal
     */
    async setGoal(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const goalData = req.body;

        const goal = await FitnessService.setGoal(req.user.userId, goalData);

        return res.status(201).json({
            success: true,
            goal
        });
    },

    /**
     * GET /api/v1/fitness/goals
     * Get active goals
     */
    async getGoals(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const goals = await FitnessService.getActiveGoals(req.user.userId);

        return res.status(200).json({
            success: true,
            goals
        });
    },

    /**
     * GET /api/v1/fitness/goals/history
     * Get goal history
     */
    async getGoalHistory(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { page, limit } = req.query;

        const result = await FitnessService.getGoalHistory(
            req.user.userId,
            page ? parseInt(page as string, 10) : undefined,
            limit ? parseInt(limit as string, 10) : undefined
        );

        return res.status(200).json({
            success: true,
            goals: result.goals,
            total: result.total,
            pagination: result.pagination
        });
    },

    /**
     * DELETE /api/v1/fitness/goals/:id
     * Delete goal
     */
    async deleteGoal(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await FitnessService.deleteGoal(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Goal deleted successfully"
        });
    }
};

export default FitnessController;
