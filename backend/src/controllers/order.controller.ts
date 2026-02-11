import { Request, Response } from "express";
import OrderService from "@services/order.service";
import { AppError } from "@utils/errors";
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatus, OrderFilters } from "../types/ecommerce.types";

/**
 * Order Controller
 * Handles HTTP requests for order operations
 */
const OrderController = {
    /**
     * POST /api/v1/orders
     * Create new order from cart
     */
    async createOrder(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const orderData = req.body as CreateOrderDto;

        const order = await OrderService.createOrder(req.user.userId, orderData);

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        });
    },

    /**
     * GET /api/v1/orders
     * Get user's orders with optional filters
     */
    async getUserOrders(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { status, page, limit } = req.query;

        const filters: OrderFilters = {};
        if (status && typeof status === 'string') {
            filters.status = status as OrderStatus;
        }
        if (page) {
            filters.page = parseInt(page as string, 10);
        }
        if (limit) {
            filters.limit = parseInt(limit as string, 10);
        }

        const result = await OrderService.getUserOrders(req.user.userId, filters);

        return res.status(200).json({
            success: true,
            orders: result.items,
            pagination: result.pagination
        });
    },

    /**
     * GET /api/v1/orders/stats
     * Get order statistics
     */
    async getOrderStats(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const stats = await OrderService.getOrderStatistics(req.user.userId);

        return res.status(200).json({
            success: true,
            statistics: stats
        });
    },

    /**
     * GET /api/v1/orders/:id
     * Get single order details
     */
    async getOrder(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        const order = await OrderService.getOrderById(req.user.userId, id);

        return res.status(200).json({
            success: true,
            order
        });
    },

    /**
     * PATCH /api/v1/orders/:id/cancel
     * Cancel an order
     */
    async cancelOrder(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        const { id } = req.params;

        const order = await OrderService.cancelOrder(req.user.userId, id);

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });
    },

    /**
     * PATCH /api/v1/orders/:id/status
     * Update order status (admin only)
     */
    async updateOrderStatus(req: Request, res: Response) {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        // Check if user is admin
        const user = await require("@config/database").default.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user || user.role !== "ADMIN") {
            throw new AppError("Insufficient permissions", 403);
        }

        const { id } = req.params;
        const updateData = req.body as UpdateOrderStatusDto;

        const order = await OrderService.updateOrderStatus(id, updateData);

        return res.status(200).json({
            success: true,
            message: "Order status updated",
            order
        });
    }
};

export default OrderController;
