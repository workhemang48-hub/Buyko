import express from 'express';
import { getAllUsers, updateMyProfile, updateMyPassword, updateMyEmail, toggleUserRole, deleteUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/', protect, requireAdmin, getAllUsers);
router.put('/me', protect, updateMyProfile);
router.put('/me/password', protect, updateMyPassword);
router.put('/me/email', protect, updateMyEmail);
router.put('/:id/role', protect, requireAdmin, toggleUserRole);
router.delete('/:id', protect, requireAdmin, deleteUser);
export default router;