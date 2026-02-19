
import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '@/services/notification.service';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class NotificationController {
    /**
     * GET /api/v1/notifications
     */
    static async getNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const filters = {
                isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
                type: req.query.type as NotificationType,
                priority: req.query.priority as NotificationPriority,
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 20,
            };

            const result = await NotificationService.getUserNotifications(userId, filters);

            return res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * GET /api/v1/notifications/unread-count
     */
    static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const count = await NotificationService.getUnreadCount(userId);

            return res.json({
                success: true,
                data: { count },
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * PATCH /api/v1/notifications/:id/read
     */
    static async markAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            const notification = await NotificationService.markAsRead(userId, id as string);

            return res.json({
                success: true,
                message: 'Notification marked as read',
                data: { notification },
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * PATCH /api/v1/notifications/mark-all-read
     */
    static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const result = await NotificationService.markAllAsRead(userId);

            return res.json({
                success: true,
                message: `Marked ${result.count} notifications as read`,
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * DELETE /api/v1/notifications/:id
     */
    static async deleteNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { id } = req.params;

            await NotificationService.deleteNotification(userId, id as string);

            return res.json({
                success: true,
                message: 'Notification deleted',
            });
        } catch (error) {
            return next(error);
        }
    }

    /**
     * DELETE /api/v1/notifications/read
     */
    static async deleteReadNotifications(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const result = await NotificationService.deleteReadNotifications(userId);

            return res.json({
                success: true,
                message: `Deleted ${result.count} read notifications`,
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    }
}
