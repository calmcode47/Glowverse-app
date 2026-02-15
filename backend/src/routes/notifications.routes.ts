/**
 * Notification Routes
 * 
 * API routes for notification preferences.
 */

import { Router } from 'express';
import { notificationPreferencesController } from '../controllers/notificationPreferences.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/notifications/preferences
 * Get current user's notification preferences
 */
router.get(
    '/preferences',
    (req, res) => notificationPreferencesController.getPreferences(req, res)
);

/**
 * PATCH /api/notifications/preferences
 * Update notification preferences
 * 
 * Body:
 * {
 *   emailEnabled?: boolean,
 *   pushEnabled?: boolean,
 *   promotionsEnabled?: boolean,
 *   quietHoursEnabled?: boolean,
 *   ...
 * }
 */
router.patch(
    '/preferences',
    (req, res) => notificationPreferencesController.updatePreferences(req, res)
);

/**
 * POST /api/notifications/preferences/reset
 * Reset preferences to defaults
 */
router.post(
    '/preferences/reset',
    (req, res) => notificationPreferencesController.resetPreferences(req, res)
);

export default router;
