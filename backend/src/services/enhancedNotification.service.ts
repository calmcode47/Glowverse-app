/**
 * Enhanced Notification Service with Preferences
 * 
 * Respects user preferences before sending notifications.
 * Integrates with existing notification system.
 */

import { notificationPreferencesService } from './notificationPreferences.service';
import prisma from "@config/database";
import { NotificationType } from "@prisma/client";
import { EmailService } from './email.service';
import { PushNotificationService } from './push-notification.service';
import { NotificationService } from './notification.service';
import { config } from '@config/index';
import logger from '@utils/logger';

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
                logger.info(`[Notification] Suppressed by user preference: ${type} for user ${userId}`);
                await this.trackSuppression(userId, type, 'type_disabled');
                return false;
            }

            // Check quiet hours (only for low priority)
            if (priority === 'low' && this.isQuietHours(preferences)) {
                logger.info(`[Notification] Suppressed by quiet hours for user ${userId}`);
                await this.queueForLater(params);
                await this.trackSuppression(userId, type, 'quiet_hours');
                return false;
            }

            // Check promotion frequency
            if (type === 'promotion' && !(await this.shouldSendPromotion(preferences, userId))) {
                logger.info(`[Notification] Suppressed by frequency limit for user ${userId}`);
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
        } catch (error: any) {
            logger.error('[Notification] Error sending notification:', { error: error.message });
            return false;
        }
    }

    /**
     * Send order confirmation notification
     */
    static async sendOrderConfirmation(
        userId: string,
        orderId: string,
        orderData: any
    ) {
        try {
            // 1. Create in-app notification
            await NotificationService.createNotification({
                userId,
                type: NotificationType.ORDER_PLACED,
                title: 'Order Confirmed',
                message: `Your order #${orderData.orderNumber} has been confirmed!`,
                data: { orderId },
            });

            // 2. Send email notification
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.email) {
                await EmailService.sendOrderConfirmation(user.email, {
                    orderId,
                    orderNumber: orderData.orderNumber,
                    customerName: user.name || 'Valued Customer',
                    orderDate: new Date().toISOString(),
                    items: orderData.items,
                    subtotal: Number(orderData.subtotal),
                    shipping: Number(orderData.shipping),
                    tax: Number(orderData.tax),
                    total: Number(orderData.total),
                    shippingAddress: orderData.shippingAddress,
                });
            }

            // 3. Send push notification
            await PushNotificationService.send({
                userId,
                title: '🎉 Order Confirmed!',
                body: `Your order #${orderData.orderNumber} has been confirmed`,
                data: {
                    type: 'order',
                    orderId,
                    screen: 'OrderDetails',
                },
                badge: 1,
            });

            logger.info(`✅ Order confirmation sent to ${userId}`);
        } catch (error: any) {
            logger.error('Failed to send order confirmation', { error: error.message, userId, orderId });
            // Don't throw - notification failure shouldn't break order creation
        }
    }

    /**
     * Send order shipped notification
     */
    static async sendOrderShipped(
        userId: string,
        orderId: string,
        orderData: any
    ) {
        try {
            // 1. Create in-app notification
            await NotificationService.createNotification({
                userId,
                type: NotificationType.ORDER_SHIPPED,
                title: 'Order Shipped',
                message: `Your order #${orderData.orderNumber} has been shipped!`,
                data: {
                    orderId,
                    trackingNumber: orderData.trackingNumber,
                },
            });

            // 2. Send email notification
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.email) {
                await EmailService.sendOrderShipped(user.email, {
                    orderNumber: orderData.orderNumber,
                    customerName: user.name || 'Valued Customer',
                    trackingNumber: orderData.trackingNumber,
                    carrier: orderData.carrier,
                    estimatedDelivery: orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery).toLocaleDateString() : undefined,
                });
            }

            // 3. Send push notification
            await PushNotificationService.send({
                userId,
                title: '📦 Order Shipped!',
                body: `Track your order #${orderData.orderNumber}`,
                data: {
                    type: 'order',
                    orderId,
                    trackingNumber: orderData.trackingNumber,
                    screen: 'TrackOrder',
                },
            });

            logger.info(`✅ Order shipped notification sent to ${userId}`);
        } catch (error: any) {
            logger.error('Failed to send order shipped notification', { error: error.message });
        }
    }

    /**
     * Send password reset email
     */
    static async sendPasswordReset(email: string, name: string, resetToken: string) {
        try {
            await EmailService.sendPasswordReset(email, {
                name,
                resetToken,
                expiresIn: '1 hour',
            });

            logger.info(`✅ Password reset email sent to ${email}`);
        } catch (error: any) {
            logger.error('Failed to send password reset email', { error: error.message, email });
            throw error; // This one should throw - critical for password reset
        }
    }

    /**
     * Send welcome email
     */
    static async sendWelcome(userId: string, email: string, name: string) {
        try {
            // 1. Create in-app notification
            await NotificationService.createNotification({
                userId,
                type: NotificationType.GENERAL, // Using GENERAL as SYSTEM might not exist in enum
                title: 'Welcome to Glowverse!',
                message: 'Start exploring products and try our AR features.',
            });

            // 2. Send welcome email
            await EmailService.sendWelcome(email, { name });

            logger.info(`✅ Welcome notification sent to ${userId}`);
        } catch (error: any) {
            logger.error('Failed to send welcome notification', { error: error.message });
        }
    }

    /**
     * Send promotion notification
     */
    static async sendPromotion(
        userIds: string[],
        promotionData: {
            title: string;
            description: string;
            ctaText: string;
            ctaUrl: string;
            imageUrl?: string;
            expiresAt?: string;
        }
    ) {
        try {
            // Get user emails
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, email: true },
            });

            // 1. Create in-app notifications
            await Promise.all(
                users.map((user) =>
                    NotificationService.createNotification({
                        userId: user.id,
                        type: NotificationType.PROMOTION,
                        title: promotionData.title,
                        message: promotionData.description,
                        data: { url: promotionData.ctaUrl },
                    })
                )
            );

            // 2. Send bulk emails
            const emails = users.map((u) => u.email);
            // Assuming config.sendgrid.templates.promotion is available
            await EmailService.sendBulk(emails, {
                subject: promotionData.title,
                templateId: config.sendgrid.templates.promotion,
                dynamicData: promotionData,
            });

            logger.info(`✅ Promotion notification sent to ${userIds.length} users`);
        } catch (error: any) {
            logger.error('Failed to send promotion notification', { error: error.message });
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
            const user = await prisma.user.findUnique({ where: { id: userId } });

            if (!user) {
                console.error(`User ${userId} not found for notification`);
                return;
            }

            switch (channel) {
                case 'email':
                    await EmailService.sendCustom(user.email, subject, `<p>${message}</p>`, message);
                    break;
                case 'push':
                    // await this.pushService.send(userId, subject, message, data);
                    break;
                case 'sms':
                    // await this.smsService.send(userId, message);
                    break;
            }

            await this.trackNotificationSent(userId, channel, subject, type);
        } catch (error: any) {
            logger.error(`[Notification] Failed to send ${channel}:`, error);
            throw error;
        }
    }

    /**
     * Queue notification for later (after quiet hours)
     */
    private async queueForLater(params: SendNotificationParams): Promise<void> {
        // TODO: Implement queue system (e.g., Bull, Redis Queue)
        logger.info('[Notification] Queued for later:', params);
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
        logger.info(`[Analytics] Notification suppressed: ${userId}, ${type}, ${reason}`);
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
        logger.info(`[Analytics] Notification sent: ${userId}, ${channel}, ${subject}`);
    }
}

export const enhancedNotificationService = new EnhancedNotificationService();
