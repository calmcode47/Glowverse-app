import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

// Public routes (no auth required)
router.get('/', ProductController.getAllProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/new-arrivals', ProductController.getNewArrivals);
router.get('/bestsellers', ProductController.getBestsellers);
router.get('/search', ProductController.searchProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id', ProductController.getProductById);
router.get('/:id/related', ProductController.getRelatedProducts);

export default router;
