import express from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  refundOrder,
  cancelOrder,
  createCodOrder,
  getOrderById,
  getOrderByIdAdmin
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/create', protect, createRazorpayOrder);
router.post('/create-cod', protect, createCodOrder);
router.post('/verify', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/:id', protect, requireAdmin, getOrderByIdAdmin);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/', protect, requireAdmin, getAllOrders);
router.put('/:id/status', protect, requireAdmin, updateOrderStatus);
router.post('/:id/refund', protect, requireAdmin, refundOrder);

export default router;