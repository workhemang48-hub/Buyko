import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getMyReviewEligibility,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/eligibility/:productId', protect, getMyReviewEligibility);
router.post('/:productId', protect, createReview);
router.put('/:productId', protect, updateReview);
router.delete('/:productId', protect, deleteReview);

export default router;