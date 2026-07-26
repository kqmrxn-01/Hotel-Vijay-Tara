import { Router } from 'express';
import { getAllStaff, getStaffById, createStaff, updateStaff, deleteStaff, markAttendance } from '../controllers/staffController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.use(protect, authorize('superadmin', 'manager'));

router.get('/', getAllStaff);
router.get('/:id', getStaffById);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', authorize('superadmin'), deleteStaff);
router.post('/:id/attendance', markAttendance);

export default router;
