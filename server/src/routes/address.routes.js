import express from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getAddresses);
router.post('/', protect, createAddress);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

export default router;