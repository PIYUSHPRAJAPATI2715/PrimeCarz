const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedCustomer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI is not set in server/.env');
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding customer');

    const email = 'user@primecarz.com';
    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = 'user';
      await existing.save();
      console.log('✅ Existing user found:', email);
    } else {
      await User.create({
        name: 'Test Customer',
        email,
        phone: '9876543210',
        password: 'userpassword123',
        role: 'user',
        licenseNumber: 'DL-1420240001234',
        isVerified: true
      });
      console.log('✅ Test customer user created successfully!');
      console.log('📧 Email: user@primecarz.com');
      console.log('🔑 Password: userpassword123');
    }
  } catch (err) {
    console.error('❌ Seeding customer error:', err);
  } finally {
    mongoose.disconnect();
  }
};

seedCustomer();
