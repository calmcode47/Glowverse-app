import { Router } from 'express';
import { stripeWebhookController } from '../controllers/stripeWebhook.controller';

const router = Router();

/**
 * @route POST /api/v1/webhooks/stripe
 * @desc Handle Stripe webhook events
 * @access Public (Signature verification required)
 */
router.post('/stripe', (req, res) => stripeWebhookController.handleWebhook(req, res));

export default router;
