import prisma from "@config/database";
import { NotFoundError, AppError } from "@utils/errors";

/**
 * Activity Type Enum
 */
export enum ActivityType {
    CARDIO = 'CARDIO',
    STRENGTH = 'STRENGTH',
    YOGA = 'YOGA',
    STRETCHING = 'STRETCHING',
    SPORTS = 'SPORTS',
    WALKING = 'WALKING',
    RUNNING = 'RUNNING',
    CYCLING = 'CYCLING',
    SWIMMING = 'SWIMMING',
    OTHER = 'OTHER'
}

/**
 * Intensity Level Enum
 */
export enum IntensityLevel {
    LOW = 'LOW',
    MODERATE = 'MODERATE',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH'
}

/**
 * Goal Type Enum
 */
export enum GoalType {
    WEEKLY_MINUTES = 'WEEKLY_MINUTES',
    WEEKLY_SESSIONS = 'WEEKLY_SESSIONS',
    MONTHLY_CALORIES = 'MONTHLY_CALORIES',
    DAILY_STEPS = 'DAILY_STEPS',
    CUSTOM = 'CUSTOM'
}

/**
 * Goal Period Enum
 */
export enum GoalPeriod {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

/**
 * Fitness Service
 * Handles fitness activity tracking and goal management
 */
class FitnessService {
    /**
     * Log fitness activity
     */
    async logActivity(
        userId: string,
        activityData: {
            type: ActivityType;
            title?: string;
            description?: string;
            durationMinutes: number;
            intensity: IntensityLevel;
            caloriesBurned?: number;
            distance?: number;
            steps?: number;
            heartRate?: number;
            activityDate?: Date;
        }
    ): Promise<any> {
        // Default activity date to now if not provided
        const activityDate = activityData.activityDate || new Date();

        // Create activity
        const activity = await prisma.fitnessActivity.create({
            data: {
                userId,
                type: activityData.type,
                title: activityData.title,
                description: activityData.description,
                durationMinutes: activityData.durationMinutes,
                intensity: activityData.intensity,
                caloriesBurned: activityData.caloriesBurned,
                distance: activityData.distance,
                steps: activityData.steps,
                heartRate: activityData.heartRate,
                activityDate
            }
        });

        // Update related goals progress
        await this.updateGoalProgress(userId, activity);

        return activity;
    }

    /**
     * Get user's activity history
     */
    async getActivityHistory(
        userId: string,
        filters: {
            type?: ActivityType;
            startDate?: Date;
            endDate?: Date;
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{
        activities: any[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const { type, startDate, endDate, page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;

        const where: any = { userId };

        if (type) {
            where.type = type;
        }

        if (startDate || endDate) {
            where.activityDate = {};
            if (startDate) where.activityDate.gte = startDate;
            if (endDate) where.activityDate.lte = endDate;
        }

        const [activities, total] = await Promise.all([
            prisma.fitnessActivity.findMany({
                where,
                orderBy: {
                    activityDate: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.fitnessActivity.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            activities,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }

    /**
     * Get activity by ID
     */
    async getActivityById(userId: string, activityId: string): Promise<any> {
        const activity = await prisma.fitnessActivity.findFirst({
            where: {
                id: activityId,
                userId
            }
        });

        if (!activity) {
            throw new NotFoundError("Activity not found");
        }

        return activity;
    }

    /**
     * Update activity
     */
    async updateActivity(
        userId: string,
        activityId: string,
        updateData: any
    ): Promise<any> {
        // Verify activity belongs to user
        await this.getActivityById(userId, activityId);

        // Update activity
        const updated = await prisma.fitnessActivity.update({
            where: { id: activityId },
            data: updateData
        });

        // Recalculate goals if metrics changed
        if (updateData.durationMinutes || updateData.caloriesBurned || updateData.steps) {
            await this.recalculateGoalProgress(userId);
        }

        return updated;
    }

    /**
     * Delete activity
     */
    async deleteActivity(userId: string, activityId: string): Promise<void> {
        // Verify ownership
        await this.getActivityById(userId, activityId);

        // Delete activity
        await prisma.fitnessActivity.delete({
            where: { id: activityId }
        });

        // Recalculate goal progress
        await this.recalculateGoalProgress(userId);
    }

    /**
     * Get fitness statistics
     */
    async getStatistics(
        userId: string,
        period: 'week' | 'month' | 'year'
    ): Promise<{
        totalActivities: number;
        totalMinutes: number;
        totalCalories: number;
        totalDistance: number;
        averageIntensity: number;
        activitiesByType: Record<string, number>;
        activitiesByWeek: Array<{ week: string; count: number; minutes: number }>;
    }> {
        // Calculate date range
        const now = new Date();
        const startDate = new Date();

        if (period === 'week') {
            startDate.setDate(now.getDate() - 7);
        } else if (period === 'month') {
            startDate.setDate(now.getDate() - 30);
        } else {
            startDate.setDate(now.getDate() - 365);
        }

        // Fetch activities
        const activities = await prisma.fitnessActivity.findMany({
            where: {
                userId,
                activityDate: {
                    gte: startDate,
                    lte: now
                }
            },
            orderBy: {
                activityDate: 'asc'
            }
        });

        // Calculate statistics
        const totalActivities = activities.length;
        const totalMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
        const totalCalories = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
        const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);

        // Calculate average intensity
        const intensityMap: Record<string, number> = {
            LOW: 1,
            MODERATE: 2,
            HIGH: 3,
            VERY_HIGH: 4
        };
        const totalIntensity = activities.reduce((sum, a) => sum + (intensityMap[a.intensity] || 0), 0);
        const averageIntensity = totalActivities > 0 ? totalIntensity / totalActivities : 0;

        // Count by type
        const activitiesByType: Record<string, number> = {};
        activities.forEach(a => {
            activitiesByType[a.type] = (activitiesByType[a.type] || 0) + 1;
        });

        // Group by week
        const activitiesByWeek = this.groupByWeek(activities);

        return {
            totalActivities,
            totalMinutes,
            totalCalories,
            totalDistance,
            averageIntensity,
            activitiesByType,
            activitiesByWeek
        };
    }

    /**
     * Helper: Group activities by week
     */
    private groupByWeek(activities: any[]): Array<{ week: string; count: number; minutes: number }> {
        const weekMap = new Map<string, { count: number; minutes: number }>();

        activities.forEach(activity => {
            const date = new Date(activity.activityDate);
            // Get week start (Monday)
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const weekStart = new Date(date.setDate(diff));
            const weekKey = weekStart.toISOString().split('T')[0];

            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, { count: 0, minutes: 0 });
            }

            const week = weekMap.get(weekKey)!;
            week.count++;
            week.minutes += activity.durationMinutes;
        });

        return Array.from(weekMap.entries()).map(([week, data]) => ({
            week,
            ...data
        }));
    }

    /**
     * Set fitness goal
     */
    async setGoal(
        userId: string,
        goalData: {
            type: GoalType;
            target: number;
            unit: string;
            period: GoalPeriod;
            startDate?: Date;
        }
    ): Promise<any> {
        const startDate = goalData.startDate || new Date();

        // Calculate endDate based on period
        const endDate = new Date(startDate);
        if (goalData.period === GoalPeriod.DAILY) {
            endDate.setDate(endDate.getDate() + 1);
        } else if (goalData.period === GoalPeriod.WEEKLY) {
            endDate.setDate(endDate.getDate() + 7);
        } else {
            endDate.setDate(endDate.getDate() + 30);
        }

        // Deactivate existing goals of same type and period
        await prisma.fitnessGoal.updateMany({
            where: {
                userId,
                type: goalData.type,
                period: goalData.period,
                isActive: true
            },
            data: {
                isActive: false
            }
        });

        // Create new goal
        const goal = await prisma.fitnessGoal.create({
            data: {
                userId,
                type: goalData.type,
                target: goalData.target,
                unit: goalData.unit,
                period: goalData.period,
                startDate,
                endDate,
                current: 0
            }
        });

        // Calculate initial progress
        await this.recalculateGoalProgress(userId);

        return goal;
    }

    /**
     * Get active goals
     */
    async getActiveGoals(userId: string): Promise<any[]> {
        const goals = await prisma.fitnessGoal.findMany({
            where: {
                userId,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return goals;
    }

    /**
     * Update goal progress based on new activity
     */
    async updateGoalProgress(userId: string, activity: any): Promise<void> {
        const activityDate = new Date(activity.activityDate);

        // Find relevant active goals
        const goals = await prisma.fitnessGoal.findMany({
            where: {
                userId,
                isActive: true,
                startDate: { lte: activityDate },
                endDate: { gte: activityDate }
            }
        });

        for (const goal of goals) {
            let increment = 0;

            // Calculate increment based on goal type
            if (goal.type === GoalType.WEEKLY_MINUTES) {
                increment = activity.durationMinutes;
            } else if (goal.type === GoalType.WEEKLY_SESSIONS) {
                increment = 1;
            } else if (goal.type === GoalType.MONTHLY_CALORIES) {
                increment = activity.caloriesBurned || 0;
            } else if (goal.type === GoalType.DAILY_STEPS) {
                increment = activity.steps || 0;
            }

            if (increment > 0) {
                const newCurrent = goal.current + increment;

                // Update goal
                await prisma.fitnessGoal.update({
                    where: { id: goal.id },
                    data: {
                        current: newCurrent,
                        isCompleted: newCurrent >= goal.target,
                        completedAt: newCurrent >= goal.target && !goal.isCompleted ? new Date() : goal.completedAt
                    }
                });
            }
        }
    }

    /**
     * Recalculate all goal progress (used after updates/deletes)
     */
    private async recalculateGoalProgress(userId: string): Promise<void> {
        const goals = await prisma.fitnessGoal.findMany({
            where: {
                userId,
                isActive: true
            }
        });

        for (const goal of goals) {
            // Get activities in goal period
            const activities = await prisma.fitnessActivity.findMany({
                where: {
                    userId,
                    activityDate: {
                        gte: goal.startDate,
                        lte: goal.endDate
                    }
                }
            });

            let current = 0;

            // Calculate based on goal type
            if (goal.type === GoalType.WEEKLY_MINUTES) {
                current = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
            } else if (goal.type === GoalType.WEEKLY_SESSIONS) {
                current = activities.length;
            } else if (goal.type === GoalType.MONTHLY_CALORIES) {
                current = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
            } else if (goal.type === GoalType.DAILY_STEPS) {
                current = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
            }

            // Update goal
            await prisma.fitnessGoal.update({
                where: { id: goal.id },
                data: {
                    current,
                    isCompleted: current >= goal.target,
                    completedAt: current >= goal.target && !goal.isCompleted ? new Date() : goal.completedAt
                }
            });
        }
    }

    /**
     * Delete goal
     */
    async deleteGoal(userId: string, goalId: string): Promise<void> {
        // Verify ownership
        const goal = await prisma.fitnessGoal.findFirst({
            where: {
                id: goalId,
                userId
            }
        });

        if (!goal) {
            throw new NotFoundError("Goal not found");
        }

        // Delete goal
        await prisma.fitnessGoal.delete({
            where: { id: goalId }
        });
    }

    /**
     * Get goal history
     */
    async getGoalHistory(
        userId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        goals: any[];
        total: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const skip = (page - 1) * limit;

        const [goals, total] = await Promise.all([
            prisma.fitnessGoal.findMany({
                where: { userId },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.fitnessGoal.count({ where: { userId } })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            goals,
            total,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    }
}

export default new FitnessService();
