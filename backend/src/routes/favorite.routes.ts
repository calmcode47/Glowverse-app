import { Router } from "express";
import FavoriteController from "@controllers/favorite.controller";
import { authenticate } from "@middleware/auth";
import { validate } from "@middleware/validation";
import { body, param, query } from "express-validator";
import { perfectCorpLimiter } from "@middleware/rateLimiter";

const router = Router();
router.use(authenticate);

router.get("/", validate([query("page").optional().isInt({ min: 1 }), query("limit").optional().isInt({ min: 1, max: 50 })]), FavoriteController.getAllFavorites);

router.post("/", validate([body("productId").notEmpty(), body("productName").notEmpty()]), FavoriteController.addFavorite);

router.delete("/:productId", validate([param("productId").isString().isLength({ min: 1 })]), FavoriteController.removeFavorite);

router.patch("/:productId", validate([param("productId").isString().isLength({ min: 1 })]), FavoriteController.updateFavorite);

router.get("/products/search", perfectCorpLimiter, validate([query("limit").optional().isInt({ min: 1, max: 50 })]), FavoriteController.searchProducts);
router.get("/products/recommendations", perfectCorpLimiter, FavoriteController.getRecommendations);

export default router;
