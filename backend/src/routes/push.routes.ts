import { Router } from 'express';
import { authenticate as requireAuth } from '../middleware/auth';
import { PushNotificationService } from '../services/push-notification.service';

const router = Router();

/**
 * Register push token
 * POST /api/v1/push/tokens
 */
router.post('/tokens', requireAuth, async (req, res, next) => {
    try {
        const userId = (req as any).user.id;
        const { token, deviceInfo } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Push token is required',
            });
        }

        await PushNotificationService.registerToken(userId, token, deviceInfo);

        return res.json({
            success: true,
            message: 'Push token registered',
        });
    } catch (error) {
        return next(error);
    }
});

/**
 * Unregister push token
 * DELETE /api/v1/push/tokens
 */
router.delete('/tokens', requireAuth, async (req, res, next) => {
    try {
        const userId = (req as any).user.id;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Push token is required',
            });
        }

        await PushNotificationService.unregisterToken(userId, token);

        return res.json({
            success: true,
            message: 'Push token unregistered',
        });
    } catch (error) {
        return next(error);
    }
});

/**
 * Test push notification (development only)
 * POST /api/v1/push/test
 */
router.post('/test', requireAuth, async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Not available in production' });
        }

        const userId = (req as any).user.id;

        await PushNotificationService.send({
            userId,
            title: 'Test Notification',
            body: 'This is a test push notification from Glowverse',
            data: { test: true },
        });

        return res.json({
            success: true,
            message: 'Test notification sent',
        });
    } catch (error) {
        return next(error);
    }
});

export default router;
