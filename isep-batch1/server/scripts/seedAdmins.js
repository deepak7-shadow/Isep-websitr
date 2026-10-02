const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/isep';

const admins = [
  {
    fullName: 'Ganesh Mani Bhaiya',
    email: 'ganesh@isep.org',
  },
  {
    fullName: 'Amrutha Didi',
    email: 'amrutha@isep.org',
  },
];

async function seedAdmins() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('Connected to MongoDB');

    const defaultPassword = 'ChangeMe@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    for (const admin of admins) {
      const existingAdmin = await User.findOne({
        email: admin.email,
      });

      if (existingAdmin) {
        console.log(`Admin already exists: ${admin.email}`);
        continue;
      }

      await User.create({
        fullName: admin.fullName,
        email: admin.email,
        password: hashedPassword,
        role: 'admin',
        approvalStatus: 'approved',
      });

      console.log(`Created admin: ${admin.email}`);
    }

    console.log('');
    console.log('Admin seeding completed.');
    console.log('Default password:', defaultPassword);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedAdmins();