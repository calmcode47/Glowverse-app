import { Router } from "express";
import {
  analyzeSkin,
  getSkinAnalysis,
  applyVirtualMakeup,
  getVirtualTryOn,
  getRecommendations,
  searchProducts,
  detectFace,
  perfectCorpHealth
} from "@controllers/perfectcorp.controller";
import { authenticate } from "@middleware/auth";
import { perfectCorpLimiter } from "@middleware/rateLimiter";
import { validate } from "@middleware/validation";
import { body, query, param } from "express-validator";

const router = Router();

router.get("/health", authenticate, perfectCorpHealth);

router.post(
  "/skin-analysis",
  authenticate,
  perfectCorpLimiter,
  validate([body("imageUrl").isString().isURL()]),
  analyzeSkin
);
router.get(
  "/skin-analysis/:id",
  authenticate,
  perfectCorpLimiter,
  validate([param("id").isString().isLength({ min: 1 })]),
  getSkinAnalysis
);

router.post(
  "/virtual-tryon",
  authenticate,
  perfectCorpLimiter,
  validate([body("imageUrl").isString().isURL(), body("productId").isString().isLength({ min: 1 })]),
  applyVirtualMakeup
);
router.get(
  "/virtual-tryon/:id",
  authenticate,
  perfectCorpLimiter,
  validate([param("id").isString().isLength({ min: 1 })]),
  getVirtualTryOn
);

router.get(
  "/recommendations/:analysisId",
  authenticate,
  perfectCorpLimiter,
  validate([param("analysisId").isString().isLength({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 100 })]),
  getRecommendations
);

router.get(
  "/products/search",
  authenticate,
  perfectCorpLimiter,
  validate([query("limit").optional().isInt({ min: 1, max: 100 })]),
  searchProducts
);

router.post("/face-detection", authenticate, perfectCorpLimiter, validate([body("imageUrl").isString().isURL()]), detectFace);

export default router;
