/**
 * Deep Link Integration Tests
 * 
 * Tests for deep link parsing, validation, and navigation.
 */

import { deepLinkHandler } from '../DeepLinkHandler';
import { dataValidationService } from '../DataValidationService';
import { prefetchService } from '../PrefetchService';
import * as Linking from 'expo-linking';

// Mock dependencies
jest.mock('expo-linking');
jest.mock('../DataValidationService');
jest.mock('../PrefetchService');
jest.mock('../../api/client');
jest.mock('../../analytics.service');

describe('DeepLinkHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('URL Parsing', () => {
        test('should parse product link correctly', () => {
            const url = 'https://glowverse.app/products/prod_123';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/products/prod_123',
                queryParams: {},
            });

            const result = deepLinkHandler.parseDeepLink(url);

            expect(result).toEqual({
                type: 'product',
                path: '/products/prod_123',
                params: { productId: 'prod_123' },
                queryParams: {},
            });
        });

        test('should parse referral link correctly', () => {
            const url = 'https://glowverse.app/refer/FRIEND2024';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/refer/FRIEND2024',
                queryParams: {},
            });

            const result = deepLinkHandler.parseDeepLink(url);

            expect(result).toEqual({
                type: 'referral',
                path: '/refer/FRIEND2024',
                params: { referralCode: 'FRIEND2024' },
                queryParams: {},
            });
        });

        test('should parse order tracking link correctly', () => {
            const url = 'https://glowverse.app/orders/order_456/track';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/orders/order_456/track',
                queryParams: {},
            });

            const result = deepLinkHandler.parseDeepLink(url);

            expect(result).toEqual({
                type: 'order',
                path: '/orders/order_456/track',
                params: { orderId: 'order_456' },
                queryParams: {},
            });
        });

        test('should parse password reset link correctly', () => {
            const url = 'https://glowverse.app/reset-password?token=reset_789';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/reset-password',
                queryParams: { token: 'reset_789' },
            });

            const result = deepLinkHandler.parseDeepLink(url);

            expect(result).toEqual({
                type: 'reset_password',
                path: '/reset-password',
                params: { token: 'reset_789' },
                queryParams: { token: 'reset_789' },
            });
        });

        test('should return null for invalid URL', () => {
            const url = 'https://glowverse.app/invalid';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/invalid',
                queryParams: {},
            });

            const result = deepLinkHandler.parseDeepLink(url);

            expect(result).toBeNull();
        });
    });

    describe('Authentication Guards', () => {
        test('should redirect to login for protected route when unauthenticated', async () => {
            const url = 'https://glowverse.app/orders/order_456/track';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/orders/order_456/track',
                queryParams: {},
            });

            deepLinkHandler.setAuthState(false);

            const result = await deepLinkHandler.handleDeepLink(url);

            expect(result.action).toBe('login');
            expect(result.screen).toBe('Login');
            expect(result.params).toEqual({ returnUrl: url });
        });

        test('should allow access to public route without auth', async () => {
            const url = 'https://glowverse.app/products/prod_123';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/products/prod_123',
                queryParams: {},
            });

            deepLinkHandler.setAuthState(false);
            (dataValidationService.validateProductId as jest.Mock).mockResolvedValue(true);
            (prefetchService.prefetchForRoute as jest.Mock).mockResolvedValue(undefined);

            const result = await deepLinkHandler.handleDeepLink(url);

            expect(result.action).toBe('navigate');
            expect(result.screen).toBe('ProductDetail');
        });
    });

    describe('Parameter Validation', () => {
        test('should reject invalid product ID', async () => {
            const url = 'https://glowverse.app/products/invalid_123';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/products/invalid_123',
                queryParams: {},
            });

            deepLinkHandler.setAuthState(true);
            (dataValidationService.validateProductId as jest.Mock).mockResolvedValue(false);

            const result = await deepLinkHandler.handleDeepLink(url);

            expect(result.success).toBe(false);
            expect(result.action).toBe('error');
            expect(result.error).toBe('Product not found');
        });

        test('should accept valid referral code', async () => {
            const url = 'https://glowverse.app/refer/VALID2024';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/refer/VALID2024',
                queryParams: {},
            });

            deepLinkHandler.setAuthState(false);
            (dataValidationService.validateReferralCode as jest.Mock).mockResolvedValue({ valid: true });
            (prefetchService.prefetchForRoute as jest.Mock).mockResolvedValue(undefined);

            const result = await deepLinkHandler.handleDeepLink(url);

            expect(result.success).toBe(true);
            expect(result.action).toBe('navigate');
            expect(result.screen).toBe('ReferralSignup');
        });
    });

    describe('Pre-fetching', () => {
        test('should call prefetch service for product link', async () => {
            const url = 'https://glowverse.app/products/prod_123';
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: 'glowverse.app',
                path: '/products/prod_123',
                queryParams: {},
            });

            deepLinkHandler.setAuthState(true);
            (dataValidationService.validateProductId as jest.Mock).mockResolvedValue(true);
            (prefetchService.prefetchForRoute as jest.Mock).mockResolvedValue(undefined);

            await deepLinkHandler.handleDeepLink(url);

            expect(prefetchService.prefetchForRoute).toHaveBeenCalledWith('product', {
                productId: 'prod_123',
            });
        });
    });

    describe('Universal Link Creation', () => {
        test('should create universal link with correct format', () => {
            const link = deepLinkHandler.createUniversalLink('products/123');
            expect(link).toBe('https://glowverse.app/products/123');
        });

        test('should create universal link with query params', () => {
            const link = deepLinkHandler.createUniversalLink('products/123', { ref: 'email' });
            expect(link).toBe('https://glowverse.app/products/123?ref=email');
        });
    });
});
