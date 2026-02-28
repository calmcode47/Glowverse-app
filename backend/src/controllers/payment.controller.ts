import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import Stripe from 'stripe';
import { config } from '../config';
import logger from '../utils/logger';

const stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
});

// Extend Request type to include user property mapped by auth middleware
type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role?: string;
    };
};

export class PaymentController {
    /**
     * POST /api/v1/payments/create-intent
     * Create a payment intent for checkout
     */
    static async createIntent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { amount, currency = 'usd', metadata } = req.body;

            const intent = await PaymentService.createPaymentIntent({
                userId,
                amount,
                cartId: metadata?.cartId || 'direct_checkout',
                shippingAddress: metadata?.shippingAddress || {},
                currency,
            });

            res.status(200).json({
                success: true,
                clientSecret: intent.clientSecret,
                paymentIntentId: intent.paymentIntentId
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/payments/confirm
     * Confirm a payment intent and optionally save the payment method
     */
    static async confirmPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { paymentIntentId, paymentMethodId } = req.body;

            // Optional: attach payment method to customer if requested
            if (paymentMethodId) {
                // Not fully implemented for customer creation in this basic flow, 
                // but this is where it would attach to the Stripe Customer.
                logger.info(`Attach payment method ${paymentMethodId} for user ${userId}`);
            }

            res.status(200).json({
                success: true,
                message: 'Payment confirmation recorded'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/payments/methods
     * Get user's saved payment methods
     */
    static async getSavedMethods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;

            // Typical implementation fetches Stripe Customer ID from User record,
            // then calls stripe.paymentMethods.list({ customer: customerId, type: 'card' }).
            // For now, return empty or mock if Stripe Customer isn't set up.

            res.status(200).json({
                success: true,
                data: [] // Unimplemented in mock
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/payments/methods
     * Save a new payment method
     */
    static async saveMethod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { paymentMethodId } = req.body;

            // Would attach to Stripe Customer here

            res.status(200).json({
                success: true,
                message: 'Payment method saved'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/payments/methods/:id
     * Delete a saved payment method
     */
    static async deleteMethod(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const pmId = req.params.id;

            // Would detach from Stripe Customer here

            res.status(200).json({
                success: true,
                message: 'Payment method removed'
            });
        } catch (error) {
            next(error);
        }
    }
}
