import { PrismaClient, Cart, CartItem, Product, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { ProductService } from './product.service';
import { prisma } from '../config/database';

// Types for Cart with relations
export interface CartItemWithProduct extends CartItem {
    product: Product;
    subtotal: Prisma.Decimal;
}

export interface CartWithItems extends Cart {
    items: CartItemWithProduct[];
    subtotal: Prisma.Decimal;
    itemCount: number;
}

export interface CartSummary {
    subtotal: number;
    itemCount: number;
    estimatedTax: number;
    estimatedShipping: number;
    estimatedTotal: number;
}

export interface CartIssue {
    itemId: string;
    productId: string;
    productName: string;
    issue: 'out_of_stock' | 'insufficient_stock' | 'price_changed' | 'product_inactive';
    currentStock?: number;
    requestedQuantity?: number;
    oldPrice?: number;
    newPrice?: number;
}

export class CartService {
    /**
     * Get or create a cart for a user
     */
    static async getOrCreateCart(userId: string): Promise<CartWithItems> {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    },
                    orderBy: { addedAt: 'desc' }
                }
            }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: { product: true },
                        orderBy: { addedAt: 'desc' }
                    } // empty initially
                }
            });
        }

        // Calculate derived fields
        return this.transformCart(cart);
    }

    /**
     * Add item to cart
     */
    static async addToCart(userId: string, productId: string, quantity: number): Promise<CartWithItems> {
        if (quantity < 1 || quantity > 99) {
            throw new AppError('Quantity must be between 1 and 99', 400);
        }

        // Check product validity and stock
        const stockCheck = await ProductService.checkStock(productId, quantity);
        if (!stockCheck.available) {
            throw new AppError(`Insufficient stock. Only ${stockCheck.currentStock} available.`, 400);
        }

        const product = await ProductService.getProductById(productId); // Ensures active

        const cart = await this.getOrCreateCart(userId);
        const existingItem = cart.items.find(item => item.productId === productId);

        const price = product.price; // Snapshot current price

        if (existingItem) {
            // Update existing item
            const newQuantity = existingItem.quantity + quantity;

            // Check total stock for new quantity
            const totalStockCheck = await ProductService.checkStock(productId, newQuantity);
            if (!totalStockCheck.available) {
                throw new AppError(`Cannot add. Total quantity would exceed stock (${totalStockCheck.currentStock}).`, 400);
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: newQuantity,
                    price: price, // Update price to current
                    subtotal: new Prisma.Decimal(Number(price) * newQuantity)
                }
            });
        } else {
            // Create new item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    price: price,
                    subtotal: new Prisma.Decimal(Number(price) * quantity)
                }
            });
        }

        // Recalculate cart total
        await this.updateCartTotals(cart.id);

        return this.getOrCreateCart(userId);
    }

    /**
     * Update cart item quantity
     */
    static async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartWithItems> {
        if (quantity < 0 || quantity > 99) {
            throw new AppError('Quantity must be between 0 and 99', 400);
        }

        const cart = await this.getOrCreateCart(userId);
        const item = cart.items.find(i => i.id === itemId);

        if (!item) {
            throw new AppError('Item not found in cart', 404);
        }

        if (quantity === 0) {
            return this.removeFromCart(userId, itemId);
        }

        // Check stock
        const stockCheck = await ProductService.checkStock(item.productId, quantity);
        if (!stockCheck.available) {
            throw new AppError(`Insufficient stock. Only ${stockCheck.currentStock} available.`, 400);
        }

        // Update item
        await prisma.cartItem.update({
            where: { id: itemId },
            data: {
                quantity,
                subtotal: new Prisma.Decimal(Number(item.price) * quantity)
            }
        });

        await this.updateCartTotals(cart.id);

        return this.getOrCreateCart(userId);
    }

    /**
     * Remove item from cart
     */
    static async removeFromCart(userId: string, itemId: string): Promise<CartWithItems> {
        const cart = await this.getOrCreateCart(userId);
        const item = cart.items.find(i => i.id === itemId);

        if (!item) {
            throw new AppError('Item not found in cart', 404);
        }

        await prisma.cartItem.delete({
            where: { id: itemId }
        });

        await this.updateCartTotals(cart.id);

        return this.getOrCreateCart(userId);
    }

    /**
     * Clear cart
     */
    static async clearCart(userId: string): Promise<CartWithItems> {
        const cart = await this.getOrCreateCart(userId);

        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        await this.updateCartTotals(cart.id);

        return this.getOrCreateCart(userId);
    }

    /**
     * Get cart summary with estimated totals
     */
    static async getCartSummary(userId: string): Promise<CartSummary> {
        const cart = await this.getOrCreateCart(userId);

        const subtotal = Number(cart.subtotal);
        const itemCount = cart.itemCount;

        // Estimate Tax (approx 8%)
        const estimatedTax = subtotal * 0.08;

        // Estimate Shipping
        const estimatedShipping = subtotal >= 50 ? 0 : 5.99;

        const estimatedTotal = subtotal + estimatedTax + estimatedShipping;

        return {
            subtotal,
            itemCount,
            estimatedTax,
            estimatedShipping,
            estimatedTotal
        };
    }

    /**
     * Validate cart items before checkout
     */
    static async validateCart(userId: string): Promise<{ valid: boolean; issues: CartIssue[] }> {
        const cart = await this.getOrCreateCart(userId);
        const issues: CartIssue[] = [];

        for (const item of cart.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });

            if (!product || !product.isActive) {
                issues.push({
                    itemId: item.id,
                    productId: item.productId,
                    productName: item.product.name,
                    issue: 'product_inactive'
                });
                continue;
            }

            if (product.stock < item.quantity) {
                issues.push({
                    itemId: item.id,
                    productId: product.id,
                    productName: product.name,
                    issue: product.stock === 0 ? 'out_of_stock' : 'insufficient_stock',
                    currentStock: product.stock,
                    requestedQuantity: item.quantity
                });
            }

            if (Number(product.price) !== Number(item.price)) {
                issues.push({
                    itemId: item.id,
                    productId: product.id,
                    productName: product.name,
                    issue: 'price_changed',
                    oldPrice: Number(item.price),
                    newPrice: Number(product.price)
                });
            }
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    // --- Private Helpers ---

    private static transformCart(cart: any): CartWithItems {
        // Calculate totals manually if DB triggers aren't used, 
        // ensuring application-level consistency
        const items = cart.items || [];
        const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);

        return {
            ...cart,
            items,
            subtotal: new Prisma.Decimal(subtotal),
            itemCount: items.reduce((count: number, item: any) => count + item.quantity, 0)
        };
    }

    private static async updateCartTotals(cartId: string): Promise<void> {
        const items = await prisma.cartItem.findMany({
            where: { cartId }
        });

        const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

        await prisma.cart.update({
            where: { id: cartId },
            data: {
                subtotal: new Prisma.Decimal(subtotal)
            }
        });
    }
}
