import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { body } from 'express-validator';
import { validate } from '../middleware/validation';

const router = Router();

// Validation middleware
const validateCreateOrder = [
    body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    body('shippingAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    validate
];

// All order routes require authentication
router.use(authenticate);

router.post('/', validateCreateOrder, OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/stats', OrderController.getOrderStatistics);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/cancel', OrderController.cancelOrder);

// Admin only routes would go here (e.g. update status)
router.patch('/:id/status', authorize('ADMIN'), OrderController.updateOrderStatus);

export default router;
