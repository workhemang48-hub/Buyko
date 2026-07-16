import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const email = 'admin@test.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('User already exists with this email. Aborting.');
    process.exit(0);
  }

  const user = await User.create({
    name: 'Admin',
    email,
    password: 'admin123',
    role: 'admin',
  });

  console.log('Admin user created:', user.email, user.role);
  process.exit(0);
};

run();