import { PrismaClient, FitnessActivity, FitnessGoal, ActivityType, IntensityLevel, GoalType, GoalPeriod } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export class FitnessService {
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
            startTime?: Date;
            endTime?: Date;
            notes?: string;
            mood?: string;
        }
    ): Promise<FitnessActivity> {
        // Validate inputs
        if (activityData.durationMinutes < 1 || activityData.durationMinutes > 1440) {
            throw new AppError('Duration must be between 1 and 1440 minutes', 400);
        }

        // Auto-calculate calories if not provided (basic estimation)
        let calories = activityData.caloriesBurned;
        if (!calories) {
            calories = this.estimateCalories(
                activityData.type,
                activityData.durationMinutes,
                activityData.intensity
            );
        }

        // Create activity
        const activity = await prisma.fitnessActivity.create({
            data: {
                userId,
                type: activityData.type,
                title: activityData.title || this.getDefaultTitle(activityData.type),
                description: activityData.description,
                durationMinutes: activityData.durationMinutes,
                intensity: activityData.intensity,
                caloriesBurned: calories,
                distance: activityData.distance,
                steps: activityData.steps,
                heartRate: activityData.heartRate,
                activityDate: activityData.activityDate || new Date(),
                startTime: activityData.startTime,
                endTime: activityData.endTime,
                notes: activityData.notes,
                mood: activityData.mood,
            },
        });

        // Update related goals
        await this.updateGoalProgress(userId, activity);

        return activity;
    }

    /**
     * Get activity history
     */
    async getActivityHistory(
        userId: string,
        filters?: {
            type?: ActivityType;
            startDate?: Date;
            endDate?: Date;
            page?: number;
            limit?: number;
        }
    ): Promise<{
        activities: FitnessActivity[];
        total: number;
    }> {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (filters?.type) where.type = filters.type;
        if (filters?.startDate || filters?.endDate) {
            where.activityDate = {};
            if (filters.startDate) where.activityDate.gte = filters.startDate;
            if (filters.endDate) where.activityDate.lte = filters.endDate;
        }

        const [activities, total] = await Promise.all([
            prisma.fitnessActivity.findMany({
                where,
                orderBy: { activityDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.fitnessActivity.count({ where }),
        ]);

        return { activities, total };
    }

    /**
     * Get activity by ID
     */
    async getActivityById(
        userId: string,
        activityId: string
    ): Promise<FitnessActivity> {
        const activity = await prisma.fitnessActivity.findFirst({
            where: { id: activityId, userId },
        });

        if (!activity) {
            throw new AppError('Activity not found', 404);
        }

        return activity;
    }

    /**
     * Update activity
     */
    async updateActivity(
        userId: string,
        activityId: string,
        updateData: Partial<FitnessActivity>
    ): Promise<FitnessActivity> {
        const activity = await this.getActivityById(userId, activityId);

        const updated = await prisma.fitnessActivity.update({
            where: { id: activityId },
            data: updateData,
        });

        // Recalculate goals if metrics changed
        if (
            updateData.durationMinutes ||
            updateData.caloriesBurned ||
            updateData.distance
        ) {
            await this.recalculateGoals(userId);
        }

        return updated;
    }

    /**
     * Delete activity
     */
    async deleteActivity(
        userId: string,
        activityId: string
    ): Promise<void> {
        await this.getActivityById(userId, activityId);

        await prisma.fitnessActivity.delete({
            where: { id: activityId },
        });

        // Recalculate goals
        await this.recalculateGoals(userId);
    }

    /**
     * Get fitness statistics
     */
    async getStatistics(
        userId: string,
        period: 'week' | 'month' | 'year' = 'week'
    ): Promise<{
        totalActivities: number;
        totalMinutes: number;
        totalCalories: number;
        totalDistance: number;
        averageIntensity: string;
        activitiesByType: Record<string, number>;
        activitiesByDay: Array<{
            date: string;
            count: number;
            minutes: number;
            calories: number;
        }>;
        currentStreak: number;
    }> {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // default to week
        }

        const activities = await prisma.fitnessActivity.findMany({
            where: {
                userId,
                activityDate: { gte: startDate },
            },
            orderBy: { activityDate: 'desc' },
        });

        // Calculate totals
        const totalActivities = activities.length;
        const totalMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
        const totalCalories = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
        const totalDistance = activities.reduce((sum, a) => sum + Number(a.distance || 0), 0);

        // Average intensity
        const intensityMap: Record<string, number> = { LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 };
        const avgIntensityNum = activities.length > 0
            ? activities.reduce((sum, a) => sum + (intensityMap[a.intensity.toString()] || intensityMap[a.intensity] || 2), 0) / activities.length
            : 0;

        // Reverse map to find key
        const intensityKeys = Object.keys(intensityMap);
        const averageIntensity = intensityKeys.find(
            key => intensityMap[key] === Math.round(avgIntensityNum)
        ) || 'MODERATE';

        // Activities by type
        const activitiesByType: Record<string, number> = {};
        activities.forEach(a => {
            activitiesByType[a.type] = (activitiesByType[a.type] || 0) + 1;
        });

        // Activities by day
        const activitiesByDay = await this.groupByDay(activities);

        // Current streak
        const currentStreak = await this.calculateStreak(userId);

        return {
            totalActivities,
            totalMinutes,
            totalCalories,
            totalDistance,
            averageIntensity,
            activitiesByType,
            activitiesByDay,
            currentStreak,
        };
    }

    /**
     * Set fitness goal
     */
    async setGoal(
        userId: string,
        goalData: {
            type: GoalType;
            title: string;
            description?: string;
            target: number;
            unit: string;
            period: GoalPeriod;
            startDate?: Date;
        }
    ): Promise<FitnessGoal> {
        const startDate = goalData.startDate || new Date();
        const endDate = this.calculateEndDate(startDate, goalData.period);

        // Deactivate existing goals of same type and period
        await prisma.fitnessGoal.updateMany({
            where: {
                userId,
                type: goalData.type,
                period: goalData.period,
                isActive: true,
            },
            data: { isActive: false },
        });

        // Create new goal
        const goal = await prisma.fitnessGoal.create({
            data: {
                userId,
                type: goalData.type,
                title: goalData.title,
                description: goalData.description,
                target: goalData.target,
                unit: goalData.unit,
                period: goalData.period,
                startDate,
                endDate,
                current: 0,
            },
        });

        // Calculate initial progress
        await this.updateGoalProgress(userId, null, goal.id);

        return await this.getGoalById(userId, goal.id);
    }

    /**
     * Get active goals
     */
    async getActiveGoals(userId: string): Promise<FitnessGoal[]> {
        const goals = await prisma.fitnessGoal.findMany({
            where: {
                userId,
                isActive: true,
                endDate: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Check completion status and update if needed check handled in updateGoalProgress but good to double check
        return goals;
    }

    /**
     * Get goal by ID
     */
    async getGoalById(
        userId: string,
        goalId: string
    ): Promise<FitnessGoal> {
        const goal = await prisma.fitnessGoal.findFirst({
            where: { id: goalId, userId },
        });

        if (!goal) {
            throw new AppError('Goal not found', 404);
        }

        return goal;
    }

    /**
     * Delete goal
     */
    async deleteGoal(
        userId: string,
        goalId: string
    ): Promise<void> {
        await this.getGoalById(userId, goalId);

        await prisma.fitnessGoal.delete({
            where: { id: goalId },
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
        goals: FitnessGoal[];
        total: number;
    }> {
        const skip = (page - 1) * limit;

        const [goals, total] = await Promise.all([
            prisma.fitnessGoal.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.fitnessGoal.count({ where: { userId } }),
        ]);

        return { goals, total };
    }

    // Helper methods

    /**
     * Update goal progress based on activity
     */
    private async updateGoalProgress(
        userId: string,
        _activity?: FitnessActivity | null,
        goalId?: string
    ): Promise<void> {
        const goals = goalId
            ? [await this.getGoalById(userId, goalId)]
            : await prisma.fitnessGoal.findMany({
                where: { userId, isActive: true },
            });

        for (const goal of goals) {
            // Calculate progress based on goal type
            let progress = 0;

            const activities = await prisma.fitnessActivity.findMany({
                where: {
                    userId,
                    activityDate: {
                        gte: goal.startDate,
                        lte: goal.endDate,
                    },
                },
            });

            switch (goal.type) {
                case GoalType.WEEKLY_MINUTES:
                    progress = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
                    break;
                case GoalType.WEEKLY_SESSIONS:
                    progress = activities.length;
                    break;
                case GoalType.MONTHLY_CALORIES:
                    progress = activities.reduce((sum, a) => sum + (a.caloriesBurned || 0), 0);
                    break;
                case GoalType.DAILY_STEPS:
                    progress = activities.reduce((sum, a) => sum + (a.steps || 0), 0);
                    break;
                case GoalType.WEEKLY_DISTANCE:
                    progress = activities.reduce((sum, a) => sum + Number(a.distance || 0), 0);
                    break;
            }

            // Update goal
            await prisma.fitnessGoal.update({
                where: { id: goal.id },
                data: {
                    current: progress,
                    isCompleted: progress >= Number(goal.target),
                    completedAt: progress >= Number(goal.target) ? new Date() : null,
                },
            });
        }
    }

    /**
     * Recalculate all goals
     */
    private async recalculateGoals(userId: string): Promise<void> {
        const goals = await prisma.fitnessGoal.findMany({
            where: { userId, isActive: true },
        });

        for (const goal of goals) {
            await this.updateGoalProgress(userId, null, goal.id);
        }
    }

    /**
     * Estimate calories burned
     */
    private estimateCalories(
        type: ActivityType,
        minutes: number,
        intensity: IntensityLevel
    ): number {
        // Basic MET (Metabolic Equivalent) based calculation
        // Assumes average 70kg person
        const MET_VALUES: Record<string, Record<string, number>> = {
            CARDIO: { LOW: 3.5, MODERATE: 7, HIGH: 10, VERY_HIGH: 12 },
            STRENGTH: { LOW: 3, MODERATE: 5, HIGH: 6, VERY_HIGH: 8 },
            YOGA: { LOW: 2.5, MODERATE: 4, HIGH: 5, VERY_HIGH: 6 },
            RUNNING: { LOW: 6, MODERATE: 9, HIGH: 11, VERY_HIGH: 14 },
            CYCLING: { LOW: 4, MODERATE: 8, HIGH: 10, VERY_HIGH: 12 },
            SWIMMING: { LOW: 5, MODERATE: 7, HIGH: 10, VERY_HIGH: 12 },
            WALKING: { LOW: 2.5, MODERATE: 3.5, HIGH: 4.5, VERY_HIGH: 5.5 },
            // Add more...
        };

        const met = MET_VALUES[type]?.[intensity] || 5;
        const weight = 70; // kg
        const calories = (met * weight * minutes) / 60;

        return Math.round(calories);
    }

    /**
     * Get default activity title
     */
    private getDefaultTitle(type: ActivityType): string {
        const titles: Record<string, string> = {
            CARDIO: 'Cardio Workout',
            STRENGTH: 'Strength Training',
            YOGA: 'Yoga Session',
            RUNNING: 'Running',
            CYCLING: 'Cycling',
            SWIMMING: 'Swimming',
            WALKING: 'Walk',
            // Add more...
        };
        return titles[type] || 'Fitness Activity';
    }

    /**
     * Calculate goal end date
     */
    private calculateEndDate(startDate: Date, period: GoalPeriod): Date {
        const date = new Date(startDate);
        switch (period) {
            case GoalPeriod.DAILY:
                date.setDate(date.getDate() + 1);
                break;
            case GoalPeriod.WEEKLY:
                date.setDate(date.getDate() + 7);
                break;
            case GoalPeriod.MONTHLY:
                date.setMonth(date.getMonth() + 1);
                break;
            case GoalPeriod.YEARLY:
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        return date;
    }

    /**
     * Group activities by day
     */
    private async groupByDay(
        activities: FitnessActivity[]
    ): Promise<Array<{ date: string; count: number; minutes: number; calories: number }>> {
        const grouped = new Map<string, { count: number; minutes: number; calories: number }>();

        activities.forEach(activity => {
            const dateKey = activity.activityDate.toISOString().split('T')[0];
            const existing = grouped.get(dateKey) || { count: 0, minutes: 0, calories: 0 };

            grouped.set(dateKey, {
                count: existing.count + 1,
                minutes: existing.minutes + activity.durationMinutes,
                calories: existing.calories + (activity.caloriesBurned || 0),
            });
        });

        return Array.from(grouped.entries()).map(([date, data]) => ({
            date,
            ...data,
        }));
    }

    /**
     * Calculate current activity streak
     */
    private async calculateStreak(userId: string): Promise<number> {
        const activities = await prisma.fitnessActivity.findMany({
            where: { userId },
            orderBy: { activityDate: 'desc' },
            select: { activityDate: true },
        });

        if (activities.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // If last activity was today or yesterday, streak is valid
        const lastActivity = new Date(activities[0].activityDate);
        lastActivity.setHours(0, 0, 0, 0);

        const diffDaysFirst = Math.floor(
            (currentDate.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDaysFirst > 1) return 0; // Streak broken

        // Iterate backwards to count consecutive days
        // Simplified logic: assume sorted desc
        // Need unique dates first
        const uniqueDates = new Set<number>();
        activities.forEach(a => {
            const d = new Date(a.activityDate);
            d.setHours(0, 0, 0, 0);
            uniqueDates.add(d.getTime());
        });

        const sortedDates = Array.from(uniqueDates).sort((a, b) => b - a); // descending

        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            // expected date for streak is currentDate - i days (if started today) or - (i) if started yesterday
            // logic: match exact consecutive days

            // Let's just count backwards from most recent
            if (i === 0) {
                streak = 1;
                continue;
            }

            const prevDate = new Date(sortedDates[i - 1]);
            const diff = Math.floor((prevDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}

export default new FitnessService();
