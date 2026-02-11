import { Router } from "express";
import { body, param } from "express-validator";
import CartController from "@controllers/cart.controller";
import { authenticate } from "@middleware/auth";
import { validate } from "@middleware/validation";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get("/", CartController.getCart);

/**
 * @route   POST /api/v1/cart/items
 * @desc    Add item to cart
 * @access  Private
 */
router.post(
    "/items",
    validate([
        body("productId").isString().isLength({ min: 1 }),
        body("quantity").isInt({ min: 1, max: 99 })
    ]),
    CartController.addItem
);

/**
 * @route   PATCH /api/v1/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.patch(
    "/items/:itemId",
    validate([
        param("itemId").isString().isLength({ min: 1 }),
        body("quantity").isInt({ min: 0, max: 99 })
    ]),
    CartController.updateItem
);

/**
 * @route   DELETE /api/v1/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete(
    "/items/:itemId",
    validate([param("itemId").isString().isLength({ min: 1 })]),
    CartController.removeItem
);

/**
 * @route   DELETE /api/v1/cart/clear
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete("/clear", CartController.clearCart);

/**
 * @route   GET /api/v1/cart/total
 * @desc    Get cart total breakdown
 * @access  Private
 */
router.get("/total", CartController.getCartTotal);

export default router;
