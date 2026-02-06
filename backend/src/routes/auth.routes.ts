import { Router } from "express";
import { body } from "express-validator";
import AuthController from "@controllers/auth.controller";
import { validate } from "@middleware/validation";
import { authenticate } from "@middleware/auth";
import { authLimiter } from "@middleware/rateLimiter";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate([
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body("name").optional().trim().isLength({ min: 2, max: 50 })
  ]),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validate([body("email").isEmail().normalizeEmail(), body("password").notEmpty()]),
  AuthController.login
);

router.post("/refresh", validate([body("refreshToken").notEmpty()]), AuthController.refreshToken);
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

export default router;
