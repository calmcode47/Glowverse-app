import Stripe from 'stripe';
import { config } from '../config';
import logger from '../utils/logger';

const stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
});

export interface CreatePaymentIntentParams {
    userId: string;
    amount: number;
    cartId: string;
    shippingAddress: any;
    currency?: string;
}

export class PaymentService {
    /**
     * Create a payment intent with metadata for webhook processing
     */
    static async createPaymentIntent(params: CreatePaymentIntentParams) {
        const { userId, amount, cartId, shippingAddress, currency = 'usd' } = params;

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    userId,
                    cartId,
                    shippingAddress: JSON.stringify(shippingAddress),
                },
            });

            logger.info('Payment intent created', {
                paymentIntentId: paymentIntent.id,
                amount,
                userId,
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        } catch (error: any) {
            logger.error('Failed to create payment intent', {
                error: error.message,
                userId,
                amount,
            });
            throw error;
        }
    }

    /**
     * Retrieve a payment intent
     */
    static async getPaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
        } catch (error: any) {
            logger.error('Failed to retrieve payment intent', {
                error: error.message,
                paymentIntentId,
            });
            throw error;
        }
    }

    /**
     * Cancel a payment intent
     */
    static async cancelPaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

            logger.info('Payment intent cancelled', { paymentIntentId });

            return paymentIntent;
        } catch (error: any) {
            logger.error('Failed to cancel payment intent', {
                error: error.message,
                paymentIntentId,
            });
            throw error;
        }
    }

    /**
     * Create a refund
     */
    static async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount,
                reason: reason as any,
            });

            logger.info('Refund created', {
                refundId: refund.id,
                paymentIntentId,
                amount: refund.amount,
            });

            return refund;
        } catch (error: any) {
            logger.error('Failed to create refund', {
                error: error.message,
                paymentIntentId,
            });
            throw error;
        }
    }
}
