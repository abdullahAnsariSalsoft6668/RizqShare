const mongoose = require('mongoose');
const { DEFAULT_CURRENCY } = require('../constants/currencies');

const backfillMissingUserCurrency = async () => {
  try {
    const User = require('../models/User');
    const result = await User.updateMany(
      {
        $or: [
          { currency: { $exists: false } },
          { currency: null },
          { currency: '' }
        ]
      },
      { $set: { currency: DEFAULT_CURRENCY } }
    );

    if (result.modifiedCount) {
      console.log(`💱 Backfilled currency=${DEFAULT_CURRENCY} for ${result.modifiedCount} user(s)`);
    }
  } catch (error) {
    console.warn('⚠️  Currency backfill skipped:', error.message);
  }
};

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    await backfillMissingUserCurrency();

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return;
    }
    process.exit(1);
  }
};

module.exports = connectDB;

