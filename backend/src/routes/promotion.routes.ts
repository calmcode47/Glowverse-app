import { Router } from "express";
import { body, query } from "express-validator";
import PromotionController from "@controllers/promotion.controller";
import { authenticate } from "@middleware/auth";
import { validate } from "@middleware/validation";

const router = Router();

/**
 * @route   GET /api/v1/promotions/active
 * @desc    Get all active promotions
 * @access  Public
 */
router.get("/active", PromotionController.getActivePromotions);

/**
 * @route   POST /api/v1/promotions/validate
 * @desc    Validate promotion code for cart
 * @access  Private
 * @body    code (string), subtotal (number), items (array)
 */
router.post(
    "/validate",
    authenticate,
    validate([
        body("code").isString().trim().notEmpty().withMessage("Promotion code is required"),
        body("subtotal").isFloat({ min: 0 }).withMessage("Valid subtotal is required"),
        body("items").isArray().withMessage("Items array is required"),
        body("items.*.productId").isString().withMessage("Product ID is required"),
        body("items.*.category").isString().withMessage("Category is required")
    ]),
    PromotionController.validatePromotion
);

/**
 * @route   GET /api/v1/promotions/history
 * @desc    Get user's promotion usage history
 * @access  Private
 * @query   page, limit
 */
router.get(
    "/history",
    authenticate,
    validate([
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 })
    ]),
    PromotionController.getPromotionHistory
);

export default router;
