import { Router } from 'express';
import { register, login, adminLogin, forgotPassword, resetPassword, getProfile, updateProfile, changePassword, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);

export default router;
