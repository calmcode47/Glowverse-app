import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushReceipt } from 'expo-server-sdk';
import prisma from '../config/database';
import logger from '../utils/logger';
import { config } from '../config';

export interface PushNotificationData {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    badge?: number;
    sound?: string;
    priority?: 'default' | 'normal' | 'high';
    channelId?: string;
}

export class PushNotificationService {
    private static expo = new Expo({
        accessToken: config.expo.accessToken,
    });

    /**
     * Send push notification to a user
     */
    static async send(notification: PushNotificationData): Promise<boolean> {
        try {
            if (!config.pushNotifications.enabled) {
                logger.info('📱 [MOCK] Push notification would be sent:', {
                    userId: notification.userId,
                    title: notification.title,
                });
                return true;
            }

            // Get user's push tokens
            const tokens = await this.getUserPushTokens(notification.userId);

            if (tokens.length === 0) {
                logger.warn('No push tokens found for user', { userId: notification.userId });
                return false;
            }

            // Filter valid tokens
            const validTokens = tokens.filter((token) =>
                Expo.isExpoPushToken(token)
            );

            if (validTokens.length === 0) {
                logger.warn('No valid Expo push tokens', { userId: notification.userId });
                return false;
            }

            // Prepare messages
            const messages: ExpoPushMessage[] = validTokens.map((token) => ({
                to: token,
                sound: notification.sound || 'default',
                title: notification.title,
                body: notification.body,
                data: notification.data,
                badge: notification.badge,
                priority: notification.priority || 'high',
                channelId: notification.channelId || 'default',
            }));

            // Send notifications in chunks
            const chunks = this.expo.chunkPushNotifications(messages);
            const tickets: ExpoPushTicket[] = [];

            for (const chunk of chunks) {
                try {
                    const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error: any) {
                    logger.error('Error sending push notification chunk', { error: error.message });
                }
            }

            // Process tickets and handle errors
            await this.processTickets(tickets, validTokens);

            logger.info('✅ Push notifications sent', {
                userId: notification.userId,
                tokenCount: validTokens.length,
            });

            return true;
        } catch (error: any) {
            logger.error('❌ Failed to send push notification', {
                userId: notification.userId,
                error: error.message,
            });
            return false;
        }
    }

    /**
     * Send push notifications to multiple users
     */
    static async sendBulk(
        notifications: PushNotificationData[]
    ): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        for (const notification of notifications) {
            const success = await this.send(notification);
            if (success) sent++;
            else failed++;

            // Rate limiting delay
            if (notifications.length > 100) {
                await this.delay(10);
            }
        }

        return { sent, failed };
    }

    /**
     * Register push token for user
     */
    static async registerToken(userId: string, token: string, deviceInfo?: any): Promise<void> {
        try {
            if (!Expo.isExpoPushToken(token)) {
                logger.warn('Invalid Expo push token', { userId, token });
                return;
            }

            // Store token in database
            await prisma.pushToken.upsert({
                where: {
                    userId_token: {
                        userId,
                        token,
                    },
                },
                create: {
                    userId,
                    token,
                    deviceInfo,
                    isActive: true,
                },
                update: {
                    isActive: true,
                    deviceInfo,
                    updatedAt: new Date(),
                },
            });

            logger.info('✅ Push token registered', { userId });
        } catch (error: any) {
            logger.error('Failed to register push token', { error: error.message, userId });
            throw error;
        }
    }

    /**
     * Unregister push token
     */
    static async unregisterToken(userId: string, token: string): Promise<void> {
        try {
            await prisma.pushToken.updateMany({
                where: { userId, token },
                data: { isActive: false },
            });

            logger.info('Push token unregistered', { userId });
        } catch (error: any) {
            logger.error('Failed to unregister push token', { error: error.message, userId });
        }
    }

    /**
     * Get user's active push tokens
     */
    private static async getUserPushTokens(userId: string): Promise<string[]> {
        const tokens = await prisma.pushToken.findMany({
            where: {
                userId,
                isActive: true,
            },
            select: { token: true },
        });

        return tokens.map((t) => t.token);
    }

    /**
     * Process push notification tickets
     */
    private static async processTickets(
        tickets: ExpoPushTicket[],
        tokens: string[]
    ): Promise<void> {
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            const token = tokens[i];

            if (ticket.status === 'error') {
                logger.error('Push notification error', {
                    error: ticket.message,
                    details: ticket.details,
                    token,
                });

                // Handle specific errors
                if (ticket.details?.error === 'DeviceNotRegistered') {
                    // Deactivate invalid token
                    await prisma.pushToken.updateMany({
                        where: { token },
                        data: { isActive: false },
                    });
                }
            }
        }
    }

    /**
     * Process push notification receipts (optional - for delivery confirmation)
     */
    static async processReceipts(receiptIds: string[]): Promise<void> {
        try {
            const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);

            for (const chunk of receiptIdChunks) {
                const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);

                for (const receiptId in receipts) {
                    const receipt: ExpoPushReceipt = receipts[receiptId];

                    if (receipt.status === 'error') {
                        logger.error('Push notification delivery error', {
                            receiptId,
                            error: receipt.message,
                            details: receipt.details,
                        });
                    }
                }
            }
        } catch (error: any) {
            logger.error('Failed to process push notification receipts', { error: error.message });
        }
    }

    /**
     * Delay helper
     */
    private static delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
