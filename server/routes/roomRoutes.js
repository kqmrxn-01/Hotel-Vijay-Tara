import { Router } from 'express';
import { getAllRooms, getRoomBySlug, getRoomById, createRoom, updateRoom, deleteRoom, checkAvailability } from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

// Public
router.get('/', getAllRooms);
router.get('/availability', checkAvailability);
router.get('/slug/:slug', getRoomBySlug);
router.get('/:id', getRoomById);

// Admin
router.post('/', protect, authorize('superadmin', 'manager'), createRoom);
router.put('/:id', protect, authorize('superadmin', 'manager'), updateRoom);
router.delete('/:id', protect, authorize('superadmin'), deleteRoom);

export default router;
