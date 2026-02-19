/**
 * Notification Preferences Controller
 * 
 * Handles HTTP requests for notification preferences.
 */

import { Request, Response } from 'express';
import {
    notificationPreferencesService,
    UpdatePreferencesDto
} from '../services/notificationPreferences.service';

export class NotificationPreferencesController {
    /**
     * Get current user's notification preferences
     * GET /api/notifications/preferences
     */
    async getPreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const preferences = await notificationPreferencesService.getPreferences(userId);

            res.status(200).json({
                success: true,
                data: preferences,
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Update notification preferences
     * PATCH /api/notifications/preferences
     */
    async updatePreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const updates: UpdatePreferencesDto = req.body;

            // Validate input
            const validationError = this.validateUpdates(updates);
            if (validationError) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid input',
                    details: validationError,
                });
                return;
            }

            // Update preferences
            const preferences = await notificationPreferencesService.updatePreferences(
                userId,
                updates
            );

            // Track analytics
            this.trackPreferenceUpdate(userId, updates);

            res.status(200).json({
                success: true,
                data: preferences,
                message: 'Preferences updated successfully',
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Reset preferences to defaults
     * POST /api/notifications/preferences/reset
     */
    async resetPreferences(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
                return;
            }

            const preferences = await notificationPreferencesService.resetToDefaults(userId);

            res.status(200).json({
                success: true,
                data: preferences,
                message: 'Preferences reset to defaults',
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Validate preference updates
     */
    private validateUpdates(updates: UpdatePreferencesDto): string | null {
        // Validate promotion frequency
        if (updates.promotionFrequency) {
            const validFrequencies = ['daily', 'weekly', 'monthly', 'never'];
            if (!validFrequencies.includes(updates.promotionFrequency)) {
                return `Invalid promotionFrequency. Must be one of: ${validFrequencies.join(', ')}`;
            }
        }

        // Validate boolean fields
        const booleanFields = [
            'emailEnabled',
            'pushEnabled',
            'smsEnabled',
            'ordersEnabled',
            'promotionsEnabled',
            'fitnessEnabled',
            'accountEnabled',
            'socialEnabled',
            'digestEnabled',
            'quietHoursEnabled',
        ];

        for (const field of booleanFields) {
            const value = (updates as any)[field];
            if (value !== undefined && typeof value !== 'boolean') {
                return `${field} must be a boolean`;
            }
        }

        // Validate time formats
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

        if (updates.digestTime && !timeRegex.test(updates.digestTime)) {
            return 'digestTime must be in HH:MM format (24-hour)';
        }

        if (updates.quietHoursStart && !timeRegex.test(updates.quietHoursStart)) {
            return 'quietHoursStart must be in HH:MM format (24-hour)';
        }

        if (updates.quietHoursEnd && !timeRegex.test(updates.quietHoursEnd)) {
            return 'quietHoursEnd must be in HH:MM format (24-hour)';
        }

        return null;
    }

    /**
     * Handle errors
     */
    private handleError(error: any, res: Response): void {
        console.error('[NotificationPreferences] Error:', error);

        if (error.message?.includes('Invalid time format')) {
            res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.message,
            });
        } else if (error.code === 'P2025') {
            // Prisma not found error
            res.status(404).json({
                success: false,
                error: 'Preferences not found',
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Internal server error',
            });
        }
    }

    /**
     * Track preference updates for analytics
     */
    private trackPreferenceUpdate(userId: string, updates: UpdatePreferencesDto): void {
        // Track which preferences were changed
        const changedFields = Object.keys(updates);

        // Log or send to analytics service
        console.log(`[Analytics] User ${userId} updated preferences:`, changedFields.join(', '));

        // TODO: Integrate with analytics service
        // analytics.track('notification_preferences_updated', {
        //   userId,
        //   changedFields,
        //   timestamp: Date.now(),
        // });
    }
}

export const notificationPreferencesController = new NotificationPreferencesController();
