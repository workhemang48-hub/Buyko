import express from 'express';
import { getWishlist, toggleWishlistItem } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.put('/:productId/toggle', protect, toggleWishlistItem);

export default router;