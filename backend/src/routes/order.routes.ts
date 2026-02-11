import { Router } from "express";
import { body, param, query } from "express-validator";
import OrderController from "@controllers/order.controller";
import { authenticate } from "@middleware/auth";
import { validate } from "@middleware/validation";

const router = Router();

// All order routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/orders
 * @desc    Create new order from cart
 * @access  Private
 */
router.post(
    "/",
    validate([
        body("shippingAddress").isObject(),
        body("shippingAddress.fullName").isString().trim().isLength({ min: 2, max: 100 }),
        body("shippingAddress.addressLine1").isString().trim().isLength({ min: 5, max: 200 }),
        body("shippingAddress.addressLine2").optional().isString(),
        body("shippingAddress.city").isString().trim().isLength({ min: 2, max: 100 }),
        body("shippingAddress.state").isString().trim().isLength({ min: 2, max: 100 }),
        body("shippingAddress.postalCode").isString().trim().isLength({ min: 3, max: 20 }),
        body("shippingAddress.country").isString().trim().isLength({ min: 2, max: 100 }),
        body("shippingAddress.phone").isString().trim().matches(/^[\d\s\-\+\(\)]+$/),
        body("billingAddress").optional().isObject(),
        body("paymentMethod").isString().trim().isLength({ min: 2, max: 50 }),
        body("notes").optional().isString().trim().isLength({ max: 500 })
    ]),
    OrderController.createOrder
);

/**
 * @route   GET /api/v1/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get(
    "/",
    validate([
        query("status").optional().isIn(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 })
    ]),
    OrderController.getUserOrders
);

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Get order statistics
 * @access  Private
 */
router.get("/stats", OrderController.getOrderStats);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Get single order details
 * @access  Private
 */
router.get(
    "/:id",
    validate([param("id").isString().isLength({ min: 1 })]),
    OrderController.getOrder
);

/**
 * @route   PATCH /api/v1/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.patch(
    "/:id/cancel",
    validate([param("id").isString().isLength({ min: 1 })]),
    OrderController.cancelOrder
);

/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private (Admin)
 */
router.patch(
    "/:id/status",
    validate([
        param("id").isString().isLength({ min: 1 }),
        body("status").isIn(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
        body("trackingNumber").optional().isString().trim().isLength({ min: 1, max: 100 })
    ]),
    OrderController.updateOrderStatus
);

export default router;
