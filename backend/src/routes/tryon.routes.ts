import { Router } from "express";
import TryOnController from "@controllers/tryon.controller";
import { authenticate } from "@middleware/auth";
import { uploadSingle, handleUploadError } from "@middleware/upload";
import { perfectCorpLimiter } from "@middleware/rateLimiter";
import { validate } from "@middleware/validation";
import { body, param, query } from "express-validator";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  perfectCorpLimiter,
  uploadSingle,
  handleUploadError,
  validate([
    body("type")
      .isIn(["LIPSTICK", "EYESHADOW", "BLUSH", "FOUNDATION", "HAIR_COLOR", "FULL_MAKEUP"]),
    body("productId").optional().isString(),
    body("intensity").optional().isFloat({ min: 0, max: 1 })
  ]),
  TryOnController.createTryOn
);

router.get(
  "/:id",
  validate([param("id").isString().isLength({ min: 1 })]),
  TryOnController.getTryOn
);

router.get(
  "/",
  validate([
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 50 }),
    query("type")
      .optional()
      .isIn(["LIPSTICK", "EYESHADOW", "BLUSH", "FOUNDATION", "HAIR_COLOR", "FULL_MAKEUP"]),
    query("status").optional().isIn(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
  ]),
  TryOnController.getAllTryOns
);

router.delete(
  "/:id",
  validate([param("id").isString().isLength({ min: 1 })]),
  TryOnController.deleteTryOn
);

router.post(
  "/:id/favorite",
  validate([param("id").isString().isLength({ min: 1 })]),
  TryOnController.saveFavorite
);

export default router;
