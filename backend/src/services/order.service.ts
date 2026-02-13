import { PrismaClient, Order, OrderItem, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';
import { CartService } from './cart.service';
import { NotificationService } from './notification.service';
import { prisma } from '../config/database';

export interface Address {
    fullName: string;
    email?: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface CreateOrderDto {
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
    notes?: string;
    promotionCode?: string;
}

export interface OrderWithItems extends Order {
    items: OrderItem[];
}

export class OrderService {
    /**
     * Create a new order from user's cart
     */
    static async createOrder(userId: string, orderData: CreateOrderDto): Promise<Order> {
        // 1. Validate cart and stock
        const cartValidation = await CartService.validateCart(userId);
        if (!cartValidation.valid) {
            throw new AppError('Cart contains invalid items. Please review your cart.', 400, { issues: cartValidation.issues });
        }

        const cart = await CartService.getOrCreateCart(userId);
        if (cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        // 2. Calculate Totals
        const subtotal = Number(cart.subtotal);
        const tax = subtotal * 0.08; // 8% tax rule
        const shippingCost = subtotal >= 50 ? 0 : 5.99;
        const discount = 0; // TODO: Implement promotion logic
        const total = subtotal + tax + shippingCost - discount;

        // 3. Generate Order Number
        const orderNumber = this.generateOrderNumber();

        // 4. Create Transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create Order
            const order = await tx.order.create({
                data: {
                    userId,
                    orderNumber,
                    status: OrderStatus.PENDING,
                    paymentStatus: PaymentStatus.PENDING, // Assume standard flow
                    subtotal: new Prisma.Decimal(subtotal),
                    tax: new Prisma.Decimal(tax),
                    shippingCost: new Prisma.Decimal(shippingCost),
                    discount: new Prisma.Decimal(discount),
                    total: new Prisma.Decimal(total),
                    shippingAddress: JSON.stringify(orderData.shippingAddress),
                    billingAddress: orderData.billingAddress ? JSON.stringify(orderData.billingAddress) : null,
                    paymentMethod: orderData.paymentMethod,
                    notes: orderData.notes,
                    items: {
                        create: cart.items.map(item => ({
                            productId: item.productId,
                            productName: item.product.name,
                            productImage: item.product.thumbnailUrl || '', // Fallback
                            productSku: item.product.sku,
                            quantity: item.quantity,
                            price: item.price,
                            subtotal: new Prisma.Decimal(Number(item.price) * item.quantity),
                            total: new Prisma.Decimal(Number(item.price) * item.quantity) // Item total checks (taxes/discounts per item can happen here)
                        }))
                    }
                },
                include: { items: true }
            });

            // Update Stock
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity }, purchaseCount: { increment: item.quantity } }
                });
            }

            // Clear Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
            await tx.cart.update({
                where: { id: cart.id },
                data: { subtotal: new Prisma.Decimal(0) }
            });

            return order;
        });

        // Send Notification
        await NotificationService.notifyOrderStatus(userId, order.id, OrderStatus.PENDING).catch(err => {
            console.error('Failed to send order notification:', err);
        });

        return order;
    }

    /**
     * Get filtered user orders
     */
    static async getUserOrders(
        userId: string,
        filters: { status?: OrderStatus; page?: number; limit?: number } = {}
    ): Promise<{ orders: OrderWithItems[]; total: number; page: number; limit: number; totalPages: number }> {
        const { status, page = 1, limit = 20 } = filters;

        const where: Prisma.OrderWhereInput = { userId };
        if (status) where.status = status;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: { items: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.order.count({ where })
        ]);

        return {
            orders: orders as OrderWithItems[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get single order by ID
     */
    static async getOrderById(userId: string, orderId: string): Promise<OrderWithItems> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order || order.userId !== userId) {
            throw new AppError('Order not found', 404);
        }

        return order as OrderWithItems;
    }

    /**
     * Update order status
     */
    static async updateOrderStatus(
        orderId: string,
        status: OrderStatus,
        trackingNumber?: string,
        trackingUrl?: string
    ): Promise<Order> {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new AppError('Order not found', 404);

        // Validation logic for transitions... (simplified)
        if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
            throw new AppError(`Cannot update status from ${order.status}`, 400);
        }

        const updateData: Prisma.OrderUpdateInput = { status };
        if (status === OrderStatus.SHIPPED) {
            updateData.trackingNumber = trackingNumber;
            updateData.trackingUrl = trackingUrl;
            // Estimate delivery 3 days from now
            const estDate = new Date();
            estDate.setDate(estDate.getDate() + 3);
            updateData.estimatedDelivery = estDate;
        } else if (status === OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        } else if (status === OrderStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
            // TODO: Restore stock if cancelled
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData
        });

        return updatedOrder;
    }

    /**
     * Cancel order (User initiated)
     */
    static async cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order> {
        const order = await this.getOrderById(userId, orderId);

        if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
            throw new AppError('Order cannot be cancelled in current status', 400);
        }

        return await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: OrderStatus.CANCELLED,
                    cancelledAt: new Date(),
                    internalNotes: reason ? `User Cancelled: ${reason}` : 'User Cancelled'
                }
            });

            // Restore Stock
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } }
                });
            }

            return updatedOrder;
        });
    }

    /**
     * Get order statistics for dashboard
     */
    static async getOrderStatistics(userId: string): Promise<{
        totalOrders: number;
        totalSpent: number;
        ordersByStatus: Record<OrderStatus, number>;
        recentOrders: Order[];
        averageOrderValue: number;
    }> {

        const orders = await prisma.order.findMany({
            where: { userId }
        });

        const totalOrders = orders.length;
        const activeOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED);
        const totalSpent = activeOrders.reduce((sum, o) => sum + Number(o.total), 0);

        // Group by status
        const ordersByStatus = orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);

        // Recent
        const recentOrders = orders
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 5);

        return {
            totalOrders,
            totalSpent,
            ordersByStatus,
            recentOrders,
            averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
        };
    }

    // --- Private Helpers ---

    private static generateOrderNumber(): string {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
        const random = Math.floor(10000 + Math.random() * 90000); // 5 digits
        return `ORD-${date}-${random}`;
    }
}
