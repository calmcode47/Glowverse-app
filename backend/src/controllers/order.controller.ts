import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '@prisma/client';

// Extend Request type to include user property
type AuthenticatedRequest = Request & {
    user?: {
        userId: string;
        role?: string;
    };
};

export class OrderController {
    /**
     * POST /api/v1/orders
     * Create order from cart
     */
    static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const order = await OrderService.createOrder(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders
     * Get user's orders
     */
    static async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const filters = {
                status: req.query.status as OrderStatus,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 20
            };

            const result = await OrderService.getUserOrders(userId, filters);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/stats
     * Get order statistics
     */
    static async getOrderStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const stats = await OrderService.getOrderStatistics(userId);
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/orders/:id
     * Get single order
     */
    static async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const order = await OrderService.getOrderById(userId, req.params.id);
            res.status(200).json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/orders/:id/cancel
     * Cancel order
     */
    static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { reason } = req.body;
            const order = await OrderService.cancelOrder(userId, req.params.id, reason);
            res.status(200).json({
                success: true,
                message: 'Order cancelled successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/v1/orders/:id/status
     * Update order status (Admin only)
     */
    static async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { status, trackingNumber, trackingUrl } = req.body;
            const order = await OrderService.updateOrderStatus(
                req.params.id,
                status,
                trackingNumber,
                trackingUrl
            );
            res.status(200).json({
                success: true,
                message: 'Order status updated successfully',
                data: order
            });
        } catch (error) {
            next(error);
        }
    }
}
