import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

// Validation middleware
const validateAddToCart = [
    body('productId').isUUID().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
    validate
];

const validateUpdateCartItem = [
    body('quantity').isInt({ min: 0, max: 99 }).withMessage('Quantity must be between 0 and 99'),
    validate
];

// All cart routes require authentication
router.use(authenticate);

router.get('/', CartController.getCart);
router.get('/summary', CartController.getCartSummary);
router.post('/items', validateAddToCart, CartController.addToCart);
router.patch('/items/:itemId', validateUpdateCartItem, CartController.updateCartItem);
router.delete('/items/:itemId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

export default router;
