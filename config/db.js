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

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel-vijay-tara';
  try {
    const conn = await mongoose.connect(primaryUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB connection failed (${error.message}). Initializing In-Memory Database...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ In-Memory MongoDB Started & Connected! Host: ${conn.connection.host}`);
      await seedAdmin();
    } catch (memError) {
      console.error(`❌ Database Initialization Failed: ${memError.message}`);
    }
  }
};

export default connectDB;


