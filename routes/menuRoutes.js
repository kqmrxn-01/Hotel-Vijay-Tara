import { Router } from 'express';
import { getMenu, getMenuByCategory, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', getMenu);
router.get('/category/:category', getMenuByCategory);
router.post('/', protect, authorize('superadmin', 'manager'), createMenuItem);
router.put('/:id', protect, authorize('superadmin', 'manager'), updateMenuItem);
router.delete('/:id', protect, authorize('superadmin'), deleteMenuItem);

export default router;
