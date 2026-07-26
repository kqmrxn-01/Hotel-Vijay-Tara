import { Router } from 'express';
import { submitContact, getAllContacts, getContactById, replyToContact, deleteContact } from '../controllers/contactController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.post('/', submitContact);
router.get('/', protect, authorize('superadmin', 'manager', 'receptionist'), getAllContacts);
router.get('/:id', protect, authorize('superadmin', 'manager', 'receptionist'), getContactById);
router.put('/:id/reply', protect, authorize('superadmin', 'manager'), replyToContact);
router.delete('/:id', protect, authorize('superadmin'), deleteContact);

export default router;
