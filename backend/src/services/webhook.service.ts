import Stripe from 'stripe';
import { config } from '../config';
import logger from '../utils/logger';
import prisma from '../config/database';
import { EnhancedNotificationService } from './enhancedNotification.service';

const stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
});

export class WebhookService {
    /**
     * Verify Stripe webhook signature
     */
    static verifyWebhookSignature(
        payload: string | Buffer,
        signature: string
    ): Stripe.Event {
        try {
            return stripe.webhooks.constructEvent(
                payload,
                signature,
                config.stripe.webhookSecret
            );
        } catch (error: any) {
            logger.error('Webhook signature verification failed', { error: error.message });
            throw new Error('Invalid webhook signature');
        }
    }

    /**
     * Handle payment_intent.succeeded event
     */
    static async handlePaymentSucceeded(
        paymentIntent: Stripe.PaymentIntent
    ): Promise<void> {
        try {
            logger.info('Processing payment success', {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
            });

            // Check idempotency - prevent duplicate order creation
            const existingOrder = await prisma.order.findFirst({
                where: { paymentIntentId: paymentIntent.id },
            });

            if (existingOrder) {
                logger.info('Order already exists for payment intent', {
                    orderId: existingOrder.id,
                    paymentIntentId: paymentIntent.id,
                });
                return;
            }

            // Get cart data from payment intent metadata
            const userId = paymentIntent.metadata.userId;
            const cartId = paymentIntent.metadata.cartId;

            if (!userId || !cartId) {
                logger.error('Missing metadata in payment intent', {
                    paymentIntentId: paymentIntent.id,
                    metadata: paymentIntent.metadata,
                });
                throw new Error('Missing required metadata');
            }

            // Fetch cart
            const cart = await prisma.cart.findUnique({
                where: { id: cartId },
                include: {
                    items: {
                        include: { product: true },
                    },
                    user: true,
                },
            });

            if (!cart) {
                throw new Error(`Cart not found: ${cartId}`);
            }

            // Get shipping address from metadata
            const shippingAddress = JSON.parse(
                paymentIntent.metadata.shippingAddress || '{}'
            );

            // Calculate totals
            const subtotal = cart.items.reduce(
                (sum: number, item: any) => sum + Number(item.price) * item.quantity,
                0
            );
            const tax = subtotal * 0.08; // 8% tax
            const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
            const total = subtotal + tax + shipping;

            // Create order
            const order = await prisma.order.create({
                data: {
                    userId,
                    orderNumber: await this.generateOrderNumber(),
                    paymentIntentId: paymentIntent.id,
                    status: 'PROCESSING',
                    subtotal,
                    tax,
                    shippingCost: shipping,
                    total,
                    shippingAddress: JSON.stringify(shippingAddress),
                    paymentMethod: paymentIntent.payment_method_types[0],
                    paymentStatus: 'PAID',
                    items: {
                        create: cart.items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: Number(item.price),
                            subtotal: Number(item.price) * item.quantity,
                            total: Number(item.price) * item.quantity,
                            tax: 0,
                            discount: 0,
                            productName: item.product.name,
                            productImage: item.product.thumbnailUrl || '',
                            productSku: item.product.sku || null,
                        })),
                    },
                },
                include: {
                    items: true,
                    user: true,
                },
            });

            // Clear cart
            await prisma.cartItem.deleteMany({
                where: { cartId },
            });

            // Send notifications
            await EnhancedNotificationService.sendOrderConfirmation(userId, order.id, {
                email: cart.user.email,
                orderNumber: order.orderNumber,
                customerName: cart.user.name || 'Valued Customer',
                items: order.items.map((item: any) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: Number(item.price),
                })),
                subtotal: Number(order.subtotal),
                shipping: Number(order.shippingCost),
                tax: Number(order.tax),
                total: Number(order.total),
                shippingAddress: order.shippingAddress,
            });

            logger.info('✅ Order created from webhook', {
                orderId: order.id,
                orderNumber: order.orderNumber,
                paymentIntentId: paymentIntent.id,
            });
        } catch (error: any) {
            logger.error('Failed to handle payment success', {
                paymentIntentId: paymentIntent.id,
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    /**
     * Handle payment_intent.payment_failed event
     */
    static async handlePaymentFailed(
        paymentIntent: Stripe.PaymentIntent
    ): Promise<void> {
        try {
            logger.warn('Payment failed', {
                paymentIntentId: paymentIntent.id,
                error: paymentIntent.last_payment_error,
            });

            // Notify user if we have userId
            const userId = paymentIntent.metadata.userId;
            if (userId) {
                await prisma.notification.create({
                    data: {
                        userId,
                        type: 'SYSTEM',
                        title: 'Payment Failed',
                        message: 'Your payment could not be processed. Please try again.',
                        data: JSON.stringify({
                            paymentIntentId: paymentIntent.id,
                            error: paymentIntent.last_payment_error?.message,
                        }),
                    },
                });

                logger.info('Payment failure notification sent', { userId });
            }
        } catch (error: any) {
            logger.error('Failed to handle payment failure', {
                paymentIntentId: paymentIntent.id,
                error: error.message,
            });
        }
    }

    /**
     * Handle charge.refunded event
     */
    static async handleRefund(charge: Stripe.Charge): Promise<void> {
        try {
            logger.info('Processing refund', {
                chargeId: charge.id,
                amount: charge.amount_refunded,
            });

            // Find order by payment intent
            const order = await prisma.order.findFirst({
                where: { paymentIntentId: charge.payment_intent as string },
                include: { user: true },
            });

            if (!order) {
                logger.warn('Order not found for refund', {
                    paymentIntent: charge.payment_intent,
                });
                return;
            }

            // Update order status
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    status: 'REFUNDED',
                    paymentStatus: 'REFUNDED',
                },
            });

            // Notify user
            await prisma.notification.create({
                data: {
                    userId: order.userId,
                    type: 'ORDER_PLACED',
                    title: 'Refund Processed',
                    message: `Your refund for order #${order.orderNumber} has been processed.`,
                    data: JSON.stringify({ orderId: order.id }),
                },
            });

            logger.info('✅ Refund processed', {
                orderId: order.id,
                chargeId: charge.id,
            });
        } catch (error: any) {
            logger.error('Failed to handle refund', {
                chargeId: charge.id,
                error: error.message,
            });
        }
    }

    /**
     * Generate unique order number
     */
    private static async generateOrderNumber(): Promise<string> {
        const count = await prisma.order.count();
        const orderNumber = `ORD-${(count + 1).toString().padStart(6, '0')}`;
        return orderNumber;
    }
}
