import * as Sentry from '@sentry/node';
import logger from './logger';

export const tracking = {
    /**
     * Track order creation event
     */
    trackOrderCreated(orderId: string, userId: string, amount: number) {
        logger.info('Order created', { orderId, userId, amount });

        Sentry.addBreadcrumb({
            category: 'order',
            message: 'Order created',
            level: 'info',
            data: { orderId, userId, amount },
        });
    },

    /**
     * Track payment failure event
     */
    trackPaymentFailed(orderId: string, userId: string, error: string) {
        logger.error('Payment failed', { orderId, userId, error });

        Sentry.captureMessage('Payment Failed', {
            level: 'error',
            tags: { orderId, userId },
            extra: { error },
        });
    },

    /**
     * Track successful AR try-on
     */
    trackARTryonSuccess(userId: string, productId: string) {
        logger.info('AR try-on completed', { userId, productId });

        Sentry.addBreadcrumb({
            category: 'ar',
            message: 'Try-on completed',
            level: 'info',
            data: { userId, productId },
        });
    },

    /**
     * Track failed AR try-on
     */
    trackARTryonFailed(userId: string, productId: string, error: string) {
        logger.error('AR try-on failed', { userId, productId, error });

        Sentry.captureMessage('AR Try-on Failed', {
            level: 'warning',
            tags: { userId, productId },
            extra: { error },
        });
    },

    /**
     * Track user registration
     */
    trackUserRegistered(userId: string, email: string) {
        logger.info('User registered', { userId, email });

        Sentry.addBreadcrumb({
            category: 'auth',
            message: 'User registered',
            level: 'info',
            data: { userId, email },
        });
    },

    /**
     * Track critical business errors
     */
    trackCriticalError(context: string, error: Error, metadata?: Record<string, any>) {
        logger.error(`Critical error in ${context}`, { error: error.message, ...metadata });

        Sentry.captureException(error, {
            level: 'error',
            tags: { context },
            extra: metadata,
        });
    },
};
