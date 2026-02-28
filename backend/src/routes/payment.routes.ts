import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Create a payment intent (used before submitting payment)
router.post('/create-intent', PaymentController.createIntent);

// Confirm payment / attach payment method to customer
router.post('/confirm', PaymentController.confirmPayment);

// Payment Methods
router.get('/methods', PaymentController.getSavedMethods);
router.post('/methods', PaymentController.saveMethod);
router.delete('/methods/:id', PaymentController.deleteMethod);

export default router;
