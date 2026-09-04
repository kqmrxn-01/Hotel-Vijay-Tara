import { Router } from 'express';
import { getAllCustomers, getCustomerById, updateCustomer, blockCustomer, deleteCustomer, getCustomerBookings } from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.use(protect, authorize('superadmin', 'manager', 'receptionist'));

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.get('/:id/bookings', getCustomerBookings);
router.put('/:id', updateCustomer);
router.put('/:id/block', authorize('superadmin', 'manager'), blockCustomer);
router.delete('/:id', authorize('superadmin'), deleteCustomer);

export default router;
