import prisma from "@config/database";
import { NotFoundError, AppError } from "@utils/errors";

/**
 * Notification Type Enum
 */
export enum NotificationType {
    ORDER_PLACED = 'ORDER_PLACED',
    ORDER_SHIPPED = 'ORDER_SHIPPED',
    ORDER_DELIVERED = 'ORDER_DELIVERED',
    ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
    TRYON_COMPLETE = 'TRYON_COMPLETE',
    PROMOTION = 'PROMOTION',
    SYSTEM = 'SYSTEM',
    GENERAL = 'GENERAL'
}

/**
 * Order Status (imported from existing types)
 */
export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
}

/**
 * Notification Service
 * Handles notification creation, management, and delivery
 */
class NotificationService {
    /**
     * Create a new notification
     */
    async createNotification(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        data?: any;
    }): Promise<any> {
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data ? JSON.stringify(data.data) : null
            }
        });

        return this.formatNotification(notification);
    }

    /**
     * Get user notifications with pagination and filters
     */
    async getUserNotifications(
        userId: string,
        filters: {
            isRead?: boolean;
            type?: NotificationType;
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{
        notifications: any[];
        total: number;
        unreadCount: number;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }> {
        const { isRead, type, page = 1, limit = 20 } = filters;

        // Build where clause
        const where: any = { userId };
        if (isRead !== undefined) {
            where.isRead = isRead;
        }
        if (type) {
            where.type = type;
        }

        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: { userId, isRead: false }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            notifications: notifications.map(n => this.formatNotification(n)),
            total,
            unreadCount,
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
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(userId: string, notificationId: string): Promise<any> {
        // Verify notification belongs to user
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new NotFoundError("Notification not found");
        }

        if (notification.userId !== userId) {
            throw new AppError("Unauthorized access to notification", 403);
        }

        // Update notification
        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return this.formatNotification(updated);
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<{ count: number }> {
        const result = await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        return { count: result.count };
    }

    /**
     * Delete notification
     */
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        // Verify notification belongs to user
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new NotFoundError("Notification not found");
        }

        if (notification.userId !== userId) {
            throw new AppError("Unauthorized access to notification", 403);
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        });
    }

    /**
     * Delete all read notifications
     */
    async deleteReadNotifications(userId: string): Promise<{ count: number }> {
        const result = await prisma.notification.deleteMany({
            where: {
                userId,
                isRead: true
            }
        });

        return { count: result.count };
    }

    // ============================================
    // HELPER METHODS FOR COMMON NOTIFICATION TYPES
    // ============================================

    /**
     * Send order notification based on status
     */
    async notifyOrderStatus(
        userId: string,
        orderId: string,
        orderNumber: string,
        status: OrderStatus
    ): Promise<any> {
        const notificationMap: Record<OrderStatus, { type: NotificationType; title: string; message: string }> = {
            [OrderStatus.PENDING]: {
                type: NotificationType.ORDER_PLACED,
                title: 'Order Placed',
                message: `Your order #${orderNumber} has been received and is being processed`
            },
            [OrderStatus.PROCESSING]: {
                type: NotificationType.ORDER_PLACED,
                title: 'Order Processing',
                message: `Your order #${orderNumber} is being prepared`
            },
            [OrderStatus.SHIPPED]: {
                type: NotificationType.ORDER_SHIPPED,
                title: 'Order Shipped',
                message: `Your order #${orderNumber} has been shipped and is on its way`
            },
            [OrderStatus.DELIVERED]: {
                type: NotificationType.ORDER_DELIVERED,
                title: 'Order Delivered',
                message: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`
            },
            [OrderStatus.CANCELLED]: {
                type: NotificationType.SYSTEM,
                title: 'Order Cancelled',
                message: `Your order #${orderNumber} has been cancelled`
            },
            [OrderStatus.REFUNDED]: {
                type: NotificationType.SYSTEM,
                title: 'Order Refunded',
                message: `Your order #${orderNumber} has been refunded`
            }
        };

        const config = notificationMap[status];

        return this.createNotification({
            userId,
            type: config.type,
            title: config.title,
            message: config.message,
            data: { orderId, orderNumber, status }
        });
    }

    /**
     * Send analysis complete notification
     */
    async notifyAnalysisComplete(userId: string, analysisId: string): Promise<any> {
        return this.createNotification({
            userId,
            type: NotificationType.ANALYSIS_COMPLETE,
            title: 'Skin Analysis Complete',
            message: 'Your skin analysis results are ready to view. Check out personalized recommendations!',
            data: { analysisId }
        });
    }

    /**
     * Send try-on complete notification
     */
    async notifyTryOnComplete(userId: string, tryOnId: string): Promise<any> {
        return this.createNotification({
            userId,
            type: NotificationType.TRYON_COMPLETE,
            title: 'Virtual Try-On Complete',
            message: 'Your virtual try-on is ready! See how the product looks on you.',
            data: { tryOnId }
        });
    }

    /**
     * Send promotion notification
     */
    async notifyPromotion(
        userId: string,
        promotionData: {
            title: string;
            message: string;
            promotionId?: string;
        }
    ): Promise<any> {
        return this.createNotification({
            userId,
            type: NotificationType.PROMOTION,
            title: promotionData.title,
            message: promotionData.message,
            data: { promotionId: promotionData.promotionId }
        });
    }

    /**
     * Send system notification
     */
    async notifySystem(
        userId: string,
        title: string,
        message: string,
        additionalData?: any
    ): Promise<any> {
        return this.createNotification({
            userId,
            type: NotificationType.SYSTEM,
            title,
            message,
            data: additionalData
        });
    }

    /**
     * Format notification response
     */
    private formatNotification(notification: any) {
        return {
            ...notification,
            data: notification.data ? this.safeJsonParse(notification.data, null) : null
        };
    }

    /**
     * Safely parse JSON string
     */
    private safeJsonParse<T>(jsonString: string, defaultValue: T): T {
        try {
            return JSON.parse(jsonString) as T;
        } catch {
            return defaultValue;
        }
    }
}

export default new NotificationService();
