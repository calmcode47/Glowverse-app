/**
 * Enhanced Notification Service with Preferences
 * 
 * Respects user preferences before sending notifications.
 * Integrates with existing notification system.
 */

import { notificationPreferencesService } from './notificationPreferences.service';
import prisma from "@config/database";
import { NotificationType } from "@prisma/client";

export interface SendNotificationParams {
    userId: string;
    type: 'order' | 'promotion' | 'fitness' | 'account' | 'social';
    channel: 'email' | 'push' | 'sms' | 'all';
    subject: string;
    message: string;
    data?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high';
}

export class EnhancedNotificationService {
    /**
     * Send notification with preference checking
     */
    async sendNotification(params: SendNotificationParams): Promise<boolean> {
        const {
            userId,
            type,
            channel,
            subject,
            message,
            data,
            priority = 'normal',
        } = params;

        try {
            // Get user preferences
            const preferences = await notificationPreferencesService.getPreferences(userId);

            // Check if this notification type is enabled
            if (!this.isNotificationTypeEnabled(preferences, type)) {
                console.log(`[Notification] Suppressed by user preference: ${type} for user ${userId}`);
                await this.trackSuppression(userId, type, 'type_disabled');
                return false;
            }

            // Check quiet hours (only for low priority)
            if (priority === 'low' && this.isQuietHours(preferences)) {
                console.log(`[Notification] Suppressed by quiet hours for user ${userId}`);
                await this.queueForLater(params);
                await this.trackSuppression(userId, type, 'quiet_hours');
                return false;
            }

            // Check promotion frequency
            if (type === 'promotion' && !(await this.shouldSendPromotion(preferences, userId))) {
                console.log(`[Notification] Suppressed by frequency limit for user ${userId}`);
                await this.trackSuppression(userId, type, 'frequency_limit');
                return false;
            }

            // Determine channels to use
            const channels = channel === 'all' ? ['email', 'push', 'sms'] : [channel];

            // Send via each enabled channel
            let sent = false;
            for (const ch of channels) {
                if (this.isChannelEnabled(preferences, ch as any)) {
                    await this.sendViaChannel(ch as any, userId, subject, message, type, data);
                    sent = true;
                }
            }

            return sent;
        } catch (error) {
            console.error('[Notification] Error sending notification:', error);
            return false;
        }
    }

    /**
     * Check if notification type is enabled
     */
    private isNotificationTypeEnabled(preferences: any, type: string): boolean {
        const typeMap: Record<string, string> = {
            order: 'ordersEnabled',
            promotion: 'promotionsEnabled',
            fitness: 'fitnessEnabled',
            account: 'accountEnabled',
            social: 'socialEnabled',
        };

        const key = typeMap[type];
        return preferences[key] !== false;
    }

    /**
     * Check if channel is enabled
     */
    private isChannelEnabled(preferences: any, channel: 'email' | 'push' | 'sms'): boolean {
        const channelMap = {
            email: 'emailEnabled',
            push: 'pushEnabled',
            sms: 'smsEnabled',
        };

        const key = channelMap[channel];
        return preferences[key] === true;
    }

    /**
     * Check if current time is within quiet hours
     */
    private isQuietHours(preferences: any): boolean {
        if (!preferences.quietHoursEnabled) return false;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const start = preferences.quietHoursStart || '22:00';
        const end = preferences.quietHoursEnd || '08:00';

        // Handle overnight quiet hours (e.g., 22:00 to 08:00)
        if (start > end) {
            return currentTime >= start || currentTime < end;
        } else {
            return currentTime >= start && currentTime < end;
        }
    }

    /**
     * Check if promotion should be sent based on frequency
     */
    private async shouldSendPromotion(preferences: any, userId: string): Promise<boolean> {
        const frequency = preferences.promotionFrequency;

        if (frequency === 'never') return false;

        // Get last promotion sent time
        const lastSent = await this.getLastPromotionTime(userId);
        if (!lastSent) return true;

        const now = Date.now();
        const hoursSinceLastSent = (now - lastSent) / (1000 * 60 * 60);

        switch (frequency) {
            case 'daily':
                return hoursSinceLastSent >= 24;
            case 'weekly':
                return hoursSinceLastSent >= 168; // 7 days
            case 'monthly':
                return hoursSinceLastSent >= 720; // 30 days
            default:
                return true;
        }
    }

    /**
     * Send notification via specific channel
     */
    private async sendViaChannel(
        channel: 'email' | 'push' | 'sms',
        userId: string,
        subject: string,
        message: string,
        type: string,
        data?: Record<string, any>
    ): Promise<void> {
        try {
            console.log(`[Notification] Sending ${channel} to user ${userId}: ${subject}`);

            // TODO: Integrate with actual notification services
            switch (channel) {
                case 'email':
                    // await this.emailService.send(userId, subject, message, data);
                    break;
                case 'push':
                    // await this.pushService.send(userId, subject, message, data);
                    break;
                case 'sms':
                    // await this.smsService.send(userId, message);
                    break;
            }

            await this.trackNotificationSent(userId, channel, subject, type);
        } catch (error) {
            console.error(`[Notification] Failed to send ${channel}:`, error);
            throw error;
        }
    }

    /**
     * Queue notification for later (after quiet hours)
     */
    private async queueForLater(params: SendNotificationParams): Promise<void> {
        // TODO: Implement queue system (e.g., Bull, Redis Queue)
        console.log('[Notification] Queued for later:', params);
    }

    /**
     * Map service notification type to Prisma enum
     */
    private mapToPrismaType(type: string): NotificationType {
        const map: Record<string, NotificationType> = {
            order: NotificationType.ORDER_PLACED,
            promotion: NotificationType.PROMOTION,
            fitness: NotificationType.GENERAL,
            account: NotificationType.ACCOUNT,
            social: NotificationType.GENERAL,
        };
        return map[type] || NotificationType.GENERAL;
    }

    /**
     * Get last time a promotion was sent to user
     */
    private async getLastPromotionTime(userId: string): Promise<number | null> {
        const lastSent = await prisma.notificationHistory.findFirst({
            where: {
                userId,
                type: NotificationType.PROMOTION,
                status: 'sent'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return lastSent ? lastSent.createdAt.getTime() : null;
    }

    /**
     * Track suppressed notification
     */
    private async trackSuppression(
        userId: string,
        type: string,
        reason: string
    ): Promise<void> {
        await prisma.notificationHistory.create({
            data: {
                userId,
                type: this.mapToPrismaType(type),
                channel: 'all',
                status: 'suppressed',
                reason
            }
        });
        console.log(`[Analytics] Notification suppressed: ${userId}, ${type}, ${reason}`);
    }

    /**
     * Track successfully sent notification
     */
    private async trackNotificationSent(
        userId: string,
        channel: string,
        subject: string,
        type: string = 'order'
    ): Promise<void> {
        await prisma.notificationHistory.create({
            data: {
                userId,
                type: this.mapToPrismaType(type),
                channel,
                status: 'sent',
                reason: subject // Using subject as extra info in history
            }
        });
        console.log(`[Analytics] Notification sent: ${userId}, ${channel}, ${subject}`);
    }
}

export const enhancedNotificationService = new EnhancedNotificationService();
