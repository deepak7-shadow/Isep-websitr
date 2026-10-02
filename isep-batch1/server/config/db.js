const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI / MONGODB_URI is missing from .env');
    }

    await mongoose.connect(mongoUri);

    console.log('[Database] MongoDB Connected successfully');
  } catch (error) {
    console.warn(
      `[Database] Warning: MongoDB connection error (${error.message}).`
    );
  }
};

module.exports = connectDB;