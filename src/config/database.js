const mongoose = require('mongoose');
const { DEFAULT_CURRENCY } = require('../constants/currencies');

const isServerless = () => Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null };
}

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
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!global._mongooseCache.promise) {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    };

    global._mongooseCache.promise = mongoose
      .connect(process.env.MONGODB_URI, options)
      .then(async (conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📦 Database: ${conn.connection.name}`);
        await backfillMissingUserCurrency();
        return conn;
      })
      .catch((error) => {
        global._mongooseCache.promise = null;
        throw error;
      });
  }

  try {
    global._mongooseCache.conn = await global._mongooseCache.promise;
    return global._mongooseCache.conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (isServerless()) {
      throw error;
    }
    process.exit(1);
  }
};

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const ensureDatabase = async (req, res, next) => {
  try {
    await connectDB();
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        status: 'error',
        message: 'Database unavailable. Check MONGODB_URI and Atlas network access.'
      });
    }
    next();
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: 'Database unavailable. Check MONGODB_URI and Atlas network access.',
      ...(process.env.NODE_ENV === 'development' && { detail: error.message })
    });
  }
};

module.exports = connectDB;
module.exports.ensureDatabase = ensureDatabase;
module.exports.isDatabaseConnected = isDatabaseConnected;
