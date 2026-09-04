import { Router } from 'express';
import { getGallery, getGalleryByCategory, uploadMedia, updateMedia, deleteMedia } from '../controllers/galleryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleAuth.js';

const router = Router();

router.get('/', getGallery);
router.get('/category/:category', getGalleryByCategory);
router.post('/', protect, authorize('superadmin', 'manager'), uploadMedia);
router.put('/:id', protect, authorize('superadmin', 'manager'), updateMedia);
router.delete('/:id', protect, authorize('superadmin', 'manager'), deleteMedia);

export default router;
