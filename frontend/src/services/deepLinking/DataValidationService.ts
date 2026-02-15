/**
 * Deep Link Parameter Validation Service
 * 
 * Validates deep link parameters before navigation.
 */

import { client } from '../api/client';

export class DataValidationService {
    /**
     * Validate product ID exists
     */
    async validateProductId(productId: string): Promise<boolean> {
        try {
            const response = await client.get(`/api/v1/products/${productId}`);
            return response.status === 200 && !!response.data;
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return false;
            }
            // Network error - assume valid to allow offline access
            return true;
        }
    }

    /**
     * Validate referral code format and expiry
     */
    async validateReferralCode(code: string): Promise<{ valid: boolean; error?: string }> {
        // Format validation
        if (!/^[A-Z0-9]{6,12}$/.test(code)) {
            return { valid: false, error: 'Invalid referral code format' };
        }

        try {
            const response = await client.post('/api/v1/referrals/validate', { code });

            if (response.data.valid) {
                return { valid: true };
            } else {
                return {
                    valid: false,
                    error: response.data.error || 'Referral code is invalid or expired',
                };
            }
        } catch (error: any) {
            // Network error - allow to proceed (will validate on apply)
            return { valid: true };
        }
    }

    /**
     * Validate order ID and check user ownership
     */
    async validateOrderId(orderId: string, userId?: string): Promise<{ valid: boolean; requiresAuth: boolean; error?: string }> {
        if (!userId) {
            return { valid: true, requiresAuth: true };
        }

        try {
            const response = await client.get(`/api/v1/orders/${orderId}`);

            if (response.status === 200) {
                // Check if order belongs to user
                const order = response.data.order || response.data;
                const orderUserId = order.userId || order.user_id || order.user?.id;

                if (orderUserId === userId) {
                    return { valid: true, requiresAuth: false };
                } else {
                    return {
                        valid: false,
                        requiresAuth: false,
                        error: 'You do not have permission to view this order',
                    };
                }
            }

            return { valid: false, requiresAuth: false, error: 'Order not found' };
        } catch (error: any) {
            if (error?.response?.status === 401) {
                return { valid: true, requiresAuth: true };
            }
            if (error?.response?.status === 404) {
                return { valid: false, requiresAuth: false, error: 'Order not found' };
            }
            // Network error
            return { valid: true, requiresAuth: true };
        }
    }

    /**
     * Validate password reset token
     */
    async validateResetToken(token: string): Promise<{ valid: boolean; error?: string }> {
        if (!token || token.length < 10) {
            return { valid: false, error: 'Invalid reset token' };
        }

        try {
            const response = await client.post('/api/v1/auth/validate-reset-token', { token });

            if (response.data.valid) {
                return { valid: true };
            } else {
                return {
                    valid: false,
                    error: response.data.error || 'Reset token is invalid or expired',
                };
            }
        } catch (error: any) {
            if (error?.response?.status === 400 || error?.response?.status === 404) {
                return {
                    valid: false,
                    error: 'Reset token is invalid or expired',
                };
            }
            // Network error - allow to proceed (will validate on submit)
            return { valid: true };
        }
    }

    /**
     * Validate AR session ID
     */
    async validateARSessionId(sessionId: string): Promise<boolean> {
        // Basic format validation
        if (!/^[a-zA-Z0-9_-]{10,50}$/.test(sessionId)) {
            return false;
        }

        try {
            const response = await client.get(`/api/v1/ar-sessions/${sessionId}`);
            return response.status === 200;
        } catch (error) {
            // Allow offline access
            return true;
        }
    }

    /**
     * Validate shared cart ID
     */
    async validateSharedCartId(cartId: string): Promise<boolean> {
        if (!cartId || cartId.length < 5) {
            return false;
        }

        try {
            const response = await client.get(`/api/v1/cart/shared/${cartId}`);
            return response.status === 200 && !!response.data;
        } catch (error) {
            // Assume valid - will show error on load if invalid
            return true;
        }
    }
}

export const dataValidationService = new DataValidationService();
