/**
 * Notification Preferences Service
 * 
 * Handles CRUD operations for user notification preferences.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UpdatePreferencesDto {
    // Channel preferences
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    smsEnabled?: boolean;

    // Category preferences
    ordersEnabled?: boolean;
    promotionsEnabled?: boolean;
    fitnessEnabled?: boolean;
    accountEnabled?: boolean;
    socialEnabled?: boolean;

    // Frequency settings
    promotionFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
    digestEnabled?: boolean;
    digestTime?: string; // HH:MM format

    // Quiet hours
    quietHoursEnabled?: boolean;
    quietHoursStart?: string; // HH:MM format
    quietHoursEnd?: string; // HH:MM format
}

export class NotificationPreferencesService {
    /**
     * Get user's notification preferences
     */
    async getPreferences(userId: string) {
        let preferences = await prisma.notificationPreferences.findUnique({
            where: { userId },
        });

        // Create default preferences if not exist
        if (!preferences) {
            preferences = await this.createDefaultPreferences(userId);
        }

        return preferences;
    }

    /**
     * Update notification preferences
     */
    async updatePreferences(
        userId: string,
        updates: UpdatePreferencesDto
    ) {
        // Validate time formats
        this.validateTimeFormat(updates.digestTime);
        this.validateTimeFormat(updates.quietHoursStart);
        this.validateTimeFormat(updates.quietHoursEnd);

        // Get existing preferences
        let preferences = await prisma.notificationPreferences.findUnique({
            where: { userId },
        });

        if (!preferences) {
            // Create with updates
            preferences = await prisma.notificationPreferences.create({
                data: {
                    userId,
                    ...updates,
                },
            });
        } else {
            // Update existing
            preferences = await prisma.notificationPreferences.update({
                where: { userId },
                data: updates,
            });
        }

        return preferences;
    }

    /**
     * Reset preferences to defaults
     */
    async resetToDefaults(userId: string) {
        const defaults = {
            emailEnabled: true,
            pushEnabled: true,
            smsEnabled: false,
            ordersEnabled: true,
            promotionsEnabled: true,
            fitnessEnabled: true,
            accountEnabled: true,
            socialEnabled: true,
            promotionFrequency: 'daily' as const,
            digestEnabled: false,
            digestTime: '09:00',
            quietHoursEnabled: false,
            quietHoursStart: '22:00',
            quietHoursEnd: '08:00',
        };

        return await prisma.notificationPreferences.upsert({
            where: { userId },
            update: defaults,
            create: {
                userId,
                ...defaults,
            },
        });
    }

    /**
     * Create default preferences for new user
     */
    async createDefaultPreferences(userId: string) {
        return await prisma.notificationPreferences.create({
            data: {
                userId,
                emailEnabled: true,
                pushEnabled: true,
                smsEnabled: false,
                ordersEnabled: true,
                promotionsEnabled: true,
                fitnessEnabled: true,
                accountEnabled: true,
                socialEnabled: true,
                promotionFrequency: 'daily',
                digestEnabled: false,
                digestTime: '09:00',
                quietHoursEnabled: false,
                quietHoursStart: '22:00',
                quietHoursEnd: '08:00',
            },
        });
    }

    /**
     * Validate time format (HH:MM)
     */
    private validateTimeFormat(time?: string): void {
        if (!time) return;

        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
            throw new Error(`Invalid time format: ${time}. Use HH:MM (24-hour)`);
        }
    }

    /**
     * Create preferences for all existing users (migration)
     */
    async createPreferencesForExistingUsers() {
        const users = await prisma.user.findMany({
            select: { id: true },
        });

        const results = [];

        for (const user of users) {
            // Check if preferences already exist
            const existing = await prisma.notificationPreferences.findUnique({
                where: { userId: user.id },
            });

            if (!existing) {
                const prefs = await this.createDefaultPreferences(user.id);
                results.push(prefs);
            }
        }

        return results;
    }
}

export const notificationPreferencesService = new NotificationPreferencesService();
