import express from 'express';
import { subscribe, getSubscribers } from '../controllers/subscriber.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.post('/', subscribe);
router.get('/', protect, requireAdmin, getSubscribers);

export default router;