import { Router } from 'express';
import { createBooking, getMyBookings, getBookingById, getAllBookings, updateBookingStatus, cancelBooking, deleteBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Customer
router.post('/', protect, bookingLimiter, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin
router.get('/', protect, authorize('superadmin', 'manager', 'receptionist'), getAllBookings);
router.put('/:id/status', protect, authorize('superadmin', 'manager', 'receptionist'), updateBookingStatus);
router.delete('/:id', protect, authorize('superadmin', 'manager'), deleteBooking);

export default router;

