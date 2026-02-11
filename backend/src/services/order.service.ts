import prisma from "@config/database";
import { NotFoundError, AppError } from "@utils/errors";
import NotificationService from "./notification.service";
import PromotionService from "./promotion.service";
import ReferralService from "./referral.service";
import {
    CreateOrderDto,
    OrderStatus,
    UpdateOrderStatusDto,
    OrderFilters,
    OrderStatistics,
    PaginatedResponse
} from "../types/ecommerce.types";

/**
 * Order Service
 * Handles order creation, management, and status updates
 */
class OrderService {
    /**
     * Generate a unique order number
     * Format: ORD-YYYYMMDD-XXXX
     */
    private generateOrderNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();

        return `ORD-${year}${month}${day}-${random}`;
    }

    /**
     * Create an order from user's cart
     */
    async createOrder(userId: string, orderData: CreateOrderDto): Promise<any> {
        const { shippingAddress, billingAddress, paymentMethod, notes, promotionCode } = orderData;

        // Get user's cart with items
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            throw new AppError("Cart is empty", 400);
        }

        // Verify all items have sufficient stock
        for (const item of cart.items) {
            if (!item.product.isActive) {
                throw new AppError(`Product "${item.product.name}" is no longer available`, 400);
            }
            if (item.product.stock < item.quantity) {
                throw new AppError(
                    `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available`,
                    400
                );
            }
        }

        // Calculate totals
        const subtotal = cart.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        let discount = 0;
        let promotionId: string | undefined;

        // Validate and apply promotion code if provided
        if (promotionCode) {
            const validation = await PromotionService.validatePromotion(
                promotionCode,
                userId,
                {
                    subtotal,
                    items: cart.items.map(item => ({
                        productId: item.productId,
                        category: item.product.category
                    }))
                }
            );

            if (validation.isValid && validation.discount) {
                discount = validation.discount;
                promotionId = validation.promotion.id;
            }
        }

        const total = subtotal + tax + shipping - discount;

        // Generate unique order number
        const orderNumber = this.generateOrderNumber();

        // Create order with items in a transaction-like operation
        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId,
                status: OrderStatus.PENDING,
                subtotal,
                tax,
                shipping,
                discount,
                total,
                shippingAddress: JSON.stringify(shippingAddress),
                billingAddress: JSON.stringify(billingAddress || shippingAddress),
                paymentMethod,
                notes,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        productName: item.product.name,
                        productImage: item.product.thumbnailUrl,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Reduce product stock
        for (const item of cart.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        // Clear user's cart
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        // Apply promotion if validated
        if (promotionId) {
            await PromotionService.applyPromotion(
                promotionId,
                userId,
                order.id,
                discount
            );
        }

        // Check if this is user's first order (for referral completion)
        const orderCount = await prisma.order.count({ where: { userId } });
        if (orderCount === 1) {
            await ReferralService.completeReferral(userId, order.id);
        }

        // Send order placement notification
        await NotificationService.notifyOrderStatus(
            userId,
            order.id,
            order.orderNumber,
            OrderStatus.PENDING
        );

        return this.formatOrder(order);
    }

    /**
     * Get user's orders with optional filters
     */
    async getUserOrders(userId: string, filters: OrderFilters = {}): Promise<PaginatedResponse<any>> {
        const { status, page = 1, limit = 20 } = filters;

        const where: any = { userId };
        if (status) {
            where.status = status;
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.order.count({ where })
        ]);

        const formattedOrders = orders.map(order => this.formatOrder(order));

        return {
            items: formattedOrders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1
            }
        };
    }

    /**
     * Get a single order by ID
     */
    async getOrderById(userId: string, orderId: string): Promise<any> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        // Verify ownership
        if (order.userId !== userId) {
            throw new AppError("Unauthorized access to order", 403);
        }

        return this.formatOrder(order);
    }

    /**
     * Update order status (admin only)
     */
    async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto): Promise<any> {
        const { status, trackingNumber } = data;

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        const updateData: any = { status };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                items: true
            }
        });

        // Send status update notification
        await NotificationService.notifyOrderStatus(
            updatedOrder.userId,
            updatedOrder.id,
            updatedOrder.orderNumber,
            status
        );

        return this.formatOrder(updatedOrder);
    }

    /**
     * Cancel an order
     */
    async cancelOrder(userId: string, orderId: string): Promise<any> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true
            }
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        // Verify ownership
        if (order.userId !== userId) {
            throw new AppError("Unauthorized access to order", 403);
        }

        // Check if order can be cancelled
        if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
            throw new AppError("Order cannot be cancelled at this stage", 400);
        }

        // Update order status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: OrderStatus.CANCELLED
            },
            include: {
                items: true
            }
        });

        // Restore product stock
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity
                    }
                }
            });
        }

        return this.formatOrder(updatedOrder);
    }

    /**
     * Get order statistics for a user
     */
    async getOrderStatistics(userId: string): Promise<OrderStatistics> {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Count by status
        const ordersByStatus: any = {};
        orders.forEach(order => {
            ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;
        });

        // Calculate total spent
        const totalSpent = orders
            .filter(order => order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.REFUNDED)
            .reduce((sum, order) => sum + order.total, 0);

        // Recent orders (last 5)
        const recentOrders = orders.slice(0, 5).map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status as OrderStatus,
            createdAt: order.createdAt
        }));

        return {
            totalOrders: orders.length,
            ordersByStatus,
            totalSpent: parseFloat(totalSpent.toFixed(2)),
            averageOrderValue: orders.length > 0 ? parseFloat((totalSpent / orders.length).toFixed(2)) : 0,
            recentOrders
        };
    }

    /**
     * Format order response
     */
    private formatOrder(order: any) {
        return {
            ...order,
            shippingAddress: this.safeJsonParse(order.shippingAddress, {}),
            billingAddress: this.safeJsonParse(order.billingAddress, {})
        };
    }

    /**
     * Safely parse JSON string
     */
    private safeJsonParse<T>(jsonString: string, defaultValue: T): T {
        try {
            return JSON.parse(jsonString) as T;
        } catch {
            return defaultValue;
        }
    }
}

export default new OrderService();
