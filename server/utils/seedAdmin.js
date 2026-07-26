import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Lead from '../models/Lead.js';

dotenv.config();

const seedUsers = [
  {
    name: 'System Admin',
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

const sampleLeads = [
  {
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    budget: 'Above $5000',
    message: 'We are seeking an enterprise CRM AI integration with custom workflow automation.',
    status: 'Qualified',
    source: 'LinkedIn',
    category: 'Enterprise',
    tags: ['Enterprise', 'Urgent', 'AI-Driven'],
    aiAnalysis: {
      summary: 'High-value enterprise inquiry with immediate budget availability.',
      priority: 'High',
      estimatedDealValue: 12000,
      leadScore: 95,
      sentiment: 'Positive',
      analyzedAt: new Date(),
    },
  },
  {
    name: 'Nexus Dynamics',
    email: 'info@nexusdynamics.io',
    budget: '$1000-$5000',
    message: 'Need lead tracking and real-time dashboard analytics for our sales team of 20.',
    status: 'Proposal',
    source: 'Website',
    category: 'SMB',
    tags: ['Analytics', 'RealTime'],
    aiAnalysis: {
      summary: 'Strong SMB lead requesting dashboard & socket capabilities.',
      priority: 'Medium',
      estimatedDealValue: 4500,
      leadScore: 78,
      sentiment: 'Positive',
      analyzedAt: new Date(),
    },
  },
  {
    name: 'Global Tech Solutions',
    email: 'leads@globaltech.org',
    budget: 'Above $5000',
    message: 'Looking to replace legacy CRM with automated email followups and AI assistant.',
    status: 'Won',
    source: 'Referral',
    category: 'Enterprise',
    tags: ['ClosedWon', 'KeyAccount'],
    aiAnalysis: {
      summary: 'Closed deal with high priority account.',
      priority: 'High',
      estimatedDealValue: 18000,
      leadScore: 98,
      sentiment: 'Positive',
      analyzedAt: new Date(),
    },
  },
  {
    name: 'Innovate AI',
    email: 'hello@innovateai.co',
    budget: '$500-$1000',
    message: 'Testing out small business automation features.',
    status: 'Contacted',
    source: 'Instagram',
    category: 'Startup',
    tags: ['Startup'],
    aiAnalysis: {
      summary: 'Early stage startup exploring mini CRM capabilities.',
      priority: 'Low',
      estimatedDealValue: 850,
      leadScore: 62,
      sentiment: 'Neutral',
      analyzedAt: new Date(),
    },
  },
];

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-leaddesk-mini';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding');

    let adminUser = null;
    for (const userData of seedUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`User ${userData.email} already exists.`);
      }
      if (userData.role === 'admin') adminUser = user;
    }

    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      for (const leadData of sampleLeads) {
        leadData.assignedTo = adminUser ? adminUser._id : null;
        await Lead.create(leadData);
      }
      console.log(`Seeded ${sampleLeads.length} sample leads for instant analytics.`);
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
