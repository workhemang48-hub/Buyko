import 'dotenv/config';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import productRoutes from './src/routes/product.routes.js';
import uploadRoutes from './src/routes/upload.routes.js';
import cartRoutes from './src/routes/cart.routes.js';
import subscriberRoutes from './src/routes/subscriber.routes.js';
import addressRoutes from './src/routes/address.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import userRoutes from './src/routes/user.routes.js';
import wishlistRoutes from './src/routes/wishlist.routes.js';
import reviewRoutes from './src/routes/review.routes.js';

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/newsletter', subscriberRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Buyko API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
