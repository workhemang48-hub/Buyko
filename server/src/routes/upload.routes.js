import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', protect, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'buyko-products',
    });

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

export default router;