import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@aileaddesk.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seed.');
    } else {
      await User.create({
        name: 'Admin',
        email: adminEmail,
        password: 'Password123@',
        role: 'admin',
      });
      console.log('Admin user created successfully!');
      console.log('Email: admin@aileaddesk.com');
      console.log('Password: Password123@');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
