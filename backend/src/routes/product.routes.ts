import { Router } from "express";
import FavoriteController from "@controllers/favorite.controller";
import { authenticate } from "@middleware/auth";
import { perfectCorpLimiter } from "@middleware/rateLimiter";
import { validate } from "@middleware/validation";
import { query } from "express-validator";

const router = Router();

router.get(
  "/search",
  authenticate,
  perfectCorpLimiter,
  validate([query("limit").optional().isInt({ min: 1, max: 100 })]),
  FavoriteController.searchProducts
);

router.get(
  "/recommendations",
  authenticate,
  perfectCorpLimiter,
  FavoriteController.getRecommendations
);

export default router;
