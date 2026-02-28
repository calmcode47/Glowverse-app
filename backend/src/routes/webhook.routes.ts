import { Router, Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
import logger from '../utils/logger';

const router = Router();

/**
 * Stripe webhook endpoint
 * IMPORTANT: This must NOT use express.json() middleware
 * We need raw body for signature verification
 */
router.post(
    '/stripe',
    async (req: Request, res: Response) => {
        const signature = req.headers['stripe-signature'] as string;

        if (!signature) {
            logger.error('Missing stripe-signature header');
            return res.status(400).json({ error: 'Missing signature' });
        }

        try {
            // Verify webhook signature
            const event = WebhookService.verifyWebhookSignature(
                req.body, // Raw body
                signature
            );

            logger.info('Webhook received', {
                type: event.type,
                id: event.id,
            });

            // Handle different event types
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await WebhookService.handlePaymentSucceeded(event.data.object as any);
                    break;

                case 'payment_intent.payment_failed':
                    await WebhookService.handlePaymentFailed(event.data.object as any);
                    break;

                case 'charge.refunded':
                    await WebhookService.handleRefund(event.data.object as any);
                    break;

                default:
                    logger.info('Unhandled webhook event type', { type: event.type });
            }

            // Return 200 to acknowledge receipt
            return res.json({ received: true });
        } catch (error: any) {
            logger.error('Webhook processing error', {
                error: error.message,
                signature,
            });
            return res.status(400).json({ error: error.message });
        }
    }
);

export default router;
