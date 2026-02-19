import { Router, Request, Response } from "express";
import { NotificationController } from "@controllers/notification.controller";
import { NotificationPreferencesController } from "@controllers/notificationPreferences.controller";
import { authenticate } from "@middleware/auth";

const preferencesController = new NotificationPreferencesController();

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/mark-all-read', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/read', NotificationController.deleteReadNotifications);
router.delete('/:id', NotificationController.deleteNotification);

// Notification Preferences
router.get('/preferences', (req: Request, res: Response) => preferencesController.getPreferences(req, res));
router.patch('/preferences', (req: Request, res: Response) => preferencesController.updatePreferences(req, res));
router.post('/preferences/reset', (req: Request, res: Response) => preferencesController.resetPreferences(req, res));

export default router;
