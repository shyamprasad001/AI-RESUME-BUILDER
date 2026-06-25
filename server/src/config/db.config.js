// ============================================
// db.config.js - MongoDB Connection
// ============================================

import mongoose from 'mongoose'; // Mongoose ODM (MongoDB: Database Connection)
import logger from '../utils/logger.js';

// Using async/await pattern (JS Essentials: Async/Await)
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in your .env file');
    }

    const conn = await mongoose.connect(mongoURI); // Mongoose connection (MongoDB: Database Connection)
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
