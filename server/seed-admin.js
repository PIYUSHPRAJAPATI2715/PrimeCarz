const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not set in server/.env');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    const email = 'admin@primecarz.com';
    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = 'admin';
      await existing.save();
      console.log('✅ Existing user found and promoted to admin:', email);
    } else {
      await User.create({
        name: 'PrimeCarz Admin',
        email,
        phone: '1234567890',
        password: 'adminpassword123',
        role: 'admin',
      });
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@primecarz.com');
      console.log('🔑 Password: adminpassword123');
    }
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedAdmin();
