import { Router } from "express";
import { body, param } from "express-validator";
import AuthController from "@controllers/auth.controller";
import { validate } from "@middleware/validation";
import { authenticate } from "@middleware/auth";
import { AdaptiveRateLimiter } from "@middleware/adaptive-rate-limit";
import { DDoSProtection } from "@middleware/ddos-protection";

const router = Router();

// Apply DDoS protection and bot detection to all auth routes
router.use(DDoSProtection.detectSuspiciousActivity);
router.use(DDoSProtection.detectBot);

router.post(
  "/register",
  AdaptiveRateLimiter.createBurstLimiter(3), // 3 per minute
  validate([
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body("name").optional().trim().isLength({ min: 2, max: 50 })
  ]),
  AuthController.register
);

router.post(
  "/login",
  AdaptiveRateLimiter.createBurstLimiter(5), // 5 per minute
  validate([body("email").isEmail().normalizeEmail(), body("password").notEmpty()]),
  AuthController.login
);

router.post(
  "/refresh",
  AdaptiveRateLimiter.createBurstLimiter(10), // 10 per minute
  validate([body("refreshToken").notEmpty()]),
  AuthController.refreshToken
);
router.post("/logout", AuthController.logout);
router.post("/logout-all", authenticate, AuthController.logoutAll);
router.get("/me", authenticate, AuthController.getProfile);
router.post(
  "/change-password",
  authenticate,
  validate([
    body("oldPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  ]),
  AuthController.changePassword
);
router.delete("/account", authenticate, validate([body("password").notEmpty()]), AuthController.deleteAccount);

// Password reset routes
router.post(
  "/forgot-password",
  AdaptiveRateLimiter.createBurstLimiter(3), // 3 per minute
  validate([body("email").isEmail().normalizeEmail()]),
  AuthController.forgotPassword
);

router.get(
  "/reset-password/:token",
  AdaptiveRateLimiter.createBurstLimiter(10),
  validate([param("token").isString().isLength({ min: 1 })]),
  AuthController.verifyResetToken
);

router.post(
  "/reset-password",
  AdaptiveRateLimiter.createBurstLimiter(5),
  validate([
    body("token").isString().notEmpty(),
    body("password").isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  ]),
  AuthController.resetPassword
);

export default router;

