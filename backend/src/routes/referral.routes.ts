import { Router } from "express";
import { body, query } from "express-validator";
import ReferralController from "@controllers/referral.controller";
import { authenticate } from "@middleware/auth";
import { validate } from "@middleware/validation";

const router = Router();

// All referral routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/referrals/code
 * @desc    Get user's referral code
 * @access  Private
 */
router.get("/code", ReferralController.getReferralCode);

/**
 * @route   GET /api/v1/referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get("/stats", ReferralController.getReferralStats);

/**
 * @route   GET /api/v1/referrals
 * @desc    Get user's referral list
 * @access  Private
 * @query   status, page, limit
 */
router.get(
    "/",
    validate([
        query("status").optional().isIn(["PENDING", "REGISTERED", "COMPLETED", "EXPIRED"]),
        query("page").optional().isInt({ min: 1 }),
        query("limit").optional().isInt({ min: 1, max: 100 })
    ]),
    ReferralController.getReferrals
);

/**
 * @route   POST /api/v1/referrals/apply
 * @desc    Apply referral code
 * @access  Private
 * @body    code (string), email (string)
 */
router.post(
    "/apply",
    validate([
        body("code").isString().trim().notEmpty().withMessage("Referral code is required"),
        body("email").isEmail().withMessage("Valid email is required")
    ]),
    ReferralController.applyReferralCode
);

export default router;
