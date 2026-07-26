import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Admin',
    email: 'admin@aileaddesk.com',
    password: 'Password123@',
    role: 'admin',
  },
  {
    name: 'Sales Manager',
    email: 'manager@aileaddesk.com',
    password: 'Password123@',
    role: 'manager',
  },
  {
    name: 'Sales Executive',
    email: 'sales@aileaddesk.com',
    password: 'Password123@',
    role: 'sales_executive',
  },
];

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email });

      if (existing) {
        console.log(`User ${userData.email} already exists. Skipping.`);
      } else {
        await User.create(userData);
        console.log(`Created ${userData.role}: ${userData.email}`);
      }
    }

    console.log('\nDefault credentials (Password123@ for all):');
    seedUsers.forEach((u) => console.log(`  ${u.role}: ${u.email}`));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
