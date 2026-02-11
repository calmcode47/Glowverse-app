import { Request, Response } from "express";
import NotificationService, { NotificationType } from "@services/notification.service";
import { AppError } from "@utils/errors";

/**
 * Notification Controller
 * Handles HTTP requests for notification operations
 */
const NotificationController = {
    /**
     * GET /api/v1/notifications
     * Get user notifications with optional filters
     */
    async getNotifications(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { isRead, type, page, limit } = req.query;

        const filters: any = {};
        if (isRead !== undefined) {
            filters.isRead = isRead === 'true';
        }
        if (type && typeof type === 'string') {
            filters.type = type as NotificationType;
        }
        if (page) {
            filters.page = parseInt(page as string, 10);
        }
        if (limit) {
            filters.limit = parseInt(limit as string, 10);
        }

        const result = await NotificationService.getUserNotifications(
            req.user.userId,
            filters
        );

        return res.status(200).json({
            success: true,
            notifications: result.notifications,
            total: result.total,
            unreadCount: result.unreadCount,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/notifications/unread-count
     * Get unread notification count
     */
    async getUnreadCount(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const count = await NotificationService.getUnreadCount(req.user.userId);

        return res.status(200).json({
            success: true,
            unreadCount: count
        });
    },

    /**
     * PATCH /api/v1/notifications/:id/read
     * Mark notification as read
     */
    async markAsRead(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        const notification = await NotificationService.markAsRead(
            req.user.userId,
            id
        );

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    },

    /**
     * PATCH /api/v1/notifications/mark-all-read
     * Mark all notifications as read
     */
    async markAllAsRead(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const result = await NotificationService.markAllAsRead(req.user.userId);

        return res.status(200).json({
            success: true,
            message: `${result.count} notifications marked as read`,
            count: result.count
        });
    },

    /**
     * DELETE /api/v1/notifications/:id
     * Delete notification
     */
    async deleteNotification(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        await NotificationService.deleteNotification(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    },

    /**
     * DELETE /api/v1/notifications/read
     * Delete all read notifications
     */
    async deleteReadNotifications(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const result = await NotificationService.deleteReadNotifications(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: `${result.count} read notifications deleted`,
            count: result.count
        });
    }
};

export default NotificationController;
