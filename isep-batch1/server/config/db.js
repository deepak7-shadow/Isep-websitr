const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI / MONGODB_URI is missing from .env');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });

    console.log('[Database] MongoDB Connected successfully');
  } catch (error) {
    mongoose.set('bufferCommands', false);
    console.warn(
      `[Database] Warning: MongoDB connection error (${error.message}). Using fallback demo data.`
    );
  }
};

module.exports = connectDB;