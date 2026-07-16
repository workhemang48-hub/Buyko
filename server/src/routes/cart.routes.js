import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:itemId', protect, updateCartItem);
router.delete('/:itemId', protect, removeCartItem);

export default router;