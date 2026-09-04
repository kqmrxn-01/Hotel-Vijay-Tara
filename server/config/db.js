import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

export const seedAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin@hotelvijaytara.com' });
    if (!adminExists) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@hotelvijaytara.com',
        password: 'Admin@123',
        role: 'superadmin',
        phone: '+91 80900 54641',
      });
      console.log('👑 Default Admin account created: admin@hotelvijaytara.com / Admin@123');
    } else {
      console.log('👑 Default Admin account ready: admin@hotelvijaytara.com');
    }
  } catch (error) {
    console.error('⚠️ Admin seeding error:', error.message);
  }
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI;

  if (primaryUri) {
    try {
      const conn = await mongoose.connect(primaryUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      await seedAdmin();
      return;
    } catch (error) {
      console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    }
  }

  // Local development fallback
  if (!process.env.VERCEL) {
    try {
      const localUri = 'mongodb://127.0.0.1:27017/hotel-vijay-tara';
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2500,
      });
      isConnected = true;
      console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
      await seedAdmin();
      return;
    } catch (error) {
      console.warn(`⚠️ Local MongoDB connection failed: ${error.message}`);
    }
  } else {
    console.warn('⚠️ MONGO_URI is not configured in Vercel Environment Variables. Please set MONGO_URI in project settings.');
  }
};

export default connectDB;


