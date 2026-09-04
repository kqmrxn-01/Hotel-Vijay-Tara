import { Router } from 'express';
import { createReview, getApprovedReviews, getRoomReviews, getMyReviews, getAllReviews, updateReviewStatus, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

// Public
router.get('/approved', getApprovedReviews);
router.get('/room/:roomId', getRoomReviews);

// Customer
router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);

// Admin
router.get('/', protect, authorize('superadmin', 'manager'), getAllReviews);
router.put('/:id/status', protect, authorize('superadmin', 'manager'), updateReviewStatus);
router.delete('/:id', protect, authorize('superadmin'), deleteReview);

export default router;
