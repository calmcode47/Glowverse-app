import { Router } from "express";
import { query, param } from "express-validator";
import NotificationController from "@controllers/notification.controller";
import { authenticate } from "@middleware/auth";
import { validate } from "@middleware/validation";

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user notifications
 * @access  Private
 * @query   isRead (boolean), type (NotificationType), page, limit
 */
router.get(
    "/",
    validate([
        query("isRead").optional().isBoolean(),
        query("type").optional().isIn([
            "ORDER_PLACED",
            "ORDER_SHIPPED",
            "ORDER_DELIVERED",
            "ANALYSIS_COMPLETE",
            "TRYON_COMPLETE",
            "PROMOTION",
            "SYSTEM",
            "GENERAL"
        ]),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 })
    ]),
    NotificationController.getNotifications
);

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get("/unread-count", NotificationController.getUnreadCount);

/**
 * @route   PATCH /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch("/mark-all-read", NotificationController.markAllAsRead);

/**
 * @route   PATCH /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 * @param   id - Notification UUID
 */
router.patch(
    "/:id/read",
    validate([param("id").isString().isLength({ min: 1 })]),
    NotificationController.markAsRead
);

/**
 * @route   DELETE /api/v1/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete("/read", NotificationController.deleteReadNotifications);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 * @param   id - Notification UUID
 */
router.delete(
    "/:id",
    validate([param("id").isString().isLength({ min: 1 })]),
    NotificationController.deleteNotification
);

export default router;
