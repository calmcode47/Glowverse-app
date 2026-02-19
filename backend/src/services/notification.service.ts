
import { PrismaClient, Notification, NotificationType, NotificationPriority, OrderStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { prisma } from '../config/database';

export class NotificationService {
    /**
     * Create notification
     */
    static async createNotification(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        data?: any;
        priority?: NotificationPriority;
    }): Promise<Notification> {
        return await prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data ? JSON.stringify(data.data) : null,
                priority: data.priority || NotificationPriority.NORMAL,
            },
        });
    }

    /**
     * Get user notifications with filters
     */
    static async getUserNotifications(
        userId: string,
        filters?: {
            isRead?: boolean;
            type?: NotificationType;
            priority?: NotificationPriority;
            page?: number;
            limit?: number;
        }
    ): Promise<{
        notifications: Notification[];
        total: number;
        unreadCount: number;
    }> {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (filters?.isRead !== undefined) where.isRead = filters.isRead;
        if (filters?.type) where.type = filters.type;
        if (filters?.priority) where.priority = filters.priority;

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return { notifications, total, unreadCount };
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Mark as read
     */
    static async markAsRead(
        userId: string,
        notificationId: string
    ): Promise<Notification> {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        return await prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    /**
     * Mark all as read
     */
    static async markAllAsRead(userId: string): Promise<{ count: number }> {
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return { count: result.count };
    }

    /**
     * Delete notification
     */
    static async deleteNotification(
        userId: string,
        notificationId: string
    ): Promise<void> {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });
    }

    /**
     * Delete all read notifications
     */
    static async deleteReadNotifications(userId: string): Promise<{ count: number }> {
        const result = await prisma.notification.deleteMany({
            where: { userId, isRead: true },
        });

        return { count: result.count };
    }

    // Helper methods for specific notification types

    /**
     * Order status notification
     */
    static async notifyOrderStatus(
        userId: string,
        orderId: string,
        status: OrderStatus
    ): Promise<Notification> {
        const messages: Record<string, { title: string; message: string; type: NotificationType }> = {
            PENDING: {
                title: 'Order Received',
                message: 'Your order has been received and is pending payment.',
                type: NotificationType.ORDER_PLACED,
            },
            PROCESSING: {
                title: 'Order Processing',
                message: 'Your order is being prepared for shipment.',
                type: NotificationType.ORDER_PROCESSING,
            },
            SHIPPED: {
                title: 'Order Shipped',
                message: 'Your order has been shipped! Track your package.',
                type: NotificationType.ORDER_SHIPPED,
            },
            DELIVERED: {
                title: 'Order Delivered',
                message: 'Your order has been delivered. Enjoy your products!',
                type: NotificationType.ORDER_DELIVERED,
            },
            CANCELLED: {
                title: 'Order Cancelled',
                message: 'Your order has been cancelled.',
                type: NotificationType.ORDER_CANCELLED,
            },
        };

        const notification = messages[status] || messages.PENDING;

        return this.createNotification({
            userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: { orderId, status },
        });
    }

    /**
     * Analysis complete notification
     */
    static async notifyAnalysisComplete(
        userId: string,
        analysisId: string
    ): Promise<Notification> {
        return this.createNotification({
            userId,
            type: NotificationType.ANALYSIS_COMPLETE,
            title: 'Analysis Complete',
            message: 'Your skin analysis results are ready to view!',
            data: { analysisId },
        });
    }

    /**
     * Try-on complete notification
     */
    static async notifyTryOnComplete(
        userId: string,
        tryOnId: string
    ): Promise<Notification> {
        return this.createNotification({
            userId,
            type: NotificationType.TRYON_COMPLETE,
            title: 'Virtual Try-On Ready',
            message: 'Your virtual try-on results are ready!',
            data: { tryOnId },
        });
    }

    /**
     * Promotion notification
     */
    static async notifyPromotion(
        userId: string,
        promotionData: {
            title: string;
            message: string;
            promotionId?: string;
            code?: string;
        }
    ): Promise<Notification> {
        return this.createNotification({
            userId,
            type: NotificationType.PROMOTION,
            title: promotionData.title,
            message: promotionData.message,
            data: {
                promotionId: promotionData.promotionId,
                code: promotionData.code,
            },
            priority: NotificationPriority.HIGH,
        });
    }

    /**
     * Product restock notification
     */
    static async notifyProductRestock(
        userId: string,
        productId: string,
        productName: string
    ): Promise<Notification> {
        return this.createNotification({
            userId,
            type: NotificationType.PRODUCT_RESTOCKED,
            title: 'Product Back in Stock!',
            message: `${productName} is now available again.`,
            data: { productId },
        });
    }

    /**
     * Payment failed notification
     */
    static async sendPaymentFailedNotification(order: any): Promise<Notification> {
        return this.createNotification({
            userId: order.userId,
            type: NotificationType.ORDER_CANCELLED,
            title: 'Payment Failed',
            message: `Payment failed for order #${order.orderNumber}. Please try again.`,
            data: { orderId: order.id },
            priority: NotificationPriority.HIGH,
        });
    }

    /**
     * Refund notification
     */
    static async sendRefundNotification(order: any): Promise<Notification> {
        return this.createNotification({
            userId: order.userId,
            type: NotificationType.ORDER_CANCELLED,
            title: 'Refund Processed',
            message: `A refund has been processed for order #${order.orderNumber}.`,
            data: { orderId: order.id },
        });
    }

    /**
     * Admin alert for disputes
     */
    static async sendAdminAlert(data: { type: string; orderId: string; disputeId: string; amount: number; reason: string }): Promise<void> {
        console.log('[Admin Alert] Dispute Created:', data);
        // In a real app, this might send an email to admins or post to Slack
    }

    /**
     * Order confirmation email/push
     */
    static async sendOrderConfirmation(order: any): Promise<Notification> {
        return this.notifyOrderStatus(order.userId, order.id, OrderStatus.PROCESSING);
    }

    /**
     * Generic notification method for flexible use
     */
    static async sendNotification(data: {
        userId: string;
        type: string; // Map to NotificationType
        channel: string; // handled by preferences
        subject: string;
        message: string;
        data?: any;
    }): Promise<Notification> {
        // Simple mapping for demonstration
        let nt = NotificationType.GENERAL;
        if (data.type === 'order') nt = NotificationType.GENERAL;

        return this.createNotification({
            userId: data.userId,
            type: nt,
            title: data.subject,
            message: data.message,
            data: data.data,
        });
    }
}
