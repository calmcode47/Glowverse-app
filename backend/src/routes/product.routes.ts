import { Router } from "express";
import { query, param } from "express-validator";
import ProductController from "@controllers/product.controller";
import { validate } from "@middleware/validation";

const router = Router();

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get(
  "/",
  validate([
    query("category").optional().isIn(["SKINCARE", "MAKEUP", "HAIRCARE", "FRAGRANCE", "TOOLS", "SUPPLEMENTS"]),
    query("search").optional().isString().trim().isLength({ min: 1, max: 100 }),
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("sortBy").optional().isIn(["newest", "price-asc", "price-desc", "rating", "popular"])
  ]),
  ProductController.getAllProducts
);

/**
 * @route   GET /api/v1/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get(
  "/featured",
  validate([query("limit").optional().isInt({ min: 1, max: 50 })]),
  ProductController.getFeaturedProducts
);

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products
 * @access  Public
 */
router.get(
  "/search",
  validate([
    query("q").notEmpty().isString().trim().isLength({ min: 1, max: 100 }),
    query("limit").optional().isInt({ min: 1, max: 100 })
  ]),
  ProductController.searchProducts
);

/**
 * @route   GET /api/v1/products/category/:category
 * @desc    Get products by category
 * @access  Public
 */
router.get(
  "/category/:category",
  validate([
    param("category").isIn(["SKINCARE", "MAKEUP", "HAIRCARE", "FRAGRANCE", "TOOLS", "SUPPLEMENTS"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("sortBy").optional().isIn(["newest", "price-asc", "price-desc", "rating", "popular"])
  ]),
  ProductController.getProductsByCategory
);

/**
 * @route   GET /api/v1/products/:id/related
 * @desc    Get related products
 * @access  Public
 */
router.get(
  "/:id/related",
  validate([
    param("id").isString().isLength({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 20 })
  ]),
  ProductController.getRelatedProducts
);

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get(
  "/:id",
  validate([param("id").isString().isLength({ min: 1 })]),
  ProductController.getProduct
);

export default router;

