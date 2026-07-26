import { Router } from 'express';
import { createOrder, verifyPayment, getPaymentById, getAllPayments, processRefund } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:id', protect, getPaymentById);
router.get('/', protect, authorize('superadmin', 'manager', 'accountant'), getAllPayments);
router.post('/:id/refund', protect, authorize('superadmin', 'manager'), processRefund);

export default router;
