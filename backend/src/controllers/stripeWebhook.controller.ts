import { Request, Response } from 'express';
import Stripe from 'stripe';
import { OrderService } from '../services/order.service';
import { NotificationService } from '../services/notification.service';
import { inventoryService, InventoryService } from '../services/inventory.service';
import { webhookIdempotencyService, WebhookIdempotencyService } from '../services/webhookIdempotency.service';
import env from '../config/env';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16' as any
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export class StripeWebhookController {
    constructor(
        protected orderService: typeof OrderService,
        protected notificationService: typeof NotificationService,
        protected inventoryServiceInstance: InventoryService
    ) { }

    /**
     * Handle the event with base logic
     */
    protected async processWebhookEvent(event: Stripe.Event): Promise<void> {
        console.log(`Processing webhook event: ${event.type}`);

        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
                break;

            case 'payment_intent.canceled':
                await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
                break;

            case 'charge.refunded':
                await this.handleRefund(event.data.object as Stripe.Charge);
                break;

            case 'charge.dispute.created':
                await this.handleDispute(event.data.object as Stripe.Dispute);
                break;

            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }

    private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = paymentIntent.metadata.orderId;

        if (!orderId) {
            console.error('No orderId in payment intent metadata');
            return;
        }

        await this.orderService.transaction(async (tx) => {
            // Update order status and payment details
            const order = await this.orderService.updateOrderStatus(
                orderId,
                'PROCESSING' as any, // Map to Prisma OrderStatus
                {
                    paymentIntentId: paymentIntent.id,
                    amountPaid: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    paymentMethod: paymentIntent.payment_method as string,
                    paidAt: new Date()
                },
                tx
            );

            // Inventory is already decreased during createOrder in this app's logic
            // but we ensure it remains accurate or track specific fulfillment here.

            // Send confirmation via NotificationService
            await this.notificationService.sendOrderConfirmation(order);

            console.log(`Order ${orderId} marked as paid successfully`);
        });
    }

    private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = paymentIntent.metadata.orderId;
        if (!orderId) return;

        const order = await this.orderService.updateOrderStatus(orderId, 'CANCELLED' as any, {
            paymentIntentId: paymentIntent.id,
            failureReason: paymentIntent.last_payment_error?.message
        });

        // Notify user
        await this.notificationService.sendPaymentFailedNotification(order);

        console.log(`Payment failed for order ${orderId}`);
    }

    private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const orderId = paymentIntent.metadata.orderId;
        if (!orderId) return;

        await this.orderService.updateOrderStatus(orderId, 'CANCELLED' as any, {
            paymentIntentId: paymentIntent.id,
            canceledAt: new Date()
        });

        console.log(`Payment canceled for order ${orderId}`);
    }

    private async handleRefund(charge: Stripe.Charge): Promise<void> {
        const paymentIntentId = charge.payment_intent as string;
        const order = await this.orderService.findByPaymentIntent(paymentIntentId);

        if (!order) {
            console.error(`No order found for payment intent ${paymentIntentId}`);
            return;
        }

        await this.orderService.transaction(async (tx) => {
            await this.orderService.updateOrderStatus(order.id, 'REFUNDED' as any, {
                refundedAmount: charge.amount_refunded,
                refundedAt: new Date(),
                currency: charge.currency
            }, tx);

            // Restore inventory
            await this.inventoryServiceInstance.increaseStock(order.items, tx);

            // Notify user
            await this.notificationService.sendRefundNotification(order);
        });

        console.log(`Refund processed for order ${order.id}`);
    }

    private async handleDispute(dispute: Stripe.Dispute): Promise<void> {
        const chargeId = dispute.charge as string;
        const order = await this.orderService.findByChargeId(chargeId);

        if (!order) {
            console.error(`No order found for charge ${chargeId}`);
            return;
        }

        await this.orderService.updateOrderStatus(order.id, 'PENDING' as any, { // Or a specific DISPUTED status if added
            disputeId: dispute.id,
            disputeReason: dispute.reason,
            disputeAmount: dispute.amount,
            disputedAt: new Date()
        });

        await this.notificationService.sendAdminAlert({
            type: 'dispute',
            orderId: order.id,
            disputeId: dispute.id,
            amount: dispute.amount,
            reason: dispute.reason
        });

        console.log(`Dispute created for order ${order.id}`);
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        const orderId = session.metadata?.orderId;
        const paymentIntentId = session.payment_intent as string;

        if (!orderId || !paymentIntentId) return;

        // Logic similar to payment success
        console.log(`Checkout session completed for order ${orderId}`);
    }
}

export class IdempotentStripeWebhookController extends StripeWebhookController {
    constructor(
        orderService: typeof OrderService,
        notificationService: typeof NotificationService,
        inventoryServiceInstance: InventoryService,
        private idempotencyService: WebhookIdempotencyService
    ) {
        super(orderService, notificationService, inventoryServiceInstance);
    }

    /**
     * Main webhook handler with idempotency and signature verification
     */
    async handleWebhook(req: Request, res: Response): Promise<void> {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
            // Signature verification requires raw body
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                webhookSecret || ''
            );
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Idempotency check
        if (await this.idempotencyService.isProcessed(event.id)) {
            console.log(`Event ${event.id} already processed, skipping`);
            res.status(200).json({ received: true, skipped: true });
            return;
        }

        // Mark as processing
        await this.idempotencyService.markAsProcessing(event.id, event.type);

        try {
            await this.processWebhookEvent(event);
            await this.idempotencyService.markAsProcessed(event.id);
            res.status(200).json({ received: true });
        } catch (err: any) {
            await this.idempotencyService.markAsFailed(event.id, err.message);
            console.error('Webhook processing error:', err);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
}

export const stripeWebhookController = new IdempotentStripeWebhookController(
    OrderService,
    NotificationService,
    inventoryService,
    webhookIdempotencyService
);
