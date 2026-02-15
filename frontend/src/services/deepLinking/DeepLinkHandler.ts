/**
 * Enhanced Deep Link Handler Service
 * 
 * Handles deep link parsing, validation, authentication, and navigation.
 */

import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NavigationContainerRef } from '@react-navigation/native';
import React from 'react';
import { analytics } from '../analytics.service';
import { dataValidationService } from './DataValidationService';
import { prefetchService } from './PrefetchService';
import type {
    DeepLinkRoute,
    DeepLinkResult,
    DeepLinkType,
    DeepLinkSource,
    DeepLinkAnalytics,
    ParsedDeepLink,
} from './types';

const REDIRECT_URL_KEY = 'deep_link_redirect_url';

class DeepLinkHandler {
    private navigationRef: React.RefObject<NavigationContainerRef<any>> | null = null;
    private isAuthenticated: boolean = false;
    private userId?: string;

    /**
     * Set navigation reference
     */
    setNavigationRef(ref: React.RefObject<NavigationContainerRef<any>>) {
        this.navigationRef = ref;
    }

    /**
     * Set authentication state
     */
    setAuthState(isAuthenticated: boolean, userId?: string) {
        this.isAuthenticated = isAuthenticated;
        this.userId = userId;
    }

    /**
     * Main handler for deep links
     */
    async handleDeepLink(url: string, source?: DeepLinkSource): Promise<DeepLinkResult> {
        console.log(`[DeepLink] Handling: ${url}`);

        try {
            // Parse URL
            const parsed = this.parseDeepLink(url);

            if (!parsed) {
                return {
                    success: false,
                    action: 'error',
                    error: 'Invalid deep link format',
                };
            }

            // Check authentication requirements
            if (this.requiresAuth(parsed.type)) {
                if (!this.isAuthenticated) {
                    // Store URL for redirect after login
                    await this.storeRedirectUrl(url);

                    // Track analytics
                    await this.trackDeepLinkOpen(url, parsed.type, source, false);

                    return {
                        success: true,
                        action: 'login',
                        screen: 'Login',
                        params: { returnUrl: url },
                    };
                }
            }

            // Validate parameters
            const validationResult = await this.validateParameters(parsed);

            if (!validationResult.valid) {
                await this.trackDeepLinkOpen(url, parsed.type, source, false);

                return {
                    success: false,
                    action: 'error',
                    error: validationResult.error || 'Invalid link parameters',
                };
            }

            // Pre-fetch data
            await prefetchService.prefetchForRoute(parsed.type, parsed.params);

            // Track analytics
            await this.trackDeepLinkOpen(url, parsed.type, source, true);

            // Navigate
            const route = this.getRouteForType(parsed.type, parsed.params);

            return {
                success: true,
                action: 'navigate',
                screen: route.screen,
                params: route.params,
            };
        } catch (error: any) {
            console.error('[DeepLink] Error handling deep link:', error);

            return {
                success: false,
                action: 'error',
                error: error.message || 'Failed to process deep link',
            };
        }
    }

    /**
     * Parse deep link URL
     */
    parseDeepLink(url: string): ParsedDeepLink | null {
        try {
            const { hostname, path, queryParams } = Linking.parse(url);

            if (!path) return null;

            // Remove leading/trailing slashes
            const cleanPath = path.replace(/^\/|\/$/g, '');
            const segments = cleanPath.split('/').filter(Boolean);

            if (segments.length === 0) return null;

            // Determine type and extract params
            const firstSegment = segments[0];

            // Product link: /products/{id}
            if (firstSegment === 'products' && segments.length >= 2) {
                return {
                    type: 'product',
                    path,
                    params: { productId: segments[1] },
                    queryParams: queryParams || {},
                };
            }

            // Referral link: /refer/{code}
            if (firstSegment === 'refer' && segments.length >= 2) {
                return {
                    type: 'referral',
                    path,
                    params: { referralCode: segments[1].toUpperCase() },
                    queryParams: queryParams || {},
                };
            }

            // Order tracking: /orders/{id}/track
            if (firstSegment === 'orders' && segments.length >= 3 && segments[2] === 'track') {
                return {
                    type: 'order',
                    path,
                    params: { orderId: segments[1] },
                    queryParams: queryParams || {},
                };
            }

            // Password reset: /reset-password?token=xxx
            if (firstSegment === 'reset-password') {
                return {
                    type: 'reset_password',
                    path,
                    params: { token: queryParams?.token || '' },
                    queryParams: queryParams || {},
                };
            }

            // AR share: /ar-share/{sessionId}
            if (firstSegment === 'ar-share' && segments.length >= 2) {
                return {
                    type: 'ar_share',
                    path,
                    params: { sessionId: segments[1] },
                    queryParams: queryParams || {},
                };
            }

            // Shared cart: /cart/shared/{cartId}
            if (firstSegment === 'cart' && segments[1] === 'shared' && segments.length >= 3) {
                return {
                    type: 'shared_cart',
                    path,
                    params: { cartId: segments[2] },
                    queryParams: queryParams || {},
                };
            }

            // Promotions: /promotions/{code}
            if (firstSegment === 'promotions' && segments.length >= 2) {
                return {
                    type: 'promotion',
                    path,
                    params: { code: segments[1] },
                    queryParams: queryParams || {},
                };
            }

            // Notifications: /notifications/{id}
            if (firstSegment === 'notifications' && segments.length >= 2) {
                return {
                    type: 'notification',
                    path,
                    params: { notificationId: segments[1] },
                    queryParams: queryParams || {},
                };
            }

            return null;
        } catch (error) {
            console.error('[DeepLink] Parse error:', error);
            return null;
        }
    }

    /**
     * Check if route requires authentication
     */
    private requiresAuth(type: DeepLinkType): boolean {
        const protectedRoutes: DeepLinkType[] = ['order', 'shared_cart', 'notification'];
        return protectedRoutes.includes(type);
    }

    /**
     * Validate deep link parameters
     */
    private async validateParameters(parsed: ParsedDeepLink): Promise<{ valid: boolean; error?: string }> {
        switch (parsed.type) {
            case 'product':
                const productValid = await dataValidationService.validateProductId(parsed.params.productId);
                return productValid
                    ? { valid: true }
                    : { valid: false, error: 'Product not found' };

            case 'referral':
                return await dataValidationService.validateReferralCode(parsed.params.referralCode);

            case 'order':
                const orderResult = await dataValidationService.validateOrderId(
                    parsed.params.orderId,
                    this.userId
                );
                return { valid: orderResult.valid, error: orderResult.error };

            case 'reset_password':
                return await dataValidationService.validateResetToken(parsed.params.token);

            case 'ar_share':
                const arValid = await dataValidationService.validateARSessionId(parsed.params.sessionId);
                return arValid ? { valid: true } : { valid: false, error: 'AR session not found' };

            case 'shared_cart':
                const cartValid = await dataValidationService.validateSharedCartId(parsed.params.cartId);
                return cartValid ? { valid: true } : { valid: false, error: 'Shared cart not found' };

            default:
                // No validation needed for other types
                return { valid: true };
        }
    }

    /**
     * Get navigation route for deep link type
     */
    private getRouteForType(type: DeepLinkType, params: Record<string, any>): DeepLinkRoute {
        const routes: Record<DeepLinkType, DeepLinkRoute> = {
            product: { screen: 'ProductDetail', params: { productId: params.productId } },
            referral: { screen: 'ReferralSignup', params: { referralCode: params.referralCode } },
            order: { screen: 'OrderTracking', params: { orderId: params.orderId } },
            reset_password: { screen: 'ResetPassword', params: { token: params.token } },
            ar_share: { screen: 'ARShare', params: { sessionId: params.sessionId } },
            shared_cart: { screen: 'SharedCart', params: { cartId: params.cartId } },
            promotion: { screen: 'Promotions', params: { code: params.code } },
            notification: { screen: 'Notifications', params: { notificationId: params.notificationId } },
            unknown: { screen: 'Home', params: {} },
        };

        return routes[type] || routes.unknown;
    }

    /**
     * Navigate to deep link destination
     */
    navigate(url: string, source?: DeepLinkSource): boolean {
        if (!this.navigationRef?.current) {
            console.error('[DeepLink] Navigation ref not set');
            return false;
        }

        // Handle asynchronously
        this.handleDeepLink(url, source).then((result) => {
            if (result.success && result.screen && this.navigationRef?.current) {
                (this.navigationRef.current as any).navigate(result.screen, result.params);
            } else if (!result.success) {
                console.error('[DeepLink] Navigation failed:', result.error);
                // Navigate to error screen
                (this.navigationRef as any)?.current?.navigate('InvalidLink', { error: result.error });
            }
        });

        return true;
    }

    /**
     * Store redirect URL for post-login navigation
     */
    async storeRedirectUrl(url: string): Promise<void> {
        try {
            await AsyncStorage.setItem(REDIRECT_URL_KEY, url);
            console.log('[DeepLink] Stored redirect URL:', url);
        } catch (error) {
            console.error('[DeepLink] Failed to store redirect URL:', error);
        }
    }

    /**
     * Get and clear stored redirect URL
     */
    async getAndClearRedirectUrl(): Promise<string | null> {
        try {
            const url = await AsyncStorage.getItem(REDIRECT_URL_KEY);
            if (url) {
                await AsyncStorage.removeItem(REDIRECT_URL_KEY);
                console.log('[DeepLink] Retrieved redirect URL:', url);
            }
            return url;
        } catch (error) {
            console.error('[DeepLink] Failed to get redirect URL:', error);
            return null;
        }
    }

    /**
     * Track deep link open in analytics
     */
    private async trackDeepLinkOpen(
        url: string,
        type: DeepLinkType,
        source?: DeepLinkSource,
        success: boolean = true
    ): Promise<void> {
        try {
            const event: DeepLinkAnalytics = {
                linkUrl: url,
                linkType: type,
                source: source || 'unknown',
                timestamp: Date.now(),
                userId: this.userId,
                conversionComplete: false,
            };

            await analytics.logEvent({
                name: success ? 'deep_link_opened' : 'deep_link_failed',
                properties: event
            });

            console.log('[DeepLink] Analytics tracked:', event);
        } catch (error) {
            console.error('[DeepLink] Failed to track analytics:', error);
        }
    }

    /**
     * Track deep link conversion (user completed intended action)
     */
    async trackDeepLinkConversion(type: DeepLinkType): Promise<void> {
        try {
            await analytics.logEvent({
                name: 'deep_link_converted',
                properties: {
                    linkType: type,
                    timestamp: Date.now(),
                    userId: this.userId,
                }
            });
        } catch (error) {
            console.error('[DeepLink] Failed to track conversion:', error);
        }
    }

    /**
     * Get initial URL (for cold start)
     */
    async getInitialURL(): Promise<string | null> {
        return await Linking.getInitialURL();
    }

    /**
     * Add listener for URL events (for warm start)
     */
    addListener(callback: (url: string) => void): () => void {
        const sub = Linking.addEventListener('url', ({ url }: { url: string }) => callback(url));
        return () => sub.remove();
    }

    /**
     * Create deep link URL
     */
    createDeepLink(path: string, params?: Record<string, string>): string {
        return Linking.createURL(path, { queryParams: params });
    }

    /**
     * Create universal link
     */
    createUniversalLink(path: string, params?: Record<string, string>): string {
        const baseUrl = 'https://glowverse.app';
        const query = params
            ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
            : '';
        return `${baseUrl}/${path}${query}`;
    }
}

export const deepLinkHandler = new DeepLinkHandler();
