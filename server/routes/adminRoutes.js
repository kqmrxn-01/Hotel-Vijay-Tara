import { Router } from 'express';
import { getDashboardStats, getRevenueChart, getBookingChart, getOccupancyData, getMonthlyReport } from '../controllers/adminController.js';
import { adminLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

// Public Admin Login endpoint
router.post('/login', adminLogin);

// Protected Admin routes
router.use(protect, authorize('superadmin', 'manager', 'accountant'));


router.get('/dashboard', getDashboardStats);
router.get('/charts/revenue', getRevenueChart);
router.get('/charts/bookings', getBookingChart);
router.get('/charts/occupancy', getOccupancyData);
router.get('/reports/monthly', getMonthlyReport);

export default router;
