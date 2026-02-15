/**
 * Deep Link Pre-fetch Service
 * 
 * Pre-fetches required data for smooth deep link navigation.
 */

import { prefetchQuery, queryClient } from '../../lib/queryClient';
import { productKeys } from '../../hooks/queries/useProducts';
import * as ProductsAPI from '../api/products.api';
import type { DeepLinkType } from './types';

export class PrefetchService {
    /**
     * Pre-fetch data based on deep link type
     */
    async prefetchForRoute(type: DeepLinkType, params: Record<string, any>): Promise<void> {
        switch (type) {
            case 'product':
                await this.prefetchProduct(params.productId);
                break;

            case 'order':
                await this.prefetchOrder(params.orderId);
                break;

            case 'shared_cart':
                await this.prefetchSharedCart(params.cartId);
                break;

            case 'ar_share':
                await this.prefetchARSession(params.sessionId);
                break;

            default:
                // No pre-fetching needed for other routes
                break;
        }
    }

    /**
     * Pre-fetch product details
     */
    private async prefetchProduct(productId: string): Promise<void> {
        try {
            await prefetchQuery(
                productKeys.detail(productId) as any,
                () => ProductsAPI.getProductById(productId),
                { staleTime: 1000 * 60 * 60 }
            );

            console.log(`[Prefetch] Product ${productId} pre-fetched`);
        } catch (error) {
            console.error(`[Prefetch] Failed to prefetch product ${productId}:`, error);
            // Don't throw - allow navigation to proceed
        }
    }

    /**
     * Pre-fetch order details
     */
    private async prefetchOrder(orderId: string): Promise<void> {
        try {
            // Pre-fetch order data using React Query
            await queryClient.prefetchQuery({
                queryKey: ['order', orderId],
                queryFn: async () => {
                    const { client } = await import('../api/client');
                    const response = await client.get(`/api/v1/orders/${orderId}`);
                    return response.data;
                },
                staleTime: 1000 * 60 * 10, // 10 minutes
            });

            console.log(`[Prefetch] Order ${orderId} pre-fetched`);
        } catch (error) {
            console.error(`[Prefetch] Failed to prefetch order ${orderId}:`, error);
        }
    }

    /**
     * Pre-fetch shared cart data
     */
    private async prefetchSharedCart(cartId: string): Promise<void> {
        try {
            await queryClient.prefetchQuery({
                queryKey: ['sharedCart', cartId],
                queryFn: async () => {
                    const { client } = await import('../api/client');
                    const response = await client.get(`/api/v1/cart/shared/${cartId}`);
                    return response.data;
                },
                staleTime: 1000 * 60 * 5, // 5 minutes
            });

            console.log(`[Prefetch] Shared cart ${cartId} pre-fetched`);
        } catch (error) {
            console.error(`[Prefetch] Failed to prefetch shared cart ${cartId}:`, error);
        }
    }

    /**
     * Pre-fetch AR session data
     */
    private async prefetchARSession(sessionId: string): Promise<void> {
        try {
            await queryClient.prefetchQuery({
                queryKey: ['arSession', sessionId],
                queryFn: async () => {
                    const { client } = await import('../api/client');
                    const response = await client.get(`/api/v1/ar-sessions/${sessionId}`);
                    return response.data;
                },
                staleTime: 1000 * 60 * 30, // 30 minutes
            });

            console.log(`[Prefetch] AR session ${sessionId} pre-fetched`);
        } catch (error) {
            console.error(`[Prefetch] Failed to prefetch AR session ${sessionId}:`, error);
        }
    }

    /**
     * Check if data is already cached
     */
    isDataCached(type: DeepLinkType, params: Record<string, any>): boolean {
        switch (type) {
            case 'product':
                return !!queryClient.getQueryData(productKeys.detail(params.productId) as any);

            case 'order':
                return !!queryClient.getQueryData(['order', params.orderId]);

            case 'shared_cart':
                return !!queryClient.getQueryData(['sharedCart', params.cartId]);

            case 'ar_share':
                return !!queryClient.getQueryData(['arSession', params.sessionId]);

            default:
                return false;
        }
    }
}

export const prefetchService = new PrefetchService();
