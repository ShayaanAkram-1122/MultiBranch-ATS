const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri || typeof uri !== 'string') {
      throw new Error('Missing MONGO_URI (or MONGODB_URI) in server/.env');
    }
    await mongoose.connect(uri);
    console.log(`[MongoDB] Connected — ${mongoose.connection.host}`);
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
