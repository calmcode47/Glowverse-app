
import { Router } from 'express';
import { NotificationController } from '@/controllers/notification.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/mark-all-read', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/read', NotificationController.deleteReadNotifications);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
