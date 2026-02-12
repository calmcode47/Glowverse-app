import { Request, Response, NextFunction } from 'express';
import FitnessService from '../services/fitness.service';
import { ActivityType, GoalType, GoalPeriod } from '@prisma/client';

// Authenticated Request type
type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role?: string;
    };
};

export class FitnessController {
    /**
     * Log a new fitness activity
     * POST /api/v1/fitness/activities
     */
    static async logActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const activity = await FitnessService.logActivity(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Activity logged successfully',
                data: activity
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get activity history
     * GET /api/v1/fitness/activities
     */
    static async getActivities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const filters = {
                type: req.query.type as ActivityType,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20
            };

            const result = await FitnessService.getActivityHistory(userId, filters);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get single activity details
     * GET /api/v1/fitness/activities/:id
     */
    static async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const activity = await FitnessService.getActivityById(userId, req.params.id);
            res.status(200).json({
                success: true,
                data: activity
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update activity
     * PATCH /api/v1/fitness/activities/:id
     */
    static async updateActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const activity = await FitnessService.updateActivity(userId, req.params.id, req.body);
            res.status(200).json({
                success: true,
                message: 'Activity updated successfully',
                data: activity
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete activity
     * DELETE /api/v1/fitness/activities/:id
     */
    static async deleteActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await FitnessService.deleteActivity(userId, req.params.id);
            res.status(200).json({
                success: true,
                message: 'Activity deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get fitness statistics
     * GET /api/v1/fitness/stats
     */
    static async getStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const period = (req.query.period as 'week' | 'month' | 'year') || 'week';
            const stats = await FitnessService.getStatistics(userId, period);
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Set a fitness goal
     * POST /api/v1/fitness/goals
     */
    static async setGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const goal = await FitnessService.setGoal(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Goal set successfully',
                data: goal
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get active goals
     * GET /api/v1/fitness/goals
     */
    static async getGoals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const goals = await FitnessService.getActiveGoals(userId);
            res.status(200).json({
                success: true,
                data: goals
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get goal history
     * GET /api/v1/fitness/goals/history
     */
    static async getGoalHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 20;

            const result = await FitnessService.getGoalHistory(userId, page, limit);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete goal
     * DELETE /api/v1/fitness/goals/:id
     */
    static async deleteGoal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await FitnessService.deleteGoal(userId, req.params.id);
            res.status(200).json({
                success: true,
                message: 'Goal deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default FitnessController;
