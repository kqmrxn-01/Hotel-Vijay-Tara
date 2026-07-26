import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', getSettings);
router.put('/', protect, authorize('superadmin'), updateSettings);

export default router;
