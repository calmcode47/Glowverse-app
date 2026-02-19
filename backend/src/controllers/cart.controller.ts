import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';

// Extend Request type to include user property
type AuthenticatedRequest = Request & {
    user?: { // Made user optional as it might not always be present if authentication fails or is skipped
        userId: string;
    };
};

export class CartController {
    /**
     * GET /api/v1/cart
     * Get user's cart
     */
    static async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const cart = await CartService.getOrCreateCart(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/cart/items
     * Add item to cart
     */
    static async addToCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { productId, quantity } = req.body;
            const cart = await CartService.addToCart(userId, productId, quantity);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/cart/items/:itemId
     * Update cart item quantity
     */
    static async updateCartItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { itemId } = req.params;
            const { quantity } = req.body;
            const cart = await CartService.updateCartItem(userId, itemId as string, quantity);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/cart/items/:itemId
     * Remove item from cart
     */
    static async removeFromCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { itemId } = req.params;
            const cart = await CartService.removeFromCart(userId, itemId as string);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/v1/cart
     * Clear entire cart
     */
    static async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const cart = await CartService.clearCart(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/cart/summary
     * Get cart summary with totals
     */
    static async getCartSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const summary = await CartService.getCartSummary(userId);
            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            next(error);
        }
    }
}
