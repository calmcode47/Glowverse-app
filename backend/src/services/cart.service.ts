import prisma from "@config/database";
import { NotFoundError, AppError } from "@utils/errors";
import { CartWithItems, CartItemWithProduct, CartTotal, AddToCartDto, UpdateCartItemDto } from "../types/ecommerce.types";

/**
 * Cart Service
 * Handles shopping cart operations including add, update, remove, and total calculations
 */
class CartService {
    /**
     * Get or create a cart for the user
     */
    async getOrCreateCart(userId: string): Promise<CartWithItems> {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                brand: true,
                                category: true,
                                price: true,
                                thumbnailUrl: true,
                                stock: true,
                                isActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    brand: true,
                                    category: true,
                                    price: true,
                                    thumbnailUrl: true,
                                    stock: true,
                                    isActive: true
                                }
                            }
                        }
                    }
                }
            });
        }

        return this.formatCartWithItems(cart as any);
    }

    /**
     * Add a product to cart or update quantity if it already exists
     */
    async addToCart(userId: string, data: AddToCartDto): Promise<CartWithItems> {
        const { productId, quantity } = data;

        // Verify product exists and is active
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product || !product.isActive) {
            throw new NotFoundError("Product not found");
        }

        // Check stock availability
        if (product.stock < quantity) {
            throw new AppError(`Insufficient stock. Only ${product.stock} items available`, 400);
        }

        // Get or create cart
        const cart = await prisma.cart.upsert({
            where: { userId },
            create: { userId },
            update: {}
        });

        // Check if product already in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId
                }
            }
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;

            if (product.stock < newQuantity) {
                throw new AppError(`Insufficient stock. Only ${product.stock} items available`, 400);
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        } else {
            // Create new cart item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    price: product.price
                }
            });
        }

        // Return updated cart
        return this.getOrCreateCart(userId);
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(userId: string, itemId: string, data: UpdateCartItemDto): Promise<CartWithItems> {
        const { quantity } = data;

        // Find cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true
            }
        });

        if (!cartItem) {
            throw new NotFoundError("Cart item not found");
        }

        // Verify ownership
        if (cartItem.cart.userId !== userId) {
            throw new AppError("Unauthorized access to cart item", 403);
        }

        // If quantity is 0, remove the item
        if (quantity === 0) {
            await prisma.cartItem.delete({
                where: { id: itemId }
            });
            return this.getOrCreateCart(userId);
        }

        // Check stock availability
        if (cartItem.product.stock < quantity) {
            throw new AppError(`Insufficient stock. Only ${cartItem.product.stock} items available`, 400);
        }

        // Update quantity
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });

        return this.getOrCreateCart(userId);
    }

    /**
     * Remove an item from cart
     */
    async removeFromCart(userId: string, itemId: string): Promise<CartWithItems> {
        // Find cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true
            }
        });

        if (!cartItem) {
            throw new NotFoundError("Cart item not found");
        }

        // Verify ownership
        if (cartItem.cart.userId !== userId) {
            throw new AppError("Unauthorized access to cart item", 403);
        }

        // Delete cart item
        await prisma.cartItem.delete({
            where: { id: itemId }
        });

        return this.getOrCreateCart(userId);
    }

    /**
     * Clear all items from cart
     */
    async clearCart(userId: string): Promise<CartWithItems> {
        const cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
        }

        return this.getOrCreateCart(userId);
    }

    /**
     * Calculate cart total with tax and shipping
     */
    async getCartTotal(userId: string): Promise<CartTotal> {
        const cart = await this.getOrCreateCart(userId);

        const subtotal = cart.subtotal;
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        const discount = 0; // Placeholder for future discount logic
        const total = subtotal + tax + shipping - discount;

        return {
            subtotal,
            tax: parseFloat(tax.toFixed(2)),
            shipping,
            discount,
            total: parseFloat(total.toFixed(2)),
            itemCount: cart.itemCount
        };
    }

    /**
     * Format cart with calculated totals
     */
    private formatCartWithItems(cart: any): CartWithItems {
        const items: CartItemWithProduct[] = cart.items.map((item: any) => ({
            ...item,
            total: item.price * item.quantity
        }));

        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            id: cart.id,
            userId: cart.userId,
            items,
            subtotal: parseFloat(subtotal.toFixed(2)),
            itemCount,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt
        };
    }
}

export default new CartService();
