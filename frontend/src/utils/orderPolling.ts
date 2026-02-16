import { Order } from '../types/order';
import apiClient from './api';

export interface WaitForOrderOptions {
    paymentIntentId: string;
    timeout?: number;
    pollInterval?: number;
}

/**
 * Wait for order creation after webhook processing
 * Polls the backend until order is found or timeout is reached
 */
export async function waitForOrder(
    options: WaitForOrderOptions
): Promise<Order | null> {
    const {
        paymentIntentId,
        timeout = 30000, // 30 seconds default
        pollInterval = 2000, // 2 seconds default
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            // Check if order exists with this payment intent
            const response = await apiClient.get('/orders');
            const orders: Order[] = response.data.orders || response.data;

            const order = orders.find((o: Order) => o.paymentIntentId === paymentIntentId);

            if (order) {
                console.log('Order found:', order.id);
                return order;
            }

            // Wait before next poll
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } catch (error) {
            console.error('Error polling for order:', error);
            // Continue polling even on error
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
        }
    }

    console.warn('Timeout waiting for order creation');
    return null; // Timeout
}

/**
 * Get order by payment intent ID
 */
export async function getOrderByPaymentIntent(
    paymentIntentId: string
): Promise<Order | null> {
    try {
        const response = await apiClient.get(`/orders/by-payment-intent/${paymentIntentId}`);
        return response.data.order;
    } catch (error) {
        console.error('Error getting order by payment intent:', error);
        return null;
    }
}
