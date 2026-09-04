import { Router } from 'express';
import { getAllCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.post('/validate', protect, validateCoupon);
router.get('/', protect, authorize('superadmin', 'manager'), getAllCoupons);
router.post('/', protect, authorize('superadmin', 'manager'), createCoupon);
router.put('/:id', protect, authorize('superadmin', 'manager'), updateCoupon);
router.delete('/:id', protect, authorize('superadmin'), deleteCoupon);

export default router;
