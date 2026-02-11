import { Request, Response } from "express";
import CartService from "@services/cart.service";
import { AppError } from "@utils/errors";
import { AddToCartDto, UpdateCartItemDto } from "../types/ecommerce.types";

/**
 * Cart Controller
 * Handles HTTP requests for shopping cart operations
 */
const CartController = {
    /**
     * GET /api/v1/cart
     * Get user's cart with all items
     */
    async getCart(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const cart = await CartService.getOrCreateCart(req.user.userId);

        return res.status(200).json({
            success: true,
            cart
        });
    },

    /**
     * POST /api/v1/cart/items
     * Add item to cart
     */
    async addItem(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { productId, quantity } = req.body as AddToCartDto;

        const cart = await CartService.addToCart(req.user.userId, {
            productId,
            quantity
        });

        return res.status(200).json({
            success: true,
            message: "Item added to cart",
            cart
        });
    },

    /**
     * PATCH /api/v1/cart/items/:itemId
     * Update cart item quantity
     */
    async updateItem(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { itemId } = req.params;
        const { quantity } = req.body as UpdateCartItemDto;

        const cart = await CartService.updateCartItem(req.user.userId, itemId, {
            quantity
        });

        return res.status(200).json({
            success: true,
            message: quantity === 0 ? "Item removed from cart" : "Cart updated",
            cart
        });
    },

    /**
     * DELETE /api/v1/cart/items/:itemId
     * Remove item from cart
     */
    async removeItem(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { itemId } = req.params;

        const cart = await CartService.removeFromCart(req.user.userId, itemId);

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            cart
        });
    },

    /**
     * DELETE /api/v1/cart/clear
     * Clear all items from cart
     */
    async clearCart(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const cart = await CartService.clearCart(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Cart cleared",
            cart
        });
    },

    /**
     * GET /api/v1/cart/total
     * Get cart total with tax and shipping breakdown
     */
    async getCartTotal(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const total = await CartService.getCartTotal(req.user.userId);

        return res.status(200).json({
            success: true,
            total
        });
    }
};

export default CartController;
